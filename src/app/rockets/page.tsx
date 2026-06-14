"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Filter, Search } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";
import { rockets } from "@/lib/data";
import { useState } from "react";

export default function RocketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");

  const filtered = rockets.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchCountry = countryFilter === "ALL" || r.country === countryFilter;
    return matchSearch && matchStatus && matchCountry;
  });

  const countries = [...new Set(rockets.map((r) => r.country))];
  const statuses = [...new Set(rockets.map((r) => r.status))];

  return (
    <div className="relative bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/rocket-bg.jpg')" }}
        />
        {/* Lighter gradient overlay to make the background image pop while keeping text readable */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 w-full px-8 md:px-[8%] lg:px-[10%]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display gradient-text mb-8 leading-[1.1] tracking-[2px] max-w-[640px]"
          >
            TAKING HUMANS<br /> TO SPACE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#e2e8f0] text-[15px] leading-[1.8] mb-12 font-light tracking-wide max-w-[500px]"
          >
            In 2020, SpaceAtlas returned America's ability to fly astronauts to and from the International Space Station on American vehicles for the first time since 2011. In addition to flying astronauts to space, our database catalogs the incredible launch vehicles that make it possible to carry commercial astronauts to Earth orbit, the ISS or beyond.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <button 
              onClick={() => document.getElementById('database')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center bg-white text-black px-8 py-4 hover:bg-space-200 transition-colors mt-4"
            >
              <span className="font-medium text-sm">Read more</span>
              <span className="mx-4 text-space-400">|</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Database Section */}
      <section id="database" className="relative z-10 py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="Database" title="Rocket Encyclopedia" subtitle="Explore the world's most powerful launch vehicles" />

          {/* Filters */}
          <div className="p-4 mb-8 flex flex-col md:flex-row gap-4 border-t border-space-500 bg-black">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-sm border border-space-500 bg-black">
              <Search className="w-4 h-4 text-space-400" />
              <input type="text" placeholder="Search rockets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent outline-none text-[13px] text-white placeholder-space-500 flex-1 uppercase tracking-wider" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-sm border border-space-500 bg-black text-[13px] text-white outline-none uppercase tracking-wider">
              <option value="ALL">All Status</option>
              {statuses.map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
            </select>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="px-4 py-2 rounded-sm border border-space-500 bg-black text-[13px] text-white outline-none uppercase tracking-wider">
              <option value="ALL">All Countries</option>
              {countries.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((rocket, i) => (
              <motion.div key={rocket.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="h-full">
                <Link href={`/rockets/${rocket.slug}`} className="group relative flex flex-col h-full bg-[#0f172a]/40 border border-space-500/30 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)] hover:border-space-500/60">
                  
                  {/* Image Area */}
                  <div className="relative h-[220px] w-full overflow-hidden bg-black shrink-0">
                    <img 
                      src={rocket.imageUrl || "/placeholder.jpg"} 
                      alt={rocket.name} 
                      className="object-cover w-full h-full object-center group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 opacity-80 group-hover:opacity-100" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-micro tracking-widest bg-black/60 border backdrop-blur-md ${rocket.status === "ACTIVE" ? "text-emerald-400 border-emerald-500/50" : "text-space-300 border-space-500"}`}>
                        {rocket.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-6 right-6">
                      <p className="text-[11px] font-micro uppercase tracking-widest text-[#38bdf8] mb-1">{rocket.manufacturer} · {rocket.country}</p>
                      <h3 className="text-[22px] font-display text-white group-hover:text-[#38bdf8] transition-colors leading-none drop-shadow-lg">{rocket.name}</h3>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0f172a] to-black">
                    <p className="text-[14px] font-light text-[#cbd5e1] line-clamp-2 leading-relaxed mb-6">{rocket.description}</p>
                    
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-space-500/30 mt-auto">
                      <div>
                        <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">Height</div>
                        <div className="text-[14px] font-medium text-white">{rocket.height}m</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">Payload</div>
                        <div className="text-[14px] font-medium text-white">{(rocket.payloadToLEO / 1000).toFixed(0)}t</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">Success</div>
                        <div className="text-[14px] font-medium text-white">{rocket.successRate}%</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 glass-card rounded-2xl border border-space-500/30">
              <Rocket className="w-16 h-16 text-space-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No local rockets found</h2>
              <p className="text-space-400 mb-8 max-w-md mx-auto">
                We couldn't find any rockets matching your criteria.
              </p>
              {searchQuery.trim().length > 0 && (
                <Link href={`/rockets/${encodeURIComponent(searchQuery.replace(/\s+/g, '-').toLowerCase())}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 text-white font-medium hover:from-accent-blue/40 hover:to-accent-purple/40 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                  <Search className="w-4 h-4" />
                  Search NASA Live Archives
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
