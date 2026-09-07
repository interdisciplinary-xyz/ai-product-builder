/**
 * `ui` — the base leaf. It depends on no other domain, and never will: the
 * ALLOWED map in scripts/tools/audit-domain-graph.mjs records that as `ui: []`
 * and the audit fails the build if an import creeps in.
 *
 * Every line here re-exports a child directory, not a file inside one. The
 * chain is component folder → `components/index.ts` → this barrel, so a
 * component can move within the domain without any consumer noticing.
 */
export * from './components';
export { accentStyle, RISE_STEP_MS, RISE_MAX_STEPS } from './constants';
export type { Accent } from './types';
