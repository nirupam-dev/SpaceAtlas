"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, Ruler, Thermometer, Orbit, Search, Telescope } from "lucide-react";

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

  // Stats
  const methods = planets.reduce<Record<string, number>>((acc, p) => {
    const m = p.discoverymethod || "Unknown";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-display text-white tracking-widest">EXOPLANET EXPLORER</h3>
          <p className="text-space-400 text-sm mt-1">Confirmed exoplanets from NASA Exoplanet Archive</p>
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

      {/* Discovery method chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(methods).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([method, count]) => (
          <span key={method} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-micro uppercase tracking-widest border ${methodColors[method] || "text-space-400 bg-white/5 border-white/10"}`}>
            <Telescope className="w-3 h-3" />
            {method}: {count}
          </span>
        ))}
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
            return (
              <motion.div
                key={planet.pl_name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="glass-card p-5 hover:border-accent-purple/30 hover:-translate-y-1 transition-all duration-300"
              >
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
