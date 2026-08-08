import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Award, Star, TrendingUp, BookOpen, MessageSquare, Coins, ArrowRightLeft, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { walletService } from '../services/wallet';
import {
    REPUTATION_POINTS_PER_UDCOIN,
    COP_PER_UDCOIN,
    formatCop,
} from '../constants/walletEconomy';
import { BONUS_CATEGORIES, getBonusCategory } from '../constants/walletBonuses';
import { toast } from 'sonner';

type RedemptionRow = {
    id: string;
    udCoins: number;
    createdAt: string;
    status: string;
    bonusCategoryId?: string;
    bonusLabel?: string;
    referenceCopEquivalent?: number;
    userEmail?: string;
    /** Registros antiguos (canje solo en pesos) */
    copAmount?: number;
};

export function WalletPage() {
    const { user, updateProfile } = useAuth();
    const [udCoins, setUdCoins] = useState<number>(user?.udCoins ?? 0);
    const [livePm, setLivePm] = useState<number>(
        typeof user?.reputationPoints === 'number' ? user.reputationPoints : 0
    );
    const [liveRedeemablePm, setLiveRedeemablePm] = useState<number>(
        typeof (user as any)?.redeemablePoints === 'number' ? (user as any).redeemablePoints : (typeof user?.reputationPoints === 'number' ? user.reputationPoints : 0)
    );
    const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
    const [udToBuy, setUdToBuy] = useState<string>('1');
    const [udToRedeem, setUdToRedeem] = useState<string>(String(BONUS_CATEGORIES[0].minUdCoins));
    const [selectedBonusId, setSelectedBonusId] = useState<string>(BONUS_CATEGORIES[0].id);
    const [busyPm, setBusyPm] = useState(false);
    const [busyBonus, setBusyBonus] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        const udRef = ref(database, `users/${user.id}/udCoins`);
        const unsub = onValue(udRef, (snap) => {
            const raw = snap.val();
            const num = raw == null ? 0 : Number(raw);
            setUdCoins(Number.isFinite(num) ? Math.floor(num) : 0);
        });
        return () => unsub();
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        const pmRef = ref(database, `users/${user.id}/reputationPoints`);
        const unsub = onValue(pmRef, (snap) => {
            const raw = snap.val();
            const num = raw == null ? 0 : Number(raw);
            setLivePm(Number.isFinite(num) ? Math.floor(num) : 0);
        });

        const redRef = ref(database, `users/${user.id}/redeemablePoints`);
        const unsubRed = onValue(redRef, (snap) => {
            const raw = snap.val();
            if (raw == null) {
                setLiveRedeemablePm(livePm);
            } else {
                const num = Number(raw);
                setLiveRedeemablePm(Number.isFinite(num) ? Math.floor(num) : 0);
            }
        });
        return () => { unsub(); unsubRed(); };
    }, [user?.id, livePm]);

    useEffect(() => {
        if (!user?.id) return;
        const r = ref(database, `users/${user.id}/udCoinRedemptions`);
        const unsub = onValue(r, (snap) => {
            if (!snap.exists()) {
                setRedemptions([]);
                return;
            }
            const val = snap.val() as Record<string, Omit<RedemptionRow, 'id'>>;
            const list = Object.entries(val)
                .map(([id, row]) => ({
                    id,
                    udCoins: Number(row?.udCoins) || 0,
                    createdAt: String(row?.createdAt ?? ''),
                    status: String(row?.status ?? ''),
                    bonusCategoryId: row?.bonusCategoryId ? String(row.bonusCategoryId) : undefined,
                    bonusLabel: row?.bonusLabel ? String(row.bonusLabel) : undefined,
                    referenceCopEquivalent:
                        typeof row?.referenceCopEquivalent === 'number' ? row.referenceCopEquivalent : undefined,
                    userEmail: row?.userEmail ? String(row.userEmail) : undefined,
                    copAmount: typeof row?.copAmount === 'number' ? row.copAmount : undefined,
                }))
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            setRedemptions(list);
        });
        return () => unsub();
    }, [user?.id]);

    const points = livePm;
    const nextRankThreshold = 2000;
    const progress = nextRankThreshold > 0 ? Math.min(100, (points / nextRankThreshold) * 100) : 0;

    const maxUdFromPm = Math.floor(liveRedeemablePm / REPUTATION_POINTS_PER_UDCOIN);
    const parsedBuy = Math.max(0, Math.floor(Number(udToBuy) || 0));
    const pmCostPreview = parsedBuy * REPUTATION_POINTS_PER_UDCOIN;
    const parsedRedeem = Math.max(0, Math.floor(Number(udToRedeem) || 0));
    const selectedBonus = getBonusCategory(selectedBonusId);
    const minUdForBonus = selectedBonus?.minUdCoins ?? 1;
    const referenceCopPreview = parsedRedeem * COP_PER_UDCOIN;

    const handleExchangePm = async () => {
        if (!user?.id) return;
        const n = Math.floor(Number(udToBuy));
        if (!Number.isFinite(n) || n < 1) {
            toast.error('Introduce cuántos UDcoins quieres obtener (entero ≥ 1).');
            return;
        }
        if (n > maxUdFromPm) {
            toast.error(`Con tus PM actuales solo puedes obtener hasta ${maxUdFromPm} UDcoins.`);
            return;
        }
        setBusyPm(true);
        try {
            const r = await walletService.exchangePmForUdCoins(user.id, n);
            toast.success(`Listo: ${r.udCoins} UDcoins · ${r.redeemablePoints} PM canjeables restantes.`);
            setUdToBuy('1');
            try {
                await updateProfile({
                    udCoins: r.udCoins,
                    redeemablePoints: r.redeemablePoints,
                } as any);
            } catch {
                /* el listener de RTDB ya actualiza la vista; el contexto se alineará en el próximo refresh */
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'No se pudo canjear PM por UDcoins.');
        } finally {
            setBusyPm(false);
        }
    };

    const handleRedeemBonus = async () => {
        if (!user?.id) return;
        const n = Math.floor(Number(udToRedeem));
        if (!Number.isFinite(n) || n < 1) {
            toast.error('Introduce cuántos UDcoins quieres usar (entero ≥ 1).');
            return;
        }
        if (n < minUdForBonus) {
            toast.error(`En esta categoría el mínimo es ${minUdForBonus} UDcoins.`);
            return;
        }
        if (n > udCoins) {
            toast.error('No tienes tantos UDcoins disponibles.');
            return;
        }
        setBusyBonus(true);
        try {
            const r = await walletService.redeemUdCoinsForBonus(user.id, {
                categoryId: selectedBonusId,
                udCoins: n,
            });
            toast.success(
                `Bono «${r.bonusLabel}» solicitado (id ${r.redemptionId}). Saldo: ${r.udCoins} UD · pendiente. (Ref. ~${formatCop(r.referenceCopEquivalent)})`
            );
            const cat = getBonusCategory(selectedBonusId);
            if (cat) setUdToRedeem(String(cat.minUdCoins));
            try {
                await updateProfile({ udCoins: r.udCoins });
            } catch {
                /* RTDB + onValue mantienen el saldo en pantalla */
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'No se pudo registrar el canje.');
        } finally {
            setBusyBonus(false);
        }
    };

    const transactions = [
        { id: 1, type: 'earn', amount: 50, description: 'Tutoría de Cálculo Diferencial', date: 'Hace 2 horas', icon: BookOpen },
        { id: 2, type: 'earn', amount: 10, description: 'Respuesta verificada en Foro', date: 'Ayer', icon: MessageSquare },
        { id: 3, type: 'earn', amount: 5, description: 'Login diario (Racha de 5 días)', date: 'Hoy', icon: TrendingUp },
        { id: 4, type: 'bonus', amount: 20, description: 'Bono: Excelente Calificación (5.0)', date: 'Hace 2 días', icon: Star },
    ];

    const badges = [
        { name: 'Monitor Junior', icon: '🥉', description: 'Realiza tu primera tutoría' },
        { name: 'Ayudante Activo', icon: '🌟', description: 'Alcanza 500 puntos de reputación' },
        { name: 'Salvavidas', icon: '🚑', description: 'Ayudaste en semana de parciales' },
        { name: 'Búho Nocturno', icon: '🦉', description: 'Tutorías en horario nocturno' },
        { name: 'Erudito', icon: '🎓', description: 'Promedio superior a 4.5' },
    ];

    return (
        <div className="space-y-6 p-4 pb-20 md:pb-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mi Billetera de Méritos</h1>
                    <p className="text-gray-500">Gestiona tu reputación, puntos de mérito y UDcoins</p>
                </div>
            </div>

            {/* Saldos: PM + UDcoins */}
            <Card className="border shadow-sm bg-white">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                        <div className="flex-1 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-gray-500 font-medium mb-1">Reputación (Nivel Experiencia)</p>
                                <h2 className="text-5xl font-bold text-blue-600 mb-2">{points}</h2>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none mb-2 block w-max">
                                    Rango actual: {user?.rank ?? '—'}
                                </Badge>
                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 inline-block text-left">
                                    <p className="text-green-700 font-medium text-xs uppercase tracking-wide">Puntos de reputación disponibles para canjear</p>
                                    <p className="text-2xl font-bold text-green-600">{liveRedeemablePm}</p>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Progreso a Monitor Experto</span>
                                    <span>{points} / {nextRankThreshold} PM</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-blue-600 font-medium text-center md:text-right">
                                    {Math.max(0, nextRankThreshold - points)} PM para el siguiente nivel (referencia)
                                </p>
                            </div>
                        </div>

                        <div className="hidden lg:block w-px bg-gray-200 shrink-0" aria-hidden />

                        <div className="flex-1 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/80 p-5 shadow-inner">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                                    <Coins className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-amber-900/90">UDcoins</p>
                                    <p className="text-xs text-amber-800/75 mt-0.5 mb-3">
                                        Moneda de la comunidad UD Conecta para recompensas y canjes dentro de la app (independiente de los PM de tutorías).
                                    </p>
                                    <p className="text-4xl font-bold tracking-tight text-amber-700 tabular-nums">{udCoins}</p>
                                    <p className="text-xs text-amber-800/70 mt-1">Saldo sincronizado con tu perfil</p>
                                    <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-2 text-xs text-amber-900/85">
                                        <p>
                                            <span className="font-semibold">PM → UDcoins:</span>{' '}
                                            {REPUTATION_POINTS_PER_UDCOIN} PM = 1 UDcoin
                                        </p>
                                        <p>
                                            <span className="font-semibold">UDcoins → bonos:</span>{' '}
                                            restaurantes, cine, atracciones y más (según disponibilidad).
                                        </p>
                                        {redemptions[0] && (
                                            <p className="text-amber-800/75 pt-1">
                                                Último canje:{' '}
                                                {redemptions[0].bonusLabel ??
                                                    (redemptions[0].copAmount
                                                        ? `Pesos (histórico) ${formatCop(redemptions[0].copAmount)}`
                                                        : '—')}{' '}
                                                · {redemptions[0].status === 'pending' ? 'pendiente' : redemptions[0].status}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-blue-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <ArrowRightLeft className="h-5 w-5 text-blue-600 shrink-0" />
                            Obtener UDcoins Adicionales
                        </CardTitle>
                        <CardDescription>
                            Por cada {REPUTATION_POINTS_PER_UDCOIN} puntos de reputación obtienes 1 UDcoin. Los PM se
                            descuentan de tu perfil (Realtime Database).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-700">
                            Puedes obtener hasta <span className="font-semibold">{maxUdFromPm}</span> UDcoins con tus{' '}
                            <span className="font-semibold">{liveRedeemablePm}</span> puntos de experiencia (sin afectar tu nivel).
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ud-buy">UDcoins a obtener</Label>
                            <Input
                                id="ud-buy"
                                inputMode="numeric"
                                min={1}
                                max={Math.max(1, maxUdFromPm)}
                                value={udToBuy}
                                onChange={(e) => setUdToBuy(e.target.value.replace(/[^\d]/g, ''))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Costo: <span className="font-medium text-slate-800">{pmCostPreview} PM</span>
                                {parsedBuy > 0 && maxUdFromPm > 0 && parsedBuy > maxUdFromPm && (
                                    <span className="text-red-600"> · supera tu saldo canjeable</span>
                                )}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={maxUdFromPm < 1}
                                onClick={() => setUdToBuy(String(Math.max(1, maxUdFromPm)))}
                            >
                                Usar máximo ({maxUdFromPm})
                            </Button>
                            <Button type="button" onClick={handleExchangePm} disabled={busyPm || maxUdFromPm < 1}>
                                {busyPm ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Canjear'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-slate-50/40">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Categorías de bonos</CardTitle>
                        <CardDescription>
                            Canje a nivel general: el equipo asigna el proveedor o formato final según stock y ciudad.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-700">
                        {BONUS_CATEGORIES.map((c) => (
                            <div key={c.id} className="flex gap-2 items-start">
                                <span className="text-lg shrink-0" aria-hidden>
                                    {c.emoji}
                                </span>
                                <div>
                                    <span className="font-medium">{c.title}</span>
                                    <span className="text-slate-500"> — desde {c.minUdCoins} UD</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-violet-200/80 bg-gradient-to-b from-violet-50/40 to-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Gift className="h-5 w-5 text-violet-600 shrink-0" />
                        Canjear UDcoins por bonos
                    </CardTitle>
                    <CardDescription>
                        Elige una categoría (restaurantes, cine, atracciones…), indica cuántos UDcoins usar y envía la
                        solicitud. El valor en pesos es solo referencia interna ({formatCop(COP_PER_UDCOIN)} por UDcoin);
                        lo que recibes es un <span className="font-medium">bono</span> acorde a la categoría.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        {BONUS_CATEGORIES.map((cat) => {
                            const active = selectedBonusId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedBonusId(cat.id);
                                        setUdToRedeem(String(cat.minUdCoins));
                                    }}
                                    className={`rounded-xl border p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                                        active
                                            ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-300/50 shadow-sm'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                                    }`}
                                >
                                    <span className="text-2xl leading-none" aria-hidden>
                                        {cat.emoji}
                                    </span>
                                    <h3 className="mt-2 font-semibold text-sm text-slate-900 leading-snug">
                                        {cat.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-600 line-clamp-3">{cat.description}</p>
                                    <p className="mt-2 text-xs font-semibold text-amber-800">
                                        Mín. {cat.minUdCoins} UDcoins
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">
                        <div className="space-y-2 flex-1 min-w-[12rem]">
                            <Label htmlFor="ud-redeem">UDcoins para este bono</Label>
                            <Input
                                id="ud-redeem"
                                inputMode="numeric"
                                min={minUdForBonus}
                                max={Math.max(minUdForBonus, udCoins)}
                                value={udToRedeem}
                                onChange={(e) => setUdToRedeem(e.target.value.replace(/[^\d]/g, ''))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Mínimo en esta categoría: <span className="font-medium">{minUdForBonus} UD</span>. Saldo:{' '}
                                <span className="font-medium">{udCoins} UD</span>.
                            </p>
                            {parsedRedeem > 0 && parsedRedeem > udCoins && (
                                <p className="text-xs text-red-600">Supera tu saldo de UDcoins.</p>
                            )}
                        </div>
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 min-w-[14rem]">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Referencia aprox. en pesos</p>
                            <p className="text-lg font-semibold tabular-nums text-slate-900">
                                {formatCop(referenceCopPreview)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Solo orientativo para administración / usuario.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={udCoins < minUdForBonus}
                                onClick={() => {
                                    if (udCoins < minUdForBonus) {
                                        toast.error(`Necesitas al menos ${minUdForBonus} UDcoins en esta categoría.`);
                                        return;
                                    }
                                    setUdToRedeem(String(udCoins));
                                }}
                            >
                                Usar todo el saldo ({udCoins})
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRedeemBonus}
                                disabled={busyBonus || udCoins < minUdForBonus}
                            >
                                {busyBonus ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Solicitar bono'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Historial de canjes (bonos)</CardTitle>
                    <CardDescription>
                        Solicitudes generadas desde esta billetera. Entradas antiguas pueden mostrar solo valor en
                        pesos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {redemptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aún no hay canjes registrados.</p>
                    ) : (
                        <ul className="divide-y rounded-md border">
                            {redemptions.map((row) => {
                                const legacyPesos = row.copAmount != null && row.copAmount > 0 && !row.bonusLabel;
                                const refCop =
                                    row.referenceCopEquivalent ??
                                    (legacyPesos ? row.copAmount : row.udCoins * COP_PER_UDCOIN);
                                return (
                                    <li
                                        key={row.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-3 py-2.5 text-sm"
                                    >
                                        <div className="text-slate-800">
                                            <span className="font-medium">
                                                {row.bonusLabel ??
                                                    (legacyPesos ? 'Canje en pesos (histórico)' : 'Bono')}
                                            </span>
                                            <span className="text-slate-600">
                                                {' '}
                                                · {row.udCoins} UDcoin{row.udCoins !== 1 ? 's' : ''}
                                            </span>
                                            {!legacyPesos && (
                                                <span className="block text-xs text-slate-500 mt-0.5">
                                                    Ref. ~{formatCop(refCop ?? 0)}
                                                </span>
                                            )}
                                            {legacyPesos && (
                                                <span className="block text-xs text-slate-500 mt-0.5">
                                                    {formatCop(row.copAmount ?? 0)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 shrink-0">
                                            {row.createdAt ? new Date(row.createdAt).toLocaleString('es-CO') : '—'} ·{' '}
                                            <span className="capitalize">{row.status}</span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Badges Collection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-500" />
                            Mis Insignias
                        </CardTitle>
                        <CardDescription>Logros desbloqueados en tu carrera académica</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {badges.map((badge, idx) => (
                                <div key={idx} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
                                    <span className="text-3xl mb-2">{badge.icon}</span>
                                    <span className="text-xs font-semibold text-gray-700">{badge.name}</span>
                                </div>
                            ))}
                            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-lg text-center opacity-50">
                                <span className="text-2xl mb-1">🔒</span>
                                <span className="text-xs text-gray-400">Próximo: Maestro</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Historial de Puntos
                        </CardTitle>
                        <CardDescription>Tus últimas contribuciones a la comunidad</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50 transition-colors rounded-md">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                            <tx.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                                            <p className="text-xs text-gray-500">{tx.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${tx.type === 'spend' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'spend' ? '-' : '+'}{tx.amount} PM
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 items-start">
                <Star className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-yellow-900 text-sm">¿Cómo encajan PM, UDcoins y bonos?</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                        Los PM se pueden convertir en UDcoins según la tasa de esta página. Con esos UDcoins solicitas
                        bonos por categoría (gastronomía, cine, atracciones, etc.): son canjes <span className="font-medium">generales</span>; el detalle del proveedor o voucher lo confirma el equipo cuando la solicitud pase de pendiente a
                        aprobada. Referencia económica interna: {formatCop(COP_PER_UDCOIN)} por UDcoin. Si tus PM están
                        solo en otra base de datos, sincronízalos en Realtime Database para poder canjearlos aquí.
                    </p>
                </div>
            </div>
        </div>
    );
}
