"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Satellite, Gauge, Navigation, Clock, Users } from "lucide-react";
import Link from "next/link";

interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

// Rough continent bounding boxes [minLng, maxLat, maxLng, minLat]
const CONTINENTS: [number, number, number, number][] = [
  [-168, 72, -52, 15],
  [-82,  13, -34, -56],
  [-12,  72,  40,  35],
  [-18,  38,  52, -35],
  [ 26,  78, 180, -10],
  [113, -10, 155, -45],
  [-180, -60, 180, -90],
];

function toX(lng: number, W: number) { return ((lng + 180) / 360) * W; }
function toY(lat: number, H: number) { return ((90 - lat) / 180) * H; }

export default function ISSPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<ISSData | null>(null);
  const [trail, setTrail] = useState<{ lat: number; lng: number }[]>([]);
  const [tick, setTick] = useState(0);
  const [error, setError] = useState(false);

  // Fetch ISS position every 5 s
  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!res.ok) throw new Error();
        const j = await res.json();
        const pos: ISSData = {
          latitude:  j.latitude,
          longitude: j.longitude,
          altitude:  Math.round(j.altitude),
          velocity:  Math.round(j.velocity),
          timestamp: j.timestamp,
        };
        setData(pos);
        setTrail(prev => [...prev, { lat: pos.latitude, lng: pos.longitude }].slice(-80));
        setTick(t => t + 1);
        setError(false);
      } catch {
        setError(true);
      }
    };
    fetchISS();
    const id = setInterval(fetchISS, 5000);
    return () => clearInterval(id);
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, W, H);

    // Continents
    CONTINENTS.forEach(([mnLng, mxLat, mxLng, mnLat]) => {
      ctx.fillStyle = "rgba(30,58,100,0.55)";
      ctx.beginPath();
      // @ts-ignore
      ctx.roundRect(toX(mnLng, W), toY(mxLat, H), toX(mxLng, W) - toX(mnLng, W), toY(mnLat, H) - toY(mxLat, H), 3);
      ctx.fill();
    });

    // Grid
    ctx.lineWidth = 0.5;
    for (let lat = -90; lat <= 90; lat += 30) {
      ctx.beginPath(); ctx.moveTo(0, toY(lat, H)); ctx.lineTo(W, toY(lat, H));
      ctx.strokeStyle = lat === 0 ? "rgba(56,189,248,0.3)" : "rgba(56,189,248,0.07)";
      ctx.stroke();
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      ctx.beginPath(); ctx.moveTo(toX(lng, W), 0); ctx.lineTo(toX(lng, W), H);
      ctx.strokeStyle = lng === 0 ? "rgba(56,189,248,0.3)" : "rgba(56,189,248,0.07)";
      ctx.stroke();
    }

    // Trail
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const p = trail[i - 1], c = trail[i];
        if (Math.abs(c.lng - p.lng) > 180) continue; // skip antimeridian jump
        ctx.beginPath();
        ctx.moveTo(toX(p.lng, W), toY(p.lat, H));
        ctx.lineTo(toX(c.lng, W), toY(c.lat, H));
        ctx.strokeStyle = `rgba(56,189,248,${(i / trail.length) * 0.65})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    if (!data) return;
    const x = toX(data.longitude, W), y = toY(data.latitude, H);

    // Outer glow
    const g1 = ctx.createRadialGradient(x, y, 0, x, y, 42);
    g1.addColorStop(0, "rgba(56,189,248,0.3)"); g1.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(x, y, 42, 0, Math.PI * 2); ctx.fillStyle = g1; ctx.fill();

    // Inner glow
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, 14);
    g2.addColorStop(0, "rgba(56,189,248,0.9)"); g2.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fillStyle = g2; ctx.fill();

    // Dot
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2; ctx.stroke();

    // Crosshair
    ctx.strokeStyle = "rgba(56,189,248,0.6)"; ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    [[x-20,y,x-8,y],[x+8,y,x+20,y],[x,y-20,x,y-8],[x,y+8,x,y+20]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
    ctx.setLineDash([]);

  }, [data, trail]);

  const fmt = (val: number, p: string, n: string) =>
    `${Math.abs(val).toFixed(4)}° ${val >= 0 ? p : n}`;

  const stats = data ? [
    { icon: Navigation, label: "Latitude",  value: fmt(data.latitude,  "N", "S") },
    { icon: Navigation, label: "Longitude", value: fmt(data.longitude, "E", "W") },
    { icon: Satellite,  label: "Altitude",  value: `${data.altitude} km` },
    { icon: Gauge,      label: "Velocity",  value: `${data.velocity.toLocaleString()} km/h` },
    { icon: Users,      label: "Crew",      value: "7 aboard" },
    { icon: Clock,      label: "Last Update", value: new Date().toLocaleTimeString() },
  ] : [];

  return (
    <div className="min-h-screen bg-[#020617] pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/" className="p-2 rounded-full text-space-400 hover:text-white hover:bg-space-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block" />
              <span className="text-[10px] font-micro text-emerald-400 tracking-[3px] uppercase">Live Telemetry</span>
            </div>
            <h1 className="text-4xl font-display gradient-text tracking-widest">ISS LIVE TRACKER</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Canvas Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden border border-space-500/30 shadow-[0_0_60px_rgba(56,189,248,0.08)] relative"
          >
            <canvas ref={canvasRef} width={900} height={450} className="w-full h-auto block" />

            {/* HUD overlays */}
            <div className="absolute top-3 left-3 text-[9px] font-micro text-accent-blue/50 tracking-widest uppercase space-y-0.5 pointer-events-none">
              <div>90°N</div>
            </div>
            <div className="absolute bottom-3 left-3 text-[9px] font-micro text-accent-blue/50 tracking-widest uppercase pointer-events-none">
              90°S
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
              <span className="w-8 h-[1px] bg-accent-blue/40 block" />
              <span className="text-[9px] font-micro text-accent-blue/40 tracking-widest uppercase">Mercator Projection</span>
            </div>

            {!data && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#020617]/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-10 h-10 border-t-2 border-accent-blue rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-space-400 font-micro text-xs tracking-widest uppercase">Acquiring Signal...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#020617]/70 backdrop-blur-sm">
                <p className="text-red-400 font-micro text-xs tracking-widest uppercase">Signal Lost — Retrying...</p>
              </div>
            )}
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Live badge */}
            <div className="glass-card p-4 text-center border border-emerald-500/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block" />
                <span className="text-emerald-400 font-micro text-[10px] tracking-widest uppercase">Live • Updates every 5s</span>
              </div>
              <div className="text-4xl font-display gradient-text">{tick > 0 ? `#${tick}` : "—"}</div>
              <div className="text-[10px] text-space-500 font-micro uppercase tracking-widest mt-1">Data Packets Received</div>
            </div>

            {/* Telemetry */}
            {stats.map(({ icon: Icon, label, value }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 border border-space-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-accent-blue" />
                  <span className="text-[9px] font-micro text-space-500 uppercase tracking-widest">{label}</span>
                </div>
                <div className="text-sm font-medium text-white font-mono">{value}</div>
              </motion.div>
            ))}

            {/* Fun fact */}
            <div className="glass-card p-4 border border-accent-purple/20 mt-auto">
              <p className="text-[10px] font-micro text-accent-purple uppercase tracking-widest mb-2">Did you know?</p>
              <p className="text-xs text-space-300 leading-relaxed">
                The ISS orbits Earth at ~28,000 km/h, completing a full orbit every 90 minutes — 16 sunrises and sunsets per day.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-6 flex items-center gap-8 text-[10px] font-micro text-space-500 uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <span className="w-8 h-[2px] bg-accent-blue/60 rounded block" />
            <span>Orbital Trail</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent-blue/40 border border-white block" />
            <span>ISS Position</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-2.5 rounded-sm bg-[rgba(30,58,100,0.55)] block" />
            <span>Landmass</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
