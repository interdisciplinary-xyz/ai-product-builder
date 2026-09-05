import fs from 'node:fs';
import path from 'node:path';

/**
 * The site is a *view* of the library, not a copy of it. Everything below is read
 * from the repository's own markdown at build time — descriptions come from
 * CATALOG.md, so the site can never drift from the catalog it renders.
 */

export const REPO_ROOT = process.env.LIBRARY_ROOT
  ? path.resolve(process.env.LIBRARY_ROOT)
  : path.resolve(process.cwd(), '..', '..');

export type LayerId =
  | 'managers'
  | 'runbooks'
  | 'commands'
  | 'skills'
  | 'agents'
  | 'scripts'
  | 'config'
  | 'meta'
  | 'guides';

export type Layer = {
  id: LayerId;
  label: string;
  /** Directory relative to the repo root. */
  dir: string;
  /** Filename prefix stripped to form the display name, if any. */
  prefix?: string;
  /** One line: what this layer *is*. */
  tagline: string;
  /** The longer framing shown on the layer page. */
  blurb: string;
  /** Where a deployed copy lands in a consuming repo. */
  target: string;
  /** The verb that describes using one of these. */
  verb: string;
  accent: string;
  accentDark: string;
};

export const LAYERS: Layer[] = [
  {
    id: 'managers',
    label: 'Managers',
    dir: 'src/managers',
    prefix: 'MANAGER_',
    tagline: 'Playbooks you run against a repo.',
    blurb:
      'A manager is executable prose. You point it at a repository and it creates, verifies or audits a document — usually the runbook of the same name. It is the only layer that produces another layer.',
    target: 'docs/',
    verb: 'run',
    accent: '#9a5b12',
    accentDark: '#e0a35c',
  },
  {
    id: 'runbooks',
    label: 'Runbooks',
    dir: 'src/runbooks',
    prefix: 'RUNBOOK_',
    tagline: 'Documents you fill.',
    blurb:
      'The artifact your team actually lives with. Every runbook ships with «placeholders» instead of invented facts, so an unfilled one is visibly unfilled. The RUNBOOK_ prefix is stripped on deploy.',
    target: 'docs/',
    verb: 'fill',
    accent: '#1c5570',
    accentDark: '#6fb6d8',
  },
  {
    id: 'commands',
    label: 'Commands',
    dir: 'src/commands',
    tagline: 'Slash-commands for Claude Code.',
    blurb:
      'Invoked by name. The four audit-* commands write a dated report, diff it against the previous run, and open an issue only when a number gets worse — silence is the pass condition.',
    target: '.claude/commands/',
    verb: 'invoke',
    accent: '#553a8b',
    accentDark: '#b3a0e8',
  },
  {
    id: 'skills',
    label: 'Skills',
    dir: 'src/skills',
    prefix: 'SKILL_',
    tagline: 'Rules that fire without being asked.',
    blurb:
      'The only layer you never invoke. A skill exists precisely because you do not know you need it — it ambushes the diff at the moment you are about to make the mistake it knows about.',
    target: '.claude/skills/',
    verb: 'never invoke',
    accent: '#a32d1c',
    accentDark: '#f08a72',
  },
  {
    id: 'agents',
    label: 'Agents',
    dir: 'src/agents',
    prefix: 'AGENT_',
    tagline: 'Read-only executive lenses.',
    blurb:
      'Four fixed points of view, convened by /board, which injects live state and reports where they disagree. The lens lives in the file; the state never does.',
    target: '.claude/agents/',
    verb: 'convene',
    accent: '#2c5a3d',
    accentDark: '#79bd93',
  },
  {
    id: 'scripts',
    label: 'Scripts',
    dir: 'src/scripts',
    tagline: 'Calculators. Standard library only.',
    blurb:
      'A playbook that ends in a number should ship the calculator that produces it. Python 3, no dependencies, run in place.',
    target: 'run in place',
    verb: 'run',
    accent: '#6f5316',
    accentDark: '#d4b45f',
  },
  {
    id: 'config',
    label: 'Config',
    dir: 'src/config',
    tagline: 'The permission boundary, in one file.',
    blurb:
      'Allow-lists git, gh, package and read-only Bash. Denies merge, rebase, force-push, the deploy CLI and every .env write. The human merges, deploys and touches secrets.',
    target: '.claude/settings.json',
    verb: 'install',
    accent: '#494a55',
    accentDark: '#a9abbb',
  },
  {
    id: 'meta',
    label: 'Meta',
    dir: 'src/meta',
    tagline: 'The «token» glossary.',
    blurb:
      'The one file every other document reads from. «SCREAMING_SNAKE» is one value per repo; «lowercase» is filled inline per occurrence.',
    target: 'docs/',
    verb: 'read',
    accent: '#7d4360',
    accentDark: '#d792b3',
  },
  {
    id: 'guides',
    label: 'Guides',
    dir: '.',
    tagline: 'The repository’s own front matter.',
    blurb:
      'The README, the catalog and the contribution conventions — the documents that describe the library rather than belonging to it.',
    target: '—',
    verb: 'read',
    accent: '#4a4437',
    accentDark: '#c2b9a4',
  },
];

