'use client';

import { Link } from '@/domains/ui';
import { useReview } from '../../use-review';
import type { ReviewQueueItem } from '../../types';

/**
 * One button, and its label is the only thing on this page that has to be
 * right: "Start" when nothing is decided, "Resume" when something is, and the
 * name of the document it will actually open — because a review pass abandoned
 * three days ago is resumed by someone who has forgotten where they were.
 */
export function StartReview({ queue }: { queue: ReviewQueueItem[] }) {
  const { reviews, decided } = useReview();
  const nextUp = queue.find((item) => !reviews[item.key]);

  if (!nextUp) {
    return (
      <p className="revstart revstart--done">
        Every document has a verdict. The pass is in <code>data/reviews.json</code> — commit it,
        then work the <strong>Cut</strong> and <strong>Rework</strong> lists below.
      </p>
    );
  }

  return (
    <p className="revstart">
      <Link href={nextUp.href} className="revstart__go">
        {decided ? 'Resume review' : 'Start review'} →
      </Link>
      <span className="revstart__next mono">
        Next up: {nextUp.name} · {nextUp.layerLabel} · {nextUp.words.toLocaleString('en-US')} words
      </span>
    </p>
  );
}
