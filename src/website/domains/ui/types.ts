/**
 * The base leaf's own vocabulary. It names shapes, never library concepts —
 * anything that knows what a "layer" or a "runbook" is belongs to `content`,
 * one level up the DAG.
 */

/** A light/dark accent pair. Whoever owns the taxonomy supplies the values. */
export type Accent = { accent: string; accentDark: string };
