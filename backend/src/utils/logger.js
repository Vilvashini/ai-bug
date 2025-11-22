/**
 * Logger Utility
 * Centralized logging for better debugging and monitoring
 */

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "ai-bug-tracker" },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp }) =>
            `${timestamp} [${level}]: ${message}`
        )
      )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error"
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log")
    })
  ]
});

export default logger;
