# FRAI Chat

**Responsible-AI copilot, grounded in the EU AI Act, NIST AI RMF, ISO/IEC 42001,
and the FRAI methodology. Runs entirely in your browser. Deploys to GitHub Pages for free.**

> Part of the FRAI family — works alongside the
> [`frai`](https://github.com/sebastian-rfai/frai) CLI/SDK and the
> [`frai-benchmark`](https://github.com/sebastian-rfai/frai-benchmark) leaderboard.

## Why this isn't just "ChatGPT with an uploaded PDF"

| Feature | Generic doc chat | FRAI Chat |
|---|---|---|
| Multi-source hybrid retrieval (BM25 + dense embeddings + fusion) | no | yes |
| HyDE (hypothetical-document) query rewriting | no | yes (toggle) |
| Inline citations with source opening panel | partial | yes |
| Groundedness score on every answer | no | yes |
| **EU AI Act tier-classifier mode** (Annex III citations) | no | yes |
| **Model-card / risk-file artefact generator** (FRAI CLI format, downloadable) | no | yes |
| Runs in the browser, no server, BYOK | no | yes |

The product moat is the **artefact-generation modes** — FRAI Chat doesn't just
answer questions, it produces the same handoff documents (`model_card.md`,
`risk_file.md`) that the FRAI CLI generates, so teams can draft them
conversationally and download them ready for reviewers.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│  ┌─────────────┐   ┌─────────────────┐   ┌──────────────────┐  │
│  │ Mode picker │→→ │ RAG engine      │→→ │ LLM provider     │  │
│  │ Q&A / Tier  │   │ BM25 + dense    │   │ OpenAI / Anthr / │  │
│  │ Model card  │   │ HyDE · rerank   │   │ OpenRouter (BYOK)│  │
│  │ Risk file   │   │ groundedness    │   │ — direct fetch —  │  │
│  └─────────────┘   └─────────────────┘   └──────────────────┘  │
│         ▲                  ▲                                    │
│         │                  │                                    │
│  ┌───────────┐     ┌───────────────┐                            │
│  │ UI state  │     │ /index/*.json │ ← built at CI from corpus/ │
│  │ Zustand   │     │ + .bin (Float32)                            │
│  └───────────┘     └───────────────┘                            │
└────────────────────────────────────────────────────────────────┘
```

- **Embeddings:** `Xenova/bge-small-en-v1.5` (384 dims, quantized) via
  [@huggingface/transformers](https://huggingface.co/docs/transformers.js).
  Runs client-side in WASM. ~30 MB one-time download, cached in IndexedDB.
- **Vector index:** pre-built at CI time by [`scripts/ingest.ts`](scripts/ingest.ts)
  from markdown files under [`corpus/`](corpus/), shipped as static JSON + a
  Float32 binary blob under `public/index/`.
- **Retrieval:** hybrid — BM25 (exact-term recall, great for article numbers
  like "Article 52(1)") fused with dense cosine via reciprocal rank fusion.
- **Citations:** every answer is required to cite `[^N]` markers; the UI turns
  them into clickable chips that open the source chunk.
- **Groundedness:** a cheap token-overlap heuristic between the answer and the
  retrieved chunks. "grounded" / "partial" / "low" chip on every reply.
- **BYOK:** API keys are held only in `localStorage`. There is no backend — every
  LLM call hits OpenAI / Anthropic / OpenRouter directly from the browser.

## Getting started

```bash
git clone https://github.com/sebastian-rfai/frai-chat
cd frai-chat
npm install
npm run ingest    # builds public/index/ from corpus/
npm run dev       # open http://localhost:3000
```

First load will prompt for an API key. Pick Anthropic, OpenAI, or OpenRouter.
Keys live in `localStorage` only. Open devtools → Application → Local Storage
to inspect or clear them manually.

## Deploying to GitHub Pages

1. Push to a repo named `frai-chat` on a GitHub user/org.
2. **Settings → Pages → Source:** GitHub Actions.
3. Push to `main`. The [`deploy.yml`](.github/workflows/deploy.yml) workflow
   will build the corpus index, static-export Next.js, and publish to
   `https://<user>.github.io/frai-chat/`.

If you deploy under a different path, set
`NEXT_PUBLIC_BASE_PATH=/your-path` in the workflow and the Next.js config will
rewrite asset URLs accordingly.

## Adding corpus sources

1. Drop a markdown file under `corpus/`.
2. Add an entry to [`corpus/sources.json`](corpus/sources.json) with `id`,
   `title`, `file`, and (optionally) `url`, `description`, `license`.
3. Run `npm run ingest`. The UI will pick up the new chunks on next load.

The ingest script chunks by `##` headings and paragraph boundaries, with a
~320-token soft cap. Override the embedding model via
`FRAI_CHAT_EMBED_MODEL=...` — any feature-extraction model on Hugging Face with
a 384-dim output will work without further changes; different dims need the
constant updated in `lib/rag/embed.ts` and `scripts/ingest.ts`.

## Repository layout

```
app/             — Next.js App Router pages (static-exported)
components/      — ApiKeyDialog, ChatWindow, MessageBubble, ModeSelector, ...
corpus/          — markdown sources + sources.json metadata
lib/
  llm/           — OpenAI / Anthropic / OpenRouter adapters (streaming)
  modes/         — Q&A, tier-classifier, model-card, risk-file system prompts
  rag/           — BM25, embeddings, hybrid retrieval, HyDE, groundedness
  chat-engine.ts — orchestrates retrieval + generation + artefact extraction
  store.ts       — Zustand state + localStorage helpers for BYOK
public/index/    — built-artefact vector index (chunks.json, embeddings.bin)
scripts/ingest.ts — CI-time corpus chunker + embedder
```

## License

Apache 2.0. Corpus files are community-maintained summaries; full binding texts
are available from their respective sources (see `corpus/sources.json`).
