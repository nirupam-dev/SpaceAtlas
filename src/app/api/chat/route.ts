// SpaceAtlas — Chat API Route with RAG (Retrieval Augmented Generation)
// Enhances Gemini responses with context from the encyclopedia via semantic search

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getRAGContext, initializeVectorStore, getVectorStore } from '@/lib/search';
import { ensureLocalEmbeddings } from '@/lib/search/local-embeddings';
import { apiCache, CACHE_TTL } from '@/lib/cache';
import type { NasaImage, SearchResult } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ─── Vector Store Initialization ──────────────────────────────
let storeInitialized = false;

async function ensureVectorStore() {
  if (storeInitialized) return;
  const store = getVectorStore();
  if (store.isReady) { storeInitialized = true; return; }

  // 1. Try pre-computed Gemini embeddings
  try {
    const { default: embeddings } = await import('@/lib/embeddings.json').catch(() => ({ default: {} }));
    if (Object.keys(embeddings).length > 0) {
      await initializeVectorStore(embeddings as Record<string, number[]>);
      storeInitialized = true;
      return;
    }
  } catch { /* continue to fallback */ }

  // 2. Auto-generate local TF-IDF embeddings
  try {
    await ensureLocalEmbeddings();
  } catch { /* RAG will work without embeddings, just lower quality */ }

  storeInitialized = true;
}

// ─── NASA Image Fetch with Smart Keyword Extraction ───────────

// Known space entities for precise matching
const SPACE_ENTITIES = new Set([
  'falcon 9', 'falcon heavy', 'starship', 'saturn v', 'sls', 'space launch system',
  'pslv', 'gslv', 'ariane', 'ariane 5', 'ariane 6', 'long march', 'electron',
  'soyuz', 'atlas v', 'delta iv', 'delta iv heavy', 'vulcan', 'vulcan centaur',
  'h3', 'new glenn', 'new shepard', 'vega', 'proton', 'angara',
  'apollo', 'apollo 11', 'apollo 13', 'gemini', 'mercury', 'artemis',
  'voyager', 'voyager 1', 'voyager 2', 'cassini', 'hubble', 'james webb',
  'perseverance', 'curiosity', 'opportunity', 'spirit', 'insight', 'mars rover',
  'chandrayaan', 'mangalyaan', 'new horizons', 'juno', 'pioneer',
  'iss', 'international space station', 'skylab', 'mir', 'tiangong',
  'spacex', 'nasa', 'isro', 'esa', 'jaxa', 'roscosmos', 'cnsa',
  'neil armstrong', 'buzz aldrin', 'yuri gagarin', 'john glenn', 'sally ride',
  'chris hadfield', 'sunita williams', 'kalpana chawla', 'rakesh sharma',
  'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
  'moon', 'europa', 'titan', 'io', 'ganymede', 'enceladus', 'callisto', 'triton',
  'black hole', 'neutron star', 'supernova', 'nebula', 'pulsar', 'quasar',
  'milky way', 'andromeda', 'orion nebula', 'crab nebula', 'pillars of creation',
]);

// Abstract/conceptual terms that shouldn't trigger image search
const ABSTRACT_PATTERNS = /\b(how (far|long|many|much|fast|old)|what (is|are) the (distance|speed|mass|weight|size|temperature|difference|cost)|compare|comparison|vs\.?|versus|calculate|explain|define|history of|timeline|when (did|was|will))\b/i;

function extractImageKeyword(query: string): string | null {
  const q = query.toLowerCase().trim();

  // Skip images for abstract/conceptual questions
  if (ABSTRACT_PATTERNS.test(q)) return null;

  // Try to match known space entities (longest match first)
  const sortedEntities = [...SPACE_ENTITIES].sort((a, b) => b.length - a.length);
  for (const entity of sortedEntities) {
    if (q.includes(entity)) return entity;
  }

  // Fallback: extract meaningful nouns (skip stop words)
  const stopWords = new Set([
    'what', 'is', 'are', 'the', 'a', 'an', 'tell', 'me', 'about', 'how', 'why',
    'when', 'did', 'does', 'can', 'you', 'please', 'show', 'i', 'want', 'to',
    'know', 'see', 'of', 'in', 'on', 'for', 'and', 'or', 'it', 'its', 'this',
    'that', 'do', 'has', 'have', 'was', 'were', 'be', 'been', 'being', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'with', 'from', 'by',
    'at', 'up', 'out', 'so', 'if', 'my', 'your', 'we', 'they', 'them', 'us',
  ]);
  const words = q.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  if (words.length === 0) return null;
  // Take up to 3 meaningful words
  return words.slice(0, 3).join(' ');
}

