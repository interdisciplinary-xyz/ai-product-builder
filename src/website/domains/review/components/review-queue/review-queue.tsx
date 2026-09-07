'use client';

import { useState } from 'react';
import { Entry, Ledger, Link } from '@/domains/ui';
import { useReview } from '../../use-review';
import { VERDICTS } from '../../constants';
import type { ReviewQueueItem } from '../../types';

type Filter = 'all' | 'undecided' | 'keep' | 'rework' | 'cut';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'undecided', label: 'Undecided' },
  ...VERDICTS.map((v) => ({ id: v.id as Filter, label: v.label })),
];

/**
 * The whole queue, with what has been decided about each. The filter is the
 * point: once the pass is done, "Cut" is the list of files to delete and
 * "Rework" is the next milestone's work, and neither is readable inside a
 * 137-row ledger.
 */
export function ReviewQueue({ queue }: { queue: ReviewQueueItem[] }) {
  const { reviews } = useReview();
  const [filter, setFilter] = useState<Filter>('all');

  const shown = queue.filter((item) => {
    const record = reviews[item.key];
    if (filter === 'all') return true;
    if (filter === 'undecided') return !record;
    return record?.verdict === filter;
  });

  const countFor = (id: Filter) =>
    id === 'all'
      ? queue.length
      : id === 'undecided'
        ? queue.filter((i) => !reviews[i.key]).length
        : queue.filter((i) => reviews[i.key]?.verdict === id).length;

  return (
    <section className="revqueue" aria-label="Review queue">
      <div className="revqueue__filters" role="group" aria-label="Filter by verdict">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="revqueue__filter"
            data-verdict={f.id === 'all' || f.id === 'undecided' ? undefined : f.id}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label} <span className="revqueue__n">{countFor(f.id)}</span>
          </button>
        ))}
      </div>

      {shown.length ? (
        <Ledger>
          {shown.map((item, i) => {
            const record = reviews[item.key];
            return (
              <Entry
                key={item.key}
                href={item.href}
                name={item.name}
                description={record?.note ?? item.description}
                meta={[item.layerLabel, `${item.words.toLocaleString('en-US')} w`]}
                tone={item.layer}
                accent={item.accent}
                icon={item.icon}
                index={i}
                action={
                  <span className="revbadge" data-verdict={record?.verdict ?? 'none'}>
                    {record ? VERDICTS.find((v) => v.id === record.verdict)?.label : '—'}
                  </span>
                }
              />
            );
          })}
        </Ledger>
      ) : (
        <p className="revqueue__empty">
          Nothing here yet. <Link href="/review/">Back to the pass</Link>.
        </p>
      )}
    </section>
  );
}
