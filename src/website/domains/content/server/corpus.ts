import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import { LAYERS, SECTION_LABEL } from '../constants';
import { slugify } from '../taxonomy';
import type { Doc, LayerId, SearchEntry } from '../types';

/**
 * The site is a *view* of the library, not a copy of it. Everything below is read
 * from the repository's own markdown at build time — descriptions come from
 * CATALOG.md, so the site can never drift from the catalog it renders.
 *
 * This file is Node-only, which is why it lives under `content/server/` and is
 * NOT re-exported from the domain's client barrel. See
 * RUNBOOK_DOMAIN_ARCHITECTURE §5.
 */

export const REPO_ROOT = process.env.LIBRARY_ROOT
  ? path.resolve(process.env.LIBRARY_ROOT)
  : path.resolve(process.cwd(), '..', '..');

/* ------------------------------------------------------------------ helpers */

const READABLE = new Set(['.md', '.json', '.py', '.txt', '.yml', '.yaml']);
const GUIDE_FILES = ['README.md', 'CATALOG.md', 'CONTRIBUTING.md'];

/** The handful of files CATALOG.md does not index, because they describe it. */
const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  'README.md': 'The front page — what the library is, the eight layers, and how to deploy it.',
  'CATALOG.md': 'Every file in the library, by layer, each with a one-line description.',
  'CONTRIBUTING.md': 'Conventions, the prefix rules, skill-or-doc, and the release process.',
  'src/scripts/README.md': 'How to run the calculators, and the rule they exist to serve.',
  'src/scripts/examples/pmf-responses.example.json':
    'Fifteen survey responses engineered so the raw verdict passes and the honest one does not.',
};

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (READABLE.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/** Catalog cells are markdown; cards are not. Strip inline markup, keep the words. */
function plainText(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

function languageFor(file: string): string | null {
  switch (path.extname(file)) {
    case '.md':
      return null;
    case '.py':
      return 'python';
    case '.json':
      return 'json';
    case '.yml':
    case '.yaml':
      return 'yaml';
    default:
      return 'text';
  }
}

/** Strips a YAML frontmatter block, returning its raw lines and the remaining body. */
function splitFrontmatter(raw: string): { frontmatter: string | null; body: string } {
  if (!raw.startsWith('---\n')) return { frontmatter: null, body: raw };
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return { frontmatter: null, body: raw };
  return {
    frontmatter: raw.slice(4, end),
    body: raw.slice(raw.indexOf('\n', end + 1) + 1),
  };
}

function frontmatterValue(frontmatter: string | null, key: string): string | null {
  if (!frontmatter) return null;
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
}

/**
 * Headings outside fenced code blocks, for the in-page table of contents.
 *
 * The ids MUST match what rehype-slug puts on the rendered headings, so this
 * uses the very same slugger rather than approximating it — a hand-rolled
 * version left 130 of 644 anchors dead, because it collapsed whitespace and
 * dropped underscores where github-slugger does neither. Every heading level
 * is fed through in document order so the duplicate counter stays in step,
 * then the list is narrowed to the levels the contents shows.
 */
function extractHeadings(body: string, markdown: boolean) {
  const headings: { depth: number; text: string; id: string }[] = [];
  const slugger = new GithubSlugger();
  let fenced = false;
  let commented = false;
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    // Read off the array rather than tracked in a variable: the loop `continue`s
    // in four places, and every one of them would have to remember to update it.
    const previous = lines[i - 1] ?? '';
    const next = lines[i + 1] ?? '';
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    // Sections are commented out in place ("uncomment if this is a payments
    // product"); the renderer emits no heading for those, so neither can we.
    if (!commented && /<!--/.test(line) && !/-->/.test(line)) commented = true;
    else if (commented && /-->/.test(line)) {
      commented = false;
      continue;
    }
    if (commented) continue;
    // A MANAGER's sections are bare uppercase lines, not `##`. The renderer
    // promotes those to depth-2 headings (remarkSectionLabels), so the contents
    // has to see them too — the rule is mirrored here rather than shared,
    // because that plugin works on an mdast tree and this walks lines, and the
    // two must agree or the rail links to anchors that were never emitted.
    //
    // "Standalone paragraph" is a blank line either side, which is what makes
    // it its own paragraph for remark. Markdown only: a `.py` script renders
    // as a code block, and its comment banners are not sections.
    if (markdown && SECTION_LABEL.test(line.trim()) && !previous.trim() && !next.trim()) {
      const text = line.trim();
      headings.push({ depth: 2, text, id: slugger.slug(text) });
      continue;
    }

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!match) continue;
    // Strip what the renderer consumes and nothing else.
    //
    // A link renders as its text, so the URL must go: `## 2. Branch names —
    // see [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) §1` slugged with the
    // target still in it, and the contents rail pointed at an anchor no
    // heading ever carried. One dead link, and the only one in the library.
    //
    // Emphasis asterisks and code backticks go the same way. NOT underscores —
    // «TARGET_PRICE_POINT» is an identifier here, and removing them produced
    // ids no heading ever had.
    const text = match[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*`]/g, '')
      .trim();
    headings.push({ depth: match[1].length, text, id: slugger.slug(text) });
  }
  return headings;
}

/* ---------------------------------------------------------- CATALOG parsing */

/**
 * CATALOG.md is the library's own index: one table row per file, the last cell
 * being its one-line description. Reading it here keeps a single source of truth
 * — edit the catalog, the site follows.
 */
function readCatalog(): Map<string, { description: string; deployedAs: string | null }> {
  const entries = new Map<string, { description: string; deployedAs: string | null }>();
  const catalogPath = path.join(REPO_ROOT, 'CATALOG.md');
  if (!fs.existsSync(catalogPath)) return entries;

  for (const line of fs.readFileSync(catalogPath, 'utf8').split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const link = cells[0].match(/\[`([^`]+)`\]\(([^)]+)\)/);
    if (!link) continue;

    const file = path.basename(link[2]);
    const description = plainText(cells[cells.length - 1]);
    if (!description || description === '—') continue;

    // Three-column tables carry a "Deployed as" / "Run it" cell in the middle.
    const middle = cells.length >= 3 ? cells[1].replace(/`/g, '') : '';
    entries.set(file, {
      description,
      deployedAs: middle && middle !== '—' && !middle.startsWith('python3') ? middle : null,
    });
  }
  return entries;
}

/* --------------------------------------------------------------- the corpus */

let cache: Doc[] | null = null;

export function allDocs(): Doc[] {
  if (cache) return cache;
  const catalog = readCatalog();
  const docs: Doc[] = [];

  for (const layer of LAYERS) {
    const files =
      layer.id === 'guides'
        ? GUIDE_FILES.map((f) => path.join(REPO_ROOT, f)).filter((f) => fs.existsSync(f))
        : walk(path.join(REPO_ROOT, layer.dir));

    for (const absolute of files.sort()) {
      const repoPath = path.relative(REPO_ROOT, absolute);
      const file = path.basename(absolute);
      const raw = fs.readFileSync(absolute, 'utf8');
      const { frontmatter, body } = splitFrontmatter(raw);
      const name = file.replace(/\.[^.]+$/, '').replace(layer.prefix ?? '', '');
      const catalogEntry = catalog.get(file);
      const h1 = body.match(/^#\s+(.+)$/m);
      const heading = h1?.[1]?.trim() ?? null;
      // The page renders its own title, so the document's H1 would only repeat it.
      const content = h1 ? body.replace(h1[0], '').replace(/^\s+/, '') : body;

      docs.push({
        layer: layer.id,
        slug: slugify(path.relative(path.join(REPO_ROOT, layer.dir), absolute).replace(layer.prefix ?? '', '')),
        file,
        repoPath,
        name,
        deployedAs: catalogEntry?.deployedAs ?? null,
        description:
          catalogEntry?.description ??
          frontmatterValue(frontmatter, 'description') ??
          FALLBACK_DESCRIPTIONS[repoPath] ??
          FALLBACK_DESCRIPTIONS[file] ??
          null,
        heading,
        body: content,
        language: languageFor(file),
        headings: extractHeadings(content, languageFor(file) === null),
        words: content.split(/\s+/).filter(Boolean).length,
        bytes: Buffer.byteLength(raw),
      });
    }
  }

  cache = docs;
  return docs;
}

export function docsForLayer(layer: LayerId): Doc[] {
  return allDocs().filter((d) => d.layer === layer);
}

export function findDoc(layer: string, slug: string): Doc | undefined {
  return allDocs().find((d) => d.layer === layer && d.slug === slug);
}

export function layerCounts(): Record<LayerId, number> {
  const counts = Object.fromEntries(LAYERS.map((l) => [l.id, 0])) as Record<LayerId, number>;
  for (const doc of allDocs()) counts[doc.layer] += 1;
  return counts;
}

/**
 * Basename → route, used to rewrite the docs' own relative markdown links so
 * cross-references between files keep working inside the site.
 */
export function linkMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const doc of allDocs()) {
    const route = `/${doc.layer}/${doc.slug}/`;
    map[doc.file.toLowerCase()] = route;
    // Docs link to each other by their *deployed* name too (./QUALITY_ASSURANCE.md).
    if (doc.deployedAs) map[doc.deployedAs.toLowerCase().replace(/\/$/, '')] = route;
    if (doc.layer === 'runbooks') map[`${doc.name.toLowerCase()}.md`] = route;
  }
  return map;
}

export function searchIndex(): SearchEntry[] {
  return allDocs().map((d) => ({
    layer: d.layer,
    slug: d.slug,
    name: d.name,
    file: d.file,
    description: d.description ?? d.heading ?? '',
    deployedAs: d.deployedAs,
  }));
}

/** Repo version, so the footer can state what the site was built from. */
export function libraryVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}
