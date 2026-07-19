"use client";

/**
 * ─── FlareCard (Presentational) ──────────────────────────────────
 *
 * Displays a single Solar Flare event with expandable details.
 * Relies on business logic from lib/utils/space-weather-utils.ts.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, ChevronDown, ExternalLink } from "lucide-react";
import { ANIMATION } from "@/lib/constants";
import {
  type SolarFlare,
  isStrongFlare, getFlareImpactDescription,
  formatShortDate, formatFullDate,
} from "@/lib/utils/space-weather-utils";

interface FlareCardProps {
  flare: SolarFlare;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export default function FlareCard({ flare, index, isExpanded, onToggle }: FlareCardProps) {
  const isStrong = isStrongFlare(flare.classType);

  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.LIST_STAGGER_DELAY }}
      className={`glass-card overflow-hidden cursor-pointer hover:border-pink-500/40 transition-colors ${isStrong ? "border-red-500/30" : "border-pink-500/20"}`}
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`${flare.classType} solar flare${isStrong ? ' (strong)' : ''}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onClick={() => onToggle(flare.flrID)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(flare.flrID); } }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isStrong ? "bg-red-500/10 border border-red-500/30" : "bg-pink-500/10 border border-pink-500/20"}`}>
          {isStrong ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Zap className="w-5 h-5 text-pink-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{flare.classType} Flare</span>
            {isStrong && <span className="px-2 py-0.5 rounded-full text-[9px] font-micro bg-red-500/15 text-red-400 border border-red-500/30 uppercase">Strong</span>}
          </div>
          <span className="text-xs text-space-500">{flare.sourceLocation || "—"}</span>
        </div>
        <div className="text-right text-xs text-space-400 shrink-0">
          <div className="font-mono">{formatShortDate(flare.beginTime)}</div>
          <div className="text-[10px] text-space-500 mt-0.5">Peak: {formatShortDate(flare.peakTime)}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-pink-500/10">
            <div className="p-5 pt-4 bg-pink-500/[0.02] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Begin</div>
                <div className="text-white font-mono">{formatFullDate(flare.beginTime)}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Peak</div>
                <div className="text-pink-400 font-mono font-bold">{formatFullDate(flare.peakTime)}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">End</div>
                <div className="text-white font-mono">{flare.endTime ? formatFullDate(flare.endTime) : "Ongoing"}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Class</div>
                <div className={`font-mono font-bold ${isStrong ? "text-red-400" : "text-pink-400"}`}>{flare.classType}</div>
                <div className="text-[10px] text-space-500 mt-0.5">{getFlareImpactDescription(flare.classType)}</div>
              </div>
              {flare.link && (
                <div className="col-span-full">
                  <a href={flare.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]">
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
