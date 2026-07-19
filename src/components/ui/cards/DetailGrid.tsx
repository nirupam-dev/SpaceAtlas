/**
 * ─── DetailGrid ─────────────────────────────────────────────────
 *
 * Reusable grid layout for label/value pairs in expanded card views.
 * Eliminates duplicated detail grid patterns across observatory cards.
 */

import type { ReactNode } from "react";

interface DetailField {
  label: string;
  value: ReactNode;
  subtext?: string;
  colSpan?: "full";
}

interface DetailGridProps {
  fields: DetailField[];
  className?: string;
}

export default function DetailGrid({ fields, className = "" }: DetailGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-xs ${className}`}>
      {fields.map((field, i) => (
        <div key={i} className={field.colSpan === "full" ? "col-span-full" : ""}>
          <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">
            {field.label}
          </div>
          <div className="text-white font-mono">{field.value}</div>
          {field.subtext && (
            <div className="text-[10px] text-space-500 mt-0.5">{field.subtext}</div>
          )}
        </div>
      ))}
    </div>
  );
}
