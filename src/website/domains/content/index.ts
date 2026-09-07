/**
 * `content` — the library itself: its taxonomy, its documents, and the
 * components that render one.
 *
 * This barrel is CLIENT-SAFE. The corpus is read off disk, and everything that
 * touches the filesystem lives behind `@/domains/content/server` instead —
 * imported by its full path, never re-exported from here. That is the one
 * child directory this file deliberately does not carry: one line of
 * convenience would put `node:fs` and the whole repository into the browser
 * bundle. See RUNBOOK_DOMAIN_ARCHITECTURE §5.
 */
export * from './components';
export { LAYERS, LAYER_BY_ID } from './constants';
export { slugify, deployedPath, layerStyle, docHref, layerAccent } from './taxonomy';
export type { LayerId, Layer, Doc, Relations, Pairing, SearchEntry } from './types';
