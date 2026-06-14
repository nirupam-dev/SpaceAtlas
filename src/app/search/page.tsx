"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Rocket, Globe2, Telescope, Users, Building2 } from "lucide-react";
import { rockets, planets, missions, astronauts, agencies } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";

  const results = {
    rockets: rockets.filter((r) => r.name.toLowerCase().includes(q) || r.manufacturer.toLowerCase().includes(q)),
    planets: planets.filter((p) => p.name.toLowerCase().includes(q)),
    missions: missions.filter((m) => m.name.toLowerCase().includes(q) || m.agency.toLowerCase().includes(q)),
    astronauts: astronauts.filter((a) => a.name.toLowerCase().includes(q)),
    agencies: agencies.filter((a) => a.name.toLowerCase().includes(q) || a.abbreviation.toLowerCase().includes(q)),
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  const sections = [
    { key: "rockets", data: results.rockets, icon: Rocket, href: (s: string) => `/rockets/${s}`, color: "text-accent-blue" },
    { key: "planets", data: results.planets, icon: Globe2, href: (s: string) => `/solar-system/${s}`, color: "text-accent-cyan" },
    { key: "missions", data: results.missions, icon: Telescope, href: (s: string) => `/missions/${s}`, color: "text-accent-purple" },
    { key: "astronauts", data: results.astronauts, icon: Users, href: (s: string) => `/astronauts/${s}`, color: "text-accent-amber" },
    { key: "agencies", data: results.agencies, icon: Building2, href: (s: string) => `/agencies/${s}`, color: "text-accent-green" },
  ];

  return (
    <>
      <p className="text-space-400 mb-8">{totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{q}&quot;</p>
      {sections.map(({ key, data, icon: Icon, href, color }) => data.length > 0 && (
        <div key={key} className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4 capitalize flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} /> {key}
          </h2>
          <div className="space-y-3">
            {data.map((item: { slug: string; name: string; description?: string }, i: number) => (
              <motion.div key={item.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={href(item.slug)} className="glass-card glass-card-hover p-4 block group">
                  <h3 className="text-white font-medium group-hover:text-accent-blue transition-colors">{item.name}</h3>
                  {item.description && <p className="text-sm text-space-400 line-clamp-1 mt-1">{item.description}</p>}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      {totalResults === 0 && (
        <div className="text-center py-20 text-space-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No results found. Try a different search term.</p>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
        <Suspense fallback={<div className="skeleton h-8 w-64 mt-4" />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
