/**
 * ─── Earth Events Utilities ─────────────────────────────────────
 *
 * Shared configuration and pure utility functions for the
 * Earth Events (EONET) observatory component.
 */

import { Flame, Mountain, Wind, Waves, Globe2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

export interface EonetEvent {
  id: string;
  title: string;
  description?: string;
  categories: { id: string; title: string }[];
  geometry: { date: string; type: string; coordinates: number[] }[];
  sources: { id: string; url: string }[];
}

// ─── Category Mappings ────────────────────────────────────────

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  wildfires: Flame,
  volcanoes: Mountain,
  severeStorms: Wind,
  seaLakeIce: Waves,
};

export const DEFAULT_CATEGORY_ICON = Globe2;

export const CATEGORY_COLORS: Record<string, string> = {
  wildfires: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  volcanoes: "text-red-400 bg-red-500/10 border-red-500/30",
  severeStorms: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  seaLakeIce: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export const DEFAULT_CATEGORY_COLOR = "text-space-400 bg-white/5 border-white/10";

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  wildfires: "Active wildfire detected by satellite thermal sensors. These events can span thousands of hectares and significantly impact air quality.",
  volcanoes: "Volcanic activity detected — may include eruptions, ash plumes, or elevated thermal signatures from magma.",
  severeStorms: "Severe weather system tracked by meteorological satellites, including cyclones, typhoons, and hurricanes.",
  seaLakeIce: "Significant change in sea or lake ice coverage detected by radar and optical satellites.",
};

export const DEFAULT_CATEGORY_DESCRIPTION = "Natural event detected by satellite observation.";

// ─── Utility Functions ────────────────────────────────────────

/**
 * Resolves the icon component for a given EONET category ID.
 */
export function getCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] || DEFAULT_CATEGORY_ICON;
}

/**
 * Resolves the CSS color classes for a given EONET category ID.
 */
export function getCategoryColor(categoryId: string): string {
  return CATEGORY_COLORS[categoryId] || DEFAULT_CATEGORY_COLOR;
}

/**
 * Resolves the description text for a given EONET category ID.
 */
export function getCategoryDescription(categoryId: string): string {
  return CATEGORY_DESCRIPTIONS[categoryId] || DEFAULT_CATEGORY_DESCRIPTION;
}

/**
 * Counts events by category ID.
 */
export function countEventCategories(events: EonetEvent[]): Record<string, number> {
  return events.reduce<Record<string, number>>((acc, e) => {
    const cat = e.categories[0]?.id || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Filters events by category ID. Returns all events if filter is "all".
 */
export function filterEventsByCategory(events: EonetEvent[], filter: string): EonetEvent[] {
  if (filter === "all") return events;
  return events.filter(e => e.categories[0]?.id === filter);
}
