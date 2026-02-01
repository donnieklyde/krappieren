/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated service
 */

const rateLimitMap = new Map();

/**
 * Rate limit middleware
 * @param {string} identifier - Unique identifier (e.g., user ID, IP)
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if request should be allowed, false if rate limited
 */
export function rateLimit(identifier, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const userKey = `${identifier}`;

    if (!rateLimitMap.has(userKey)) {
        rateLimitMap.set(userKey, []);
    }

    const timestamps = rateLimitMap.get(userKey);

    // Remove timestamps outside the current window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= limit) {
        return false; // Rate limited
    }

    // Add current timestamp
    validTimestamps.push(now);
    rateLimitMap.set(userKey, validTimestamps);

    // Clean up old entries periodically
    if (rateLimitMap.size > 10000) {
        cleanupOldEntries(windowMs);
    }

    return true; // Request allowed
}

/**
 * Cleanup old entries from the rate limit map
 */
function cleanupOldEntries(windowMs) {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitMap.entries()) {
        const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
        if (validTimestamps.length === 0) {
            rateLimitMap.delete(key);
        } else {
            rateLimitMap.set(key, validTimestamps);
        }
    }
}
