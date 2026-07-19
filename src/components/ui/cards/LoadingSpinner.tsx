/**
 * ─── LoadingSpinner ─────────────────────────────────────────────
 *
 * Consistent loading spinner used across observatory components.
 */

interface LoadingSpinnerProps {
  color?: string;
}

export default function LoadingSpinner({
  color = "border-accent-blue",
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Loading">
      <div className={`w-8 h-8 border-t-2 ${color} rounded-full animate-spin`} />
    </div>
  );
}
