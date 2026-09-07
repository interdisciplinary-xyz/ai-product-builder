/**
 * `content/server` — the Node-only surface: the corpus read off disk and the
 * link graph derived from it.
 *
 * Deliberately NOT re-exported from `@/domains/content`. A client component
 * that imported this barrel would pull `node:fs` — and the whole repository —
 * into the browser bundle. Route files and other `/server` modules import it by
 * this full path so the audit can tell the two import sites apart.
 */
export {
  REPO_ROOT,
  allDocs,
  docsForLayer,
  findDoc,
  layerCounts,
  linkMap,
  searchIndex,
  libraryVersion,
} from './corpus';
export { relations, pairing } from './graph';
