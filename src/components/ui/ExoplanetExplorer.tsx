"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, Ruler, Thermometer, Orbit, Search, Telescope } from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";

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

// Assign a deterministic gradient to each planet based on name hash
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

export default function ExoplanetExplorer() {
  const [planets, setPlanets] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/exoplanets?limit=100")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPlanets(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/exoplanet-scene.png"
          alt="Exoplanet orbiting a distant star"
          className="w-full h-full object-cover"
        />
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

      {/* NASA Exoplanet Imagery */}
      <NasaImageBanner query="exoplanet artist concept JWST" count={6} title="NASA Exoplanet Imagery" cols={6} />

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
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search planets, stars, methods..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-space-500 focus:outline-none focus:border-accent-blue/40 transition-colors"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-t-2 border-accent-purple rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 30).map((planet, i) => {
            const methodColor = methodColors[planet.discoverymethod] || "text-space-400 bg-white/5 border-white/10";
            const gradient = getPlanetGradient(planet.pl_name);
            return (
              <motion.div
                key={planet.pl_name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="glass-card overflow-hidden hover:border-accent-purple/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Visual planet representation */}
                <div className="relative h-28 overflow-hidden bg-gradient-to-b from-black/40 to-transparent">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} shadow-[0_0_40px_rgba(56,189,248,0.15)] group-hover:scale-110 transition-transform duration-500 relative`}>
                      {/* Atmosphere ring */}
                      <div className="absolute -inset-1 rounded-full border border-white/10" />
                      {/* Surface detail */}
                      <div className="absolute inset-2 rounded-full bg-black/10" />
                      <div className="absolute top-3 left-4 w-4 h-3 rounded-full bg-white/10 blur-sm" />
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `radial-gradient(1px 1px at 15% 20%, white, transparent),
                                     radial-gradient(1px 1px at 80% 30%, white, transparent),
                                     radial-gradient(1px 1px at 40% 70%, white, transparent),
                                     radial-gradient(1px 1px at 90% 80%, white, transparent)`,
                  }} />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{planet.pl_name}</h4>
                      <p className="text-[11px] text-space-500 mt-0.5">Host: {planet.hostname}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-micro border uppercase tracking-widest ${methodColor}`}>
                      {planet.discoverymethod}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-space-700">
                    {planet.disc_year && (
                      <div className="flex items-center gap-1.5 text-xs text-space-300">
                        <Calendar className="w-3 h-3 text-accent-blue" />
                        <span className="font-mono">{planet.disc_year}</span>
                      </div>
                    )}
                    {planet.pl_rade && (
                      <div className="flex items-center gap-1.5 text-xs text-space-300">
                        <Ruler className="w-3 h-3 text-accent-cyan" />
                        <span className="font-mono">{planet.pl_rade.toFixed(1)} R⊕</span>
                      </div>
                    )}
                    {planet.pl_eqt && (
                      <div className="flex items-center gap-1.5 text-xs text-space-300">
                        <Thermometer className="w-3 h-3 text-accent-amber" />
                        <span className="font-mono">{planet.pl_eqt.toFixed(0)} K</span>
                      </div>
                    )}
                    {planet.pl_orbper && (
                      <div className="flex items-center gap-1.5 text-xs text-space-300">
                        <Orbit className="w-3 h-3 text-accent-purple" />
                        <span className="font-mono">{planet.pl_orbper.toFixed(1)} d</span>
                      </div>
                    )}
                    {planet.sy_dist && (
                      <div className="flex items-center gap-1.5 text-xs text-space-300">
                        <Star className="w-3 h-3 text-accent-pink" />
                        <span className="font-mono">{planet.sy_dist.toFixed(0)} pc</span>
                      </div>
                    )}
                    {planet.pl_bmasse && (
                      <div className="flex items-center gap-1.5 text-xs text-space-300">
                        <Ruler className="w-3 h-3 text-accent-green" />
                        <span className="font-mono">{planet.pl_bmasse.toFixed(1)} M⊕</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
