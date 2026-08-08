/**
 * Catálogo general de bonos canjeables con UDcoins (sin marcas concretas).
 * Ajusta `minUdCoins` según la política de la plataforma.
 */

export interface BonusCategory {
  id: string;
  title: string;
  description: string;
  /** Mínimo de UDcoins por solicitud en esta categoría */
  minUdCoins: number;
  emoji: string;
}

export const BONUS_CATEGORIES: BonusCategory[] = [
  {
    id: 'restaurants',
    title: 'Restaurantes y gastronomía',
    description: 'Bonos de consumo en restaurantes y experiencias gastronómicas (red aliada según disponibilidad).',
    minUdCoins: 20,
    emoji: '🍽️',
  },
  {
    id: 'cinema',
    title: 'Cine y streaming',
    description: 'Entradas de cine, vouchers de plataformas o paquetes culturales similares.',
    minUdCoins: 15,
    emoji: '🎬',
  },
  {
    id: 'attractions',
    title: 'Atracciones y ocio',
    description: 'Parques, museos, escape rooms, eventos locales u otras actividades de entretenimiento.',
    minUdCoins: 25,
    emoji: '🎢',
  },
  {
    id: 'wellness',
    title: 'Bienestar y retail general',
    description: 'Cafeterías, librerías, tiendas de conveniencia u otros bonos de uso flexible.',
    minUdCoins: 15,
    emoji: '🎁',
  },
];

export function getBonusCategory(id: string): BonusCategory | undefined {
  return BONUS_CATEGORIES.find((c) => c.id === id);
}
