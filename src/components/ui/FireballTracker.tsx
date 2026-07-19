"use client";

/**
 * ─── FireballTracker (Container Component) ──────────────────────
 *
 * Thin container that fetches fireball data and delegates rendering
 * to presentational sub-components.
 *
 * Architecture:
 * - Business logic → lib/utils/fireball-utils.ts
 * - Presentational card → components/ui/cards/FireballCard
 * - Reusable UI → components/ui/cards/
 * - This file → data wiring + expand state only
 */

import { useState, useMemo } from "react";
import { Zap, Info, Flame, Mountain, Gauge } from "lucide-react";
import { useFireballs } from "@/lib/hooks/use-space-query";
import { HeroBanner, EducationalInfo, StatBlock, LoadingSpinner, FireballCard } from "@/components/ui/cards";
import NasaImageBanner from "./NasaImageBanner";
import { API_LIMITS } from "@/lib/constants";
import { parseFireballData, computeFireballStats } from "@/lib/utils/fireball-utils";

export default function FireballTracker() {
  const { data, isLoading: loading } = useFireballs();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const fireballs = useMemo(() => {
    if (!data?.data || !data?.fields) return [];
    return parseFireballData(data.fields as string[], data.data as string[][]).slice(0, API_LIMITS.FIREBALLS_DISPLAY);
  }, [data]);

  const stats = computeFireballStats(fireballs);
  const toggleExpand = (idx: number) => setExpandedIdx(prev => (prev === idx ? null : idx));

  if (loading) return <LoadingSpinner color="border-accent-amber" />;

  return (
    <div>
      <HeroBanner
        imageSrc="/fireball-meteor.png" imageAlt="Fireball meteor streaking across the sky"
        badge={{ icon: Zap, text: "NASA CNEOS", colorClasses: "bg-amber-500/10 text-amber-400 border-amber-500/30" }}
        title="FIREBALL TRACKER"
        description="Meteor and bolide impacts detected by US government sensors worldwide"
        topRight={
          <span className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-amber-500/30 text-[10px] font-micro text-amber-400 uppercase tracking-widest">
            {fireballs.length} Events
          </span>
        }
      />
      <NasaImageBanner query="meteor bolide fireball atmosphere" count={6} title="NASA Meteor Imagery" cols={6} />

      <EducationalInfo icon={Info} title="Understanding Fireballs & Bolides" borderColor="border-amber-500/10" iconColor="text-amber-400">
        <strong className="text-space-300">Fireballs</strong> are exceptionally bright meteors (brighter than Venus, magnitude −4).{" "}
        <strong className="text-space-300">Bolides</strong> are fireballs that explode in the atmosphere with a visible flash.{" "}
        <strong className="text-space-300">Impact energy</strong> is measured in kilotons (kT) of TNT equivalent.
        For reference, the 2013 Chelyabinsk event was ~440 kT. NASA&apos;s CNEOS records all events detected by US government sensors.
      </EducationalInfo>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBlock icon={Flame} value={fireballs.length} label="Events" iconColor="text-amber-400" borderColor="border-amber-500/20" />
        <StatBlock icon={Zap} value={stats.totalEnergy.toFixed(1)} label="Total kT" iconColor="text-orange-400" valueColor="text-orange-400" borderColor="border-orange-500/20" />
        <StatBlock icon={Mountain} value={stats.maxImpact.toFixed(2)} label="Max kT" iconColor="text-red-400" valueColor="text-red-400" borderColor="border-red-500/20" />
        <StatBlock icon={Gauge} value={stats.avgVelocity} label="Avg km/s" iconColor="text-cyan-400" valueColor="text-cyan-400" borderColor="border-cyan-500/20" />
      </div>

      <div className="space-y-3">
        {fireballs.map((fb, i) => (
          <FireballCard key={`${fb.date}-${i}`} fb={fb} index={i} allFireballs={fireballs} isExpanded={expandedIdx === i} onToggle={toggleExpand} />
        ))}
      </div>
    </div>
  );
}
