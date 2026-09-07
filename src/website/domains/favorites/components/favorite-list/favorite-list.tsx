'use client';

import { Link } from '@/domains/ui';
import { LayerIcon, docHref, LAYER_BY_ID } from '@/domains/content';
import type { FavoriteDoc } from '../../types';
import { FavoriteButton } from '../favorite-button';
import { favoriteKey, useFavorites } from '../../use-favorites';

/**
 * The whole corpus is handed in from the page — ~130 rows of name and
 * description, the same payload /browse already ships — and the list is the
 * intersection with what this browser has marked. Doing it this way means a key
 * for a document that has since left the library simply does not match, rather
 * than rendering a row that 404s.
 */
export function FavoriteList({ docs }: { docs: FavoriteDoc[] }) {
  const { keys, count, clear, writable, error } = useFavorites();
  const marked = keys.length ? docs.filter((doc) => keys.includes(favoriteKey(doc))) : [];
  const missing = count - marked.length;

  if (!count) {
    return (
      <div className="favempty">
        <p className="favempty__lede">Nothing marked yet.</p>
        <p>
          Every document page carries a star beside its title, and every row in browse carries
          one too. Marking a document rewrites <code>data/favorites.json</code>, which you then
          commit like any other change — so the list travels with the repository rather than with
          a browser.
        </p>
        <p>
          <Link href="/topics/">Start from a topic</Link> or{' '}
          <Link href="/browse/">browse all {docs.length} files</Link>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="favlist__head">
        <p className="eyebrow">
          {marked.length} {marked.length === 1 ? 'document' : 'documents'}
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

      <ul className="favlist">
        {marked.map((doc) => {
          const layer = LAYER_BY_ID.get(doc.layer);
          return (
            <li key={favoriteKey(doc)} data-layer={doc.layer}>
              <Link href={docHref(doc)} className="favlist__doc">
                <span className="favlist__icon">
                  <LayerIcon layer={doc.layer} />
                </span>
                <span className="favlist__main">
                  <span className="favlist__name mono">{doc.name}</span>
                  {doc.description ? (
                    <span className="favlist__desc">{doc.description}</span>
                  ) : null}
                </span>
                <span className="favlist__layer mono">{layer?.label ?? doc.layer}</span>
              </Link>
              <FavoriteButton doc={doc} label={false} />
            </li>
          );
        })}
      </ul>

      {missing > 0 ? (
        <p className="favlist__missing">
          {missing} marked {missing === 1 ? 'document is' : 'documents are'} no longer in the
          library. Clearing removes them.
        </p>
      ) : null}
    </>
  );
}
