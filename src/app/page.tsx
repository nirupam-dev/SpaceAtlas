import Link from "next/link";
import {
  Rocket, Target, Users, TrendingUp, ChevronRight,
} from "lucide-react";

import { SectionHeading, StatCard } from "@/components/ui/SectionCards";
import NasaApod from "@/components/ui/NasaApod";
import PeopleInSpace from "@/components/ui/PeopleInSpace";
import { rockets, agencies, missions, upcomingLaunches, satellites } from "@/lib/data.server";

import { HeroSection, CtaSection } from "@/components/home/HeroSection";
import SpaceNewsSection from "@/components/home/SpaceNewsSection";
import {
  FeaturedRocketsGrid,
  UpcomingLaunchesGrid,
  IssLiveCard,
  ObservatoryTeaser,
  TechTeaser,
  ExploreSections,
  AgenciesGrid,
} from "@/components/home/AnimatedSections";

/**
 * Home page — rendered as a **Server Component**.
 *
 * Static data (rockets, agencies, etc.) is resolved on the server and passed
 * to thin client islands that handle animations and interactivity.
 * This prevents the ~140 KB data.ts payload from being bundled into client JS.
 */
export default function HomePage() {
  // Compute minimal props on the server
  const heroStats = {
    rocketsCount: rockets.length,
    satellitesCount: satellites.length,
    missionsCount: missions.length,
    agenciesCount: agencies.length,
  };

  // Only send the fields each section actually needs
  const featuredRockets = rockets.slice(0, 6).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    manufacturer: r.manufacturer,
    country: r.country,
    status: r.status,
    height: r.height,
    payloadToLEO: r.payloadToLEO,
    totalLaunches: r.totalLaunches,
    description: r.description,
    imageUrl: r.imageUrl,
  }));

  const launchData = upcomingLaunches.map((l) => ({
    id: l.id,
    name: l.name,
    rocket: l.rocket,
    agency: l.agency,
    date: l.date,
    location: l.location,
  }));

  const agencyData = agencies.map((a) => ({
    id: a.id,
    slug: a.slug,
    abbreviation: a.abbreviation,
    country: a.country,
  }));

  return (
    <div className="relative">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <HeroSection stats={heroStats} />

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
          <IssLiveCard />
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
          <ObservatoryTeaser />
        </div>
      </section>

      {/* ═══════════ TECHNOLOGY & RESEARCH TEASER ═══════════ */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <TechTeaser />
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
          <FeaturedRocketsGrid rockets={featuredRockets} />
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
          <UpcomingLaunchesGrid launches={launchData} />
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
          <SpaceNewsSection />
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
          <ExploreSections />
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
          <AgenciesGrid agencies={agencyData} />
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <CtaSection />
    </div>
  );
}
