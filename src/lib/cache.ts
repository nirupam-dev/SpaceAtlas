// SpaceAtlas — In-Memory Cache with TTL & Stale-While-Revalidate
// Provides aggressive caching for NASA API responses and computed results

import type { CacheEntry } from './types';

class MemoryCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get a cached value. Returns undefined if expired or not found.
   * Supports stale-while-revalidate: returns stale data while refreshing.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    const age = now - entry.timestamp;

    // Still fresh
    if (age < entry.ttl) {
      return entry.data as T;
    }

    // Stale-while-revalidate window (2x TTL)
    if (age < entry.ttl * 2) {
      return entry.data as T;
    }

    // Fully expired
    this.store.delete(key);
    return undefined;
  }

  /**
   * Check if a cached value is stale (past TTL but within SWR window)
   */
  isStale(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp >= entry.ttl;
  }

  /**
   * Set a cache entry with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number = 300_000): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxEntries: number } {
    return { size: this.store.size, maxEntries: this.maxEntries };
  }

  /**
   * Fetch with cache — automatically caches fetch responses
   * Implements stale-while-revalidate pattern
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 300_000
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== undefined) {
      // If stale, trigger background revalidation
      if (this.isStale(key)) {
        // Fire and forget — don't await
        fetcher()
          .then((fresh) => this.set(key, fresh, ttlMs))
          .catch(() => {/* keep stale data */});
      }
      return cached;
    }

    // Nothing cached — fetch fresh
    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }
}

// Singleton cache instances for different domains
export const apiCache = new MemoryCache(200);   // NASA API responses
export const searchCache = new MemoryCache(100); // Search results
export const embedCache = new MemoryCache(50);   // Embedding vectors

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  NASA_API: 60 * 60 * 1000,       // 1 hour
  NASA_IMAGES: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_RESULTS: 5 * 60 * 1000,    // 5 minutes
  EMBEDDINGS: 7 * 24 * 60 * 60 * 1000, // 7 days
  APOD: 12 * 60 * 60 * 1000,       // 12 hours
} as const;
