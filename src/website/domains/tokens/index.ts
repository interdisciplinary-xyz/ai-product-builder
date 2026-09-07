/**
 * `tokens` — the «PLACEHOLDER» convention as an index.
 *
 * Client-safe: reading the tokens out of a document you already hold needs no
 * filesystem. Building the repo-wide index does, so it lives in `./server` and
 * is not re-exported here.
 */
export * from './components';
export { TOKEN, kindOf, tokensIn } from './constants';
export type { TokenKind, TokenEntry } from './types';
