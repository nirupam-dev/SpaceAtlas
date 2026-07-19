"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Zap, Wind, Activity, Shield, AlertTriangle, Radio } from "lucide-react";
import NasaImageBanner from "./NasaImageBanner";

interface CME {
  activityID: string;
  startTime: string;
  sourceLocation?: string;
  note?: string;
  cmeAnalyses?: { type: string; speed: number; halfAngle: number }[];
}

interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  classType: string;
  sourceLocation?: string;
}

interface GeoStorm {
  gstID: string;
  startTime: string;
  allKpIndex?: { kpIndex: number; observedTime: string; source: string }[];
}

export default function SpaceWeather() {
  const [cmes, setCmes] = useState<CME[]>([]);
  const [flares, setFlares] = useState<SolarFlare[]>([]);
  const [storms, setStorms] = useState<GeoStorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cme" | "flares" | "storms">("cme");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cmeRes, flrRes, gstRes] = await Promise.allSettled([
          fetch("/api/space-weather?type=CME"),
          fetch("/api/space-weather?type=FLR"),
          fetch("/api/space-weather?type=GST"),
        ]);
        if (cmeRes.status === "fulfilled" && cmeRes.value.ok) {
          const d = await cmeRes.value.json();
          setCmes(Array.isArray(d) ? d.slice(0, 20) : []);
        }
        if (flrRes.status === "fulfilled" && flrRes.value.ok) {
          const d = await flrRes.value.json();
          setFlares(Array.isArray(d) ? d.slice(0, 20) : []);
        }
        if (gstRes.status === "fulfilled" && gstRes.value.ok) {
          const d = await gstRes.value.json();
          setStorms(Array.isArray(d) ? d.slice(0, 20) : []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const tabs = [
    { id: "cme" as const, label: "Coronal Mass Ejections", icon: Sun, count: cmes.length, color: "accent-amber" },
    { id: "flares" as const, label: "Solar Flares", icon: Zap, count: flares.length, color: "accent-pink" },
    { id: "storms" as const, label: "Geomagnetic Storms", icon: Wind, count: storms.length, color: "accent-cyan" },
  ];

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return d; }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/solar-weather.png"
          alt="Solar Activity and Coronal Mass Ejections"
          className="w-full h-full object-cover"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`glass-card p-5 text-center transition-all duration-300 cursor-pointer ${
              activeTab === tab.id
                ? `border-${tab.color}/40 shadow-[0_0_30px_rgba(56,189,248,0.08)]`
                : "border-space-500/20 hover:border-white/20"
            }`}
          >
            <tab.icon className={`w-6 h-6 mx-auto mb-2 ${activeTab === tab.id ? `text-${tab.color}` : "text-space-500"}`} />
            <div className="text-2xl font-bold gradient-text">{tab.count}</div>
            <div className="text-[9px] font-micro text-space-500 uppercase tracking-widest mt-1">{tab.label}</div>
          </button>
        ))}
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
          {activeTab === "cme" && cmes.map((event, i) => (
            <motion.div
              key={event.activityID}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 border border-amber-500/20"
            >
              <div className="flex items-start gap-4">
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
                    {event.cmeAnalyses?.[0] && (
                      <span className="flex items-center gap-1 font-mono text-accent-amber">
                        <Radio className="w-3 h-3" />{event.cmeAnalyses[0].speed} km/s
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {activeTab === "flares" && flares.length === 0 && (
            <div className="text-center py-16">
              <Shield className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
              <p className="text-space-300 font-medium">No Solar Flares Detected</p>
              <p className="text-space-500 text-sm mt-1">The Sun has been calm in the past 30 days</p>
            </div>
          )}

          {activeTab === "flares" && flares.map((flare, i) => {
            const isStrong = flare.classType?.startsWith("X") || flare.classType?.startsWith("M");
            return (
              <motion.div
                key={flare.flrID}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card p-5 ${isStrong ? "border-red-500/30" : "border-pink-500/20"}`}
              >
                <div className="flex items-center gap-4">
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
                </div>
              </motion.div>
            );
          })}

          {activeTab === "storms" && storms.length === 0 && (
            <div className="text-center py-16">
              <Shield className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
              <p className="text-space-300 font-medium">No Geomagnetic Storms</p>
              <p className="text-space-500 text-sm mt-1">Earth&apos;s magnetosphere is calm right now</p>
            </div>
          )}

          {activeTab === "storms" && storms.map((storm, i) => (
            <motion.div
              key={storm.gstID}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 border border-cyan-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-white">{storm.gstID}</span>
                  {storm.allKpIndex?.[0] && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-space-400">Kp Index:</span>
                      <span className={`text-sm font-bold font-mono ${storm.allKpIndex[0].kpIndex >= 7 ? "text-red-400" : storm.allKpIndex[0].kpIndex >= 5 ? "text-amber-400" : "text-cyan-400"}`}>
                        {storm.allKpIndex[0].kpIndex}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-mono text-space-400 shrink-0">{formatDate(storm.startTime)}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
