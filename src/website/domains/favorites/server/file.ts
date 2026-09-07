import fs from 'node:fs';
import path from 'node:path';
import { KEY_SHAPE, MAX_FAVORITES } from '../constants';
import type { FavoriteKey } from '../types';

/**
 * Favorites are a file in the repository: `src/website/data/favorites.json`.
 *
 * That is an unusual place for user state, and it is deliberate. This site is a
 * static export with no server and no accounts, so the alternatives were
 * localStorage — which the reader loses the moment they clear site data — or a
 * database, which needs a login before it saves anything a cookie would not
 * lose anyway. A committed file is the one option that genuinely cannot be
 * lost: it is in git, it moves with a clone, and its history says when each
 * document was marked.
 *
 * The consequence is that this is one list, not one per reader. While the site
 * is undeployed that is exactly right. It stops being right the day it has more
 * than one reader, and at that point this file is the thing to replace.
 */

const FILE = path.join(process.cwd(), 'data', 'favorites.json');

export type FavoritesFile = {
  favorites: FavoriteKey[];
  updated: string | null;
};

const EMPTY: FavoritesFile = { favorites: [], updated: null };

/** Same validation as the client store: shape-checked, deduped, bounded. */
function sanitise(value: unknown): FavoriteKey[] {
  if (!Array.isArray(value)) return [];
  const keys = value.filter(
    (k): k is string => typeof k === 'string' && KEY_SHAPE.test(k),
  );
  return [...new Set(keys)].slice(0, MAX_FAVORITES);
}

export function readFavorites(): FavoritesFile {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const record = (parsed ?? {}) as Partial<FavoritesFile>;
    return {
      favorites: sanitise(record.favorites),
      updated: typeof record.updated === 'string' ? record.updated : null,
    };
  } catch {
    // Missing on a fresh clone, or half-written. An unreadable list is an empty
    // list — the site must never fail to build because nobody has starred
    // anything yet.
    return EMPTY;
  }
}

export function writeFavorites(keys: unknown): FavoritesFile {
  const next: FavoritesFile = {
    favorites: sanitise(keys),
    updated: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  // Trailing newline and two-space indent so a diff is one line per change
  // rather than the whole array on one line.
  fs.writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
