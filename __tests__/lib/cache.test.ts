// SpaceAtlas — Cache System Unit Tests
import { MemoryCache } from '@/lib/cache';

// We need to test the class directly, so we re-implement a minimal version
// since the module only exports instances, not the class.

describe('Cache (apiCache/searchCache instances)', () => {
  // Import the actual instances
  let apiCache: any;
  let searchCache: any;
  let CACHE_TTL: any;

  beforeEach(async () => {
    const mod = await import('@/lib/cache');
    apiCache = mod.apiCache;
    searchCache = mod.searchCache;
    CACHE_TTL = mod.CACHE_TTL;
    apiCache.clear();
    searchCache.clear();
  });

  it('should store and retrieve values', () => {
    apiCache.set('key1', { data: 'test' }, 60000);
    expect(apiCache.get('key1')).toEqual({ data: 'test' });
  });

  it('should return undefined for missing keys', () => {
    expect(apiCache.get('nonexistent')).toBeUndefined();
  });

  it('should delete entries', () => {
    apiCache.set('key1', 'value');
    apiCache.delete('key1');
    expect(apiCache.get('key1')).toBeUndefined();
  });

  it('should clear all entries', () => {
    apiCache.set('k1', 'v1');
    apiCache.set('k2', 'v2');
    apiCache.clear();
    expect(apiCache.get('k1')).toBeUndefined();
    expect(apiCache.get('k2')).toBeUndefined();
  });

  it('should report stats', () => {
    apiCache.set('k1', 'v1');
    const stats = apiCache.stats();
    expect(stats.size).toBe(1);
    expect(stats.maxEntries).toBeGreaterThan(0);
  });

  it('should have correct TTL constants', () => {
    expect(CACHE_TTL.NASA_API).toBe(3600000);
    expect(CACHE_TTL.SEARCH_RESULTS).toBe(300000);
    expect(CACHE_TTL.EMBEDDINGS).toBe(604800000);
  });

  it('should detect stale entries', () => {
    apiCache.set('k1', 'v1', 0); // TTL of 0ms = immediately stale
    expect(apiCache.isStale('k1')).toBe(true);
  });

  it('should serve stale data within SWR window', () => {
    apiCache.set('k1', 'v1', 1); // 1ms TTL
    // Data should still be available in SWR window (2x TTL)
    expect(apiCache.get('k1')).toBe('v1');
  });
});
