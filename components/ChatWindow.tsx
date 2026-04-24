"use client";

import { Loader2, Send, Settings2, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { runChatTurn } from "@/lib/chat-engine";
import type { LLMMessage } from "@/lib/llm/types";
import { MODES } from "@/lib/modes";
import type { Retrieved } from "@/lib/rag/types";
import { useChat } from "@/lib/store";
import type { ChatMessage } from "@/lib/store";
import { CitationPanel } from "./CitationPanel";
import { MessageBubble } from "./MessageBubble";

type Props = {
  onOpenSettings: () => void;
};

export function ChatWindow({ onOpenSettings }: Props) {
  const {
    mode,
    messages,
    settings,
    addMessage,
    updateMessage,
    resetMessages,
    setUseHyDE,
  } = useChat();

  const [input, setInput] = useState("");
  const [status, setStatus] = useState<
    "idle" | "retrieving" | "hypothesizing" | "generating"
  >("idle");
  const [activeCitation, setActiveCitation] = useState<{
    citation: Retrieved;
    index: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const disabled = !settings.provider;
  const busy = status !== "idle";

  async function submit() {
    const question = input.trim();
    if (!question || disabled || busy) return;
    setInput("");

    const history: LLMMessage[] = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };
    addMessage(userMsg);

    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };
    addMessage(assistantMsg);

    try {
      let streamed = "";
      const result = await runChatTurn({
        mode,
        history,
        userMessage: question,
        provider: settings.provider!,
        useHyDE: settings.useHyDE,
        topK: settings.topK,
        onDelta: (chunk) => {
          streamed += chunk;
          updateMessage(assistantId, { content: streamed, streaming: true });
        },
        onProgress: (s) => setStatus(s),
      });

      updateMessage(assistantId, {
        content: result.answer,
        citations: result.citations,
        groundedness: result.groundedness,
        artefact: result.artefact,
        streaming: false,
      });
    } catch (err) {
      updateMessage(assistantId, {
        content: `**Error:** ${(err as Error).message}`,
        streaming: false,
      });
    } finally {
      setStatus("idle");
    }
  }

  function openCitation(messageIdx: number, citationIdx: number) {
    const msg = messages[messageIdx];
    const cite = msg.citations?.[citationIdx];
    if (cite) setActiveCitation({ citation: cite, index: citationIdx });
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6dccf] bg-white px-5 py-3">
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.16em]">
              {MODES[mode].label}
            </h1>
            <p className="text-[11px] text-[#526050]">{MODES[mode].tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-lg border border-[#d6dccf] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f5a4c]">
              <input
                type="checkbox"
                checked={settings.useHyDE}
                onChange={(e) => setUseHyDE(e.target.checked)}
                className="size-3 accent-[#126b45]"
              />
              HyDE
            </label>
            <button
              onClick={resetMessages}
              className="inline-flex items-center gap-1 rounded-lg border border-[#d6dccf] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f5a4c] hover:bg-[#eef2e7]"
            >
              <Trash2 size={12} /> New chat
            </button>
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 rounded-lg border border-[#d6dccf] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f5a4c] hover:bg-[#eef2e7]"
            >
              <Settings2 size={12} /> Settings
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <EmptyState suggestion={MODES[mode].suggestedPrompt} onPick={setInput} />
          ) : (
            messages.map((m, idx) => (
              <MessageBubble
                key={m.id}
                message={m}
                onOpenCitation={(ci) => openCitation(idx, ci)}
              />
            ))
          )}
          {busy && (
            <div className="mt-2 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#526050]">
              <Loader2 className="animate-spin text-[#126b45]" size={13} />
              {status === "hypothesizing" && "Drafting hypothetical passage..."}
              {status === "retrieving" && "Retrieving sources..."}
              {status === "generating" && "Generating grounded answer..."}
            </div>
          )}
        </div>

        <footer className="border-t border-[#d6dccf] bg-white px-5 py-4">
          {disabled ? (
            <div className="flex items-center justify-between rounded-lg bg-[#eef2e7] px-3 py-2 text-[12px] text-[#4f5a4c]">
              <span>
                Add an API key to start chatting. Keys never leave your browser.
              </span>
              <button
                onClick={onOpenSettings}
                className="rounded-md bg-[#141712] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#2a2e28]"
              >
                Add key
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={2}
                placeholder={MODES[mode].suggestedPrompt}
                className="min-h-[44px] flex-1 resize-none rounded-lg border border-[#d6dccf] bg-white px-3 py-2 text-sm focus:border-[#126b45] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#141712] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-40 enabled:hover:bg-[#2a2e28]"
              >
                <Send size={13} /> Send
              </button>
            </form>
          )}
        </footer>
      </div>

      <CitationPanel
        citation={activeCitation?.citation ?? null}
        index={activeCitation?.index ?? null}
        onClose={() => setActiveCitation(null)}
      />
    </>
  );
}

function EmptyState({
  suggestion,
  onPick,
}: {
  suggestion: string;
  onPick: (text: string) => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-[#d6dccf] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#126b45]">
        <Sparkles size={13} /> Try this
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#263024]">{suggestion}</p>
      <button
        onClick={() => onPick(suggestion)}
        className="mt-3 rounded-md bg-[#141712] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#2a2e28]"
      >
        Use suggestion
      </button>
    </div>
  );
}
