import type { ReviewKey } from './types';

/**
 * No `'use client'`, for the reason favorites/keys.ts records: server
 * components build these keys while rendering, and a client-only module makes
 * the static export fail on every document page.
 */
export function reviewKey(layer: string, slug: string): ReviewKey {
  return `${layer}/${slug}`;
}

/** The review route for a key. `docId` is the key, spelled across two segments. */
export function reviewHref(key: ReviewKey): string {
  return `/review/${key}/`;
}
