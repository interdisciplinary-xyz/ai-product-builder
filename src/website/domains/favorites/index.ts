/**
 * `favorites` — documents marked in `data/favorites.json`, committed to the
 * repository.
 *
 * A file rather than localStorage, because a browser-held list is lost the
 * moment site data is cleared; a file is in git and moves with a clone. The
 * cost is that it is ONE list, not one per reader — correct while the site is
 * undeployed, and the thing to replace on the day it is not.
 *
 * Reading the file is `./server`, which this barrel does not re-export.
 */
export * from './components';
export { useFavorites, favoriteKey, hrefForKey } from './use-favorites';
export { WRITABLE } from './store';
export { STORAGE_KEY, MAX_FAVORITES } from './constants';
export type { FavoriteKey, FavoriteDoc } from './types';
