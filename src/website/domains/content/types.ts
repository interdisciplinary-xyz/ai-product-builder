/**
 * The library's own vocabulary. Types only — no filesystem, no values that
 * could not be shipped to a browser — so the client-safe barrel can re-export
 * them and a client component can still say `type Doc`.
 */

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

export type Relations = { outbound: Doc[]; inbound: Doc[] };

export type Pairing = { role: 'Produces' | 'Produced by'; docs: Doc[] } | null;

export type SearchEntry = {
  layer: LayerId;
  slug: string;
  name: string;
  file: string;
  description: string;
  deployedAs: string | null;
};
