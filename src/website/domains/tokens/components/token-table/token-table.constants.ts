export type TokenRow = {
  name: string;
  meaning: string | null;
  example: string | null;
  registered: boolean;
  docs: { layer: string; slug: string; name: string }[];
};

export type Facet = 'all' | 'shared' | 'unregistered';

/** «PROJECT» wants 71 documents. Printing all of them buries the next token. */
export const INLINE_DOCS = 8;

export const FACETS: { id: Facet; label: string; note: string }[] = [
  { id: 'all', label: 'All', note: 'every repo-wide token' },
  { id: 'shared', label: 'Shared', note: 'used by two or more documents' },
  { id: 'unregistered', label: 'Not in the glossary', note: 'no row in PLACEHOLDERS.md' },
];
