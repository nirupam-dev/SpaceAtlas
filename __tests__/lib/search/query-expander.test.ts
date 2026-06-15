// SpaceAtlas — Query Expander Unit Tests
import { expandQuery, extractKeywords, entityToEmbeddingText } from '@/lib/search/query-expander';

describe('extractKeywords', () => {
  it('should extract meaningful keywords', () => {
    const keywords = extractKeywords('What is the largest rocket');
    expect(keywords).toContain('largest');
    expect(keywords).toContain('rocket');
    expect(keywords).not.toContain('what');
  });

  it('should handle empty strings', () => {
    expect(extractKeywords('')).toEqual([]);
  });

  it('should lowercase everything', () => {
    const keywords = extractKeywords('NASA ISRO');
    expect(keywords).toContain('nasa');
    expect(keywords).toContain('isro');
  });
});

describe('expandQuery', () => {
  it('should preserve the original query', () => {
    expect(expandQuery('Falcon 9').original).toBe('Falcon 9');
  });

  it('should expand known synonyms', () => {
    const result = expandQuery('rocket launch');
    expect(result.synonyms.length).toBeGreaterThan(0);
  });

  it('should detect planet intent', () => {
    expect(expandQuery('tell me about Mars').suggestedTypes).toContain('planet');
  });

  it('should detect rocket intent', () => {
    expect(expandQuery('which rocket is biggest').suggestedTypes).toContain('rocket');
  });

  it('should produce expanded query string', () => {
    const r = expandQuery('rocket');
    expect(r.expanded.length).toBeGreaterThanOrEqual(r.original.length);
  });
});

describe('entityToEmbeddingText', () => {
  it('should include name and type', () => {
    const text = entityToEmbeddingText({ name: 'Falcon 9' }, 'rocket');
    expect(text).toContain('Name: Falcon 9');
    expect(text).toContain('Type: rocket');
  });

  it('should include description when present', () => {
    const text = entityToEmbeddingText({ name: 'Mars', description: 'Red Planet' }, 'planet');
    expect(text).toContain('Description: Red Planet');
  });
});
