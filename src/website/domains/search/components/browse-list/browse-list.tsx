'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/domains/ui';
import { LayerIcon } from '@/domains/content';
import { FavoriteButton } from '@/domains/favorites';
import type { LayerId } from '@/domains/content';
import type { BrowseItem, BrowseLayer } from './browse-list.constants';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Marks the matched substrings so a row shows why it survived the filter. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length || !text) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig');
  return (
    <>
      {text.split(pattern).map((part, i) =>
        terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function BrowseList({ items, layers }: { items: BrowseItem[]; layers: BrowseLayer[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<LayerId | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // "/" now opens the site-wide palette, which searches sections and tokens as
  // well as this page's rows — two things bound to one key is one too many. This
  // filter keeps Escape, which only means anything while you are inside it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.activeElement === input.current) {
        setQuery('');
        input.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const byId = useMemo(() => new Map(layers.map((l) => [l.id, l])), [layers]);
  const terms = useMemo(() => query.split(/\s+/).filter(Boolean), [query]);

  /**
   * Requiring every term to match sank the obvious queries: "release process"
   * returned CONTRIBUTING and hid RELEASE_MANAGER, because "process" appears in
   * neither its name nor its one-line description. So score instead — any term
   * can match, and where it matches decides the rank.
   */
  const results = useMemo(() => {
    const lowered = terms.map((t) => t.toLowerCase());
    const scoped = items.filter((item) => !active || item.layer === active);
    if (!lowered.length) return scoped;

    return scoped
      .map((item, index) => {
        let score = 0;
        const name = item.name.toLowerCase();
        for (const term of lowered) {
          if (name === term) score += 12;
          else if (name.startsWith(term)) score += 8;
          else if (name.includes(term)) score += 6;
          if (item.file.toLowerCase().includes(term)) score += 3;
          if ((item.deployedAs ?? '').toLowerCase().includes(term)) score += 2;
          if (item.description.toLowerCase().includes(term)) score += 2;
          if (item.layer.includes(term)) score += 1;
        }
        return { item, score, index };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((r) => r.item);
  }, [items, terms, active]);

  // Grouping only helps the unranked list; scored results are already in their
  // most useful order.
  const grouped = terms.length === 0;
  const groups = useMemo(() => {
    if (!grouped) return [];
    const map = new Map<LayerId, BrowseItem[]>();
    for (const item of results) {
      const list = map.get(item.layer) ?? [];
      list.push(item);
      map.set(item.layer, list);
    }
    return [...map.entries()];
  }, [grouped, results]);

  const row = (item: BrowseItem) => {
    const layer = byId.get(item.layer);
    return (
      // The row is a link and the star is a button; a button cannot live inside
      // an anchor, so they are siblings and the <li> carries the rule between
      // rows that .entry would otherwise draw at its own width.
      <li key={`${item.layer}/${item.slug}`} className="entry-row">
        <Link
          href={`/${item.layer}/${item.slug}/`}
          className="entry"
          data-layer={item.layer}
          style={
            {
              '--layer-light': layer?.accent,
              '--layer-dark': layer?.accentDark,
            } as React.CSSProperties
          }
        >
          <span className="entry__icon">
            <LayerIcon layer={item.layer} />
          </span>
          <span className="entry__main">
            <span className="entry__name">
              <Highlight text={item.name} terms={terms} />
            </span>
            {item.description ? (
              <span className="entry__desc">
                <Highlight text={item.description} terms={terms} />
              </span>
            ) : null}
          </span>
          <span className="entry__meta">
            {grouped ? null : <span>{item.layer}</span>}
            {item.deployedAs ? <span>→ {item.deployedAs}</span> : null}
          </span>
        </Link>
        <FavoriteButton doc={item} label={false} />
      </li>
    );
  };

  return (
    <>
      <div className="filters">
        <div className="search">
          <span className="search__icon mono" aria-hidden="true">
            ⌕
          </span>
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter these rows by name, description or deployed path…"
            aria-label="Filter documents"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              className="search__clear mono"
              onClick={() => {
                setQuery('');
                input.current?.focus();
              }}
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="filters__layers" role="group" aria-label="Filter by layer">
          <button
            type="button"
            className="pill"
            aria-pressed={active === null}
            onClick={() => setActive(null)}
          >
            All
          </button>
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className="pill"
              data-layer={layer.id}
              style={
                {
                  '--layer-light': layer.accent,
                  '--layer-dark': layer.accentDark,
                } as React.CSSProperties
              }
              aria-pressed={active === layer.id}
              onClick={() => setActive(active === layer.id ? null : layer.id)}
            >
              <LayerIcon layer={layer.id} /> {layer.label}
            </button>
          ))}
        </div>
      </div>

      <p className="filters__count mono" role="status">
        {results.length} of {items.length} files
        {active ? ` in ${byId.get(active)?.label.toLowerCase()}` : ''}
        {query ? ` matching “${query}”` : ''}
      </p>

      {grouped ? (
        groups.map(([layerId, rows]) => (
          <section key={layerId} aria-labelledby={`group-${layerId}`}>
            <h2 className="ledger__group" id={`group-${layerId}`}>
              <LayerIcon layer={layerId} />
              <span>{byId.get(layerId)?.label}</span>
              <span className="ledger__count mono">{rows.length}</span>
            </h2>
            <ul className="ledger">{rows.map(row)}</ul>
          </section>
        ))
      ) : (
        <ul className="ledger">{results.map(row)}</ul>
      )}

      {results.length === 0 ? (
        <div className="empty">
          <p className="mono">Nothing matches “{query}”.</p>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setQuery('');
              setActive(null);
            }}
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </>
  );
}
