"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Satellite, Eye, Cpu,
  Timer, Target, ChevronRight, Building2,
  Rocket, Globe2, Telescope, Users,
} from "lucide-react";

// ─── Rocket Card ──────────────────────────────────────────────

interface RocketCardData {
  id: string;
  slug: string;
  name: string;
  manufacturer: string;
  country: string;
  status: string;
  height: number;
  payloadToLEO: number;
  totalLaunches: number;
  description: string;
  imageUrl: string;
}

export function FeaturedRocketsGrid({ rockets }: { rockets: RocketCardData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {rockets.map((rocket, i) => (
        <motion.div
          key={rocket.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="h-full"
        >
          <Link href={`/rockets/${rocket.slug}`} className="group relative flex flex-col h-full bg-[#0f172a]/40 border border-space-500/30 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)] hover:border-space-500/60">
            <div className="relative h-[200px] w-full overflow-hidden bg-black shrink-0">
              <Image
                src={rocket.imageUrl || "/placeholder.jpg"}
                alt={rocket.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-micro tracking-widest bg-black/60 border backdrop-blur-md ${rocket.status === "ACTIVE" ? "text-emerald-400 border-emerald-500/50" : "text-space-300 border-space-500"}`}>
                  {rocket.status.replace("_", " ")}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-[10px] font-micro uppercase tracking-widest text-[#38bdf8] mb-0.5">{rocket.manufacturer} · {rocket.country}</p>
                <h3 className="text-[20px] font-display text-white group-hover:text-[#38bdf8] transition-colors leading-none drop-shadow-lg">{rocket.name}</h3>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0f172a] to-black">
              <p className="text-[13px] font-light text-[#cbd5e1] line-clamp-2 leading-relaxed mb-6">{rocket.description}</p>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-space-500/30 mt-auto">
                <div>
                  <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">Height</div>
                  <div className="text-[13px] font-medium text-white">{rocket.height}m</div>
                </div>
                <div>
                  <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">Payload</div>
                  <div className="text-[13px] font-medium text-white">{(rocket.payloadToLEO / 1000).toFixed(0)}t LEO</div>
                </div>
                <div>
                  <div className="text-[10px] font-micro uppercase tracking-widest text-space-500">Launches</div>
                  <div className="text-[13px] font-medium text-white">{rocket.totalLaunches}</div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Upcoming Launch Card ─────────────────────────────────────

interface LaunchData {
  id: string;
  name: string;
  rocket: string;
  agency: string;
  date: string;
  location: string;
}

export function UpcomingLaunchesGrid({ launches }: { launches: LaunchData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {launches.map((launch, i) => {
        const launchDate = new Date(launch.date);
        const now = new Date();
        const diff = launchDate.getTime() - now.getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

        return (
          <motion.div
            key={launch.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-card p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{launch.name}</h3>
                <p className="text-sm text-space-400">{launch.rocket} · {launch.agency}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold gradient-text">{days}</div>
                <div className="text-xs text-space-500 uppercase tracking-widest mt-1">days away</div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-space-700">
              <div className="flex items-center gap-2 text-sm text-space-400">
                <Timer className="w-4 h-4 text-accent-blue" />
                {launchDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2 text-sm text-space-400">
                <Target className="w-4 h-4 text-accent-blue" />
                {launch.location}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── ISS Live Card ────────────────────────────────────────────

export function IssLiveCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-emerald-500/20 shadow-[0_0_60px_rgba(52,211,153,0.06)]"
    >
      <div className="w-20 h-20 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
        <Satellite className="w-10 h-10 text-emerald-400" />
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
          <span className="text-[10px] font-micro text-emerald-400 uppercase tracking-[3px]">Live Now</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display text-white mb-3">ISS Live Tracker</h2>
        <p className="text-space-400 text-sm leading-relaxed max-w-lg">
          Track the International Space Station in real-time. See its exact position, altitude, and velocity updated every 5 seconds on an interactive world map.
        </p>
      </div>
      <Link
        href="/iss"
        className="shrink-0 flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-micro text-sm uppercase tracking-widest hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all duration-300"
      >
        Track ISS <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

// ─── Observatory Teaser ───────────────────────────────────────

export function ObservatoryTeaser() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-8 md:p-12 relative overflow-hidden border border-indigo-500/20 shadow-[0_0_60px_rgba(99,102,241,0.06)]"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-purple via-indigo-500 to-accent-cyan" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
          <Eye className="w-10 h-10 text-indigo-400" />
          <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-micro bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">New</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-[10px] font-micro text-indigo-400 uppercase tracking-[3px]">8 Live APIs · Real-Time Data</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display text-white mb-3">Space Observatory</h2>
          <p className="text-space-400 text-sm leading-relaxed max-w-lg">
            Track near-Earth asteroids, monitor solar storms, discover exoplanets,
            watch fireballs, and follow live launches — all in one breathtaking dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {["Asteroids", "Solar Flares", "Exoplanets", "Fireballs", "Earth Events", "Live Launches"].map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] text-space-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/observatory"
          className="shrink-0 flex items-center gap-3 px-8 py-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-micro text-sm uppercase tracking-widest hover:bg-indigo-500/20 hover:border-indigo-500/60 transition-all duration-300"
        >
          Observe Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Technology Teaser ────────────────────────────────────────

export function TechTeaser() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-8 md:p-12 relative overflow-hidden border border-violet-500/20 shadow-[0_0_60px_rgba(139,92,246,0.06)]"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-accent-blue to-accent-cyan" />
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 shrink-0 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center relative">
          <Cpu className="w-10 h-10 text-violet-400" />
          <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-micro bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-widest">New</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-[10px] font-micro text-violet-400 uppercase tracking-[3px]">NASA APIs · Live Data</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display text-white mb-3">Space Technology & Research</h2>
          <p className="text-space-400 text-sm leading-relaxed max-w-lg">
            Explore NASA patents, TechPort research projects, real-time Earth imagery from DSCOVR, Mars Rover photographs, and thousands of NASA archive images.
          </p>
        </div>
        <Link
          href="/technology"
          className="shrink-0 flex items-center gap-3 px-8 py-4 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-micro text-sm uppercase tracking-widest hover:bg-violet-500/20 hover:border-violet-500/60 transition-all duration-300"
        >
          Explore Tech <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Explore Sections Grid ────────────────────────────────────

export function ExploreSections() {
  const sections = [
    { href: "/solar-system", icon: Globe2, title: "Solar System", desc: "Planets, moons, and dwarf planets" },
    { href: "/satellites", icon: Satellite, title: "Satellites", desc: "Space telescopes, stations & more" },
    { href: "/missions", icon: Telescope, title: "Missions", desc: "Apollo, Artemis, Chandrayaan & more" },
    { href: "/astronauts", icon: Users, title: "Astronauts", desc: "The heroes who explore space" },
    { href: "/observatory", icon: Eye, title: "Observatory", desc: "Asteroids, weather, exoplanets" },
    { href: "/technology", icon: Cpu, title: "Technology", desc: "NASA patents, research & live imagery" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-8">
      {sections.map((item, i) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="h-full"
        >
          <Link href={item.href} className="glass-card glass-card-hover p-5 sm:p-10 flex flex-col items-center justify-center h-full group text-center border-t-2 border-space-500">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 mb-3 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-sm sm:text-xl font-display text-white group-hover:text-[#38bdf8] transition-colors mb-1 sm:mb-3">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm font-micro text-space-400 leading-relaxed hidden sm:block">{item.desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Agencies Grid ────────────────────────────────────────────

interface AgencyData {
  id: string;
  slug: string;
  abbreviation: string;
  country: string;
}

export function AgenciesGrid({ agencies }: { agencies: AgencyData[] }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
      {agencies.map((agency, i) => (
        <motion.div
          key={agency.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <Link href={`/agencies/${agency.slug}`} className="glass-card glass-card-hover p-4 sm:p-8 flex flex-col items-center justify-center h-full text-center group border-t-2 border-space-500">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 mb-3 sm:mb-5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="font-display text-white text-base group-hover:text-[#38bdf8] transition-colors">
              {agency.abbreviation}
            </h3>
            <p className="text-xs font-micro text-space-400 mt-2 tracking-widest">{agency.country}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
