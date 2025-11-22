/**
 * Similarity Calculation Utility
 * Uses Jaccard similarity algorithm for near-duplicate detection
 *
 * Jaccard Similarity = |Intersection| / |Union|
 * This allows us to find similar logs and reuse cached AI analysis
 * without needing heavy embeddings or ML models.
 *
 * Time Complexity: O(n * m) where n and m are token sets
 * Space Complexity: O(n + m)
 */

/**
 * Tokenize text into meaningful words
 * Splits on non-word characters and filters short tokens
 *
 * @param {string} text - Text to tokenize
 * @returns {string[]} Array of tokens (lowercase, length > 2)
 */
export function tokenizeText(text) {
  if (!text) return [];

  return String(text)
    .toLowerCase()
    .split(/\W+/) // Split on non-word characters
    .filter(token => token.length > 2) // Keep tokens longer than 2 chars
    .filter(Boolean); // Remove empty strings
}

/**
 * Create n-grams (shingles) from text
 * More sophisticated than simple tokenization
 *
 * @param {string} text - Text to create shingles from
 * @param {number} n - Shingle size (default: 3)
 * @returns {string[]} Array of shingles
 */
export function createShingles(text, n = 3) {
  if (!text || text.length < n) return [];

  const shingles = [];
  const cleaned = String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  for (let i = 0; i <= cleaned.length - n; i++) {
    shingles.push(cleaned.substring(i, i + n));
  }

  return shingles;
}

/**
 * Calculate Jaccard similarity between two sets
 * Ranges from 0 (completely different) to 1 (identical)
 *
 * @param {string[]} setA - First set of items
 * @param {string[]} setB - Second set of items
 * @returns {number} Jaccard similarity score (0-1)
 */
export function calculateJaccardSimilarity(setA, setB) {
  if (!setA || !setB || setA.length === 0 || setB.length === 0) {
    return 0;
  }

  const A = new Set(setA);
  const B = new Set(setB);

  // Calculate intersection
  let intersection = 0;
  for (const item of A) {
    if (B.has(item)) intersection++;
  }

  // Calculate union
  const union = new Set([...A, ...B]).size;

  return union === 0 ? 0 : intersection / union;
}

/**
 * Find most similar log from a list
 * Returns the best match and its score
 *
 * @param {string} log - Log to compare
 * @param {Array} logList - List of previous logs with 'content' field
 * @param {number} threshold - Minimum similarity score (0-1)
 * @returns {Object|null} { index, score, log } or null if no match
 */
export function findSimilarLog(log, logList, threshold = 0.8) {
  if (!log || !logList || logList.length === 0) {
    return null;
  }

  const logTokens = tokenizeText(log);
  let bestMatch = null;
  let bestScore = 0;

  for (let i = 0; i < logList.length; i++) {
    const prevTokens = tokenizeText(logList[i].redacted_log || "");
    const score = calculateJaccardSimilarity(logTokens, prevTokens);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        index: i,
        score: score,
        log: logList[i]
      };
    }
  }

  // Return match only if it meets threshold
  return bestScore >= threshold ? bestMatch : null;
}

/**
 * Batch calculate similarity for multiple logs
 * More efficient than calling calculateJaccardSimilarity multiple times
 *
 * @param {string} referenceLog - Reference log to compare against
 * @param {Array} logList - List of logs to compare
 * @returns {Array} List of logs with similarity scores, sorted descending
 */
export function batchCalculateSimilarity(referenceLog, logList) {
  const refTokens = tokenizeText(referenceLog);

  return logList
    .map((log, index) => ({
      index,
      log,
      score: calculateJaccardSimilarity(
        refTokens,
        tokenizeText(log.redacted_log || "")
      )
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Check if two logs are semantically similar
 * More lenient than exact matching, strict enough to be useful
 *
 * @param {string} log1 - First log
 * @param {string} log2 - Second log
 * @param {number} threshold - Similarity threshold (default 0.8)
 * @returns {boolean} Whether logs are similar
 */
export function areSimilarLogs(log1, log2, threshold = 0.8) {
  if (!log1 || !log2) return false;

  const similarity = calculateJaccardSimilarity(
    tokenizeText(log1),
    tokenizeText(log2)
  );

  return similarity >= threshold;
}
