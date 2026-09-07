'use client';

import { useSyncExternalStore } from 'react';
import { docHref, type Doc } from '@/domains/content';
import {
  WRITABLE,
  clear,
  getError,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  toggle,
} from './store';
import type { FavoriteKey } from './types';

/** The key a document is stored under. The route is derived from it, not stored. */
export function favoriteKey(doc: Pick<Doc, 'layer' | 'slug'>): FavoriteKey {
  return `${doc.layer}/${doc.slug}`;
}

/** `runbooks/e2e` → `/runbooks/e2e/`, without needing the document itself. */
export function hrefForKey(key: FavoriteKey): string {
  const [layer, slug] = key.split('/');
  return docHref({ layer: layer as Doc['layer'], slug });
}

export function useFavorites() {
  const keys = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // The error is read through the same subscription, so a failed write
  // re-renders the components that could show it.
  const error = useSyncExternalStore(subscribe, getError, () => null);
  return {
    keys,
    count: keys.length,
    has: (key: FavoriteKey) => keys.includes(key),
    writable: WRITABLE,
    error,
    toggle,
    clear,
  };
}
