"use client";

/**
 * ─── StormCard (Presentational) ──────────────────────────────────
 *
 * Displays a single Geomagnetic Storm event with expandable Kp index
 * timeline visualization. Relies on business logic from
 * lib/utils/space-weather-utils.ts.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Wind, ChevronDown, ExternalLink } from "lucide-react";
import { ANIMATION, KP_BAR_COLORS, KP_THRESHOLDS } from "@/lib/constants";
import {
  type GeoStorm,
  getKpDescription, getMaxKp, formatShortDate,
} from "@/lib/utils/space-weather-utils";

interface StormCardProps {
  storm: GeoStorm;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export default function StormCard({ storm, index, isExpanded, onToggle }: StormCardProps) {
  const maxKp = getMaxKp(storm.allKpIndex);
  const kpInfo = getKpDescription(maxKp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.LIST_STAGGER_DELAY }}
      className="glass-card overflow-hidden border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-colors"
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`Geomagnetic storm ${storm.gstID}, max Kp ${maxKp}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onClick={() => onToggle(storm.gstID)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(storm.gstID); } }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <Wind className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-white">{storm.gstID}</span>
          {storm.allKpIndex?.[0] && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-space-400">Max Kp:</span>
              <span className={`text-sm font-bold font-mono ${kpInfo.color}`}>{maxKp}</span>
              <span className={`text-[10px] ${kpInfo.color}`}>— {kpInfo.level}</span>
            </div>
          )}
        </div>
        <span className="text-xs font-mono text-space-400 shrink-0">{formatShortDate(storm.startTime)}</span>
        <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-cyan-500/10">
            <div className="p-5 pt-4 bg-cyan-500/[0.02]">
              <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Kp Index Timeline</div>
              <div className="space-y-2">
                {storm.allKpIndex?.map((kp, ki) => {
                  const kpDesc = getKpDescription(kp.kpIndex);
                  const barWidth = `${(kp.kpIndex / KP_THRESHOLDS.MAX) * 100}%`;
                  return (
                    <div key={ki} className="flex items-center gap-3 text-xs">
                      <span className="text-space-500 font-mono w-32 shrink-0">{formatShortDate(kp.observedTime)}</span>
                      <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${kp.kpIndex >= KP_BAR_COLORS.HIGH ? "bg-red-500" : kp.kpIndex >= KP_BAR_COLORS.MEDIUM ? "bg-amber-500" : "bg-cyan-500"}`}
                          style={{ width: barWidth }}
                        />
                      </div>
                      <span className={`font-mono font-bold w-6 text-right ${kpDesc.color}`}>{kp.kpIndex}</span>
                      <span className="text-space-500 w-20 text-right text-[10px]">{kp.source}</span>
                    </div>
                  );
                })}
              </div>
              {storm.link && (
                <a href={storm.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px] mt-4">
                  <ExternalLink className="w-3 h-3" /> View on NASA DONKI
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
