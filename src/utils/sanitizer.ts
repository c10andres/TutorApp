/**
 * Utility to sanitize user generated content.
 * Adheres to the thesis requirement for "Automated Content Moderation".
 */

const BAD_WORDS = [
    // Common Spanish profanity (reduced list for demo purposes)
    'groseria', 'palabrota', 'insulto', 'ofensa',
    'puta', 'puto', 'mierda', 'pendejo', 'cabron', 'estupido', 'idiota',
    'verga', 'chingo', 'chingada'
];

export const sanitizeContent = (text: string): string => {
    if (!text) return text;

    let cleanText = text;

    // Simple check and replace
    // In a real production environment with "filter" library, we would use it.
    // Here we implement a basic custom filter to avoid dependencies issues.

    BAD_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanText = cleanText.replace(regex, '*'.repeat(word.length));
    });

    return cleanText;
};

export const hasProfanity = (text: string): boolean => {
    if (!text) return false;
    return BAD_WORDS.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return regex.test(text);
    });
};
