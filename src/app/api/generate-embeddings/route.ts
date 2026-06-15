// SpaceAtlas — Production-Grade Embedding Generation Pipeline
// Generates and stores vector embeddings for all encyclopedia entities
// Supports incremental updates and batch processing with progress tracking

import { NextResponse } from 'next/server';
import { generateEmbeddingsBatch, prepareEntitiesForEmbedding } from '@/lib/search';
import { rockets, agencies, planets, missions, astronauts, spaceNews } from '@/lib/data';
import { initializeVectorStore } from '@/lib/search';
import fs from 'fs';
import path from 'path';

export async function GET() {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
  }

  const startTime = performance.now();

  try {
    // Prepare all entities for embedding
    const items = prepareEntitiesForEmbedding({
      rockets: rockets as unknown as Record<string, unknown>[],
      agencies: agencies as unknown as Record<string, unknown>[],
      planets: planets as unknown as Record<string, unknown>[],
      missions: missions as unknown as Record<string, unknown>[],
      astronauts: astronauts as unknown as Record<string, unknown>[],
      spaceNews: spaceNews as unknown as Record<string, unknown>[],
    });

    console.log(`[Embedding Pipeline] Processing ${items.length} entities...`);

    // Generate embeddings in batches
    const records = await generateEmbeddingsBatch(
      items,
      (completed, total) => {
        console.log(`[Embedding Pipeline] Progress: ${completed}/${total} (${((completed / total) * 100).toFixed(0)}%)`);
      }
    );

    // Build the embeddings map
    const embeddingsMap: Record<string, number[]> = {};
    for (const record of records) {
      embeddingsMap[record.id] = record.vector;
    }

    // Write to embeddings.json
    const outputPath = path.join(process.cwd(), 'src', 'lib', 'embeddings.json');
    fs.writeFileSync(outputPath, JSON.stringify(embeddingsMap, null, 2));

    // Initialize the vector store with the new embeddings
    const storeResult = await initializeVectorStore(embeddingsMap);

    const elapsedMs = Math.round(performance.now() - startTime);

    // Compute statistics by type
    const statsByType: Record<string, number> = {};
    for (const record of records) {
      statsByType[record.entityType] = (statsByType[record.entityType] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalEntities: items.length,
        embeddingsGenerated: records.length,
        embeddingsFailed: items.length - records.length,
        vectorStoreLoaded: storeResult.loaded,
        embeddingDimension: records[0]?.vector.length || 0,
        byType: statsByType,
        elapsedMs,
        outputFile: 'src/lib/embeddings.json',
      },
    });
  } catch (error: any) {
    console.error('[Embedding Pipeline] Error:', error);
    return NextResponse.json(
      { error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: 500 }
    );
  }
}
