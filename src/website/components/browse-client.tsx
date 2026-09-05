'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { LayerIcon } from '@/components/icons';
import type { LayerId } from '@/lib/content';

export type BrowseLayer = {
  id: LayerId;
  label: string;
  accent: string;
  accentDark: string;
};

export type BrowseItem = {
  layer: LayerId;
  slug: string;
  name: string;
  file: string;
  description: string;
  deployedAs: string | null;
};

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function BrowseClient({
  items,
  layers,
}: {
  items: BrowseItem[];
  layers: BrowseLayer[];
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<LayerId | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // "/" jumps to the filter, the way every doc site worth using does.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement !== input.current) {
        event.preventDefault();
        input.current?.focus();
      }
      if (event.key === 'Escape') {
        setQuery('');
        input.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const byId = useMemo(() => new Map(layers.map((l) => [l.id, l])), [layers]);

  const terms = useMemo(
    () => query.split(/\s+/).filter(Boolean),
    [query],
  );

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

  // Grouping only makes sense on the unranked list; a scored result set is
  // already in its most useful order.
  const grouped = terms.length === 0;

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
            placeholder="Filter by name, description or deployed path…"
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
          ) : (
            <kbd className="mono">/</kbd>
          )}
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

      <div className="ledger">
        {results.map((item, i) => {
          const layer = byId.get(item.layer);
          const startsGroup = grouped && (i === 0 || results[i - 1].layer !== item.layer);
          return (
            <Fragment key={`${item.layer}/${item.slug}`}>
            {startsGroup ? (
              <h2 className="ledger__group">
                <LayerIcon layer={item.layer} />
                <span>{layer?.label}</span>
                <span className="ledger__count mono">
                  {results.filter((r) => r.layer === item.layer).length}
                </span>
              </h2>
            ) : null}
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
            </Fragment>
          );
        })}
        {results.length === 0 ? (
          <div className="empty">
            <p className="mono">Nothing matches “{query}”.</p>
            <button type="button" className="button button--ghost" onClick={() => { setQuery(''); setActive(null); }}>
              Clear filters
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
