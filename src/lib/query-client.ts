/**
 * ─── TanStack Query Client Configuration ──────────────────────
 *
 * Centralized QueryClient factory with production-grade defaults:
 * - staleTime: 60s (avoids redundant refetches during tab switches)
 * - gcTime: 5 minutes (keeps inactive cache warm)
 * - retry: 2 attempts with exponential backoff
 * - refetchOnWindowFocus: false (prevents jarring re-renders)
 *
 * Used by the QueryProvider in the root layout.
 */

import { QueryClient } from "@tanstack/react-query";
import { STALE_TIMES, GC_TIME } from "@/lib/constants";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for the default duration
        staleTime: STALE_TIMES.DEFAULT,
        // Keep inactive cache warm
        gcTime: GC_TIME,
        // Retry failed requests twice with exponential backoff
        retry: 2,
        // Don't refetch when window regains focus (avoids jarring re-renders)
        refetchOnWindowFocus: false,
        // Refetch on reconnect for live data accuracy
        refetchOnReconnect: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a singleton QueryClient on the browser, or creates a new one
 * on the server (to avoid sharing state between requests).
 */
export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client to avoid cross-request state leakage
    return makeQueryClient();
  }
  // Browser: reuse the same client across the app
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
