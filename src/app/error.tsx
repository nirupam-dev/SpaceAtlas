"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { createLogger } from "@/lib/logger";

const log = createLogger("ErrorBoundary");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("Unhandled route error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack?.slice(0, 500),
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-display text-white mb-3">Something went wrong</h2>
        <p className="text-space-400 text-sm leading-relaxed mb-8">
          An unexpected error occurred. Our team has been notified.
          {error.digest && (
            <span className="block mt-2 text-xs text-space-600 font-mono">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue font-micro text-sm uppercase tracking-widest hover:bg-accent-blue/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-space-300 font-micro text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
