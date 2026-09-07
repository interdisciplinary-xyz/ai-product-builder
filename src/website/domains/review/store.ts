import { KEY_SHAPE, MAX_NOTE, MAX_REVIEWS, VERDICT_IDS } from './constants';
import type { ReviewKey, ReviewRecord, ReviewState, Verdict } from './types';

/**
 * The verdicts live in `data/reviews.json`, committed to the repository. This
 * store is the client-side mirror: seeded from the file during render, written
 * back through PUT /api/review/ as you decide.
 *
 * It is deliberately the same design as `favorites` — file, not localStorage —
 * for a stronger reason. A triage pass over 137 documents is hours of judgment;
 * losing it to cleared site data would mean doing it twice. In a file it is in
 * git, it diffs, and `git log data/reviews.json` says when each call was made.
 *
 * The endpoint only exists when a server does: `output: 'export'` drops route
 * handlers, so `WRITABLE` is false in a built copy and the UI says the pass is
 * read-only rather than accepting a verdict it cannot save.
 */

export const WRITABLE = process.env.NODE_ENV !== 'production';

const ENDPOINT = '/api/review/';

/** Referentially stable, so `getSnapshot` may run on every render. */
const EMPTY: ReviewState = Object.freeze({});

let snapshot: ReviewState = EMPTY;
let seeded = false;
let error: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && (VERDICT_IDS as string[]).includes(value);
}

/** Shape-checked, bounded, and stripped of anything the file should not carry. */
export function sanitise(value: unknown): ReviewState {
  if (!value || typeof value !== 'object') return EMPTY;
  const out: Record<ReviewKey, ReviewRecord> = {};
  let n = 0;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (n >= MAX_REVIEWS) break;
    if (!KEY_SHAPE.test(key)) continue;
    const record = raw as Partial<ReviewRecord> | null;
    if (!record || !isVerdict(record.verdict)) continue;
    const note = typeof record.note === 'string' ? record.note.slice(0, MAX_NOTE).trim() : '';
    out[key] = {
      verdict: record.verdict,
      ...(note ? { note } : {}),
      at: typeof record.at === 'string' ? record.at : new Date(0).toISOString(),
    };
    n += 1;
  }
  return Object.freeze(out);
}

/**
 * Called during the render of the review layout's hydrator, on the server and
 * again on the client, so both produce the same first snapshot and hydration
 * matches.
 *
 * `force` is what makes this correct on the server, and leaving it out was a
 * real bug: this module is one instance for the life of the dev server, so the
 * first request's data stuck. A verdict written through the API was in the
 * file, in the layout's read, and in the props — and every badge still
 * rendered "none", because the guard below had already refused the update.
 *
 * On the client the guard has to stay: once a verdict has been recorded in the
 * browser, the file's copy is the stale one, and a re-render must not undo the
 * click. So the server always re-seeds from the file, and the client seeds once.
 */
export function seed(state: unknown, force = false) {
  if (seeded && !force) return;
  snapshot = sanitise(state);
  seeded = true;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ReviewState {
  return snapshot;
}

/** The server renders from the same seed, so there is one snapshot, not two. */
export function getServerSnapshot(): ReviewState {
  return snapshot;
}

export function getError(): string | null {
  return error;
}

/**
 * Optimistic, and rolled back on failure — a verdict that looks recorded and
 * is not would poison the one artefact this whole flow exists to produce.
 */
async function persist(next: ReviewState) {
  const previous = snapshot;
  snapshot = next;
  error = null;
  notify();

  if (!WRITABLE) {
    error = 'Read-only: this copy was built without the write endpoint.';
    snapshot = previous;
    notify();
    return;
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reviews: next }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? `${response.status} ${response.statusText}`);
    }
    const saved = (await response.json()) as { reviews?: unknown };
    snapshot = sanitise(saved.reviews);
  } catch (cause) {
    error = (cause as Error).message;
    snapshot = previous;
  }
  notify();
}

/** Record or change a verdict, preserving any note already written. */
export function decide(key: ReviewKey, verdict: Verdict): void {
  if (!KEY_SHAPE.test(key)) return;
  const existing = snapshot[key];
  void persist(
    Object.freeze({
      ...snapshot,
      [key]: { ...(existing?.note ? { note: existing.note } : {}), verdict, at: new Date().toISOString() },
    }),
  );
}

/** Attach a reason. A note without a verdict is not a decision, so it is ignored. */
export function annotate(key: ReviewKey, note: string): void {
  const existing = snapshot[key];
  if (!existing) return;
  const clean = note.slice(0, MAX_NOTE).trim();
  if ((existing.note ?? '') === clean) return;
  void persist(
    Object.freeze({
      ...snapshot,
      [key]: { verdict: existing.verdict, ...(clean ? { note: clean } : {}), at: existing.at },
    }),
  );
}

/** Undo one decision, putting the document back in the queue. */
export function undecide(key: ReviewKey): void {
  if (!(key in snapshot)) return;
  const next = { ...snapshot };
  delete next[key];
  void persist(Object.freeze(next));
}

export function reset(): void {
  void persist(EMPTY);
}
