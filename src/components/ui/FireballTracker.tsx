"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin, Calendar, Gauge, ChevronDown, ExternalLink, Info, Flame, Mountain, Globe2 } from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";

interface Fireball {
  date: string;
  lat: string | null;
  "lat-dir": string | null;
  lon: string | null;
  "lon-dir": string | null;
  energy: string | null;
  "impact-e": string | null;
  vel: string | null;
  alt: string | null;
  vx?: string | null;
  vy?: string | null;
  vz?: string | null;
}

function getImpactScale(kt: number): { label: string; color: string; desc: string } {
  if (kt >= 100) return { label: "Catastrophic", color: "text-red-400", desc: "Equivalent to a major nuclear weapon — could cause widespread destruction" };
  if (kt >= 10) return { label: "Significant", color: "text-orange-400", desc: "Comparable to a tactical nuclear device — would cause local devastation" };
  if (kt >= 1) return { label: "Notable", color: "text-amber-400", desc: "Significant airburst — powerful enough to shatter windows for miles" };
  if (kt >= 0.1) return { label: "Minor", color: "text-yellow-400", desc: "Bright fireball with audible sonic boom — minimal ground damage" };
  return { label: "Small", color: "text-cyan-400", desc: "Typical bright meteor — burns up harmlessly in the atmosphere" };
}

function getAltitudeDesc(alt: number): string {
  if (alt > 60) return "Mesosphere — high-altitude breakup";
  if (alt > 40) return "Stratosphere — moderate altitude event";
  if (alt > 20) return "Lower stratosphere — significant penetration";
  return "Troposphere — very deep atmospheric entry";
}

