// db_init.js
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sqlite3.verbose();
const DB_PATH = path.join(__dirname, "bugtracker.db");
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      hash TEXT UNIQUE,
      filesize INTEGER,
      upload_time TEXT DEFAULT (datetime('now')),
      redacted_log TEXT,
      status TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER,
      issue_type TEXT,
      root_cause TEXT,
      suggested_fix TEXT,
      severity TEXT,
      ai_model_used TEXT,
      analysis_time TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (log_id) REFERENCES logs(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_hash TEXT,
      similarity_score REAL,
      analysis_id INTEGER
    );
  `);
});

db.close(() => console.log("SQLite DB initialized: bugtracker.db"));
