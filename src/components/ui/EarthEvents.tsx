"use client";

/**
 * ─── EarthEvents (Container Component) ──────────────────────────
 *
 * Thin container that fetches EONET data and delegates rendering
 * to presentational sub-components.
 *
 * Architecture:
 * - Business logic → lib/utils/earth-events-utils.ts
 * - Presentational card → components/ui/cards/EarthEventCard
 * - Reusable UI → components/ui/cards/
 * - This file → data wiring + filter state only
 */

import { useState } from "react";
import { Globe2, Info } from "lucide-react";
import { useEarthEvents } from "@/lib/hooks/use-space-query";
import { HeroBanner, EducationalInfo, LoadingSpinner, EarthEventCard } from "@/components/ui/cards";
import NasaImageBanner from "./NasaImageBanner";
import { API_LIMITS } from "@/lib/constants";
import {
  type EonetEvent,
  getCategoryIcon, countEventCategories, filterEventsByCategory,
  CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR,
} from "@/lib/utils/earth-events-utils";

export default function EarthEvents() {
  const { data, isLoading: loading } = useEarthEvents(API_LIMITS.EARTH_EVENTS_FETCH);
  const events = (data?.events ?? []) as EonetEvent[];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const catCounts = countEventCategories(events);
  const filtered = filterEventsByCategory(events, filter);
  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  if (loading) return <LoadingSpinner color="border-accent-cyan" />;

  return (
    <div>
      <HeroBanner
        imageSrc="/earth-from-space.png" imageAlt="Planet Earth from Space"
        badge={{ icon: Globe2, text: "NASA EONET", colorClasses: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" }}
        title="EARTH EVENTS"
        description="Natural events tracked in real-time by NASA&apos;s Earth Observatory"
        topRight={
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-accent-green/30">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[10px] font-micro text-accent-green uppercase tracking-widest">{events.length} Active</span>
          </div>
        }
      />
      <NasaImageBanner query="earth satellite wildfire natural disaster" count={6} title="NASA Earth Observation" cols={6} />

      <EducationalInfo icon={Info} title="NASA Earth Observatory Natural Event Tracker" borderColor="border-emerald-500/10" iconColor="text-emerald-400">
        <strong className="text-space-300">EONET</strong> aggregates natural events detected by NASA&apos;s fleet of Earth-observing satellites.
        Events include <strong className="text-space-300">wildfires</strong> (thermal anomalies from MODIS/VIIRS),{" "}
        <strong className="text-space-300">volcanic eruptions</strong> (ash/SO₂ plumes),{" "}
        <strong className="text-space-300">severe storms</strong> (tropical cyclones), and{" "}
        <strong className="text-space-300">ice events</strong> (icebergs, sea ice changes). Coordinates link directly to satellite imagery.
      </EducationalInfo>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-[10px] font-micro uppercase tracking-widest border transition-all cursor-pointer ${
            filter === "all" ? "bg-accent-blue/10 text-white border-accent-blue/40" : "bg-white/5 text-space-400 border-white/10 hover:border-white/30"
          }`}>
          All ({events.length})
        </button>
        {Object.entries(catCounts).map(([cat, count]) => {
          const color = CATEGORY_COLORS[cat] || DEFAULT_CATEGORY_COLOR;
          const Icon = getCategoryIcon(cat);
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-micro uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === cat ? color : "bg-white/5 text-space-400 border-white/10 hover:border-white/30"
              }`}>
              <Icon className="w-3 h-3" /> {cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((event, i) => (
          <EarthEventCard key={event.id} event={event} index={i} isExpanded={expandedId === event.id} onToggle={toggleExpand} />
        ))}
      </div>
    </div>
  );
}
