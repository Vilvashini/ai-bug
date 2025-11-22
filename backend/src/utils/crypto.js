/**
 * Cryptographic Utilities
 * SHA-256 hashing for deduplication and integrity checking
 */

import crypto from "crypto";

/**
 * Generate SHA-256 hash of input text
 * Used for exact duplicate detection
 *
 * @param {string} text - Input text to hash
 * @returns {string} SHA-256 hex hash
 */
export function generateHash(text) {
  if (!text) {
    throw new Error("Cannot hash empty or null value");
  }

  return crypto
    .createHash("sha256")
    .update(String(text), "utf8")
    .digest("hex");
}

/**
 * Verify that text matches a given hash
 *
 * @param {string} text - Text to verify
 * @param {string} hash - Hash to compare against
 * @returns {boolean} Whether hash matches
 */
export function verifyHash(text, hash) {
  return generateHash(text) === hash;
}

/**
 * Generate random string for temporary file names
 *
 * @param {number} length - Length of random string
 * @returns {string} Random hex string
 */
export function generateRandomId(length = 16) {
  return crypto.randomBytes(length / 2).toString("hex");
}
