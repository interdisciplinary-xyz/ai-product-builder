import type { Layer, LayerId } from './types';

/**
 * The eight layers plus the repo's own front matter — the library's taxonomy,
 * hand-written because it IS the library's claim about itself. Everything else
 * in this domain is read off disk; this is the one thing that is declared.
 */

export const LAYERS: Layer[] = [
  {
    id: 'managers',
    label: 'Managers',
    dir: 'src/managers',
    prefix: 'MANAGER_',
    tagline: 'Playbooks you run against a repo.',
    blurb:
      'A manager is executable prose. You point it at a repository and it creates, verifies or audits a document — usually the runbook of the same name. It is the only layer that produces another layer.',
    target: 'docs/',
    verb: 'run',
    accent: '#9a5b12',
    accentDark: '#e0a35c',
  },
  {
    id: 'runbooks',
    label: 'Runbooks',
    dir: 'src/runbooks',
    prefix: 'RUNBOOK_',
    tagline: 'Documents you fill.',
    blurb:
      'The artifact your team actually lives with. Every runbook ships with «placeholders» instead of invented facts, so an unfilled one is visibly unfilled. The RUNBOOK_ prefix is stripped on deploy.',
    target: 'docs/',
    verb: 'fill',
    accent: '#1c5570',
    accentDark: '#6fb6d8',
  },
  {
    id: 'commands',
    label: 'Commands',
    dir: 'src/commands',
    tagline: 'Slash-commands for Claude Code.',
    blurb:
      'Invoked by name. The four audit-* commands write a dated report, diff it against the previous run, and open an issue only when a number gets worse — silence is the pass condition.',
    target: '.claude/commands/',
    verb: 'invoke',
    accent: '#553a8b',
    accentDark: '#b3a0e8',
  },
  {
    id: 'skills',
    label: 'Skills',
    dir: 'src/skills',
    prefix: 'SKILL_',
    tagline: 'Rules that fire without being asked.',
    blurb:
      'The only layer you never invoke. A skill exists precisely because you do not know you need it — it ambushes the diff at the moment you are about to make the mistake it knows about.',
    target: '.claude/skills/',
    verb: 'never invoke',
    accent: '#a32d1c',
    accentDark: '#f08a72',
  },
  {
    id: 'agents',
    label: 'Agents',
    dir: 'src/agents',
    prefix: 'AGENT_',
    tagline: 'Read-only executive lenses.',
    blurb:
      'Four fixed points of view, convened by /board, which injects live state and reports where they disagree. The lens lives in the file; the state never does.',
    target: '.claude/agents/',
    verb: 'convene',
    accent: '#2c5a3d',
    accentDark: '#79bd93',
  },
  {
    id: 'scripts',
    label: 'Scripts',
    dir: 'src/scripts',
    tagline: 'Calculators. Standard library only.',
    blurb:
      'A playbook that ends in a number should ship the calculator that produces it. Python 3, no dependencies, run in place.',
    target: 'run in place',
    verb: 'run',
    accent: '#6f5316',
    accentDark: '#d4b45f',
  },
  {
    id: 'config',
    label: 'Config',
    dir: 'src/config',
    tagline: 'The permission boundary, in one file.',
    blurb:
      'Allow-lists git, gh, package and read-only Bash. Denies merge, rebase, force-push, the deploy CLI and every .env write. The human merges, deploys and touches secrets.',
    target: '.claude/settings.json',
    verb: 'install',
    accent: '#494a55',
    accentDark: '#a9abbb',
  },
  {
    id: 'meta',
    label: 'Meta',
    dir: 'src/meta',
    tagline: 'The «token» glossary.',
    blurb:
      'The one file every other document reads from. «SCREAMING_SNAKE» is one value per repo; «lowercase» is filled inline per occurrence.',
    target: 'docs/',
    verb: 'read',
    accent: '#7d4360',
    accentDark: '#d792b3',
  },
  {
    id: 'guides',
    label: 'Guides',
    dir: '.',
    tagline: 'The repository’s own front matter.',
    blurb:
      'The README, the catalog and the contribution conventions — the documents that describe the library rather than belonging to it.',
    target: '—',
    verb: 'read',
    accent: '#4a4437',
    accentDark: '#c2b9a4',
  },
];

export const LAYER_BY_ID = new Map(LAYERS.map((l) => [l.id, l]));

/**
 * A MANAGER marks its sections with a bare uppercase line — `INITIALIZATION`,
 * `WCAG TARGET & SCOPE` — rather than with `##`.
 *
 * Two places act on this: `remarkSectionLabels` promotes such a paragraph to a
 * depth-2 heading when rendering, and `extractHeadings` in the corpus counts it
 * when building the contents and the search index. They must agree exactly or
 * the contents rail links to anchors that were never emitted, so the pattern
 * lives here and neither owns it.
 */
export const SECTION_LABEL = /^[A-Z][A-Z0-9 &/()\'-]{2,60}$/;
