// SpaceAtlas — Vector Store Unit Tests
// Tests cosine similarity, vector operations, and search functionality

import { VectorStore, cosineSimilarity, normalizeVector, euclideanDistance } from '@/lib/search/vector-store';
import type { EmbeddingRecord, EntityType } from '@/lib/types';

// ─── Helper: Create Mock Embedding Records ────────────────────

function createMockRecord(
  id: string,
  type: EntityType,
  vector: number[],
  name: string = id
): EmbeddingRecord {
  return {
    id,
    entityType: type,
    vector,
    textContent: `Test content for ${name}`,
    metadata: { name, slug: id },
  };
}

// ─── Cosine Similarity Tests ──────────────────────────────────

describe('cosineSimilarity', () => {
  it('should return 1 for identical vectors', () => {
    const v = [1, 2, 3, 4];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  it('should return 0 for orthogonal vectors', () => {
    const a = [1, 0];
    const b = [0, 1];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5);
  });

  it('should return -1 for opposite vectors', () => {
    const a = [1, 0];
    const b = [-1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 5);
  });

  it('should handle high-dimensional vectors correctly', () => {
    const a = Array.from({ length: 384 }, (_, i) => Math.sin(i));
    const b = Array.from({ length: 384 }, (_, i) => Math.sin(i + 0.1));
    const similarity = cosineSimilarity(a, b);
    expect(similarity).toBeGreaterThan(0.9);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should throw on dimension mismatch', () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow('dimension mismatch');
  });

  it('should return 0 for zero vectors', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it('should be commutative', () => {
    const a = [1, 3, -5, 2];
    const b = [4, -2, -1, 8];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 10);
  });
});

// ─── Vector Normalization Tests ───────────────────────────────

describe('normalizeVector', () => {
  it('should produce unit-length vectors', () => {
    const v = [3, 4]; // 3-4-5 triangle
    const normalized = normalizeVector(v);
    const magnitude = Math.sqrt(normalized.reduce((sum, x) => sum + x * x, 0));
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it('should return zero vector unchanged', () => {
    const zero = [0, 0, 0];
    expect(normalizeVector(zero)).toEqual([0, 0, 0]);
  });

  it('should preserve direction', () => {
    const v = [2, 6];
    const n = normalizeVector(v);
    // Ratio should remain the same
    expect(n[1] / n[0]).toBeCloseTo(3, 5);
  });
});

// ─── Euclidean Distance Tests ─────────────────────────────────

describe('euclideanDistance', () => {
  it('should return 0 for identical vectors', () => {
    expect(euclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it('should compute correct distance', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBeCloseTo(5, 5);
  });
});

// ─── VectorStore Tests ────────────────────────────────────────

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    store = new VectorStore();
  });

  it('should start empty and not ready', () => {
    expect(store.isReady).toBe(false);
    expect(store.stats().totalRecords).toBe(0);
  });

  it('should add records and become ready', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    expect(store.isReady).toBe(true);
    expect(store.stats().totalRecords).toBe(1);
  });

  it('should track dimensionality from first record', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    expect(store.stats().dimensionality).toBe(3);
  });

  it('should build type index correctly', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    store.addRecord(createMockRecord('r2', 'rocket', [0, 1, 0]));
    store.addRecord(createMockRecord('p1', 'planet', [0, 0, 1]));

    const stats = store.stats();
    expect(stats.recordsByType['rocket']).toBe(2);
    expect(stats.recordsByType['planet']).toBe(1);
  });

  it('should find the most similar vector', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0], 'Falcon 9'));
    store.addRecord(createMockRecord('r2', 'rocket', [0, 1, 0], 'Saturn V'));
    store.addRecord(createMockRecord('r3', 'rocket', [0.9, 0.1, 0], 'Falcon Heavy'));

    const results = store.search([1, 0, 0], 2);
    expect(results.length).toBe(2);
    expect(results[0].record.id).toBe('r1'); // Exact match
    expect(results[0].score).toBeCloseTo(1, 2);
    expect(results[1].record.id).toBe('r3'); // Close match
  });

  it('should filter by entity type', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    store.addRecord(createMockRecord('p1', 'planet', [1, 0, 0])); // Same vector, different type

    const rocketResults = store.search([1, 0, 0], 10, 0, ['rocket']);
    expect(rocketResults.length).toBe(1);
    expect(rocketResults[0].record.entityType).toBe('rocket');
  });

  it('should respect the threshold parameter', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    store.addRecord(createMockRecord('r2', 'rocket', [0, 1, 0])); // Orthogonal = 0 similarity

    const highThreshold = store.search([1, 0, 0], 10, 0.9);
    expect(highThreshold.length).toBe(1); // Only exact match

    const lowThreshold = store.search([1, 0, 0], 10, 0);
    expect(lowThreshold.length).toBe(2); // Both (orthogonal is exactly 0)
  });

  it('should respect the topK limit', () => {
    for (let i = 0; i < 10; i++) {
      store.addRecord(createMockRecord(`r${i}`, 'rocket', [1, i * 0.01, 0]));
    }

    const results = store.search([1, 0, 0], 3, 0);
    expect(results.length).toBe(3);
  });

  it('should clear all data', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    store.clear();
    expect(store.isReady).toBe(false);
    expect(store.stats().totalRecords).toBe(0);
  });

  it('should get record by ID', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    const record = store.getRecord('r1');
    expect(record).toBeDefined();
    expect(record!.id).toBe('r1');
  });

  it('should return undefined for missing record', () => {
    expect(store.getRecord('nonexistent')).toBeUndefined();
  });

  it('should get records by type', () => {
    store.addRecord(createMockRecord('r1', 'rocket', [1, 0, 0]));
    store.addRecord(createMockRecord('p1', 'planet', [0, 1, 0]));

    const rockets = store.getByType('rocket');
    expect(rockets.length).toBe(1);
    expect(rockets[0].entityType).toBe('rocket');
  });

  it('should bulk-load records', () => {
    const records = [
      createMockRecord('r1', 'rocket', [1, 0, 0]),
      createMockRecord('r2', 'rocket', [0, 1, 0]),
      createMockRecord('p1', 'planet', [0, 0, 1]),
    ];
    store.loadRecords(records);
    expect(store.stats().totalRecords).toBe(3);
  });
});
