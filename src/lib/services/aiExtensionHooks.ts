/**
 * PHASE 2 EXTENSION HOOKS (Stub Interface)
 * 
 * Note: AI features (LLMs, RAG, Embeddings, Vector DBs, Chatbots) are intentionally NOT
 * active in Phase 1. These typed interfaces and stub hooks establish the exact architectural 
 * extension points for Phase 2 integration without requiring schema rewrites or breaking API contracts.
 */

export interface DocumentAnalysisResult {
  summary: string;
  keyInsights: string[];
  suggestedTags: string[];
  extractedCitations: Array<{
    title: string;
    authors?: string;
    year?: number;
    doi?: string;
  }>;
}

export interface SemanticSearchResult {
  documentId: string;
  chunkText: string;
  similarityScore: number;
}

/**
 * Phase 2 Hook: Trigger async document embedding and summary extraction
 */
export async function hookTriggerDocumentEmbedding(documentId: string): Promise<{ queued: boolean; message: string }> {
  // Reserved for Phase 2 vector pipeline / worker queue
  return {
    queued: false,
    message: 'Phase 1 MVP mode: Document AI indexing will be activated in Phase 2.',
  };
}

/**
 * Phase 2 Hook: Semantic similarity search across embedded literature
 */
export async function hookSemanticLiteratureSearch(
  query: string,
  userId: string,
  topK = 5
): Promise<SemanticSearchResult[]> {
  // Reserved for Phase 2 Vector store similarity query
  return [];
}

/**
 * Phase 2 Hook: RAG Context Retrieval for research assistant
 */
export async function hookRetrieveRAGContext(
  userPrompt: string,
  projectId: string
): Promise<{ contextChunks: string[]; confidence: number }> {
  // Reserved for Phase 2 RAG pipeline
  return { contextChunks: [], confidence: 0 };
}
