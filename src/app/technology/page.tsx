"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu, Satellite, FlaskConical, Atom, Microscope,
  ArrowRight, ChevronDown, Lightbulb,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/Cards";
import TechGallery from "@/components/ui/TechGallery";
import EpicEarth from "@/components/ui/EpicEarth";
import NasaPatents from "@/components/ui/NasaPatents";
import TechPortProjects from "@/components/ui/TechPortProjects";
import ApodGallery from "@/components/ui/ApodGallery";
import MarsRoverGallery from "@/components/ui/MarsRoverGallery";

const researchDomains = [
  {
    icon: Satellite,
    title: "Satellite Systems",
    desc: "Advanced communication, Earth observation, and deep-space relay architectures.",
    color: "from-sky-400 to-blue-600",
    borderColor: "border-sky-500/30",
    stat: "200+",
    statLabel: "Active Satellites",
  },
  {
    icon: FlaskConical,
    title: "Life Sciences",
    desc: "Microgravity biology, radiation protection, and closed-loop life support for deep space.",
    color: "from-emerald-400 to-teal-600",
    borderColor: "border-emerald-500/30",
    stat: "50+",
    statLabel: "ISS Experiments",
  },
  {
    icon: Atom,
    title: "Propulsion R&D",
    desc: "Ion drives, nuclear thermal engines, and solar sail research for faster interplanetary travel.",
    color: "from-violet-400 to-purple-600",
    borderColor: "border-violet-500/30",
    stat: "12",
    statLabel: "Active Programs",
  },
  {
    icon: Microscope,
    title: "Materials Science",
    desc: "Heat shields, radiation-hardened electronics, and lightweight composites for extreme conditions.",
    color: "from-amber-400 to-orange-600",
    borderColor: "border-amber-500/30",
    stat: "1,400+",
    statLabel: "Patents Filed",
  },
  {
    icon: Cpu,
    title: "AI & Autonomy",
    desc: "Machine learning for autonomous navigation, anomaly detection, and mission planning.",
    color: "from-pink-400 to-rose-600",
    borderColor: "border-pink-500/30",
    stat: "30+",
    statLabel: "AI Projects",
  },
  {
    icon: Lightbulb,
    title: "Spinoff Technology",
    desc: "Space innovations applied to everyday life — from water purifiers to memory foam.",
    color: "from-cyan-400 to-sky-600",
    borderColor: "border-cyan-500/30",
    stat: "2,000+",
    statLabel: "Spinoffs",
  },
];

export default function TechnologyPage() {
  const [activeTab, setActiveTab] = useState<string>("gallery");

  const tabs = [
    { id: "gallery", label: "NASA Image Library", icon: Satellite },
    { id: "patents", label: "Patents & Software", icon: Cpu },
    { id: "techport", label: "TechPort Projects", icon: FlaskConical },
    { id: "epic", label: "Earth from Space", icon: Atom },
    { id: "mars", label: "Mars Rover Photos", icon: Microscope },
    { id: "apod", label: "APOD Gallery", icon: Lightbulb },
  ];

  return (
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0f172a]" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center pt-40 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-violet-500/40 text-violet-300 text-sm font-micro mb-8 uppercase tracking-widest bg-violet-500/10 backdrop-blur-md">
              <Cpu className="w-4 h-4" />
              NASA Powered · Live Data
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display gradient-text mb-8 leading-[1.1]"
          >
            Space Tech
            <br />
            & Research
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-space-200 max-w-3xl mx-auto leading-relaxed font-light tracking-wide bg-black/30 backdrop-blur-sm p-6 rounded-2xl"
          >
            Explore cutting-edge NASA technologies, patents, active research projects,
            real-time Earth imagery, and Mars rover photographs — all powered by live NASA APIs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <a href="#explore" className="btn-primary flex items-center gap-3 text-lg px-8 py-4">
              <FlaskConical className="w-5 h-5" />
              Explore Research
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link href="/ask" className="btn-outline flex items-center gap-3 text-lg px-8 py-4">
              Ask AI About Tech
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-space-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ RESEARCH DOMAINS ═══ */}
      <section className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Research Domains"
            title="Fields of Innovation"
            subtitle="Six pillars driving humanity's next giant leap"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchDomains.map((domain, i) => (
              <motion.div
                key={domain.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`glass-card glass-card-hover p-8 group ${domain.borderColor} relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${domain.color} opacity-60`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${domain.color} bg-opacity-10 border border-white/10 mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <domain.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-display text-white mb-3 group-hover:text-accent-blue transition-colors">
                  {domain.title}
                </h3>
                <p className="text-sm text-space-400 leading-relaxed mb-6">{domain.desc}</p>
                <div className="pt-4 border-t border-space-700 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold gradient-text">{domain.stat}</div>
                    <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">{domain.statLabel}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-space-600 group-hover:text-accent-blue group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TABBED NASA DATA EXPLORER ═══ */}
      <section id="explore" className="relative py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Live NASA APIs"
            title="Technology Explorer"
            subtitle="Real-time data from NASA's open APIs — search, filter, and discover"
          />

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-micro uppercase tracking-widest transition-all duration-300 ${
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
            {activeTab === "gallery" && <TechGallery embedded />}
            {activeTab === "patents" && <NasaPatents />}
            {activeTab === "techport" && <TechPortProjects />}
            {activeTab === "epic" && <EpicEarth />}
            {activeTab === "mars" && <MarsRoverGallery />}
            {activeTab === "apod" && <ApodGallery />}
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
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 via-accent-blue to-accent-cyan" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Curious about a specific technology?
            </h2>
            <p className="text-space-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Ask our AI assistant anything about space technology, NASA research programs,
              or the latest breakthroughs in aerospace engineering.
            </p>
            <Link href="/ask" className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg">
              Ask SpaceAtlas AI <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
