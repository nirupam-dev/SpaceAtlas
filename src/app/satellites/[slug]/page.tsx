"use client";

import { use, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Satellite,
  Globe,
  Calendar,
  Orbit,
  Radio,
  Weight,
  Gauge,
} from "lucide-react";
import { satellites } from "@/lib/data";
import NasaSearchFallback from "@/components/ui/NasaSearchFallback";
import Image from "next/image";

const typeLabels: Record<string, string> = {
  SPACE_STATION: "Space Station",
  SPACE_TELESCOPE: "Space Telescope",
  COMMUNICATION: "Communication",
  NAVIGATION: "Navigation",
  EARTH_OBSERVATION: "Earth Observation",
  WEATHER: "Weather",
  SCIENTIFIC: "Scientific",
};

const typeColors: Record<string, { text: string; bg: string; border: string }> = {
  SPACE_STATION: { text: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/30" },
  SPACE_TELESCOPE: { text: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/30" },
  COMMUNICATION: { text: "text-sky-400", bg: "bg-sky-500/5", border: "border-sky-500/30" },
  NAVIGATION: { text: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/30" },
  EARTH_OBSERVATION: { text: "text-teal-400", bg: "bg-teal-500/5", border: "border-teal-500/30" },
  WEATHER: { text: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/30" },
  SCIENTIFIC: { text: "text-rose-400", bg: "bg-rose-500/5", border: "border-rose-500/30" },
};

function formatMass(mass: number): string {
  if (mass >= 1000) return `${(mass / 1000).toFixed(1)} t`;
  return `${mass} kg`;
}

function formatAltitude(alt: number): string {
  if (alt >= 1000000) return `${(alt / 1000000).toFixed(1)} million km`;
  return `${alt.toLocaleString()} km`;
}

export default function SatelliteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const satellite = satellites.find((s) => s.slug === slug);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  if (!satellite) {
    return (
      <NasaSearchFallback
        query={slug}
        backLink="/satellites"
        backText="Back to Satellites"
      />
    );
  }

  // Find adjacent satellites for navigation
  const currentIndex = satellites.findIndex((s) => s.slug === slug);
  const prevSat = currentIndex > 0 ? satellites[currentIndex - 1] : null;
  const nextSat =
    currentIndex < satellites.length - 1 ? satellites[currentIndex + 1] : null;

  const launchDate = new Date(satellite.launchDate);
  const tc = typeColors[satellite.type] || { text: "text-space-400", bg: "bg-space-500/5", border: "border-space-500/30" };

  // Primary specs shown in the SpaceX-style overview
  const primarySpecs = [
    {
      label: "ORBIT TYPE",
      value: satellite.orbit,
    },
    {
      label: "ALTITUDE",
      value: formatAltitude(satellite.altitude),
    },
    {
      label: "MASS",
      value: formatMass(satellite.mass),
    },
    {
      label: "LAUNCH DATE",
      value: launchDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
    {
      label: "OPERATIONAL LIFETIME",
      value: satellite.lifetime,
    },
  ];

  return (
    <div className="relative bg-black">
      {/* ═══ HERO SECTION — SpaceX-style split layout ═══ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background: satellite image — right-aligned, tall */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: imageY }}
        >
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={satellite.imageUrl || "/placeholder.jpg"}
              alt={satellite.name}
              fill
              sizes="100vw"
              className="absolute right-0 top-0 w-full md:w-[60%] h-full object-cover object-center opacity-60 md:opacity-80"
              unoptimized
            />
          </div>
          {/* Gradient overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </motion.div>

        {/* Content overlay */}
        <motion.div
          className="relative z-10 w-full px-8 md:px-[8%] lg:px-[10%] pt-32 pb-20"
          style={{ opacity: textOpacity }}
        >
          {/* Back nav */}
          <Link
            href="/satellites"
            className="inline-flex items-center gap-2 text-space-400 hover:text-white transition-colors mb-12 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Satellites
          </Link>

          {/* Type + Status badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-micro tracking-[3px] border ${tc.text} ${tc.border} ${tc.bg}`}
            >
              <Satellite className="w-3.5 h-3.5" />
              {typeLabels[satellite.type] || satellite.type}
            </span>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-micro tracking-[3px] border ${
                satellite.status === "ACTIVE"
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                  : "text-space-400 border-space-500/30 bg-space-500/5"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  satellite.status === "ACTIVE"
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-space-400"
                }`}
              />
              {satellite.status}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-display text-white mt-6 mb-4 leading-[1.05] max-w-[700px]"
          >
            {satellite.name}
            <br />
            <span className="text-space-400">Overview</span>
          </motion.h1>

          {/* Operator line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[13px] font-micro tracking-[3px] text-space-400 mb-10 flex items-center gap-3"
          >
            <Globe className="w-4 h-4 text-accent-blue" />
            {satellite.operator} · {satellite.country}
          </motion.p>

          {/* Purpose */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[15px] text-space-300 leading-[1.9] max-w-[520px] font-light"
          >
            {satellite.purpose}
          </motion.p>

          {/* Primary specs — SpaceX-style rows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 max-w-[480px]"
          >
            {primarySpecs.map((spec, i) => (
              <div key={spec.label}>
                <div className="flex items-center justify-between py-4">
                  <span className="text-[12px] font-micro tracking-[3px] text-space-400">
                    {spec.label}
                  </span>
                  <span className="text-[15px] text-white font-medium tracking-wide">
                    {spec.value}
                  </span>
                </div>
                {i < primarySpecs.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-space-600/60 via-space-500/30 to-transparent" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-6 h-6 text-space-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FULL DESCRIPTION SECTION ═══ */}
      <section className="relative py-24 px-8 md:px-[8%] lg:px-[10%] bg-black">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[11px] font-micro tracking-[4px] text-accent-blue mb-8">
              ABOUT {satellite.name.toUpperCase()}
            </h2>
            <p className="text-[16px] text-space-300 leading-[2] font-light">
              {satellite.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ ORBITAL PARAMETERS & SPECIFICATIONS SECTION ═══ */}
      <section className="relative py-24 px-8 md:px-[8%] lg:px-[10%] border-t border-space-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[11px] font-micro tracking-[4px] text-accent-blue mb-2">
              SPECIFICATIONS
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-16 leading-tight">
              ORBITAL
              <br />
              PARAMETERS
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Orbital info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-0">
                {[
                  { label: "ORBIT TYPE", value: satellite.orbit },
                  {
                    label: "ALTITUDE",
                    value: formatAltitude(satellite.altitude),
                  },
                  { label: "MASS", value: formatMass(satellite.mass) },
                  { label: "OPERATOR", value: satellite.operator },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border-t border-space-700/50 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <span className="text-[11px] font-micro tracking-[3px] text-space-500">
                      {item.label}
                    </span>
                    <span className="text-[15px] text-white font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-space-700/50" />
              </div>
            </motion.div>

            {/* Mission info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="space-y-0">
                {[
                  {
                    label: "LAUNCH DATE",
                    value: launchDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  },
                  { label: "COUNTRY", value: satellite.country },
                  { label: "LIFETIME", value: satellite.lifetime },
                  { label: "STATUS", value: satellite.status },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border-t border-space-700/50 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <span className="text-[11px] font-micro tracking-[3px] text-space-500">
                      {item.label}
                    </span>
                    <span className="text-[15px] text-white font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-space-700/50" />
              </div>
            </motion.div>
          </div>

          {/* Altitude comparison */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 max-w-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-micro tracking-[3px] text-space-500">
                RELATIVE ALTITUDE
              </span>
              <span className="text-[15px] text-white font-medium">
                {formatAltitude(satellite.altitude)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-space-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${Math.min((satellite.altitude / Math.max(...satellites.map((s) => s.altitude))) * 100, 100)}%`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-micro text-space-600">Earth Surface</span>
              <span className="text-[10px] font-micro text-space-600">
                {formatAltitude(Math.max(...satellites.map((s) => s.altitude)))}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ MISSION PURPOSE SECTION ═══ */}
      <section className="relative py-24 px-8 md:px-[8%] lg:px-[10%] border-t border-space-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[11px] font-micro tracking-[4px] text-accent-blue mb-2">
              MISSION
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-16 leading-tight">
              PURPOSE &<br />
              OBJECTIVES
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Big stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              {[
                {
                  value: satellite.orbit,
                  label: "ORBIT CLASS",
                  icon: <Orbit className="w-5 h-5" />,
                  color: "text-accent-blue",
                },
                {
                  value: typeLabels[satellite.type] || satellite.type,
                  label: "SATELLITE TYPE",
                  icon: <Radio className="w-5 h-5" />,
                  color: tc.text,
                },
                {
                  value: formatMass(satellite.mass),
                  label: "LAUNCH MASS",
                  icon: <Weight className="w-5 h-5" />,
                },
                {
                  value: new Date().getFullYear() - launchDate.getFullYear() + " yrs",
                  label: "YEARS IN ORBIT",
                  icon: <Calendar className="w-5 h-5" />,
                  color: "text-accent-green",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div
                    className={`text-3xl md:text-4xl font-display mb-1 ${stat.color || "text-white"}`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-micro tracking-[3px] text-space-500">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Purpose description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col justify-center"
            >
              <p className="text-[16px] text-space-300 leading-[2] font-light">
                {satellite.purpose}
              </p>
              <div className="mt-8 p-6 rounded-xl bg-white/[0.02] border border-space-700/50">
                <div className="text-[11px] font-micro tracking-[3px] text-space-500 mb-3">
                  OPERATIONAL PERIOD
                </div>
                <div className="text-[18px] text-white font-display">
                  {satellite.lifetime}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SATELLITE NAVIGATION ═══ */}
      <section className="relative border-t border-space-800">
        <div className="grid grid-cols-2">
          {/* Previous satellite */}
          {prevSat ? (
            <Link
              href={`/satellites/${prevSat.slug}`}
              className="group relative flex items-center justify-start p-8 md:p-16 hover:bg-space-900/50 transition-colors overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-[10px] font-micro tracking-[3px] text-space-500 mb-2 flex items-center gap-2">
                  <ArrowLeft className="w-3 h-3" /> PREVIOUS
                </div>
                <div className="text-lg md:text-2xl font-display text-white group-hover:text-accent-blue transition-colors">
                  {prevSat.name}
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-8 md:p-16" />
          )}

          {/* Next satellite */}
          {nextSat ? (
            <Link
              href={`/satellites/${nextSat.slug}`}
              className="group relative flex items-center justify-end p-8 md:p-16 border-l border-space-800 hover:bg-space-900/50 transition-colors overflow-hidden text-right"
            >
              <div className="relative z-10">
                <div className="text-[10px] font-micro tracking-[3px] text-space-500 mb-2 flex items-center justify-end gap-2">
                  NEXT <ArrowRight className="w-3 h-3" />
                </div>
                <div className="text-lg md:text-2xl font-display text-white group-hover:text-accent-blue transition-colors">
                  {nextSat.name}
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-8 md:p-16 border-l border-space-800" />
          )}
        </div>
      </section>
    </div>
  );
}
