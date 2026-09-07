/** One key for the whole feature. Bumping it discards everyone's list. */
export const STORAGE_KEY = 'apb:favorites';

/**
 * A stored key is `layer/slug`. Validating the shape on read is not paranoia:
 * localStorage is writable by anything running on this origin, survives a
 * redeploy, and outlives the document it points at.
 */
export const KEY_SHAPE = /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,80}$/;

/**
 * The library holds ~130 documents, so a list past this is corruption rather
 * than enthusiasm. Bounding it keeps a bad value from becoming a slow page.
 */
export const MAX_FAVORITES = 500;
