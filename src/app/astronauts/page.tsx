"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Search, Globe, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";
import { astronauts } from "@/lib/data";
import { useState } from "react";

const statusColors: Record<string, string> = { ACTIVE: "badge-active", RETIRED: "badge-retired", DECEASED: "badge-retired", IN_TRAINING: "badge-development" };

export default function AstronautsPage() {
  const [search, setSearch] = useState("");
  const filtered = astronauts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.nationality.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative bg-[#020617] min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/Astronauts-bg.jpg')" }}
        />
        {/* Bottom-up gradient overlay to keep the face visible while text is readable */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Text container centered */}
        <div className="relative z-10 w-full max-w-[700px] px-8 mx-auto mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display gradient-text mb-8 leading-[1.1] tracking-[2px]"
          >
            HEROES OF SPACE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#e2e8f0] text-[15px] leading-[1.8] mb-12 font-light tracking-wide max-w-[600px] mx-auto"
          >
            Since the dawn of spaceflight, only a select few have slipped the surly bonds of Earth. Discover the brave individuals who ventured beyond our atmosphere, pushing the boundaries of human exploration and living among the stars.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <button 
              onClick={() => document.getElementById('database')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center justify-center bg-white text-black px-8 py-4 hover:bg-space-200 transition-colors mt-4"
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
          <SectionHeading badge="Heroes" title="Astronaut Database" subtitle="The explorers who ventured beyond our atmosphere" />
          
          <div className="glass-card p-4 mb-8 border-t border-space-500">
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-black/40 border border-space-500">
              <Search className="w-4 h-4 text-space-400" />
              <input type="text" placeholder="Search astronauts..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-[13px] text-white placeholder-space-500 flex-1 uppercase tracking-wider" />
            </div>
          </div>
          
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((astronaut, i) => (
                <motion.div key={astronaut.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="h-full">
                  <Link href={`/astronauts/${astronaut.slug}`} className="group relative flex flex-col h-full bg-[#0f172a]/40 border border-space-500/30 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)] hover:border-space-500/60">
                    
                    {/* Image Area */}
                    <div className="relative h-[220px] w-full overflow-hidden bg-black shrink-0">
                      <img 
                        src={astronaut.imageUrl || "/placeholder.jpg"} 
                        alt={astronaut.name} 
                        className="object-cover w-full h-full object-top group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 opacity-80 group-hover:opacity-100" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
                      
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-micro tracking-widest bg-black/60 border backdrop-blur-md ${statusColors[astronaut.status] || "text-space-300 border-space-500"}`}>
                          {astronaut.status}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-6 right-6">
                        <p className="text-[11px] font-micro uppercase tracking-widest text-[#38bdf8] flex items-center gap-1 mb-1"><Globe className="w-3 h-3" /> {astronaut.nationality}</p>
                        <h3 className="text-[22px] font-display text-white group-hover:text-[#38bdf8] transition-colors leading-none drop-shadow-lg">{astronaut.name}</h3>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0f172a] to-black">
                      <p className="text-[14px] font-light text-[#cbd5e1] line-clamp-2 leading-relaxed mb-6">{astronaut.biography}</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-space-500/30 mt-auto">
                        <div>
                          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Spacewalks</div>
                          <div className="text-[14px] font-medium text-white">{astronaut.spaceWalks}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Time in Space</div>
                          <div className="text-[14px] font-medium text-white">{astronaut.timeInSpace} hrs</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-2xl border border-space-500/30">
              <Users className="w-16 h-16 text-space-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No local astronauts found</h2>
              <p className="text-space-400 mb-8 max-w-md mx-auto">
                We couldn't find "{search}" in our curated local database.
              </p>
              <Link href={`/astronauts/${encodeURIComponent(search.replace(/\s+/g, '-').toLowerCase())}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 text-white font-medium hover:from-accent-blue/40 hover:to-accent-purple/40 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                <Search className="w-4 h-4" />
                Search NASA Live Archives
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
