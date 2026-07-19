/**
 * ─── Application Constants ──────────────────────────────────────
 *
 * Centralized source of truth for all magic numbers, thresholds,
 * and configuration values used throughout the application.
 *
 * Naming Convention:
 * - Time values use _MS suffix and are composed from semantic units
 * - Thresholds are grouped by domain (space weather, NEO, etc.)
 * - Design tokens reference Tailwind classes via string constants
 */

// ─── Time Constants ───────────────────────────────────────────

export const SECOND_IN_MS = 1_000;
export const MINUTE_IN_MS = 60 * SECOND_IN_MS;
export const HOUR_IN_MS = 60 * MINUTE_IN_MS;

/** TanStack Query stale times, per data domain */
export const STALE_TIMES = {
  /** NEO data updates infrequently — 5 minutes */
  NEO: 5 * MINUTE_IN_MS,
  /** Solar weather changes rapidly — 2 minutes */
  SPACE_WEATHER: 2 * MINUTE_IN_MS,
  /** People in space changes rarely — 5 minutes */
  PEOPLE_IN_SPACE: 5 * MINUTE_IN_MS,
  /** Launch data is time-critical — 1 minute */
  LIVE_LAUNCHES: 1 * MINUTE_IN_MS,
  /** Earth events — 5 minutes */
  EARTH_EVENTS: 5 * MINUTE_IN_MS,
  /** Historical fireball data — 10 minutes */
  FIREBALLS: 10 * MINUTE_IN_MS,
  /** Exoplanet catalog is very stable — 30 minutes */
  EXOPLANETS: 30 * MINUTE_IN_MS,
  /** Default stale time for the query client — 1 minute */
  DEFAULT: 1 * MINUTE_IN_MS,
} as const;

/** Garbage collection time for inactive query cache */
export const GC_TIME = 5 * MINUTE_IN_MS;

// ─── Animation Constants ──────────────────────────────────────

export const ANIMATION = {
  /** Stagger delay between list items (seconds) */
  LIST_STAGGER_DELAY: 0.04,
  /** Fireball list uses slightly faster stagger */
  FAST_STAGGER_DELAY: 0.03,
  /** Tab switch animation duration (seconds) */
  TAB_TRANSITION: 0.3,
  /** Page-level tab transition (seconds) */
  PAGE_TRANSITION: 0.4,
  /** Card slide offset (pixels) */
  SLIDE_OFFSET_X: 15,
  SLIDE_OFFSET_Y: 15,
  /** Larger slide for asteroid cards */
  SLIDE_OFFSET_X_LARGE: 20,
} as const;

// ─── API Limits ───────────────────────────────────────────────

export const API_LIMITS = {
  /** Maximum CMEs/flares/storms to display per category */
  SPACE_WEATHER_PER_CATEGORY: 20,
  /** Maximum fireballs to display */
  FIREBALLS_DISPLAY: 30,
  /** Maximum asteroids to display per day */
  NEO_DISPLAY: 20,
  /** Maximum exoplanets to display in grid */
  EXOPLANETS_DISPLAY: 30,
  /** Default exoplanets fetch limit */
  EXOPLANETS_FETCH: 100,
  /** Default live launches fetch limit */
  LAUNCHES_FETCH: 12,
  /** Default earth events fetch limit */
  EARTH_EVENTS_FETCH: 30,
  /** Method chips display limit */
  DISCOVERY_METHODS_DISPLAY: 6,
  /** Maximum date offset for asteroid watch (days forward) */
  NEO_MAX_DATE_OFFSET: 7,
  /** Milliseconds per day (used for date offset calculation) */
  MS_PER_DAY: 86_400_000,
} as const;

// ─── Kp Index Thresholds (Geomagnetic Storm Scale) ────────────

export const KP_THRESHOLDS = {
  EXTREME_G5: 9,
  SEVERE_G4: 8,
  STRONG_G3: 7,
  MODERATE_G2: 6,
  MINOR_G1: 5,
  /** Maximum value on the Kp scale */
  MAX: 9,
} as const;

// ─── NEO / Asteroid Thresholds ────────────────────────────────

export const NEO_THRESHOLDS = {
  /** Size comparison breakpoints (meters) */
  SIZE: {
    CAR: 1,
    BUS: 10,
    HOUSE: 25,
    STATUE_OF_LIBERTY: 50,
    FOOTBALL_FIELD: 100,
    SKYSCRAPER: 300,
  },
  /** Proximity threat levels (lunar distances) */
  PROXIMITY: {
    HIGH_THREAT_LD: 5,
    WATCH_LD: 10,
    /** Maximum LD used for bar normalization */
    BAR_NORMALIZE_MAX: 50,
  },
  /** Minimum bar fill percentage */
  BAR_FILL_MIN: 5,
  /** Maximum bar fill percentage */
  BAR_FILL_MAX: 100,
} as const;

// ─── Fireball Impact Thresholds (kilotons TNT) ────────────────

export const FIREBALL_THRESHOLDS = {
  CATASTROPHIC_KT: 100,
  SIGNIFICANT_KT: 10,
  NOTABLE_KT: 1,
  MINOR_KT: 0.1,
  /** Energy threshold for "large" fireball badge (Joules) */
  LARGE_ENERGY_J: 1e11,
  /** Impact threshold for "large" fireball badge (kT) */
  LARGE_IMPACT_KT: 1,
} as const;

// ─── Fireball Altitude Thresholds (km) ────────────────────────

export const ALTITUDE_THRESHOLDS = {
  MESOSPHERE: 60,
  STRATOSPHERE: 40,
  LOWER_STRATOSPHERE: 20,
} as const;

// ─── Exoplanet Classification Thresholds (Earth radii) ────────

export const EXOPLANET_THRESHOLDS = {
  /** Planet radius classification (R⊕) */
  RADIUS: {
    TERRESTRIAL: 1.25,
    SUPER_EARTH: 2,
    SUB_NEPTUNE: 4,
    NEPTUNE_LIKE: 6,
    GAS_GIANT: 15,
  },
  /** Habitable zone temperature range (Kelvin) */
  HABITABLE_ZONE: {
    MIN_TEMP: 200,
    MAX_TEMP: 320,
    MIN_RADIUS: 0.5,
    MAX_RADIUS: 2.5,
  },
  /** Earth radius in km (for unit conversion) */
  EARTH_RADIUS_KM: 6371,
  /** Parsec to light-year conversion factor */
  PARSEC_TO_LY: 3.26,
  /** Kelvin to Celsius offset */
  KELVIN_TO_CELSIUS_OFFSET: 273.15,
} as const;

// ─── Solar Flare Classification ───────────────────────────────

export const FLARE_CLASSES = {
  X: "X",
  M: "M",
  C: "C",
} as const;

// ─── Kp Bar Color Thresholds ──────────────────────────────────

export const KP_BAR_COLORS = {
  HIGH: 7,    // Kp >= 7 → red
  MEDIUM: 5,  // Kp >= 5 → amber
} as const;

// ─── Proximity Bar Color Thresholds (lunar distances) ─────────

export const PROXIMITY_BAR_COLORS = {
  CLOSE: 5,   // LD < 5 → red
  MEDIUM: 15, // LD < 15 → amber
} as const;
