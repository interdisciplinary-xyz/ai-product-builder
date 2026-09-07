import type { LayerId } from '@/domains/content';

export type BrowseLayer = {
  id: LayerId;
  label: string;
  accent: string;
  accentDark: string;
};

export type BrowseItem = {
  layer: LayerId;
  slug: string;
  name: string;
  file: string;
  description: string;
  deployedAs: string | null;
};
