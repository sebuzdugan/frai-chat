export type Role = "user" | "assistant" | "system";

export type LLMMessage = { role: Role; content: string };

export type LLMCompleteOptions = {
  system?: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
};

export type LLMProvider = {
  id: "openai" | "anthropic" | "openrouter";
  model: string;
  complete: (opts: LLMCompleteOptions) => Promise<string>;
  stream?: (
    opts: LLMCompleteOptions,
    onDelta: (chunk: string) => void,
  ) => Promise<string>;
};

export type ProviderConfig = {
  id: LLMProvider["id"];
  apiKey: string;
  model: string;
};
