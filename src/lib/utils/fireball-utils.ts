/**
 * ─── Fireball Utilities ─────────────────────────────────────────
 *
 * Pure business logic for fireball/bolide data transformation.
 * All functions are stateless and independently testable.
 */

import { FIREBALL_THRESHOLDS, ALTITUDE_THRESHOLDS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────

export interface Fireball {
  date: string;
  lat: string | null;
  "lat-dir": string | null;
  lon: string | null;
  "lon-dir": string | null;
  energy: string | null;
  "impact-e": string | null;
  vel: string | null;
  alt: string | null;
  vx?: string | null;
  vy?: string | null;
  vz?: string | null;
}

// ─── Impact Scale Classification ──────────────────────────────

export interface ImpactScaleInfo {
  label: string;
  color: string;
  desc: string;
}

/**
 * Classifies a fireball's impact energy (in kilotons of TNT)
 * into a severity tier with description.
 */
export function getImpactScale(kt: number): ImpactScaleInfo {
  if (kt >= FIREBALL_THRESHOLDS.CATASTROPHIC_KT) {
    return { label: "Catastrophic", color: "text-red-400", desc: "Equivalent to a major nuclear weapon — could cause widespread destruction" };
  }
  if (kt >= FIREBALL_THRESHOLDS.SIGNIFICANT_KT) {
    return { label: "Significant", color: "text-orange-400", desc: "Comparable to a tactical nuclear device — would cause local devastation" };
  }
  if (kt >= FIREBALL_THRESHOLDS.NOTABLE_KT) {
    return { label: "Notable", color: "text-amber-400", desc: "Significant airburst — powerful enough to shatter windows for miles" };
  }
  if (kt >= FIREBALL_THRESHOLDS.MINOR_KT) {
    return { label: "Minor", color: "text-yellow-400", desc: "Bright fireball with audible sonic boom — minimal ground damage" };
  }
  return { label: "Small", color: "text-cyan-400", desc: "Typical bright meteor — burns up harmlessly in the atmosphere" };
}

// ─── Altitude Description ─────────────────────────────────────

/**
 * Returns a descriptive atmospheric layer for the given altitude in km.
 */
export function getAltitudeDescription(alt: number): string {
  if (alt > ALTITUDE_THRESHOLDS.MESOSPHERE) return "Mesosphere — high-altitude breakup";
  if (alt > ALTITUDE_THRESHOLDS.STRATOSPHERE) return "Stratosphere — moderate altitude event";
  if (alt > ALTITUDE_THRESHOLDS.LOWER_STRATOSPHERE) return "Lower stratosphere — significant penetration";
  return "Troposphere — very deep atmospheric entry";
}

// ─── Data Transformation ──────────────────────────────────────

/**
 * Transforms raw CNEOS API response into typed Fireball objects.
 */
export function parseFireballData(fields: string[], data: string[][]): Fireball[] {
  return data.map(row => {
    const obj: Record<string, string | null> = {};
    fields.forEach((f, i) => { obj[f] = row[i]; });
    return obj as unknown as Fireball;
  });
}

// ─── Statistics ───────────────────────────────────────────────

export interface FireballStats {
  totalEnergy: number;
  maxImpact: number;
  avgVelocity: string;
}

/**
 * Computes aggregate statistics for a list of fireballs.
 */
export function computeFireballStats(fireballs: Fireball[]): FireballStats {
  const totalEnergy = fireballs.reduce(
    (acc, fb) => acc + (fb["impact-e"] ? parseFloat(fb["impact-e"]) : 0), 0
  );
  const maxImpact = Math.max(
    ...fireballs.map(fb => fb["impact-e"] ? parseFloat(fb["impact-e"]) : 0), 0
  );
  const withVelocity = fireballs.filter(fb => fb.vel);
  const avgVelocity = withVelocity.length > 0
    ? (fireballs.reduce((acc, fb) => acc + (fb.vel ? parseFloat(fb.vel) : 0), 0) / withVelocity.length).toFixed(1)
    : "—";

  return { totalEnergy, maxImpact, avgVelocity };
}

/**
 * Determines whether a fireball should be flagged as "large"
 * based on its impact energy or radiated energy.
 */
export function isLargeFireball(impactE: number | null, energy: number | null): boolean {
  return (impactE !== null && impactE > FIREBALL_THRESHOLDS.LARGE_IMPACT_KT)
    || (energy !== null && energy > FIREBALL_THRESHOLDS.LARGE_ENERGY_J);
}

/**
 * Computes the maximum impact energy across a fireball list
 * (used for normalizing energy bar widths).
 */
export function getMaxImpactEnergy(fireballs: Fireball[]): number {
  return Math.max(
    ...fireballs.map(f => f["impact-e"] ? parseFloat(f["impact-e"]) : 0), 0.01
  );
}
