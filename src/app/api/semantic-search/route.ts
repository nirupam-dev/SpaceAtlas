// SpaceAtlas — Semantic Search API Route
// Provides hybrid search endpoint with vector + keyword search
// Auto-initializes local TF-IDF embeddings when Gemini embeddings are unavailable
// Supports filtering by entity type and search mode

import { NextResponse } from 'next/server';
import { search, initializeVectorStore, getVectorStore } from '@/lib/search';
import { ensureLocalEmbeddings } from '@/lib/search/local-embeddings';
import type { SearchQuery } from '@/lib/types';

// ─── Initialization ──────────────────────────────────────────

let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  
  const store = getVectorStore();
  if (store.isReady) {
    initialized = true;
    return;
  }

  try {
    // 1. Try pre-computed Gemini embeddings first
    const { default: embeddings } = await import('@/lib/embeddings.json').catch(() => ({ default: {} }));
    
    if (Object.keys(embeddings).length > 0) {
      await initializeVectorStore(embeddings as Record<string, number[]>);
      console.log('[SemanticSearch API] Vector store initialized from Gemini embeddings');
      initialized = true;
      return;
    }
  } catch {
    // Gemini embeddings unavailable — continue to local fallback
  }

  // 2. Auto-generate local TF-IDF embeddings (zero external dependencies)
  try {
    const success = await ensureLocalEmbeddings();
    if (success) {
      console.log('[SemanticSearch API] Vector store initialized with local TF-IDF embeddings');
    } else {
      console.warn('[SemanticSearch API] Local embedding generation failed — keyword search only');
    }
  } catch (error) {
    console.warn('[SemanticSearch API] Initialization error:', error);
  }

  initialized = true;
}

// ─── API Handler ─────────────────────────────────────────────

export async function GET(req: Request) {
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const mode = searchParams.get('mode') as 'semantic' | 'keyword' | 'hybrid' | null;
    const types = searchParams.get('types')?.split(',').filter(Boolean) as string[] | undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Initialize vector store if needed
    await ensureInitialized();

    const query: SearchQuery = {
      query: q.trim(),
      mode: mode || 'hybrid',
      filters: {
        types: types as any,
        limit: Math.min(limit, 50),
      },
    };

    const response = await search(query);

    const totalLatency = Math.round(performance.now() - startTime);

    return NextResponse.json({
      ...response,
      latencyMs: totalLatency,
      vectorStoreStats: getVectorStore().stats(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('[SemanticSearch API] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
