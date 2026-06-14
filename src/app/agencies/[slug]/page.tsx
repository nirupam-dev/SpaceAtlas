"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Globe, DollarSign, Users, Calendar, MapPin } from "lucide-react";
import { agencies } from "@/lib/data";

import NasaSearchFallback from "@/components/ui/NasaSearchFallback";

export default function AgencyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const agency = agencies.find((a) => a.slug === slug);

  if (!agency) {
    return <NasaSearchFallback query={slug} backLink="/agencies" backText="Back to Agencies" />;
  }

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link href="/agencies" className="inline-flex items-center gap-2 text-space-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Agencies
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{agency.abbreviation}</h1>
                <p className="text-space-400">{agency.name}</p>
              </div>
            </div>
            <p className="text-space-300 leading-relaxed mt-4">{agency.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Calendar, label: "Founded", value: `${agency.foundedYear}` },
              { icon: DollarSign, label: "Budget", value: `$${agency.budget}B` },
              { icon: Users, label: "Employees", value: agency.employees?.toLocaleString() || "N/A" },
              { icon: MapPin, label: "HQ", value: agency.headquarters.split(",")[0] },
            ].map((spec, i) => (
              <motion.div key={spec.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 text-center">
                <spec.icon className="w-6 h-6 text-accent-blue mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{spec.value}</div>
                <div className="text-xs text-space-500">{spec.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-space-400">Full Name</span><span className="text-white">{agency.name}</span></div>
              <div className="flex justify-between"><span className="text-space-400">Country</span><span className="text-white">{agency.country}</span></div>
              <div className="flex justify-between"><span className="text-space-400">Headquarters</span><span className="text-white">{agency.headquarters}</span></div>
              {agency.administrator && <div className="flex justify-between"><span className="text-space-400">Administrator</span><span className="text-white">{agency.administrator}</span></div>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
