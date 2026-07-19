"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, MapPin, Calendar, Zap, Globe2, Wind, Waves, Mountain, ChevronDown, ExternalLink, Info, Navigation } from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";
import { useEarthEvents } from "@/lib/hooks/use-space-query";
import Image from "next/image";

interface EonetEvent {
  id: string;
  title: string;
  description?: string;
  categories: { id: string; title: string }[];
  geometry: { date: string; type: string; coordinates: number[] }[];
  sources: { id: string; url: string }[];
}

const categoryIcons: Record<string, typeof Flame> = {
  wildfires: Flame,
  volcanoes: Mountain,
  severeStorms: Wind,
  seaLakeIce: Waves,
};

const categoryColors: Record<string, string> = {
  wildfires: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  volcanoes: "text-red-400 bg-red-500/10 border-red-500/30",
  severeStorms: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  seaLakeIce: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const categoryDescriptions: Record<string, string> = {
  wildfires: "Active wildfire detected by satellite thermal sensors. These events can span thousands of hectares and significantly impact air quality.",
  volcanoes: "Volcanic activity detected — may include eruptions, ash plumes, or elevated thermal signatures from magma.",
  severeStorms: "Severe weather system tracked by meteorological satellites, including cyclones, typhoons, and hurricanes.",
  seaLakeIce: "Significant change in sea or lake ice coverage detected by radar and optical satellites.",
};

export default function EarthEvents() {
  const { data, isLoading: loading } = useEarthEvents(30);
  const events = (data?.events ?? []) as EonetEvent[];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Category counts
  const catCounts = events.reduce<Record<string, number>>((acc, e) => {
    const cat = e.categories[0]?.id || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const filtered = filter === "all" ? events : events.filter(e => e.categories[0]?.id === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-t-2 border-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
                <Image src="/earth-from-space.png" alt="Planet Earth from Space" fill className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
            <Globe2 className="w-3 h-3" /> NASA EONET
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-white tracking-widest">EARTH EVENTS</h3>
          <p className="text-space-400 text-sm mt-1 max-w-md">Natural events tracked in real-time by NASA&apos;s Earth Observatory</p>
        </div>
        <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-accent-green/30">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] font-micro text-accent-green uppercase tracking-widest">{events.length} Active</span>
        </div>
      </div>

      <NasaImageBanner query="earth satellite wildfire natural disaster" count={6} title="NASA Earth Observation" cols={6} />

      {/* Educational Info */}
      <div className="glass-card p-5 mb-8 border border-emerald-500/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">NASA Earth Observatory Natural Event Tracker</h4>
            <p className="text-xs text-space-400 leading-relaxed">
              <strong className="text-space-300">EONET</strong> aggregates natural events detected by NASA&apos;s fleet of Earth-observing satellites.
              Events include <strong className="text-space-300">wildfires</strong> (thermal anomalies from MODIS/VIIRS),{" "}
              <strong className="text-space-300">volcanic eruptions</strong> (ash/SO₂ plumes),{" "}
              <strong className="text-space-300">severe storms</strong> (tropical cyclones), and{" "}
              <strong className="text-space-300">ice events</strong> (icebergs, sea ice changes). Coordinates link directly to satellite imagery.
            </p>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-[10px] font-micro uppercase tracking-widest border transition-all cursor-pointer ${
            filter === "all" ? "bg-accent-blue/10 text-white border-accent-blue/40" : "bg-white/5 text-space-400 border-white/10 hover:border-white/30"
          }`}>
          All ({events.length})
        </button>
        {Object.entries(catCounts).map(([cat, count]) => {
          const color = categoryColors[cat] || "text-space-400 bg-white/5 border-white/10";
          const Icon = categoryIcons[cat] || Globe2;
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-micro uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === cat ? color : "bg-white/5 text-space-400 border-white/10 hover:border-white/30"
              }`}>
              <Icon className="w-3 h-3" />
              {cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((event, i) => {
          const catId = event.categories[0]?.id || "";
          const catTitle = event.categories[0]?.title || "Natural Event";
          const IconComponent = categoryIcons[catId] || Globe2;
          const colorClass = categoryColors[catId] || "text-space-300 bg-white/5 border-white/10";
          const coords = event.geometry[0]?.coordinates;
          const date = event.geometry[0]?.date;
          const isExpanded = expandedId === event.id;
          const catDesc = categoryDescriptions[catId] || "Natural event detected by satellite observation.";

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="glass-card overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer"
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`${catTitle}: ${event.title}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
              onClick={() => setExpandedId(isExpanded ? null : event.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : event.id); } }}
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
                        onClick={e => e.stopPropagation()}>
                        Source →
                      </a>
                    )}
                    <ChevronDown className={`w-4 h-4 text-space-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5">
                    <div className="p-5 pt-4 bg-white/[0.01]">
                      {/* Category description */}
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
                        {date && (
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Detected</div>
                            <div className="text-white font-mono">{new Date(date).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        )}
                        {coords && (
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Coordinates</div>
                            <div className="text-white font-mono">{coords[1]?.toFixed(4)}° {coords[1] >= 0 ? "N" : "S"}, {coords[0]?.toFixed(4)}° {coords[0] >= 0 ? "E" : "W"}</div>
                          </div>
                        )}
                      </div>

                      {/* Geometry timeline if multiple points */}
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

                      {/* Links */}
                      <div className="flex items-center gap-4">
                        {coords && (
                          <a href={`https://www.google.com/maps?q=${coords[1]},${coords[0]}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]"
                            onClick={e => e.stopPropagation()}>
                            <MapPin className="w-3 h-3" /> View on Map
                          </a>
                        )}
                        {event.sources.map((src, si) => (
                          <a key={si} href={src.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]"
                            onClick={e => e.stopPropagation()}>
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
        })}
      </div>
    </div>
  );
}
