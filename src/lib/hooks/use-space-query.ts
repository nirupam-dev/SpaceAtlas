/**
 * ─── Custom Data Fetching Hooks ───────────────────────────────
 *
 * Drop-in replacements for raw useEffect + fetch patterns.
 * Each hook wraps TanStack Query's useQuery with:
 * - Type-safe return values
 * - Automatic caching, deduplication & retry
 * - Race condition prevention
 * - Configurable stale times per data type (via semantic constants)
 *
 * These hooks replace the fragile client-side fetching pattern
 * that was prone to race conditions when users switched tabs quickly.
 */

import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES, API_LIMITS } from "@/lib/constants";

// ─── Generic Fetcher ──────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── NEO / Asteroid Watch ─────────────────────────────────────

interface NeoResponse {
  near_earth_objects: Record<string, unknown[]>;
}

export function useNeoData(dateStr: string) {
  return useQuery({
    queryKey: ["neo", dateStr],
    queryFn: () =>
      fetchJSON<NeoResponse>(`/api/neo?start_date=${dateStr}&end_date=${dateStr}`),
    staleTime: STALE_TIMES.NEO,
  });
}

// ─── Space Weather ────────────────────────────────────────────

export function useSpaceWeather() {
  return useQuery({
    queryKey: ["space-weather"],
    queryFn: async () => {
      const [cmeRes, flrRes, gstRes] = await Promise.allSettled([
        fetchJSON("/api/space-weather?type=CME"),
        fetchJSON("/api/space-weather?type=FLR"),
        fetchJSON("/api/space-weather?type=GST"),
      ]);

      return {
        cmes: cmeRes.status === "fulfilled" && Array.isArray(cmeRes.value)
          ? (cmeRes.value as unknown[]).slice(0, API_LIMITS.SPACE_WEATHER_PER_CATEGORY) : [],
        flares: flrRes.status === "fulfilled" && Array.isArray(flrRes.value)
          ? (flrRes.value as unknown[]).slice(0, API_LIMITS.SPACE_WEATHER_PER_CATEGORY) : [],
        storms: gstRes.status === "fulfilled" && Array.isArray(gstRes.value)
          ? (gstRes.value as unknown[]).slice(0, API_LIMITS.SPACE_WEATHER_PER_CATEGORY) : [],
      };
    },
    staleTime: STALE_TIMES.SPACE_WEATHER,
  });
}

// ─── People in Space ──────────────────────────────────────────

interface PeopleResponse {
  people: { name: string; craft: string }[];
}

export function usePeopleInSpace() {
  return useQuery({
    queryKey: ["people-in-space"],
    queryFn: () => fetchJSON<PeopleResponse>("/api/people-in-space"),
    staleTime: STALE_TIMES.PEOPLE_IN_SPACE,
  });
}

// ─── Live Launches ────────────────────────────────────────────

interface LaunchResponse {
  results: unknown[];
}

export function useLiveLaunches(limit = API_LIMITS.LAUNCHES_FETCH) {
  return useQuery({
    queryKey: ["live-launches", limit],
    queryFn: () =>
      fetchJSON<LaunchResponse>(`/api/launch-library?limit=${limit}&type=upcoming`),
    staleTime: STALE_TIMES.LIVE_LAUNCHES,
  });
}

// ─── Earth Events (EONET) ─────────────────────────────────────

interface EonetResponse {
  events: unknown[];
}

export function useEarthEvents(limit = API_LIMITS.EARTH_EVENTS_FETCH) {
  return useQuery({
    queryKey: ["earth-events", limit],
    queryFn: () => fetchJSON<EonetResponse>(`/api/eonet?limit=${limit}`),
    staleTime: STALE_TIMES.EARTH_EVENTS,
  });
}

// ─── Fireballs ────────────────────────────────────────────────

interface FireballResponse {
  data: string[][];
  fields: string[];
}

export function useFireballs() {
  return useQuery({
    queryKey: ["fireballs"],
    queryFn: () => fetchJSON<FireballResponse>("/api/fireballs"),
    staleTime: STALE_TIMES.FIREBALLS,
  });
}

// ─── Exoplanets ───────────────────────────────────────────────

export function useExoplanets(limit = API_LIMITS.EXOPLANETS_FETCH) {
  return useQuery({
    queryKey: ["exoplanets", limit],
    queryFn: () => fetchJSON<unknown[]>(`/api/exoplanets?limit=${limit}`),
    staleTime: STALE_TIMES.EXOPLANETS,
  });
}
