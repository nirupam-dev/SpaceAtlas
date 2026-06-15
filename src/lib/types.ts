// SpaceAtlas — Comprehensive TypeScript Type Definitions
// Provides type safety across the entire application

// ─── Entity Base ───────────────────────────────────────────────
export interface BaseEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

// ─── Rockets ───────────────────────────────────────────────────
export type RocketStatus = 'ACTIVE' | 'RETIRED' | 'IN_DEVELOPMENT';

export interface Rocket extends BaseEntity {
  manufacturer: string;
  country: string;
  status: RocketStatus;
  height: number;
  diameter: number;
  mass: number;
  payloadToLEO: number;
  payloadToGTO: number;
  stages: number;
  engines: string;
  thrust: number;
  costPerLaunch: number;
  successRate: number;
  totalLaunches: number;
  successfulLaunches: number;
}

// ─── Agencies ──────────────────────────────────────────────────
export interface Agency extends BaseEntity {
  abbreviation: string;
  country: string;
  foundedYear: number;
  headquarters: string;
  administrator?: string;
  budget: number;
  employees: number;
  logoUrl: string;
}

// ─── Planets & Celestial Bodies ────────────────────────────────
export type CelestialBodyType = 'TERRESTRIAL' | 'GAS_GIANT' | 'ICE_GIANT' | 'DWARF' | 'MOON';

export interface Planet extends BaseEntity {
  type: CelestialBodyType;
  orderFromSun: number;
  mass: number;
  diameter: number;
  gravity: number;
  distanceFromSun: number;
  orbitalPeriod: number;
  meanTemperature: number;
  numberOfMoons: number;
  hasRings: boolean;
}

// ─── Missions ──────────────────────────────────────────────────
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'UPCOMING';

export interface Mission extends BaseEntity {
  agency: string;
  destination: string;
  launchDate: string;
  status: MissionStatus;
}

// ─── Astronauts ────────────────────────────────────────────────
export type AstronautStatus = 'ACTIVE' | 'RETIRED' | 'DECEASED';

export interface Astronaut extends BaseEntity {
  nationality: string;
  status: AstronautStatus;
  spaceWalks: number;
  timeInSpace: number;
  biography: string;
}

// ─── News ──────────────────────────────────────────────────────
export interface SpaceNewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  category: string;
}

// ─── Launches ──────────────────────────────────────────────────
export interface UpcomingLaunch {
  id: string;
  name: string;
  rocket: string;
  agency: string;
  date: string;
  location: string;
  status: string;
}

// ─── Quizzes ───────────────────────────────────────────────────
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questions: QuizQuestion[];
}

// ─── Search & Embeddings ───────────────────────────────────────
export type EntityType = 'rocket' | 'agency' | 'planet' | 'mission' | 'astronaut' | 'news';

export interface SearchableEntity {
  id: string;
  name: string;
  slug: string;
  type: EntityType;
  description: string;
  metadata: Record<string, string | number | boolean>;
}

export interface EmbeddingRecord {
  id: string;
  entityType: EntityType;
  vector: number[];
  textContent: string;
  metadata: {
    name: string;
    slug: string;
    [key: string]: string | number | boolean;
  };
}

export interface SearchResult {
  entity: SearchableEntity;
  score: number;
  matchType: 'semantic' | 'keyword' | 'hybrid';
  highlights?: string[];
}

export interface SearchQuery {
  query: string;
  filters?: {
    types?: EntityType[];
    limit?: number;
  };
  mode?: 'semantic' | 'keyword' | 'hybrid';
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults: number;
  searchMode: string;
  latencyMs: number;
  expandedTerms?: string[];
}

// ─── Chat & RAG ────────────────────────────────────────────────
export interface NasaImage {
  url: string;
  title: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  images?: NasaImage[];
  sources?: SearchResult[];
}

export interface ChatRequest {
  message: string;
  history: { role: string; text: string }[];
}

export interface ChatResponse {
  text: string;
  images: NasaImage[];
  sources: SearchResult[];
}

// ─── API Response Wrappers ─────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// ─── Cache ─────────────────────────────────────────────────────
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
