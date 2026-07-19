"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Zap, Wind, Activity, Shield, AlertTriangle, Radio, ChevronDown, Info, ExternalLink } from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";
import { useSpaceWeather } from "@/lib/hooks/use-space-query";
import Image from "next/image";

interface CME {
  activityID: string;
  startTime: string;
  sourceLocation?: string;
  note?: string;
  link?: string;
  cmeAnalyses?: { type: string; speed: number; halfAngle: number; isMostAccurate: boolean }[];
}

interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  classType: string;
  sourceLocation?: string;
  link?: string;
}

interface GeoStorm {
  gstID: string;
  startTime: string;
  link?: string;
  allKpIndex?: { kpIndex: number; observedTime: string; source: string }[];
}

export default function SpaceWeather() {
  const { data, isLoading: loading } = useSpaceWeather();
  const cmes = (data?.cmes ?? []) as CME[];
  const flares = (data?.flares ?? []) as SolarFlare[];
  const storms = (data?.storms ?? []) as GeoStorm[];
  const [activeTab, setActiveTab] = useState<"cme" | "flares" | "storms">("cme");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tabs = [
    { id: "cme" as const, label: "Coronal Mass Ejections", icon: Sun, count: cmes.length, desc: "Massive bursts of solar wind and magnetic fields" },
    { id: "flares" as const, label: "Solar Flares", icon: Zap, count: flares.length, desc: "Intense bursts of radiation from the Sun" },
    { id: "storms" as const, label: "Geomagnetic Storms", icon: Wind, count: storms.length, desc: "Disturbances in Earth's magnetosphere" },
  ];

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return d; }
  };

  const formatFull = (d: string) => {
    try { return new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }); } catch { return d; }
  };

  const getKpDescription = (kp: number) => {
    if (kp >= 9) return { level: "Extreme (G5)", color: "text-red-400" };
    if (kp >= 8) return { level: "Severe (G4)", color: "text-red-400" };
    if (kp >= 7) return { level: "Strong (G3)", color: "text-orange-400" };
    if (kp >= 6) return { level: "Moderate (G2)", color: "text-amber-400" };
    if (kp >= 5) return { level: "Minor (G1)", color: "text-yellow-400" };
    return { level: "Below Storm", color: "text-cyan-400" };
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
                <Image
          src="/solar-weather.png"
          alt="Solar Activity and Coronal Mass Ejections"
          fill className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
            <Sun className="w-3 h-3" /> NASA DONKI
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-white tracking-widest">SPACE WEATHER</h3>
          <p className="text-space-400 text-sm mt-1 max-w-md">Solar activity data from the Space Weather Database Of Notifications, Knowledge, Information</p>
        </div>
      </div>

      {/* NASA Solar Imagery */}
      <NasaImageBanner query="solar flare coronal mass ejection sun" count={6} title="NASA Solar Observatory" cols={6} />

      {/* Educational Info */}
      <div className="glass-card p-5 mb-8 border border-amber-500/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Understanding Space Weather</h4>
            <p className="text-xs text-space-400 leading-relaxed">
              Space weather describes conditions on the Sun and in the solar wind that can affect Earth. <strong className="text-space-300">Coronal Mass Ejections (CMEs)</strong> are
              giant clouds of magnetized plasma ejected from the Sun at millions of km/h. <strong className="text-space-300">Solar Flares</strong> are intense
              bursts of radiation classified from weakest to strongest as A, B, C, M, and X. <strong className="text-space-300">Geomagnetic Storms</strong> occur
              when CMEs impact Earth&apos;s magnetosphere, measured on the Kp index (0–9) — Kp ≥ 5 triggers aurora visible at mid-latitudes.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Summary Cards — using hardcoded colors to avoid Tailwind purge issues */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setActiveTab("cme")}
          className={`glass-card p-5 text-center transition-all duration-300 cursor-pointer ${
            activeTab === "cme" ? "border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.08)]" : "border-space-500/20 hover:border-white/20"
          }`}
        >
          <Sun className={`w-6 h-6 mx-auto mb-2 ${activeTab === "cme" ? "text-amber-400" : "text-space-500"}`} />
          <div className="text-2xl font-bold gradient-text">{cmes.length}</div>
          <div className="text-[9px] font-micro text-space-500 uppercase tracking-widest mt-1">CMEs</div>
        </button>
        <button
          onClick={() => setActiveTab("flares")}
          className={`glass-card p-5 text-center transition-all duration-300 cursor-pointer ${
            activeTab === "flares" ? "border-pink-500/40 shadow-[0_0_30px_rgba(236,72,153,0.08)]" : "border-space-500/20 hover:border-white/20"
          }`}
        >
          <Zap className={`w-6 h-6 mx-auto mb-2 ${activeTab === "flares" ? "text-pink-400" : "text-space-500"}`} />
          <div className="text-2xl font-bold gradient-text">{flares.length}</div>
          <div className="text-[9px] font-micro text-space-500 uppercase tracking-widest mt-1">Flares</div>
        </button>
        <button
          onClick={() => setActiveTab("storms")}
          className={`glass-card p-5 text-center transition-all duration-300 cursor-pointer ${
            activeTab === "storms" ? "border-cyan-500/40 shadow-[0_0_30px_rgba(56,189,248,0.08)]" : "border-space-500/20 hover:border-white/20"
          }`}
        >
          <Wind className={`w-6 h-6 mx-auto mb-2 ${activeTab === "storms" ? "text-cyan-400" : "text-space-500"}`} />
          <div className="text-2xl font-bold gradient-text">{storms.length}</div>
          <div className="text-[9px] font-micro text-space-500 uppercase tracking-widest mt-1">Storms</div>
        </button>
      </div>

      {/* Tab description */}
      <div className="text-xs text-space-400 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        {tabs.find(t => t.id === activeTab)?.desc} — last 30 days
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-t-2 border-accent-amber rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {/* ── CME Tab ── */}
          {activeTab === "cme" && cmes.length === 0 && (
            <div className="text-center py-16">
              <Shield className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
              <p className="text-space-300 font-medium">No CMEs Detected</p>
              <p className="text-space-500 text-sm mt-1">The Sun has been quiet in the past 30 days</p>
            </div>
          )}
          {activeTab === "cme" && cmes.map((event, i) => {
            const isExpanded = expandedId === event.activityID;
            const analysis = event.cmeAnalyses?.find(a => a.isMostAccurate) || event.cmeAnalyses?.[0];
            return (
              <motion.div
                key={event.activityID}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card border border-amber-500/20 overflow-hidden cursor-pointer hover:border-amber-500/40 transition-colors"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`CME ${event.activityID}, speed ${analysis ? analysis.speed + ' km/s' : 'unknown'}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
                onClick={() => setExpandedId(isExpanded ? null : event.activityID)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : event.activityID); } }}
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
                      <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{formatDate(event.startTime)}</span>
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
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-amber-500/10"
                    >
                      <div className="p-5 pt-4 bg-amber-500/[0.02] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Start Time</div>
                          <div className="text-white font-mono">{formatFull(event.startTime)}</div>
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
          })}

          {/* ── Solar Flares Tab ── */}
          {activeTab === "flares" && flares.length === 0 && (
            <div className="text-center py-16">
              <Shield className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
              <p className="text-space-300 font-medium">No Solar Flares Detected</p>
              <p className="text-space-500 text-sm mt-1">The Sun has been calm in the past 30 days</p>
            </div>
          )}
          {activeTab === "flares" && flares.map((flare, i) => {
            const isStrong = flare.classType?.startsWith("X") || flare.classType?.startsWith("M");
            const isExpanded = expandedId === flare.flrID;
            return (
              <motion.div
                key={flare.flrID}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card overflow-hidden cursor-pointer hover:border-pink-500/40 transition-colors ${isStrong ? "border-red-500/30" : "border-pink-500/20"}`}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${flare.classType} solar flare${isStrong ? ' (strong)' : ''}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
                onClick={() => setExpandedId(isExpanded ? null : flare.flrID)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : flare.flrID); } }}
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
                    <div className="font-mono">{formatDate(flare.beginTime)}</div>
                    <div className="text-[10px] text-space-500 mt-0.5">Peak: {formatDate(flare.peakTime)}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-pink-500/10"
                    >
                      <div className="p-5 pt-4 bg-pink-500/[0.02] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Begin</div>
                          <div className="text-white font-mono">{formatFull(flare.beginTime)}</div>
                        </div>
                        <div>
                          <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Peak</div>
                          <div className="text-pink-400 font-mono font-bold">{formatFull(flare.peakTime)}</div>
                        </div>
                        <div>
                          <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">End</div>
                          <div className="text-white font-mono">{flare.endTime ? formatFull(flare.endTime) : "Ongoing"}</div>
                        </div>
                        <div>
                          <div className="text-space-500 mb-1 font-micro uppercase tracking-widest text-[9px]">Class</div>
                          <div className={`font-mono font-bold ${isStrong ? "text-red-400" : "text-pink-400"}`}>{flare.classType}</div>
                          <div className="text-[10px] text-space-500 mt-0.5">
                            {flare.classType?.startsWith("X") ? "Most intense — can cause radio blackouts" :
                             flare.classType?.startsWith("M") ? "Moderate — may cause brief radio blackouts" :
                             flare.classType?.startsWith("C") ? "Small — minor effects" : "Minimal impact"}
                          </div>
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
          })}

          {/* ── Geomagnetic Storms Tab ── */}
          {activeTab === "storms" && storms.length === 0 && (
            <div className="text-center py-16">
              <Shield className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
              <p className="text-space-300 font-medium">No Geomagnetic Storms</p>
              <p className="text-space-500 text-sm mt-1">Earth&apos;s magnetosphere is calm right now</p>
            </div>
          )}
          {activeTab === "storms" && storms.map((storm, i) => {
            const isExpanded = expandedId === storm.gstID;
            const maxKp = storm.allKpIndex ? Math.max(...storm.allKpIndex.map(k => k.kpIndex)) : 0;
            const kpInfo = getKpDescription(maxKp);
            return (
              <motion.div
                key={storm.gstID}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card overflow-hidden border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-colors"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`Geomagnetic storm ${storm.gstID}, max Kp ${maxKp}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
                onClick={() => setExpandedId(isExpanded ? null : storm.gstID)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : storm.gstID); } }}
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
                  <span className="text-xs font-mono text-space-400 shrink-0">{formatDate(storm.startTime)}</span>
                  <ChevronDown className={`w-4 h-4 text-space-500 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-cyan-500/10"
                    >
                      <div className="p-5 pt-4 bg-cyan-500/[0.02]">
                        <div className="text-space-500 mb-2 font-micro uppercase tracking-widest text-[9px]">Kp Index Timeline</div>
                        <div className="space-y-2">
                          {storm.allKpIndex?.map((kp, ki) => {
                            const kpDesc = getKpDescription(kp.kpIndex);
                            const barWidth = `${(kp.kpIndex / 9) * 100}%`;
                            return (
                              <div key={ki} className="flex items-center gap-3 text-xs">
                                <span className="text-space-500 font-mono w-32 shrink-0">{formatDate(kp.observedTime)}</span>
                                <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${kp.kpIndex >= 7 ? "bg-red-500" : kp.kpIndex >= 5 ? "bg-amber-500" : "bg-cyan-500"}`}
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
          })}
        </motion.div>
      )}
    </div>
  );
}
