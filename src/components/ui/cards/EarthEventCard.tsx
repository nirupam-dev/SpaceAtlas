"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Zap, ChevronDown,
  ExternalLink, Navigation,
} from "lucide-react";
import { ANIMATION } from "@/lib/constants";
import {
  type EonetEvent,
  getCategoryIcon, getCategoryColor, getCategoryDescription,
} from "@/lib/utils/earth-events-utils";

interface EarthEventCardProps {
  event: EonetEvent;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export default function EarthEventCard({ event, index, isExpanded, onToggle }: EarthEventCardProps) {
  const catId = event.categories[0]?.id || "";
  const catTitle = event.categories[0]?.title || "Natural Event";
  const IconComponent = getCategoryIcon(catId);
  const colorClass = getCategoryColor(catId);
  const catDesc = getCategoryDescription(catId);
  const coords = event.geometry[0]?.coordinates;
  const date = event.geometry[0]?.date;

  return (
    <motion.div
      initial={{ opacity: 0, y: ANIMATION.SLIDE_OFFSET_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION.LIST_STAGGER_DELAY, duration: ANIMATION.TAB_TRANSITION }}
      className="glass-card overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer"
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`${catTitle}: ${event.title}.`}
      onClick={() => onToggle(event.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(event.id); } }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white truncate">{event.title}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-space-500 flex-wrap">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{catTitle}</span>
              {date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
              {coords && <span className="flex items-center gap-1 font-mono"><MapPin className="w-3 h-3" />{coords[1]?.toFixed(2)}°, {coords[0]?.toFixed(2)}°</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {event.sources[0] && (
              <a href={event.sources[0].url} target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-micro text-accent-blue hover:text-white transition-colors uppercase tracking-widest"
                onClick={e => e.stopPropagation()}>Source →</a>
            )}
            <ChevronDown className={`w-4 h-4 text-space-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5">
            <div className="p-5 pt-4 bg-white/[0.01]">
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 ${colorClass}`}>
                <IconComponent className="w-4 h-4" />
                <span className="text-xs text-space-300">{catDesc}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Event ID</div>
                  <div className="text-white font-mono">{event.id}</div>
                </div>
                <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Category</div>
                  <div className="text-white">{catTitle}</div>
                </div>
                {date && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Detected</div>
                  <div className="text-white font-mono">{new Date(date).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>}
                {coords && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Coordinates</div>
                  <div className="text-white font-mono">{coords[1]?.toFixed(4)}° {coords[1] >= 0 ? "N" : "S"}, {coords[0]?.toFixed(4)}° {coords[0] >= 0 ? "E" : "W"}</div>
                </div>}
              </div>
              {event.geometry.length > 1 && (
                <div className="mb-4">
                  <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Movement Timeline ({event.geometry.length} points)</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {event.geometry.slice(0, 10).map((g, gi) => (
                      <div key={gi} className="flex items-center gap-3 text-[11px]">
                        <span className="text-space-500 font-mono w-28 shrink-0">{new Date(g.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <Navigation className="w-3 h-3 text-accent-blue shrink-0" />
                        <span className="text-space-300 font-mono">{g.coordinates[1]?.toFixed(2)}°, {g.coordinates[0]?.toFixed(2)}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                {coords && (
                  <a href={`https://www.google.com/maps?q=${coords[1]},${coords[0]}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]" onClick={e => e.stopPropagation()}>
                    <MapPin className="w-3 h-3" /> View on Map
                  </a>
                )}
                {event.sources.map((src, si) => (
                  <a key={si} href={src.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]" onClick={e => e.stopPropagation()}>
                    <ExternalLink className="w-3 h-3" /> {src.id} Source
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
