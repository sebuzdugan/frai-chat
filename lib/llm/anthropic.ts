import type { LLMProvider, LLMCompleteOptions, ProviderConfig } from "./types";

const BASE = "https://api.anthropic.com/v1";

export function createAnthropicProvider(cfg: ProviderConfig): LLMProvider {
  const headers = () => ({
    "Content-Type": "application/json",
    "x-api-key": cfg.apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  });
  return {
    id: "anthropic",
    model: cfg.model,
    async complete(opts: LLMCompleteOptions) {
      const body = {
        model: cfg.model,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.2,
        system: opts.system,
        messages: opts.messages.filter((m) => m.role !== "system"),
      };
      const res = await fetch(`${BASE}/messages`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        signal: opts.signal,
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const parts = data.content as Array<{ type: string; text?: string }>;
      return parts
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("");
    },
    async stream(opts, onDelta) {
      const body = {
        model: cfg.model,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.2,
        system: opts.system,
        messages: opts.messages.filter((m) => m.role !== "system"),
        stream: true,
      };
      const res = await fetch(`${BASE}/messages`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        signal: opts.signal,
      });
      if (!res.ok || !res.body)
        throw new Error(`Anthropic stream ${res.status}: ${await res.text()}`);

      const reader = res.body.getReader();
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
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "content_block_delta" && evt.delta?.text) {
              full += evt.delta.text;
              onDelta(evt.delta.text);
            }
          } catch {
            /* ignore */
          }
        }
      }
      return full;
    },
  };
}
