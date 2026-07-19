"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Calendar, Ruler, Thermometer, Orbit, Search, Telescope, ChevronDown, Info, ExternalLink, Globe2, Droplets } from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";
import { useExoplanets } from "@/lib/hooks/use-space-query";
import Image from "next/image";

interface Exoplanet {
  pl_name: string;
  hostname: string;
  disc_year: number;
  discoverymethod: string;
  pl_orbper: number | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  st_spectype: string | null;
  sy_dist: number | null;
  sy_snum: number | null;
  sy_pnum: number | null;
}

const methodColors: Record<string, string> = {
  "Transit": "text-accent-blue bg-accent-blue/10 border-accent-blue/30",
  "Radial Velocity": "text-accent-purple bg-accent-purple/10 border-accent-purple/30",
  "Imaging": "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30",
  "Microlensing": "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
};

function getPlanetGradient(name: string): string {
  const gradients = [
    "from-blue-600 via-cyan-500 to-teal-400",
    "from-purple-600 via-pink-500 to-rose-400",
    "from-amber-600 via-orange-500 to-red-400",
    "from-emerald-600 via-green-500 to-lime-400",
    "from-indigo-600 via-violet-500 to-purple-400",
    "from-cyan-600 via-blue-500 to-indigo-400",
    "from-rose-600 via-pink-500 to-fuchsia-400",
    "from-teal-600 via-emerald-500 to-green-400",
  ];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

function getPlanetType(rade: number | null, masse: number | null): { type: string; desc: string; color: string } {
  if (!rade) return { type: "Unknown", desc: "Insufficient data for classification", color: "text-space-400" };
  if (rade < 1.25) return { type: "Terrestrial", desc: "Rocky planet similar to Earth or Mars", color: "text-emerald-400" };
  if (rade < 2) return { type: "Super-Earth", desc: "Larger than Earth but smaller than Neptune", color: "text-cyan-400" };
  if (rade < 4) return { type: "Sub-Neptune", desc: "Mini gas giant with thick atmosphere", color: "text-blue-400" };
  if (rade < 6) return { type: "Neptune-like", desc: "Ice giant similar to Neptune or Uranus", color: "text-indigo-400" };
  if (rade < 15) return { type: "Gas Giant", desc: "Jupiter-scale gas giant", color: "text-amber-400" };
  return { type: "Super-Jupiter", desc: "Massive gas giant exceeding Jupiter", color: "text-red-400" };
}

function getHabitability(eqt: number | null, rade: number | null): { score: string; color: string; desc: string } {
  if (!eqt || !rade) return { score: "Unknown", color: "text-space-500", desc: "Insufficient temperature/size data" };
  const inHZ = eqt >= 200 && eqt <= 320;
  const rightSize = rade >= 0.5 && rade <= 2.5;
  if (inHZ && rightSize) return { score: "High", color: "text-emerald-400", desc: "Temperate zone, Earth-like size — potential for liquid water" };
  if (inHZ) return { score: "Moderate", color: "text-yellow-400", desc: "In habitable zone but unusual size" };
  if (rightSize && eqt < 200) return { score: "Low (Cold)", color: "text-blue-400", desc: "Right size but too cold for liquid water" };
  if (rightSize && eqt > 320) return { score: "Low (Hot)", color: "text-orange-400", desc: "Right size but too hot for liquid water" };
  return { score: "Unlikely", color: "text-red-400", desc: "Outside habitable parameters" };
}

export default function ExoplanetExplorer() {
  const { data, isLoading: loading } = useExoplanets(100);
  const planets = (Array.isArray(data) ? data : []) as Exoplanet[];
  const [search, setSearch] = useState("");
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const filtered = planets.filter(p =>
    p.pl_name.toLowerCase().includes(search.toLowerCase()) ||
    p.hostname?.toLowerCase().includes(search.toLowerCase()) ||
    p.discoverymethod?.toLowerCase().includes(search.toLowerCase())
  );

  const methods = planets.reduce<Record<string, number>>((acc, p) => {
    const m = p.discoverymethod || "Unknown";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
                <Image src="/exoplanet-scene.png" alt="Exoplanet orbiting a distant star" fill className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest bg-accent-purple/10 text-accent-purple border border-accent-purple/30 mb-3">
            <Star className="w-3 h-3" /> NASA Exoplanet Archive
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-white tracking-widest">EXOPLANET EXPLORER</h3>
          <p className="text-space-400 text-sm mt-1 max-w-md">Confirmed worlds orbiting distant stars — from NASA&apos;s Exoplanet Archive</p>
        </div>
      </div>

      <NasaImageBanner query="exoplanet artist concept JWST" count={6} title="NASA Exoplanet Imagery" cols={6} />

      {/* Educational Info */}
      <div className="glass-card p-5 mb-8 border border-accent-purple/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-accent-purple shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Understanding Exoplanets</h4>
            <p className="text-xs text-space-400 leading-relaxed">
              <strong className="text-space-300">Exoplanets</strong> are worlds orbiting stars beyond our Sun. Over 5,700 have been confirmed.{" "}
              <strong className="text-space-300">R⊕</strong> = Earth radii (planet size vs Earth).{" "}
              <strong className="text-space-300">M⊕</strong> = Earth masses. The{" "}
              <strong className="text-space-300">habitable zone</strong> is where liquid water could exist (200–320 K surface temperature).
              Planets are classified as Terrestrial, Super-Earth, Sub-Neptune, Neptune-like, or Gas Giant based on radius.
            </p>
          </div>
        </div>
      </div>

      {/* Search + Method chips */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(methods).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([method, count]) => (
            <span key={method} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-micro uppercase tracking-widest border ${methodColors[method] || "text-space-400 bg-white/5 border-white/10"}`}>
              <Telescope className="w-3 h-3" />
              {method}: {count}
            </span>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search planets, stars, methods..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-space-500 focus:outline-none focus:border-accent-blue/40 transition-colors" />
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-t-2 border-accent-purple rounded-full animate-spin" /></div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 30).map((planet, i) => {
            const methodColor = methodColors[planet.discoverymethod] || "text-space-400 bg-white/5 border-white/10";
            const gradient = getPlanetGradient(planet.pl_name);
            const isExpanded = expandedName === planet.pl_name;
            const pType = getPlanetType(planet.pl_rade, planet.pl_bmasse);
            const hab = getHabitability(planet.pl_eqt, planet.pl_rade);

            return (
              <motion.div
                key={planet.pl_name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="glass-card overflow-hidden hover:border-accent-purple/30 transition-all duration-300 group cursor-pointer"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Exoplanet ${planet.pl_name}, host star ${planet.hostname}, ${pType.type}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
                onClick={() => setExpandedName(isExpanded ? null : planet.pl_name)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedName(isExpanded ? null : planet.pl_name); } }}
              >
                {/* Visual planet */}
                <div className="relative h-28 overflow-hidden bg-gradient-to-b from-black/40 to-transparent">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} shadow-[0_0_40px_rgba(56,189,248,0.15)] group-hover:scale-110 transition-transform duration-500 relative`}>
                      <div className="absolute -inset-1 rounded-full border border-white/10" />
                      <div className="absolute inset-2 rounded-full bg-black/10" />
                      <div className="absolute top-3 left-4 w-4 h-3 rounded-full bg-white/10 blur-sm" />
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `radial-gradient(1px 1px at 15% 20%, white, transparent),
                                     radial-gradient(1px 1px at 80% 30%, white, transparent),
                                     radial-gradient(1px 1px at 40% 70%, white, transparent),
                                     radial-gradient(1px 1px at 90% 80%, white, transparent)`,
                  }} />
                  {/* Planet type badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-micro uppercase tracking-widest bg-black/40 backdrop-blur-md border border-white/10 ${pType.color}`}>{pType.type}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{planet.pl_name}</h4>
                      <p className="text-[11px] text-space-500 mt-0.5">Host: {planet.hostname}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-micro border uppercase tracking-widest ${methodColor}`}>{planet.discoverymethod}</span>
                      <ChevronDown className={`w-4 h-4 text-space-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-space-700">
                    {planet.disc_year && <div className="flex items-center gap-1.5 text-xs text-space-300"><Calendar className="w-3 h-3 text-accent-blue" /><span className="font-mono">{planet.disc_year}</span></div>}
                    {planet.pl_rade && <div className="flex items-center gap-1.5 text-xs text-space-300"><Ruler className="w-3 h-3 text-accent-cyan" /><span className="font-mono">{planet.pl_rade.toFixed(1)} R⊕</span></div>}
                    {planet.pl_eqt && <div className="flex items-center gap-1.5 text-xs text-space-300"><Thermometer className="w-3 h-3 text-accent-amber" /><span className="font-mono">{planet.pl_eqt.toFixed(0)} K</span></div>}
                    {planet.pl_orbper && <div className="flex items-center gap-1.5 text-xs text-space-300"><Orbit className="w-3 h-3 text-accent-purple" /><span className="font-mono">{planet.pl_orbper.toFixed(1)} d</span></div>}
                    {planet.sy_dist && <div className="flex items-center gap-1.5 text-xs text-space-300"><Star className="w-3 h-3 text-accent-pink" /><span className="font-mono">{planet.sy_dist.toFixed(0)} pc</span></div>}
                    {planet.pl_bmasse && <div className="flex items-center gap-1.5 text-xs text-space-300"><Globe2 className="w-3 h-3 text-accent-green" /><span className="font-mono">{planet.pl_bmasse.toFixed(1)} M⊕</span></div>}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-accent-purple/10">
                      <div className="p-5 pt-4 bg-accent-purple/[0.02]">
                        {/* Planet Classification */}
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 bg-white/[0.02] border-white/10`}>
                          <Globe2 className={`w-4 h-4 ${pType.color}`} />
                          <span className={`text-xs font-bold ${pType.color}`}>{pType.type}</span>
                          <span className="text-xs text-space-400 ml-2">{pType.desc}</span>
                        </div>

                        {/* Habitability Assessment */}
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 bg-white/[0.02] border-white/10`}>
                          <Droplets className={`w-4 h-4 ${hab.color}`} />
                          <span className={`text-xs font-bold ${hab.color}`}>Habitability: {hab.score}</span>
                          <span className="text-xs text-space-400 ml-2">{hab.desc}</span>
                        </div>

                        {/* Detailed Data */}
                        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Host Star</div>
                            <div className="text-white font-mono">{planet.hostname}</div>
                            {planet.st_spectype && <div className="text-[10px] text-space-500 mt-0.5">Spectral type: {planet.st_spectype}</div>}
                          </div>
                          <div>
                            <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Star System</div>
                            <div className="text-white font-mono">{planet.sy_snum || "?"} stars, {planet.sy_pnum || "?"} planets</div>
                          </div>
                          {planet.pl_rade && (
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Radius vs Earth</div>
                              <div className="text-white font-mono">{planet.pl_rade.toFixed(2)} × Earth</div>
                              <div className="text-[10px] text-space-500 mt-0.5">{(planet.pl_rade * 6371).toFixed(0)} km</div>
                            </div>
                          )}
                          {planet.pl_bmasse && (
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Mass vs Earth</div>
                              <div className="text-white font-mono">{planet.pl_bmasse.toFixed(2)} × Earth</div>
                            </div>
                          )}
                          {planet.pl_eqt && (
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Temperature</div>
                              <div className="text-white font-mono">{planet.pl_eqt.toFixed(0)} K ({(planet.pl_eqt - 273.15).toFixed(0)}°C)</div>
                            </div>
                          )}
                          {planet.sy_dist && (
                            <div>
                              <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Distance</div>
                              <div className="text-white font-mono">{planet.sy_dist.toFixed(1)} parsecs</div>
                              <div className="text-[10px] text-space-500 mt-0.5">{(planet.sy_dist * 3.26).toFixed(1)} light-years</div>
                            </div>
                          )}
                        </div>

                        <a href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.pl_name)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]"
                          onClick={e => e.stopPropagation()}>
                          <ExternalLink className="w-3 h-3" /> View on NASA Exoplanet Archive
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
