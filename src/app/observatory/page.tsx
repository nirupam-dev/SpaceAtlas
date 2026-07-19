"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, Orbit, Sun, Flame, Globe2, Rocket,
  ChevronDown, Sparkles, Star, Telescope,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/Cards";
import AsteroidWatch from "@/components/ui/AsteroidWatch";
import SpaceWeather from "@/components/ui/SpaceWeather";
import EarthEvents from "@/components/ui/EarthEvents";
import ExoplanetExplorer from "@/components/ui/ExoplanetExplorer";
import FireballTracker from "@/components/ui/FireballTracker";
import LiveLaunches from "@/components/ui/LiveLaunches";
import PeopleInSpace from "@/components/ui/PeopleInSpace";

export default function ObservatoryPage() {
  const [activeTab, setActiveTab] = useState<string>("launches");

  const tabs = [
    { id: "launches",   label: "Live Launches",     icon: Rocket },
    { id: "asteroids",  label: "Asteroid Watch",     icon: Orbit },
    { id: "weather",    label: "Space Weather",      icon: Sun },
    { id: "exoplanets", label: "Exoplanets",         icon: Star },
    { id: "earth",      label: "Earth Events",       icon: Globe2 },
    { id: "fireballs",  label: "Fireballs",          icon: Flame },
  ];

  return (
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <section className="relative w-full min-h-screen overflow-hidden flex items-center">
        {/* Background Image — vivid & visible */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url('/observatory-hero.png')" }}
        />
        {/* Minimal overlays — just enough for text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-transparent to-[#0f172a]/90" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(15,23,42,0.4)_100%)]" />

        {/* Subtle animated glow accents */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute top-32 left-1/4 w-72 h-72 bg-accent-purple/6 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-32 right-1/4 w-64 h-64 bg-accent-blue/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-accent-purple/30 text-accent-purple text-[10px] font-micro uppercase tracking-[3px] bg-accent-purple/5 backdrop-blur-md mb-8">
              <Eye className="w-3.5 h-3.5" />
              Live Data · Real-Time Tracking
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display text-white mb-6 leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          >
            SPACE
            <br />
            <span className="gradient-text">OBSERVATORY</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[15px] md:text-[17px] text-space-200 leading-[1.8] font-light mb-10 max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
          >
            Your real-time command center for the cosmos. Track asteroids, monitor solar storms,
            discover exoplanets, watch live launches, and observe Earth from space —
            powered by NASA, JPL, and SpaceDevs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <a href="#explore" className="btn-primary flex items-center justify-center gap-3 text-[13px] px-8 py-3.5 min-w-[200px]">
              <Telescope className="w-4 h-4" />
              START OBSERVING
            </a>
            <Link href="/technology" className="btn-outline flex items-center justify-center gap-3 text-[13px] px-8 py-3.5 min-w-[200px]">
              NASA TECH LAB
            </Link>
          </motion.div>

          {/* API count badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              "NASA NEO", "NASA DONKI", "Open Notify", "NASA EONET",
              "NASA CNEOS", "Exoplanet Archive", "Launch Library 2", "SpaceFlight News",
            ].map((api) => (
              <span key={api} className="px-3 py-1.5 rounded-full text-[9px] font-micro uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] text-space-400">
                <Sparkles className="w-2.5 h-2.5 inline-block mr-1 text-accent-blue" />
                {api}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-8 h-8 text-space-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ PEOPLE IN SPACE LIVE WIDGET ═══ */}
      <section className="relative py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <PeopleInSpace />
        </div>
      </section>

      {/* ═══ TABBED OBSERVATORY EXPLORER ═══ */}
      <section id="explore" className="relative py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Real-Time Observatory"
            title="Explore Live Data"
            subtitle="Powered by NASA, JPL & SpaceDevs — updated automatically"
          />

          {/* Tab Navigation */}
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

          {/* Tab Content */}
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
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-16 md:p-20 relative overflow-hidden bg-[#0f172a]/90 backdrop-blur-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Want to go deeper?
            </h2>
            <p className="text-space-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Ask our AI assistant about any space phenomenon, compare rockets side by side,
              or test your knowledge with our interactive quiz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/ask" className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg w-full sm:w-auto justify-center">
                Ask SpaceAtlas AI
              </Link>
              <Link href="/technology" className="btn-outline inline-flex items-center gap-3 px-8 py-4 text-lg w-full sm:w-auto justify-center">
                NASA Tech Lab
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
