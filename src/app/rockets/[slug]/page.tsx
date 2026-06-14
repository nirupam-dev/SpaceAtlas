"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ArrowLeft, Gauge, Ruler, Weight, Layers, Flame, DollarSign, Target, TrendingUp, Globe } from "lucide-react";
import { rockets } from "@/lib/data";

import NasaSearchFallback from "@/components/ui/NasaSearchFallback";

export default function RocketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const rocket = rockets.find((r) => r.slug === slug);

  if (!rocket) {
    return <NasaSearchFallback query={slug} backLink="/rockets" backText="Back to Rockets" />;
  }

  const specs = [
    { icon: Ruler, label: "Height", value: `${rocket.height} m`, color: "text-accent-blue" },
    { icon: Gauge, label: "Diameter", value: `${rocket.diameter} m`, color: "text-accent-cyan" },
    { icon: Weight, label: "Mass", value: `${(rocket.mass / 1000).toFixed(0)} tonnes`, color: "text-accent-purple" },
    { icon: Layers, label: "Stages", value: `${rocket.stages}`, color: "text-accent-pink" },
    { icon: Flame, label: "Thrust", value: `${rocket.thrust} kN`, color: "text-accent-amber" },
    { icon: Target, label: "Payload LEO", value: `${(rocket.payloadToLEO / 1000).toFixed(1)} t`, color: "text-accent-green" },
    { icon: TrendingUp, label: "Success Rate", value: `${rocket.successRate}%`, color: "text-accent-blue" },
    { icon: DollarSign, label: "Cost/Launch", value: `$${(rocket.costPerLaunch / 1e6).toFixed(0)}M`, color: "text-accent-amber" },
  ];

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link href="/rockets" className="inline-flex items-center gap-2 text-space-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Rockets
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Header */}
          <div className="glass-card p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{rocket.name}</h1>
                    <p className="text-space-400 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> {rocket.manufacturer} · {rocket.country}
                    </p>
                  </div>
                </div>
              </div>
              <span className={`badge text-sm ${rocket.status === "ACTIVE" ? "badge-active" : rocket.status === "RETIRED" ? "badge-retired" : "badge-development"}`}>
                {rocket.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p className="text-space-300 leading-relaxed">{rocket.description}</p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {specs.map((spec, i) => (
              <motion.div key={spec.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 text-center">
                <spec.icon className={`w-6 h-6 ${spec.color} mx-auto mb-2`} />
                <div className="text-lg font-bold text-white">{spec.value}</div>
                <div className="text-xs text-space-500">{spec.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Engine info & Launch stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Propulsion</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-space-400">Engines</span><span className="text-white font-medium">{rocket.engines}</span></div>
                <div className="flex justify-between"><span className="text-space-400">Total Thrust</span><span className="text-white font-medium">{rocket.thrust} kN</span></div>
                <div className="flex justify-between"><span className="text-space-400">Stages</span><span className="text-white font-medium">{rocket.stages}</span></div>
              </div>
            </div>
            <div className="glass-card p-8">
              <h2 className="text-xl font-semibold text-white mb-4">Launch Record</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-space-400">Total Launches</span><span className="text-white font-medium">{rocket.totalLaunches}</span></div>
                <div className="flex justify-between"><span className="text-space-400">Successful</span><span className="text-accent-green font-medium">{rocket.successfulLaunches}</span></div>
                <div className="flex justify-between"><span className="text-space-400">Failures</span><span className="text-red-400 font-medium">{rocket.totalLaunches - rocket.successfulLaunches}</span></div>
                <div className="flex justify-between"><span className="text-space-400">Success Rate</span><span className="text-accent-blue font-medium">{rocket.successRate}%</span></div>
                {/* Progress bar */}
                <div className="pt-2">
                  <div className="w-full h-2 bg-space-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-green to-accent-blue rounded-full transition-all" style={{ width: `${rocket.successRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
