/**
 * ─── ThreatBadge ────────────────────────────────────────────────
 *
 * Reusable badge for displaying threat/severity levels.
 * Used in asteroid watch, fireball tracker, and space weather.
 */

import type { LucideIcon } from "lucide-react";

interface ThreatBadgeProps {
  icon: LucideIcon;
  level: string;
  description: string;
  color: string;
  bgClasses: string;
}

export default function ThreatBadge({
  icon: Icon,
  level,
  description,
  color,
  bgClasses,
}: ThreatBadgeProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-5 ${bgClasses}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xs font-bold ${color}`}>Threat: {level}</span>
      <span className="text-xs text-space-400 ml-2">{description}</span>
    </div>
  );
}
