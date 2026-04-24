export type Chunk = {
  id: string;
  sourceId: string;
  title: string;
  url?: string;
  section?: string;
  text: string;
  tokens: number;
};

export type IndexedChunk = Chunk & {
  /** 0-based offset into the embeddings buffer (index * dim = byteOffset / 4). */
  vectorOffset: number;
};

export type IndexManifest = {
  model: string;
  dim: number;
  chunkCount: number;
  sources: SourceMeta[];
  builtAt: string;
};

export type SourceMeta = {
  id: string;
  title: string;
  url?: string;
  description?: string;
  license?: string;
};

export type Retrieved = {
  chunk: IndexedChunk;
  score: number;
  /** Which retriever surfaced this: "bm25" | "dense" | "fused" | "rerank" */
  via: string;
};

export type RetrieveOptions = {
  query: string;
  topK?: number;
  useHyDE?: boolean;
  hypotheticalAnswer?: string;
  categoryFilter?: string;
};
