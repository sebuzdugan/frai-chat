"use client";

import type { IndexedChunk, IndexManifest } from "./types";

let cache:
  | { chunks: IndexedChunk[]; embeddings: Float32Array; manifest: IndexManifest }
  | null = null;

function withBase(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${path}`;
}

export async function loadCorpus(): Promise<{
  chunks: IndexedChunk[];
  embeddings: Float32Array;
  manifest: IndexManifest;
}> {
  if (cache) return cache;

  const [manifestRes, chunksRes, embeddingsRes] = await Promise.all([
    fetch(withBase("/index/manifest.json")),
    fetch(withBase("/index/chunks.json")),
    fetch(withBase("/index/embeddings.bin")),
  ]);

  if (!manifestRes.ok || !chunksRes.ok || !embeddingsRes.ok) {
    throw new Error(
      "Corpus index not found. Run `npm run ingest` to build it, or wait for CI.",
    );
  }

  const manifest = (await manifestRes.json()) as IndexManifest;
  const chunks = (await chunksRes.json()) as IndexedChunk[];
  const buffer = await embeddingsRes.arrayBuffer();
  const embeddings = new Float32Array(buffer);

  cache = { chunks, embeddings, manifest };
  return cache;
}

export function vectorAt(
  embeddings: Float32Array,
  offset: number,
  dim: number,
): Float32Array {
  return embeddings.subarray(offset * dim, (offset + 1) * dim);
}
