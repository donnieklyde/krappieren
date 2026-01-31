export function detectLanguage(text) {
    if (!text) return 'english';

    const lower = text.toLowerCase();

    // 1. Check for specific German characters
    if (/[äöüß]/.test(lower)) {
        return 'german';
    }

    // 2. Check for common German words (stopwords)
    // "die" is also valid in English ("to die"), but context matters. 
    // "und", "ist", "nicht", "das", "wir", "ich", "aber" are strong indicators.
    const germanWords = ['und', 'ist', 'nicht', 'das', 'wir', 'ich', 'aber', 'oder', 'ein', 'eine'];
    const words = lower.split(/[\s,.!?;:"']+/); // Tokenize

    const germanMatchCount = words.filter(w => germanWords.includes(w)).length;

    // Threshold: If we find at least 1 strong German word, we assume German.
    // Ideally we'd compare against English stopwords too, but let's keep it simple.
    // If we have "die" + "bahn" -> German. "die" alone -> Ambiguous.

    if (germanMatchCount > 0) {
        return 'german';
    }

    // Default
    return 'english';
}
