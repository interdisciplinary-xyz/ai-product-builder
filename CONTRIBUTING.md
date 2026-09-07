# Contributing

This library is curated by hand. Improvements are welcome, but the conventions below are
load-bearing — they're what keeps ~100 cross-linked documents from rotting.

## What this library believes

Four opinions. They're why the documents look the way they do, and a change that contradicts one
of them needs an argument.

**A green test suite is not evidence.** Before a regression guard is worth writing, run it
against the pre-fix code and watch it fail. If it passes, it asserts nothing.

**An audit that reports the same twelve false positives forever gets run twice, then never
again.** So every audit command carries a known-legitimate-exceptions list, diffs against its
last run, and opens an issue **only when a number gets worse**.

**The human merges, deploys, and touches secrets.** The agent may do everything local and
everything draft-shaped. Enforced by a permission deny-list, not by good intentions.

**A doc is opened by someone who already decided to act; a skill has to ambush them.** Nobody
thinks *"I should consult the never-throws document"* while writing a `try/catch`. That's the
whole reason the skill layer exists — see [Skill or doc?](#skill-or-doc) below.

## Repo layout

Sources live under `src/`, grouped by layer. `bin/build` turns them into the tree a consumer
repo actually gets.

```
src/
├── managers/    25  MANAGER_*.md  ──▶  docs/MANAGER_*.md              (prefix kept)
├── runbooks/    79  RUNBOOK_*.md  ──▶  docs/*.md                      (prefix STRIPPED)
├── meta/         1  PLACEHOLDERS  ──▶  docs/PLACEHOLDERS.md
├── commands/    11  slash-commands ─▶  .claude/commands/*.md
├── skills/      12  SKILL_*.md    ──▶  .claude/skills/<name>/SKILL.md  + docs/SKILL_*.md
├── agents/       5  AGENT_*.md    ──▶  .claude/agents/<name>.md
├── scripts/      4  2 calculators ──▶  run in place
│                    + README + example fixture
└── config/       1  settings      ──▶  .claude/settings.json
```

Edit under `src/` and rebuild. **`dist/` is generated — never commit it, never edit it.**

```bash
npm run build            # → dist/
npm run check            # build, then verify every cross-link resolves
npm run deploy -- ../my-app/docs
```

### Why the prefixes behave differently

A **`RUNBOOK_` prefix is a shipping-crate label: it names the crate, not the thing inside.**
It's stripped on deploy, so `RUNBOOK_METRICS.md` lands as `METRICS.md`. This isn't a
preference — it's what the two repos that adopted these docs by hand actually did, and the
library's own cross-links were already written against the stripped names.

A **`MANAGER_` prefix is kept**: a playbook stays recognisably a library artifact rather than a
doc the repo owns, and dropping it would collide with the runbook of the same name
(`MANAGER_DECISION_LOG` and `RUNBOOK_DECISION_LOG` both want `DECISION_LOG.md`).

## Skill or doc?

Adding something new? This rule decides its format, and it's the sharpest thing we learned from
auditing two real repos:

> **A skill is a trigger + a refusal + (optionally) a script. A doc is everything else.**
> If you delete the `description` and the artifact loses nothing, it was always a doc.

The distinction is about **who initiates**:

- A **doc** is opened by a human who has *already decided* to do the thing. The human supplies
  the trigger. Every `MANAGER_*` playbook is correctly a doc.
- A **skill** must **ambush the diff** — it exists precisely because the human *doesn't know
  they need it*. Nobody thinks "I should consult the never-throws doc" while writing a
  `try/catch`. That's why the frontmatter **is** the skill: no `description`, no auto-fire, and
  what you've written is a doc filed in the wrong folder.

Both repos we surveyed got this wrong in the same direction: **19 of one repo's 28 "skills" have
no frontmatter at all** and can never fire. They're docs in a costume. Don't add to that pile.

**Hard anti-pattern:** never write a skill whose body is a list of *current facts* — a bug list,
a status snapshot, a known-issues register. It rots silently and keeps firing with stale
content. If you must, give it a staleness banner and a regeneration command.

## Conventions

Every layer doc carries a **`🔧 Reuse & local setup`** block declaring:

- what it **owns** and what it **defers to** (boundary discipline);
- the **placeholders** it expects per repo;
- a `🚀 First time?` hint pointing at `/ai-init`.

Other rules:

- **New tokens go in [`PLACEHOLDERS.md`](src/meta/PLACEHOLDERS.md).** Reuse an existing token
  rather than coining a synonym — check the deprecated-aliases table first.
- **`«SCREAMING_SNAKE»`** = persistent, prompted by `/ai-init`. **`«lowercase»`** = inline-fill,
  skipped. Don't use a `«SCREAMING_SNAKE»` token for a metasyntactic slot, or `/ai-init` will
  ask the user what their "X" is.
- **No emoji in any heading.** The GitHub slugger strips the emoji but keeps the space after it,
  so `## 🚀 Setup` gets the anchor `#-setup` and every hand-written link to it 404s. In a
  cross-linked corpus this is a silent, compounding failure.
- **Relative links only.** The tree gets relocated into other repos; an absolute
  `github.com/...` URL will point at *this* repo, not theirs.
- **Cross-reference by the name the target has once deployed.** `bin/build` flattens `src/` into
  the shape a consumer vendors, and the naming is asymmetric: a **runbook loses its prefix**
  because it is the doc your team lives with, while a **manager or skill keeps it** because it is
  library tooling.

  ```
  src/runbooks/RUNBOOK_E2E.md          →  E2E.md                    link as ./E2E.md
  src/managers/MANAGER_PERFORMANCE.md  →  MANAGER_PERFORMANCE.md    link as ./MANAGER_PERFORMANCE.md
  src/skills/SKILL_RATIONALE_...md     →  SKILL_RATIONALE_...md     link as ./SKILL_RATIONALE_...md
  ```

  A link written against the library filename (`./RUNBOOK_E2E.md`) resolves nowhere once deployed.
  `npm run lint` fails the build on it — including on the example above, which is why it is a code
  block and not a live link.
- If you add a MANAGER, add its paired RUNBOOK (and vice versa) unless the boundary explicitly
  says no pair.
- Run **`npm run check`** before opening a PR.

## Release process

The library dogfoods its own [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md)
policy — `scope/* → release/* → main`, never straight to trunk:

```
scope/vX.Y.Z  ──▶  release/X.Y.Z  ──▶  main
 (implement)       (gate runs here)     (tagged)
```

## Quality bar

Verified on every build. `npm run check` enforces the first row; the rest are still by hand.

| Check | Status |
|---|:--:|
| Cross-links resolve in the built tree | 0 broken |
| Reuse-block coverage on every layer doc | 100% |
| MANAGER has Layer + Pairs-with + Owns/defers + OUTPUT FORMAT | 25/25 |
| RUNBOOK marked `Reusability: template-ready` | 79/79 |
| Every `SKILL_*` carries an installable frontmatter block | 12/12 |
| Zero product-name leaks | pass |
| Both calculators run clean with no args | 2/2 |
| Every `«TOKEN»` registered in `PLACEHOLDERS.md` | verified by `bin/build --check` (see `bin/build`) |
| `.nvmrc` == `package.json.engines.node` across the repo | verified by `bin/build --check` |
| `.env.example` matches Tier-1 schema in consumer repos | delegated to `«AUDIT_ENV_CMD»` per `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md` |
| Every `SKILL_*` carries `**Last reviewed:** «DATE»` | verified by `bin/build --check` |

Previously that last row was the standing debt — the slash-commands used 41 tokens
(`«API_ROUTES_DIR»`, `«BRAND_TOKENS_PATH»`, …) that appeared in no glossary, so `/ai-init`
couldn't prompt for them. The portfolio-lessons pass (v0.3.0) added the missing sections to
[`PLACEHOLDERS.md`](src/meta/PLACEHOLDERS.md) and wired an unregistered-token check into
`bin/build --check`, so the row is now enforced instead of hand-asserted.
