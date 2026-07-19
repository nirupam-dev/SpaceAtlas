"use client";

/**
 * ─── SpaceWeather (Container Component) ─────────────────────────
 *
 * Thin container that fetches data via the useSpaceWeather hook
 * and delegates all rendering to presentational sub-components.
 *
 * Refactored from a 434-line monolith into a composable architecture:
 * - Business logic → lib/utils/space-weather-utils.ts
 * - Reusable UI → components/ui/cards/
 * - This file → data wiring + tab state management only
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Zap, Wind, Activity, Shield, AlertTriangle, Radio, ChevronDown, Info, ExternalLink } from "lucide-react";
import { useSpaceWeather } from "@/lib/hooks/use-space-query";
import { HeroBanner, EducationalInfo, LoadingSpinner, EmptyState } from "@/components/ui/cards";
import NasaImageBanner from "./NasaImageBanner";
import { ANIMATION, KP_BAR_COLORS, KP_THRESHOLDS } from "@/lib/constants";
import {
  type CME, type SolarFlare, type GeoStorm,
  getKpDescription, isStrongFlare, getFlareImpactDescription,
  getMostAccurateAnalysis, getMaxKp,
  formatShortDate, formatFullDate,
} from "@/lib/utils/space-weather-utils";

// ─── Tab Configuration ────────────────────────────────────────

const TABS = [
  { id: "cme" as const, label: "Coronal Mass Ejections", icon: Sun, count: 0, desc: "Massive bursts of solar wind and magnetic fields" },
  { id: "flares" as const, label: "Solar Flares", icon: Zap, count: 0, desc: "Intense bursts of radiation from the Sun" },
  { id: "storms" as const, label: "Geomagnetic Storms", icon: Wind, count: 0, desc: "Disturbances in Earth's magnetosphere" },
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
          {activeTab === "cme" && cmes.map((event, i) => {
            const isExpanded = expandedId === event.activityID;
            const analysis = getMostAccurateAnalysis(event.cmeAnalyses);
            return (
              <CMECard key={event.activityID} event={event} analysis={analysis} index={i} isExpanded={isExpanded} onToggle={toggleExpand} />
            );
          })}

          {/* ── Solar Flares Tab ── */}
          {activeTab === "flares" && flares.length === 0 && (
            <EmptyState title="No Solar Flares Detected" subtitle="The Sun has been calm in the past 30 days" />
          )}
          {activeTab === "flares" && flares.map((flare, i) => {
            const isExpanded = expandedId === flare.flrID;
            return (
              <FlareCard key={flare.flrID} flare={flare} index={i} isExpanded={isExpanded} onToggle={toggleExpand} />
            );
          })}

          {/* ── Geomagnetic Storms Tab ── */}
          {activeTab === "storms" && storms.length === 0 && (
            <EmptyState title="No Geomagnetic Storms" subtitle="Earth's magnetosphere is calm right now" />
          )}
          {activeTab === "storms" && storms.map((storm, i) => {
            const isExpanded = expandedId === storm.gstID;
            return (
              <StormCard key={storm.gstID} storm={storm} index={i} isExpanded={isExpanded} onToggle={toggleExpand} />
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ─── CME Card (Presentational) ────────────────────────────────

function CMECard({ event, analysis, index, isExpanded, onToggle }: {
  event: CME;
  analysis: ReturnType<typeof getMostAccurateAnalysis>;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.LIST_STAGGER_DELAY }}
      className="glass-card border border-amber-500/20 overflow-hidden cursor-pointer hover:border-amber-500/40 transition-colors"
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`CME ${event.activityID}, speed ${analysis ? analysis.speed + ' km/s' : 'unknown'}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onClick={() => onToggle(event.activityID)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(event.activityID); } }}
    >
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Sun className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-white">{event.activityID}</span>
            {event.sourceLocation && (
              <span className="text-[10px] font-mono text-amber-400/70">{event.sourceLocation}</span>
            )}
          </div>
          <p className="text-xs text-space-400 line-clamp-2">{event.note || "Coronal Mass Ejection detected"}</p>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-space-500">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{formatShortDate(event.startTime)}</span>
            {analysis && (
              <span className="flex items-center gap-1 font-mono text-amber-400">
                <Radio className="w-3 h-3" />{analysis.speed} km/s
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-amber-500/10">
            <div className="p-5 pt-4 bg-amber-500/[0.02] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Start Time</div>
                <div className="text-white font-mono">{formatFullDate(event.startTime)}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Source</div>
                <div className="text-white font-mono">{event.sourceLocation || "N/A"}</div>
              </div>
              {analysis && (
                <>
                  <div>
                    <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Speed</div>
                    <div className="text-amber-400 font-mono font-bold">{analysis.speed} km/s</div>
                  </div>
                  <div>
                    <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Half Angle</div>
                    <div className="text-white font-mono">{analysis.halfAngle}°</div>
                  </div>
                </>
              )}
              {event.note && (
                <div className="col-span-full">
                  <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Analysis Note</div>
                  <div className="text-space-300 leading-relaxed">{event.note}</div>
                </div>
              )}
              {event.link && (
                <div className="col-span-full">
                  <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]">
                    <ExternalLink className="w-3 h-3" /> View on NASA DONKI
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Flare Card (Presentational) ──────────────────────────────

function FlareCard({ flare, index, isExpanded, onToggle }: {
  flare: SolarFlare;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  const isStrong = isStrongFlare(flare.classType);

  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.LIST_STAGGER_DELAY }}
      className={`glass-card overflow-hidden cursor-pointer hover:border-pink-500/40 transition-colors ${isStrong ? "border-red-500/30" : "border-pink-500/20"}`}
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`${flare.classType} solar flare${isStrong ? ' (strong)' : ''}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onClick={() => onToggle(flare.flrID)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(flare.flrID); } }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isStrong ? "bg-red-500/10 border border-red-500/30" : "bg-pink-500/10 border border-pink-500/20"}`}>
          {isStrong ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Zap className="w-5 h-5 text-pink-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{flare.classType} Flare</span>
            {isStrong && <span className="px-2 py-0.5 rounded-full text-[9px] font-micro bg-red-500/15 text-red-400 border border-red-500/30 uppercase">Strong</span>}
          </div>
          <span className="text-xs text-space-500">{flare.sourceLocation || "—"}</span>
        </div>
        <div className="text-right text-xs text-space-400 shrink-0">
          <div className="font-mono">{formatShortDate(flare.beginTime)}</div>
          <div className="text-[10px] text-space-500 mt-0.5">Peak: {formatShortDate(flare.peakTime)}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-pink-500/10">
            <div className="p-5 pt-4 bg-pink-500/[0.02] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Begin</div>
                <div className="text-white font-mono">{formatFullDate(flare.beginTime)}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Peak</div>
                <div className="text-pink-400 font-mono font-bold">{formatFullDate(flare.peakTime)}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">End</div>
                <div className="text-white font-mono">{flare.endTime ? formatFullDate(flare.endTime) : "Ongoing"}</div>
              </div>
              <div>
                <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Class</div>
                <div className={`font-mono font-bold ${isStrong ? "text-red-400" : "text-pink-400"}`}>{flare.classType}</div>
                <div className="text-[10px] text-space-500 mt-0.5">{getFlareImpactDescription(flare.classType)}</div>
              </div>
              {flare.link && (
                <div className="col-span-full">
                  <a href={flare.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px]">
                    <ExternalLink className="w-3 h-3" /> View on NASA DONKI
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Storm Card (Presentational) ──────────────────────────────

function StormCard({ storm, index, isExpanded, onToggle }: {
  storm: GeoStorm;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  const maxKp = getMaxKp(storm.allKpIndex);
  const kpInfo = getKpDescription(maxKp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -ANIMATION.SLIDE_OFFSET_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * ANIMATION.LIST_STAGGER_DELAY }}
      className="glass-card overflow-hidden border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-colors"
      role="button" tabIndex={0} aria-expanded={isExpanded}
      aria-label={`Geomagnetic storm ${storm.gstID}, max Kp ${maxKp}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onClick={() => onToggle(storm.gstID)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(storm.gstID); } }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <Wind className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-white">{storm.gstID}</span>
          {storm.allKpIndex?.[0] && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-space-400">Max Kp:</span>
              <span className={`text-sm font-bold font-mono ${kpInfo.color}`}>{maxKp}</span>
              <span className={`text-[10px] ${kpInfo.color}`}>— {kpInfo.level}</span>
            </div>
          )}
        </div>
        <span className="text-xs font-mono text-space-400 shrink-0">{formatShortDate(storm.startTime)}</span>
        <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-cyan-500/10">
            <div className="p-5 pt-4 bg-cyan-500/[0.02]">
              <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Kp Index Timeline</div>
              <div className="space-y-2">
                {storm.allKpIndex?.map((kp, ki) => {
                  const kpDesc = getKpDescription(kp.kpIndex);
                  const barWidth = `${(kp.kpIndex / KP_THRESHOLDS.MAX) * 100}%`;
                  return (
                    <div key={ki} className="flex items-center gap-3 text-xs">
                      <span className="text-space-500 font-mono w-32 shrink-0">{formatShortDate(kp.observedTime)}</span>
                      <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${kp.kpIndex >= KP_BAR_COLORS.HIGH ? "bg-red-500" : kp.kpIndex >= KP_BAR_COLORS.MEDIUM ? "bg-amber-500" : "bg-cyan-500"}`}
                          style={{ width: barWidth }}
                        />
                      </div>
                      <span className={`font-mono font-bold w-6 text-right ${kpDesc.color}`}>{kp.kpIndex}</span>
                      <span className="text-space-500 w-20 text-right text-[10px]">{kp.source}</span>
                    </div>
                  );
                })}
              </div>
              {storm.link && (
                <a href={storm.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition-colors text-[11px] mt-4">
                  <ExternalLink className="w-3 h-3" /> View on NASA DONKI
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
