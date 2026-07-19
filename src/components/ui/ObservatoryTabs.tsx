"use client";

/**
 * ─── ObservatoryTabs ────────────────────────────────────────────
 *
 * Container component for the observatory explorer.
 * Uses dynamic imports to lazy-load heavy client components,
 * significantly reducing the initial JS bundle payload.
 *
 * Each tab's content is wrapped in an ErrorBoundary to prevent
 * a crash in one section from taking down the entire page.
 */

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Orbit, Sun, Flame, Globe2, Rocket, Star } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import LoadingSpinner from "@/components/ui/cards/LoadingSpinner";

// ─── Dynamic Imports (Code Splitting) ─────────────────────────
// Each observatory tab is a heavy client component that imports
// framer-motion. Dynamic imports ensure only the active tab's
// code is loaded, keeping the initial bundle lean.

const AsteroidWatch = dynamic(() => import("@/components/ui/AsteroidWatch"), {
  loading: () => <LoadingSpinner color="border-accent-blue" />,
});

const SpaceWeather = dynamic(() => import("@/components/ui/SpaceWeather"), {
  loading: () => <LoadingSpinner color="border-accent-amber" />,
});

const EarthEvents = dynamic(() => import("@/components/ui/EarthEvents"), {
  loading: () => <LoadingSpinner color="border-accent-cyan" />,
});

const ExoplanetExplorer = dynamic(() => import("@/components/ui/ExoplanetExplorer"), {
  loading: () => <LoadingSpinner color="border-accent-purple" />,
});

const FireballTracker = dynamic(() => import("@/components/ui/FireballTracker"), {
  loading: () => <LoadingSpinner color="border-accent-amber" />,
});

const LiveLaunches = dynamic(() => import("@/components/ui/LiveLaunches"), {
  loading: () => <LoadingSpinner color="border-accent-blue" />,
});

// ─── Tab Configuration ────────────────────────────────────────

const TABS = [
  { id: "launches",   label: "Live Launches",     icon: Rocket },
  { id: "asteroids",  label: "Asteroid Watch",    icon: Orbit },
  { id: "weather",    label: "Space Weather",     icon: Sun },
  { id: "exoplanets", label: "Exoplanets",        icon: Star },
  { id: "earth",      label: "Earth Events",      icon: Globe2 },
  { id: "fireballs",  label: "Fireballs",         icon: Flame },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Tab Content Mapping ──────────────────────────────────────

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
  launches: LiveLaunches,
  asteroids: AsteroidWatch,
  weather: SpaceWeather,
  exoplanets: ExoplanetExplorer,
  earth: EarthEvents,
  fireballs: FireballTracker,
};

export default function ObservatoryTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("launches");

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <>
      {/* ── Tab Navigation ── */}
      <div className="flex flex-wrap justify-center gap-2 mb-12" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-micro uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 text-white border border-accent-blue/40 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                : "bg-white/5 text-space-400 border border-white/10 hover:border-white/30 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content with Error Boundary ── */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={activeTab}
        className="animate-fade-in"
      >
        <ErrorBoundary
          key={activeTab}
          onError={(error) => {
            console.error(`[ObservatoryTabs] ${activeTab} tab crashed:`, error);
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveComponent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}
