/**
 * `review` — a triage pass over the library, recorded in `data/reviews.json`
 * and committed with the repository.
 *
 * It answers one question per document: does this earn its place — keep,
 * rework, or cut — and why. The verdicts are the expensive part of a cleanup;
 * putting them in a file rather than a browser means the pass survives, diffs,
 * and can be picked up by whoever does the deleting.
 *
 * A key is `<layer>/<slug>`, which is also the tail of the route, so nothing
 * on this client-safe surface needs to know what a document is — the pages
 * pass the corpus down as `ReviewQueueItem`s, plain data. Only `./server`
 * reaches `content` to build that queue, and this barrel does not re-export it.
 */
export * from './components';
export { useReview } from './use-review';
export { reviewKey, reviewHref } from './keys';
export { WRITABLE } from './store';
export { VERDICTS, MAX_NOTE, MAX_REVIEWS } from './constants';
export type { ReviewKey, Verdict, ReviewRecord, ReviewState, ReviewQueueItem } from './types';
