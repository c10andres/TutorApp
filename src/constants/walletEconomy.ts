/**
 * Reglas de la economía UDcoins (ajusta aquí los valores del producto).
 */

/** Cuántos puntos de reputación (PM) cuesta obtener 1 UDcoin al canjear */
export const REPUTATION_POINTS_PER_UDCOIN = 50;

/** Referencia en pesos colombianos (COP) por UDcoin (administración / equivalencia orientativa con bonos) */
export const COP_PER_UDCOIN = 25;

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}
