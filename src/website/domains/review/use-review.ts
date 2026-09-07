'use client';

import { useSyncExternalStore } from 'react';
import {
  WRITABLE,
  annotate,
  decide,
  getError,
  getServerSnapshot,
  getSnapshot,
  reset,
  subscribe,
  undecide,
} from './store';
import type { ReviewKey } from './types';

export function useReview() {
  const reviews = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Same subscription, so a failed write re-renders whatever can show it.
  const error = useSyncExternalStore(subscribe, getError, () => null);
  return {
    reviews,
    decided: Object.keys(reviews).length,
    recordFor: (key: ReviewKey) => reviews[key],
    writable: WRITABLE,
    error,
    decide,
    annotate,
    undecide,
    reset,
  };
}
