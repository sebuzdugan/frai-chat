/**
 * Build the RAG index: read every markdown file under corpus/, chunk it,
 * compute embeddings with the same model the browser uses, and write:
 *
 *   public/index/chunks.json      — array of IndexedChunk (text + metadata)
 *   public/index/embeddings.bin   — Float32 matrix, row-major, [chunkCount, dim]
 *   public/index/manifest.json    — sizing + source metadata
 *
 * Kept intentionally vanilla (no build-tools dep) so CI runs it with `tsx`.
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CORPUS_DIR = join(ROOT, "corpus");
const OUT_DIR = join(ROOT, "public", "index");
const EMBED_MODEL = process.env.FRAI_CHAT_EMBED_MODEL || "Xenova/bge-small-en-v1.5";
const EMBED_DIM = 384;

type Source = {
  id: string;
  title: string;
  file: string;
  url?: string;
  description?: string;
  license?: string;
};

type Chunk = {
  id: string;
  sourceId: string;
  title: string;
  url?: string;
  section?: string;
  text: string;
  tokens: number;
  vectorOffset: number;
};

function approximateTokens(text: string): number {
  // ~4 chars/token heuristic is close enough for sizing decisions.
  return Math.ceil(text.length / 4);
}

function chunkMarkdown(
  source: Source,
  raw: string,
  maxTokens = 320,
): Omit<Chunk, "vectorOffset">[] {
  // Split on H2 headings; if a section is still too long, split on paragraphs.
  const sections: Array<{ heading?: string; body: string }> = [];
  const lines = raw.split("\n");
  let current: { heading?: string; body: string } = { body: "" };
  for (const line of lines) {
    const match = line.match(/^##\s+(.*?)\s*$/);
    if (match) {
      if (current.body.trim()) sections.push(current);
      current = { heading: match[1].trim(), body: "" };
    } else {
      current.body += `${line}\n`;
    }
  }
  if (current.body.trim()) sections.push(current);

  const chunks: Omit<Chunk, "vectorOffset">[] = [];
  let idx = 0;
  for (const section of sections) {
    const paragraphs = section.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    let buffer: string[] = [];
    let bufferTokens = 0;
    const flush = () => {
      if (buffer.length === 0) return;
      const text = buffer.join("\n\n").trim();
      if (text.length < 40) {
        buffer = [];
        bufferTokens = 0;
        return;
      }
      chunks.push({
        id: `${source.id}#${idx++}`,
        sourceId: source.id,
        title: source.title,
        url: source.url,
        section: section.heading,
        text,
        tokens: approximateTokens(text),
      });
      buffer = [];
      bufferTokens = 0;
    };
    for (const paragraph of paragraphs) {
      const tokens = approximateTokens(paragraph);
      if (bufferTokens + tokens > maxTokens && buffer.length > 0) {
        flush();
      }
      buffer.push(paragraph);
      bufferTokens += tokens;
    }
    flush();
  }
  return chunks;
}

async function loadSources(): Promise<Source[]> {
  const sourcesPath = join(CORPUS_DIR, "sources.json");
  try {
    const raw = await readFile(sourcesPath, "utf8");
    return JSON.parse(raw) as Source[];
  } catch {
    // Fallback: treat every markdown file in corpus/ as an untitled source.
    const files = await readdir(CORPUS_DIR);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({ id: f.replace(/\.md$/, ""), title: f, file: f }));
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log("Loading embedding model:", EMBED_MODEL);
  const { pipeline } = await import("@huggingface/transformers");
  const embedder = await pipeline("feature-extraction", EMBED_MODEL, {
    dtype: "q8",
  });

  const sources = await loadSources();
  console.log(`Chunking ${sources.length} source(s)...`);

  const raw: Omit<Chunk, "vectorOffset">[] = [];
  for (const source of sources) {
    const path = join(CORPUS_DIR, source.file);
    try {
      const text = await readFile(path, "utf8");
      const sourceChunks = chunkMarkdown(source, text);
      console.log(`  ${source.id}: ${sourceChunks.length} chunks`);
      raw.push(...sourceChunks);
    } catch (err) {
      console.warn(`  skip ${source.id}: ${(err as Error).message}`);
    }
  }

  if (raw.length === 0) {
    throw new Error("No chunks produced. Add markdown files under corpus/.");
  }

  console.log(`Embedding ${raw.length} chunks with ${EMBED_MODEL}...`);
  const embeddings = new Float32Array(raw.length * EMBED_DIM);
  const indexed: Chunk[] = [];
  for (let i = 0; i < raw.length; i++) {
    const chunk = raw[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output: any = await (embedder as any)(chunk.text, {
      pooling: "mean",
      normalize: true,
    });
    const vec = output.data as Float32Array;
    if (vec.length !== EMBED_DIM) {
      throw new Error(
        `Embedding dim mismatch: expected ${EMBED_DIM}, got ${vec.length} (model ${EMBED_MODEL}).`,
      );
    }
    embeddings.set(vec, i * EMBED_DIM);
    indexed.push({ ...chunk, vectorOffset: i });
    if ((i + 1) % 20 === 0 || i === raw.length - 1) {
      process.stdout.write(`  ${i + 1}/${raw.length}\r`);
    }
  }
  process.stdout.write("\n");

  await writeFile(join(OUT_DIR, "chunks.json"), JSON.stringify(indexed));
  await writeFile(
    join(OUT_DIR, "embeddings.bin"),
    Buffer.from(embeddings.buffer),
  );
  await writeFile(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify(
      {
        model: EMBED_MODEL,
        dim: EMBED_DIM,
        chunkCount: indexed.length,
        sources,
        builtAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  const bytes = embeddings.byteLength;
  console.log(
    `Wrote ${indexed.length} chunks + ${(bytes / 1024).toFixed(1)} KB embeddings to public/index/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
