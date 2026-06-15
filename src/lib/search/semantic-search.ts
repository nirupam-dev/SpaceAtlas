// SpaceAtlas — Hybrid Semantic Search Engine
// Combines vector similarity search with keyword matching for maximum accuracy
// Implements query expansion, ranking optimization, and result fusion

import type { EntityType, SearchableEntity, SearchResult, SearchQuery, SearchResponse } from '../types';
import { getVectorStore, cosineSimilarity } from './vector-store';
import { expandQuery, extractKeywords } from './query-expander';
import { generateEmbedding, prepareEntitiesForEmbedding } from './embedding-engine';
import { searchCache, CACHE_TTL } from '../cache';
import { rockets, agencies, planets, missions, astronauts, spaceNews } from '../data';

// ─── Data Indexing ────────────────────────────────────────────

/**
 * Build a searchable entity list from all data sources.
 * Used for keyword search and result presentation.
 */
function buildSearchableEntities(): SearchableEntity[] {
  const entities: SearchableEntity[] = [];

  for (const r of rockets) {
    entities.push({
      id: r.id, name: r.name, slug: r.slug, type: 'rocket',
      description: r.description,
      metadata: { manufacturer: r.manufacturer, country: r.country, status: r.status },
    });
  }

  for (const a of agencies) {
    entities.push({
      id: a.id, name: a.name, slug: a.slug, type: 'agency',
      description: a.description,
      metadata: { abbreviation: a.abbreviation, country: a.country, foundedYear: a.foundedYear },
    });
  }

  for (const p of planets) {
    entities.push({
      id: p.id, name: p.name, slug: p.slug, type: 'planet',
      description: p.description,
      metadata: { type: p.type, orderFromSun: p.orderFromSun, numberOfMoons: p.numberOfMoons },
    });
  }

  for (const m of missions) {
    entities.push({
      id: m.id, name: m.name, slug: m.slug, type: 'mission',
      description: m.description,
      metadata: { agency: m.agency, destination: m.destination, status: m.status },
    });
  }

  for (const a of astronauts) {
    entities.push({
      id: a.id, name: a.name, slug: a.slug, type: 'astronaut',
      description: a.biography,
      metadata: { nationality: a.nationality, status: a.status, spaceWalks: a.spaceWalks },
    });
  }

  for (const n of spaceNews) {
    entities.push({
      id: n.id, name: n.title, slug: n.id, type: 'news',
      description: n.summary,
      metadata: { source: n.source, category: n.category, date: n.date },
    });
  }

  return entities;
}

// Lazy-initialized entity index
let _entityIndex: Map<string, SearchableEntity> | null = null;

function getEntityIndex(): Map<string, SearchableEntity> {
  if (!_entityIndex) {
    _entityIndex = new Map();
    for (const entity of buildSearchableEntities()) {
      _entityIndex.set(entity.id, entity);
    }
  }
  return _entityIndex;
}

// ─── Keyword Search ───────────────────────────────────────────

/**
 * Perform keyword-based search with fuzzy matching.
 * Uses TF-IDF-inspired scoring.
 */
