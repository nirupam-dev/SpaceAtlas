"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Globe2, ArrowLeft, Thermometer, Ruler, Weight, MoveHorizontal, Clock, Zap, Maximize, Activity, Moon, Shield } from "lucide-react";
import { planets } from "@/lib/data";

const typeColors: Record<string, string> = {
  TERRESTRIAL: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
  GAS_GIANT: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
  ICE_GIANT: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
  DWARF: "from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30",
};

import NasaSearchFallback from "@/components/ui/NasaSearchFallback";

export default function PlanetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const planet = planets.find((p) => p.slug === slug);

  if (!planet) {
    return <NasaSearchFallback query={slug} backLink="/solar-system" backText="Back to Solar System" />;
  }

  const specs = [
    { icon: Ruler, label: "Diameter", value: `${planet.diameter?.toLocaleString()} km` },
    { icon: Weight, label: "Mass", value: `${planet.mass} × 10²⁴ kg` },
    { icon: Zap, label: "Gravity", value: `${planet.gravity} m/s²` },
    { icon: Thermometer, label: "Mean Temp", value: `${planet.meanTemperature}°C` },
    { icon: MoveHorizontal, label: "Dist from Sun", value: `${planet.distanceFromSun} M km` },
    { icon: Clock, label: "Orbital Period", value: `${planet.orbitalPeriod?.toLocaleString()} days` },
  ];

  return (
    <div className="relative bg-[#020617] min-h-screen font-light selection:bg-[#38bdf8]/30">
      
      {/* Hero Banner Area */}
      <section className="relative min-h-[80vh] flex flex-col justify-end pb-24 overflow-hidden border-b border-space-500/30">
        <div className="absolute inset-0 z-0 bg-black">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={planet.imageUrl || "/placeholder.jpg"} 
            alt={planet.name} 
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12">
          <Link href="/solar-system" className="inline-flex items-center gap-2 text-space-300 hover:text-white transition-colors mb-12 font-micro uppercase tracking-widest text-[12px] group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Solar System
          </Link>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className={`inline-block mb-4 px-4 py-1.5 rounded-full text-[12px] font-micro tracking-widest bg-gradient-to-r border backdrop-blur-md ${typeColors[planet.type] || ""}`}>
              {planet.type.replace("_", " ")}
            </span>
            <h1 className="text-[64px] md:text-[96px] font-display text-white drop-shadow-2xl leading-none mb-4">{planet.name}</h1>
            <p className="text-[20px] md:text-[24px] text-space-300 max-w-3xl font-light leading-relaxed">
              #{planet.orderFromSun} Planet from the Sun
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative z-10 py-[120px]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column - Overview & Narrative */}
          <div className="lg:col-span-7 space-y-[120px]">
            
            {/* Overview Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-[48px] font-display gradient-text mb-8">Overview</h2>
              <p className="text-[18px] text-[#cbd5e1] leading-[1.8] font-light">
                {planet.description}
              </p>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-[32px] font-display text-white mb-8">Physical Characteristics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {specs.map((spec, i) => (
                  <div key={spec.label} className="bg-[#0f172a]/40 border border-space-500/30 p-6 rounded-2xl backdrop-blur-sm hover:bg-[#0f172a]/60 transition-colors">
                    <spec.icon className="w-6 h-6 text-[#38bdf8] mb-4 opacity-80" />
                    <div className="text-[24px] font-medium text-white mb-1">{spec.value}</div>
                    <div className="text-[11px] font-micro uppercase tracking-[2px] text-space-400">{spec.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Scale Comparison */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-[32px] font-display text-white mb-8">Scale vs Earth</h2>
              <div className="bg-[#0f172a]/40 border border-space-500/30 p-12 rounded-3xl backdrop-blur-sm flex items-end justify-center gap-16 min-h-[300px]">
                <div className="flex flex-col items-center">
                  <div className="w-[80px] h-[80px] rounded-full bg-blue-500/20 border border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
                  <span className="text-[12px] font-micro uppercase tracking-widest text-space-400 mt-6">Earth (12,756 km)</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="rounded-full bg-purple-500/20 border border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]" 
                    style={{ 
                      width: `${Math.min(250, Math.max(20, (planet.diameter || 12756) / 12756 * 80))}px`, 
                      height: `${Math.min(250, Math.max(20, (planet.diameter || 12756) / 12756 * 80))}px` 
                    }} 
                  />
                  <span className="text-[12px] font-micro uppercase tracking-widest text-space-400 mt-6">{planet.name} ({planet.diameter?.toLocaleString()} km)</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-gradient-to-br from-[#0f172a] to-black border border-space-500/30 p-8 rounded-3xl sticky top-32">
                <h3 className="text-[20px] font-display text-white mb-6 uppercase tracking-wider">System Intelligence</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-space-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8]"><Moon className="w-5 h-5"/></div>
                      <span className="text-[14px] text-space-300">Confirmed Moons</span>
                    </div>
                    <span className="text-[24px] font-display text-white">{planet.numberOfMoons}</span>
                  </div>

                  <div className="flex items-center justify-between pb-6 border-b border-space-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><Shield className="w-5 h-5"/></div>
                      <span className="text-[14px] text-space-300">Ring System</span>
                    </div>
                    <span className="text-[14px] font-micro tracking-widest uppercase text-white">{planet.hasRings ? "Detected" : "None"}</span>
                  </div>

                  <div className="flex items-center justify-between pb-6 border-b border-space-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Activity className="w-5 h-5"/></div>
                      <span className="text-[14px] text-space-300">Habitability</span>
                    </div>
                    <span className="text-[14px] font-micro tracking-widest uppercase text-space-500">Unlikely</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </section>
    </div>
  );
}
