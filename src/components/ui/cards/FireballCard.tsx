"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MapPin, Calendar, Gauge, ChevronDown, ExternalLink, Globe2,
} from "lucide-react";
import { ANIMATION } from "@/lib/constants";
import {
  type Fireball,
  getImpactScale, getAltitudeDescription, isLargeFireball, getMaxImpactEnergy,
} from "@/lib/utils/fireball-utils";

interface FireballCardProps {
  fb: Fireball;
  index: number;
  allFireballs: Fireball[];
  isExpanded: boolean;
  onToggle: (i: number) => void;
}

export default function FireballCard({ fb, index, allFireballs, isExpanded, onToggle }: FireballCardProps) {
  const energy = fb.energy ? parseFloat(fb.energy) : null;
  const impactE = fb["impact-e"] ? parseFloat(fb["impact-e"]) : null;
  const velocity = fb.vel ? parseFloat(fb.vel) : null;
  const altitude = fb.alt ? parseFloat(fb.alt) : null;
  const lat = fb.lat ? `${fb.lat}° ${fb["lat-dir"] || ""}` : null;
  const lon = fb.lon ? `${fb.lon}° ${fb["lon-dir"] || ""}` : null;
  const isLarge = isLargeFireball(impactE, energy);
  const impact = impactE ? getImpactScale(impactE) : null;
  const maxE = getMaxImpactEnergy(allFireballs);
  const barWidth = impactE ? Math.max(5, (impactE / maxE) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.FAST_STAGGER_DELAY, duration: ANIMATION.TAB_TRANSITION }}
      className={`glass-card overflow-hidden cursor-pointer transition-all ${isLarge ? "border-amber-500/30 hover:border-amber-500/50" : "border-space-500/20 hover:border-white/30"}`}
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`Fireball on ${new Date(fb.date).toLocaleDateString()}, ${impactE ? impactE.toFixed(2) + ' kT impact' : 'impact unknown'}.`}
      onClick={() => onToggle(index)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(index); } }}
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-amber-500/10">
            <div className={`p-5 pt-4 ${isLarge ? "bg-amber-500/[0.02]" : "bg-white/[0.01]"}`}>
              {impact && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-4 bg-white/[0.02] border-white/10">
                  <Zap className={`w-4 h-4 ${impact.color}`} />
                  <span className={`text-xs font-bold ${impact.color}`}>Impact: {impact.label}</span>
                  <span className="text-xs text-space-400 ml-2">{impact.desc}</span>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Date &amp; Time</div>
                  <div className="text-white font-mono">{new Date(fb.date).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                {lat && lon && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Location</div>
                  <div className="text-white font-mono">{lat}, {lon}</div>
                </div>}
                {velocity && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Entry Velocity</div>
                  <div className="text-white font-mono">{velocity.toFixed(1)} km/s</div>
                  <div className="text-[10px] text-space-500 mt-0.5">{(velocity * 3600).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km/h</div>
                </div>}
                {altitude && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Peak Brightness Alt.</div>
                  <div className="text-white font-mono">{altitude.toFixed(1)} km</div>
                  <div className="text-[10px] text-space-500 mt-0.5">{getAltitudeDescription(altitude)}</div>
                </div>}
                {energy && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Radiated Energy</div>
                  <div className="text-white font-mono">{energy.toExponential(2)} J</div>
                </div>}
                {impactE && <div>
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Impact Energy</div>
                  <div className="text-amber-400 font-mono font-bold">{impactE.toFixed(3)} kT TNT</div>
                </div>}
              </div>
              {impactE && (
                <div className="mb-4">
                  <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Relative Impact Energy</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full ${impactE > 10 ? "bg-red-500" : impactE > 1 ? "bg-amber-500" : "bg-cyan-500"}`} style={{ width: `${barWidth}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-space-400 w-16 text-right">{impactE.toFixed(2)} kT</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4">
                {fb.lat && fb.lon && (
                  <a href={`https://www.google.com/maps?q=${fb.lat}${fb["lat-dir"] === "S" ? "-" : ""},${fb.lon}${fb["lon-dir"] === "W" ? "-" : ""}`}
                    target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]" onClick={e => e.stopPropagation()}>
                    <Globe2 className="w-3 h-3" /> View Location
                  </a>
                )}
                <a href="https://cneos.jpl.nasa.gov/fireballs/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]" onClick={e => e.stopPropagation()}>
                  <ExternalLink className="w-3 h-3" /> NASA CNEOS Database
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
