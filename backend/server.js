import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import testRoute from "./routes/test.js";
import uploadRoute from "./routes/upload.js";
import historyRoute from "./routes/history.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());

// static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/", testRoute);
app.use("/", uploadRoute);
app.use("/", historyRoute);

// health check
app.get("/", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
