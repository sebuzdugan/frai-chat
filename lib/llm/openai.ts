import type { LLMProvider, LLMCompleteOptions, ProviderConfig } from "./types";

const BASE = "https://api.openai.com/v1";

export function createOpenAIProvider(cfg: ProviderConfig): LLMProvider {
  return {
    id: "openai",
    model: cfg.model,
    async complete(opts: LLMCompleteOptions) {
      const body = {
        model: cfg.model,
        messages: buildMessages(opts),
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.2,
      };
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: opts.signal,
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    },
    async stream(opts, onDelta) {
      const body = {
        model: cfg.model,
        messages: buildMessages(opts),
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.2,
        stream: true,
      };
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: opts.signal,
      });
      if (!res.ok || !res.body)
        throw new Error(`OpenAI stream ${res.status}: ${await res.text()}`);
      return consumeSSE(res.body, onDelta, (evt) => {
        const data = JSON.parse(evt);
        return data.choices?.[0]?.delta?.content ?? "";
      });
    },
  };
}

function buildMessages(opts: LLMCompleteOptions) {
  const msgs = opts.system
    ? [{ role: "system", content: opts.system }, ...opts.messages]
    : opts.messages;
  return msgs;
}

export async function consumeSSE(
  body: ReadableStream<Uint8Array>,
  onDelta: (chunk: string) => void,
  parse: (evt: string) => string,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const delta = parse(payload);
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        /* ignore malformed chunks */
      }
    }
  }
  return full;
}
