"use client";

import { use, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Flame,
  Rocket,
  Globe,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { rockets } from "@/lib/data";

import NasaSearchFallback from "@/components/ui/NasaSearchFallback";

export default function RocketDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const rocket = rockets.find((r) => r.slug === slug);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  if (!rocket) {
    return (
      <NasaSearchFallback
        query={slug}
        backLink="/rockets"
        backText="Back to Rockets"
      />
    );
  }

  // Find adjacent rockets for navigation
  const currentIndex = rockets.findIndex((r) => r.slug === slug);
  const prevRocket = currentIndex > 0 ? rockets[currentIndex - 1] : null;
  const nextRocket =
    currentIndex < rockets.length - 1 ? rockets[currentIndex + 1] : null;

  // Format cost
  const formatCost = (cost: number) => {
    if (cost >= 1e9) return `$${(cost / 1e9).toFixed(1)}B`;
    return `$${(cost / 1e6).toFixed(0)}M`;
  };

  // Primary specs shown in the SpaceX-style overview
  const primarySpecs = [
    {
      label: "HEIGHT",
      value: `${rocket.height} m / ${Math.round(rocket.height * 3.281)} ft`,
    },
    {
      label: "DIAMETER",
      value: `${rocket.diameter} m / ${(rocket.diameter * 3.281).toFixed(1)} ft`,
    },
    {
      label: "PAYLOAD CAPACITY",
      value:
        rocket.payloadToLEO >= 1000
          ? `${(rocket.payloadToLEO / 1000).toFixed(0)}+ t`
          : `${rocket.payloadToLEO} kg`,
    },
    {
      label: "MASS",
      value: `${(rocket.mass / 1000).toFixed(0)} t`,
    },
    {
      label: "THRUST",
      value: `${rocket.thrust.toLocaleString()} kN`,
    },
  ];

  return (
    <div className="relative bg-black">
      {/* ═══ HERO SECTION — SpaceX-style split layout ═══ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background: rocket image — right-aligned, tall */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: imageY }}
        >
          <div className="absolute inset-0 w-full h-full">
            <img
              src={rocket.imageUrl || "/placeholder.jpg"}
              alt={rocket.name}
              className="absolute right-0 top-0 w-full md:w-[60%] h-full object-cover object-center opacity-60 md:opacity-80"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop";
              }}
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
            href="/rockets"
            className="inline-flex items-center gap-2 text-space-400 hover:text-white transition-colors mb-12 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rockets
          </Link>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-micro tracking-[3px] border ${
                rocket.status === "ACTIVE"
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                  : rocket.status === "RETIRED"
                    ? "text-space-400 border-space-500/30 bg-space-500/5"
                    : "text-amber-400 border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  rocket.status === "ACTIVE"
                    ? "bg-emerald-400"
                    : rocket.status === "RETIRED"
                      ? "bg-space-400"
                      : "bg-amber-400"
                }`}
              />
              {rocket.status.replace("_", " ")}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-display text-white mt-6 mb-4 leading-[1.05] max-w-[700px]"
          >
            {rocket.name}
            <br />
            <span className="text-space-400">Overview</span>
          </motion.h1>

          {/* Manufacturer line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[13px] font-micro tracking-[3px] text-space-400 mb-10 flex items-center gap-3"
          >
            <Globe className="w-4 h-4 text-accent-blue" />
            {rocket.manufacturer} · {rocket.country}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[15px] text-space-300 leading-[1.9] max-w-[520px] font-light"
          >
            {rocket.description.length > 500
              ? rocket.description.slice(0, 500) + "..."
              : rocket.description}
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
              ABOUT {rocket.name.toUpperCase()}
            </h2>
            <p className="text-[16px] text-space-300 leading-[2] font-light">
              {rocket.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ PROPULSION & ENGINE SECTION ═══ */}
      <section className="relative py-24 px-8 md:px-[8%] lg:px-[10%] border-t border-space-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[11px] font-micro tracking-[4px] text-accent-blue mb-2">
              PROPULSION
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-16 leading-tight">
              ENGINES &<br />
              PERFORMANCE
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Engine info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-0">
                {[
                  { label: "ENGINES", value: rocket.engines },
                  {
                    label: "TOTAL THRUST",
                    value: `${rocket.thrust.toLocaleString()} kN`,
                  },
                  { label: "STAGES", value: `${rocket.stages}` },
                  {
                    label: "COST PER LAUNCH",
                    value: formatCost(rocket.costPerLaunch),
                  },
                ].map((item, i) => (
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

            {/* Payload capacity comparison */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="space-y-0">
                {[
                  {
                    label: "PAYLOAD TO LEO",
                    value:
                      rocket.payloadToLEO >= 1000
                        ? `${(rocket.payloadToLEO / 1000).toFixed(1)} t`
                        : `${rocket.payloadToLEO} kg`,
                    bar:
                      (rocket.payloadToLEO /
                        Math.max(...rockets.map((r) => r.payloadToLEO))) *
                      100,
                  },
                  {
                    label: "PAYLOAD TO GTO",
                    value:
                      rocket.payloadToGTO > 0
                        ? rocket.payloadToGTO >= 1000
                          ? `${(rocket.payloadToGTO / 1000).toFixed(1)} t`
                          : `${rocket.payloadToGTO} kg`
                        : "N/A",
                    bar:
                      rocket.payloadToGTO > 0
                        ? (rocket.payloadToGTO /
                            Math.max(
                              ...rockets
                                .filter((r) => r.payloadToGTO > 0)
                                .map((r) => r.payloadToGTO)
                            )) *
                          100
                        : 0,
                  },
                ].map((item) => (
                  <div key={item.label} className="border-t border-space-700/50 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-micro tracking-[3px] text-space-500">
                        {item.label}
                      </span>
                      <span className="text-[15px] text-white font-medium">
                        {item.value}
                      </span>
                    </div>
                    {item.bar > 0 && (
                      <div className="w-full h-1 bg-space-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.bar}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t border-space-700/50" />

                {/* Physical dimensions */}
                {[
                  {
                    label: "HEIGHT",
                    value: `${rocket.height} m`,
                  },
                  {
                    label: "DIAMETER",
                    value: `${rocket.diameter} m`,
                  },
                  {
                    label: "LAUNCH MASS",
                    value: `${(rocket.mass / 1000).toLocaleString()} t`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border-t border-space-700/50 py-5 flex items-center justify-between"
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
        </div>
      </section>

      {/* ═══ LAUNCH RECORD SECTION ═══ */}
      <section className="relative py-24 px-8 md:px-[8%] lg:px-[10%] border-t border-space-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-[11px] font-micro tracking-[4px] text-accent-blue mb-2">
              TRACK RECORD
            </h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-16 leading-tight">
              LAUNCH
              <br />
              HISTORY
            </h3>
          </motion.div>

          {/* Big stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
            {[
              {
                value: rocket.totalLaunches.toString(),
                label: "TOTAL LAUNCHES",
                icon: <Rocket className="w-5 h-5" />,
              },
              {
                value: rocket.successfulLaunches.toString(),
                label: "SUCCESSFUL",
                icon: <CheckCircle2 className="w-5 h-5" />,
                color: "text-accent-green",
              },
              {
                value: (
                  rocket.totalLaunches - rocket.successfulLaunches
                ).toString(),
                label: "FAILURES",
                icon: <XCircle className="w-5 h-5" />,
                color:
                  rocket.totalLaunches - rocket.successfulLaunches > 0
                    ? "text-red-400"
                    : "text-space-500",
              },
              {
                value: `${rocket.successRate}%`,
                label: "SUCCESS RATE",
                icon: <TrendingUp className="w-5 h-5" />,
                color: "text-accent-blue",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center md:text-left"
              >
                <div
                  className={`text-4xl md:text-5xl lg:text-6xl font-display mb-2 ${stat.color || "text-white"}`}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] font-micro tracking-[3px] text-space-500">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Success rate bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-micro tracking-[3px] text-space-500">
                RELIABILITY
              </span>
              <span className="text-[15px] text-white font-medium">
                {rocket.successRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-space-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${rocket.successRate}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background:
                    rocket.successRate >= 95
                      ? "linear-gradient(90deg, #34d399, #22d3ee)"
                      : rocket.successRate >= 80
                        ? "linear-gradient(90deg, #38bdf8, #818cf8)"
                        : "linear-gradient(90deg, #fbbf24, #f472b6)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ ROCKET NAVIGATION ═══ */}
      <section className="relative border-t border-space-800">
        <div className="grid grid-cols-2">
          {/* Previous rocket */}
          {prevRocket ? (
            <Link
              href={`/rockets/${prevRocket.slug}`}
              className="group relative flex items-center justify-start p-8 md:p-16 hover:bg-space-900/50 transition-colors overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-[10px] font-micro tracking-[3px] text-space-500 mb-2 flex items-center gap-2">
                  <ArrowLeft className="w-3 h-3" /> PREVIOUS
                </div>
                <div className="text-lg md:text-2xl font-display text-white group-hover:text-accent-blue transition-colors">
                  {prevRocket.name}
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-8 md:p-16" />
          )}

          {/* Next rocket */}
          {nextRocket ? (
            <Link
              href={`/rockets/${nextRocket.slug}`}
              className="group relative flex items-center justify-end p-8 md:p-16 border-l border-space-800 hover:bg-space-900/50 transition-colors overflow-hidden text-right"
            >
              <div className="relative z-10">
                <div className="text-[10px] font-micro tracking-[3px] text-space-500 mb-2 flex items-center justify-end gap-2">
                  NEXT <ArrowRight className="w-3 h-3" />
                </div>
                <div className="text-lg md:text-2xl font-display text-white group-hover:text-accent-blue transition-colors">
                  {nextRocket.name}
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
