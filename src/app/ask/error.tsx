// Route-level error boundary for Ask AI page
'use client';

import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">ATLAS Offline</h2>
        <p className="text-sm text-space-400 mb-6 leading-relaxed">
          {error.message || 'The ATLAS intelligence core encountered an error.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="btn-outline px-5 py-2.5 text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <button
            onClick={reset}
            className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
