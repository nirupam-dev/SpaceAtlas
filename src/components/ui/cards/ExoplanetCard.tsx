"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Calendar, Ruler, Thermometer, Orbit,
  ChevronDown, ExternalLink, Globe2, Droplets,
} from "lucide-react";
import { ANIMATION, EXOPLANET_THRESHOLDS } from "@/lib/constants";
import {
  type Exoplanet,
  getPlanetType, getHabitability, getPlanetGradient,
  DISCOVERY_METHOD_COLORS, DEFAULT_METHOD_COLOR,
} from "@/lib/utils/exoplanet-utils";

interface ExoplanetCardProps {
  planet: Exoplanet;
  index: number;
  isExpanded: boolean;
  onToggle: (name: string) => void;
}

export default function ExoplanetCard({ planet, index, isExpanded, onToggle }: ExoplanetCardProps) {
  const methodColor = DISCOVERY_METHOD_COLORS[planet.discoverymethod] || DEFAULT_METHOD_COLOR;
  const gradient = getPlanetGradient(planet.pl_name);
  const pType = getPlanetType(planet.pl_rade, planet.pl_bmasse);
  const hab = getHabitability(planet.pl_eqt, planet.pl_rade);

  return (
    <motion.div
      initial={{ opacity: 0, y: ANIMATION.SLIDE_OFFSET_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * ANIMATION.FAST_STAGGER_DELAY, duration: ANIMATION.TAB_TRANSITION }}
      className="glass-card overflow-hidden hover:border-accent-purple/30 transition-all duration-300 group cursor-pointer"
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`Exoplanet ${planet.pl_name}, host star ${planet.hostname}, ${pType.type}.`}
      onClick={() => onToggle(planet.pl_name)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(planet.pl_name); } }}
    >
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-accent-purple/10">
            <div className="p-5 pt-4 bg-accent-purple/[0.02]">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 bg-white/[0.02] border-white/10">
                <Globe2 className={`w-4 h-4 ${pType.color}`} />
                <span className={`text-xs font-bold ${pType.color}`}>{pType.type}</span>
                <span className="text-xs text-space-400 ml-2">{pType.desc}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 bg-white/[0.02] border-white/10">
                <Droplets className={`w-4 h-4 ${hab.color}`} />
                <span className={`text-xs font-bold ${hab.color}`}>Habitability: {hab.score}</span>
                <span className="text-xs text-space-400 ml-2">{hab.desc}</span>
              </div>
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
                {planet.pl_rade && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Radius vs Earth</div>
                  <div className="text-white font-mono">{planet.pl_rade.toFixed(2)} × Earth</div>
                  <div className="text-[10px] text-space-500 mt-0.5">{(planet.pl_rade * EXOPLANET_THRESHOLDS.EARTH_RADIUS_KM).toFixed(0)} km</div>
                </div>}
                {planet.pl_bmasse && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Mass vs Earth</div>
                  <div className="text-white font-mono">{planet.pl_bmasse.toFixed(2)} × Earth</div>
                </div>}
                {planet.pl_eqt && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Temperature</div>
                  <div className="text-white font-mono">{planet.pl_eqt.toFixed(0)} K ({(planet.pl_eqt - EXOPLANET_THRESHOLDS.KELVIN_TO_CELSIUS_OFFSET).toFixed(0)}°C)</div>
                </div>}
                {planet.sy_dist && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Distance</div>
                  <div className="text-white font-mono">{planet.sy_dist.toFixed(1)} parsecs</div>
                  <div className="text-[10px] text-space-500 mt-0.5">{(planet.sy_dist * EXOPLANET_THRESHOLDS.PARSEC_TO_LY).toFixed(1)} light-years</div>
                </div>}
              </div>
              <a href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.pl_name)}`}
                target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]" onClick={e => e.stopPropagation()}>
                <ExternalLink className="w-3 h-3" /> View on NASA Exoplanet Archive
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
