import type { Doc } from '@/domains/content';
import type { TokenKind } from './types';

/**
 * «TOKENS» are the library's central convention: a template ships placeholders
 * instead of invented facts, so an unfilled document looks unfilled. That makes
 * the token set the most practical index in the whole library — "what do I have
 * to know about my own product before this doc is worth anything?" — and it is
 * the one view the raw markdown cannot give you, because a token's meaning is
 * in `meta/PLACEHOLDERS.md` while its uses are scattered across 121 files.
 *
 * Two kinds, per the glossary's own rule:
 *   «SCREAMING_SNAKE» — one value per repo; safe to find-replace, and what
 *                       `/ai-init` can prompt for.
 *   «lowercase»       — filled inline, differently at each occurrence.
 */


export const TOKEN = /«([^»\n]{1,80})»/g;
const REPO_TOKEN = /^[A-Z][A-Z0-9_.:|]*$/;

export function kindOf(name: string): TokenKind {
  return REPO_TOKEN.test(name) ? 'repo' : 'inline';
}

/**
 * Tokens a reader would actually have to fill: fenced code blocks are stripped
 * first, because a token inside one is nearly always an illustration of the
 * convention rather than a slot in this document.
 */
export function tokensIn(doc: Doc): string[] {
  const prose = doc.body.replace(/^```[\s\S]*?^```/gm, '');
  return [...new Set([...prose.matchAll(TOKEN)].map((m) => m[1]))].sort();
}
