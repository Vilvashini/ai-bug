// routes/history.js
import express from "express";
import { all, get } from "../db.js";

const router = express.Router();

router.get("/history", async (req, res) => {
  try {
    const rows = await all(`
      SELECT l.id, l.filename, l.filesize, l.upload_time, l.status,
             a.issue_type, a.severity, a.suggested_fix
      FROM logs l
      LEFT JOIN analyses a ON a.log_id = l.id
      ORDER BY l.upload_time DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/log/:id", async (req, res) => {
  try {
    const log = await get("SELECT * FROM logs WHERE id = ?", [
      req.params.id
    ]);
    const analysis = await get(
      `SELECT * FROM analyses WHERE log_id = ?
       ORDER BY analysis_time DESC LIMIT 1`,
      [req.params.id]
    );
    res.json({ log, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const historyRoute = router;
export default historyRoute;
