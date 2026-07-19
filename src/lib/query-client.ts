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

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Keep inactive cache for 5 minutes
        gcTime: 5 * 60 * 1000,
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
