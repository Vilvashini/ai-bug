/**
 * Application Constants
 * Centralized configuration for the AI Bug Tracker
 */

export const FILE_CONFIG = {
  ALLOWED_TYPES: [".log", ".txt", ".json"],
  MAX_SIZE_BYTES: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || "5242880", 10),
  UPLOAD_DIR: "./uploads"
};

export const AI_CONFIG = {
  MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  TEMPERATURE: 0,
  MAX_RETRIES: 2
};

export const CACHING = {
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD || "0.8"),
  MIN_HASH_SIZE: 100,
  RECENT_LOGS_TO_CHECK: 100
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const LOG_STATUS = {
  PROCESSING: "processing",
  PROCESSED: "processed",
  CACHED: "cached",
  DUPLICATE: "duplicate",
  FAILED: "failed"
};

export const SEVERITY_LEVELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
};
