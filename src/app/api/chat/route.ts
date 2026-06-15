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

// ─── NASA Image Fetch with Caching ────────────────────────────

async function fetchNasaImages(query: string): Promise<NasaImage[]> {
  try {
    const keyword = query
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter((w) => !["what", "is", "are", "the", "a", "an", "tell", "me", "about", "how", "why", "when", "did", "does"].includes(w))
      .slice(0, 2)
      .join(" ")
      .trim() || query.split(" ").slice(0, 2).join(" ");

    // Check cache
    const cacheKey = `nasa-img:${keyword}`;
    const cached = apiCache.get<NasaImage[]>(cacheKey);
    if (cached) return cached;

    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(keyword)}&media_type=image&page_size=6`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    const items: any[] = data?.collection?.items ?? [];

    const images: NasaImage[] = [];
    for (const item of items) {
      if (images.length >= 3) break;
      const links: any[] = item.links ?? [];
      const imgLink = links.find((l: any) => l.rel === "preview");
      const meta = item.data?.[0];
      if (imgLink?.href && meta?.title) {
        images.push({
          url: imgLink.href,
          title: meta.title,
          description: (meta.description ?? "").slice(0, 120),
        });
      }
    }

    // Cache results
    apiCache.set(cacheKey, images, CACHE_TTL.NASA_IMAGES);
    return images;
  } catch {
    return [];
  }
}

// ─── Main Chat Endpoint ───────────────────────────────────────

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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    // Format history for Gemini API
    const formattedHistory = history
      ? history.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      : [];

    const chat = model.startChat({ history: formattedHistory });

    // Run Gemini and NASA image fetch in parallel
    const [result, images] = await Promise.all([
      chat.sendMessage(message),
      fetchNasaImages(message),
    ]);

    const response = await result.response;
    const text = response.text();

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
  } catch (error: any) {
    console.error("Error with Gemini API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response." },
      { status: 500 }
    );
  }
}
