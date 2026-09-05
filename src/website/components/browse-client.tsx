'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

  const results = useMemo(() => {
    const lowered = terms.map((t) => t.toLowerCase());
    return items.filter((item) => {
      if (active && item.layer !== active) return false;
      if (!lowered.length) return true;
      const haystack =
        `${item.name} ${item.file} ${item.description} ${item.deployedAs ?? ''} ${item.layer}`.toLowerCase();
      return lowered.every((term) => haystack.includes(term));
    });
  }, [items, terms, active]);

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
                <span>{item.layer}</span>
                {item.deployedAs ? <span>→ {item.deployedAs}</span> : null}
              </span>
            </Link>
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
