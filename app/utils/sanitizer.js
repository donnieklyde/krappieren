/**
 * Sanitizes text to remove all special characters except basic punctuation.
 * Allowed: Alphanumeric (a-z, A-Z, 0-9), spaces, and .,!?
 * Removed: Emojis, @, #, $, %, etc.
 * 
 * @param {string} text 
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text, strict = false) => {
    if (!text) return "";
    if (strict) {
        return text.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase();
    }
    return text.replace(/[^a-zA-Z0-9\s.,!?]/g, '').toUpperCase();
};
