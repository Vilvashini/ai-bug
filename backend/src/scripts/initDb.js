/**
 * Database Initialization Script
 * Run with: npm run initdb
 * Creates all necessary tables and indexes
 */

import { initializeDatabase, execute, closeDatabase } from "../database/db.js";
import { SCHEMA_SQL } from "../database/schema.js";
import logger from "../utils/logger.js";

async function initDatabase() {
  try {
    logger.info("🚀 Starting database initialization...");

    // Initialize connection
    initializeDatabase();

    // Execute schema SQL
    const statements = SCHEMA_SQL.split(";").filter(s => s.trim());
    let count = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        execute(statement);
        count++;
      }
    }

    logger.info(`✅ Database initialized successfully with ${count} statements`);

    // Log table information
    logger.info("📊 Tables created:");
    logger.info("  - logs (stores uploaded files)");
    logger.info("  - analyses (stores AI analysis results)");
    logger.info("  - cache (stores similarity cache)");

    closeDatabase();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Database initialization failed: ${error.message}`);
    closeDatabase();
    process.exit(1);
  }
}

initDatabase();
