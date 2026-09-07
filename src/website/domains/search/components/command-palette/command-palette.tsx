'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayerIcon } from '@/domains/content';
import { OPEN_EVENT } from '../../constants';
import {
  GROUP_LABEL,
  LIMITS,
  type Hit,
  type Index,
  type Jump,
} from './command-palette.constants';

/**
 * One search gesture for the whole library, from any page.
 *
 * The filter on /browse only ever saw names and one-line descriptions — fine
 * for finding a file you can already name, useless for the question a reader
 * actually arrives with ("what is the axe gate?", "where do I put «DB_URI»?").
 * Those answers are section headings and placeholder tokens, so this searches
 * all three and says which kind each hit is.
 *
 * The index is ~150 kB and is therefore fetched on first open, not shipped with
 * every page.
 */

function useIndex(open: boolean) {
  const [index, setIndex] = useState<Index | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!open || started.current) return;
    started.current = true;
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Index | null) => data && setIndex(data))
      .catch(() => {
        // A failed index leaves the palette in its "jump to" state, which is
        // still useful. Nothing to report to the reader.
        started.current = false;
      });
  }, [open]);

  return index;
}

/**
 * Word-segment matching, not substring matching. `name.includes(term)` ranked
 * PRICING_STRATEGY and TESTING_STRATEGY above the "Rate Limiting" section for
 * the query "rate limit", because both contain "st-rate-gy". A term that lands
 * on a whole segment of a name is a real hit; one that lands mid-word is noise
 * and scores accordingly.
 */
