import type { FavoriteKey } from './types';

/**
 * No `'use client'` here on purpose. These are pure string functions and the
 * server components that render a star — the document header, every ledger row,
 * every scenario card — have to build its key. Leaving them in the hook module
 * made them client-only, and the export build failed on all 136 document pages
 * with "attempted to call favoriteKey() from the server".
 *
 * A key is `<group>/<id>`, which is also the route, so these two are each
 * other's inverse and neither needs to know what a document or a topic is.
 */
export function favoriteKey(group: string, id: string): FavoriteKey {
  return `${group}/${id}`;
}

export function hrefForKey(key: FavoriteKey): string {
  return `/${key}/`;
}
