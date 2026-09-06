'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/components/link';

export type TokenRow = {
  name: string;
  meaning: string | null;
  example: string | null;
  registered: boolean;
  docs: { layer: string; slug: string; name: string }[];
};

type Facet = 'all' | 'shared' | 'unregistered';

/** «PROJECT» wants 71 documents. Printing all of them buries the next token. */
const INLINE_DOCS = 8;

const FACETS: { id: Facet; label: string; note: string }[] = [
  { id: 'all', label: 'All', note: 'every repo-wide token' },
  { id: 'shared', label: 'Shared', note: 'used by two or more documents' },
  { id: 'unregistered', label: 'Not in the glossary', note: 'no row in PLACEHOLDERS.md' },
];

function DocList({ docs }: { docs: TokenRow['docs'] }) {
  const links = (list: TokenRow['docs']) => (
    <ul className="tokenrow__docs">
      {list.map((doc) => (
        <li key={`${doc.layer}/${doc.slug}`}>
          <Link href={`/${doc.layer}/${doc.slug}/`} className="mono">
            {doc.name}
          </Link>
        </li>
      ))}
    </ul>
  );

  if (docs.length <= INLINE_DOCS) return links(docs);

  return (
    <>
      {links(docs.slice(0, INLINE_DOCS))}
      <details className="tokenrow__more">
        <summary>{docs.length - INLINE_DOCS} more</summary>
        {links(docs.slice(INLINE_DOCS))}
      </details>
    </>
  );
}

export function TokensClient({ rows }: { rows: TokenRow[] }) {
  const [query, setQuery] = useState('');
  const [facet, setFacet] = useState<Facet>('all');

  const counts = useMemo(
    () => ({
      all: rows.length,
      shared: rows.filter((r) => r.docs.length > 1).length,
      unregistered: rows.filter((r) => !r.registered).length,
    }),
    [rows],
  );

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/[«»]/g, '');
    return rows.filter((row) => {
      if (facet === 'shared' && row.docs.length < 2) return false;
      if (facet === 'unregistered' && row.registered) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        (row.meaning ?? '').toLowerCase().includes(needle) ||
        row.docs.some((d) => d.name.toLowerCase().includes(needle))
      );
    });
  }, [rows, query, facet]);

  return (
    <>
      <div className="filters">
        <div className="search">
          <span className="search__icon mono" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by token, meaning or document…"
            aria-label="Filter placeholders"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button type="button" className="search__clear mono" onClick={() => setQuery('')}>
              Clear
            </button>
          ) : null}
        </div>

        <div className="filters__layers" role="group" aria-label="Filter placeholders">
          {FACETS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="pill"
              aria-pressed={facet === f.id}
              title={f.note}
              onClick={() => setFacet(f.id)}
            >
              {f.label} <span className="mono">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="filters__count mono" role="status">
        {shown.length} of {rows.length} tokens
        {query ? ` matching “${query}”` : ''}
      </p>

      <div className="tokentable">
        {shown.map((row) => (
          <div className="tokenrow" key={row.name} id={`token-${encodeURIComponent(row.name)}`}>
            <div className="tokenrow__head">
              <code className="token">«{row.name}»</code>
              {row.registered ? null : (
                <span className="tokenrow__flag mono" title="No row in meta/PLACEHOLDERS.md">
                  unregistered
                </span>
              )}
            </div>
            <div className="tokenrow__body">
              <p className="tokenrow__meaning">
                {row.meaning ?? (
                  <span className="tokenrow__nomeaning">
                    Defined only where it is used — the glossary has no row for it.
                  </span>
                )}
                {row.example ? <span className="tokenrow__example mono">e.g. {row.example}</span> : null}
              </p>
              <DocList docs={row.docs} />
            </div>
          </div>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <p className="mono">No token matches “{query}”.</p>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setQuery('');
              setFacet('all');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </>
  );
}
