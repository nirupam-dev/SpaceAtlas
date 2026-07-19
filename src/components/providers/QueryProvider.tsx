"use client";

/**
 * ─── React Query Provider ──────────────────────────────────────
 *
 * Wraps the app in a QueryClientProvider for TanStack Query.
 * This replaces raw useEffect + fetch patterns with:
 * - Automatic caching & deduplication
 * - Built-in retry logic with exponential backoff
 * - Race condition prevention (stale closures are handled)
 * - Background refetching for stale data
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
