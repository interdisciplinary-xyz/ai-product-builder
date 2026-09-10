'use client';

import { seed } from '../../store';
import type { ReviewState } from '../../types';

/**
 * Seeds the store from the file DURING render, not in an effect.
 *
 * The favorites version of this shipped 9 of 171 pages without their count
 * because it rendered after the component that read the store. Doing the work
 * in the component body means the seed has happened before any sibling reads
 * a snapshot, on the server and on the client alike, so the two agree and
 * hydration does not warn. It renders nothing.
 */
export function ReviewHydrator({ initial }: { initial: ReviewState }) {
  // Forced on the server, where this module outlives the request and the file
  // is the only truth; guarded on the client, where a click is newer than the
  // file. See `seed`.
  seed(initial, typeof window === 'undefined');
  return null;
}
