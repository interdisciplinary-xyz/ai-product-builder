/**
 * `favorites/server` — the committed JSON file. Node-only; not re-exported from
 * the domain barrel.
 */
export { readFavorites, writeFavorites, type FavoritesFile } from './file';
