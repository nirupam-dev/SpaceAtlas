"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Satellite, Rocket } from "lucide-react";

interface Astronaut {
  name: string;
  craft: string;
}

export default function PeopleInSpace() {
  const [people, setPeople] = useState<Astronaut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/people-in-space")
      .then(r => r.json())
      .then(data => {
        if (data.people) setPeople(data.people);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const craftGroups = people.reduce<Record<string, Astronaut[]>>((acc, p) => {
    acc[p.craft] = acc[p.craft] || [];
    acc[p.craft].push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="glass-card p-8 border border-accent-green/20">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-t-2 border-accent-green rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-8 md:p-10 border border-accent-green/20 relative overflow-hidden"
    >
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent-green/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center relative">
          <Users className="w-7 h-7 text-accent-green" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-green animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-green" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-micro text-accent-green uppercase tracking-[3px]">Live Now</span>
          </div>
          <h3 className="text-2xl font-display text-white">People in Space</h3>
        </div>
        <div className="ml-auto text-right">
          <div className="text-4xl font-bold gradient-text">{people.length}</div>
          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Humans</div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(craftGroups).map(([craft, crew]) => (
          <div key={craft}>
            <div className="flex items-center gap-2 mb-3">
              {craft.toLowerCase().includes("iss") ? (
                <Satellite className="w-4 h-4 text-accent-cyan" />
              ) : (
                <Rocket className="w-4 h-4 text-accent-purple" />
              )}
              <span className="text-xs font-micro text-space-300 uppercase tracking-widest">{craft}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-micro bg-white/5 text-space-400 border border-white/10">{crew.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {crew.map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-green/30 hover:bg-accent-green/5 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 border border-accent-green/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">{person.name.charAt(0)}</span>
                  </div>
                  <span className="text-xs font-medium text-white truncate">{person.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
