import { useState } from "react";
import { uploadLog } from "../api.js";

export default function UploadBox({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const ALLOWED_TYPES = [".log", ".txt", ".json"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setMessage("⚠ No file selected.");
      return false;
    }

    const fileName = selectedFile.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    if (!ALLOWED_TYPES.includes(fileExtension)) {
      setMessage(
        `⚠ Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`
      );
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage(
        `⚠ File size exceeds 5MB limit. Your file: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setMessage("");
    } else {
      setFile(null);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    handleFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const selectedFile = e.dataTransfer?.files?.[0];
    handleFileSelect(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return setMessage("⚠ Please select a file first.");
    setLoading(true);
    setMessage("Uploading...");

    try {
      const res = await uploadLog(file);

      if (res.status === "duplicate") {
        setMessage(
          `⚠ Duplicate detected. Log ID: ${res.log.id}. Returning previous analysis.`
        );
        onUploaded(res.analysis);
      } else if (res.status === "cached") {
        setMessage(
          `⚡ Similar log found (score: ${(
            res.similarity * 100
          ).toFixed(2)}%). Returning cached analysis.`
        );
        onUploaded(res.analysis);
      } else if (res.status === "processed") {
        setMessage("✅ New log processed successfully.");
        onUploaded(res.analysis);
      } else {
        setMessage("ℹ Unknown response from server.");
      }
    } catch (err) {
      console.error(err);
      setMessage(`❌ Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-zone ${dragActive ? "drag-active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <svg
            className="upload-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="upload-title">Drag and drop your log file here</p>
          <p className="upload-subtitle">or click to select a file</p>
          <p className="upload-formats">Supported: .log, .txt, .json (max 5MB)</p>

          <input
            type="file"
            onChange={handleInputChange}
            accept=".log,.txt,.json"
            className="upload-input"
          />
        </div>
      </div>

      {file && (
        <div className="file-preview">
          <div className="file-info">
            <svg
              className="file-icon"
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
            <div className="file-details">
              <p className="file-name">{file.name}</p>
              <p className="file-size">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setMessage("");
            }}
            className="file-remove-btn"
          >
            ✕
          </button>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className={`upload-btn ${loading ? "loading" : ""} ${!file ? "disabled" : ""}`}
      >
        {loading ? "Processing..." : "Upload and Analyze"}
      </button>

      {message && (
        <div className={`message ${
          message.startsWith("✅")
            ? "message-success"
            : message.startsWith("⚠")
            ? "message-warning"
            : message.startsWith("❌")
            ? "message-error"
            : "message-info"
        }`}>
          {message}
        </div>
      )}

      <style>{`
        .upload-container {
          padding: 2rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .upload-zone {
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f9fafb;
          margin-bottom: 1.5rem;
        }

        .upload-zone:hover {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .upload-zone.drag-active {
          border-color: #2563eb;
          background-color: #dbeafe;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .upload-icon {
          width: 3rem;
          height: 3rem;
          color: #6b7280;
          margin: 0 auto 1rem;
        }

        .upload-zone.drag-active .upload-icon {
          color: #2563eb;
        }

        .upload-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .upload-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .upload-formats {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.5rem;
        }

        .upload-input {
          display: none;
        }

        .file-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
          border-left: 4px solid #10b981;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .file-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #10b981;
          flex-shrink: 0;
        }

        .file-details {
          text-align: left;
        }

        .file-name {
          font-weight: 500;
          color: #111827;
          margin: 0;
          word-break: break-all;
        }

        .file-size {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0 0;
        }

        .file-remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .file-remove-btn:hover {
          color: #dc2626;
        }

        .upload-btn {
          width: 100%;
          padding: 0.75rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .upload-btn:hover:not(.disabled):not(.loading) {
          background-color: #2563eb;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
        }

        .upload-btn:active:not(.disabled):not(.loading) {
          transform: scale(0.98);
        }

        .upload-btn.disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .upload-btn.loading {
          opacity: 0.7;
        }

        .message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .message-success {
          background-color: #dcfce7;
          color: #166534;
          border-left: 4px solid #16a34a;
        }

        .message-warning {
          background-color: #fef3c7;
          color: #92400e;
          border-left: 4px solid #f59e0b;
        }

        .message-error {
          background-color: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #ef4444;
        }

        .message-info {
          background-color: #dbeafe;
          color: #0c4a6e;
          border-left: 4px solid #3b82f6;
        }
      `}</style>
    </div>
  );
}
