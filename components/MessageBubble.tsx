"use client";

import { Bot, Download, FileText, User } from "lucide-react";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { groundednessLabel } from "@/lib/rag/groundedness";
import type { ChatMessage } from "@/lib/store";

type Props = {
  message: ChatMessage;
  onOpenCitation: (index: number) => void;
};

export function MessageBubble({ message, onOpenCitation }: Props) {
  const isUser = message.role === "user";
  const rendered = useMemo(
    () => stripArtefactMarkers(message.content),
    [message.content],
  );
  const ground = message.groundedness != null ? groundednessLabel(message.groundedness) : null;

  return (
    <div className="mb-4 flex gap-3">
      <div
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${
          isUser ? "bg-[#eef2e7] text-[#141712]" : "bg-[#141712] text-white"
        }`}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-lg border border-[#d6dccf] bg-white px-4 py-3 shadow-sm">
          <div className="prose-compact">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p>{decorateCitations(children, onOpenCitation)}</p>
                ),
                li: ({ children }) => (
                  <li>{decorateCitations(children, onOpenCitation)}</li>
                ),
              }}
            >
              {rendered}
            </ReactMarkdown>
          </div>

          {message.artefact && (
            <ArtefactBlock
              filename={message.artefact.filename}
              content={message.artefact.content}
            />
          )}

          {!isUser && (message.citations?.length || ground) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eef2e7] pt-2">
              {message.citations?.map((c, i) => (
                <button
                  key={c.chunk.id}
                  onClick={() => onOpenCitation(i)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#d6dccf] bg-[#f5f6f1] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4f5a4c] hover:bg-[#eef2e7]"
                  title={c.chunk.text.slice(0, 120)}
                >
                  <span className="citation-chip">{i + 1}</span>
                  {c.chunk.title}
                  {c.chunk.section ? ` · ${c.chunk.section}` : ""}
                </button>
              ))}
              {ground && (
                <span
                  className="ml-auto rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                  style={{ backgroundColor: ground.color }}
                  title={`Attribution score ${(message.groundedness! * 100).toFixed(0)}% — fraction of answer tokens supported by retrieved context.`}
                >
                  {ground.label} · {(message.groundedness! * 100).toFixed(0)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArtefactBlock({ filename, content }: { filename: string; content: string }) {
  const downloadHref = useMemo(() => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [content]);

  return (
    <div className="mt-3 rounded-lg border border-[#141712] bg-[#f5f6f1] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#141712]">
          <FileText size={14} />
          Artefact · {filename}
        </div>
        <a
          href={downloadHref}
          download={filename}
          className="inline-flex items-center gap-1 rounded-md bg-[#141712] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#2a2e28]"
        >
          <Download size={12} /> Download
        </a>
      </div>
      <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md bg-white p-2 text-[11px] leading-snug text-[#141712]">
        {content}
      </pre>
    </div>
  );
}

function stripArtefactMarkers(text: string): string {
  return text
    .replace(/<<ARTEFACT>>\s*[\s\S]*?\s*<<\/ARTEFACT>>/g, "")
    .trim();
}

// Replace [^N] markers inside rendered markdown nodes with clickable chips.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decorateCitations(children: any, onClick: (i: number) => void): any {
  if (typeof children === "string") {
    const parts = children.split(/(\[\^\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[\^(\d+)\]/);
      if (!match) return part;
      const n = parseInt(match[1], 10);
      return (
        <button
          key={idx}
          onClick={() => onClick(n - 1)}
          className="citation-chip"
          title={`Citation ${n}`}
        >
          {n}
        </button>
      );
    });
  }
  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === "string" ? (
        <span key={i}>{decorateCitations(child, onClick)}</span>
      ) : (
        child
      ),
    );
  }
  return children;
}
