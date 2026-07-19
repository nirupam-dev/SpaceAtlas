"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Rocket, MapPin, Clock, Calendar, ExternalLink,
  CheckCircle, AlertCircle, Timer, Building2,
} from "lucide-react";
import { createLogger } from "@/lib/logger";
import Image from "next/image";

const log = createLogger("LiveLaunches");

interface Launch {
  id: string;
  name: string;
  status: { id: number; name: string; abbrev: string };
  net: string;
  window_start: string;
  window_end: string;
  rocket: { configuration: { name: string; family: string } };
  mission?: {
    name: string;
    description: string;
    orbit?: { name: string; abbrev: string };
    type: string;
  };
  pad?: {
    name: string;
    location: { name: string; country_code: string };
  };
  launch_service_provider?: {
    name: string;
    abbrev: string;
    type: string;
  };
  image?: {
    image_url: string;
    thumbnail_url?: string;
  } | null;
}

const statusColors: Record<number, string> = {
  1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", // Go for launch
  2: "text-amber-400 bg-amber-500/10 border-amber-500/30",      // TBD
  3: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", // Success
  4: "text-red-400 bg-red-500/10 border-red-500/30",            // Failure
  5: "text-space-400 bg-white/5 border-white/10",               // Hold
  6: "text-blue-400 bg-blue-500/10 border-blue-500/30",         // In Flight
  7: "text-space-400 bg-white/5 border-white/10",               // Partial Failure
  8: "text-amber-400 bg-amber-500/10 border-amber-500/30",      // TBC
};

/* ── Fetch a contextual NASA image for a rocket/provider ────── */
async function fetchNasaImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/nasa-images?q=${encodeURIComponent(query)}&media_type=image`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.collection?.items;
    if (!items || items.length === 0) return null;
    // Filter to items that have a preview link
    const withImages = items.filter(
      (item: { links?: { rel: string; href: string }[] }) =>
        item.links?.some((l: { rel: string }) => l.rel === "preview")
    );
    if (withImages.length === 0) return null;
    // Pick a random image from the first 5 results
    const pick = withImages[Math.floor(Math.random() * Math.min(5, withImages.length))];
    const link = pick?.links?.find((l: { rel: string }) => l.rel === "preview")?.href;
    return link || null;
  } catch (err) {
    log.warn("Failed to fetch NASA fallback image", { query, error: String(err) });
    return null;
  }
}

export default function LiveLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [fallbackImages, setFallbackImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/launch-library?limit=12&type=upcoming")
      .then(r => r.json())
      .then(data => { if (data.results) setLaunches(data.results); })
      .catch((err) => { log.error("Failed to fetch launch data", { error: String(err) }); })
      .finally(() => setLoading(false));
  }, []);

  /* Fetch fallback images for launches without images */
  useEffect(() => {
    if (launches.length === 0) return;
    const needImages = launches.filter(l => !l.image?.image_url);
    if (needImages.length === 0) return;

    // Deduplicate by rocket family to avoid redundant fetches
    const queries = new Map<string, string[]>();
    needImages.forEach(l => {
      const key = l.rocket.configuration.family || l.rocket.configuration.name;
      const ids = queries.get(key) || [];
      ids.push(l.id);
      queries.set(key, ids);
    });

    queries.forEach((ids, rocketName) => {
      const searchQuery = `${rocketName} rocket launch`;
      fetchNasaImage(searchQuery).then(url => {
        if (url) {
          setFallbackImages(prev => {
            const next = { ...prev };
            ids.forEach(id => { next[id] = url; });
            return next;
          });
        }
      });
    });
  }, [launches]);

  // Countdown ticker
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-t-2 border-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-display text-white tracking-widest">UPCOMING LAUNCHES</h3>
          <p className="text-space-400 text-sm mt-1">Live countdown data from The Space Devs Launch Library</p>
        </div>
      </div>

      {/* Launch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {launches.map((launch, i) => {
          const launchTime = new Date(launch.net).getTime();
          const diff = launchTime - now;
          const days = Math.max(0, Math.floor(diff / 86400000));
          const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
          const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));
          const seconds = Math.max(0, Math.floor((diff % 60000) / 1000));
          const statusColor = statusColors[launch.status.id] || statusColors[2];
          const imgSrc = launch.image?.image_url || fallbackImages[launch.id];

          return (
            <motion.div
              key={launch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="glass-card overflow-hidden hover:border-accent-blue/30 transition-all duration-300 group"
            >
              {/* Image header */}
              <div className="relative h-52 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/30 to-transparent z-10" />
                {imgSrc ? (
                  <>{ /* eslint-disable-next-line @next/next/no-img-element */ }
                  <img
                    src={imgSrc}
                    alt={launch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0c1222] via-[#162038] to-[#0f172a] flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent-blue/10 rounded-full blur-2xl w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                      <Rocket className="w-14 h-14 text-space-600 relative z-10" />
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 z-20">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest border backdrop-blur-md ${statusColor}`}>
                    {launch.status.abbrev}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Title */}
                <h4 className="text-base font-bold text-white mb-2 leading-snug line-clamp-2">{launch.name}</h4>

                {/* Provider & rocket */}
                <div className="flex items-center gap-3 text-[11px] text-space-500 mb-4">
                  {launch.launch_service_provider && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {launch.launch_service_provider.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Rocket className="w-3 h-3" />
                    {launch.rocket.configuration.name}
                  </span>
                </div>

                {/* Mission */}
                {launch.mission && (
                  <p className="text-xs text-space-400 line-clamp-2 mb-4">{launch.mission.description}</p>
                )}

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  {[
                    { val: days, label: "Days" },
                    { val: hours, label: "Hrs" },
                    { val: minutes, label: "Min" },
                    { val: seconds, label: "Sec" },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <div className="text-lg font-bold font-mono gradient-text">{String(val).padStart(2, "0")}</div>
                      <div className="text-[9px] font-micro text-space-500 uppercase tracking-widest">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-[11px] text-space-500 pt-3 border-t border-space-700">
                  {launch.pad && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-accent-blue shrink-0" />
                      {launch.pad.location.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-accent-blue" />
                    {new Date(launch.net).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  {launch.mission?.orbit && (
                    <span className="flex items-center gap-1 shrink-0 font-mono text-accent-purple">
                      {launch.mission.orbit.abbrev}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
