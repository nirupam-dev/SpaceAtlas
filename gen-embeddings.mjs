// SpaceAtlas — Production Embedding Generation Script
// Run with: node gen-embeddings.mjs
// Generates vector embeddings for all encyclopedia data using text-embedding-004

import { GoogleGenerativeAI } from '@google/generative-ai';
import { rockets, agencies, planets, missions, astronauts, spaceNews } from './src/lib/data.ts';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// ─── Configuration ────────────────────────────────────────────
const MODEL_NAME = 'text-embedding-004';
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 250;
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'lib', 'embeddings.json');

// ─── Setup ────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function entityToText(entity, type) {
  const parts = [];
  parts.push(`Name: ${entity.name || entity.title}`);
  parts.push(`Type: ${type}`);
  if (entity.description) parts.push(`Description: ${entity.description}`);
  if (entity.biography) parts.push(`Biography: ${entity.biography}`);
  if (entity.summary) parts.push(`Summary: ${entity.summary}`);
  if (entity.country) parts.push(`Country: ${entity.country}`);
  if (entity.manufacturer) parts.push(`Manufacturer: ${entity.manufacturer}`);
  if (entity.agency) parts.push(`Agency: ${entity.agency}`);
  if (entity.nationality) parts.push(`Nationality: ${entity.nationality}`);
  if (entity.destination) parts.push(`Destination: ${entity.destination}`);
  if (entity.abbreviation) parts.push(`Also known as: ${entity.abbreviation}`);
  if (entity.status) parts.push(`Status: ${entity.status}`);
  return parts.join('\n');
}

// ─── Main Pipeline ────────────────────────────────────────────
async function run() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  SpaceAtlas — Embedding Generation Pipeline     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // Prepare all entities
  const allData = [
    ...rockets.map(item => ({ ...item, _type: 'rocket' })),
    ...agencies.map(item => ({ ...item, _type: 'agency' })),
    ...planets.map(item => ({ ...item, _type: 'planet' })),
    ...missions.map(item => ({ ...item, _type: 'mission' })),
    ...astronauts.map(item => ({ ...item, _type: 'astronaut' })),
    ...spaceNews.map(item => ({ ...item, _type: 'news' }))
  ];

  console.log(`📊 Total entities to embed: ${allData.length}`);
  console.log(`🔧 Model: ${MODEL_NAME}`);
  console.log(`📦 Batch size: ${BATCH_SIZE}`);
  console.log(`📂 Output: ${OUTPUT_PATH}\n`);

  const embeddingsMap = {};
  const stats = { success: 0, failed: 0, startTime: Date.now() };
  const typeStats = {};

  // Process in batches
  for (let i = 0; i < allData.length; i += BATCH_SIZE) {
    const batch = allData.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (item) => {
        const text = entityToText(item, item._type);
        // Truncate to stay within model limits
        const truncated = text.length > 8000 ? text.substring(0, 8000) : text;
        const result = await model.embedContent(truncated);
        return { id: item.id, vector: result.embedding.values, type: item._type };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        embeddingsMap[result.value.id] = result.value.vector;
        stats.success++;
        typeStats[result.value.type] = (typeStats[result.value.type] || 0) + 1;
      } else {
        stats.failed++;
        console.error(`  ❌ Failed:`, result.reason?.message || 'Unknown error');
      }
    }

    const progress = Math.min(i + BATCH_SIZE, allData.length);
    const pct = ((progress / allData.length) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
    process.stdout.write(`\r  [${bar}] ${pct}% (${progress}/${allData.length})`);

    // Rate limit
    if (i + BATCH_SIZE < allData.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log('\n');

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(embeddingsMap, null, 2));

  // Report
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const firstVector = Object.values(embeddingsMap)[0];
  const dimension = firstVector ? firstVector.length : 0;

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Generation Complete                            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  ✅ Embeddings generated: ${String(stats.success).padEnd(23)}║`);
  console.log(`║  ❌ Failed: ${String(stats.failed).padEnd(37)}║`);
  console.log(`║  📐 Embedding dimension: ${String(dimension).padEnd(24)}║`);
  console.log(`║  ⏱  Elapsed: ${String(elapsed + 's').padEnd(35)}║`);
  console.log('╠══════════════════════════════════════════════════╣');
  for (const [type, count] of Object.entries(typeStats)) {
    console.log(`║  ${type.padEnd(15)} ${String(count).padEnd(33)}║`);
  }
  console.log('╚══════════════════════════════════════════════════╝');
}

run().catch(console.error);
