/**
 * ─── StatBlock ──────────────────────────────────────────────────
 *
 * Reusable stat card for observatory dashboards.
 * Displays an icon, large value, and label in a glass card.
 */

import type { LucideIcon } from "lucide-react";

interface StatBlockProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  valueColor?: string;
  borderColor?: string;
}

export default function StatBlock({
  icon: Icon,
  value,
  label,
  iconColor = "text-accent-blue",
  valueColor = "gradient-text",
  borderColor = "border-accent-blue/20",
}: StatBlockProps) {
  return (
    <div className={`glass-card p-5 text-center border ${borderColor}`}>
      <Icon className={`w-5 h-5 mx-auto mb-2 ${iconColor}`} />
      <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
      <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}
