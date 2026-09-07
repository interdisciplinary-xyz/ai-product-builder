'use client';

import { useSyncExternalStore } from 'react';
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

export function useFavorites() {
  const keys = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Read through the same subscription, so a failed write re-renders whatever
  // could show it.
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
