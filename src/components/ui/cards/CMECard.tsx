"use client";

/**
 * ─── CMECard (Presentational) ────────────────────────────────────
 *
 * Displays a single Coronal Mass Ejection event with expandable details.
 * Relies on business logic from lib/utils/space-weather-utils.ts.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Activity, Radio, ChevronDown, ExternalLink } from "lucide-react";
import { ANIMATION } from "@/lib/constants";
import {
  type CME, type CMEAnalysis,
  formatShortDate, formatFullDate,
} from "@/lib/utils/space-weather-utils";

interface CMECardProps {
  event: CME;
  analysis: CMEAnalysis | undefined;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export default function CMECard({ event, analysis, index, isExpanded, onToggle }: CMECardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.LIST_STAGGER_DELAY }}
      className="glass-card border border-amber-500/20 overflow-hidden cursor-pointer hover:border-amber-500/40 transition-colors"
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`CME ${event.activityID}, speed ${analysis ? analysis.speed + ' km/s' : 'unknown'}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onClick={() => onToggle(event.activityID)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(event.activityID); } }}
    >
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Sun className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-white">{event.activityID}</span>
            {event.sourceLocation && (
              <span className="text-[10px] font-mono text-amber-400/70">{event.sourceLocation}</span>
            )}
          </div>
          <p className="text-xs text-space-400 line-clamp-2">{event.note || "Coronal Mass Ejection detected"}</p>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-space-500">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{formatShortDate(event.startTime)}</span>
            {analysis && (
              <span className="flex items-center gap-1 font-mono text-amber-400">
                <Radio className="w-3 h-3" />{analysis.speed} km/s
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-amber-500/10">
            <div className="p-5 pt-4 bg-amber-500/[0.02] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Start Time</div>
                <div className="text-white font-mono">{formatFullDate(event.startTime)}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Source</div>
                <div className="text-white font-mono">{event.sourceLocation || "N/A"}</div>
              </div>
              {analysis && (
                <>
                  <div>
                    <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Speed</div>
                    <div className="text-amber-400 font-mono font-bold">{analysis.speed} km/s</div>
                  </div>
                  <div>
                    <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Half Angle</div>
                    <div className="text-white font-mono">{analysis.halfAngle}°</div>
                  </div>
                </>
              )}
              {event.note && (
                <div className="col-span-full">
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Analysis Note</div>
                  <div className="text-space-300 leading-relaxed">{event.note}</div>
                </div>
              )}
              {event.link && (
                <div className="col-span-full">
                  <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]">
                    <ExternalLink className="w-3 h-3" /> View on NASA DONKI
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
