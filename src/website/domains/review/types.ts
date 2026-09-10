import type { ReactNode } from 'react';
import type { Accent } from '@/domains/ui';

/**
 * `<layer>/<slug>` — `runbooks/e2e`. Same shape as a favorites key and the
 * same reason: it is also the tail of the route, so `/review/runbooks/e2e/`
 * and the key it records are each other's inverse.
 *
 * Slugs are NOT unique on their own. MANAGER_A11Y_AUDIT and RUNBOOK_A11Y_AUDIT
 * both slugify to `a11y-audit`, as do decision-log and payments-compliance —
 * three collisions across the library. A one-segment id would silently review
 * the wrong document for six files, which is why the route is a catch-all.
 */
export type ReviewKey = string;

/**
 * The triage decision. Three verdicts, because the question this flow exists
 * to answer is "does this earn its place in the library" — and "yes, but not
 * as written" is the answer often enough that folding it into keep or cut
 * would lose the only interesting part.
 */
export type Verdict = 'keep' | 'cut' | 'rework';

export type ReviewRecord = {
  verdict: Verdict;
  /** Why. Optional, and the whole value of the exercise when it is filled in. */
  note?: string;
  /** ISO timestamp of the decision, so the file's history is legible. */
  at: string;
};

/** The whole file's payload: one record per decided document. */
export type ReviewState = Readonly<Record<ReviewKey, ReviewRecord>>;

/**
 * One document as the review flow sees it. Plain data on purpose — the `review`
 * domain must not import `content` (it would make the graph a diamond for no
 * gain), so the pages pass the corpus down in this shape.
 */
export type ReviewQueueItem = {
  key: ReviewKey;
  name: string;
  href: string;
  /** The document's own route, for reading it outside the review flow. */
  docHref: string;
  description?: string | null;
  /** Right-hand label and `data-layer` value. */
  layer: string;
  layerLabel: string;
  accent?: Accent;
  /** The layer glyph, so a review row reads like every other row on the site. */
  icon?: ReactNode;
  words: number;
};
