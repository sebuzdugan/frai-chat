import { createAnthropicProvider } from "./anthropic";
import { createOpenAIProvider } from "./openai";
import { createOpenRouterProvider } from "./openrouter";
import type { LLMProvider, ProviderConfig } from "./types";

export const DEFAULT_MODELS: Record<ProviderConfig["id"], string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "o4-mini"],
  anthropic: ["claude-sonnet-4-6", "claude-opus-4-7", "claude-haiku-4-5-20251001"],
  openrouter: [
    "anthropic/claude-sonnet-4.6",
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
