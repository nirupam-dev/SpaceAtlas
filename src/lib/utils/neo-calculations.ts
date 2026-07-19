/**
 * ─── Near-Earth Object Calculations ─────────────────────────────
 *
 * Pure business logic for asteroid threat assessment, size
 * comparisons, and proximity calculations. All functions are
 * stateless and independently testable.
 */

import { NEO_THRESHOLDS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────

export interface NeoObject {
  id: string;
  name: string;
  nasa_jpl_url?: string;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  absolute_magnitude_h: number;
  is_sentry_object?: boolean;
}

export interface CloseApproachData {
  close_approach_date_full: string;
  close_approach_date: string;
  relative_velocity: { kilometers_per_hour: string; kilometers_per_second: string };
  miss_distance: { astronomical: string; kilometers: string; lunar: string; miles: string };
  orbiting_body: string;
}

// ─── Threat Assessment ────────────────────────────────────────

export interface ThreatInfo {
  level: string;
  color: string;
  bg: string;
  desc: string;
}

/**
 * Classifies the threat level of a near-Earth object based on
 * its hazardous status and proximity in lunar distances.
 */
export function getThreatInfo(hazardous: boolean, lunarDistance: number): ThreatInfo {
  if (hazardous && lunarDistance < NEO_THRESHOLDS.PROXIMITY.HIGH_THREAT_LD) {
    return {
      level: "HIGH",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
      desc: "Close approach — potentially hazardous",
    };
  }
  if (hazardous) {
    return {
      level: "MODERATE",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
      desc: "Potentially Hazardous Asteroid (PHA)",
    };
  }
  if (lunarDistance < NEO_THRESHOLDS.PROXIMITY.WATCH_LD) {
    return {
      level: "WATCH",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/30",
      desc: "Within 10 lunar distances",
    };
  }
  return {
    level: "SAFE",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    desc: "No threat — safe distance",
  };
}

// ─── Size Comparison ──────────────────────────────────────────

/**
 * Returns a human-readable size comparison for an object
 * given its estimated diameter in meters.
 */
export function getSizeComparison(meters: number): string {
  const { SIZE } = NEO_THRESHOLDS;
  if (meters < SIZE.CAR) return "Smaller than a car";
  if (meters < SIZE.BUS) return "Size of a bus";
  if (meters < SIZE.HOUSE) return "Size of a house";
  if (meters < SIZE.STATUE_OF_LIBERTY) return "Statue of Liberty scale";
  if (meters < SIZE.FOOTBALL_FIELD) return "Football field scale";
  if (meters < SIZE.SKYSCRAPER) return "Skyscraper scale";
  return "Mountain scale";
}

// ─── Proximity Calculation ────────────────────────────────────

/**
 * Calculates the bar fill percentage for the proximity visualization.
 * Closer objects fill more of the bar (inverse relationship).
 */
export function calculateProximityBarFill(lunarDistance: number): number {
  const clampedLD = Math.min(lunarDistance, NEO_THRESHOLDS.PROXIMITY.BAR_NORMALIZE_MAX);
  const normalized = (NEO_THRESHOLDS.PROXIMITY.BAR_NORMALIZE_MAX - clampedLD)
    / NEO_THRESHOLDS.PROXIMITY.BAR_NORMALIZE_MAX;
  return Math.max(NEO_THRESHOLDS.BAR_FILL_MIN, Math.min(NEO_THRESHOLDS.BAR_FILL_MAX, normalized * 100));
}

// ─── Data Transformation ──────────────────────────────────────

/**
 * Extracts and sorts NEO objects from the NASA API response,
 * ordering by closest approach distance (ascending).
 */
export function extractAndSortNeos(
  nearEarthObjects: Record<string, NeoObject[]> | undefined
): NeoObject[] {
  if (!nearEarthObjects) return [];
  const allNeos: NeoObject[] = Object.values(nearEarthObjects).flat();
  allNeos.sort((a, b) =>
    parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || "0") -
    parseFloat(b.close_approach_data[0]?.miss_distance?.kilometers || "0")
  );
  return allNeos;
}

/**
 * Computes aggregate statistics for a list of NEO objects.
 */
export function computeNeoStats(asteroids: NeoObject[]) {
  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
  const closestLD = asteroids[0]
    ? parseFloat(asteroids[0].close_approach_data[0]?.miss_distance?.lunar || "0").toFixed(1)
    : "—";
  return { hazardousCount, closestLD };
}

/**
 * Formats a number with comma-separated thousands.
 * Example: 142536 → "142,536"
 */
export function formatWithCommas(value: number): string {
  return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
