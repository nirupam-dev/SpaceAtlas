"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, MapPin, Calendar, Gauge } from "lucide-react";

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
}

export default function FireballTracker() {
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fireballs")
      .then(r => r.json())
      .then(data => {
        if (data.data) {
          // Map fields array to objects
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-t-2 border-accent-amber rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-display text-white tracking-widest">FIREBALL TRACKER</h3>
          <p className="text-space-400 text-sm mt-1">Meteor/bolide impacts detected by US government sensors</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-micro text-amber-400 uppercase tracking-widest">
          {fireballs.length} Events
        </span>
      </div>

      <div className="space-y-3">
        {fireballs.map((fb, i) => {
          const energy = fb.energy ? parseFloat(fb.energy) : null;
          const impactE = fb["impact-e"] ? parseFloat(fb["impact-e"]) : null;
          const velocity = fb.vel ? parseFloat(fb.vel) : null;
          const lat = fb.lat ? `${fb.lat}° ${fb["lat-dir"] || ""}` : null;
          const lon = fb.lon ? `${fb.lon}° ${fb["lon-dir"] || ""}` : null;

          // Color based on energy
          const isLarge = (impactE && impactE > 1) || (energy && energy > 1e11);

          return (
            <motion.div
              key={`${fb.date}-${i}`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className={`glass-card p-5 ${isLarge ? "border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.05)]" : "border-space-500/20"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLarge ? "bg-amber-500/15 border border-amber-500/30" : "bg-white/5 border border-white/10"}`}>
                  <Zap className={`w-5 h-5 ${isLarge ? "text-amber-400" : "text-space-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent-blue" />
                      {new Date(fb.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {isLarge && <span className="px-2 py-0.5 rounded-full text-[9px] font-micro bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">Major</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-space-500 flex-wrap">
                    {lat && lon && (
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3" /> {lat}, {lon}
                      </span>
                    )}
                    {velocity && (
                      <span className="flex items-center gap-1 font-mono">
                        <Gauge className="w-3 h-3" /> {velocity.toFixed(1)} km/s
                      </span>
                    )}
                    {impactE && (
                      <span className="flex items-center gap-1 font-mono text-amber-400/70">
                        <Zap className="w-3 h-3" /> {impactE.toFixed(2)} kT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
