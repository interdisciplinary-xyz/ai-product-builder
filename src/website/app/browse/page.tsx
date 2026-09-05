import type { Metadata } from 'next';
import { LAYERS, searchIndex } from '@/lib/content';
import { PageHead } from '@/components/ui';
import { BrowseClient } from '@/components/browse-client';

export const metadata: Metadata = {
  title: 'Browse',
  description: 'Every file in the library, filterable by name, description, layer or deploy path.',
};

export default function BrowsePage() {
  const items = searchIndex();
  const layers = LAYERS.map((l) => ({
    id: l.id,
    label: l.label,
    icon: l.icon,
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
      <BrowseClient items={items} layers={layers} />
    </div>
  );
}
