import type { Metadata } from 'next';
import { PageHead } from '@/domains/ui';
import { LAYER_BY_ID, LayerIcon, docHref } from '@/domains/content';
import { allDocs } from '@/domains/content/server';
import { TOPICS } from '@/domains/topics';
import { topicCounts } from '@/domains/topics/server';
import { FavoriteList, favoriteKey, type FavoriteGroup } from '@/domains/favorites';

export const metadata: Metadata = {
  title: 'Favorites',
  description:
    'The documents and scenarios marked in data/favorites.json — committed to the repository, so the list is in git rather than in one browser.',
};

export default function FavoritesPage() {
  // Everything markable is shipped to the browser so the client can intersect
  // it with the marked keys — four fields and an icon per row, because that is
  // what a row renders.
  const counts = topicCounts();
  const groups: FavoriteGroup[] = [
    {
      label: 'Scenarios',
      rows: TOPICS.map((topic) => ({
        key: favoriteKey('topics', topic.id),
        name: topic.label,
        description: topic.question,
        href: `/topics/${topic.id}/`,
        tag: `${counts[topic.id]} files`,
        tone: topic.id,
        accent: topic,
      })),
    },
    {
      label: 'Documents',
      rows: allDocs()
        .filter((d) => d.layer !== 'guides')
        .map((doc) => ({
          key: favoriteKey(doc.layer, doc.slug),
          name: doc.name,
          description: doc.description,
          href: docHref(doc),
          tag: LAYER_BY_ID.get(doc.layer)?.label ?? doc.layer,
          tone: doc.layer,
          accent: LAYER_BY_ID.get(doc.layer),
          icon: <LayerIcon layer={doc.layer} />,
        })),
    },
  ];

  return (
    <div className="shell">
      <PageHead
        eyebrow="Committed to the repository"
        title="Favorites"
        lede={
          <>
            Marked from the star on any document, any ledger row, or any scenario on the front
            page. The list is written to <code>data/favorites.json</code> and committed with the
            rest of the repository — so it is in git, it survives clearing your browser, and its
            history says when each thing was marked. One list, not one per reader: right while this
            site has one.
          </>
        }
      />
      <FavoriteList groups={groups} />
    </div>
  );
}
