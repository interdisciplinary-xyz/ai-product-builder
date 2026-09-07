'use client';

import { Link, accentStyle } from '@/domains/ui';
import { FavoriteButton } from '../favorite-button';
import { useFavorites } from '../../use-favorites';
import type { FavoriteGroup } from '../../types';

/**
 * The page hands in every markable thing, grouped and pre-rendered — rows carry
 * their own href, tag and icon. Doing it that way is what lets this domain
 * depend on `ui` alone: it never learns what a document or a topic is, so
 * `content` is free to import the star for its own DocEntry.
 *
 * The list is the intersection with what has been marked, so a key for
 * something that has since left the library simply does not match rather than
 * rendering a row that 404s.
 */
export function FavoriteList({ groups }: { groups: FavoriteGroup[] }) {
  const { keys, count, clear, writable, error } = useFavorites();

  const shown = groups
    .map((group) => ({ ...group, rows: group.rows.filter((row) => keys.includes(row.key)) }))
    .filter((group) => group.rows.length);
  const total = shown.reduce((n, g) => n + g.rows.length, 0);
  const missing = count - total;

  if (!count) {
    return (
      <div className="favempty">
        <p className="favempty__lede">Nothing marked yet.</p>
        <p>
          Every document page carries a star beside its title, every row in a ledger carries one,
          and so does every scenario on the front page. Marking something rewrites{' '}
          <code>data/favorites.json</code>, which you then commit like any other change — so the
          list travels with the repository rather than with a browser.
        </p>
        <p>
          <Link href="/topics/">Start from a scenario</Link> or <Link href="/browse/">browse</Link>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="favlist__head">
        <p className="eyebrow">
          {total} {total === 1 ? 'item' : 'items'}
          {writable ? null : <span className="favlist__ro"> · read-only build</span>}
        </p>
        {writable ? (
          <button type="button" className="favlist__clear mono" onClick={clear}>
            Clear all
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="favlist__error mono" role="status">
          Not saved — {error}
        </p>
      ) : null}

      {shown.map((group) => (
        <section key={group.label} className="favgroup">
          <h2 className="ledger__group favgroup__head">
            {group.label}
            <span className="mono">{group.rows.length}</span>
          </h2>
          <ul className="favlist">
            {group.rows.map((row) => (
              <li
                key={row.key}
                data-layer={row.tone}
                data-topic={row.tone}
                style={accentStyle(row.accent)}
              >
                <Link href={row.href} className="favlist__doc">
                  {row.icon ? <span className="favlist__icon">{row.icon}</span> : null}
                  <span className="favlist__main">
                    <span className="favlist__name mono">{row.name}</span>
                    {row.description ? (
                      <span className="favlist__desc">{row.description}</span>
                    ) : null}
                  </span>
                  {row.tag ? <span className="favlist__layer mono">{row.tag}</span> : null}
                </Link>
                <FavoriteButton item={row} label={false} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {missing > 0 ? (
        <p className="favlist__missing">
          {missing} marked {missing === 1 ? 'item is' : 'items are'} no longer in the library.
          Clearing removes them.
        </p>
      ) : null}
    </>
  );
}
