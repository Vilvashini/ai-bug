// routes/upload.js
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

// ---------------- UPLOAD FOLDER ----------------
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});

const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || "5242880", 10);
const upload = multer({ storage, limits: { fileSize: MAX_SIZE } });

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

// ---------------- MAIN UPLOAD ENDPOINT ----------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const file = fs.readFileSync(req.file.path, "utf8");
    const hash = sha256(file);

    // Exact duplicate check
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

    // Similarity caching
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

    // Insert new log
    const logInsert = await run(
      `INSERT INTO logs (filename, hash, filesize, redacted_log, status)
       VALUES (?, ?, ?, ?, ?)`,
      [req.file.originalname, hash, req.file.size, redacted, "processing"]
    );
    const logId = logInsert.lastID;

    // Call OpenAI
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
    res.status(500).json({ error: err.message });
  }
});

export default router;
