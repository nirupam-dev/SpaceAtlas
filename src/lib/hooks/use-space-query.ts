/**
 * ─── Custom Data Fetching Hooks ───────────────────────────────
 *
 * Drop-in replacements for raw useEffect + fetch patterns.
 * Each hook wraps TanStack Query's useQuery with:
 * - Type-safe return values
 * - Automatic caching, deduplication & retry
 * - Race condition prevention
 * - Configurable stale times per data type
 *
 * These hooks replace the fragile client-side fetching pattern
 * that was prone to race conditions when users switched tabs quickly.
 */

import { useQuery } from "@tanstack/react-query";

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
    staleTime: 5 * 60 * 1000, // 5 min — NEO data doesn't change rapidly
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
          ? (cmeRes.value as unknown[]).slice(0, 20) : [],
        flares: flrRes.status === "fulfilled" && Array.isArray(flrRes.value)
          ? (flrRes.value as unknown[]).slice(0, 20) : [],
        storms: gstRes.status === "fulfilled" && Array.isArray(gstRes.value)
          ? (gstRes.value as unknown[]).slice(0, 20) : [],
      };
    },
    staleTime: 2 * 60 * 1000, // 2 min — weather data updates frequently
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
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Live Launches ────────────────────────────────────────────

interface LaunchResponse {
  results: unknown[];
}

export function useLiveLaunches(limit = 12) {
  return useQuery({
    queryKey: ["live-launches", limit],
    queryFn: () =>
      fetchJSON<LaunchResponse>(`/api/launch-library?limit=${limit}&type=upcoming`),
    staleTime: 60 * 1000, // 1 min — launch data is time-sensitive
  });
}

// ─── Earth Events (EONET) ─────────────────────────────────────

interface EonetResponse {
  events: unknown[];
}

export function useEarthEvents(limit = 30) {
  return useQuery({
    queryKey: ["earth-events", limit],
    queryFn: () => fetchJSON<EonetResponse>(`/api/eonet?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000, // 10 min — historical data
  });
}

// ─── Exoplanets ───────────────────────────────────────────────

export function useExoplanets(limit = 100) {
  return useQuery({
    queryKey: ["exoplanets", limit],
    queryFn: () => fetchJSON<unknown[]>(`/api/exoplanets?limit=${limit}`),
    staleTime: 30 * 60 * 1000, // 30 min — catalog data is very stable
  });
}
