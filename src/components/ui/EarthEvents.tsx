"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, MapPin, Calendar, Zap, Globe2, Wind, Waves, Mountain } from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";

interface EonetEvent {
  id: string;
  title: string;
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

export default function EarthEvents() {
  const [events, setEvents] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/eonet?limit=25")
      .then(r => r.json())
      .then(data => { if (data.events) setEvents(data.events); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/earth-from-space.png"
          alt="Planet Earth from Space"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
            <Globe2 className="w-3 h-3" /> NASA EONET
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-white tracking-widest">EARTH EVENTS</h3>
          <p className="text-space-400 text-sm mt-1 max-w-md">Natural events tracked in real-time by NASA&apos;s Earth Observatory</p>
        </div>
        {/* Live badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-accent-green/30">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] font-micro text-accent-green uppercase tracking-widest">{events.length} Active</span>
        </div>
      </div>

      {/* NASA Earth Satellite Imagery */}
      <NasaImageBanner query="earth satellite wildfire natural disaster" count={6} title="NASA Earth Observation" cols={6} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event, i) => {
          const catId = event.categories[0]?.id || "";
          const catTitle = event.categories[0]?.title || "Natural Event";
          const IconComponent = categoryIcons[catId] || Globe2;
          const colorClass = categoryColors[catId] || "text-space-300 bg-white/5 border-white/10";
          const coords = event.geometry[0]?.coordinates;
          const date = event.geometry[0]?.date;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="glass-card p-5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white truncate">{event.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-space-500">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {catTitle}
                    </span>
                    {date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    {coords && (
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3" />
                        {coords[1]?.toFixed(1)}°, {coords[0]?.toFixed(1)}°
                      </span>
                    )}
                  </div>
                </div>
                {event.sources[0] && (
                  <a
                    href={event.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[10px] font-micro text-accent-blue hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Source →
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
