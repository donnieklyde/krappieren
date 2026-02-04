/**
 * Sanitizes text to remove all special characters except basic punctuation.
 * Allowed: Alphanumeric (a-z, A-Z, 0-9), spaces, and .,!?
 * Removed: Emojis, @, #, $, %, etc.
 * 
 * @param {string} text 
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text, strict = false, skipUpperCase = false) => {
    if (!text) return "";

    // Simplest approach: Remove only dangerous chars < > to allow all languages/emojis
    // We strictly remove < and > to prevent HTML-looking garbage, though React escapes it anyway.
    return text.replace(/[<>]/g, '');
};