function segmentsOf(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Every runbook has a "Scope" and a "Related docs". Matching a section title
 * that 40 documents share tells the reader nothing about which one they want,
 * so a title's ubiquity is subtracted from its score.
 */
let titleFrequency: Map<string, number> | null = null;
function frequencyOf(index: Index, title: string): number {
  if (!titleFrequency) {
    titleFrequency = new Map();
    for (const [, , , text] of index.headings) {
      const key = text.toLowerCase();
      titleFrequency.set(key, (titleFrequency.get(key) ?? 0) + 1);
    }
  }
  return titleFrequency.get(title.toLowerCase()) ?? 1;
}

function search(index: Index, query: string): Hit[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  // "cut a release" — the "a" matches half the library and drags the coverage
  // multiplier down for the documents that answer the actual question. Single
  // LETTERS are dropped once there is something else to go on; single digits
  // are not, because "article 9" means what it says.
  const terms = words.length > 1 ? words.filter((w) => !/^[a-z]$/.test(w)) : words;
  if (!terms.length) return [];
  const hits: Hit[] = [];

  for (const doc of index.docs) {
    const name = doc.n.toLowerCase();
    const desc = doc.d.toLowerCase();
    const segments = segmentsOf(doc.n);
    let score = 0;
    let matched = 0;

    for (const term of terms) {
      let points = 0;
      if (name === term) points = 40;
      else if (segments.includes(term)) points = 28;
      else if (segments.some((s) => s.startsWith(term))) points = 18;
      else if (name.includes(term)) points = 5;
      if (desc.includes(term)) points += 6;
      if ((doc.p ?? '').toLowerCase().includes(term)) points += 4;
      if (doc.l.includes(term)) points += 2;
      if (points) matched += 1;
      score += points;
    }

    // A two-word query answered by one word is half an answer: scale by how
    // much of what was asked actually landed.
    if (matched) {
      hits.push({
        kind: 'doc',
        href: `/${doc.l}/${doc.s}/`,
        title: doc.n,
        detail: doc.d,
        layer: doc.l,
        score: (score * matched) / terms.length,
      });
    }
  }

  for (const [layer, slug, id, text, docName] of index.headings) {
    const lowered = text.toLowerCase();
    const segments = segmentsOf(text);
    let score = 0;
    let matched = 0;

    for (const term of terms) {
      let points = 0;
      if (segments.includes(term)) points = 22;
      else if (segments.some((s) => s.startsWith(term))) points = 14;
      else if (lowered.includes(term)) points = 5;
      if (points) matched += 1;
      score += points;
    }

    // A section earns its place only by answering the WHOLE query — otherwise
    // one common word drags in a hundred headings.
    if (matched === terms.length) {
      hits.push({
        kind: 'section',
        href: `/${layer}/${slug}/#${id}`,
        title: text,
        detail: docName,
        layer,
        score: score - Math.min(14, frequencyOf(index, text)),
      });
    }
  }

  for (const token of index.tokens) {
    const name = token.n.toLowerCase();
    const segments = segmentsOf(token.n);
    let score = 0;
    let matched = 0;

    for (const term of terms) {
      const bare = term.replace(/[«»]/g, '');
      if (!bare) continue;
      // Deliberately below the document and section bands: a token named
      // «ANTI_ABUSE_RATE_LIMIT» matched "rate limit" on both segments and beat
      // the Rate Limiting section, which is not what anyone typing that wants.
      // A query that IS a token name still wins on the exact-match bonus.
      let points = 0;
      if (name === bare) points = 30;
      else if (segments.includes(bare)) points = 12;
      else if (segments.some((s) => s.startsWith(bare))) points = 8;
      else if (name.includes(bare)) points = 3;
      if (token.m?.toLowerCase().includes(bare)) points += 3;
      if (points) matched += 1;
      score += points;
    }

    if (matched) {
      hits.push({
        kind: 'token',
        href: `/tokens/#token-${encodeURIComponent(token.n)}`,
        title: `«${token.n}»`,
        detail: token.m ?? `Used in ${token.c} document${token.c === 1 ? '' : 's'}`,
        score: (score * matched) / terms.length,
      });
    }
  }

  // Rank within a kind and cap each kind, so one prolific kind cannot bury the
  // others. Then order the GROUPS by their strongest hit: "rate limit" is best
  // answered by a section, and a fixed documents-first order would have put six
  // weaker documents above it.
  const groups = (['doc', 'section', 'token'] as const)
    .map((kind) =>
      hits
        .filter((h) => h.kind === kind)
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
        .slice(0, LIMITS[kind]),
    )
    .filter((group) => group.length)
    .sort((a, b) => b[0].score - a[0].score);

  return groups.flat();
}

export function CommandPalette({ jumps }: { jumps: Jump[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const index = useIndex(open);

  const results = useMemo<Hit[]>(() => {
    if (!query.trim()) {
      return jumps.map((j) => ({ ...j, kind: 'doc' as const, score: 0 }));
    }
    return index ? search(index, query) : [];
  }, [index, query, jumps]);

  const openFrom = useCallback((from: HTMLElement | null) => {
    restoreTo.current = from;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    restoreTo.current?.focus();
  }, []);

  const go = useCallback(
    (hit: Hit) => {
      close();
      router.push(hit.href);
    },
    [close, router],
  );

  /* Opening: ⌘K / Ctrl-K anywhere, and "/" when you are not already typing. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');
      const combo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (combo || (event.key === '/' && !typing && !open)) {
        event.preventDefault();
        openFrom(document.activeElement as HTMLElement);
      }
    };
    const onRequest = () => openFrom(document.activeElement as HTMLElement);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_EVENT, onRequest);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_EVENT, onRequest);
    };
  }, [open, openFrom]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  // The active row has to stay in view when you arrow past the fold.
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, results]);

  // A modal over a scrollable page: freeze the page, or the wheel scrolls it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (event.key === 'Enter' && results[cursor]) {
      event.preventDefault();
      go(results[cursor]);
    }
  };

  let lastKind: Hit['kind'] | null = null;

  return (
    <div
      className="palette"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div className="palette__box" role="dialog" aria-modal="true" aria-label="Search the library">
        <div className="palette__field">
          <span className="palette__icon mono" aria-hidden="true">
            ⌕
          </span>
          <input
            ref={input}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search documents, sections and «placeholders»…"
            aria-label="Search the library"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[cursor] ? `palette-hit-${cursor}` : undefined}
            role="combobox"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="palette__esc mono" onClick={close}>
            esc
          </button>
        </div>

        <ul className="palette__results" id="palette-results" role="listbox" ref={list}>
          {results.map((hit, i) => {
            const heading = query.trim() && hit.kind !== lastKind ? GROUP_LABEL[hit.kind] : null;
            lastKind = hit.kind;
            return (
              <li key={`${hit.href}-${i}`} role="presentation">
                {heading ? <p className="palette__group eyebrow">{heading}</p> : null}
                <button
                  type="button"
                  id={`palette-hit-${i}`}
                  role="option"
                  aria-selected={cursor === i}
                  className="palette__hit"
                  data-kind={hit.kind}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => go(hit)}
                >
                  <span className="palette__hit-icon">
                    {hit.layer ? <LayerIcon layer={hit.layer} /> : <span aria-hidden="true">«»</span>}
                  </span>
                  <span className="palette__hit-main">
                    <span className="palette__hit-title mono">{hit.title}</span>
                    {hit.detail ? <span className="palette__hit-detail">{hit.detail}</span> : null}
                  </span>
                  {hit.kind === 'section' ? (
                    <span className="palette__hit-kind mono">§</span>
                  ) : hit.layer ? (
                    <span className="palette__hit-kind mono">{hit.layer}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
          {query.trim() && !results.length ? (
            <li className="palette__empty mono" role="presentation">
              {index ? `Nothing matches “${query}”.` : 'Loading the index…'}
            </li>
          ) : null}
        </ul>

        <p className="palette__foot mono">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
          {query.trim() ? null : <span className="palette__foot-hint">Start typing to search</span>}
        </p>
      </div>
    </div>
  );
}
