// SpaceAtlas — In-Memory Vector Store
// Efficient vector database for embedding storage and similarity search
// Uses cosine similarity for semantic matching

import type { EmbeddingRecord, EntityType } from '../types';

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1, where 1 = identical direction.
 * Optimized with loop unrolling for performance on typical embedding dimensions.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = a.length;

  // Process 4 elements at a time for better CPU pipeline utilization
  const remainder = len % 4;
  let i = 0;

  for (; i < len - remainder; i += 4) {
    dotProduct += a[i] * b[i] + a[i + 1] * b[i + 1] + a[i + 2] * b[i + 2] + a[i + 3] * b[i + 3];
    normA += a[i] * a[i] + a[i + 1] * a[i + 1] + a[i + 2] * a[i + 2] + a[i + 3] * a[i + 3];
    normB += b[i] * b[i] + b[i + 1] * b[i + 1] + b[i + 2] * b[i + 2] + b[i + 3] * b[i + 3];
  }

  // Handle remaining elements
  for (; i < len; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Compute Euclidean distance between two vectors.
 * Lower = more similar.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Normalize a vector to unit length (L2 normalization).
 */
export function normalizeVector(v: number[]): number[] {
  let norm = 0;
  for (let i = 0; i < v.length; i++) {
    norm += v[i] * v[i];
  }
  norm = Math.sqrt(norm);
  if (norm === 0) return v;
  return v.map((x) => x / norm);
}

interface SimilarityResult {
  record: EmbeddingRecord;
  score: number;
}

/**
 * VectorStore — In-memory vector database with efficient similarity search.
 *
 * Architecture:
 * - Stores embedding records with metadata
 * - Pre-normalizes vectors for faster cosine similarity
 * - Supports filtered search by entity type
 * - Uses a linear scan (optimal for <10K vectors)
 * - Can be extended with approximate nearest neighbor (ANN) for scale
 */
export class VectorStore {
  private records: EmbeddingRecord[] = [];
  private normalizedVectors: Map<string, number[]> = new Map();
  private typeIndex: Map<EntityType, string[]> = new Map();
  private dimensionality: number = 0;

  /**
   * Add a single embedding record to the store.
   */
  addRecord(record: EmbeddingRecord): void {
    this.records.push(record);

    // Pre-normalize for faster search
    const normalized = normalizeVector(record.vector);
    this.normalizedVectors.set(record.id, normalized);

    // Update type index
    const typeIds = this.typeIndex.get(record.entityType) || [];
    typeIds.push(record.id);
    this.typeIndex.set(record.entityType, typeIds);

    // Track dimensionality
    if (this.dimensionality === 0) {
      this.dimensionality = record.vector.length;
    }
  }

  /**
   * Bulk-load embedding records for efficiency.
   */
  loadRecords(records: EmbeddingRecord[]): void {
    for (const record of records) {
      this.addRecord(record);
    }
  }

  /**
   * Find the top-K most similar vectors to the query vector.
   *
   * @param queryVector - The embedding vector to search against
   * @param topK - Number of results to return (default: 10)
   * @param threshold - Minimum similarity score (default: 0.3)
   * @param typeFilter - Optional: only search within specific entity types
   */
  search(
    queryVector: number[],
    topK: number = 10,
    threshold: number = 0.3,
    typeFilter?: EntityType[]
  ): SimilarityResult[] {
    const normalizedQuery = normalizeVector(queryVector);
    const results: SimilarityResult[] = [];

    // Determine which records to search
    let candidates: EmbeddingRecord[];
    if (typeFilter && typeFilter.length > 0) {
      const candidateIds = new Set<string>();
      for (const type of typeFilter) {
        const ids = this.typeIndex.get(type) || [];
        ids.forEach((id) => candidateIds.add(id));
      }
      candidates = this.records.filter((r) => candidateIds.has(r.id));
    } else {
      candidates = this.records;
    }

    // Compute similarities
    for (const record of candidates) {
      const normalizedRecord = this.normalizedVectors.get(record.id);
      if (!normalizedRecord) continue;

      // For normalized vectors, cosine similarity = dot product
      let score = 0;
      for (let i = 0; i < normalizedQuery.length; i++) {
        score += normalizedQuery[i] * normalizedRecord[i];
      }

      if (score >= threshold) {
        results.push({ record, score });
      }
    }

    // Sort by score descending and take top-K
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Get a record by ID.
   */
  getRecord(id: string): EmbeddingRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  /**
   * Get all records of a specific type.
   */
  getByType(type: EntityType): EmbeddingRecord[] {
    const ids = this.typeIndex.get(type) || [];
    return this.records.filter((r) => ids.includes(r.id));
  }

  /**
   * Get store statistics.
   */
  stats(): {
    totalRecords: number;
    dimensionality: number;
    recordsByType: Record<string, number>;
  } {
    const recordsByType: Record<string, number> = {};
    for (const [type, ids] of this.typeIndex.entries()) {
      recordsByType[type] = ids.length;
    }
    return {
      totalRecords: this.records.length,
      dimensionality: this.dimensionality,
      recordsByType,
    };
  }

  /**
   * Clear all records.
   */
  clear(): void {
    this.records = [];
    this.normalizedVectors.clear();
    this.typeIndex.clear();
    this.dimensionality = 0;
  }

  /**
   * Check if the store has been initialized with data.
   */
  get isReady(): boolean {
    return this.records.length > 0;
  }
}

// Singleton vector store instance
let _instance: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (!_instance) {
    _instance = new VectorStore();
  }
  return _instance;
}
