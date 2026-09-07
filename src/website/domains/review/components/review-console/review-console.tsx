'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/domains/ui';
import { useReview } from '../../use-review';
import { MAX_NOTE, VERDICTS } from '../../constants';
import { reviewHref } from '../../keys';
import type { ReviewKey, ReviewQueueItem, Verdict } from '../../types';

/**
 * The verdict, the reason and the way onward — one component, because they
 * share a keydown listener. Split across three, each would install its own and
 * the last one mounted would decide what `c` means.
 *
 * Recording a verdict advances to the next undecided document. That is the
 * whole point of the flow: the fast path through 137 files is read, judge,
 * land on the next one, and never touch the mouse.
 */
export function ReviewConsole({
  item,
  previous,
  next,
  queueKeys,
  position,
  total,
}: {
  item: ReviewQueueItem;
  previous?: ReviewQueueItem;
  next?: ReviewQueueItem;
  /**
   * Every key in queue order, and only the keys — the page ships ~137 short
   * strings rather than the whole queue, because all this needs from the rest
   * of the library is which document to jump to next, and a key is its route.
   */
  queueKeys: readonly ReviewKey[];
  position: number;
  total: number;
}) {
  const router = useRouter();
  const { reviews, recordFor, decide, annotate, undecide, writable, error } = useReview();
  const record = recordFor(item.key);
  const [note, setNote] = useState(record?.note ?? '');

  // The console stays mounted across a client-side route change, so the note
  // has to follow the key rather than only the first record it saw. Without
  // this the second document in a session shows the first one's reason.
  const shownFor = useRef(item.key);
  if (shownFor.current !== item.key) {
    shownFor.current = item.key;
    setNote(record?.note ?? '');
  }

  /**
   * Where "record and move on" goes: the next document with no verdict,
   * wrapping past the end so a gap left earlier in the pass is picked up
   * rather than stranded. Computed here, from the live store — a server-side
   * answer would be stale after the session's very first verdict.
   */
  const onward = useCallback(
    (justDecided: ReviewKey) => {
      const from = queueKeys.indexOf(justDecided);
      const order = [...queueKeys.slice(from + 1), ...queueKeys.slice(0, from)];
      const target = order.find((key) => !reviews[key]);
      if (target) router.push(reviewHref(target));
      else if (next) router.push(next.href);
    },
    [queueKeys, reviews, next, router],
  );

  const cast = useCallback(
    (verdict: Verdict) => {
      if (!writable) return;
      if (note.trim() !== (record?.note ?? '')) annotate(item.key, note);
      decide(item.key, verdict);
      onward(item.key);
    },
    [writable, note, record?.note, annotate, decide, item.key, onward],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // Never steal a keystroke from the note, the search palette, or any
      // other field — `c` has to stay a letter while someone is typing.
      const el = event.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName))) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const verdict = VERDICTS.find((v) => v.key === event.key.toLowerCase());
      if (verdict) {
        event.preventDefault();
        cast(verdict.id);
        return;
      }
      if (event.key === 'n' && next) {
        event.preventDefault();
        router.push(next.href);
      }
      if (event.key === 'p' && previous) {
        event.preventDefault();
        router.push(previous.href);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cast, next, previous, router]);

  return (
    <aside className="revconsole" aria-label="Review this document">
      <div className="revconsole__row">
        <span className="revconsole__where mono">
          {position} / {total}
        </span>

        <div className="revconsole__verdicts" role="group" aria-label="Verdict">
          {VERDICTS.map((v) => (
            <button
              key={v.id}
              type="button"
              className="revverdict"
              data-verdict={v.id}
              aria-pressed={record?.verdict === v.id}
              disabled={!writable}
              onClick={() => cast(v.id)}
              title={
                writable
                  ? `${v.hint} — shortcut ${v.key}`
                  : 'Read-only: this build has no write endpoint.'
              }
            >
              <span className="revverdict__label">{v.label}</span>
              <kbd>{v.key}</kbd>
            </button>
          ))}
        </div>

        <nav className="revconsole__pager mono" aria-label="Review queue">
          {record ? (
            <button
              type="button"
              className="revconsole__undo"
              onClick={() => undecide(item.key)}
              disabled={!writable}
            >
              Undo
            </button>
          ) : null}
          <Link href={item.docHref}>Doc&nbsp;↗</Link>
          {previous ? (
            <Link href={previous.href} title={`Previous: ${previous.name}`}>
              ←&nbsp;p
            </Link>
          ) : null}
          {next ? (
            <Link href={next.href} title={`Next: ${next.name}`}>
              n&nbsp;→
            </Link>
          ) : (
            <Link href="/review/">Finish&nbsp;↦</Link>
          )}
        </nav>
      </div>

      <textarea
        className="revconsole__note"
        rows={1}
        maxLength={MAX_NOTE}
        value={note}
        disabled={!writable || !record}
        aria-label="Why — the reason for this verdict"
        placeholder={
          record
            ? 'Why — merge into RELEASE_MANAGER; the SEV table is the only unique part.'
            : 'Record a verdict, then say why.'
        }
        onChange={(e) => setNote(e.target.value)}
        // Saved on blur rather than per keystroke: a PUT per character would
        // rewrite the committed file dozens of times a sentence.
        onBlur={() => annotate(item.key, note)}
      />

      {!writable ? (
        <p className="revconsole__error">
          Read-only: this copy was built as static files, so the write endpoint is gone. Run{' '}
          <code>pnpm start:dev</code> to record verdicts.
        </p>
      ) : null}
      {error ? <p className="revconsole__error">{error}</p> : null}
    </aside>
  );
}
