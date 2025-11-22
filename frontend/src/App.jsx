import { useState, useEffect } from "react";
import UploadBox from "./components/UploadBox.jsx";
import LogPreview from "./components/LogPreview.jsx";
import HistoryTable from "./components/HistoryTable.jsx";
import { fetchHistory } from "./api.js";

export default function App() {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleUploaded = (analysis) => {
    setLatest(analysis);
    loadHistory();
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title-section">
            <svg
              className="header-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.12 3.5a1 1 0 011.5 0l7.5 8 .5.5-.5.5-7.5 8a1 1 0 01-1.5 0L1.5 12.5 1 12l.5-.5L9.12 3.5z"
              />
            </svg>
            <h1 className="app-title">AI Bug Tracker</h1>
          </div>
          <p className="app-subtitle">Smart Debug Assistant with AI-Powered Analysis</p>
        </div>
      </header>

      <main className="app-main">
        <div className="app-container">
          <UploadBox onUploaded={handleUploaded} />
          <LogPreview analysis={latest} />

          <section className="history-section">
            <h2 className="section-title">Upload History</h2>
            {loading ? (
              <div className="loading-state">
                <p>Loading history...</p>
              </div>
            ) : (
              <HistoryTable logs={history} />
            )}
          </section>
        </div>
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
          color: #111827;
        }

        .app-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f3f4f6;
        }

        .app-header {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 2rem 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header-title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .header-icon {
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .app-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .app-subtitle {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          margin-left: 2.75rem;
        }

        .app-main {
          flex: 1;
          padding: 2rem 1rem;
        }

        .app-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .history-section {
          margin-top: 3rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.5rem;
          padding: 0 0.5rem;
        }

        .loading-state {
          background: white;
          padding: 3rem;
          border-radius: 0.5rem;
          text-align: center;
          color: #6b7280;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .app-header {
            padding: 1.5rem 1rem;
          }

          .header-title-section {
            gap: 0.5rem;
          }

          .header-icon {
            width: 1.75rem;
            height: 1.75rem;
          }

          .app-title {
            font-size: 1.5rem;
          }

          .app-subtitle {
            margin-left: 2.25rem;
            font-size: 0.75rem;
          }

          .app-main {
            padding: 1rem;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
