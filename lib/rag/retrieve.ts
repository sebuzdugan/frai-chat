"use client";

import { BM25 } from "./bm25";
import { loadCorpus, vectorAt } from "./corpus";
import { cosineSim, embedQuery } from "./embed";
import type { Retrieved, RetrieveOptions } from "./types";

let bm25Cache: BM25 | null = null;

async function getBm25(): Promise<BM25> {
  if (!bm25Cache) {
    const { chunks } = await loadCorpus();
    bm25Cache = new BM25(chunks);
  }
  return bm25Cache;
}

/**
 * Hybrid retrieval: BM25 + dense embeddings, fused with reciprocal rank fusion.
 * The two signals complement each other — BM25 wins on rare exact-match terms
 * (article numbers, model names), dense embeddings win on semantic paraphrase.
 */
export async function hybridRetrieve(opts: RetrieveOptions): Promise<Retrieved[]> {
  const topK = opts.topK ?? 8;
  const fanout = Math.max(topK * 3, 24);

  const { chunks, embeddings, manifest } = await loadCorpus();
  const bm25 = await getBm25();

  const textForDense = opts.useHyDE && opts.hypotheticalAnswer
    ? `${opts.query}\n\n${opts.hypotheticalAnswer}`
    : opts.query;

  const [queryVec, bm25Hits] = await Promise.all([
    embedQuery(textForDense),
    Promise.resolve(bm25.search(opts.query, fanout)),
  ]);

  // Dense scores for ALL chunks (cheap once embedded).
  const denseHits: Array<{ idx: number; score: number }> = [];
  for (let i = 0; i < chunks.length; i++) {
    const v = vectorAt(embeddings, chunks[i].vectorOffset, manifest.dim);
    denseHits.push({ idx: i, score: cosineSim(queryVec, v) });
  }
  denseHits.sort((a, b) => b.score - a.score);
  const denseTop = denseHits.slice(0, fanout);

  // Reciprocal Rank Fusion — robust to score-scale mismatch.
  const k = 60;
  const fused = new Map<number, { score: number; via: Set<string> }>();
  bm25Hits.forEach((hit, rank) => {
    const entry = fused.get(hit.idx) ?? { score: 0, via: new Set() };
    entry.score += 1 / (k + rank);
    entry.via.add("bm25");
    fused.set(hit.idx, entry);
  });
  denseTop.forEach((hit, rank) => {
    const entry = fused.get(hit.idx) ?? { score: 0, via: new Set() };
    entry.score += 1 / (k + rank);
    entry.via.add("dense");
    fused.set(hit.idx, entry);
  });

  const ranked = Array.from(fused.entries())
    .map(([idx, { score, via }]) => ({
      chunk: chunks[idx],
      score,
      via: Array.from(via).join("+"),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked as Retrieved[];
}
