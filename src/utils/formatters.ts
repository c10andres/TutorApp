// Utilidades de formateo para la aplicación

/**
 * Formatea un precio en pesos colombianos (COP)
 * @param amount - El monto en pesos
 * @param showCurrency - Si mostrar la abreviatura de la moneda
 * @returns String formateado del precio
 */
export const formatCOP = (amount: number, showCurrency: boolean = true): string => {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  if (!showCurrency) {
    // Remover el símbolo de peso pero mantener el formato de números
    return formatted.replace('$', '').replace('COP', '').trim();
  }

  return formatted;
};

/**
 * Formatea un precio simplificado en COP (sin decimales)
 * @param amount - El monto en pesos
 * @returns String formateado simple
 */
export const formatPriceCOP = (amount: number | undefined | null): string => {
  // Manejar valores undefined, null o NaN
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${safeAmount.toLocaleString('es-CO')} COP`;
};

/**
 * Formatea un número con separadores de miles para Colombia
 * @param amount - El número a formatear
 * @returns String formateado con separadores
 */
export const formatNumber = (amount: number | undefined | null): string => {
  // Manejar valores undefined, null o NaN
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return safeAmount.toLocaleString('es-CO');
};

/**
 * Formatea una fecha en formato colombiano
 * @param date - La fecha a formatear
 * @param includeTime - Si incluir la hora
 * @returns String de fecha formateada
 */
export const formatDate = (date: Date | string | undefined | null, includeTime: boolean = false): string => {
  // Manejar valores undefined, null o string
  let safeDate: Date;
  
  if (!date) {
    return 'Fecha no disponible';
  }
  
  if (typeof date === 'string') {
    safeDate = new Date(date);
  } else if (date instanceof Date) {
    safeDate = date;
  } else if (date && typeof date === 'object') {
    // Manejar objetos que pueden ser fechas de Firebase o otros formatos
    try {
      // Si es un timestamp de Firebase
      if (date.seconds) {
        safeDate = new Date(date.seconds * 1000);
      } else if (date.getTime) {
        // Si tiene método getTime, intentar usarlo
        safeDate = new Date(date.getTime());
      } else if (date.toString) {
        // Intentar convertir a string y luego a Date
        const dateStr = date.toString();
        safeDate = new Date(dateStr);
      } else {
        return 'Fecha no válida';
      }
    } catch (error) {
      console.warn('Error parsing date object:', error, 'Date value:', date);
      return 'Fecha no válida';
    }
  } else {
    return 'Fecha no válida';
  }
  
  // Verificar si la fecha es válida
  if (isNaN(safeDate.getTime())) {
    return 'Fecha no válida';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Bogota',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('es-CO', options).format(safeDate);
};

/**
 * Formatea solo la hora en formato colombiano
 * @param date - La fecha/hora a formatear
 * @returns String de hora formateada
 */
export const formatTime = (date: Date | string | undefined | null): string => {
  // Manejar valores undefined, null o string
  let safeDate: Date;
  
  if (!date) {
    return 'Hora no disponible';
  }
  
  if (typeof date === 'string') {
    safeDate = new Date(date);
  } else if (date instanceof Date) {
    safeDate = date;
  } else {
    return 'Hora no válida';
  }
  
  // Verificar si la fecha es válida
  if (isNaN(safeDate.getTime())) {
    return 'Hora no válida';
  }

  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  }).format(safeDate);
};

/**
 * Obtiene rangos de precios comunes en COP para filtros
 */
export const getPriceRanges = () => [
  { label: 'Hasta $30.000', min: 0, max: 30000 },
  { label: '$30.000 - $50.000', min: 30000, max: 50000 },
  { label: '$50.000 - $80.000', min: 50000, max: 80000 },
  { label: '$80.000 - $120.000', min: 80000, max: 120000 },
  { label: 'Más de $120.000', min: 120000, max: Infinity },
];

/**
 * Convierte una ubicación colombiana a formato de string
 * @param city - Ciudad
 * @param department - Departamento
 * @returns String formateado de ubicación
 */
export const formatLocation = (city: string, department?: string): string => {
  if (!department || department === 'Virtual') {
    return city;
  }
  return `${city}, ${department}`;
};