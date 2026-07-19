"use client";

/**
 * ─── SpaceWeather (Container Component) ─────────────────────────
 *
 * Thin container that fetches data via the useSpaceWeather hook
 * and delegates all rendering to presentational sub-components.
 *
 * Architecture:
 * - Business logic → lib/utils/space-weather-utils.ts
 * - Presentational cards → components/ui/cards/CMECard, FlareCard, StormCard
 * - Reusable UI → components/ui/cards/
 * - This file → data wiring + tab state management only
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Zap, Wind, Info } from "lucide-react";
import { useSpaceWeather } from "@/lib/hooks/use-space-query";
import { HeroBanner, EducationalInfo, LoadingSpinner, EmptyState, CMECard, FlareCard, StormCard } from "@/components/ui/cards";
import NasaImageBanner from "./NasaImageBanner";
import { ANIMATION } from "@/lib/constants";
import { type CME, type SolarFlare, type GeoStorm, getMostAccurateAnalysis } from "@/lib/utils/space-weather-utils";

// ─── Tab Configuration ────────────────────────────────────────

const TABS = [
  { id: "cme" as const, label: "Coronal Mass Ejections", icon: Sun, desc: "Massive bursts of solar wind and magnetic fields" },
  { id: "flares" as const, label: "Solar Flares", icon: Zap, desc: "Intense bursts of radiation from the Sun" },
  { id: "storms" as const, label: "Geomagnetic Storms", icon: Wind, desc: "Disturbances in Earth's magnetosphere" },
] as const;

type WeatherTab = (typeof TABS)[number]["id"];

const TAB_STYLES: Record<WeatherTab, { active: string; icon: string }> = {
  cme: {
    active: "border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.08)]",
    icon: "text-amber-400",
  },
  flares: {
    active: "border-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.08)]",
    icon: "text-pink-400",
  },
  storms: {
    active: "border-cyan-500/40 shadow-[0_0_30px_rgba(56,189,248,0.08)]",
    icon: "text-cyan-400",
  },
};

// ─── Main Component ───────────────────────────────────────────

export default function SpaceWeather() {
  const { data, isLoading: loading } = useSpaceWeather();
  const cmes = (data?.cmes ?? []) as CME[];
  const flares = (data?.flares ?? []) as SolarFlare[];
  const storms = (data?.storms ?? []) as GeoStorm[];
  const [activeTab, setActiveTab] = useState<WeatherTab>("cme");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts: Record<WeatherTab, number> = { cme: cmes.length, flares: flares.length, storms: storms.length };
  const icons: Record<WeatherTab, typeof Sun> = { cme: Sun, flares: Zap, storms: Wind };
  const labels: Record<WeatherTab, string> = { cme: "CMEs", flares: "Flares", storms: "Storms" };

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div>
      {/* Hero Banner */}
      <HeroBanner
        imageSrc="/solar-weather.png"
        imageAlt="Solar Activity and Coronal Mass Ejections"
        badge={{ icon: Sun, text: "NASA DONKI", colorClasses: "bg-amber-500/10 text-amber-400 border-amber-500/30" }}
        title="SPACE WEATHER"
        description="Solar activity data from the Space Weather Database Of Notifications, Knowledge, Information"
      />

      <NasaImageBanner query="solar flare coronal mass ejection sun" count={6} title="NASA Solar Observatory" cols={6} />

      {/* Educational Info */}
      <EducationalInfo icon={Info} title="Understanding Space Weather" borderColor="border-amber-500/10" iconColor="text-amber-400">
        Space weather describes conditions on the Sun and in the solar wind that can affect Earth. <strong className="text-space-300">Coronal Mass Ejections (CMEs)</strong> are
        giant clouds of magnetized plasma ejected from the Sun at millions of km/h. <strong className="text-space-300">Solar Flares</strong> are intense
        bursts of radiation classified from weakest to strongest as A, B, C, M, and X. <strong className="text-space-300">Geomagnetic Storms</strong> occur
        when CMEs impact Earth&apos;s magnetosphere, measured on the Kp index (0–9) — Kp ≥ 5 triggers aurora visible at mid-latitudes.
      </EducationalInfo>

      {/* Tab Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {TABS.map((tab) => {
          const Icon = icons[tab.id];
          const style = TAB_STYLES[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`glass-card p-5 text-center transition-all duration-300 cursor-pointer ${
                activeTab === tab.id ? style.active : "border-space-500/20 hover:border-white/20"
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${activeTab === tab.id ? style.icon : "text-space-500"}`} />
              <div className="text-2xl font-bold gradient-text">{counts[tab.id]}</div>
              <div className="text-[9px] font-micro text-space-500 uppercase tracking-widest mt-1">{labels[tab.id]}</div>
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="text-xs text-space-400 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        {TABS.find(t => t.id === activeTab)?.desc} — last 30 days
      </div>

      {loading && <LoadingSpinner color="border-accent-amber" />}

      {!loading && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: ANIMATION.SLIDE_OFFSET_Y }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION.TAB_TRANSITION }}
          className="space-y-3"
        >
          {/* ── CME Tab ── */}
          {activeTab === "cme" && cmes.length === 0 && (
            <EmptyState title="No CMEs Detected" subtitle="The Sun has been quiet in the past 30 days" />
          )}
          {activeTab === "cme" && cmes.map((event, i) => (
            <CMECard key={event.activityID} event={event} analysis={getMostAccurateAnalysis(event.cmeAnalyses)} index={i} isExpanded={expandedId === event.activityID} onToggle={toggleExpand} />
          ))}

          {/* ── Solar Flares Tab ── */}
          {activeTab === "flares" && flares.length === 0 && (
            <EmptyState title="No Solar Flares Detected" subtitle="The Sun has been calm in the past 30 days" />
          )}
          {activeTab === "flares" && flares.map((flare, i) => (
            <FlareCard key={flare.flrID} flare={flare} index={i} isExpanded={expandedId === flare.flrID} onToggle={toggleExpand} />
          ))}

          {/* ── Geomagnetic Storms Tab ── */}
          {activeTab === "storms" && storms.length === 0 && (
            <EmptyState title="No Geomagnetic Storms" subtitle="Earth's magnetosphere is calm right now" />
          )}
          {activeTab === "storms" && storms.map((storm, i) => (
            <StormCard key={storm.gstID} storm={storm} index={i} isExpanded={expandedId === storm.gstID} onToggle={toggleExpand} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
