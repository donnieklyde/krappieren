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
    // Remove all special characters, keep only: letters, numbers, spaces, and @
    // Remove unsafe characters but keep all Unicode letters (\p{L}), numbers (\p{N}), spaces, and emojis
    // Block: <, >, script tags mainly.
    // Allow: Basic punctuation, @ for mentions, $ for money/likes.
    // Regex explanation:
    // [^...] matches any character NOT in the set.
    // \p{L} - Any Unicode Letter
    // \p{N} - Any Unicode Number
    // \s - Whitespace
    // @, #, $, ., !, ?, etc. - Specific allowed symbols
    // \p{Emoji_Presentation} - Emojis
    // We strip obviously dangerous HTML characters like < > " ' ` to prevent XSS (basic level)

    // Simplest approach: Remove only dangerous chars < >
    // But user requested "emojis and umlaute".
    // Let's use a negative replace for characters that are strictly NOT allowed if we want to be permissive.
    // OR use a permissive whitelist.

    // Permissive Whitelist approach with Unicode support:
    // Note: JS regex \p{L} requires 'u' flag.
    const clean = text.replace(/[^\p{L}\p{N}\s@#$.,!?:\-_()"\p{Emoji_Presentation}]/gu, '');

    // Fallback simple sanitizer if the above is too restrictive or complex, 
    // but the user specifically asked for "ÄÜÖäüö?ß" which are covered by \p{L}.
    return skipUpperCase ? clean : clean; // Removed toUpperCase enforcement as emojis don't uppercase well and it messes up some languages
};

