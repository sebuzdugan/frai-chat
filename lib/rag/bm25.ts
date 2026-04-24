import type { IndexedChunk } from "./types";

// Minimal BM25 implementation over pre-loaded chunks.
// Good enough to complement dense retrieval on rare terms (model names, article
// numbers, regulation codes), which embeddings are famously bad at.

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
  "he", "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was",
  "were", "will", "with", "this", "these", "those", "you", "your", "i", "we",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export class BM25 {
  private readonly k1 = 1.5;
  private readonly b = 0.75;
  private readonly avgLen: number;
  private readonly idf = new Map<string, number>();
  private readonly postings = new Map<string, Map<number, number>>();
  private readonly docLens: number[] = [];

  constructor(chunks: IndexedChunk[]) {
    for (let i = 0; i < chunks.length; i++) {
      const tokens = tokenize(chunks[i].text);
      this.docLens.push(tokens.length);
      const tf = new Map<string, number>();
      for (const tok of tokens) tf.set(tok, (tf.get(tok) ?? 0) + 1);
      for (const [tok, count] of tf) {
        let posting = this.postings.get(tok);
        if (!posting) {
          posting = new Map();
          this.postings.set(tok, posting);
        }
        posting.set(i, count);
      }
    }
    const N = chunks.length || 1;
    for (const [tok, posting] of this.postings) {
      const df = posting.size;
      this.idf.set(tok, Math.log(1 + (N - df + 0.5) / (df + 0.5)));
    }
    this.avgLen =
      this.docLens.reduce((a, b) => a + b, 0) / (this.docLens.length || 1);
  }

  search(query: string, topK: number): Array<{ idx: number; score: number }> {
    const tokens = tokenize(query);
    const scores = new Map<number, number>();
    for (const tok of tokens) {
      const posting = this.postings.get(tok);
      if (!posting) continue;
      const idf = this.idf.get(tok) ?? 0;
      for (const [docIdx, tf] of posting) {
        const len = this.docLens[docIdx];
        const denom = tf + this.k1 * (1 - this.b + (this.b * len) / this.avgLen);
        const score = (idf * (tf * (this.k1 + 1))) / denom;
        scores.set(docIdx, (scores.get(docIdx) ?? 0) + score);
      }
    }
    const entries = Array.from(scores.entries()).map(([idx, score]) => ({
      idx,
      score,
    }));
    entries.sort((a, b) => b.score - a.score);
    return entries.slice(0, topK);
  }
}
