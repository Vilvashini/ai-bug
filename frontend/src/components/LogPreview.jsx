export default function LogPreview({ analysis }) {
  if (!analysis) return null;

  const getSeverityColor = (severity) => {
    const level = severity?.toLowerCase() || "unknown";
    const colors = {
      critical: "severity-critical",
      high: "severity-high",
      medium: "severity-medium",
      low: "severity-low",
      unknown: "severity-unknown"
    };
    return colors[level] || colors.unknown;
  };

  const formatText = (text) => {
    if (!text) return "-";
    return text.replace(/\[REDACTED:[^\]]+\]/g, (match) => {
      return `<span class="redacted-tag">${match}</span>`;
    });
  };

  return (
    <div className="analysis-container">
      <h2 className="analysis-title">Analysis Result</h2>

      <div className="analysis-grid">
        <div className="analysis-card">
          <div className="card-header issue-header">
            <h3 className="card-label">Issue Type</h3>
            <span className="issue-badge">{analysis.issue_type || "-"}</span>
          </div>
        </div>

        <div className="analysis-card">
          <div className="card-header severity-header">
            <h3 className="card-label">Severity</h3>
            <span className={`severity-badge ${getSeverityColor(analysis.severity)}`}>
              {analysis.severity || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="analysis-card analysis-card-full">
        <div className="card-header">
          <h3 className="card-label">Root Cause</h3>
        </div>
        <div className="card-content">
          <p className="card-text">{analysis.root_cause || "-"}</p>
        </div>
      </div>

      <div className="analysis-card analysis-card-full">
        <div className="card-header">
          <h3 className="card-label">Suggested Fix</h3>
        </div>
        <div className="card-content">
          <p className="card-text">{analysis.suggested_fix || "-"}</p>
        </div>
      </div>

      {analysis.ai_model_used && (
        <div className="analysis-meta">
          <p className="meta-text">Analyzed with: {analysis.ai_model_used}</p>
          {analysis.analysis_time && (
            <p className="meta-text">Analysis time: {new Date(analysis.analysis_time).toLocaleString()}</p>
          )}
        </div>
      )}

      <style>{`
        .analysis-container {
          margin-top: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .analysis-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.5rem;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .analysis-card {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          overflow: hidden;
        }

        .analysis-card-full {
          grid-column: 1 / -1;
        }

        .card-header {
          padding: 1rem;
          background-color: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-label {
          font-weight: 600;
          color: #374151;
          margin: 0;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .issue-header {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .severity-header {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .card-content {
          padding: 1rem;
        }

        .card-text {
          margin: 0;
          color: #374151;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-size: 0.9375rem;
        }

        .issue-badge,
        .severity-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .issue-badge {
          background-color: #dbeafe;
          color: #0c4a6e;
        }

        .severity-badge {
          display: inline-block;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
        }

        .severity-critical {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .severity-high {
          background-color: #fed7aa;
          color: #92400e;
        }

        .severity-medium {
          background-color: #fef3c7;
          color: #78350f;
        }

        .severity-low {
          background-color: #dcfce7;
          color: #166534;
        }

        .severity-unknown {
          background-color: #e5e7eb;
          color: #374151;
        }

        .redacted-tag {
          display: inline-block;
          background-color: #fee2e2;
          color: #991b1b;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.8125rem;
          margin: 0 0.125rem;
        }

        .analysis-meta {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .meta-text {
          margin: 0.25rem 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
