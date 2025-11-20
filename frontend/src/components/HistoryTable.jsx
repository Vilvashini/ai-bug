// src/components/HistoryTable.jsx
export default function HistoryTable({ logs }) {
  if (!logs || logs.length === 0) return <p>No logs uploaded yet.</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Filename</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Issue Type</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.filename}</td>
              <td>{log.status}</td>
              <td>{log.severity || "-"}</td>
              <td>{log.issue_type || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
