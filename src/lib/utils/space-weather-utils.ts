/**
 * ─── Space Weather Utilities ────────────────────────────────────
 *
 * Pure business logic for space weather data transformation.
 * All functions are stateless and independently testable.
 */

import { KP_THRESHOLDS, FLARE_CLASSES } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────

export interface CME {
  activityID: string;
  startTime: string;
  sourceLocation?: string;
  note?: string;
  link?: string;
  cmeAnalyses?: CMEAnalysis[];
}

export interface CMEAnalysis {
  type: string;
  speed: number;
  halfAngle: number;
  isMostAccurate: boolean;
}

export interface SolarFlare {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  classType: string;
  sourceLocation?: string;
  link?: string;
}

export interface GeoStorm {
  gstID: string;
  startTime: string;
  link?: string;
  allKpIndex?: KpReading[];
}

export interface KpReading {
  kpIndex: number;
  observedTime: string;
  source: string;
}

// ─── Kp Index Classification ──────────────────────────────────

export interface KpDescription {
  level: string;
  color: string;
}

/**
 * Maps a Kp index value to its geomagnetic storm classification
 * and associated UI color. Based on NOAA's G-scale.
 */
export function getKpDescription(kp: number): KpDescription {
  if (kp >= KP_THRESHOLDS.EXTREME_G5) return { level: "Extreme (G5)", color: "text-red-400" };
  if (kp >= KP_THRESHOLDS.SEVERE_G4) return { level: "Severe (G4)", color: "text-red-400" };
  if (kp >= KP_THRESHOLDS.STRONG_G3) return { level: "Strong (G3)", color: "text-orange-400" };
  if (kp >= KP_THRESHOLDS.MODERATE_G2) return { level: "Moderate (G2)", color: "text-amber-400" };
  if (kp >= KP_THRESHOLDS.MINOR_G1) return { level: "Minor (G1)", color: "text-yellow-400" };
  return { level: "Below Storm", color: "text-cyan-400" };
}

// ─── Solar Flare Classification ───────────────────────────────

/**
 * Determines if a solar flare is "strong" (M-class or X-class).
 */
export function isStrongFlare(classType: string | undefined): boolean {
  if (!classType) return false;
  return classType.startsWith(FLARE_CLASSES.X) || classType.startsWith(FLARE_CLASSES.M);
}

/**
 * Returns a human-readable description of a flare's impact
 * based on its spectral classification.
 */
export function getFlareImpactDescription(classType: string | undefined): string {
  if (!classType) return "Minimal impact";
  if (classType.startsWith(FLARE_CLASSES.X)) return "Most intense — can cause radio blackouts";
  if (classType.startsWith(FLARE_CLASSES.M)) return "Moderate — may cause brief radio blackouts";
  if (classType.startsWith(FLARE_CLASSES.C)) return "Small — minor effects";
  return "Minimal impact";
}

// ─── CME Analysis ─────────────────────────────────────────────

/**
 * Selects the most accurate CME analysis from the array,
 * falling back to the first entry if none is flagged as most accurate.
 */
export function getMostAccurateAnalysis(analyses?: CMEAnalysis[]): CMEAnalysis | undefined {
  if (!analyses || analyses.length === 0) return undefined;
  return analyses.find(a => a.isMostAccurate) || analyses[0];
}

// ─── Storm Statistics ─────────────────────────────────────────

/**
 * Computes the maximum Kp index value from a storm's readings.
 */
export function getMaxKp(allKpIndex?: KpReading[]): number {
  if (!allKpIndex || allKpIndex.length === 0) return 0;
  return Math.max(...allKpIndex.map(k => k.kpIndex));
}

// ─── Date Formatting ──────────────────────────────────────────

/**
 * Formats a date string to a compact display format.
 * Example: "Jan 15, 02:30 PM"
 */
export function formatShortDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

/**
 * Formats a date string to a full display format.
 * Example: "Mon, Jan 15, 2024, 02:30 PM EST"
 */
export function formatFullDate(d: string): string {
  try {
    return new Date(d).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return d;
  }
}
