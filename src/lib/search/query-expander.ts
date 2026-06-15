// SpaceAtlas — Query Expansion Engine
// Expands user queries with synonyms, domain-specific terms, and related concepts
// Improves recall for both keyword and semantic search

import type { EntityType } from '../types';

/**
 * Domain-specific synonym map for space & astronomy terms.
 * Maps common query terms to their expanded variants.
 */
const SYNONYM_MAP: Record<string, string[]> = {
  // Vehicles
  'rocket': ['launch vehicle', 'booster', 'spacecraft', 'rocket'],
  'shuttle': ['space shuttle', 'orbiter', 'reusable spacecraft'],
  'capsule': ['spacecraft', 'crew vehicle', 'crew capsule'],
  'lander': ['lunar lander', 'mars lander', 'descent vehicle'],
  'rover': ['mars rover', 'lunar rover', 'robotic explorer'],

  // Celestial bodies
  'planet': ['planet', 'world', 'celestial body'],
  'moon': ['satellite', 'natural satellite', 'moon'],
  'star': ['star', 'sun', 'stellar object'],
  'asteroid': ['minor planet', 'near-earth object', 'asteroid'],
  'comet': ['comet', 'icy body', 'small solar system body'],
  'dwarf planet': ['dwarf planet', 'plutoid', 'trans-neptunian object'],

  // Missions & Operations
  'launch': ['launch', 'liftoff', 'flight', 'mission'],
  'landing': ['landing', 'touchdown', 'descent', 'splashdown'],
  'orbit': ['orbit', 'orbital', 'trajectory'],
  'spacewalk': ['spacewalk', 'EVA', 'extravehicular activity'],
  'docking': ['docking', 'rendezvous', 'berthing'],
  'reentry': ['reentry', 're-entry', 'atmospheric entry'],

  // Organizations
  'nasa': ['NASA', 'National Aeronautics and Space Administration'],
  'spacex': ['SpaceX', 'Space Exploration Technologies'],
  'isro': ['ISRO', 'Indian Space Research Organisation'],
  'esa': ['ESA', 'European Space Agency'],
  'jaxa': ['JAXA', 'Japan Aerospace Exploration Agency'],
  'roscosmos': ['Roscosmos', 'Russian space agency'],
  'cnsa': ['CNSA', 'China National Space Administration'],

  // Concepts
  'gravity': ['gravity', 'gravitational', 'g-force'],
  'atmosphere': ['atmosphere', 'atmospheric', 'air', 'exosphere'],
  'habitable': ['habitable', 'life-supporting', 'earth-like', 'goldilocks'],
  'reusable': ['reusable', 'reusability', 'recoverable', 'reflown'],
  'payload': ['payload', 'cargo', 'satellite delivery'],
  'propulsion': ['propulsion', 'engine', 'thruster', 'motor'],
  'telescope': ['telescope', 'observatory', 'space telescope'],

  // People
  'astronaut': ['astronaut', 'cosmonaut', 'taikonaut', 'space traveler'],
  'commander': ['commander', 'mission commander', 'crew commander'],
  'pilot': ['pilot', 'command module pilot', 'lunar module pilot'],
};

/**
 * Intent patterns that help classify the user's query intent.
 */
