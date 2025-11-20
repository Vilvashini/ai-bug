// src/App.jsx
import { useState, useEffect } from "react";
import UploadBox from "./components/UploadBox.jsx";
import LogPreview from "./components/LogPreview.jsx";
import HistoryTable from "./components/HistoryTable.jsx";
import { fetchHistory } from "./api.js";

export default function App() {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);

  const loadHistory = async () => {
    const data = await fetchHistory();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleUploaded = (res) => {
    setLatest(res.analysis);
    loadHistory();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Bug Tracker</h1>
      <UploadBox onUploaded={handleUploaded} />
      <LogPreview analysis={latest} />
      <h2 className="text-xl font-bold mt-6">Upload History</h2>
      <HistoryTable logs={history} />
    </div>
  );
}
