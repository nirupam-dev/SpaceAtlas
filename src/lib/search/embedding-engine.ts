// SpaceAtlas — Embedding Engine
// Generates embeddings using Google's text-embedding-004 model
// Falls back to local TF-IDF when Gemini API is unavailable
// Handles batch processing, rate limiting, and caching

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { EntityType, EmbeddingRecord } from '../types';
import { entityToEmbeddingText } from './query-expander';
import { embedCache, CACHE_TTL } from '../cache';
import { generateLocalQueryEmbedding } from './local-embeddings';

const MODEL_NAME = 'text-embedding-004';
const EMBEDDING_DIMENSION = 768; // text-embedding-004 output dimension
const BATCH_SIZE = 5; // Process 5 at a time to respect rate limits
const BATCH_DELAY_MS = 200; // Delay between batches

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate an embedding vector for a given text string.
 * Uses Gemini API when available, falls back to local TF-IDF.
 * All results are cached to avoid redundant computation.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cacheKey = `embed:${hashText(text)}`;
  const cached = embedCache.get<number[]>(cacheKey);
  if (cached) return cached;

  // Try Gemini API first
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;
    const result = await model.embedContent(truncatedText);
    const vector = result.embedding.values;
    embedCache.set(cacheKey, vector, CACHE_TTL.EMBEDDINGS);
    return vector;
  } catch {
    // Gemini API unavailable — fall back to local TF-IDF
  }

  // Local TF-IDF fallback (zero external dependencies)
  const localVector = generateLocalQueryEmbedding(text);
  if (localVector) {
    embedCache.set(cacheKey, localVector, CACHE_TTL.EMBEDDINGS);
    return localVector;
  }

  // Final fallback: zero vector (will score low in cosine similarity)
  const zeroVector = new Array(EMBEDDING_DIMENSION).fill(0);
  return zeroVector;
}

/**
 * Generate embeddings for multiple texts in batches.
 * Respects rate limits with configurable batch size and delay.
 */
export async function generateEmbeddingsBatch(
  items: { id: string; text: string; type: EntityType; metadata: Record<string, unknown> }[],
  onProgress?: (completed: number, total: number) => void
): Promise<EmbeddingRecord[]> {
  const records: EmbeddingRecord[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (item) => {
        try {
          const vector = await generateEmbedding(item.text);
          return {
            id: item.id,
            entityType: item.type,
            vector,
            textContent: item.text,
            metadata: {
              name: (item.metadata.name as string) || '',
              slug: (item.metadata.slug as string) || '',
              ...Object.fromEntries(
                Object.entries(item.metadata)
                  .filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
              ),
            },
          } as EmbeddingRecord;
        } catch (error) {
          console.error(`Failed to generate embedding for ${item.id}:`, error);
          return null;
        }
      })
    );

    records.push(...batchResults.filter((r): r is EmbeddingRecord => r !== null));

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, total), total);
    }

    // Rate limit delay between batches
    if (i + BATCH_SIZE < items.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return records;
}

/**
 * Prepare all encyclopedia data for embedding generation.
 * Creates rich text representations optimized for semantic search.
 */
export function prepareEntitiesForEmbedding(
  data: {
    rockets: Record<string, unknown>[];
    agencies: Record<string, unknown>[];
    planets: Record<string, unknown>[];
    missions: Record<string, unknown>[];
    astronauts: Record<string, unknown>[];
    spaceNews: Record<string, unknown>[];
  }
): { id: string; text: string; type: EntityType; metadata: Record<string, unknown> }[] {
  const items: { id: string; text: string; type: EntityType; metadata: Record<string, unknown> }[] = [];

  const addEntities = (entities: Record<string, unknown>[], type: EntityType) => {
    for (const entity of entities) {
      items.push({
        id: entity.id as string,
        text: entityToEmbeddingText(entity, type),
        type,
        metadata: entity,
      });
    }
  };

  addEntities(data.rockets, 'rocket');
  addEntities(data.agencies, 'agency');
  addEntities(data.planets, 'planet');
  addEntities(data.missions, 'mission');
  addEntities(data.astronauts, 'astronaut');
  addEntities(data.spaceNews, 'news');

  return items;
}

/**
 * Simple hash for cache keys.
 */
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(text.length, 200); i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export { EMBEDDING_DIMENSION, MODEL_NAME };
