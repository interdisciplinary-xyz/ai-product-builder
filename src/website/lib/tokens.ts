import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, allDocs, type Doc } from '@/lib/content';

/**
 * «TOKENS» are the library's central convention: a template ships placeholders
 * instead of invented facts, so an unfilled document looks unfilled. That makes
 * the token set the most practical index in the whole library — "what do I have
 * to know about my own product before this doc is worth anything?" — and it is
 * the one view the raw markdown cannot give you, because a token's meaning is
 * in `meta/PLACEHOLDERS.md` while its uses are scattered across 121 files.
 *
 * Two kinds, per the glossary's own rule:
 *   «SCREAMING_SNAKE» — one value per repo; safe to find-replace, and what
 *                       `/ai-init` can prompt for.
 *   «lowercase»       — filled inline, differently at each occurrence.
 */

export type TokenKind = 'repo' | 'inline';

export type TokenEntry = {
  name: string;
  kind: TokenKind;
  /** From the PLACEHOLDERS.md glossary, when it has a row for this token. */
  meaning: string | null;
  example: string | null;
  /** True when the glossary knows it — the rest are ad-hoc, per-doc tokens. */
  registered: boolean;
  docs: { layer: string; slug: string; name: string }[];
};

const TOKEN = /«([^»\n]{1,80})»/g;
const REPO_TOKEN = /^[A-Z][A-Z0-9_.:|]*$/;

export function kindOf(name: string): TokenKind {
  return REPO_TOKEN.test(name) ? 'repo' : 'inline';
}

/**
 * Tokens a reader would actually have to fill: fenced code blocks are stripped
 * first, because a token inside one is nearly always an illustration of the
 * convention rather than a slot in this document.
 */
export function tokensIn(doc: Doc): string[] {
  const prose = doc.body.replace(/^```[\s\S]*?^```/gm, '');
  return [...new Set([...prose.matchAll(TOKEN)].map((m) => m[1]))].sort();
}

/* ------------------------------------------------------------- the glossary */

type GlossaryRow = { meaning: string; example: string | null };

function plain(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

let glossaryCache: Map<string, GlossaryRow> | null = null;

/**
 * PLACEHOLDERS.md is a set of markdown tables. Three columns is
 * `Token | Meaning | Example`; the skill-layer table adds a `Kind` column in
 * position two. Reading meaning and example off the END of the row handles both
 * without hard-coding which table we are in.
 */
function glossary(): Map<string, GlossaryRow> {
  if (glossaryCache) return glossaryCache;
  const rows = new Map<string, GlossaryRow>();
  const file = path.join(REPO_ROOT, 'src/meta/PLACEHOLDERS.md');
  if (!fs.existsSync(file)) return (glossaryCache = rows);

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 3) continue;
    const names = [...cells[0].matchAll(TOKEN)].map((m) => m[1]);
    if (!names.length) continue;
    const meaning = plain(cells[cells.length - 2]);
    const example = plain(cells[cells.length - 1]);
    if (!meaning || meaning === 'Meaning') continue;
    for (const name of names) {
      rows.set(name, { meaning, example: example && example !== '—' ? example : null });
    }
  }
  glossaryCache = rows;
  return rows;
}

/**
 * `«QUALITY_CMD:lint»` is a real use of the glossary's
 * `«QUALITY_CMD:format|lint|types|unit|e2e|build»` row, and `«PORT_A»` of
 * `«PORT»`. Falling back to the stem stops those reading as unregistered.
 */
function lookup(name: string): GlossaryRow | undefined {
  const rows = glossary();
  const direct = rows.get(name);
  if (direct) return direct;
  const stem = name.split(':')[0];
  return rows.get(stem) ?? rows.get(stem.replace(/_[A-Z]$/, ''));
}

/* ---------------------------------------------------------------- the index */

let indexCache: TokenEntry[] | null = null;

export function tokenIndex(): TokenEntry[] {
  if (indexCache) return indexCache;
  const entries = new Map<string, TokenEntry>();

  for (const doc of allDocs()) {
    if (doc.layer === 'guides') continue;
    for (const name of tokensIn(doc)) {
      let entry = entries.get(name);
      if (!entry) {
        const row = lookup(name);
        entry = {
          name,
          kind: kindOf(name),
          meaning: row?.meaning ?? null,
          example: row?.example ?? null,
          registered: Boolean(row),
          docs: [],
        };
        entries.set(name, entry);
      }
      // The glossary lists its own tokens by definition; counting it as a use
      // would put every token at "used in 1 doc" minimum and say nothing.
      if (doc.layer !== 'meta') {
        entry.docs.push({ layer: doc.layer, slug: doc.slug, name: doc.name });
      }
    }
  }

  indexCache = [...entries.values()]
    .filter((e) => e.docs.length > 0)
    .sort((a, b) => b.docs.length - a.docs.length || a.name.localeCompare(b.name));
  return indexCache;
}

export function tokenStats() {
  const index = tokenIndex();
  const repo = index.filter((t) => t.kind === 'repo');
  return {
    total: index.length,
    repo: repo.length,
    inline: index.length - repo.length,
    registered: index.filter((t) => t.registered).length,
    shared: index.filter((t) => t.docs.length > 1).length,
    /** Docs carrying at least one token. */
    docs: new Set(index.flatMap((t) => t.docs.map((d) => `${d.layer}/${d.slug}`))).size,
  };
}

/** The tokens one document asks you to fill, richest first. */
export function tokensForDoc(doc: Doc): TokenEntry[] {
  const wanted = new Set(tokensIn(doc));
  return tokenIndex().filter((t) => wanted.has(t.name));
}
