import { ref, get, set, runTransaction, push, update } from 'firebase/database';
import { auth, database } from '../firebase';
import { COP_PER_UDCOIN, REPUTATION_POINTS_PER_UDCOIN } from '../constants/walletEconomy';
import { getBonusCategory } from '../constants/walletBonuses';

/**
 * UDcoins y canjes en Realtime Database (`users/{userId}`).
 * Los PM de reputación usados aquí son los del mismo nodo RTDB (`reputationPoints`).
 */
export const walletService = {
  async getUdCoins(userId: string): Promise<number> {
    const snap = await get(ref(database, `users/${userId}/udCoins`));
    if (!snap.exists()) return 0;
    const v = snap.val();
    return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
  },

  async setUdCoins(userId: string, balance: number): Promise<void> {
    const n = Math.max(0, Math.floor(balance));
    await set(ref(database, `users/${userId}/udCoins`), n);
  },

  async addUdCoins(userId: string, delta: number): Promise<number> {
    if (!delta) return this.getUdCoins(userId);
    const r = ref(database, `users/${userId}/udCoins`);
    const snap = await get(r);
    const current =
      snap.exists() && typeof snap.val() === 'number' && !Number.isNaN(snap.val())
        ? snap.val()
        : 0;
    const next = Math.max(0, current + delta);
    await set(r, next);
    return next;
  },

  /**
   * Canjea PM por UDcoins: descuenta `udCoinsWanted * REPUTATION_POINTS_PER_UDCOIN` PM.
   */
  async exchangePmForUdCoins(
    userId: string,
    udCoinsWanted: number
  ): Promise<{ reputationPoints: number; redeemablePoints: number; udCoins: number }> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error('Debes tener la sesión iniciada para canjear PM.');
    }
    const n = Math.floor(udCoinsWanted);
    if (!Number.isFinite(n) || n < 1) {
      throw new Error('Indica cuántos UDcoins quieres (número entero ≥ 1).');
    }
    const pmCost = n * REPUTATION_POINTS_PER_UDCOIN;
    const userRef = ref(database, `users/${userId}`);
    const result = await runTransaction(userRef, (current) => {
      if (!current) return current; // let Firebase retry with actual data
      if (typeof current !== 'object') return current;
      const cur = current as Record<string, unknown>;
      const pm = Math.floor(Number(cur.reputationPoints)) || 0;
      const redeemable = cur.redeemablePoints !== undefined ? Math.floor(Number(cur.redeemablePoints)) : pm;
      const ud = Math.floor(Number(cur.udCoins)) || 0;
      if (redeemable < pmCost) return undefined; // abort only if not enough points
      return {
        ...cur,
        redeemablePoints: redeemable - pmCost,
        udCoins: ud + n,
      };
    });
    if (!result.committed) {
      throw new Error(
        'No se pudo completar el canje. Comprueba que tengas suficientes PM en tu perfil (Realtime Database).'
      );
    }
    const v = result.snapshot.val() as Record<string, unknown>;
    return {
      reputationPoints: Math.floor(Number(v.reputationPoints)) || 0,
      redeemablePoints: Math.floor(Number(v.redeemablePoints !== undefined ? v.redeemablePoints : v.reputationPoints)) || 0,
      udCoins: Math.floor(Number(v.udCoins)) || 0,
    };
  },

  /**
   * Descuenta UDcoins (transacción en el nodo de saldo) y guarda el canje bajo `udCoinRedemptions`.
   * Si falla el guardado del canje, se revierte el descuento de UDcoins.
   */
  async redeemUdCoinsForBonus(
    userId: string,
    params: { categoryId: string; udCoins: number }
  ): Promise<{ udCoins: number; bonusLabel: string; referenceCopEquivalent: number; redemptionId: string }> {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error('Debes tener la sesión iniciada para canjear UDcoins.');
    }
    const category = getBonusCategory(params.categoryId);
    if (!category) {
      throw new Error('Elige una categoría de bono válida.');
    }
    const n = Math.floor(params.udCoins);
    if (!Number.isFinite(n) || n < 1) {
      throw new Error('Indica cuántos UDcoins quieres usar (entero ≥ 1).');
    }
    if (n < category.minUdCoins) {
      throw new Error(`En "${category.title}" el mínimo es ${category.minUdCoins} UDcoins por solicitud.`);
    }

    const redemptionsListRef = ref(database, `users/${userId}/udCoinRedemptions`);
    const newKey = push(redemptionsListRef).key;
    if (!newKey) {
      throw new Error('No se pudo generar el registro de canje.');
    }

    const referenceCopEquivalent = n * COP_PER_UDCOIN;
    const createdAt = new Date().toISOString();
    const userEmail = auth.currentUser?.email ?? '';

    const redemptionRecord: Record<string, unknown> = {
      udCoins: n,
      bonusCategoryId: category.id,
      bonusLabel: category.title,
      referenceCopEquivalent,
      createdAt,
      status: 'pending',
      userId,
      userEmail,
    };

    const udCoinsRef = ref(database, `users/${userId}/udCoins`);

    const txResult = await runTransaction(udCoinsRef, (current) => {
      const raw = current == null ? 0 : Number(current);
      const balance = Number.isFinite(raw) ? Math.floor(raw) : 0;
      if (balance < n) {
        return undefined;
      }
      return balance - n;
    });

    if (!txResult.committed) {
      throw new Error('No tienes suficientes UDcoins para este canje (o el saldo no está disponible).');
    }

    const finalUdRaw = txResult.snapshot.val();
    const finalUd =
      typeof finalUdRaw === 'number' && Number.isFinite(finalUdRaw)
        ? Math.floor(finalUdRaw)
        : Math.floor(Number(finalUdRaw)) || 0;

    try {
      await update(ref(database, `users/${userId}`), {
        [`udCoinRedemptions/${newKey}`]: redemptionRecord,
        updatedAt: createdAt,
      });
    } catch (err) {
      await runTransaction(udCoinsRef, (current) => {
        const raw = current == null ? 0 : Number(current);
        const balance = Number.isFinite(raw) ? Math.floor(raw) : 0;
        return balance + n;
      });
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `No se pudo guardar el canje en la base de datos (${msg}). Tu saldo de UDcoins se revirtió; revisa permisos de Firebase o la conexión.`
      );
    }

    return {
      udCoins: finalUd,
      bonusLabel: category.title,
      referenceCopEquivalent,
      redemptionId: newKey,
    };
  },
};
