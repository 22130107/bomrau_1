"use client";

import { useEffect, useState } from "react";

export function ClientErrorDiagnostic() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleError = (event: ErrorEvent) => {
      setError(`Runtime Error: ${event.message} (${event.filename}:${event.lineno})`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      setError(`Promise Rejection: ${event.reason}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (!error) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(220, 38, 38, 0.95)",
        color: "white",
        padding: "12px",
        zIndex: 999999,
        fontSize: "12px",
        fontFamily: "monospace",
        wordBreak: "break-all",
        boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
        maxHeight: "150px",
        overflowY: "auto"
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>⚠️ JavaScript Error Detected:</div>
      {error}
    </div>
  );
}
