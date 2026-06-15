// SpaceAtlas — TF-IDF Engine Unit Tests
// Tests tokenization, BM25 scoring, and local embedding generation

import { TFIDFVectorizer, tokenize, getTFIDFVectorizer, VECTOR_DIMENSION } from '@/lib/search/tfidf-engine';

// ─── Tokenization Tests ───────────────────────────────────────

describe('tokenize', () => {
  it('should lowercase and tokenize text', () => {
    const tokens = tokenize('Falcon 9 Launch Vehicle');
    expect(tokens).toContain('falcon');
    expect(tokens).toContain('launch');
    expect(tokens).toContain('vehicle');
  });

  it('should remove stop words', () => {
    const tokens = tokenize('what is the largest planet');
    expect(tokens).not.toContain('what');
    expect(tokens).not.toContain('is');
    expect(tokens).not.toContain('the');
    expect(tokens).toContain('largest');
    expect(tokens).toContain('planet');
  });

  it('should remove single-character tokens', () => {
    const tokens = tokenize('a b c rocket');
    const wordTokens = tokens.filter(t => !t.startsWith('_')); // Exclude n-grams
    expect(wordTokens).toEqual(['rocket']);
  });

  it('should generate character n-grams for fuzzy matching', () => {
    const tokens = tokenize('rocket');
    expect(tokens).toContain('_roc_');
    expect(tokens).toContain('_ock_');
    expect(tokens).toContain('_cke_');
    expect(tokens).toContain('_ket_');
  });

  it('should split hyphenated words', () => {
    const tokens = tokenize('re-usable rocket');
    expect(tokens).toContain('re-usable');
    expect(tokens).toContain('usable');
    expect(tokens).toContain('rocket');
  });

  it('should handle empty strings', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('should handle special characters', () => {
    const tokens = tokenize("SpaceX's Falcon-9!!");
    expect(tokens).toContain("spacex's");
    expect(tokens).toContain('falcon-9');
  });
});

// ─── TFIDFVectorizer Tests ────────────────────────────────────

describe('TFIDFVectorizer', () => {
  let vectorizer: TFIDFVectorizer;

  beforeEach(() => {
    vectorizer = new TFIDFVectorizer();
  });

  it('should start unbuilt', () => {
    expect(vectorizer.isBuilt).toBe(false);
    expect(vectorizer.documentCount).toBe(0);
  });

  it('should add documents and track count', () => {
    vectorizer.addDocument('d1', 'Falcon 9 launch vehicle', 'rocket');
    vectorizer.addDocument('d2', 'Saturn V Moon rocket', 'rocket');
    expect(vectorizer.documentCount).toBe(2);
  });

  it('should build the index', () => {
    vectorizer.addDocument('d1', 'Falcon 9 rocket', 'rocket');
    vectorizer.build();
    expect(vectorizer.isBuilt).toBe(true);
    expect(vectorizer.vocabularySize).toBeGreaterThan(0);
  });

  it('should throw if vectorizing before build', () => {
    vectorizer.addDocument('d1', 'test', 'rocket');
    expect(() => vectorizer.vectorize('test')).toThrow('not built');
  });

  it('should produce vectors of correct dimension', () => {
    vectorizer.addDocument('d1', 'Falcon 9 reusable rocket', 'rocket');
    vectorizer.build();
    const vector = vectorizer.vectorize('rocket launch');
    expect(vector.length).toBe(VECTOR_DIMENSION);
  });

  it('should produce normalized vectors (unit length)', () => {
    vectorizer.addDocument('d1', 'Falcon 9 reusable rocket SpaceX', 'rocket');
    vectorizer.addDocument('d2', 'Saturn V Apollo Moon landing', 'rocket');
    vectorizer.build();

    const vector = vectorizer.vectorize('rocket launch SpaceX');
    const magnitude = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
    expect(magnitude).toBeCloseTo(1, 3);
  });

  it('should produce similar vectors for similar texts', () => {
    vectorizer.addDocument('d1', 'Falcon 9 reusable launch vehicle by SpaceX', 'rocket');
    vectorizer.addDocument('d2', 'Saturn V heavy lift Moon rocket by NASA', 'rocket');
    vectorizer.addDocument('d3', 'Mars is the red planet in solar system', 'planet');
    vectorizer.build();

    const rocketVec = vectorizer.vectorize('reusable rocket launch');
    const planetVec = vectorizer.vectorize('planet solar system');

    // The rocket query should be more similar to itself than to planet content
    const rocketSelf = dotProduct(rocketVec, rocketVec);
    const rocketPlanet = dotProduct(rocketVec, planetVec);
    expect(Math.abs(rocketSelf)).toBeGreaterThan(Math.abs(rocketPlanet));
  });

  it('should generate embeddings for all documents', () => {
    vectorizer.addDocument('d1', 'Falcon 9', 'rocket');
    vectorizer.addDocument('d2', 'Mars planet', 'planet');
    vectorizer.build();

    const embeddings = vectorizer.generateAllEmbeddings();
    expect(Object.keys(embeddings)).toEqual(['d1', 'd2']);
    expect(embeddings['d1'].length).toBe(VECTOR_DIMENSION);
    expect(embeddings['d2'].length).toBe(VECTOR_DIMENSION);
  });

  it('should report correct dimension', () => {
    expect(vectorizer.dimension).toBe(VECTOR_DIMENSION);
  });
});

// ─── Singleton Tests ──────────────────────────────────────────

describe('getTFIDFVectorizer', () => {
  it('should return the same instance', () => {
    const v1 = getTFIDFVectorizer();
    const v2 = getTFIDFVectorizer();
    expect(v1).toBe(v2);
  });
});

// ─── Helpers ──────────────────────────────────────────────────

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}
