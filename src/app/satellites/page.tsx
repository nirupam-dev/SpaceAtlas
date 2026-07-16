"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Satellite, ArrowRight, Search } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";
import InlineNasaSearch from "@/components/ui/InlineNasaSearch";
import { satellites } from "@/lib/data";
import { useState } from "react";

const typeLabels: Record<string, string> = {
  SPACE_STATION: "Space Station",
  SPACE_TELESCOPE: "Space Telescope",
  COMMUNICATION: "Communication",
  NAVIGATION: "Navigation",
  EARTH_OBSERVATION: "Earth Observation",
  WEATHER: "Weather",
  SCIENTIFIC: "Scientific",
};

const typeColors: Record<string, string> = {
  SPACE_STATION: "text-violet-400 border-violet-500/50 bg-violet-500/10",
  SPACE_TELESCOPE: "text-amber-400 border-amber-500/50 bg-amber-500/10",
  COMMUNICATION: "text-sky-400 border-sky-500/50 bg-sky-500/10",
  NAVIGATION: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
  EARTH_OBSERVATION: "text-teal-400 border-teal-500/50 bg-teal-500/10",
  WEATHER: "text-cyan-400 border-cyan-500/50 bg-cyan-500/10",
  SCIENTIFIC: "text-rose-400 border-rose-500/50 bg-rose-500/10",
};

function formatMass(mass: number): string {
  if (mass >= 1000) return `${(mass / 1000).toFixed(1)}t`;
  return `${mass}kg`;
}

function formatAltitude(alt: number): string {
  if (alt >= 1000000) return `${(alt / 1000000).toFixed(1)}M km`;
  if (alt >= 1000) return `${(alt / 1000).toFixed(0)}k km`;
  return `${alt} km`;
}

export default function SatellitesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [orbitFilter, setOrbitFilter] = useState("ALL");

  const filtered = satellites.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.operator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "ALL" || s.type === typeFilter;
    const matchOrbit = orbitFilter === "ALL" || s.orbit === orbitFilter;
    return matchSearch && matchType && matchOrbit;
  });

  const types = [...new Set(satellites.map((s) => s.type))];
  const orbits = [...new Set(satellites.map((s) => s.orbit))];

  return (
    <div className="relative bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/Always_Sunny_v4_d8b76550ae.jpg')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 w-full px-8 md:px-[8%] lg:px-[10%]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-blue/30 text-accent-blue text-[10px] font-micro tracking-[3px] uppercase bg-accent-blue/5 backdrop-blur-md">
              <Satellite className="w-3.5 h-3.5" />
              Satellite Encyclopedia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display gradient-text mb-8 leading-[1.1] tracking-[2px] max-w-[640px]"
          >
            EYES IN
            <br />
            THE SKY
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#e2e8f0] text-[15px] leading-[1.8] mb-12 font-light tracking-wide max-w-[500px]"
          >
            From the iconic Sputnik 1 that started the Space Age to the James
            Webb Space Telescope peering into the dawn of the universe —
            explore the satellites that have transformed our understanding of
            Earth and the cosmos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <button
              onClick={() =>
                document
                  .getElementById("database")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group flex items-center bg-white text-black px-8 py-4 hover:bg-space-200 transition-colors mt-4"
            >
              <span className="font-medium text-sm">Explore Database</span>
              <span className="mx-4 text-space-400">|</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Database Section */}
      <section id="database" className="relative z-10 py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Database"
            title="Satellite Encyclopedia"
            subtitle="Explore humanity's fleet of orbital instruments and space stations"
          />

          {/* Filters */}
          <div className="p-4 mb-8 flex flex-col md:flex-row gap-4 border-t border-space-500 bg-black">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-sm border border-space-500 bg-black">
              <Search className="w-4 h-4 text-space-400" />
              <input
                type="text"
                placeholder="Search satellites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-[13px] text-white placeholder-space-500 flex-1 uppercase tracking-wider"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-sm border border-space-500 bg-black text-[13px] text-white outline-none uppercase tracking-wider"
            >
              <option value="ALL">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {typeLabels[t] || t}
                </option>
              ))}
            </select>
            <select
              value={orbitFilter}
              onChange={(e) => setOrbitFilter(e.target.value)}
              className="px-4 py-2 rounded-sm border border-space-500 bg-black text-[13px] text-white outline-none uppercase tracking-wider"
            >
              <option value="ALL">All Orbits</option>
              {orbits.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((sat, i) => (
              <motion.div
                key={sat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="h-full"
              >
                <Link
                  href={`/satellites/${sat.slug}`}
                  className="group relative flex flex-col h-full bg-[#0f172a]/40 border border-space-500/30 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)] hover:border-space-500/60"
                >
                  {/* Image Area */}
                  <div className="relative h-[220px] w-full overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] shrink-0">
                    <img
                      src={sat.imageUrl || "/placeholder.jpg"}
                      alt={sat.name}
                      className="object-cover w-full h-full object-center group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 opacity-80 group-hover:opacity-100"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const fallback = img.parentElement?.querySelector(
                          ".img-fallback"
                        ) as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div className="img-fallback hidden absolute inset-0 items-center justify-center">
                      <Satellite className="w-16 h-16 text-space-500/40" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />

                    {/* Type badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-micro tracking-widest border backdrop-blur-md ${typeColors[sat.type] || "text-space-300 border-space-500 bg-black/60"}`}
                      >
                        {typeLabels[sat.type] || sat.type.replace("_", " ")}
                      </span>
                    </div>

                    {/* Status dot */}
                    {sat.status === "ACTIVE" && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-micro tracking-widest text-emerald-400">
                          ACTIVE
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-6 right-6">
                      <p className="text-[11px] font-micro uppercase tracking-widest text-[#38bdf8] mb-1">
                        {sat.operator} · {sat.country}
                      </p>
                      <h3 className="text-[22px] font-display text-white group-hover:text-[#38bdf8] transition-colors leading-none drop-shadow-lg">
                        {sat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0f172a] to-black">
                    <p className="text-[14px] font-light text-[#cbd5e1] line-clamp-2 leading-relaxed mb-6">
                      {sat.purpose}
                    </p>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-space-500/30 mt-auto">
                      <div>
                        <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">
                          Orbit
                        </div>
                        <div className="text-[14px] font-medium text-white">
                          {sat.orbit}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">
                          Altitude
                        </div>
                        <div className="text-[14px] font-medium text-white">
                          {formatAltitude(sat.altitude)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">
                          Mass
                        </div>
                        <div className="text-[14px] font-medium text-white">
                          {formatMass(sat.mass)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 glass-card rounded-2xl border border-space-500/30">
              <Satellite className="w-16 h-16 text-space-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                No local satellites found
              </h2>
              <p className="text-space-400 max-w-md mx-auto">
                We couldn&apos;t find any satellites matching your criteria.
              </p>
              {searchQuery.trim().length > 0 && (
                <InlineNasaSearch query={searchQuery} category="satellites" />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
