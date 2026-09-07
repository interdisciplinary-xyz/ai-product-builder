import type { Metadata } from 'next';
import { PageHead } from '@/domains/ui';
import { allDocs } from '@/domains/content/server';
import { FavoriteList, type FavoriteDoc } from '@/domains/favorites';

export const metadata: Metadata = {
  title: 'Favorites',
  description:
    'The documents marked in data/favorites.json — committed to the repository, so the list is in git rather than in one browser.',
};

export default function FavoritesPage() {
  // The list is computed in the browser, so the page ships the corpus and lets
  // the client intersect it — four fields per document, because that is what a
  // row renders. Sending whole `Doc`s put 77 kB of repo paths, heading trees and
  // word counts into a page that is empty for most readers.
  const docs: FavoriteDoc[] = allDocs()
    .filter((d) => d.layer !== 'guides')
    .map(({ layer, slug, name, description }) => ({ layer, slug, name, description }));

  return (
    <div className="shell">
      <PageHead
        eyebrow="Committed to the repository"
        title="Favorites"
        lede={
          <>
            Marked from the star on any document page, or from any row in{' '}
            <a href="/browse/">browse</a>. The list is written to{' '}
            <code>data/favorites.json</code> and committed with the rest of the repository — so it
            is in git, it survives clearing your browser, and its history says when each document
            was marked. One list, not one per reader: right while this site has one.
          </>
        }
      />
      <FavoriteList docs={docs} />
    </div>
  );
}
