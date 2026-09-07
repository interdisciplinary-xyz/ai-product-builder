import type { Doc } from '@/domains/content';

/** `layer/slug` — the same key the topic map and the link graph use. */
export type FavoriteKey = string;

/**
 * What a favorite row actually renders. Narrower than `Doc` on purpose: the
 * /favorites page has to ship the whole corpus to the browser so the client can
 * intersect it, and a full `Doc` carries repoPath, headings, word counts and an
 * empty body placeholder that no row ever reads.
 */
export type FavoriteDoc = Pick<Doc, 'layer' | 'slug' | 'name' | 'description'>;
