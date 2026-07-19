"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Shield, Crosshair, Ruler, Gauge, Calendar,
  ChevronLeft, ChevronRight, ChevronDown, ExternalLink, Info,
  Target, Orbit, Globe2
} from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";
import { createLogger } from "@/lib/logger";

const log = createLogger("AsteroidWatch");

interface NeoObject {
  id: string;
  name: string;
  nasa_jpl_url?: string;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date_full: string;
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: string; kilometers_per_second: string };
    miss_distance: { astronomical: string; kilometers: string; lunar: string; miles: string };
    orbiting_body: string;
  }[];
  absolute_magnitude_h: number;
  is_sentry_object?: boolean;
}

function getSizeComparison(m: number): string {
  if (m < 1) return "Smaller than a car";
  if (m < 10) return "Size of a bus";
  if (m < 25) return "Size of a house";
  if (m < 50) return "Statue of Liberty scale";
  if (m < 100) return "Football field scale";
  if (m < 300) return "Skyscraper scale";
  return "Mountain scale";
}

function getThreatInfo(hazardous: boolean, lunar: number) {
  if (hazardous && lunar < 5) return { level: "HIGH", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", desc: "Close approach — potentially hazardous" };
  if (hazardous) return { level: "MODERATE", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", desc: "Potentially Hazardous Asteroid (PHA)" };
  if (lunar < 10) return { level: "WATCH", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", desc: "Within 10 lunar distances" };
  return { level: "SAFE", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", desc: "No threat — safe distance" };
}

export default function AsteroidWatch() {
  const [asteroids, setAsteroids] = useState<NeoObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentDate = new Date(Date.now() + dateOffset * 86400000);
  const dateStr = currentDate.toISOString().split("T")[0];

  const fetchNeo = useCallback(async () => {
    setLoading(true); setError(false); setExpandedId(null);
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
    } catch (err) { log.error("Failed to fetch NEO data", { error: String(err), date: dateStr }); setError(true); }
    finally { setLoading(false); }
  }, [dateStr]);

  useEffect(() => { fetchNeo(); }, [fetchNeo]);

  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
  const closestLD = asteroids[0] ? parseFloat(asteroids[0].close_approach_data[0]?.miss_distance?.lunar || "0").toFixed(1) : "—";

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/asteroid-banner.png" alt="Near-Earth Asteroid" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30 mb-3">
            <AlertTriangle className="w-3 h-3" /> Planetary Defense
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-white tracking-widest">ASTEROID WATCH</h3>
          <p className="text-space-400 text-sm mt-1 max-w-md">Near-Earth Objects tracked by NASA JPL&apos;s Center for Near Earth Object Studies</p>
        </div>
      </div>

      <NasaImageBanner query="asteroid near earth OSIRIS-REx" count={6} title="NASA Asteroid Imagery" cols={6} />

      {/* Educational Info */}
      <div className="glass-card p-5 mb-8 border border-red-500/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Understanding Near-Earth Objects</h4>
            <p className="text-xs text-space-400 leading-relaxed">
              <strong className="text-space-300">NEOs</strong> orbit within 1.3 AU of the Sun.{" "}
              <strong className="text-space-300">PHAs</strong> are objects &gt;140m passing within 0.05 AU of Earth.{" "}
              <strong className="text-space-300">1 Lunar Distance (LD)</strong> = 384,400 km. Objects within 5 LD receive heightened monitoring by NASA&apos;s Planetary Defense Coordination Office.
            </p>
          </div>
        </div>
      </div>

      {/* Date nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-space-400">Showing objects for selected date</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDateOffset(p => p - 1)} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all text-space-400 hover:text-white cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-mono text-white px-4 py-2 rounded-lg bg-white/5 border border-white/10 min-w-[130px] text-center">
            {currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button onClick={() => setDateOffset(p => Math.min(p + 1, 7))} className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all text-space-400 hover:text-white cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 text-center border border-accent-blue/20">
          <Target className="w-5 h-5 mx-auto mb-2 text-accent-blue" />
          <div className="text-3xl font-bold gradient-text">{asteroids.length}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Objects Tracked</div>
        </div>
        <div className={`glass-card p-5 text-center border ${hazardousCount > 0 ? "border-red-500/30" : "border-accent-green/20"}`}>
          <AlertTriangle className={`w-5 h-5 mx-auto mb-2 ${hazardousCount > 0 ? "text-red-400" : "text-emerald-400"}`} />
          <div className={`text-3xl font-bold ${hazardousCount > 0 ? "text-red-400" : "text-emerald-400"}`}>{hazardousCount}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Hazardous</div>
        </div>
        <div className="glass-card p-5 text-center border border-accent-purple/20">
          <Shield className="w-5 h-5 mx-auto mb-2 text-accent-purple" />
          <div className="text-3xl font-bold text-accent-purple">{asteroids.length - hazardousCount}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Safe</div>
        </div>
        <div className="glass-card p-5 text-center border border-accent-cyan/20">
          <Crosshair className="w-5 h-5 mx-auto mb-2 text-accent-cyan" />
          <div className="text-3xl font-bold text-accent-cyan">{closestLD}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Closest (LD)</div>
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-t-2 border-accent-blue rounded-full animate-spin" /></div>}
      {error && <div className="text-center py-16 text-space-400"><AlertTriangle className="w-8 h-8 mx-auto mb-3 text-red-400" /><p>Failed to load asteroid data.</p></div>}

      {!loading && !error && (
        <div className="space-y-3">
          <AnimatePresence>
            {asteroids.slice(0, 20).map((neo, i) => {
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
              const exp = expandedId === neo.id;
              const threat = getThreatInfo(haz, missLD);
              const barFill = Math.max(5, Math.min(100, ((50 - Math.min(missLD, 50)) / 50) * 100));

              return (
                <motion.div key={neo.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`glass-card overflow-hidden cursor-pointer transition-all ${haz ? "border-red-500/30 hover:border-red-500/50" : "border-space-500/20 hover:border-white/30"}`}
                  role="button"
                  tabIndex={0}
                  aria-expanded={exp}
                  aria-label={`Asteroid ${neo.name.replace(/[()]/g, '')}, ${haz ? 'hazardous' : 'safe'}, ${avg.toFixed(0)} meters, ${missLD.toFixed(1)} lunar distances. Click to ${exp ? 'collapse' : 'expand'}.`}
                  onClick={() => setExpandedId(exp ? null : neo.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(exp ? null : neo.id); } }}
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
                      <div className="flex items-center gap-1.5 text-space-300"><Gauge className="w-3.5 h-3.5 text-accent-cyan" /><span className="font-mono">{vel.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km/h</span></div>
                      <ChevronDown className={`w-4 h-4 text-space-500 transition-transform ${exp ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {exp && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className={`border-t ${haz ? "border-red-500/10" : "border-white/5"}`}>
                        <div className={`p-5 pt-4 ${haz ? "bg-red-500/[0.02]" : "bg-white/[0.01]"}`}>
                          {/* Threat badge */}
                          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-5 ${threat.bg}`}>
                            <Shield className={`w-4 h-4 ${threat.color}`} />
                            <span className={`text-xs font-bold ${threat.color}`}>Threat: {threat.level}</span>
                            <span className="text-xs text-space-400 ml-2">{threat.desc}</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-5">
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Diameter Range</div>
                              <div className="text-white font-mono">{dMin.toFixed(1)}m — {dMax.toFixed(1)}m</div>
                              <div className="text-[10px] text-space-500 mt-0.5">{getSizeComparison(avg)}</div>
                            </div>
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Miss Distance</div>
                              <div className="text-white font-mono">{(missKm / 1e6).toFixed(3)}M km</div>
                              <div className="text-[10px] text-space-500 mt-0.5">{missLD.toFixed(2)} LD · {missAU.toFixed(6)} AU</div>
                            </div>
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Velocity</div>
                              <div className="text-white font-mono">{velS.toFixed(2)} km/s</div>
                              <div className="text-[10px] text-space-500 mt-0.5">{vel.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km/h</div>
                            </div>
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Close Approach</div>
                              <div className="text-white font-mono">{ap?.close_approach_date || "—"}</div>
                              <div className="text-[10px] text-space-500 mt-0.5">Orbiting: {ap?.orbiting_body || "Earth"}</div>
                            </div>
                          </div>

                          {/* Proximity bar */}
                          <div className="mb-5">
                            <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Proximity to Earth</div>
                            <div className="flex items-center gap-3">
                              <Globe2 className="w-4 h-4 text-accent-blue shrink-0" />
                              <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                                <div className={`h-full rounded-full ${missLD < 5 ? "bg-red-500" : missLD < 15 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${barFill}%` }} />
                              </div>
                              <span className="text-[10px] font-mono text-space-400 w-14 text-right">{missLD.toFixed(1)} LD</span>
                              <Orbit className="w-4 h-4 text-space-500 shrink-0" />
                            </div>
                          </div>

                          {neo.nasa_jpl_url && (
                            <a href={neo.nasa_jpl_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]"
                              onClick={e => e.stopPropagation()}>
                              <ExternalLink className="w-3 h-3" /> View on NASA JPL
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
