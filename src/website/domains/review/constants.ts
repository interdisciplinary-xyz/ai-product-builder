import type { Verdict } from './types';

/**
 * Same shape as a favorites key, validated on every read for the same reason:
 * the file is hand-editable, it is committed, and it outlives the documents it
 * points at. A renamed runbook leaves a stale key behind, and a stale key must
 * degrade to "not reviewed" rather than to a crash.
 */
export const KEY_SHAPE = /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,80}$/;

/** The library is ~137 files; past this the file is corrupt, not thorough. */
export const MAX_REVIEWS = 500;

/** Long enough for a real reason, short enough that it stays a note. */
export const MAX_NOTE = 500;

/**
 * The verdicts, in the order they are offered. `keep` first because it is the
 * common case and the flow should be fast when the answer is obvious.
 */
export const VERDICTS: { id: Verdict; label: string; hint: string; key: string }[] = [
  { id: 'keep', label: 'Keep', hint: 'Earns its place as written', key: 'k' },
  { id: 'rework', label: 'Rework', hint: 'Worth keeping, not as written', key: 'r' },
  { id: 'cut', label: 'Cut', hint: 'Does not earn its place', key: 'c' },
];

export const VERDICT_IDS = VERDICTS.map((v) => v.id);