export const LAYER_BY_ID = new Map(LAYERS.map((l) => [l.id, l]));

export type Doc = {
  layer: LayerId;
  slug: string;
  /** Filename with extension, e.g. RUNBOOK_E2E.md */
  file: string;
  /** Path relative to the repo root. */
  repoPath: string;
  /** Identity without prefix or extension, e.g. E2E, board, ceo. */
  name: string;
  /** Name it takes in a consuming repo after deploy. */
  deployedAs: string | null;
  /** One line from CATALOG.md, or the command's own frontmatter description. */
  description: string | null;
  /** The document's own H1, when it has one. */
  heading: string | null;
  /** Body with frontmatter stripped. */
  body: string;
  /** Fenced language for non-markdown files. */
  language: string | null;
  headings: { depth: number; text: string; id: string }[];
  words: number;
  bytes: number;
};

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

export function slugify(value: string): string {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/[/_.\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
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

/** Headings outside fenced code blocks, for the in-page table of contents. */
function extractHeadings(body: string) {
  const headings: { depth: number; text: string; id: string }[] = [];
  const seen = new Map<string, number>();
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
    if (!match) continue;
    const text = match[2].replace(/[*`_]/g, '').trim();
    // Mirrors rehype-slug's GitHub-style ids so the anchors actually resolve.
    let id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count) id = `${id}-${count}`;
    headings.push({ depth: match[1].length, text, id });
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
        headings: extractHeadings(content),
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

/* ----------------------------------------------------------- the link graph */

type Relations = { outbound: Doc[]; inbound: Doc[] };
let graph: Map<string, Relations> | null = null;

const key = (d: Doc) => `${d.layer}/${d.slug}`;

/**
 * The library's structure is not in its file names — only 3 of 25 managers share
 * a name with a runbook. It is in the cross-references the documents actually
 * make. So read those: resolve every markdown link to the doc it names, and
 * invert the result to get "what points here".
 */
function buildGraph(): Map<string, Relations> {
  if (graph) return graph;
  const docs = allDocs();
  const map = linkMap();
  const byRoute = new Map(docs.map((d) => [`/${d.layer}/${d.slug}/`, d]));

  const out = new Map<string, Doc[]>();
  const inb = new Map<string, Doc[]>();
  for (const doc of docs) {
    const seen = new Set<string>();
    const targets: Doc[] = [];
    const mention = (raw: string) => {
      if (/^(https?:|mailto:)/.test(raw)) return;
      const base = raw.split('/').pop()?.toLowerCase();
      const route = base ? map[base] : undefined;
      const target = route ? byRoute.get(route) : undefined;
      if (!target || key(target) === key(doc) || seen.has(key(target))) return;
      seen.add(key(target));
      targets.push(target);
    };
    // Markdown links…
    for (const m of doc.body.matchAll(/\]\(([^)\s#]+)/g)) mention(m[1]);
    // …and bare filenames in inline code, which is how half the library's
    // "pairs with" / "defers to" references are actually written.
    for (const m of doc.body.matchAll(/`([A-Za-z0-9_./-]+\.(?:md|json|py))`/g)) mention(m[1]);

    out.set(key(doc), targets);
    for (const target of targets) {
      // The catalog and README link to every file by definition; counting them
      // as references would drown the signal on every page.
      if (doc.layer === 'guides') continue;
      const list = inb.get(key(target)) ?? [];
      list.push(doc);
      inb.set(key(target), list);
    }
  }

  // A doc referenced by most of the library is boilerplate, not a relation:
  // every setup block says "or invoke MANAGER_INIT.md". There is a clean cliff
  // between that (86% of docs) and the next most-referenced (33%).
  const frequency = new Map<string, number>();
  for (const targets of out.values()) {
    for (const t of targets) frequency.set(key(t), (frequency.get(key(t)) ?? 0) + 1);
  }
  const boilerplate = (d: Doc) => (frequency.get(key(d)) ?? 0) > docs.length / 2;

  graph = new Map(
    docs.map((d) => [
      key(d),
      {
        outbound: (out.get(key(d)) ?? []).filter((t) => !boilerplate(t)),
        inbound: inb.get(key(d)) ?? [],
      },
    ]),
  );
  return graph;
}

export function relations(doc: Doc): Relations {
  return buildGraph().get(key(doc)) ?? { outbound: [], inbound: [] };
}

export type SearchEntry = {
  layer: LayerId;
  slug: string;
  name: string;
  file: string;
  description: string;
  deployedAs: string | null;
};

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
