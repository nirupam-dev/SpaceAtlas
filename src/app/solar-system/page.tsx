"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Maximize, Scale, Thermometer, Moon, Plus, X } from "lucide-react";
import { planets } from "@/lib/data";
import { useState } from "react";

const typeColors: Record<string, string> = {
  TERRESTRIAL: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  GAS_GIANT: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  ICE_GIANT: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
  DWARF: "from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400",
};

const maxDiameter = Math.max(...planets.map(p => p.diameter || 0));
const maxGravity = Math.max(...planets.map(p => p.gravity || 0));
const maxMoons = Math.max(...planets.map(p => p.numberOfMoons || 0));

export default function SolarSystemPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [compareList, setCompareList] = useState<string[]>(["earth", "mars"]);

  const filtered = planets.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || p.type === typeFilter;
    return matchSearch && matchType;
  });

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(c => c !== id));
    } else {
      if (compareList.length < 4) {
        setCompareList([...compareList, id]);
      }
    }
  };

  const comparedPlanets = planets.filter(p => compareList.includes(p.id));

  return (
    <div className="relative bg-[#020617] min-h-screen font-light">
      {/* Hero Section - STRICTLY PRESERVING BACKGROUND */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image - UNTOUCHED */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/solar-bg.jpg')" }}
        />
        {/* Lighter gradient overlay - UNTOUCHED */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

        <div className="relative z-10 w-full max-w-[800px] px-8 md:px-[8%] lg:px-[10%]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[48px] md:text-[64px] lg:text-[72px] font-display gradient-text mb-8 leading-[1.1] tracking-[2px]"
          >
            SOLAR SYSTEM<br className="hidden md:block" /> EXPLORER
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#e2e8f0] text-[18px] leading-[1.8] mb-12 font-light tracking-wide max-w-[600px]"
          >
            Journey through planets, moons, and worlds across our cosmic neighborhood. Explore the distinct environments, staggering scale, and unique phenomena that define our solar system.
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
              <span className="font-medium text-sm uppercase tracking-widest">Commence Exploration</span>
              <span className="mx-4 text-space-400">|</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Database Section */}
      <section id="database" className="relative z-10 py-[120px] px-6 bg-black">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Search & Filters */}
          <div className="flex flex-col items-center justify-center mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full max-w-full md:max-w-[80%] lg:max-w-[800px] relative group"
            >
              <div className="absolute inset-0 bg-[#38bdf8] opacity-5 blur-xl group-hover:opacity-10 transition-opacity rounded-full pointer-events-none" />
              <div className="relative flex items-center gap-3 px-6 py-4 rounded-full border border-space-500/50 bg-[#0f172a]/80 backdrop-blur-md shadow-2xl">
                <Search className="w-6 h-6 text-[#818cf8]" />
                <input 
                  type="text" 
                  placeholder="SEARCH WORLDS..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="bg-transparent outline-none text-[16px] text-white placeholder-space-500 flex-1 uppercase tracking-[3px] font-micro" 
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              {["ALL", "TERRESTRIAL", "GAS_GIANT", "ICE_GIANT", "DWARF"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-6 py-2.5 rounded-full text-[12px] font-micro tracking-widest uppercase transition-all duration-300 border ${
                    typeFilter === type 
                      ? "bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                      : "bg-transparent border-space-500/50 text-space-400 hover:bg-space-800 hover:text-white"
                  }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Planet Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[48px] mb-[120px]">
            <AnimatePresence>
              {filtered.map((planet, i) => (
                <motion.div 
                  key={planet.id} 
                  layout
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full"
                >
                  <Link href={`/solar-system/${planet.slug}`} className="group relative flex flex-col h-full bg-[#0f172a]/40 border border-space-500/30 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)] hover:border-space-500/60">
                    
                    {/* Top 60% Image Area */}
                    <div className="relative h-[320px] w-full overflow-hidden bg-black shrink-0">
                      <img 
                        src={planet.imageUrl || "/placeholder.jpg"} 
                        alt={planet.name} 
                        className="object-cover w-full h-full group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 opacity-80 group-hover:opacity-100" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
                      
                      <div className="absolute bottom-6 left-6 right-6">
                        <span className={`inline-block mb-3 px-3 py-1 rounded-full text-[10px] font-micro tracking-widest bg-gradient-to-r border backdrop-blur-md ${typeColors[planet.type] || ""}`}>
                          {planet.type.replace("_", " ")}
                        </span>
                        <h3 className="text-[28px] font-display text-white group-hover:text-[#38bdf8] transition-colors leading-none drop-shadow-lg">{planet.name}</h3>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0f172a] to-black">
                      <p className="text-[15px] font-light text-[#cbd5e1] line-clamp-2 leading-relaxed mb-8">{planet.description}</p>
                      
                      {/* Metric Layout */}
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-space-800/50 flex items-center justify-center text-space-400 group-hover:text-white transition-colors"><Maximize className="w-4 h-4" /></div>
                          <div>
                            <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Diameter</div>
                            <div className="text-[14px] font-medium text-white">{planet.diameter?.toLocaleString()} km</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-space-800/50 flex items-center justify-center text-space-400 group-hover:text-white transition-colors"><Scale className="w-4 h-4" /></div>
                          <div>
                            <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Gravity</div>
                            <div className="text-[14px] font-medium text-white">{planet.gravity} m/s²</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-space-800/50 flex items-center justify-center text-space-400 group-hover:text-white transition-colors"><Thermometer className="w-4 h-4" /></div>
                          <div>
                            <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Temp</div>
                            <div className="text-[14px] font-medium text-white">{planet.meanTemperature}°C</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-space-800/50 flex items-center justify-center text-space-400 group-hover:text-white transition-colors"><Moon className="w-4 h-4" /></div>
                          <div>
                            <div className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Moons</div>
                            <div className="text-[14px] font-medium text-white">{planet.numberOfMoons}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Interactive Comparison Section */}
          <div className="border-t border-space-800 pt-[120px]">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-[48px] font-display gradient-text mb-4">DATA COMPARISON</h2>
              <p className="text-[18px] text-space-300 font-light max-w-2xl mx-auto">Select up to 4 worlds to analyze and compare their physical characteristics side by side.</p>
            </motion.div>

            <div className="bg-[#0f172a]/30 border border-space-500/30 rounded-3xl p-8 backdrop-blur-xl">
              {/* Planet Selector */}
              <div className="flex flex-wrap gap-3 mb-12 pb-8 border-b border-space-800">
                {planets.map(p => {
                  const isSelected = compareList.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleCompare(p.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
                        isSelected 
                          ? "bg-white text-black hover:bg-space-200" 
                          : "bg-space-900 border border-space-700 text-space-300 hover:border-space-500 hover:text-white"
                      }`}
                    >
                      {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Comparison Charts */}
              {comparedPlanets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Diameter Chart */}
                  <div className="space-y-6">
                    <h4 className="text-[14px] font-micro uppercase tracking-[3px] text-space-400 mb-8 flex items-center gap-2"><Maximize className="w-4 h-4"/> Diameter (km)</h4>
                    {comparedPlanets.map(p => (
                      <div key={p.id} className="space-y-2">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-medium text-white">{p.name}</span>
                          <span className="text-space-300">{p.diameter?.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-space-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(p.diameter || 0) / maxDiameter * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gravity Chart */}
                  <div className="space-y-6">
                    <h4 className="text-[14px] font-micro uppercase tracking-[3px] text-space-400 mb-8 flex items-center gap-2"><Scale className="w-4 h-4"/> Gravity (m/s²)</h4>
                    {comparedPlanets.map(p => (
                      <div key={p.id} className="space-y-2">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-medium text-white">{p.name}</span>
                          <span className="text-space-300">{p.gravity}</span>
                        </div>
                        <div className="h-2 w-full bg-space-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(p.gravity || 0) / maxGravity * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Moons Chart */}
                  <div className="space-y-6">
                    <h4 className="text-[14px] font-micro uppercase tracking-[3px] text-space-400 mb-8 flex items-center gap-2"><Moon className="w-4 h-4"/> Confirmed Moons</h4>
                    {comparedPlanets.map(p => (
                      <div key={p.id} className="space-y-2">
                        <div className="flex justify-between text-[13px]">
                          <span className="font-medium text-white">{p.name}</span>
                          <span className="text-space-300">{p.numberOfMoons}</span>
                        </div>
                        <div className="h-2 w-full bg-space-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(p.numberOfMoons || 0) / maxMoons * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-space-500 font-light">
                  Select planets from the list above to view comparisons.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
