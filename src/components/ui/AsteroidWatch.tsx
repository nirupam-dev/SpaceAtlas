"use client";

/**
 * ─── AsteroidWatch (Container Component) ─────────────────────────
 *
 * Thin container that fetches NEO data and delegates rendering
 * to presentational sub-components.
 *
 * Architecture:
 * - Business logic → lib/utils/neo-calculations.ts
 * - Presentational card → components/ui/cards/AsteroidCard
 * - Reusable UI → components/ui/cards/
 * - This file → data wiring + state management only
 */

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Shield, Crosshair, Info,
  ChevronLeft, ChevronRight, Target,
} from "lucide-react";
import { useNeoData } from "@/lib/hooks/use-space-query";
import { HeroBanner, EducationalInfo, StatBlock, LoadingSpinner, AsteroidCard } from "@/components/ui/cards";
import NasaImageBanner from "./NasaImageBanner";
import { API_LIMITS } from "@/lib/constants";
import {
  type NeoObject,
  extractAndSortNeos, computeNeoStats,
} from "@/lib/utils/neo-calculations";

export default function AsteroidWatch() {
  const [dateOffset, setDateOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentDate = new Date(Date.now() + dateOffset * API_LIMITS.MS_PER_DAY);
  const dateStr = currentDate.toISOString().split("T")[0];
  const { data, isLoading: loading, isError: error } = useNeoData(dateStr);

  const asteroids = useMemo(() => extractAndSortNeos(data?.near_earth_objects as Record<string, NeoObject[]> | undefined), [data]);
  const { hazardousCount, closestLD } = computeNeoStats(asteroids);
  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div>
      <HeroBanner
        imageSrc="/asteroid-banner.png" imageAlt="Near-Earth Asteroid"
        badge={{ icon: AlertTriangle, text: "Planetary Defense", colorClasses: "bg-red-500/10 text-red-400 border-red-500/30" }}
        title="ASTEROID WATCH"
        description="Near-Earth Objects tracked by NASA JPL&apos;s Center for Near Earth Object Studies"
      />
      <NasaImageBanner query="asteroid near earth OSIRIS-REx" count={6} title="NASA Asteroid Imagery" cols={6} />

      <EducationalInfo icon={Info} title="Understanding Near-Earth Objects" borderColor="border-red-500/10" iconColor="text-red-400">
        <strong className="text-space-300">NEOs</strong> orbit within 1.3 AU of the Sun.{" "}
        <strong className="text-space-300">PHAs</strong> are objects &gt;140m passing within 0.05 AU of Earth.{" "}
        <strong className="text-space-300">1 Lunar Distance (LD)</strong> = 384,400 km. Objects within 5 LD receive heightened monitoring by NASA&apos;s Planetary Defense Coordination Office.
      </EducationalInfo>

      {/* Date nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-space-400">Showing objects for selected date</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDateOffset(p => p - 1)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all text-space-400 hover:text-white cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-mono text-white px-4 py-2 rounded-lg bg-white/5 border border-white/10 min-w-[130px] text-center">
            {currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button onClick={() => setDateOffset(p => Math.min(p + 1, API_LIMITS.NEO_MAX_DATE_OFFSET))} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all text-space-400 hover:text-white cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBlock icon={Target} value={asteroids.length} label="Objects Tracked" iconColor="text-accent-blue" borderColor="border-accent-blue/20" />
        <StatBlock icon={AlertTriangle} value={hazardousCount} label="Hazardous"
          iconColor={hazardousCount > 0 ? "text-red-400" : "text-emerald-400"}
          valueColor={hazardousCount > 0 ? "text-red-400" : "text-emerald-400"}
          borderColor={hazardousCount > 0 ? "border-red-500/30" : "border-accent-green/20"} />
        <StatBlock icon={Shield} value={asteroids.length - hazardousCount} label="Safe" iconColor="text-accent-purple" valueColor="text-accent-purple" borderColor="border-accent-purple/20" />
        <StatBlock icon={Crosshair} value={closestLD} label="Closest (LD)" iconColor="text-accent-cyan" valueColor="text-accent-cyan" borderColor="border-accent-cyan/20" />
      </div>

      {loading && <LoadingSpinner color="border-accent-blue" />}
      {error && <div className="text-center py-16 text-space-400"><AlertTriangle className="w-8 h-8 mx-auto mb-3 text-red-400" /><p>Failed to load asteroid data.</p></div>}

      {!loading && !error && (
        <div className="space-y-3">
          <AnimatePresence>
            {asteroids.slice(0, API_LIMITS.NEO_DISPLAY).map((neo, i) => (
              <AsteroidCard key={neo.id} neo={neo} index={i} isExpanded={expandedId === neo.id} onToggle={toggleExpand} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
