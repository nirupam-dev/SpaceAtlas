"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches errors in the root layout itself.
 * This is a minimal fallback since the root layout CSS may not be available.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL ERROR]", error.message, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0f172a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 24 }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 24 }}>
            A critical error occurred. Please try reloading the page.
            {error.digest && (
              <span style={{ display: "block", marginTop: 8, fontSize: 12, opacity: 0.5, fontFamily: "monospace" }}>
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(56,189,248,0.1)", color: "#38bdf8", cursor: "pointer", fontSize: 14 }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
