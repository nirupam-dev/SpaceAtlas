"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Rocket, Globe2, ArrowRight,
  Zap, BrainCircuit,
} from "lucide-react";

const motionPrefs = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

interface HeroStats {
  rocketsCount: number;
  satellitesCount: number;
  missionsCount: number;
  agenciesCount: number;
}

export function HeroSection({ stats }: { stats: HeroStats }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 text-center pt-28 sm:pt-40 pb-16 sm:pb-20">
        <motion.div
          {...motionPrefs}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-space-500 text-white text-xs sm:text-sm font-micro mb-8 sm:mb-12 uppercase tracking-widest bg-black/30 backdrop-blur-md">
            <Zap className="w-4 h-4" />
            Your Gateway to the Cosmos
          </span>
        </motion.div>

        <motion.h1
          {...motionPrefs}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-display gradient-text mb-6 sm:mb-10 leading-[1.1]"
        >
          Explore the
          <br />
          Universe
        </motion.h1>

        <motion.p
          {...motionPrefs}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 sm:mt-10 text-sm sm:text-lg md:text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed font-light tracking-wide bg-black/20 backdrop-blur-sm p-4 sm:p-6 rounded-2xl"
        >
          Comprehensive information about rockets, spacecraft, planets,
          space missions, astronauts, and the latest discoveries.
        </motion.p>

        <motion.div
          {...motionPrefs}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
        >
          <Link href="/rockets" className="btn-primary flex items-center gap-3 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto justify-center">
            <Rocket className="w-5 h-5" />
            Explore Rockets
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/solar-system" className="btn-outline flex items-center gap-3 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto justify-center">
            <Globe2 className="w-5 h-5" />
            Solar System
          </Link>
        </motion.div>

        {/* Quick stats strip */}
        <motion.div
          {...motionPrefs}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 sm:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12 max-w-4xl mx-auto bg-black/40 backdrop-blur-md p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/10"
        >
          {[
            { val: `${stats.rocketsCount}+`, label: "Rockets" },
            { val: `${stats.satellitesCount}+`, label: "Satellites" },
            { val: `${stats.missionsCount}+`, label: "Missions" },
            { val: `${stats.agenciesCount}`, label: "Agencies" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-1 sm:mb-2">{s.val}</div>
              <div className="text-[10px] sm:text-xs text-space-400 uppercase tracking-widest font-bold">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-space-500 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-space-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="relative pb-16 sm:pb-32 px-4 sm:px-6 z-20">
      <div className="max-w-5xl mx-auto text-center -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-16 md:p-20 relative overflow-hidden shadow-2xl bg-[#0f172a]/90 backdrop-blur-2xl"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc]" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Explore?</h2>
          <p className="text-space-300 text-sm sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Dive into our comprehensive database of space knowledge. Compare rockets,
            track launches, and test your knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/rockets" className="btn-primary flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/quiz" className="btn-outline flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              <BrainCircuit className="w-5 h-5" />
              Take a Quiz
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
