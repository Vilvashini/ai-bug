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
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());

// static folder for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/", testRoute);
app.use("/", uploadRoute);
app.use("/", historyRoute);

// Serve React frontend (development fallback)
const frontendPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendPath));

// SPA fallback - serve index.html for all non-API routes
app.get("*", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If dist doesn't exist, send development HTML
      res.type("text/html").send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AI Bug Tracker</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin: 0; padding: 20px; font-family: sans-serif; background: #f3f4f6;">
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
              <h1>🚀 AI Bug Tracker</h1>
              <p>Frontend is loading...</p>
              <p style="color: #666; font-size: 14px;">Backend API running at http://localhost:${PORT}</p>
              <p style="color: #999; font-size: 12px; margin-top: 40px;">To use the full app, build the frontend: <code>cd frontend && npm run build</code></p>
            </div>
            <script type="module">
              // Try to load the React app from a dev server if available
              const loadApp = async () => {
                try {
                  const res = await fetch('http://localhost:5173/');
                  if (res.ok) {
                    window.location.href = 'http://localhost:5173/';
                  }
                } catch (e) {
                  console.log('Dev server not available, waiting for frontend build...');
                }
              };
              setTimeout(loadApp, 2000);
            </script>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
