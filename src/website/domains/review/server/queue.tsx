import { LAYER_BY_ID, LayerIcon, docHref } from '@/domains/content';
import { allDocs } from '@/domains/content/server';
import { reviewKey, reviewHref } from '../keys';
import type { ReviewQueueItem } from '../types';

/**
 * The corpus, in the order the pass walks it: layer by layer, name by name —
 * the same order as `/browse`, so the queue matches the index somebody has
 * already been reading.
 *
 * `guides` is excluded. README, CATALOG and CONTRIBUTING describe the library
 * rather than being part of it; asking whether CONTRIBUTING earns its place is
 * not the question this pass exists to answer, and the site's own file count
 * leaves them out for the same reason.
 *
 * This lives on the server surface so that the client-safe `review` barrel
 * never reaches the filesystem, and so both review routes build the queue the
 * same way — two copies would drift the moment one of them learned to sort.
 */
export function reviewQueue(): ReviewQueueItem[] {
  return allDocs()
    .filter((doc) => doc.layer !== 'guides')
    .map((doc) => {
      const layer = LAYER_BY_ID.get(doc.layer);
      const key = reviewKey(doc.layer, doc.slug);
      return {
        key,
        name: doc.name,
        href: reviewHref(key),
        docHref: docHref(doc),
        description: doc.description ?? doc.heading,
        layer: doc.layer,
        layerLabel: layer?.label ?? doc.layer,
        accent: layer,
        icon: <LayerIcon layer={doc.layer} />,
        words: doc.words,
      };
    });
}
