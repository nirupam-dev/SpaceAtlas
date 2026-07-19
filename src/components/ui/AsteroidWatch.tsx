"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Crosshair, Ruler, Gauge, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface NeoObject {
  id: string;
  name: string;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date_full: string;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string; lunar: string };
  }[];
  absolute_magnitude_h: number;
}

export default function AsteroidWatch() {
  const [asteroids, setAsteroids] = useState<NeoObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);

  const currentDate = new Date(Date.now() + dateOffset * 86400000);
  const dateStr = currentDate.toISOString().split("T")[0];

  const fetchNeo = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/neo?start_date=${dateStr}&end_date=${dateStr}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const allNeos: NeoObject[] = Object.values(data.near_earth_objects || {}).flat() as NeoObject[];
      allNeos.sort((a, b) =>
        parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || "0") -
        parseFloat(b.close_approach_data[0]?.miss_distance?.kilometers || "0")
      );
      setAsteroids(allNeos);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { fetchNeo(); }, [fetchNeo]);

  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;

  return (
    <div>
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-display text-white tracking-widest">ASTEROID WATCH</h3>
          <p className="text-space-400 text-sm mt-1">Near-Earth Objects tracked by NASA JPL</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDateOffset(p => p - 1)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all text-space-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-mono text-white px-4 py-2 rounded-lg bg-white/5 border border-white/10 min-w-[130px] text-center">
            {currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button onClick={() => setDateOffset(p => Math.min(p + 1, 7))} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all text-space-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 text-center border border-accent-blue/20">
          <div className="text-3xl font-bold gradient-text">{asteroids.length}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Objects Tracked</div>
        </div>
        <div className={`glass-card p-5 text-center border ${hazardousCount > 0 ? "border-red-500/30" : "border-accent-green/20"}`}>
          <div className={`text-3xl font-bold ${hazardousCount > 0 ? "text-red-400" : "text-emerald-400"}`}>{hazardousCount}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Hazardous</div>
        </div>
        <div className="glass-card p-5 text-center border border-accent-purple/20">
          <div className="text-3xl font-bold text-accent-purple">{asteroids.length - hazardousCount}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Safe Objects</div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-t-2 border-accent-blue rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-space-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-red-400" />
          <p>Failed to load asteroid data. Try again later.</p>
        </div>
      )}

      {/* Asteroid list */}
      {!loading && !error && (
        <div className="space-y-3">
          <AnimatePresence>
            {asteroids.slice(0, 15).map((neo, i) => {
              const approach = neo.close_approach_data[0];
              const diamMin = neo.estimated_diameter.meters.estimated_diameter_min;
              const diamMax = neo.estimated_diameter.meters.estimated_diameter_max;
              const avgDiam = ((diamMin + diamMax) / 2).toFixed(0);
              const missKm = parseFloat(approach?.miss_distance?.kilometers || "0");
              const missLunar = parseFloat(approach?.miss_distance?.lunar || "0").toFixed(2);
              const velocity = parseFloat(approach?.relative_velocity?.kilometers_per_hour || "0").toFixed(0);
              const isHazardous = neo.is_potentially_hazardous_asteroid;

              return (
                <motion.div
                  key={neo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`glass-card p-5 flex flex-col md:flex-row items-start md:items-center gap-4 ${isHazardous ? "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.05)]" : "border-space-500/20"}`}
                >
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isHazardous ? "bg-red-500/10 border border-red-500/30" : "bg-accent-green/10 border border-accent-green/30"}`}>
                    {isHazardous ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Shield className="w-5 h-5 text-emerald-400" />}
                  </div>

                  {/* Name + magnitude */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white truncate">{neo.name.replace(/[()]/g, "")}</span>
                      {isHazardous && <span className="px-2 py-0.5 rounded-full text-[9px] font-micro bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-widest">Hazardous</span>}
                    </div>
                    <span className="text-[11px] text-space-500">Magnitude: {neo.absolute_magnitude_h.toFixed(1)}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-1.5 text-space-300">
                      <Ruler className="w-3.5 h-3.5 text-accent-blue" />
                      <span className="font-mono">{avgDiam}m</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-space-300">
                      <Crosshair className="w-3.5 h-3.5 text-accent-purple" />
                      <span className="font-mono">{missLunar} LD</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-space-300">
                      <Gauge className="w-3.5 h-3.5 text-accent-cyan" />
                      <span className="font-mono">{parseInt(velocity).toLocaleString()} km/h</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-1.5 text-space-300">
                      <Calendar className="w-3.5 h-3.5 text-accent-amber" />
                      <span className="font-mono">{(missKm / 1000000).toFixed(2)}M km</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