export default function FireballTracker() {
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/fireballs")
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          const fields = data.fields as string[];
          const mapped: Fireball[] = (data.data as string[][]).map(row => {
            const obj: Record<string, string | null> = {};
            fields.forEach((f: string, i: number) => { obj[f] = row[i]; });
            return obj as unknown as Fireball;
          });
          setFireballs(mapped.slice(0, 30));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Stats
  const totalEnergy = fireballs.reduce((acc, fb) => acc + (fb["impact-e"] ? parseFloat(fb["impact-e"]) : 0), 0);
  const maxImpact = Math.max(...fireballs.map(fb => fb["impact-e"] ? parseFloat(fb["impact-e"]) : 0), 0);
  const avgVel = fireballs.filter(fb => fb.vel).length > 0
    ? (fireballs.reduce((acc, fb) => acc + (fb.vel ? parseFloat(fb.vel) : 0), 0) / fireballs.filter(fb => fb.vel).length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-t-2 border-accent-amber rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fireball-meteor.png" alt="Fireball meteor streaking across the sky" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
            <Zap className="w-3 h-3" /> NASA CNEOS
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-white tracking-widest">FIREBALL TRACKER</h3>
          <p className="text-space-400 text-sm mt-1 max-w-md">Meteor and bolide impacts detected by US government sensors worldwide</p>
        </div>
        <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-amber-500/30">
          <span className="text-[10px] font-micro text-amber-400 uppercase tracking-widest">{fireballs.length} Events</span>
        </div>
      </div>

      <NasaImageBanner query="meteor bolide fireball atmosphere" count={6} title="NASA Meteor Imagery" cols={6} />

      {/* Educational Info */}
      <div className="glass-card p-5 mb-8 border border-amber-500/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Understanding Fireballs & Bolides</h4>
            <p className="text-xs text-space-400 leading-relaxed">
              <strong className="text-space-300">Fireballs</strong> are exceptionally bright meteors (brighter than Venus, magnitude −4).{" "}
              <strong className="text-space-300">Bolides</strong> are fireballs that explode in the atmosphere with a visible flash.{" "}
              <strong className="text-space-300">Impact energy</strong> is measured in kilotons (kT) of TNT equivalent.
              For reference, the 2013 Chelyabinsk event was ~440 kT. NASA&apos;s CNEOS records all events detected by US government sensors.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 text-center border border-amber-500/20">
          <Flame className="w-5 h-5 mx-auto mb-2 text-amber-400" />
          <div className="text-3xl font-bold gradient-text">{fireballs.length}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Events</div>
        </div>
        <div className="glass-card p-5 text-center border border-orange-500/20">
          <Zap className="w-5 h-5 mx-auto mb-2 text-orange-400" />
          <div className="text-3xl font-bold text-orange-400">{totalEnergy.toFixed(1)}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Total kT</div>
        </div>
        <div className="glass-card p-5 text-center border border-red-500/20">
          <Mountain className="w-5 h-5 mx-auto mb-2 text-red-400" />
          <div className="text-3xl font-bold text-red-400">{maxImpact.toFixed(2)}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Max kT</div>
        </div>
        <div className="glass-card p-5 text-center border border-cyan-500/20">
          <Gauge className="w-5 h-5 mx-auto mb-2 text-cyan-400" />
          <div className="text-3xl font-bold text-cyan-400">{avgVel}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest mt-1">Avg km/s</div>
        </div>
      </div>

      <div className="space-y-3">
        {fireballs.map((fb, i) => {
          const energy = fb.energy ? parseFloat(fb.energy) : null;
          const impactE = fb["impact-e"] ? parseFloat(fb["impact-e"]) : null;
          const velocity = fb.vel ? parseFloat(fb.vel) : null;
          const altitude = fb.alt ? parseFloat(fb.alt) : null;
          const lat = fb.lat ? `${fb.lat}° ${fb["lat-dir"] || ""}` : null;
          const lon = fb.lon ? `${fb.lon}° ${fb["lon-dir"] || ""}` : null;
          const isLarge = (impactE && impactE > 1) || (energy && energy > 1e11);
          const isExpanded = expandedIdx === i;
          const impact = impactE ? getImpactScale(impactE) : null;

          // Energy bar visualization
          const maxE = Math.max(...fireballs.map(f => f["impact-e"] ? parseFloat(f["impact-e"]) : 0), 0.01);
          const barWidth = impactE ? Math.max(5, (impactE / maxE) * 100) : 0;

          return (
            <motion.div
              key={`${fb.date}-${i}`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className={`glass-card overflow-hidden cursor-pointer transition-all ${isLarge ? "border-amber-500/30 hover:border-amber-500/50" : "border-space-500/20 hover:border-white/30"}`}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
            >
              <div className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLarge ? "bg-amber-500/15 border border-amber-500/30" : "bg-white/5 border border-white/10"}`}>
                  <Zap className={`w-5 h-5 ${isLarge ? "text-amber-400" : "text-space-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent-blue" />
                      {new Date(fb.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {isLarge && <span className="px-2 py-0.5 rounded-full text-[9px] font-micro bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">Major</span>}
                    {impact && <span className={`px-2 py-0.5 rounded-full text-[9px] font-micro bg-white/5 border border-white/10 uppercase ${impact.color}`}>{impact.label}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-space-500 flex-wrap">
                    {lat && lon && <span className="flex items-center gap-1 font-mono"><MapPin className="w-3 h-3" /> {lat}, {lon}</span>}
                    {velocity && <span className="flex items-center gap-1 font-mono"><Gauge className="w-3 h-3" /> {velocity.toFixed(1)} km/s</span>}
                    {impactE && <span className="flex items-center gap-1 font-mono text-amber-400/70"><Zap className="w-3 h-3" /> {impactE.toFixed(2)} kT</span>}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-amber-500/10">
                    <div className={`p-5 pt-4 ${isLarge ? "bg-amber-500/[0.02]" : "bg-white/[0.01]"}`}>
                      {/* Impact scale badge */}
                      {impact && (
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 bg-white/[0.02] border-white/10`}>
                          <Zap className={`w-4 h-4 ${impact.color}`} />
                          <span className={`text-xs font-bold ${impact.color}`}>Impact: {impact.label}</span>
                          <span className="text-xs text-space-400 ml-2">{impact.desc}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                        <div>
                          <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Date & Time</div>
                          <div className="text-white font-mono">{new Date(fb.date).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        {lat && lon && (
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Location</div>
                            <div className="text-white font-mono">{lat}, {lon}</div>
                          </div>
                        )}
                        {velocity && (
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Entry Velocity</div>
                            <div className="text-white font-mono">{velocity.toFixed(1)} km/s</div>
                            <div className="text-[10px] text-space-500 mt-0.5">{(velocity * 3600).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km/h</div>
                          </div>
                        )}
                        {altitude && (
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Peak Brightness Alt.</div>
                            <div className="text-white font-mono">{altitude.toFixed(1)} km</div>
                            <div className="text-[10px] text-space-500 mt-0.5">{getAltitudeDesc(altitude)}</div>
                          </div>
                        )}
                        {energy && (
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Radiated Energy</div>
                            <div className="text-white font-mono">{energy.toExponential(2)} J</div>
                          </div>
                        )}
                        {impactE && (
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Impact Energy</div>
                            <div className="text-amber-400 font-mono font-bold">{impactE.toFixed(3)} kT TNT</div>
                          </div>
                        )}
                      </div>

                      {/* Energy bar */}
                      {impactE && (
                        <div className="mb-4">
                          <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Relative Impact Energy</div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                              <div className={`h-full rounded-full ${impactE > 10 ? "bg-red-500" : impactE > 1 ? "bg-amber-500" : "bg-cyan-500"}`}
                                style={{ width: `${barWidth}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-space-400 w-16 text-right">{impactE.toFixed(2)} kT</span>
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex items-center gap-4">
                        {fb.lat && fb.lon && (
                          <a href={`https://www.google.com/maps?q=${fb.lat}${fb["lat-dir"] === "S" ? "-" : ""},${fb.lon}${fb["lon-dir"] === "W" ? "-" : ""}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]"
                            onClick={e => e.stopPropagation()}>
                            <Globe2 className="w-3 h-3" /> View Location
                          </a>
                        )}
                        <a href="https://cneos.jpl.nasa.gov/fireballs/" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]"
                          onClick={e => e.stopPropagation()}>
                          <ExternalLink className="w-3 h-3" /> NASA CNEOS Database
                        </a>
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
