import { createAnthropicProvider } from "./anthropic";
import { createOpenAIProvider } from "./openai";
import { createOpenRouterProvider } from "./openrouter";
import type { LLMProvider, ProviderConfig } from "./types";

export const DEFAULT_MODELS: Record<ProviderConfig["id"], string[]> = {
  openai: ["gpt-5.4-mini", "gpt-5.4", "gpt-5.2"],
  anthropic: ["claude-sonnet-5", "claude-opus-5", "claude-haiku-4-5-20251001"],
  openrouter: [
    "anthropic/claude-sonnet-5",
    "moonshotai/kimi-k2.6",
    "google/gemma-4-31b-it:free",
    "z-ai/glm-5.1",
  ],
};

export function createProvider(cfg: ProviderConfig): LLMProvider {
  switch (cfg.id) {
    case "openai":
      return createOpenAIProvider(cfg);
    case "anthropic":
      return createAnthropicProvider(cfg);
    case "openrouter":
      return createOpenRouterProvider(cfg);
  }
}

export type { LLMProvider, ProviderConfig, LLMMessage, LLMCompleteOptions } from "./types";
