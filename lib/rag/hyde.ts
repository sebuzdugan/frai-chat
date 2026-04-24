import type { LLMProvider } from "../llm/types";

const SYSTEM_PROMPT = `You are writing a *hypothetical* short passage that would answer the user's question, as if you were an authoritative policy document (EU AI Act, NIST AI RMF, ISO 42001, or the FRAI methodology).

Do not hedge. Do not say "I don't know". Do not say "as an AI". Just write 3-5 sentences of plausible document-style prose that could exist in the source material. This text is ONLY used for retrieval, never shown to the user.`;

/**
 * HyDE (Hypothetical Document Embeddings) — generate a fake passage that "looks
 * like" it would answer the question, then embed that for retrieval. Classic
 * +10% recall boost on compliance Q&A because real questions are short and
 * vague, but documents are long and specific.
 */
export async function hypothesize(
  provider: LLMProvider,
  question: string,
): Promise<string> {
  const out = await provider.complete({
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
    maxTokens: 200,
    temperature: 0.2,
  });
  return out.trim();
}
