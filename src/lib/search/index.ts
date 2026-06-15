// SpaceAtlas — Search Module Public API
// Re-exports all search functionality through a clean barrel file

export { search, initializeVectorStore, getRAGContext, keywordSearch } from './semantic-search';
export { generateEmbedding, generateEmbeddingsBatch, prepareEntitiesForEmbedding } from './embedding-engine';
export { getVectorStore, cosineSimilarity, VectorStore } from './vector-store';
export { expandQuery, extractKeywords, entityToEmbeddingText } from './query-expander';
export { ensureLocalEmbeddings, generateLocalEmbeddings, generateLocalQueryEmbedding } from './local-embeddings';
export { TFIDFVectorizer, getTFIDFVectorizer, tokenize } from './tfidf-engine';
