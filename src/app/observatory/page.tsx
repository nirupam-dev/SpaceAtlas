import {
  Eye, Sparkles, Telescope, ChevronDown
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/Cards";
import PeopleInSpace from "@/components/ui/PeopleInSpace";
import ObservatoryTabs from "@/components/ui/ObservatoryTabs";

export default function ObservatoryPage() {
  return (
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <section className="relative w-full min-h-screen overflow-hidden flex items-center">
        {/* Background Image — HD, crisp */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/observatory-hero.jpg')" }}
        />
        {/* Minimal overlays — just enough for text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/15 via-transparent to-[#0f172a]/90" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,23,42,0.3)_100%)]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 pb-16 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-accent-purple/30 text-accent-purple text-[10px] font-micro uppercase tracking-[3px] bg-accent-purple/5 backdrop-blur-md mb-8">
              <Eye className="w-3.5 h-3.5" />
              Live Data · Real-Time Tracking
            </span>
          </div>

          <h1 className="animate-fade-in-up delay-100 text-5xl md:text-7xl lg:text-8xl font-display text-white mb-6 leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
            SPACE
            <br />
            <span className="gradient-text">OBSERVATORY</span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-[15px] md:text-[17px] text-space-200 leading-[1.8] font-light mb-10 max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            Your real-time command center for the cosmos. Track asteroids, monitor solar storms,
            discover exoplanets, watch live launches, and observe Earth from space —
            powered by NASA, JPL, and SpaceDevs.
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-5">
            <a href="#explore" className="btn-primary flex items-center justify-center gap-3 text-[13px] px-8 py-3.5 min-w-[200px]">
              <Telescope className="w-4 h-4" />
              START OBSERVING
            </a>
            <Link href="/technology" className="btn-outline flex items-center justify-center gap-3 text-[13px] px-8 py-3.5 min-w-[200px]">
              NASA TECH LAB
            </Link>
          </div>

          {/* API count badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3 animate-fade-in delay-500">
            {[
              "NASA NEO", "NASA DONKI", "Open Notify", "NASA EONET",
              "NASA CNEOS", "Exoplanet Archive", "Launch Library 2", "SpaceFlight News",
            ].map((api) => (
              <span key={api} className="px-3 py-1.5 rounded-full text-[9px] font-micro uppercase tracking-widest bg-white/[0.03] border border-white/[0.06] text-space-400">
                <Sparkles className="w-2.5 h-2.5 inline-block mr-1 text-accent-blue" />
                {api}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-space-400" />
        </div>
      </section>

      {/* ═══ PEOPLE IN SPACE LIVE WIDGET ═══ */}
      <section className="relative py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <PeopleInSpace />
        </div>
      </section>

      {/* ═══ TABBED OBSERVATORY EXPLORER ═══ */}
      <section id="explore" className="relative py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Real-Time Observatory"
            title="Explore Live Data"
            subtitle="Powered by NASA, JPL & SpaceDevs — updated automatically"
          />

          <ObservatoryTabs />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-card p-16 md:p-20 relative overflow-hidden bg-[#0f172a]/90 backdrop-blur-2xl">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Want to go deeper?
            </h2>
            <p className="text-space-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Ask our AI assistant about any space phenomenon, compare rockets side by side,
              or test your knowledge with our interactive quiz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/ask" className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg w-full sm:w-auto justify-center">
                Ask SpaceAtlas AI
              </Link>
              <Link href="/technology" className="btn-outline inline-flex items-center gap-3 px-8 py-4 text-lg w-full sm:w-auto justify-center">
                NASA Tech Lab
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
