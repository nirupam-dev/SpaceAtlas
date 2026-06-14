"use client";

import { motion } from "framer-motion";
import { Timer, MapPin, Rocket, Calendar } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";
import { upcomingLaunches } from "@/lib/data";
import { useState, useEffect } from "react";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="w-16 h-16 rounded-xl bg-space-800 border border-space-700 flex items-center justify-center">
            <span className="text-2xl font-bold gradient-text">{String(value).padStart(2, "0")}</span>
          </div>
          <span className="text-xs text-space-500 mt-1 block capitalize">{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function LaunchesPage() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <SectionHeading badge="Live Tracker" title="Upcoming Launches" subtitle="Real-time countdown to the next liftoff" />
        <div className="space-y-6">
          {upcomingLaunches.map((launch, i) => (
            <motion.div key={launch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass-card p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{launch.name}</h3>
                      <p className="text-sm text-space-400">{launch.agency}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-space-400">
                    <span className="flex items-center gap-1"><Rocket className="w-4 h-4" /> {launch.rocket}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {launch.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(launch.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
                <Countdown targetDate={launch.date} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
