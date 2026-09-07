import { ReviewHydrator } from '@/domains/review';
import { readReviews } from '@/domains/review/server';

/**
 * Seeds the store for both review routes.
 *
 * It sits here rather than in the root layout because nothing outside /review
 * reads a verdict, and it is the FIRST child so the seed has happened before
 * any page below reads a snapshot. The favorites version of this shipped 9 of
 * 171 pages with an unseeded store by rendering after its reader; scoping the
 * hydrator to a layout whose only children are the pages that need it removes
 * the ordering question rather than answering it again.
 */
export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  const { reviews } = readReviews();
  return (
    <>
      <ReviewHydrator initial={reviews} />
      {children}
    </>
  );
}
