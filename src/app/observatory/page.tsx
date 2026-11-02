import Link from "next/link";

import { SectionHeading } from "@/components/ui/SectionCards";
import PeopleInSpace from "@/components/ui/PeopleInSpace";
import ObservatoryTabs from "@/components/ui/ObservatoryTabs";
import AirlockHero from "@/components/ui/airlock-spaceship-hero";

export default function ObservatoryPage() {
  return (
    <div className="relative">
      {/* ═══ HERO — Scroll-scrub ISS video ═══ */}
      <AirlockHero
        title="SPACE OBSERVATORY"
        tagline="Your real-time command center for the cosmos — powered by NASA, JPL & SpaceDevs."
        scrollHint="SCROLL TO EXPLORE"
        theme="ice"
        skipLabel="Skip to observatory"
        posterSrc="/airlock-poster.jpg"
      />

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
