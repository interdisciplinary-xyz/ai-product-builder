import { KEY_SHAPE, MAX_FAVORITES } from './constants';
import type { FavoriteKey } from './types';

/**
 * The list lives in `data/favorites.json`, committed to the repository. This
 * store is a client-side mirror of it: seeded from the file at render time,
 * written back through PUT /api/favorites/ as you click.
 *
 * There is deliberately no localStorage here. Two stores means two answers to
 * the same question, and the whole point of moving to a file was that the
 * browser copy is the one that gets lost.
 *
 * The endpoint only exists when a server does — `output: 'export'` drops it
 * from a production build — so `WRITABLE` is false in a built copy and the UI
 * says the list is read-only instead of pretending a click was saved.
 */

export const WRITABLE = process.env.NODE_ENV !== 'production';

const ENDPOINT = '/api/favorites/';

/** Referentially stable, so `getSnapshot` can run on every render. */
const EMPTY: readonly FavoriteKey[] = Object.freeze([]);

let snapshot: readonly FavoriteKey[] = EMPTY;
let seeded = false;
let error: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function sanitise(keys: readonly string[]): readonly FavoriteKey[] {
  const clean = [...new Set(keys.filter((k) => KEY_SHAPE.test(k)))].slice(0, MAX_FAVORITES);
  return clean.length ? Object.freeze(clean) : EMPTY;
}

/**
 * Called during the render of the layout's hydrator, on the server and again on
 * the client, so both produce the same first snapshot and hydration matches.
 * Idempotent: once a click has changed the list, the file's version is stale
 * and must not overwrite it.
 */
export function seed(keys: readonly string[]) {
  if (seeded) return;
  snapshot = sanitise(keys);
  seeded = true;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): readonly FavoriteKey[] {
  return snapshot;
}

/** The server renders from the same seed, so there is one snapshot, not two. */
export function getServerSnapshot(): readonly FavoriteKey[] {
  return snapshot;
}

export function getError(): string | null {
  return error;
}

/**
 * Optimistic: the star flips immediately and the write follows. If the write
 * fails the list rolls back, because a star that stays lit over a failed save
 * is the exact lie this whole change was meant to remove.
 */
async function persist(next: readonly FavoriteKey[]) {
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
      body: JSON.stringify({ favorites: next }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? `${response.status} ${response.statusText}`);
    }
    const saved = (await response.json()) as { favorites?: string[] };
    snapshot = sanitise(saved.favorites ?? []);
  } catch (cause) {
    error = (cause as Error).message;
    snapshot = previous;
  }
  notify();
}

export function toggle(key: FavoriteKey): void {
  if (!KEY_SHAPE.test(key)) return;
  void persist(
    snapshot.includes(key)
      ? snapshot.filter((k) => k !== key)
      : sanitise([...snapshot, key]),
  );
}

export function clear(): void {
  void persist(EMPTY);
}