const INTENT_PATTERNS: { pattern: RegExp; types: EntityType[]; boost: string[] }[] = [
  {
    pattern: /(?:which|what)\s+(?:rocket|launch vehicle)/i,
    types: ['rocket'],
    boost: ['launch vehicle', 'rocket', 'booster'],
  },
  {
    pattern: /(?:tell me about|who is|who was)\s+/i,
    types: ['astronaut', 'agency'],
    boost: ['astronaut', 'space agency'],
  },
  {
    pattern: /(?:how|when)\s+(?:was|did|is)\s+.*(?:launch|mission)/i,
    types: ['mission', 'rocket'],
    boost: ['mission', 'launch', 'spaceflight'],
  },
  {
    pattern: /(?:compare|vs|versus|difference)/i,
    types: ['rocket', 'planet'],
    boost: ['comparison', 'specifications'],
  },
  {
    pattern: /(?:mars|jupiter|saturn|venus|mercury|uranus|neptune|pluto|earth)/i,
    types: ['planet', 'mission'],
    boost: ['planet', 'solar system'],
  },
  {
    pattern: /(?:moon|lunar|artemis|apollo)/i,
    types: ['mission', 'planet'],
    boost: ['lunar', 'moon mission', 'Apollo program'],
  },
  {
    pattern: /(?:ISS|space station|international)/i,
    types: ['mission', 'astronaut'],
    boost: ['International Space Station', 'orbital station'],
  },
  {
    pattern: /(?:India|Indian|ISRO|Chandrayaan|Gaganyaan)/i,
    types: ['agency', 'mission', 'rocket'],
    boost: ['ISRO', 'Indian space program'],
  },
  {
    pattern: /(?:telescope|JWST|hubble|webb)/i,
    types: ['mission'],
    boost: ['space telescope', 'observatory'],
  },
];

/**
 * Common stopwords to filter from keyword matching.
 */
const STOP_WORDS = new Set([
  'what', 'is', 'are', 'the', 'a', 'an', 'tell', 'me', 'about',
  'how', 'why', 'when', 'did', 'does', 'do', 'can', 'could',
  'which', 'where', 'who', 'was', 'were', 'has', 'have', 'had',
  'will', 'would', 'should', 'be', 'been', 'being', 'this', 'that',
  'these', 'those', 'it', 'its', 'i', 'my', 'your', 'of', 'in',
  'on', 'at', 'to', 'for', 'with', 'from', 'by', 'and', 'or',
  'not', 'no', 'but', 'if', 'so', 'than', 'too', 'very',
  'just', 'there', 'here', 'some', 'any', 'all', 'each', 'every',
  'most', 'many', 'much', 'more', 'other',
]);

export interface ExpandedQuery {
  original: string;
  expanded: string;
  keywords: string[];
  synonyms: string[];
  suggestedTypes: EntityType[];
  intent: string;
}

/**
 * Expand a user query with synonyms, domain knowledge, and intent detection.
 */
export function expandQuery(query: string): ExpandedQuery {
  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/).filter((w) => w.length > 1);

  // Extract meaningful keywords (remove stopwords)
  const keywords = words.filter((w) => !STOP_WORDS.has(w));

  // Find synonyms
  const synonyms: string[] = [];
  for (const keyword of keywords) {
    const synonymList = SYNONYM_MAP[keyword];
    if (synonymList) {
      synonyms.push(...synonymList.filter((s) => s.toLowerCase() !== keyword));
    }
  }

  // Detect intent and suggested entity types
  let suggestedTypes: EntityType[] = [];
  let intent = 'general';
  const boostTerms: string[] = [];

  for (const { pattern, types, boost } of INTENT_PATTERNS) {
    if (pattern.test(lowerQuery)) {
      suggestedTypes = [...new Set([...suggestedTypes, ...types])];
      boostTerms.push(...boost);
      intent = 'specific';
    }
  }

  // Build expanded query string
  const expandedParts = [
    query,
    ...synonyms.slice(0, 5),  // Limit synonym expansion
    ...boostTerms.slice(0, 3), // Limit boost terms
  ];
  const expanded = [...new Set(expandedParts)].join(' ');

  return {
    original: query,
    expanded,
    keywords,
    synonyms: [...new Set(synonyms)],
    suggestedTypes,
    intent,
  };
}

/**
 * Extract clean keywords for keyword-based search fallback.
 */
export function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Generate a text representation of an entity for embedding.
 * Creates a rich, searchable text that captures the entity's key attributes.
 */
export function entityToEmbeddingText(entity: Record<string, unknown>, type: EntityType): string {
  const parts: string[] = [];

  const name = (entity.name || entity.title) as string;
  parts.push(`Name: ${name}`);
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
