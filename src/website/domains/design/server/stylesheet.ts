import fs from 'node:fs';
import path from 'node:path';
import type { Token, TokenGroup } from '../types';

/**
 * The design system page reads the stylesheet, rather than restating it.
 *
 * A style guide that keeps its own copy of the palette is wrong within a week —
 * and this site's whole claim is that it is a *view* of its source, not a copy.
 * So the swatches, the values and the counts below are parsed out of
 * app/globals.css at build time. Change a token, rebuild, and the page follows.
 */

const STYLESHEET = path.join(process.cwd(), 'app', 'globals.css');

function source(): string {
  try {
    return fs.readFileSync(STYLESHEET, 'utf8');
  } catch {
    return '';
  }
}

/** Custom properties out of one `:root { … }` body, with their doc comments. */
function readBlock(block: string): { order: string[]; values: Map<string, string>; notes: Map<string, string> } {
  const order: string[] = [];
  const values = new Map<string, string>();
  const notes = new Map<string, string>();
  let pending: string | null = null;

  // Comments and declarations, in document order, so a /* … */ can be attached
  // to the declaration it introduces.
  const pattern = /\/\*([\s\S]*?)\*\/|(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  for (const match of block.matchAll(pattern)) {
    if (match[1] !== undefined) {
      pending = match[1]
        .split('\n')
        .map((line) => line.trim().replace(/^\*+\s?/, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      continue;
    }
    const name = match[2];
    order.push(name);
    values.set(name, match[3].trim());
    if (pending) {
      notes.set(name, pending);
      pending = null;
    }
  }
  return { order, values, notes };
}

/** The body of the first `:root { … }`, and of the dark-scheme one. */
function rootBlocks(css: string): { light: string; dark: string } {
  const lightStart = css.indexOf(':root {');
  const light = lightStart === -1 ? '' : css.slice(lightStart, css.indexOf('\n}', lightStart));

  const darkAt = css.indexOf('@media (prefers-color-scheme: dark)');
  const darkRoot = darkAt === -1 ? -1 : css.indexOf(':root {', darkAt);
  const dark = darkRoot === -1 ? '' : css.slice(darkRoot, css.indexOf('\n  }', darkRoot));

  return { light, dark };
}

/**
 * Which group a token belongs to, by prefix. Anything unmatched still shows —
 * under "Everything else" — because a token invented tomorrow should appear on
 * this page without anyone remembering to come back and file it.
 */
const GROUPS: { id: string; label: string; blurb: string; match: (name: string) => boolean }[] = [
  {
    id: 'surface',
    label: 'Surfaces',
    blurb:
      'The ground is white, so elevation runs downward: a “raised” surface sits a shade off the page rather than above it, and every one carries a hairline rule instead of a shadow.',
    match: (n) => n.startsWith('--paper'),
  },
  {
    id: 'ink',
    label: 'Ink',
    blurb:
      'Three weights of text, warm rather than neutral. Anything fainter than --ink-faint fails contrast against the ground and does not exist.',
    match: (n) => n.startsWith('--ink'),
  },
  {
    id: 'rule',
    label: 'Rules',
    blurb:
      'The page is divided by hairlines, not by boxes or shadows. --rule separates; --rule-strong encloses something you can interact with.',
    match: (n) => n.startsWith('--rule'),
  },
  {
    id: 'accent',
    label: 'Accent',
    blurb:
      'One accent for the whole site — vermilion — plus a per-layer and per-topic hue set on --layer. If something needs a colour that is not one of these, it does not need a colour.',
    match: (n) => n.startsWith('--accent') || n === '--shadow',
  },
  {
    id: 'layout',
    label: 'Layout',
    blurb:
      'The frame runs the full viewport; only the reading measure is capped. --masthead-h is authoritative because every sticky offset on the site is derived from it.',
    match: (n) =>
      ['--masthead-pad', '--masthead-h', '--measure', '--gutter', '--shell-max', '--rail'].includes(n),
  },
];
let cache: TokenGroup[] | null = null;

export function tokenGroups(): TokenGroup[] {
  if (cache) return cache;
  const { light, dark } = rootBlocks(source());
  const parsed = readBlock(light);
  const darkValues = readBlock(dark).values;

  const toToken = (name: string): Token => ({
    name,
    light: parsed.values.get(name) ?? '',
    dark: darkValues.get(name) ?? null,
    note: parsed.notes.get(name) ?? null,
  });

  const filed = new Set<string>();
  const groups: TokenGroup[] = GROUPS.map((group) => {
    const tokens = parsed.order.filter((name) => group.match(name));
    tokens.forEach((name) => filed.add(name));
    return { id: group.id, label: group.label, blurb: group.blurb, tokens: tokens.map(toToken) };
  }).filter((group) => group.tokens.length);

  const rest = parsed.order.filter((name) => !filed.has(name));
  if (rest.length) {
    groups.push({
      id: 'rest',
      label: 'Everything else',
      blurb: 'Declared on :root but not yet filed into a group above.',
      tokens: rest.map(toToken),
    });
  }

  cache = groups;
  return groups;
}

/**
 * The type scale, read off :root — the same source `pnpm type:check` enforces,
 * so the specimen page cannot show a step the stylesheet does not have. Split
 * by family, in declaration order, because the order IS the scale.
 */
export function typeScale(): Record<'text' | 'display' | 'leading' | 'tracking', Token[]> {
  const { light, dark } = rootBlocks(source());
  const parsed = readBlock(light);
  const darkValues = readBlock(dark).values;
  const out = { text: [], display: [], leading: [], tracking: [] } as Record<
    'text' | 'display' | 'leading' | 'tracking',
    Token[]
  >;
  for (const name of parsed.order) {
    const family = (['text', 'display', 'leading', 'tracking'] as const).find((f) =>
      name.startsWith(`--${f}-`),
    );
    if (!family) continue;
    out[family].push({
      name,
      light: parsed.values.get(name) ?? '',
      dark: darkValues.get(name) ?? null,
      note: parsed.notes.get(name) ?? null,
    });
  }
  return out;
}

/** True for a value this page can paint as a swatch rather than print. */
export function isColour(value: string): boolean {
  return /^#|^rgb|^hsl|^color-mix/.test(value);
}

/**
 * Numbers about the stylesheet, counted rather than claimed — the same standard
 * the library holds its own documents to.
 */
export function stylesheetFacts() {
  const css = source();
  const lines = css ? css.split('\n').length : 0;
  const declarations = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
  const classes = new Set([...css.matchAll(/^\.([a-z][a-z0-9_-]*)/gim)].map((m) => m[1]));
  const queries = new Set([...css.matchAll(/@media\s*\(([^)]+)\)/g)].map((m) => m[1].trim()));
  const breakpoints = [...queries]
    .map((q) => q.match(/(min|max)-width:\s*([\d.]+)rem/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => ({ kind: m[1], rem: Number(m[2]) }))
    .sort((a, b) => a.rem - b.rem);

  return {
    lines,
    properties: declarations.size,
    classes: classes.size,
    breakpoints: [...new Map(breakpoints.map((b) => [`${b.kind}${b.rem}`, b])).values()],
    /** No framework, no preprocessor, no utility layer — one hand-written file. */
    files: 1,
  };
}