function keywordSearch(
  query: string,
  typeFilter?: EntityType[],
  limit: number = 20
): SearchResult[] {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  const entityIndex = getEntityIndex();
  const results: SearchResult[] = [];

  for (const [, entity] of entityIndex) {
    if (typeFilter && typeFilter.length > 0 && !typeFilter.includes(entity.type)) {
      continue;
    }

    const searchText = `${entity.name} ${entity.description} ${Object.values(entity.metadata).join(' ')}`.toLowerCase();

    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      // Exact name match gets highest score
      if (entity.name.toLowerCase().includes(keyword)) {
        score += 0.5;
        matchedKeywords.push(keyword);
      }
      // Description match
      if (searchText.includes(keyword)) {
        score += 0.2;
        if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
      }
      // Metadata match
      for (const value of Object.values(entity.metadata)) {
        if (String(value).toLowerCase().includes(keyword)) {
          score += 0.15;
          break;
        }
      }
    }

    // Normalize by number of keywords for fair ranking
    if (keywords.length > 0) {
      score = score / keywords.length;
    }

    // Boost based on percentage of keywords matched
    const keywordCoverage = matchedKeywords.length / keywords.length;
    score *= (0.5 + 0.5 * keywordCoverage);

    if (score > 0.05) {
      results.push({
        entity,
        score: Math.min(score, 1),
        matchType: 'keyword',
        highlights: matchedKeywords,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

// ─── Semantic Search ──────────────────────────────────────────

/**
 * Perform semantic vector search using cosine similarity.
 * Auto-detects vector dimensionality and uses matching embedder.
 */
async function semanticSearch(
  query: string,
  typeFilter?: EntityType[],
  limit: number = 20
): Promise<SearchResult[]> {
  const store = getVectorStore();

  if (!store.isReady) {
    // Fall back to keyword search if embeddings aren't loaded
    return [];
  }

  try {
    // Detect store dimensionality to use the matching embedding method
    const storeStats = store.stats();
    let queryVector: number[];

    if (storeStats.dimensionality === 384) {
      // Store has TF-IDF embeddings — use local vectorizer for query
      const { generateLocalQueryEmbedding } = await import('./local-embeddings');
      const localVec = generateLocalQueryEmbedding(query);
      if (!localVec) return [];
      queryVector = localVec;
    } else {
      // Store has Gemini embeddings — use API embedding
      queryVector = await generateEmbedding(query);
    }

    // Search the vector store
    const vectorResults = store.search(queryVector, limit, 0.15, typeFilter);

    // Map to SearchResults
    const entityIndex = getEntityIndex();
    const results: SearchResult[] = [];

    for (const { record, score } of vectorResults) {
      const entity = entityIndex.get(record.id);
      if (entity) {
        results.push({
          entity,
          score,
          matchType: 'semantic',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Semantic search failed:', error);
    return [];
  }
}

// ─── Hybrid Search (Reciprocal Rank Fusion) ───────────────────

/**
 * Combine semantic and keyword results using Reciprocal Rank Fusion (RRF).
 * RRF is a robust rank fusion method that doesn't require score normalization.
 *
 * Score = Σ 1 / (k + rank_i) for each result list
 * where k is a constant (typically 60) to prevent high-ranked items
 * from dominating.
 */
function reciprocalRankFusion(
  semanticResults: SearchResult[],
  keywordResults: SearchResult[],
  k: number = 60
): SearchResult[] {
  const fusedScores = new Map<string, { score: number; result: SearchResult }>();

  // Score semantic results
  for (let i = 0; i < semanticResults.length; i++) {
    const id = semanticResults[i].entity.id;
    const rrfScore = 1 / (k + i + 1);
    const existing = fusedScores.get(id);
    if (existing) {
      existing.score += rrfScore;
      existing.result.matchType = 'hybrid';
    } else {
      fusedScores.set(id, {
        score: rrfScore,
        result: { ...semanticResults[i], matchType: 'hybrid' },
      });
    }
  }

  // Score keyword results
  for (let i = 0; i < keywordResults.length; i++) {
    const id = keywordResults[i].entity.id;
    const rrfScore = 1 / (k + i + 1);
    const existing = fusedScores.get(id);
    if (existing) {
      existing.score += rrfScore;
      existing.result.matchType = 'hybrid';
      // Merge highlights
      if (keywordResults[i].highlights) {
        existing.result.highlights = [
          ...new Set([...(existing.result.highlights || []), ...keywordResults[i].highlights!]),
        ];
      }
    } else {
      fusedScores.set(id, {
        score: rrfScore,
        result: { ...keywordResults[i] },
      });
    }
  }

  // Sort by fused score
  const results = Array.from(fusedScores.values())
    .sort((a, b) => b.score - a.score)
    .map(({ score, result }) => ({
      ...result,
      score: Math.min(score * 50, 1), // Normalize to 0-1 range
    }));

  return results;
}

// ─── Main Search Function ─────────────────────────────────────

/**
 * Perform a hybrid search combining semantic and keyword search.
 * This is the main entry point for all search operations.
 */
export async function search(query: SearchQuery): Promise<SearchResponse> {
  const startTime = performance.now();
  const mode = query.mode || 'hybrid';
  const limit = query.filters?.limit || 20;
  const typeFilter = query.filters?.types;

  // Check cache
  const cacheKey = `search:${query.query}:${mode}:${typeFilter?.join(',') || 'all'}:${limit}`;
  const cached = searchCache.get<SearchResponse>(cacheKey);
  if (cached) return cached;

  // Expand the query
  const expanded = expandQuery(query.query);

  let results: SearchResult[];

  switch (mode) {
    case 'semantic': {
      results = await semanticSearch(expanded.expanded, typeFilter, limit);
      break;
    }
    case 'keyword': {
      results = keywordSearch(query.query, typeFilter, limit);
      break;
    }
    case 'hybrid':
    default: {
      // Run both searches in parallel
      const [semanticResults, keywordResults] = await Promise.all([
        semanticSearch(expanded.expanded, typeFilter, limit),
        Promise.resolve(keywordSearch(query.query, typeFilter, limit)),
      ]);

      // Fuse results using RRF
      results = reciprocalRankFusion(semanticResults, keywordResults);
      break;
    }
  }

  // Apply final limit
  results = results.slice(0, limit);

  const latencyMs = Math.round(performance.now() - startTime);

  const response: SearchResponse = {
    results,
    query: query.query,
    totalResults: results.length,
    searchMode: mode,
    latencyMs,
    expandedTerms: expanded.synonyms.slice(0, 5),
  };

  // Cache the response
  searchCache.set(cacheKey, response, CACHE_TTL.SEARCH_RESULTS);

  return response;
}

/**
 * Initialize the vector store with pre-computed embeddings.
 * Call this at application startup or when embeddings are regenerated.
 */
export async function initializeVectorStore(
  embeddingsJson: Record<string, number[]>
): Promise<{ loaded: number; errors: number }> {
  const store = getVectorStore();
  store.clear();

  const entityIndex = getEntityIndex();
  let loaded = 0;
  let errors = 0;

  for (const [id, vector] of Object.entries(embeddingsJson)) {
    const entity = entityIndex.get(id);
    if (entity && vector && vector.length > 0) {
      store.addRecord({
        id,
        entityType: entity.type,
        vector,
        textContent: entity.description,
        metadata: {
          name: entity.name,
          slug: entity.slug,
          ...Object.fromEntries(
            Object.entries(entity.metadata)
              .filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
          ),
        },
      });
      loaded++;
    } else {
      errors++;
    }
  }

  console.log(`[VectorStore] Initialized: ${loaded} records loaded, ${errors} errors`);
  return { loaded, errors };
}

/**
 * Get context for RAG (Retrieval Augmented Generation).
 * Retrieves the most relevant entities for a given query to provide
 * context to the LLM.
 */
export async function getRAGContext(
  query: string,
  topK: number = 5
): Promise<{ context: string; sources: SearchResult[] }> {
  const searchResponse = await search({
    query,
    mode: 'hybrid',
    filters: { limit: topK },
  });

  const contextParts: string[] = [];
  for (const result of searchResponse.results) {
    const e = result.entity;
    contextParts.push(
      `[${e.type.toUpperCase()}: ${e.name}] (relevance: ${(result.score * 100).toFixed(0)}%)\n${e.description.substring(0, 500)}`
    );
  }

  return {
    context: contextParts.join('\n\n---\n\n'),
    sources: searchResponse.results,
  };
}

export { buildSearchableEntities, keywordSearch };
