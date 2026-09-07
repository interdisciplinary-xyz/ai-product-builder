import fs from 'node:fs';
import path from 'node:path';
import { sanitise } from '../store';
import type { ReviewState } from '../types';

/**
 * The review pass is a file in the repository: `src/website/data/reviews.json`.
 *
 * Same argument as favorites, with more at stake. Reading 137 documents and
 * deciding which of them earn their place is the expensive part; the verdicts
 * are cheap to store and painful to redo. A committed file cannot be lost, and
 * it diffs — so the pass has a history, and a verdict that changed says so.
 *
 * `sanitise` is shared with the client store rather than reimplemented here.
 * Two copies of a validator drift, and the first symptom is a file the browser
 * accepts and the build rejects.
 */

const FILE = path.join(process.cwd(), 'data', 'reviews.json');

export type ReviewsFile = {
  reviews: ReviewState;
  updated: string | null;
};

const EMPTY: ReviewsFile = { reviews: Object.freeze({}), updated: null };

export function readReviews(): ReviewsFile {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const record = (parsed ?? {}) as Partial<ReviewsFile>;
    return {
      reviews: sanitise(record.reviews),
      updated: typeof record.updated === 'string' ? record.updated : null,
    };
  } catch {
    // Missing on a fresh clone, or half-written. An unreadable pass is an empty
    // pass — the site must never fail to build because nobody has started one.
    return EMPTY;
  }
}

export function writeReviews(state: unknown): ReviewsFile {
  const next: ReviewsFile = { reviews: sanitise(state), updated: new Date().toISOString() };
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  // Two-space indent and a trailing newline, and keys sorted, so a diff is the
  // verdict that changed rather than the whole object reordering itself.
  const sorted = Object.fromEntries(
    Object.entries(next.reviews).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(FILE, `${JSON.stringify({ ...next, reviews: sorted }, null, 2)}\n`);
  return next;
}
