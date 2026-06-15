// Route-level error boundary for search page
'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Search Error</h2>
        <p className="text-sm text-space-400 mb-6 leading-relaxed">
          {error.message || 'An unexpected error occurred while searching.'}
        </p>
        <button
          onClick={reset}
          className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
