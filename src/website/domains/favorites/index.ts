/**
 * `favorites` — the things marked in `data/favorites.json`, committed to the
 * repository.
 *
 * A file rather than localStorage, because a browser-held list is lost the
 * moment site data is cleared; a file is in git and moves with a clone. The
 * cost is that it is ONE list, not one per reader — correct while the site is
 * undeployed, and the thing to replace on the day it is not.
 *
 * The domain depends on `ui` and nothing else. A key is `<group>/<id>`, which
 * is also the route, so nothing here has to know what a document or a topic is
 * — and `content` is therefore free to import the star for its own DocEntry
 * without creating a cycle.
 *
 * Reading the file is `./server`, which this barrel does not re-export.
 */
export * from './components';
export { useFavorites } from './use-favorites';
export { favoriteKey, hrefForKey } from './keys';
export { WRITABLE } from './store';
export { STORAGE_KEY, MAX_FAVORITES } from './constants';
export type { FavoriteKey, FavoriteItem, FavoriteRow, FavoriteGroup } from './types';
