"use client";

/**
 * ─── ExoplanetExplorer (Container Component) ────────────────────
 *
 * Thin container that fetches exoplanet data and delegates rendering
 * to presentational sub-components.
 *
 * Architecture:
 * - Business logic → lib/utils/exoplanet-utils.ts
 * - Presentational card → components/ui/cards/ExoplanetCard
 * - Reusable UI → components/ui/cards/
 * - This file → data wiring + search/filter state only
 */

import { useState } from "react";
import { Star, Search, Telescope, Info } from "lucide-react";
import { useExoplanets } from "@/lib/hooks/use-space-query";
import { HeroBanner, EducationalInfo, LoadingSpinner, ExoplanetCard } from "@/components/ui/cards";
import NasaImageBanner from "./NasaImageBanner";
import { API_LIMITS } from "@/lib/constants";
import {
  type Exoplanet,
  DISCOVERY_METHOD_COLORS, DEFAULT_METHOD_COLOR, countDiscoveryMethods,
} from "@/lib/utils/exoplanet-utils";

export default function ExoplanetExplorer() {
  const { data, isLoading: loading } = useExoplanets(API_LIMITS.EXOPLANETS_FETCH);
  const planets = (Array.isArray(data) ? data : []) as Exoplanet[];
  const [search, setSearch] = useState("");
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const filtered = planets.filter(p =>
    p.pl_name.toLowerCase().includes(search.toLowerCase()) ||
    p.hostname?.toLowerCase().includes(search.toLowerCase()) ||
    p.discoverymethod?.toLowerCase().includes(search.toLowerCase())
  );

  const methods = countDiscoveryMethods(planets);
  const toggleExpand = (name: string) => setExpandedName(prev => (prev === name ? null : name));

  return (
    <div>
      <HeroBanner
        imageSrc="/exoplanet-scene.png" imageAlt="Exoplanet orbiting a distant star"
        badge={{ icon: Star, text: "NASA Exoplanet Archive", colorClasses: "bg-accent-purple/10 text-accent-purple border-accent-purple/30" }}
        title="EXOPLANET EXPLORER"
        description="Confirmed worlds orbiting distant stars — from NASA&apos;s Exoplanet Archive"
      />
      <NasaImageBanner query="exoplanet artist concept JWST" count={6} title="NASA Exoplanet Imagery" cols={6} />

      <EducationalInfo icon={Info} title="Understanding Exoplanets" borderColor="border-accent-purple/10" iconColor="text-accent-purple">
        <strong className="text-space-300">Exoplanets</strong> are worlds orbiting stars beyond our Sun. Over 5,700 have been confirmed.{" "}
        <strong className="text-space-300">R⊕</strong> = Earth radii (planet size vs Earth).{" "}
        <strong className="text-space-300">M⊕</strong> = Earth masses. The{" "}
        <strong className="text-space-300">habitable zone</strong> is where liquid water could exist (200–320 K surface temperature).
        Planets are classified as Terrestrial, Super-Earth, Sub-Neptune, Neptune-like, or Gas Giant based on radius.
      </EducationalInfo>

      {/* Search + Method chips */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(methods).sort((a, b) => b[1] - a[1]).slice(0, API_LIMITS.DISCOVERY_METHODS_DISPLAY).map(([method, count]) => (
            <span key={method} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-micro uppercase tracking-widest border ${DISCOVERY_METHOD_COLORS[method] || DEFAULT_METHOD_COLOR}`}>
              <Telescope className="w-3 h-3" /> {method}: {count}
            </span>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search planets, stars, methods..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-space-500 focus:outline-none focus:border-accent-blue/40 transition-colors" />
        </div>
      </div>

      {loading && <LoadingSpinner color="border-accent-purple" />}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, API_LIMITS.EXOPLANETS_DISPLAY).map((planet, i) => (
            <ExoplanetCard key={planet.pl_name} planet={planet} index={i} isExpanded={expandedName === planet.pl_name} onToggle={toggleExpand} />
          ))}
        </div>
      )}
    </div>
  );
}
