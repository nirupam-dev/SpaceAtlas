/**
 * ─── Exoplanet Utilities ────────────────────────────────────────
 *
 * Pure business logic for exoplanet classification, habitability
 * assessment, and visual representation. All functions are
 * stateless and independently testable.
 */

import { EXOPLANET_THRESHOLDS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────

export interface Exoplanet {
  pl_name: string;
  hostname: string;
  disc_year: number;
  discoverymethod: string;
  pl_orbper: number | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  st_spectype: string | null;
  sy_dist: number | null;
  sy_snum: number | null;
  sy_pnum: number | null;
}

// ─── Planet Type Classification ───────────────────────────────

export interface PlanetTypeInfo {
  type: string;
  desc: string;
  color: string;
}

/**
 * Classifies an exoplanet based on its radius (in Earth radii)
 * into one of six categories from Terrestrial to Super-Jupiter.
 */
export function getPlanetType(rade: number | null, masse: number | null): PlanetTypeInfo {
  const { RADIUS } = EXOPLANET_THRESHOLDS;
  if (!rade) return { type: "Unknown", desc: "Insufficient data for classification", color: "text-space-400" };
  if (rade < RADIUS.TERRESTRIAL) return { type: "Terrestrial", desc: "Rocky planet similar to Earth or Mars", color: "text-emerald-400" };
  if (rade < RADIUS.SUPER_EARTH) return { type: "Super-Earth", desc: "Larger than Earth but smaller than Neptune", color: "text-cyan-400" };
  if (rade < RADIUS.SUB_NEPTUNE) return { type: "Sub-Neptune", desc: "Mini gas giant with thick atmosphere", color: "text-blue-400" };
  if (rade < RADIUS.NEPTUNE_LIKE) return { type: "Neptune-like", desc: "Ice giant similar to Neptune or Uranus", color: "text-indigo-400" };
  if (rade < RADIUS.GAS_GIANT) return { type: "Gas Giant", desc: "Jupiter-scale gas giant", color: "text-amber-400" };
  return { type: "Super-Jupiter", desc: "Massive gas giant exceeding Jupiter", color: "text-red-400" };
}

// ─── Habitability Assessment ──────────────────────────────────

export interface HabitabilityInfo {
  score: string;
  color: string;
  desc: string;
}

/**
 * Assesses the habitability potential of an exoplanet based on
 * equilibrium temperature and radius. Uses the conservative
 * habitable zone definition (200–320 K).
 */
export function getHabitability(eqt: number | null, rade: number | null): HabitabilityInfo {
  const { HABITABLE_ZONE } = EXOPLANET_THRESHOLDS;
  if (!eqt || !rade) return { score: "Unknown", color: "text-space-500", desc: "Insufficient temperature/size data" };

  const inHZ = eqt >= HABITABLE_ZONE.MIN_TEMP && eqt <= HABITABLE_ZONE.MAX_TEMP;
  const rightSize = rade >= HABITABLE_ZONE.MIN_RADIUS && rade <= HABITABLE_ZONE.MAX_RADIUS;

  if (inHZ && rightSize) return { score: "High", color: "text-emerald-400", desc: "Temperate zone, Earth-like size — potential for liquid water" };
  if (inHZ) return { score: "Moderate", color: "text-yellow-400", desc: "In habitable zone but unusual size" };
  if (rightSize && eqt < HABITABLE_ZONE.MIN_TEMP) return { score: "Low (Cold)", color: "text-blue-400", desc: "Right size but too cold for liquid water" };
  if (rightSize && eqt > HABITABLE_ZONE.MAX_TEMP) return { score: "Low (Hot)", color: "text-orange-400", desc: "Right size but too hot for liquid water" };
  return { score: "Unlikely", color: "text-red-400", desc: "Outside habitable parameters" };
}

// ─── Visual Representation ────────────────────────────────────

const PLANET_GRADIENTS = [
  "from-blue-600 via-cyan-500 to-teal-400",
  "from-purple-600 via-pink-500 to-rose-400",
  "from-amber-600 via-orange-500 to-red-400",
  "from-emerald-600 via-green-500 to-lime-400",
  "from-indigo-600 via-violet-500 to-purple-400",
  "from-cyan-600 via-blue-500 to-indigo-400",
  "from-rose-600 via-pink-500 to-fuchsia-400",
  "from-teal-600 via-emerald-500 to-green-400",
] as const;

/**
 * Generates a deterministic gradient class string for a planet
 * based on a hash of its name, ensuring visual consistency.
 */
export function getPlanetGradient(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PLANET_GRADIENTS[hash % PLANET_GRADIENTS.length];
}

// ─── Discovery Method UI Mapping ──────────────────────────────

export const DISCOVERY_METHOD_COLORS: Record<string, string> = {
  "Transit": "text-accent-blue bg-accent-blue/10 border-accent-blue/30",
  "Radial Velocity": "text-accent-purple bg-accent-purple/10 border-accent-purple/30",
  "Imaging": "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30",
  "Microlensing": "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
};

export const DEFAULT_METHOD_COLOR = "text-space-400 bg-white/5 border-white/10";

/**
 * Counts discovery methods across a list of exoplanets.
 */
export function countDiscoveryMethods(planets: Exoplanet[]): Record<string, number> {
  return planets.reduce<Record<string, number>>((acc, p) => {
    const m = p.discoverymethod || "Unknown";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
}
