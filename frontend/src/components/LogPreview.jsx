// src/components/LogPreview.jsx
export default function LogPreview({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="p-4 border rounded shadow-md mt-4">
      <h2 className="font-bold text-lg mb-2">Analysis Result</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><strong>Issue Type:</strong> {analysis.issue_type}</div>
        <div><strong>Severity:</strong> {analysis.severity}</div>
        <div className="col-span-2">
          <strong>Root Cause:</strong> {analysis.root_cause}
        </div>
        <div className="col-span-2">
          <strong>Suggested Fix:</strong> {analysis.suggested_fix}
        </div>
      </div>
    </div>
  );
}
