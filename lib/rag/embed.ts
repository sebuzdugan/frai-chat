"use client";

import type { Pipeline } from "@huggingface/transformers";

// Lazy singleton — the model (~30 MB quantized) only downloads when the user
// sends a message. Subsequent calls reuse it.
let pipelinePromise: Promise<unknown> | null = null;

export const EMBED_MODEL = "Xenova/bge-small-en-v1.5";
export const EMBED_DIM = 384;

async function getPipeline() {
  if (!pipelinePromise) {
    pipelinePromise = import("@huggingface/transformers").then((m) =>
      m.pipeline("feature-extraction", EMBED_MODEL, { dtype: "q8" }),
    );
  }
  return pipelinePromise;
}

/**
 * Embed a single query into a 384-d unit vector (Float32).
 * BGE models expect the query prefix to match the corpus encoding (passage).
 */
export async function embedQuery(text: string): Promise<Float32Array> {
  const pipe = (await getPipeline()) as Pipeline;
  const out = await (pipe as unknown as (t: string, opts?: unknown) => Promise<{ data: Float32Array }>)(
    text,
    { pooling: "mean", normalize: true },
  );
  return out.data as Float32Array;
}

export function cosineSim(a: Float32Array, b: Float32Array): number {
  // Both vectors are already L2-normalized → dot product == cosine.
  let sum = 0;
  const len = a.length;
  for (let i = 0; i < len; i++) sum += a[i] * b[i];
  return sum;
}

export async function warmup(): Promise<void> {
  await getPipeline();
}
