'use client';

import { Icon } from '@/domains/ui';
import { useFavorites } from '../../use-favorites';
import type { FavoriteItem } from '../../types';

/**
 * Marks anything with a key — a document, a scenario, whatever gets a route
 * next. It writes through to `data/favorites.json`; where there is no endpoint
 * to write to (a production build drops it, because the site exports to static
 * files) the button is disabled and says why. A star that flips and saves
 * nothing is the failure this feature was moved off localStorage to avoid.
 */
export function FavoriteButton({ item, label = true }: { item: FavoriteItem; label?: boolean }) {
  const { has, toggle, writable } = useFavorites();
  const marked = has(item.key);

  const title = !writable
    ? `Read-only: this build has no write endpoint, so ${item.name} cannot be marked here.`
    : marked
      ? `Remove ${item.name} from favorites`
      : `Add ${item.name} to favorites`;

  return (
    <button
      type="button"
      className={label ? 'favbutton' : 'favbutton favbutton--icon'}
      aria-pressed={marked}
      disabled={!writable}
      onClick={() => toggle(item.key)}
      title={title}
    >
      {/* The one filled glyph in the set. A star that only ever outlines cannot
          be read at a glance in a list, which is the whole job here. */}
      <Icon className="favbutton__icon">
        <path
          d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85L12 3.6Z"
          fill={marked ? 'currentColor' : 'none'}
        />
      </Icon>
      {label ? <span className="favbutton__label">{marked ? 'Favorited' : 'Favorite'}</span> : null}
    </button>
  );
}
