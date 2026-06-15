// SpaceAtlas — Local Embedding Generation Pipeline
// Auto-generates TF-IDF embeddings when Gemini API is unavailable
// Provides zero-config semantic search capability

import { getTFIDFVectorizer, type TFIDFVectorizer } from './tfidf-engine';
import { entityToEmbeddingText } from './query-expander';
import { getVectorStore } from './vector-store';
import type { EntityType, EmbeddingRecord } from '../types';

let _initialized = false;
let _initializing = false;

/**
 * Build local TF-IDF embeddings from all encyclopedia data.
 * This runs automatically when Gemini embeddings are unavailable.
 */
export async function generateLocalEmbeddings(
  data: {
    rockets: Record<string, unknown>[];
    agencies: Record<string, unknown>[];
    planets: Record<string, unknown>[];
    missions: Record<string, unknown>[];
    astronauts: Record<string, unknown>[];
    spaceNews: Record<string, unknown>[];
  }
): Promise<{ embeddings: Record<string, number[]>; stats: LocalEmbeddingStats }> {
  const startTime = performance.now();
  const vectorizer = getTFIDFVectorizer();

  // Add all entities to the corpus
  const addEntities = (entities: Record<string, unknown>[], type: EntityType) => {
    for (const entity of entities) {
      const text = entityToEmbeddingText(entity, type);
      vectorizer.addDocument(entity.id as string, text, type);
    }
  };

  addEntities(data.rockets, 'rocket');
  addEntities(data.agencies, 'agency');
  addEntities(data.planets, 'planet');
  addEntities(data.missions, 'mission');
  addEntities(data.astronauts, 'astronaut');
  addEntities(data.spaceNews, 'news');

  // Build the TF-IDF index
  vectorizer.build();

  // Generate all embeddings
  const embeddings = vectorizer.generateAllEmbeddings();

  const elapsedMs = Math.round(performance.now() - startTime);

  const stats: LocalEmbeddingStats = {
    totalEntities: vectorizer.documentCount,
    embeddingsGenerated: Object.keys(embeddings).length,
    vocabularySize: vectorizer.vocabularySize,
    dimension: vectorizer.dimension,
    elapsedMs,
    method: 'tfidf-bm25',
  };

  console.log(
    `[LocalEmbeddings] Generated ${stats.embeddingsGenerated} embeddings ` +
    `(dim=${stats.dimension}, vocab=${stats.vocabularySize}) in ${stats.elapsedMs}ms`
  );

  return { embeddings, stats };
}

/**
 * Initialize the vector store with local TF-IDF embeddings.
 * Only runs if the vector store is empty and Gemini embeddings aren't available.
 */
export async function ensureLocalEmbeddings(): Promise<boolean> {
  if (_initialized || _initializing) return _initialized;
  _initializing = true;

  const store = getVectorStore();
  if (store.isReady) {
    _initialized = true;
    _initializing = false;
    return true;
  }

  try {
    // Dynamically import data to avoid circular dependencies
    const { rockets, agencies, planets, missions, astronauts, spaceNews } =
      await import('../data');

    const { embeddings } = await generateLocalEmbeddings({
      rockets: rockets as unknown as Record<string, unknown>[],
      agencies: agencies as unknown as Record<string, unknown>[],
      planets: planets as unknown as Record<string, unknown>[],
      missions: missions as unknown as Record<string, unknown>[],
      astronauts: astronauts as unknown as Record<string, unknown>[],
      spaceNews: spaceNews as unknown as Record<string, unknown>[],
    });

    // Load embeddings into the vector store
    const { initializeVectorStore } = await import('./semantic-search');
    await initializeVectorStore(embeddings);

    _initialized = true;
    console.log('[LocalEmbeddings] Vector store initialized with local TF-IDF embeddings');
    return true;
  } catch (error) {
    console.error('[LocalEmbeddings] Failed to generate local embeddings:', error);
    return false;
  } finally {
    _initializing = false;
  }
}

/**
 * Generate a query embedding using the local TF-IDF vectorizer.
 * Falls back gracefully if the vectorizer hasn't been built yet.
 */
export function generateLocalQueryEmbedding(query: string): number[] | null {
  const vectorizer = getTFIDFVectorizer();
  if (!vectorizer.isBuilt) return null;
  return vectorizer.vectorize(query);
}

export interface LocalEmbeddingStats {
  totalEntities: number;
  embeddingsGenerated: number;
  vocabularySize: number;
  dimension: number;
  elapsedMs: number;
  method: string;
}
