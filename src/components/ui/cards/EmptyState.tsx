/**
 * ─── EmptyState ─────────────────────────────────────────────────
 *
 * Consistent empty state display for when data sets are empty.
 */

import type { LucideIcon } from "lucide-react";
import { Shield } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  iconColor?: string;
}

export default function EmptyState({
  icon: Icon = Shield,
  title,
  subtitle,
  iconColor = "text-emerald-400",
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <Icon className={`w-10 h-10 mx-auto mb-3 ${iconColor}`} />
      <p className="text-space-300 font-medium">{title}</p>
      <p className="text-space-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}
