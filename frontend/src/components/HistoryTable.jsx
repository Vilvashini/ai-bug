import { useState } from "react";

export default function HistoryTable({ logs }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!logs || logs.length === 0) {
    return (
      <div className="history-empty">
        <svg
          className="empty-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="empty-text">No logs uploaded yet.</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const level = severity?.toLowerCase() || "unknown";
    const colors = {
      critical: "status-critical",
      high: "status-high",
      medium: "status-medium",
      low: "status-low",
      unknown: "status-unknown"
    };
    return colors[level] || colors.unknown;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      processed: "status-processed",
      processing: "status-processing",
      cached: "status-cached",
      duplicate: "status-duplicate"
    };
    return statusColors[status] || "status-unknown";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="history-container">
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr className="table-header-row">
              <th className="col-expand"></th>
              <th className="col-filename">Filename</th>
              <th className="col-size">File Size</th>
              <th className="col-upload-time">Upload Time</th>
              <th className="col-status">Status</th>
              <th className="col-severity">Severity</th>
              <th className="col-issue-type">Issue Type</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="table-body-row">
                <td className="col-expand">
                  <button
                    className="expand-btn"
                    onClick={() =>
                      setExpandedId(expandedId === log.id ? null : log.id)
                    }
                    aria-label="Toggle details"
                  >
                    {expandedId === log.id ? "−" : "+"}
                  </button>
                </td>
                <td className="col-filename">
                  <span className="filename-text">{log.filename}</span>
                </td>
                <td className="col-size">{formatFileSize(log.filesize)}</td>
                <td className="col-upload-time">
                  {formatDate(log.upload_time)}
                </td>
                <td className="col-status">
                  <span
                    className={`status-badge ${getStatusColor(log.status)}`}
                  >
                    {log.status || "-"}
                  </span>
                </td>
                <td className="col-severity">
                  <span
                    className={`severity-badge ${getSeverityColor(
                      log.severity
                    )}`}
                  >
                    {log.severity || "-"}
                  </span>
                </td>
                <td className="col-issue-type">
                  {log.issue_type || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expandedId && (
        <div className="expanded-details">
          <div className="details-card">
            <h3 className="details-title">Full Analysis Details</h3>
            {logs.find((log) => log.id === expandedId)?.suggested_fix && (
              <div className="details-section">
                <h4 className="details-label">Suggested Fix:</h4>
                <p className="details-text">
                  {logs.find((log) => log.id === expandedId).suggested_fix}
                </p>
              </div>
            )}
            <div className="details-footer">
              <button
                className="close-details-btn"
                onClick={() => setExpandedId(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .history-container {
          margin-top: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .history-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          color: #6b7280;
          text-align: center;
        }

        .empty-icon {
          width: 3rem;
          height: 3rem;
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .empty-text {
          font-size: 1rem;
          margin: 0;
          color: #6b7280;
        }

        .history-table-wrapper {
          overflow-x: auto;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .table-header-row {
          background-color: #f3f4f6;
          border-bottom: 2px solid #e5e7eb;
        }

        .table-header-row th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .col-expand {
          width: 2.5rem;
          text-align: center;
          padding: 0;
        }

        .col-filename {
          min-width: 200px;
        }

        .col-size {
          width: 6rem;
        }

        .col-upload-time {
          width: 9rem;
        }

        .col-status {
          width: 6rem;
        }

        .col-severity {
          width: 6rem;
        }

        .col-issue-type {
          min-width: 8rem;
        }

        .table-body-row {
          border-bottom: 1px solid #e5e7eb;
          transition: background-color 0.2s;
        }

        .table-body-row:hover {
          background-color: #f9fafb;
        }

        .table-body-row td {
          padding: 0.75rem;
          color: #374151;
          vertical-align: middle;
        }

        .filename-text {
          display: block;
          word-break: break-all;
          max-width: 250px;
        }

        .expand-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 600;
          color: #374151;
          font-size: 1.25rem;
          transition: all 0.2s;
        }

        .expand-btn:hover {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .status-badge,
        .severity-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        .status-processed {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-processing {
          background-color: #fef3c7;
          color: #78350f;
        }

        .status-cached {
          background-color: #dbeafe;
          color: #0c4a6e;
        }

        .status-duplicate {
          background-color: #f3e8ff;
          color: #6b21a8;
        }

        .status-unknown {
          background-color: #e5e7eb;
          color: #374151;
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

        .expanded-details {
          background-color: #f9fafb;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .details-card {
          background: white;
          border-radius: 0.375rem;
          padding: 1.5rem;
          border-left: 4px solid #3b82f6;
        }

        .details-title {
          font-weight: 700;
          color: #111827;
          margin: 0 0 1rem;
          font-size: 1rem;
        }

        .details-section {
          margin-bottom: 1rem;
        }

        .details-label {
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
        }

        .details-text {
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-size: 0.875rem;
        }

        .details-footer {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .close-details-btn {
          background-color: #6b7280;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }

        .close-details-btn:hover {
          background-color: #4b5563;
        }

        @media (max-width: 768px) {
          .history-table {
            font-size: 0.75rem;
          }

          .table-header-row th {
            padding: 0.5rem;
          }

          .table-body-row td {
            padding: 0.5rem;
          }

          .col-filename {
            min-width: 120px;
          }

          .col-upload-time {
            width: 7rem;
          }

          .filename-text {
            max-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
