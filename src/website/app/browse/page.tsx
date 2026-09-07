import type { Metadata } from 'next';
import { PageHead } from '@/domains/ui';
import { LAYERS } from '@/domains/content';
import { searchIndex } from '@/domains/content/server';
import { BrowseList } from '@/domains/search';

export const metadata: Metadata = {
  title: 'Browse',
  description: 'Every file in the library, filterable by name, description, layer or deploy path.',
};

export default function BrowsePage() {
  const items = searchIndex();
  const layers = LAYERS.map((l) => ({
    id: l.id,
    label: l.label,
    accent: l.accent,
    accentDark: l.accentDark,
  }));

  return (
    <div className="shell">
      <PageHead
        eyebrow={`${items.length} files · eight layers, plus the repo’s own guides`}
        title="The whole library"
        lede="Descriptions come straight from CATALOG.md, so this index cannot drift from the catalog it renders."
      />
      <BrowseList items={items} layers={layers} />
    </div>
  );
}
