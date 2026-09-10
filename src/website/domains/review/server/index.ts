/**
 * `review/server` — the Node-only surface: the verdict file on disk, and the
 * queue built from the corpus.
 *
 * Not re-exported from `@/domains/review`; a client component importing this
 * would pull `node:fs` and the whole library into the browser bundle. See
 * RUNBOOK_DOMAIN_ARCHITECTURE §5.
 */
export { readReviews, writeReviews, type ReviewsFile } from './file';
export { reviewQueue } from './queue';
