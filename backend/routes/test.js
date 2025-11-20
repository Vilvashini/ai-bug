import express from "express";
import { callOpenAIForJSON } from "./upload.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const sampleLog = `2025-11-20 16:00:00 ERROR NullPointerException at MyClass.java:42`;
    const aiJson = await callOpenAIForJSON(sampleLog);
    res.json({ success: true, data: aiJson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
