"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Globe, Clock, Footprints } from "lucide-react";
import { astronauts } from "@/lib/data";
import NasaSearchFallback from "@/components/ui/NasaSearchFallback";

export default function AstronautDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const astronaut = astronauts.find((a) => a.slug === slug);

  if (!astronaut) {
    return <NasaSearchFallback query={slug} backLink="/astronauts" backText="Back to Astronauts" />;
  }

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link href="/astronauts" className="inline-flex items-center gap-2 text-space-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Astronauts
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{astronaut.name}</h1>
                <p className="text-space-400 flex items-center gap-2"><Globe className="w-4 h-4" /> {astronaut.nationality}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-5 text-center">
              <Footprints className="w-6 h-6 text-accent-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{astronaut.spaceWalks}</div>
              <div className="text-xs text-space-500">Spacewalks</div>
            </div>
            <div className="glass-card p-5 text-center">
              <Clock className="w-6 h-6 text-accent-purple mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{astronaut.timeInSpace}</div>
              <div className="text-xs text-space-500">Hours in Space</div>
            </div>
            <div className="glass-card p-5 text-center">
              <Users className="w-6 h-6 text-accent-amber mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{astronaut.status}</div>
              <div className="text-xs text-space-500">Status</div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-white mb-3">Biography</h2>
            <p className="text-space-300 leading-relaxed">{astronaut.biography}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
