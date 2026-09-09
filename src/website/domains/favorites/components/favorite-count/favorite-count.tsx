'use client';

import { Link } from '@/domains/ui';
import { useFavorites } from '../../use-favorites';

/**
 * The masthead entry appears only once you have a favorite. A permanent link to
 * an empty list is chrome every reader carries for a feature most never use;
 * the nav shifting once, at the moment you create your first one, is feedback.
 *
 * `19` alone said how many without saying out of what — the same number reads
 * very differently against 149 things than against 20. `total` is every
 * markable thing, documents and scenarios both, because a key is
 * `<group>/<id>` and the star does not care which it is on.
 */
export function FavoriteCount({ current, total }: { current?: boolean; total: number }) {
  const { count } = useFavorites();
  if (!count) return null;

  return (
    <Link
      href="/favorites/"
      aria-current={current ? 'page' : undefined}
      // Named on the link rather than hidden text beside it: "19/149" is
      // announced as a date or a fraction depending on the screen reader, and
      // this site has no visually-hidden utility to reach for.
      aria-label={`Favorites — ${count} of ${total} marked`}
    >
      Favorites{' '}
      <span className="mono favcount">
        {count}/{total}
      </span>
    </Link>
  );
}
