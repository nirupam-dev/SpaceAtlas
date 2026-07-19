"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Orbit, Sun, Flame, Globe2, Rocket, Star } from "lucide-react";

import AsteroidWatch from "@/components/ui/AsteroidWatch";
import SpaceWeather from "@/components/ui/SpaceWeather";
import EarthEvents from "@/components/ui/EarthEvents";
import ExoplanetExplorer from "@/components/ui/ExoplanetExplorer";
import FireballTracker from "@/components/ui/FireballTracker";
import LiveLaunches from "@/components/ui/LiveLaunches";

export default function ObservatoryTabs() {
  const [activeTab, setActiveTab] = useState<string>("launches");

  const tabs = [
    { id: "launches",   label: "Live Launches",     icon: Rocket },
    { id: "asteroids",  label: "Asteroid Watch",    icon: Orbit },
    { id: "weather",    label: "Space Weather",     icon: Sun },
    { id: "exoplanets", label: "Exoplanets",        icon: Star },
    { id: "earth",      label: "Earth Events",      icon: Globe2 },
    { id: "fireballs",  label: "Fireballs",         icon: Flame },
  ];

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-micro uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 text-white border border-accent-blue/40 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                : "bg-white/5 text-space-400 border border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab === "launches" && <LiveLaunches />}
        {activeTab === "asteroids" && <AsteroidWatch />}
        {activeTab === "weather" && <SpaceWeather />}
        {activeTab === "exoplanets" && <ExoplanetExplorer />}
        {activeTab === "earth" && <EarthEvents />}
        {activeTab === "fireballs" && <FireballTracker />}
      </motion.div>
    </>
  );
}
