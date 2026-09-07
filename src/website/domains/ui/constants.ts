import type { CSSProperties } from 'react';
import type { Accent } from './types';

/**
 * An accent is set as a light/dark pair and resolved to `--layer` in the
 * stylesheet, so one declaration serves both schemes. See globals.css,
 * `[data-layer], [data-topic] { --layer: … }`.
 */
export function accentStyle(accent: Accent | undefined): CSSProperties {
  return {
    ['--layer-light' as string]: accent?.accent ?? 'var(--accent)',
    ['--layer-dark' as string]: accent?.accentDark ?? 'var(--accent)',
  };
}

/** Cards stagger in, but only the first fifteen — after that it reads as lag. */
export const RISE_STEP_MS = 22;
export const RISE_MAX_STEPS = 14;
