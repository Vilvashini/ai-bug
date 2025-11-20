import { useState } from "react";
import { uploadLog } from "../api.js";

export default function UploadBox({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    <div className="p-4 border rounded shadow-md flex flex-col gap-3 bg-white">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input file-input-bordered w-full"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? "Uploading..." : "Upload Log"}
      </button>
      {message && (
        <div
          className={`mt-2 p-2 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : message.startsWith("⚠")
              ? "bg-yellow-100 text-yellow-800"
              : message.startsWith("❌")
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
