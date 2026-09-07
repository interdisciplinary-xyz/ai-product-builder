import type { Metadata } from 'next';
import { PageHead } from '@/domains/ui';
import { ReviewProgress, ReviewQueue, StartReview } from '@/domains/review';
import { reviewQueue } from '@/domains/review/server';

export const metadata: Metadata = {
  title: 'Review',
  description:
    'A triage pass over the library: keep, rework or cut, one document at a time, recorded in data/reviews.json.',
};

export default function ReviewPage() {
  const queue = reviewQueue();

  return (
    <div className="shell">
      <PageHead
        eyebrow="One question per document"
        title="Review the library"
        lede={
          <>
            {queue.length} documents, one at a time: does this earn its place — <strong>keep</strong>,{' '}
            <strong>rework</strong>, or <strong>cut</strong> — and why. Verdicts are written to{' '}
            <code>data/reviews.json</code> and committed with the repository, so a pass survives a
            closed tab and its history says when each call was made.
          </>
        }
      />

      <StartReview queue={queue} />
      <ReviewProgress total={queue.length} />

      <p className="revhow">
        On a document page: <kbd>k</kbd> keep, <kbd>r</kbd> rework, <kbd>c</kbd> cut — each records
        the verdict and jumps to the next undecided file. <kbd>n</kbd> and <kbd>p</kbd> move without
        deciding. The reason field is the part worth filling in: when the pass is done, <em>Cut</em>{' '}
        is the list of files to delete and <em>Rework</em> is the next milestone.
      </p>

      <ReviewQueue queue={queue} />
    </div>
  );
}
