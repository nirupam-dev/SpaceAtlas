// SpaceAtlas — TF-IDF Local Embedding Engine
// Generates deterministic vector embeddings without external API calls
// Uses BM25-enhanced TF-IDF with subword tokenization for semantic understanding

import type { EntityType } from '../types';

// ─── Configuration ────────────────────────────────────────────

const VECTOR_DIMENSION = 384; // Compact but effective dimension
const BM25_K1 = 1.5;
const BM25_B = 0.75;

// ─── Tokenization ─────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we',
  'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them',
  'what', 'which', 'who', 'whom', 'also', 'an',
]);

/**
 * Tokenize text into meaningful terms with subword decomposition.
 * Handles space-domain compound words and abbreviations.
 */
export function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawTokens = normalized.split(/\s+/);
  const tokens: string[] = [];

  for (const token of rawTokens) {
    if (token.length < 2 || STOP_WORDS.has(token)) continue;

    // Keep the original token
    tokens.push(token);

    // Generate character n-grams (3-grams) for fuzzy matching
    if (token.length >= 4) {
      for (let i = 0; i <= token.length - 3; i++) {
        tokens.push(`_${token.slice(i, i + 3)}_`);
      }
    }

    // Split hyphenated words
    if (token.includes('-')) {
      for (const part of token.split('-')) {
        if (part.length >= 2 && !STOP_WORDS.has(part)) {
          tokens.push(part);
        }
      }
    }
  }

  return tokens;
}

// ─── TF-IDF Corpus ────────────────────────────────────────────

interface CorpusDocument {
  id: string;
  type: EntityType;
  tokens: string[];
  termFreqs: Map<string, number>;
  length: number;
}

/**
 * TF-IDF Vectorizer that builds a vocabulary from a corpus
 * and generates fixed-dimension vectors using feature hashing.
 */
export class TFIDFVectorizer {
  private documents: CorpusDocument[] = [];
  private documentFreqs: Map<string, number> = new Map();
  private avgDocLength: number = 0;
  private vocabulary: Map<string, number> = new Map();
  private idfCache: Map<string, number> = new Map();
  private _isBuilt = false;

  /**
   * Add a document to the corpus.
   */
  addDocument(id: string, text: string, type: EntityType): void {
    const tokens = tokenize(text);
    const termFreqs = new Map<string, number>();

    for (const token of tokens) {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    }

    this.documents.push({ id, type, tokens, termFreqs, length: tokens.length });
  }

  /**
   * Build the IDF index and vocabulary after all documents are added.
   */
  build(): void {
    // Calculate document frequencies
    this.documentFreqs.clear();
    for (const doc of this.documents) {
      const uniqueTerms = new Set(doc.tokens);
      for (const term of uniqueTerms) {
        this.documentFreqs.set(term, (this.documentFreqs.get(term) || 0) + 1);
      }
    }

    // Calculate average document length
    const totalLength = this.documents.reduce((sum, doc) => sum + doc.length, 0);
    this.avgDocLength = totalLength / Math.max(this.documents.length, 1);

    // Build vocabulary: select top terms by document frequency
    const sortedTerms = [...this.documentFreqs.entries()]
      .filter(([, df]) => df >= 1) // Keep terms that appear in at least 1 doc
      .sort((a, b) => b[1] - a[1]);

    this.vocabulary.clear();
    for (let i = 0; i < sortedTerms.length; i++) {
      this.vocabulary.set(sortedTerms[i][0], i);
    }

    // Pre-compute IDF values
    this.idfCache.clear();
    const N = this.documents.length;
    for (const [term, df] of this.documentFreqs) {
      // BM25 IDF formula
      this.idfCache.set(term, Math.log((N - df + 0.5) / (df + 0.5) + 1));
    }

    this._isBuilt = true;
  }

  /**
   * Generate a fixed-dimension vector for a given text using feature hashing.
   * Uses the Fowler–Noll–Vo hash for deterministic mapping.
   */
  vectorize(text: string): number[] {
    if (!this._isBuilt) {
      throw new Error('Vectorizer not built. Call build() first.');
    }

    const tokens = tokenize(text);
    const termFreqs = new Map<string, number>();
    for (const token of tokens) {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    }

    const vector = new Float64Array(VECTOR_DIMENSION);
    const docLen = tokens.length;

    for (const [term, tf] of termFreqs) {
      const idf = this.idfCache.get(term) || 0;
      if (idf === 0) continue;

      // BM25 term frequency normalization
      const tfNorm = (tf * (BM25_K1 + 1)) /
        (tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLen / this.avgDocLength)));

      const score = tfNorm * idf;

      // Feature hashing: map term to vector dimensions
      const hash1 = fnvHash(term);
      const hash2 = fnvHash(term + '_2');
      const idx1 = Math.abs(hash1) % VECTOR_DIMENSION;
      const idx2 = Math.abs(hash2) % VECTOR_DIMENSION;

      // Use two hash functions for better distribution
      const sign1 = (hash1 & 1) === 0 ? 1 : -1;
      const sign2 = (hash2 & 1) === 0 ? 1 : -1;
      vector[idx1] += sign1 * score;
      vector[idx2] += sign2 * score * 0.5;
    }

    // L2 normalize
    let norm = 0;
    for (let i = 0; i < VECTOR_DIMENSION; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < VECTOR_DIMENSION; i++) {
        vector[i] /= norm;
      }
    }

    return Array.from(vector);
  }

  /**
   * Generate embeddings for all documents in the corpus.
   * Returns a map of document ID to vector.
   */
  generateAllEmbeddings(): Record<string, number[]> {
    if (!this._isBuilt) {
      this.build();
    }

    const embeddings: Record<string, number[]> = {};
    for (const doc of this.documents) {
      const text = doc.tokens.join(' ');
      embeddings[doc.id] = this.vectorize(text);
    }
    return embeddings;
  }

  get isBuilt(): boolean {
    return this._isBuilt;
  }

  get documentCount(): number {
    return this.documents.length;
  }

  get vocabularySize(): number {
    return this.vocabulary.size;
  }

  get dimension(): number {
    return VECTOR_DIMENSION;
  }
}

// ─── Hash Function ────────────────────────────────────────────

/**
 * FNV-1a hash function for deterministic feature hashing.
 * Fast, well-distributed, and suitable for hash-based vectorization.
 */
function fnvHash(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) | 0; // FNV prime, force 32-bit
  }
  return hash;
}

// ─── Singleton ────────────────────────────────────────────────

let _vectorizerInstance: TFIDFVectorizer | null = null;

export function getTFIDFVectorizer(): TFIDFVectorizer {
  if (!_vectorizerInstance) {
    _vectorizerInstance = new TFIDFVectorizer();
  }
  return _vectorizerInstance;
}

export { VECTOR_DIMENSION };
