// Utilidades para búsqueda inteligente que ignora tildes y mayúsculas
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas (tildes)
    .trim();
}

export function searchInText(searchTerm: string, targetText: string): boolean {
  if (!searchTerm || !targetText) return false;
  
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedTarget = normalizeText(targetText);
  
  return normalizedTarget.includes(normalizedSearch);
}

export function searchInArray(searchTerm: string, targetArray: string[]): boolean {
  if (!searchTerm || !targetArray || targetArray.length === 0) return false;
  
  return targetArray.some(item => searchInText(searchTerm, item));
}

export function getSearchSuggestions(query: string, options: string[]): string[] {
  if (!query || !options || options.length === 0) return [];
  
  const normalizedQuery = normalizeText(query);
  
  return options
    .filter(option => searchInText(query, option))
    .sort((a, b) => {
      // Priorizar coincidencias exactas
      const aExact = normalizeText(a).startsWith(normalizedQuery);
      const bExact = normalizeText(b).startsWith(normalizedQuery);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.localeCompare(b);
    })
    .slice(0, 10); // Máximo 10 sugerencias
}

// Mapeo de términos comunes para búsquedas más inteligentes
export const SEARCH_ALIASES: Record<string, string[]> = {
  'matematicas': ['matemáticas', 'math', 'algebra', 'álgebra', 'geometria', 'geometría'],
  'quimica': ['química', 'chemistry', 'organica', 'orgánica', 'inorganica', 'inorgánica'],
  'fisica': ['física', 'physics', 'mecanica', 'mecánica', 'termodinamica', 'termodinámica'],
  'programacion': ['programación', 'programming', 'codigo', 'código', 'desarrollo', 'software'],
  'ingles': ['inglés', 'english', 'idioma', 'language'],
  'calculo': ['cálculo', 'calculus', 'derivadas', 'integrales'],
  'estadistica': ['estadística', 'statistics', 'probabilidad'],
  'biologia': ['biología', 'biology', 'ciencias', 'naturales'],
  'historia': ['history', 'sociales', 'geografia', 'geografía'],
  'filosofia': ['filosofía', 'philosophy', 'etica', 'ética']
};

export function expandSearchTerm(term: string): string[] {
  const normalizedTerm = normalizeText(term);
  const aliases = SEARCH_ALIASES[normalizedTerm] || [];
  
  return [term, ...aliases];
}

export function smartSearch(searchTerm: string, targetText: string): boolean {
  if (!searchTerm || !targetText) return false;
  
  // Búsqueda normal
  if (searchInText(searchTerm, targetText)) return true;
  
  // Búsqueda expandida con alias
  const expandedTerms = expandSearchTerm(searchTerm);
  return expandedTerms.some(term => searchInText(term, targetText));
}

export function smartSearchInArray(searchTerm: string, targetArray: string[]): boolean {
  if (!searchTerm || !targetArray || targetArray.length === 0) return false;
  
  return targetArray.some(item => smartSearch(searchTerm, item));
}
