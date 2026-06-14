"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Telescope, ArrowLeft, MapPin, Calendar, Building2 } from "lucide-react";
import { missions } from "@/lib/data";

import NasaSearchFallback from "@/components/ui/NasaSearchFallback";

export default function MissionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const mission = missions.find((m) => m.slug === slug);

  if (!mission) {
    return <NasaSearchFallback query={slug} backLink="/missions" backText="Back to Missions" />;
  }

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link href="/missions" className="inline-flex items-center gap-2 text-space-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Missions
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Telescope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{mission.name}</h1>
                <div className="flex items-center gap-4 text-space-400 mt-1">
                  <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {mission.agency}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {mission.destination}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(mission.launchDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-white mb-3">About This Mission</h2>
            <p className="text-space-300 leading-relaxed">{mission.description}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
