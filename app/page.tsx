"use client";

import { ExternalLink, Github, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { ChatWindow } from "@/components/ChatWindow";
import { ModeSelector } from "@/components/ModeSelector";
import { clearProvider, loadStoredProvider, saveProvider, useChat } from "@/lib/store";

const REPO_URL =
  process.env.NEXT_PUBLIC_REPO_URL ||
  "https://github.com/sebastian-rfai/frai-chat";

export default function Page() {
  const { mode, settings, setMode, setProvider } = useChat();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredProvider();
    if (stored) setProvider(stored);
    setHydrated(true);
    if (!stored) setDialogOpen(true);
  }, [setProvider]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f6f1] text-[11px] font-bold uppercase tracking-[0.16em] text-[#526050]">
        Booting FRAI Chat...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-[#141712] font-sans">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-rows-[auto_auto_1fr] px-4 pb-4 pt-5">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#d6dccf] pb-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#141712] text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5c6659]">
                FRAI Chat
              </p>
              <p className="text-sm font-semibold text-[#141712]">
                Grounded RAG copilot · EU AI Act · NIST AI RMF · ISO 42001 · FRAI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.provider ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#c9d5bd] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#126b45]">
                <span className="size-1.5 rounded-full bg-[#126b45]" />
                {settings.provider.id} · {settings.provider.model}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0bf58] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a15c0a]">
                <span className="size-1.5 rounded-full bg-[#d79b21]" />
                No key set
              </span>
            )}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-[#d6dccf] bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f5a4c] hover:bg-[#eef2e7]"
            >
              <Github size={12} /> Repo
            </a>
          </div>
        </header>

        <section className="mb-4">
          <ModeSelector value={mode} onChange={setMode} />
        </section>

        <section className="min-h-0 overflow-hidden rounded-lg border border-[#d6dccf] bg-[#f8f9f5] shadow-sm">
          <ChatWindow onOpenSettings={() => setDialogOpen(true)} />
        </section>

        <footer className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#5c6659]">
          <span>
            Runs entirely in your browser. No server. Your API key never leaves
            this tab.
          </span>
          <span>
            Corpus sources:{" "}
            <a
              className="font-bold underline"
              href={`${REPO_URL}/tree/main/corpus`}
              target="_blank"
              rel="noreferrer"
            >
              corpus/ <ExternalLink size={9} className="inline" />
            </a>
          </span>
        </footer>
      </div>

      <ApiKeyDialog
        open={dialogOpen}
        initial={settings.provider}
        onClose={() => setDialogOpen(false)}
        onSave={(cfg) => {
          saveProvider(cfg);
          setProvider(cfg);
          setDialogOpen(false);
        }}
      />

      {settings.provider && (
        <button
          hidden
          onClick={() => {
            clearProvider();
            setProvider(null);
          }}
        >
          clear
        </button>
      )}
    </main>
  );
}
