'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export type BrowseLayer = {
  id: string;
  label: string;
  icon: string;
  accent: string;
  accentDark: string;
};

export type BrowseItem = {
  layer: string;
  slug: string;
  name: string;
  file: string;
  description: string;
  deployedAs: string | null;
};

export function BrowseClient({
  items,
  layers,
}: {
  items: BrowseItem[];
  layers: BrowseLayer[];
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
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

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((item) => {
      if (active && item.layer !== active) return false;
      if (!terms.length) return true;
      const haystack =
        `${item.name} ${item.file} ${item.description} ${item.deployedAs ?? ''} ${item.layer}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [items, query, active]);

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
          <kbd className="mono">/</kbd>
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
              <span aria-hidden="true">{layer.icon}</span> {layer.label}
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
        {results.map((item) => {
          const layer = byId.get(item.layer);
          return (
            <Link
              key={`${item.layer}/${item.slug}`}
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
              <span className="entry__icon" aria-hidden="true">
                {layer?.icon}
              </span>
              <span className="entry__main">
                <span className="entry__name">{item.name}</span>
                {item.description ? (
                  <span className="entry__desc">{item.description}</span>
                ) : null}
              </span>
              <span className="entry__meta">
                <span>{item.layer}</span>
                {item.deployedAs ? <span>→ {item.deployedAs}</span> : null}
              </span>
            </Link>
          );
        })}
        {results.length === 0 ? (
          <p className="empty mono">
            Nothing matches. The library has no file for that — which is itself an answer.
          </p>
        ) : null}
      </div>
    </>
  );
}