async function fetchNasaImages(query: string): Promise<NasaImage[]> {
  try {
    const keyword = extractImageKeyword(query);
    if (!keyword) return []; // No relevant visual subject

    // Check cache
    const cacheKey = `nasa-img:${keyword}`;
    const cached = apiCache.get<NasaImage[]>(cacheKey);
    if (cached) return cached;

    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(keyword)}&media_type=image&page_size=10`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    const items: { data?: { title?: string; description?: string; nasa_id?: string }[]; links?: { rel: string; href: string }[] }[] = data?.collection?.items ?? [];

    // Extract key topic words for relevance filtering
    const topicWords = keyword.split(/\s+/).filter(w => w.length > 2);

    const images: NasaImage[] = [];
    for (const item of items) {
      if (images.length >= 3) break;
      const links: { rel: string; href: string }[] = item.links ?? [];
      const imgLink = links.find((l) => l.rel === "preview");
      const meta = item.data?.[0];
      if (!imgLink?.href || !meta?.title) continue;

      // Relevance check: title or description must contain at least one topic word
      const titleLower = (meta.title || '').toLowerCase();
      const descLower = (meta.description || '').toLowerCase().slice(0, 200);
      const isRelevant = topicWords.some((w: string) => titleLower.includes(w) || descLower.includes(w));
      if (!isRelevant) continue;

      images.push({
        url: imgLink.href,
        title: meta.title,
        description: (meta.description ?? "").slice(0, 120),
      });
    }

    // Cache results
    apiCache.set(cacheKey, images, CACHE_TTL.NASA_IMAGES);
    return images;
  } catch {
    return [];
  }
}

// ─── Main Chat Endpoint ───────────────────────────────────────

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { message, history } = await req.json();

    // Initialize vector store for RAG
    await ensureVectorStore();

    // Retrieve relevant context via semantic search (RAG)
    let ragContext = '';
    let sources: SearchResult[] = [];
    
    try {
      const rag = await getRAGContext(message, 5);
      ragContext = rag.context;
      sources = rag.sources;
    } catch (err) {
      console.warn('[Chat RAG] Context retrieval failed:', err);
    }

    // Build system instruction with RAG context
    const systemInstruction = `You are ATLAS, the SpaceAtlas AI — a brilliant, highly advanced AI assistant specialized entirely in astronomy, space exploration, astrophysics, rockets, and astronauts.

Your tone should be cinematic, slightly sci-fi, highly intelligent, and extremely helpful. If a user asks a question completely unrelated to space, gently guide them back to the cosmos.

Format your responses with clear markdown. Use headers, bullet points, and bold text for key facts.

${ragContext ? `## Reference Data from SpaceAtlas Encyclopedia
Use the following verified data to ground your response. Cite specific facts from this data when relevant, but also supplement with your broader knowledge.

${ragContext}

---
IMPORTANT: Prefer facts from the reference data above when they are relevant. If the reference data doesn't cover the user's question, use your general knowledge but indicate when you're going beyond the encyclopedia data.` : ''}`;

    // Format history for Gemini API
    const formattedHistory = history
      ? history.map((msg: { role: string; text: string }) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      : [];

    // Try models with fallback on 503 errors
    let lastError: Error | null = null;
    let text = '';

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });
        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        text = response.text();
        lastError = null;
        break; // Success — stop trying models
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const is503 = lastError?.message?.includes('503');
        if (!is503) throw err; // Non-503 errors should not retry
        console.warn(`[Chat] ${modelName} returned 503, trying next model...`);
      }
    }

    if (lastError) throw lastError;

    // Fetch NASA images in parallel (already completed or do it now)
    const images = await fetchNasaImages(message);

    return NextResponse.json({
      text,
      images,
      sources: sources.slice(0, 3).map((s) => ({
        entity: {
          id: s.entity.id,
          name: s.entity.name,
          type: s.entity.type,
          slug: s.entity.slug,
        },
        score: s.score,
        matchType: s.matchType,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate response.';
    console.error("Error with Gemini API:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

