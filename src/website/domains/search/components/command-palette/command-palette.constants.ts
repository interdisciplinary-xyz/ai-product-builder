import type { LayerId } from '@/domains/content';

/**
 * The palette's data shapes and its ranking budget. The scoring itself lives
 * next door in command-palette.tsx.
 */

export type Index = {
  docs: { l: LayerId; s: string; n: string; d: string; t: string | null; p: string | null }[];
  headings: [LayerId, string, string, string, string][];
  tokens: { n: string; k: 'repo' | 'inline'; c: number; m: string | null }[];
};

export type Hit = {
  kind: 'doc' | 'section' | 'token';
  href: string;
  title: string;
  detail: string;
  layer?: LayerId;
  score: number;
};

export type Jump = { href: string; title: string; detail: string; layer?: LayerId };

/**
 * Each kind gets a cap, then the groups are ordered by their strongest hit —
 * so one over-eager kind cannot fill the list and hide the others.
 */
export const LIMITS = { doc: 7, section: 6, token: 4 };
export const GROUP_LABEL: Record<Hit['kind'], string> = {
  doc: 'Documents',
  section: 'Sections',
  token: 'Placeholders',
};

