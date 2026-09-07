/**
 * `search` — every way into the library that starts from typing.
 *
 * The palette fetches its ~195 kB index on first open rather than shipping it
 * with all 163 pages, so nothing here needs the corpus at build time and the
 * domain has no `/server` surface at all.
 */
export * from './components';
export { OPEN_EVENT } from './constants';
