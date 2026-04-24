import { tokenize } from "./bm25";
import type { Retrieved } from "./types";

/**
 * Lightweight attribution score: for each answer sentence, what fraction of its
 * content tokens appear somewhere in the retrieved context? Returns 0..1.
 *
 * This is a cheap heuristic, not a trained NLI model. Good enough to flag
 * "answer drifted off the sources" vs "answer grounded in the sources" — which
 * is the signal the user actually needs. Can be upgraded to a cross-encoder
 * entailment model later.
 */
export function scoreGroundedness(answer: string, retrieved: Retrieved[]): number {
  if (!answer.trim() || retrieved.length === 0) return 0;

  const contextTokens = new Set<string>();
  for (const r of retrieved) for (const t of tokenize(r.chunk.text)) contextTokens.add(t);

  const sentences = answer
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (sentences.length === 0) return 0;

  let total = 0;
  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    if (tokens.length === 0) continue;
    let hits = 0;
    for (const t of tokens) if (contextTokens.has(t)) hits++;
    total += hits / tokens.length;
  }
  return total / sentences.length;
}

export function groundednessLabel(score: number): {
  label: "grounded" | "partial" | "low";
  color: string;
} {
  if (score >= 0.55) return { label: "grounded", color: "#126b45" };
  if (score >= 0.35) return { label: "partial", color: "#d79b21" };
  return { label: "low", color: "#c84630" };
}
