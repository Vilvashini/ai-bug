/**
 * Database Schema
 * Defines all tables, indexes, and relationships
 */

/**
 * SQL script to create all tables
 * Run once during app initialization
 */
export const SCHEMA_SQL = `
  -- Logs table: stores uploaded files with metadata
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    hash TEXT UNIQUE NOT NULL,
    filesize INTEGER NOT NULL,
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    redacted_log TEXT NOT NULL,
    status TEXT DEFAULT 'processing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create index on hash for fast duplicate detection
  CREATE INDEX IF NOT EXISTS idx_logs_hash ON logs(hash);

  -- Create index on upload_time for efficient sorting
  CREATE INDEX IF NOT EXISTS idx_logs_upload_time ON logs(upload_time DESC);

  -- Analyses table: stores AI analysis results
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL UNIQUE,
    issue_type TEXT,
    root_cause TEXT,
    suggested_fix TEXT,
    severity TEXT,
    ai_model_used TEXT,
    analysis_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES logs(id) ON DELETE CASCADE
  );

  -- Create index on log_id for fast lookups
  CREATE INDEX IF NOT EXISTS idx_analyses_log_id ON analyses(log_id);

  -- Cache table: stores similarity caching metadata
  CREATE TABLE IF NOT EXISTS cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_hash TEXT NOT NULL,
    similar_log_id INTEGER NOT NULL,
    similarity_score REAL NOT NULL,
    analysis_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_hash) REFERENCES logs(hash),
    FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
  );

  -- Create index on log_hash for cache lookups
  CREATE INDEX IF NOT EXISTS idx_cache_log_hash ON cache(log_hash);

  -- Create index on similarity_score for analytics
  CREATE INDEX IF NOT EXISTS idx_cache_similarity_score ON cache(similarity_score DESC);
`;

/**
 * Table definitions with documentation
 */
export const TABLES = {
  logs: {
    name: "logs",
    description: "Stores uploaded log files with metadata",
    columns: {
      id: "Primary key, auto-increment",
      filename: "Original filename of uploaded file",
      hash: "SHA-256 hash of file content (unique)",
      filesize: "Size of file in bytes",
      upload_time: "When file was uploaded",
      redacted_log: "Sanitized log content (no sensitive data)",
      status: "processing, processed, cached, duplicate, or failed",
      created_at: "Timestamp when record was created"
    }
  },
  analyses: {
    name: "analyses",
    description: "Stores AI analysis results for each log",
    columns: {
      id: "Primary key, auto-increment",
      log_id: "Foreign key to logs table",
      issue_type: "Type of issue (e.g., NullPointerException)",
      root_cause: "Root cause explanation from AI",
      suggested_fix: "Suggested fix from AI",
      severity: "Low, Medium, High, or Critical",
      ai_model_used: "Which model was used (gpt-4o-mini)",
      analysis_time: "When analysis was performed",
      created_at: "Timestamp when record was created"
    }
  },
  cache: {
    name: "cache",
    description: "Stores similarity cache for avoiding duplicate analysis",
    columns: {
      id: "Primary key, auto-increment",
      log_hash: "Hash of the new log",
      similar_log_id: "ID of similar previous log",
      similarity_score: "Jaccard similarity score (0-1)",
      analysis_id: "ID of reused analysis",
      created_at: "Timestamp when cache entry was created"
    }
  }
};

/**
 * Pre-populated data (optional)
 */
export const INITIAL_DATA = [
  // Add any default data here if needed
];
