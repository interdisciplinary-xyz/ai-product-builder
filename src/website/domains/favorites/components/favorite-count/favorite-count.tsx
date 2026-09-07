'use client';

import { Link } from '@/domains/ui';
import { useFavorites } from '../../use-favorites';

/**
 * The masthead entry appears only once you have a favorite. A permanent link to
 * an empty list is chrome every reader carries for a feature most never use;
 * the nav shifting once, at the moment you create your first one, is feedback.
 */
export function FavoriteCount({ current }: { current?: boolean }) {
  const { count } = useFavorites();
  if (!count) return null;

  return (
    <Link href="/favorites/" aria-current={current ? 'page' : undefined}>
      Favorites <span className="mono favcount">{count}</span>
    </Link>
  );
}
