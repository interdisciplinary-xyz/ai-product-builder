'use client';

import { useReview } from '../../use-review';
import { VERDICTS } from '../../constants';

/**
 * How far the pass has got. Reads the live store rather than a build-time
 * count, so a verdict recorded two pages ago is reflected the moment you come
 * back here.
 */
export function ReviewProgress({ total }: { total: number }) {
  const { reviews, decided, error } = useReview();
  const counts = VERDICTS.map((v) => ({
    ...v,
    n: Object.values(reviews).filter((r) => r.verdict === v.id).length,
  }));
  const pct = total ? Math.round((decided / total) * 100) : 0;

  return (
    <div className="revprog">
      <div className="revprog__bar" role="img" aria-label={`${decided} of ${total} documents reviewed`}>
        {counts.map(({ id, n }) =>
          n ? (
            <span key={id} className="revprog__seg" data-verdict={id} style={{ flexGrow: n }} />
          ) : null,
        )}
        {decided < total ? <span className="revprog__seg" data-verdict="none" style={{ flexGrow: total - decided }} /> : null}
      </div>
      <dl className="revprog__counts mono">
        <div>
          <dt>Reviewed</dt>
          <dd>
            {decided} / {total} · {pct}%
          </dd>
        </div>
        {counts.map(({ id, label, n }) => (
          <div key={id} data-verdict={id}>
            <dt>{label}</dt>
            <dd>{n}</dd>
          </div>
        ))}
      </dl>
      {error ? <p className="revconsole__error">{error}</p> : null}
    </div>
  );
}
