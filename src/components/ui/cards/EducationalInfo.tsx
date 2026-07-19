/**
 * ─── EducationalInfo ────────────────────────────────────────────
 *
 * Reusable educational information card with icon and rich text.
 * Replaces duplicated info card markup across observatory components.
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EducationalInfoProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  borderColor?: string;
  iconColor?: string;
}

export default function EducationalInfo({
  icon: Icon,
  title,
  children,
  borderColor = "border-white/10",
  iconColor = "text-accent-blue",
}: EducationalInfoProps) {
  return (
    <div className={`glass-card p-5 mb-8 border ${borderColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
        <div>
          <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
          <p className="text-xs text-space-400 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}
