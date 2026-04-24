import { consumeSSE } from "./openai";
import type { LLMProvider, LLMCompleteOptions, ProviderConfig } from "./types";

const BASE = "https://openrouter.ai/api/v1";

export function createOpenRouterProvider(cfg: ProviderConfig): LLMProvider {
  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
    "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
    "X-Title": "FRAI Chat",
  });
  return {
    id: "openrouter",
    model: cfg.model,
    async complete(opts: LLMCompleteOptions) {
      const body = {
        model: cfg.model,
        messages: opts.system
          ? [{ role: "system", content: opts.system }, ...opts.messages]
          : opts.messages,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.2,
      };
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        signal: opts.signal,
      });
      if (!res.ok)
        throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    },
    async stream(opts, onDelta) {
      const body = {
        model: cfg.model,
        messages: opts.system
          ? [{ role: "system", content: opts.system }, ...opts.messages]
          : opts.messages,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.2,
        stream: true,
      };
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        signal: opts.signal,
      });
      if (!res.ok || !res.body)
        throw new Error(`OpenRouter stream ${res.status}: ${await res.text()}`);
      return consumeSSE(res.body, onDelta, (evt) => {
        const data = JSON.parse(evt);
        return data.choices?.[0]?.delta?.content ?? "";
      });
    },
  };
}
