/**
 * The shape of one token in the index.
 */

export type TokenKind = 'repo' | 'inline';

export type TokenEntry = {
  name: string;
  kind: TokenKind;
  /** From the PLACEHOLDERS.md glossary, when it has a row for this token. */
  meaning: string | null;
  example: string | null;
  /** True when the glossary knows it — the rest are ad-hoc, per-doc tokens. */
  registered: boolean;
  docs: { layer: string; slug: string; name: string }[];
};
