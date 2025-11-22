/**
 * Database Layer
 * Uses better-sqlite3 for fast, synchronous database operations
 * All queries are synchronous for easier error handling and consistency
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "../../bugtracker.db");

/**
 * Initialize database connection
 * Configures best practices: foreign keys, WAL mode for performance
 */
let db = null;

export function initializeDatabase() {
  try {
    db = new Database(DB_PATH);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Use WAL mode for better concurrency
    db.pragma("journal_mode = WAL");

    // Set busy timeout to avoid "database locked" errors
    db.pragma("busy_timeout = 5000");

    logger.info(`✅ Database initialized at ${DB_PATH}`);
    return db;
  } catch (error) {
    logger.error(`❌ Failed to initialize database: ${error.message}`);
    throw error;
  }
}

/**
 * Get database instance
 * Call initializeDatabase() first
 */
export function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}

/**
 * Close database connection
 * Should be called on app shutdown
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    logger.info("📦 Database connection closed");
  }
}

/**
 * Execute a SELECT query that returns a single row
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object|undefined} Row object or undefined
 */
export function queryOne(sql, params = []) {
  const stmt = getDatabase().prepare(sql);
  return stmt.get(...params);
}

/**
 * Execute a SELECT query that returns multiple rows
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Array} Array of row objects
 */
export function queryAll(sql, params = []) {
  const stmt = getDatabase().prepare(sql);
  return stmt.all(...params);
}

/**
 * Execute an INSERT, UPDATE, or DELETE query
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} { changes: number, lastInsertRowid: number }
 */
export function execute(sql, params = []) {
  const stmt = getDatabase().prepare(sql);
  return stmt.run(...params);
}

/**
 * Execute multiple statements in a transaction
 * Ensures all-or-nothing semantics
 *
 * @param {Function} callback - Function that executes statements
 * @returns {any} Return value of callback
 */
export function transaction(callback) {
  const db = getDatabase();
  const trans = db.transaction(callback);
  return trans();
}

/**
 * Check if a table exists
 *
 * @param {string} tableName - Table name
 * @returns {boolean} Whether table exists
 */
export function tableExists(tableName) {
  const result = queryOne(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    [tableName]
  );
  return !!result;
}

/**
 * Get database info (size, page count, etc.)
 *
 * @returns {Object} Database information
 */
export function getDatabaseInfo() {
  const pageCount = queryOne("PRAGMA page_count")?.page_count || 0;
  const pageSize = queryOne("PRAGMA page_size")?.page_size || 0;
  const sizeBytes = pageCount * pageSize;

  return {
    path: DB_PATH,
    pageCount,
    pageSize,
    sizeBytes,
    sizeMB: (sizeBytes / (1024 * 1024)).toFixed(2)
  };
}
