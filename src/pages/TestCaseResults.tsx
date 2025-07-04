import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9.5 17L4 11.5" /></svg>
);
const CrossIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

interface TestCaseResult {
  id: number;
  test_case_id: number;
  folder_id: number;
  status: string;
  reason?: string;
  stdout?: string;
  stderr?: string;
  created_at: string;
  test_case_name?: string;
  folder_name?: string;
}

interface TestCaseResultsProps {
  results?: TestCaseResult[];
}

const statusColor = (status: string) => {
  switch (status) {
    case "pass":
      return "#4caf50"; // green
    case "fail":
      return "#f44336"; // red
    case "warning":
      return "#ff9800"; // orange
    default:
      return "#9e9e9e"; // grey
  }
};

const EyeIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: 22, height: 22, verticalAlign: "middle", cursor: "pointer", ...style }}
    aria-label="Show details"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const TestCaseResults: React.FC<TestCaseResultsProps> = ({ results }) => {
  const [resultsState, setResultsState] = useState<TestCaseResult[]>(results || []);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!results) {
      setLoading(true);
      fetch("http://localhost:9000/api/testcases/results")
        .then(res => res.json())
        .then(data => setResultsState(data))
        .finally(() => setLoading(false));
    }
  }, [results]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(resultsState.map(r => ({
      "Test Case ID": r.test_case_id,
      "Test Name": r.test_case_name,
      "Folder Name": r.folder_name,
      "Status": r.status,
      "Reason": r.reason,
      "Time": new Date(r.created_at).toLocaleString(),
      "Stdout": r.stdout,
      "Stderr": r.stderr
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TestCaseResults");
    XLSX.writeFile(wb, "test_case_results.xlsx");
  };

  const clearAllResults = async () => {
    setLoading(true);
    await fetch("http://localhost:9000/api/testcases/results", { method: "DELETE" });
    fetch("http://localhost:9000/api/testcases/results")
      .then(res => res.json())
      .then(data => setResultsState(data))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Test Case Results</h2>
      <div className="flex gap-4 mb-6">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          Export to Excel
        </button>
        <button
          onClick={clearAllResults}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
          disabled={loading}
        >
          Clear All Results
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-gray-900 border border-gray-200" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: 12, borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>Test Case ID</th>
              <th style={{ padding: 12, borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>Test Name</th>
              <th style={{ padding: 12, borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>Folder</th>
              <th style={{ padding: 12, borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>Status</th>
              <th style={{ padding: 12, borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>Time</th>
              <th style={{ padding: 12, borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#888" }}>Loading...</td>
              </tr>
            )}
            {!loading && resultsState.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "#888" }}>No test results yet.</td>
              </tr>
            )}
            {!loading && resultsState.map((result) => (
              <React.Fragment key={result.id}>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}>{result.test_case_id}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{result.test_case_name || `Test #${result.test_case_id}`}</td>
                  <td style={{ padding: 12 }}>{result.folder_name || `Folder #${result.folder_id}`}</td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        background: statusColor(result.status),
                        color: "#fff",
                        borderRadius: 4,
                        padding: "2px 10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: 14,
                      }}
                    >
                      {result.status}
                    </span>
                  </td>
                  <td style={{ padding: 12, color: "#888" }}>{new Date(result.created_at).toLocaleString()}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    {result.reason ? (
                      <span
                        title="Show details"
                        onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                        style={{ display: "inline-block" }}
                      >
                        <EyeIcon style={{ color: "#1976d2" }} />
                      </span>
                    ) : (
                      <span style={{ color: "#bbb" }}>—</span>
                    )}
                  </td>
                </tr>
                {expandedId === result.id && result.reason && (
                  <tr>
                    <td colSpan={6} style={{ background: "#f9f9f9", padding: 16 }}>
                      <div style={{ marginBottom: 8, color: statusColor(result.status), fontWeight: 500 }}>
                        <strong>Reason:</strong> {result.reason}
                      </div>
                      {(result.stdout || result.stderr) && (
                        <details open>
                          <summary style={{ cursor: "pointer", color: "#1976d2" }}>Show Error Output</summary>
                          <pre style={{ background: "#222", color: "#fff", padding: 12, borderRadius: 4, overflowX: "auto" }}>
                            {result.stdout || result.stderr}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestCaseResults; 