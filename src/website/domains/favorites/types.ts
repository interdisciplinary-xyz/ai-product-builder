import type { ReactNode } from 'react';

/**
 * `<group>/<id>` — `runbooks/e2e` for a document, `topics/setup` for a
 * scenario. The group is the first segment of the route the thing lives at,
 * so a key is also its href, and a document can never collide with a topic.
 */
export type FavoriteKey = string;

/** The least a thing needs to be markable: what it is called, and its key. */
export type FavoriteItem = {
  key: FavoriteKey;
  /** Used in the button's title — "Add RELEASE_MANAGER to favorites". */
  name: string;
};

/** A marked thing, as /favorites renders it. */
export type FavoriteRow = FavoriteItem & {
  href: string;
  description?: string | null;
  /** Right-hand label: the layer for a document, "Scenario" for a topic. */
  tag?: string | null;
  icon?: ReactNode;
  /** Written out as data-layer, which is what the stylesheet keys on. */
  tone?: string;
};

/** One heading's worth of rows on /favorites. */
export type FavoriteGroup = {
  label: string;
  rows: FavoriteRow[];
};
