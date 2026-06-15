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
      <section className="relative w-full h-screen min-h-[700px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 w-full h-full object-cover"
        >
          <source
            src="https://sxcontent9668.azureedge.us/cms-assets/assets/20260522_Starship_Flight12_web1920_v2_71d68b5ee9.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />

        <div className="absolute inset-0 z-10 flex flex-col justify-center pt-24 px-8 md:px-[8%] lg:px-[10%]">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-accent-blue/30 text-accent-blue text-[10px] font-micro uppercase tracking-[3px] bg-accent-blue/5 backdrop-blur-md mb-8">
                <Cpu className="w-3.5 h-3.5" />
                NASA Powered · Live Data
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display text-white mb-6 leading-[1.05]"
            >
              SPACE TECH
              <br />
              <span className="text-space-400">RESEARCH</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[15px] md:text-[16px] text-space-300 leading-[1.8] font-light mb-10 max-w-[500px]"
            >
              Explore cutting-edge NASA technologies, patents, active research projects,
              real-time Earth imagery, and Mars rover photographs — all powered by live NASA APIs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-5"
            >
              <a href="#explore" className="btn-primary flex items-center justify-center gap-3 text-[13px] px-8 py-3.5 min-w-[200px]">
                <FlaskConical className="w-4 h-4" />
                EXPLORE RESEARCH
              </a>
              <Link href="/ask" className="btn-outline flex items-center justify-center gap-3 text-[13px] px-8 py-3.5 min-w-[200px]">
                ASK AI ABOUT TECH
              </Link>
            </motion.div>
          </div>
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
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-micro uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
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
