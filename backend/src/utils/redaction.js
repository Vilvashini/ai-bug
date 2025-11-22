/**
 * Redaction Service
 * Removes sensitive information from logs before sending to AI
 *
 * This ensures that:
 * - API keys are never exposed to third-party AI services
 * - User credentials are protected
 * - Internal infrastructure details are hidden
 * - Personal information is redacted
 */

/**
 * Redaction rules with regex patterns
 * Order matters: more specific patterns first to avoid partial matches
 */
const REDACTION_RULES = [
  // API Keys and tokens (40+ character hex strings)
  {
    name: "API_KEY",
    regex: /\b[A-Fa-f0-9]{40,}\b/g,
    replacement: "[REDACTED:API_KEY]"
  },
  // AWS keys, personal access tokens
  {
    name: "SECRET_TOKEN",
    regex: /(?:token|apikey|api_key|secret|authorization|bearer)\s*[:=]\s*[A-Za-z0-9_\-\.]+/gi,
    replacement: "[REDACTED:SECRET]"
  },
  // IP addresses (IPv4)
  {
    name: "IP_ADDRESS",
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    replacement: "[REDACTED:IP]"
  },
  // URLs and domain names
  {
    name: "URL",
    regex: /https?:\/\/[^\s)"\]>]+/gi,
    replacement: "[REDACTED:URL]"
  },
  // Email addresses
  {
    name: "EMAIL",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: "[REDACTED:EMAIL]"
  },
  // File paths (Windows)
  {
    name: "WINDOWS_PATH",
    regex: /[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*/g,
    replacement: "[REDACTED:PATH]"
  },
  // File paths (Unix/Linux/macOS)
  {
    name: "UNIX_PATH",
    regex: /\/(?:[^\s/]+\/)*[^\s/]*/g,
    replacement: "[REDACTED:PATH]"
  },
  // Timestamps (ISO 8601 format)
  {
    name: "TIMESTAMP",
    regex: /\d{4}-\d{2}-\d{2}[T ]?\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?/g,
    replacement: "[REDACTED:TIMESTAMP]"
  },
  // Database connection strings
  {
    name: "CONNECTION_STRING",
    regex: /(?:mongodb|mysql|postgres|postgresql):\/\/[^\s)]+/gi,
    replacement: "[REDACTED:CONNECTION_STRING]"
  },
  // Username patterns
  {
    name: "USERNAME",
    regex: /(?:user(?:name)?|login|uid)\s*[:=]\s*[^\s,}]+/gi,
    replacement: "[REDACTED:USERNAME]"
  },
  // Password patterns
  {
    name: "PASSWORD",
    regex: /(?:password|passwd|pwd)\s*[:=]\s*[^\s,}]+/gi,
    replacement: "[REDACTED:PASSWORD]"
  },
  // Credit card numbers (basic pattern)
  {
    name: "CREDIT_CARD",
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    replacement: "[REDACTED:CREDIT_CARD]"
  }
];

/**
 * Redact sensitive information from text
 *
 * @param {string} input - Raw log text
 * @returns {string} Redacted log text
 */
export function redactSensitiveData(input) {
  if (!input) return input;

  let text = String(input);

  // Apply each redaction rule
  for (const rule of REDACTION_RULES) {
    text = text.replace(rule.regex, rule.replacement);
  }

  // Clean up excessive whitespace while preserving structure
  text = text.replace(/[ \t]{2,}/g, " ");

  return text;
}

/**
 * Get list of redaction rules (for documentation/logging)
 *
 * @returns {Array} List of redaction rule names
 */
export function getRedactionRules() {
  return REDACTION_RULES.map(rule => rule.name);
}

/**
 * Count redacted items in text
 * Useful for logging and monitoring
 *
 * @param {string} redactedText - Text after redaction
 * @returns {Object} Count of redacted items by type
 */
export function countRedactions(redactedText) {
  if (!redactedText) return {};

  const counts = {};
  const redactedPattern = /\[REDACTED:([A-Z_]+)\]/g;
  let match;

  while ((match = redactedPattern.exec(redactedText)) !== null) {
    const type = match[1];
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts;
}
