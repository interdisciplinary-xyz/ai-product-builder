'use client';

import { seed } from '../../store';

/**
 * Seeds the store from the committed file, during render rather than in an
 * effect: the layout renders above every page, so by the time a star asks for
 * the snapshot it is already the file's contents — on the server and on the
 * client alike, which is what keeps hydration matching.
 *
 * It renders nothing. It exists because a server component cannot call into a
 * client module, and the file can only be read on the server.
 */
export function FavoritesHydrator({ initial }: { initial: string[] }) {
  seed(initial);
  return null;
}
