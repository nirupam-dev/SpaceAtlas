"use client";

/**
 * ─── AsteroidWatch (Container Component) ─────────────────────────
 *
 * Thin container that fetches NEO data and delegates rendering
 * to presentational sub-components.
 *
 * Business logic → lib/utils/neo-calculations.ts
 * Reusable UI → components/ui/cards/
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Shield, Crosshair, Ruler, Gauge, Info,
  ChevronLeft, ChevronRight, ChevronDown, ExternalLink,
  Globe2, Target, Orbit,
} from "lucide-react";
import { useNeoData } from "@/lib/hooks/use-space-query";
import { HeroBanner, EducationalInfo, StatBlock, ThreatBadge, LoadingSpinner } from "@/components/ui/cards";
import NasaImageBanner from "./NasaImageBanner";
import { ANIMATION, API_LIMITS, PROXIMITY_BAR_COLORS } from "@/lib/constants";
import {
  type NeoObject,
  getThreatInfo, getSizeComparison, calculateProximityBarFill,
  extractAndSortNeos, computeNeoStats, formatWithCommas,
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

// ─── Asteroid Card (Presentational) ───────────────────────────

function AsteroidCard({ neo, index, isExpanded, onToggle }: {
  neo: NeoObject; index: number; isExpanded: boolean; onToggle: (id: string) => void;
}) {
  const ap = neo.close_approach_data[0];
  const dMin = neo.estimated_diameter.meters.estimated_diameter_min;
  const dMax = neo.estimated_diameter.meters.estimated_diameter_max;
  const avg = (dMin + dMax) / 2;
  const missKm = parseFloat(ap?.miss_distance?.kilometers || "0");
  const missLD = parseFloat(ap?.miss_distance?.lunar || "0");
  const missAU = parseFloat(ap?.miss_distance?.astronomical || "0");
  const vel = parseFloat(ap?.relative_velocity?.kilometers_per_hour || "0");
  const velS = parseFloat(ap?.relative_velocity?.kilometers_per_second || "0");
  const haz = neo.is_potentially_hazardous_asteroid;
  const threat = getThreatInfo(haz, missLD);
  const barFill = calculateProximityBarFill(missLD);

  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X_LARGE }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: ANIMATION.SLIDE_OFFSET_X_LARGE }}
      transition={{ duration: ANIMATION.TAB_TRANSITION, delay: index * ANIMATION.LIST_STAGGER_DELAY }}
      className={`glass-card overflow-hidden cursor-pointer transition-all ${haz ? "border-red-500/30 hover:border-red-500/50" : "border-space-500/20 hover:border-white/30"}`}
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`Asteroid ${neo.name.replace(/[()]/g, '')}, ${haz ? 'hazardous' : 'safe'}, ${avg.toFixed(0)} meters, ${missLD.toFixed(1)} lunar distances.`}
      onClick={() => onToggle(neo.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(neo.id); } }}
    >
      <div className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${haz ? "bg-red-500/10 border border-red-500/30" : "bg-accent-green/10 border border-accent-green/30"}`}>
          {haz ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Shield className="w-5 h-5 text-emerald-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-bold text-white truncate">{neo.name.replace(/[()]/g, "")}</span>
            {haz && <span className="px-2 py-0.5 rounded-full text-[9px] font-micro bg-red-500/15 text-red-400 border border-red-500/30 uppercase">Hazardous</span>}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-micro border uppercase ${threat.bg} ${threat.color}`}>{threat.level}</span>
          </div>
          <span className="text-[11px] text-space-500">Mag: {neo.absolute_magnitude_h.toFixed(1)} · {getSizeComparison(avg)}</span>
        </div>
        <div className="flex items-center gap-6 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-space-300"><Ruler className="w-3.5 h-3.5 text-accent-blue" /><span className="font-mono">{avg.toFixed(0)}m</span></div>
          <div className="flex items-center gap-1.5 text-space-300"><Crosshair className="w-3.5 h-3.5 text-accent-purple" /><span className="font-mono">{missLD.toFixed(2)} LD</span></div>
          <div className="flex items-center gap-1.5 text-space-300"><Gauge className="w-3.5 h-3.5 text-accent-cyan" /><span className="font-mono">{formatWithCommas(vel)} km/h</span></div>
          <ChevronDown className={`w-4 h-4 text-space-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className={`border-t ${haz ? "border-red-500/10" : "border-white/5"}`}>
            <div className={`p-5 pt-4 ${haz ? "bg-red-500/[0.02]" : "bg-white/[0.01]"}`}>
              <ThreatBadge icon={Shield} level={threat.level} description={threat.desc} color={threat.color} bgClasses={threat.bg} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-5">
                <div><div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Diameter Range</div><div className="text-white font-mono">{dMin.toFixed(1)}m — {dMax.toFixed(1)}m</div><div className="text-[10px] text-space-500 mt-0.5">{getSizeComparison(avg)}</div></div>
                <div><div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Miss Distance</div><div className="text-white font-mono">{(missKm / 1e6).toFixed(3)}M km</div><div className="text-[10px] text-space-500 mt-0.5">{missLD.toFixed(2)} LD · {missAU.toFixed(6)} AU</div></div>
                <div><div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Velocity</div><div className="text-white font-mono">{velS.toFixed(2)} km/s</div><div className="text-[10px] text-space-500 mt-0.5">{formatWithCommas(vel)} km/h</div></div>
                <div><div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Close Approach</div><div className="text-white font-mono">{ap?.close_approach_date || "—"}</div><div className="text-[10px] text-space-500 mt-0.5">Orbiting: {ap?.orbiting_body || "Earth"}</div></div>
              </div>
              <div className="mb-5">
                <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Proximity to Earth</div>
                <div className="flex items-center gap-3">
                  <Globe2 className="w-4 h-4 text-accent-blue shrink-0" />
                  <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${missLD < PROXIMITY_BAR_COLORS.CLOSE ? "bg-red-500" : missLD < PROXIMITY_BAR_COLORS.MEDIUM ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${barFill}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-space-400 w-14 text-right">{missLD.toFixed(1)} LD</span>
                  <Orbit className="w-4 h-4 text-space-500 shrink-0" />
                </div>
              </div>
              {neo.nasa_jpl_url && (
                <a href={neo.nasa_jpl_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]" onClick={e => e.stopPropagation()}>
                  <ExternalLink className="w-3 h-3" /> View on NASA JPL
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
