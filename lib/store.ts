"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProviderConfig } from "./llm/types";
import type { ModeId } from "./modes";
import type { Retrieved } from "./rag/types";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Retrieved[];
  groundedness?: number;
  artefact?: { filename: string; content: string };
  streaming?: boolean;
};

type Settings = {
  provider: ProviderConfig | null;
  useHyDE: boolean;
  topK: number;
};

type ChatState = {
  mode: ModeId;
  messages: ChatMessage[];
  settings: Settings;
  setMode: (mode: ModeId) => void;
  resetMessages: () => void;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  setProvider: (cfg: ProviderConfig | null) => void;
  setUseHyDE: (v: boolean) => void;
  setTopK: (k: number) => void;
};

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      mode: "qa",
      messages: [],
      settings: { provider: null, useHyDE: false, topK: 6 },
      setMode: (mode) => set({ mode, messages: [] }),
      resetMessages: () => set({ messages: [] }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateMessage: (id, patch) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      setProvider: (provider) =>
        set((s) => ({ settings: { ...s.settings, provider } })),
      setUseHyDE: (useHyDE) =>
        set((s) => ({ settings: { ...s.settings, useHyDE } })),
      setTopK: (topK) => set((s) => ({ settings: { ...s.settings, topK } })),
    }),
    {
      name: "frai-chat-state",
      // Don't persist transient conversation state or API key — API key only
      // stored via the explicit BYOK flow; conversation is ephemeral.
      partialize: (state) => ({
        mode: state.mode,
        settings: state.settings,
      }),
    },
  ),
);

// ---------- API key storage (isolated from the persist layer) ----------
const API_KEY_STORAGE_KEY = "frai-chat-api-key";

export function loadStoredProvider(): ProviderConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(API_KEY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProviderConfig) : null;
  } catch {
    return null;
  }
}

export function saveProvider(cfg: ProviderConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(cfg));
}

export function clearProvider(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}
