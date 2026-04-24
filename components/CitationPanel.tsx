"use client";

import { ExternalLink, X } from "lucide-react";
import type { Retrieved } from "@/lib/rag/types";

type Props = {
  citation: Retrieved | null;
  index: number | null;
  onClose: () => void;
};

export function CitationPanel({ citation, index, onClose }: Props) {
  if (!citation || index == null) return null;
  return (
    <div className="fixed inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto border-l border-[#d6dccf] bg-white p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#526050]">
            Citation {index + 1} · via {citation.via}
          </div>
          <h3 className="mt-1 text-lg font-black">{citation.chunk.title}</h3>
          {citation.chunk.section && (
            <p className="text-sm text-[#526050]">{citation.chunk.section}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#526050] hover:text-[#141712]"
        >
          <X size={18} />
        </button>
      </div>

      {citation.chunk.url && (
        <a
          href={citation.chunk.url}
          target="_blank"
          rel="noreferrer"
          className="mb-3 inline-flex items-center gap-1 rounded-md border border-[#d6dccf] bg-[#f5f6f1] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4f5a4c] hover:bg-[#eef2e7]"
        >
          Open source <ExternalLink size={11} />
        </a>
      )}

      <pre className="whitespace-pre-wrap rounded-md border border-[#d6dccf] bg-[#f5f6f1] p-3 text-[12px] leading-relaxed text-[#141712]">
        {citation.chunk.text}
      </pre>

      <div className="mt-3 text-[11px] text-[#647060]">
        Retrieval score: {citation.score.toFixed(4)} · tokens:{" "}
        {citation.chunk.tokens}
      </div>
    </div>
  );
}
