"use client";

import { createProvider } from "./llm";
import type { LLMMessage, ProviderConfig } from "./llm/types";
import { MODES, type ModeId } from "./modes";
import { scoreGroundedness } from "./rag/groundedness";
import { hypothesize } from "./rag/hyde";
import { hybridRetrieve } from "./rag/retrieve";
import type { Retrieved } from "./rag/types";

export type ChatTurnRequest = {
  mode: ModeId;
  history: LLMMessage[];
  userMessage: string;
  provider: ProviderConfig;
  useHyDE: boolean;
  topK: number;
  onDelta: (chunk: string) => void;
  onProgress: (status: "retrieving" | "hypothesizing" | "generating") => void;
  signal?: AbortSignal;
};

export type ChatTurnResponse = {
  answer: string;
  citations: Retrieved[];
  groundedness: number;
  artefact?: { filename: string; content: string };
};

export async function runChatTurn(
  req: ChatTurnRequest,
): Promise<ChatTurnResponse> {
  const mode = MODES[req.mode];
  const provider = createProvider(req.provider);

  let hypothetical: string | undefined;
  if (req.useHyDE) {
    req.onProgress("hypothesizing");
    hypothetical = await hypothesize(provider, req.userMessage).catch(() => undefined);
  }

  req.onProgress("retrieving");
  const citations = await hybridRetrieve({
    query: req.userMessage,
    topK: req.topK,
    useHyDE: req.useHyDE,
    hypotheticalAnswer: hypothetical,
  });

  const contextBlock = citations
    .map(
      (c, i) =>
        `<context id="${i + 1}" source="${c.chunk.title}"${c.chunk.section ? ` section="${c.chunk.section}"` : ""}${c.chunk.url ? ` url="${c.chunk.url}"` : ""}>\n${c.chunk.text}\n</context>`,
    )
    .join("\n\n");

  req.onProgress("generating");
  const system = `${mode.systemPrompt}\n\nGrounding context (cite as [^N] where N is the \`id\`):\n\n${contextBlock}`;

  const messages: LLMMessage[] = [
    ...req.history,
    { role: "user", content: req.userMessage },
  ];

  let answer = "";
  if (provider.stream) {
    answer = await provider.stream(
      { system, messages, maxTokens: 1400, temperature: 0.2, signal: req.signal },
      req.onDelta,
    );
  } else {
    answer = await provider.complete({
      system,
      messages,
      maxTokens: 1400,
      temperature: 0.2,
      signal: req.signal,
    });
    req.onDelta(answer);
  }

  const groundedness = scoreGroundedness(stripArtefact(answer), citations);
  const artefact = mode.producesArtefact
    ? extractArtefact(answer, mode.artefactFilename ?? "artefact.md")
    : undefined;

  return { answer, citations, groundedness, artefact };
}

const ARTEFACT_RE = /<<ARTEFACT>>\s*([\s\S]*?)\s*<<\/ARTEFACT>>/;

function extractArtefact(answer: string, filename: string) {
  const match = answer.match(ARTEFACT_RE);
  if (!match) return undefined;
  return { filename, content: match[1].trim() };
}

function stripArtefact(answer: string): string {
  return answer.replace(ARTEFACT_RE, "").trim();
}
