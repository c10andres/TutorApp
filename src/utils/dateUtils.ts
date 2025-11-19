// Utilidades para manejo de fechas con Firebase
export function safeFormatDate(date: any, fallback: string = 'Fecha no disponible'): string {
  try {
    if (!date) return fallback;
    
    // Si ya es un objeto Date válido
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    
    // Si es un string, intentar convertirlo
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date string:', date);
        return fallback;
      }
      return parsedDate.toLocaleDateString();
    }
    
    // Si es un timestamp de Firebase
    if (date && typeof date === 'object' && date.seconds) {
      const firebaseDate = new Date(date.seconds * 1000);
      if (isNaN(firebaseDate.getTime())) {
        console.warn('Invalid Firebase timestamp:', date);
        return fallback;
      }
      return firebaseDate.toLocaleDateString();
    }
    
    // Si es un objeto con propiedades de fecha pero no es Date
    if (date && typeof date === 'object') {
      // Intentar crear Date desde diferentes formatos
      let dateToTry = null;
      
      // Si tiene propiedades de fecha
      if (date.year && date.month && date.day) {
        dateToTry = new Date(date.year, date.month - 1, date.day);
      } else if (date.getTime) {
        // Si tiene método getTime, intentar usarlo
        dateToTry = new Date(date.getTime());
      } else if (date.toString) {
        // Intentar convertir a string y luego a Date
        const dateStr = date.toString();
        dateToTry = new Date(dateStr);
      }
      
      if (dateToTry && !isNaN(dateToTry.getTime())) {
        return dateToTry.toLocaleDateString();
      }
    }
    
    console.warn('Unknown date format:', date);
    return fallback;
  } catch (error) {
    console.warn('Error formatting date:', error, 'Date value:', date);
    return fallback;
  }
}

export function safeParseDate(date: any): Date | null {
  try {
    if (!date) return null;
    
    // Si ya es un objeto Date
    if (date instanceof Date) {
      return date;
    }
    
    // Si es un string, intentar convertirlo
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return null;
      }
      return parsedDate;
    }
    
    // Si es un timestamp de Firebase
    if (date && typeof date === 'object' && date.seconds) {
      return new Date(date.seconds * 1000);
    }
    
    return null;
  } catch (error) {
    console.warn('Error parsing date:', error);
    return null;
  }
}
