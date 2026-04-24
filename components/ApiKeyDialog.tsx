"use client";

import { Key, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_MODELS } from "@/lib/llm";
import type { ProviderConfig } from "@/lib/llm/types";

type Props = {
  open: boolean;
  initial?: ProviderConfig | null;
  onClose: () => void;
  onSave: (cfg: ProviderConfig) => void;
};

const PROVIDER_LABELS: Record<ProviderConfig["id"], string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
};

export function ApiKeyDialog({ open, initial, onClose, onSave }: Props) {
  const [providerId, setProviderId] = useState<ProviderConfig["id"]>(
    initial?.id ?? "anthropic",
  );
  const [apiKey, setApiKey] = useState(initial?.apiKey ?? "");
  const [model, setModel] = useState(
    initial?.model ?? DEFAULT_MODELS[initial?.id ?? "anthropic"][0],
  );

  useEffect(() => {
    if (!open) return;
    setProviderId(initial?.id ?? "anthropic");
    setApiKey(initial?.apiKey ?? "");
    setModel(initial?.model ?? DEFAULT_MODELS[initial?.id ?? "anthropic"][0]);
  }, [open, initial]);

  useEffect(() => {
    setModel(DEFAULT_MODELS[providerId][0]);
  }, [providerId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#14171288] p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#d6dccf] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-[#141712] text-white">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black">Bring your own key</h2>
              <p className="text-xs text-[#526050]">
                Stored only in your browser's localStorage. Never sent anywhere
                except the provider you choose.
              </p>
            </div>
          </div>
          <button
            className="text-[#526050] hover:text-[#141712]"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#526050]">
              Provider
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["anthropic", "openai", "openrouter"] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => setProviderId(id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    providerId === id
                      ? "border-[#141712] bg-[#141712] text-white"
                      : "border-[#d6dccf] bg-white text-[#4f5a4c] hover:bg-[#eef2e7]"
                  }`}
                >
                  {PROVIDER_LABELS[id]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#526050]">
              Model
            </label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              list={`models-${providerId}`}
              className="mt-2 w-full rounded-lg border border-[#d6dccf] bg-white px-3 py-2 text-sm font-mono"
            />
            <datalist id={`models-${providerId}`}>
              {DEFAULT_MODELS[providerId].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <p className="mt-1 text-[11px] text-[#647060]">
              Suggested: {DEFAULT_MODELS[providerId].join(", ")}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#526050]">
              API key
            </label>
            <input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={providerId === "anthropic" ? "sk-ant-..." : "sk-..."}
              className="mt-2 w-full rounded-lg border border-[#d6dccf] bg-white px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="rounded-lg border border-[#d6dccf] bg-[#eef2e7] px-3 py-2 text-[11px] leading-relaxed text-[#4f5a4c]">
            <ShieldCheck size={12} className="mr-1 inline text-[#126b45]" />
            Keys live in your browser only. There is no backend — every LLM
            request goes directly to the provider. Clear at any time from the
            settings menu.
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="rounded-lg border border-[#d6dccf] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4f5a4c] hover:bg-[#eef2e7]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={!apiKey.trim() || !model.trim()}
              onClick={() =>
                onSave({ id: providerId, apiKey: apiKey.trim(), model: model.trim() })
              }
              className="rounded-lg bg-[#141712] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-40 enabled:hover:bg-[#2a2e28]"
            >
              Save key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
