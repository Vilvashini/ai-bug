import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sha256 } from "../utils/hash.js";
import { redact } from "../utils/redact.js";
import { tokenize, jaccard } from "../utils/similarity.js";
import { run, get, all } from "../db.js";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not set in .env");
}

// File validation configuration
const ALLOWED_FILE_TYPES = [".log", ".txt", ".json"];
const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || "5242880", 10);

// Custom file filter for multer
const fileFilter = (req, file, cb) => {
  const fileName = file.originalname.toLowerCase();
  const fileExtension = path.extname(fileName).toLowerCase();

  if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
    const error = new Error(
      `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`
    );
    error.code = "INVALID_FILE_TYPE";
    return cb(error);
  }

  cb(null, true);
};

// Custom error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `File size exceeds maximum limit of ${(MAX_SIZE / (1024 * 1024)).toFixed(2)}MB`
      });
    }
    return res.status(400).json({ error: err.message });
  } else if (err && err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// Upload folder setup
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter
});

// ---------------- OPENAI JSON CALL ----------------
export async function callOpenAIForJSON(sanitized) {
  const prompt = `
Return ONLY valid JSON with keys: issue_type, root_cause, suggested_fix, severity.
Sanitized log:
${sanitized}
`;

  const resp = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  const content = resp.choices?.[0]?.message?.content || "";
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return JSON.parse(content.slice(start, end + 1));
  }

  throw new Error("Non-JSON returned from OpenAI");
}

// Main upload endpoint with validation
router.post("/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: `File size exceeds maximum limit of ${(MAX_SIZE / (1024 * 1024)).toFixed(2)}MB`
        });
      }
      return res.status(400).json({ error: err.message });
    } else if (err && err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let file;
    try {
      file = fs.readFileSync(req.file.path, "utf8");
    } catch (err) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: "Failed to read file. Ensure it is a valid text file."
      });
    }

    if (!file || file.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "File is empty" });
    }

    const hash = sha256(file);

    const existing = await get(
      `SELECT l.id as log_id, a.*
       FROM logs l
       LEFT JOIN analyses a ON a.log_id = l.id
       WHERE l.hash = ?`,
      [hash]
    );

    if (existing?.log_id) {
      fs.unlinkSync(req.file.path);
      const logRow = await get("SELECT * FROM logs WHERE id = ?", [
        existing.log_id
      ]);
      return res.json({ status: "duplicate", log: logRow, analysis: existing });
    }

    const redacted = redact(file);

    const tokens = tokenize(redacted);
    const recent = await all(
      "SELECT id, hash, redacted_log FROM logs ORDER BY upload_time DESC LIMIT 100"
    );

    const threshold = parseFloat(process.env.SIMILARITY_THRESHOLD || "0.8");

    for (const r of recent) {
      if (!r.redacted_log) continue;
      const score = jaccard(tokens, tokenize(r.redacted_log));
      if (score >= threshold) {
        const ana = await get(
          "SELECT * FROM analyses WHERE log_id = ? ORDER BY analysis_time DESC LIMIT 1",
          [r.id]
        );
        if (ana) {
          const log = await run(
            `INSERT INTO logs (filename, hash, filesize, redacted_log, status)
             VALUES (?, ?, ?, ?, ?)`,
            [req.file.originalname, hash, req.file.size, redacted, "cached"]
          );
          fs.unlinkSync(req.file.path);
          return res.json({ status: "cached", similarity: score, log_id: log.lastID, analysis: ana });
        }
      }
    }

    const logInsert = await run(
      `INSERT INTO logs (filename, hash, filesize, redacted_log, status)
       VALUES (?, ?, ?, ?, ?)`,
      [req.file.originalname, hash, req.file.size, redacted, "processing"]
    );
    const logId = logInsert.lastID;

    const aiJson = await callOpenAIForJSON(redacted);

    const aInsert = await run(
      `INSERT INTO analyses (log_id, issue_type, root_cause, suggested_fix, severity, ai_model_used)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [logId, aiJson.issue_type, aiJson.root_cause, aiJson.suggested_fix, aiJson.severity, process.env.OPENAI_MODEL || "gpt-4o-mini"]
    );

    await run("UPDATE logs SET status='processed' WHERE id = ?", [logId]);
    fs.unlinkSync(req.file.path);

    const analysis = await get("SELECT * FROM analyses WHERE id = ?", [aInsert.lastID]);
    res.json({ status: "processed", log_id: logId, analysis });
  } catch (err) {
    console.error(err);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
