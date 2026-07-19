"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Rocket, Globe2, Users, Building2, ArrowRight,
  Zap, Target, Timer, TrendingUp, ChevronRight, Telescope, BrainCircuit, Satellite, Cpu,
  Calendar, ExternalLink, Eye, Orbit, Sun, Star,
} from "lucide-react";

import { SectionHeading, StatCard } from "@/components/ui/Cards";
import NasaApod from "@/components/ui/NasaApod";
import PeopleInSpace from "@/components/ui/PeopleInSpace";
import { rockets, agencies, planets, missions, upcomingLaunches, satellites } from "@/lib/data";
import Image from "next/image";

interface NewsArticle {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
}

export default function HomePage() {
  const [liveNews, setLiveNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    fetch("/api/space-news?limit=8")
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setLiveNews(data.results.slice(0, 8));
      })
      .catch(() => {});
  }, []);
  return (
    <div className="relative">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 text-center pt-28 sm:pt-40 pb-16 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-space-500 text-white text-xs sm:text-sm font-micro mb-8 sm:mb-12 uppercase tracking-widest bg-black/30 backdrop-blur-md">
              <Zap className="w-4 h-4" />
              Your Gateway to the Cosmos
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-display gradient-text mb-6 sm:mb-10 leading-[1.1]"
          >
            Explore the
            <br />
            Universe
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 sm:mt-10 text-sm sm:text-lg md:text-xl text-[#e2e8f0] max-w-3xl mx-auto leading-relaxed font-light tracking-wide bg-black/20 backdrop-blur-sm p-4 sm:p-6 rounded-2xl"
          >
            Comprehensive information about rockets, spacecraft, planets,
            space missions, astronauts, and the latest discoveries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            <Link href="/rockets" className="btn-primary flex items-center gap-3 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto justify-center">
              <Rocket className="w-5 h-5" />
              Explore Rockets
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/solar-system" className="btn-outline flex items-center gap-3 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto justify-center">
              <Globe2 className="w-5 h-5" />
              Solar System
            </Link>
          </motion.div>

          {/* Quick stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 sm:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12 max-w-4xl mx-auto bg-black/40 backdrop-blur-md p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/10"
          >
            {[
              { val: `${rockets.length}+`, label: "Rockets" },
              { val: `${satellites.length}+`, label: "Satellites" },
              { val: `${missions.length}+`, label: "Missions" },
              { val: `${agencies.length}`, label: "Agencies" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-1 sm:mb-2">{s.val}</div>
                <div className="text-[10px] sm:text-xs text-space-400 uppercase tracking-widest font-bold">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-space-500 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-space-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ STATS DASHBOARD ═══════════ */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Dashboard"
            title="Space by the Numbers"
            subtitle="Key statistics about humanity's journey beyond Earth"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <StatCard icon={<Rocket className="w-7 h-7 text-white" />} value="600+" label="Total Launches" delay={0} />
            <StatCard icon={<Target className="w-7 h-7 text-white" />} value="98.5%" label="Success Rate" color="from-accent-green to-accent-cyan" delay={0.1} />
            <StatCard icon={<Users className="w-7 h-7 text-white" />} value="580+" label="Astronauts" color="from-accent-purple to-accent-pink" delay={0.2} />
            <StatCard icon={<TrendingUp className="w-7 h-7 text-white" />} value="$50B+" label="Global Budget" color="from-accent-amber to-accent-pink" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ═══════════ ISS LIVE CARD ═══════════ */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </section>

      {/* ═══════════ NASA APOD ═══════════ */}
      <NasaApod />

      {/* ═══════════ PEOPLE IN SPACE ═══════════ */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <PeopleInSpace />
        </div>
      </section>

      {/* ═══════════ OBSERVATORY TEASER ═══════════ */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </section>

      {/* ═══════════ TECHNOLOGY & RESEARCH TEASER ═══════════ */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </section>

      {/* ═══════════ FEATURED ROCKETS ═══════════ */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Rocket Database"
            title="Featured Rockets"
            subtitle="The most powerful launch vehicles ever built"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rockets.slice(0, 6).map((rocket, i) => (
              <motion.div
                key={rocket.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full"
              >
                <Link href={`/rockets/${rocket.slug}`} className="group relative flex flex-col h-full bg-[#0f172a]/40 border border-space-500/30 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)] hover:border-space-500/60">
                  {/* Photo header */}
                  <div className="relative h-[200px] w-full overflow-hidden bg-black shrink-0">
                                        <img
                      src={rocket.imageUrl || "/placeholder.jpg"}
                      alt={rocket.name}
                      className="object-cover w-full h-full object-center group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 opacity-80 group-hover:opacity-100"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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

                  {/* Content */}
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
          <div className="text-center mt-16">
            <Link href="/rockets" className="btn-outline inline-flex items-center gap-2 py-3 px-6 text-base">
              View All Rockets <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ UPCOMING LAUNCHES ═══════════ */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Launch Tracker"
            title="Upcoming Launches"
            subtitle="Don't miss the next liftoff"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingLaunches.map((launch, i) => {
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
          <div className="text-center mt-16">
            <Link href="/launches" className="btn-outline inline-flex items-center gap-2 py-3 px-6 text-base">
              All Launches <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ SPACE NEWS ═══════════ */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Live Feed"
            title="Space News"
            subtitle="Real-time updates from across the aerospace industry"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {liveNews.map((article, i) => (
              <motion.a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="glass-card glass-card-hover group flex flex-col h-full overflow-hidden cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10" />
                                    <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <span className="badge badge-active bg-black/60 backdrop-blur-md border-white/10 text-[9px]">
                      {article.news_site}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-micro text-space-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3 text-accent-blue" />
                    <span>{new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-accent-blue transition-colors mb-2 leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-space-500 line-clamp-2 mb-4 flex-grow">{article.summary}</p>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent-blue mt-auto">
                    Read Article
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link href="/news" className="btn-outline inline-flex items-center gap-2 py-3 px-6 text-base">
              All News <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ EXPLORE SECTIONS ═══════════ */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Explore"
            title="Discover the Cosmos"
            subtitle="Navigate through our comprehensive space database"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-8">
            {[
              { href: "/solar-system", icon: Globe2, title: "Solar System", desc: "Planets, moons, and dwarf planets" },
              { href: "/satellites", icon: Satellite, title: "Satellites", desc: "Space telescopes, stations & more" },
              { href: "/missions", icon: Telescope, title: "Missions", desc: "Apollo, Artemis, Chandrayaan & more" },
              { href: "/astronauts", icon: Users, title: "Astronauts", desc: "The heroes who explore space" },
              { href: "/observatory", icon: Eye, title: "Observatory", desc: "Asteroids, weather, exoplanets" },
              { href: "/technology", icon: Cpu, title: "Technology", desc: "NASA patents, research & live imagery" },
            ].map((item, i) => (
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
        </div>
      </section>

      {/* ═══════════ AGENCIES ═══════════ */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 pb-24 sm:pb-48">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Agencies"
            title="Space Organizations"
            subtitle="The world's leading space agencies"
          />
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
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative pb-16 sm:pb-32 px-4 sm:px-6 z-20">
        <div className="max-w-5xl mx-auto text-center -mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-16 md:p-20 relative overflow-hidden shadow-2xl bg-[#0f172a]/90 backdrop-blur-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc]" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Explore?</h2>
            <p className="text-space-300 text-sm sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Dive into our comprehensive database of space knowledge. Compare rockets,
              track launches, and test your knowledge.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/rockets" className="btn-primary flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/quiz" className="btn-outline flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                <BrainCircuit className="w-5 h-5" />
                Take a Quiz
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
