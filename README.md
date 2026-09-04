# ai-product-builder

![ai-product-builder](/logo.svg)

Playbooks, templates and agent skills for solo founders shipping products with Claude Code.

---

## Table of content

1. [Stack](#stack)
2. [Architecture](#architecture)
   - [Domains](#domains)
   - [Components](#components)
   - [API](#api)
   - [Scripts](#scripts)
   - [Environment](#environment)
3. [Quick start](#quick-start)
4. [Why](#why)
5. [Status](#status)
6. [Start here](#start-here)
7. [Weak points](#weak-points)
8. [Documentation](#documentation)
9. [License](#license)

---

## Stack

| App | Tests | Tools |
| --- | ----- | ----- |
| [Markdown](https://commonmark.org/) |  |  |
| [Node.js](https://nodejs.org/) |  |  |
| [Bash](https://www.gnu.org/software/bash/) |  |  |
| [Python](https://www.python.org/) |  |  |
| [Claude Code](https://claude.com/claude-code) |  |  |

---

## Architecture

The library is a corpus of ~100 curated markdown files organised into eight layers under `src/`. `bin/build` walks that tree and emits the exact shape a consumer repo expects: filled-in docs land in `docs/`, executable commands, skills and agents land in `.claude/`, calculators run in place. Cross-links resolve inside the built tree — `npm run check` enforces that on every PR.

### Domains:

The eight layers of the library. Each row links to its section in the catalog.

| Domain | Purpose |
| --- | --- |
| `src/managers` | Playbooks you **run** against a repo; each creates, verifies or audits a doc, usually the paired runbook (25 items) — see [CATALOG.md#managers](CATALOG.md#managers) |
| `src/runbooks` | Docs you **fill**; the artifact your team actually lives with (64 items) — see [CATALOG.md#runbooks](CATALOG.md#runbooks) |
| `src/commands` | Slash-commands; the four `audit-*` write a dated report and open an issue **only when a number gets worse** (11 items) — see [CATALOG.md#commands](CATALOG.md#commands) |
| `src/skills` | The only layer that fires **without being asked**; ambushes the diff at the moment you're about to make the mistake (5 items) — see [CATALOG.md#skills](CATALOG.md#skills) |
| `src/agents` | Read-only exec lenses (CEO/CFO/CPO/CTO); `/board` fans out to all four and reports their **disagreement** (5 items) — see [CATALOG.md#agents](CATALOG.md#agents) |
| `src/scripts` | Calculators; a playbook ending in a number ships the one that produces it (2 items) — see [CATALOG.md#scripts](CATALOG.md#scripts) |
| `src/config` | The permission deny-list; denies merge, rebase, force-push, the deploy CLI, and every `.env` write (1 item) — see [CATALOG.md#config](CATALOG.md#config) |
| `src/meta` | The canonical `«token»` glossary every other document reads from (1 item) — see [CATALOG.md#meta](CATALOG.md#meta) |

[→ CATALOG.md](CATALOG.md) — all 114 files, one line each.

---

### Components

File conventions the build script relies on. These are load-bearing — break one and cross-links rot silently across the corpus.

- **`RUNBOOK_` prefix is stripped on deploy.** `RUNBOOK_METRICS.md` lands in the consumer repo as `docs/METRICS.md`. The library's own cross-links are already written against the stripped names.
- **`MANAGER_` prefix is preserved.** A playbook stays recognisably a library artifact rather than a doc the repo owns, and dropping the prefix would collide with the paired runbook (`MANAGER_DECISION_LOG` and `RUNBOOK_DECISION_LOG` both want `DECISION_LOG.md`).
- **Commands, skills and agents ship under `.claude/`**, not `docs/`. Skills expand to `.claude/skills/<name>/SKILL.md`; agents to `.claude/agents/<name>.md`.
- **`«SCREAMING_SNAKE»`** tokens are per-repo values prompted once by `/ai-init` and persisted to `.claude/ai-init.local.json`. **`«lowercase»`** tokens are inline fills, one value per occurrence, and `/ai-init` skips them.
- **No emoji in any heading.** The GitHub slugger strips the emoji but keeps the space after it, so `## 🚀 Setup` becomes anchor `#-setup` and every hand-written link 404s.
- **Relative links only.** The tree gets relocated into other repos — an absolute `github.com/...` URL will point at *this* repo, not theirs.

Full rules, including the skill-or-doc test: [CONTRIBUTING.md](CONTRIBUTING.md).

---

### API

The library's public surface is one command:

```bash
npm run deploy -- ../my-app/docs
```

Copies the built tree into a target repo's `docs/` and (via manual sub-copy) `.claude/` directories. Re-running `deploy` overwrites — there is no sync.

---

### Scripts

Declared in [`package.json`](package.json).

| Name | Description |
| --- | --- |
| `npm run build` | Emit the deploy-shaped tree into `dist/` for inspection. |
| `npm run check` | Build in memory and verify every internal cross-link resolves. |
| `npm run deploy -- <target>` | Emit the tree directly into the target directory. |

---

### Environment

No environment variables required.

---

## Quick start

```bash
git clone https://github.com/interdisciplinary-xyz/ai-product-builder
cd ai-product-builder
npm run deploy -- ../my-app/docs
```

Commands, skills and agents belong in `.claude/`, not `docs/`:

```bash
cd ../my-app && mkdir -p .claude/{commands,skills,agents}
cp -r docs/commands/* .claude/commands/
cp -r docs/skills/*   .claude/skills/
cp -r docs/agents/*   .claude/agents/
```

Then `/ai-init RELEASE_MANAGER` fills the `«placeholders»` — it asks once and remembers.

---

## Why

Every repo re-litigates the same forty decisions: how releases are cut, what a PR must contain, when an ADR is required. You answer them badly, under time pressure, in a Slack thread nobody can find six weeks later.

This library is those decisions, written once, as documents an agent can **execute** — not just read. You *run* a playbook; it produces and then audits the doc your team lives with. A **skill** you never invoke at all: it fires on its own, at the moment you're about to make the mistake.

**Not** a plugin, a marketplace, or a framework — it's opinionated markdown and a build script. If you want something that installs itself, try [anthropics/skills](https://github.com/anthropics/skills) or [wshobson/agents](https://github.com/wshobson/agents).

---

## Status

**v0.2.0.** Maintained, and **not yet proven anywhere.** Two repos adopted these docs by hand and then disowned them — every playbook copy in one carries a banner reading *"NOT wired to this repo."* It is policy in prose, not enforcement in CI.

The content is good; the adoption is unproven. Weigh accordingly.

---

## Start here

- **Evaluating?** Read [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md) — the most opinionated doc here. If you can live with it, the rest will fit.
- **Adopting?** The five that earn their keep on day one: [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md) · [`QUALITY_ASSURANCE`](src/runbooks/RUNBOOK_QUALITY_ASSURANCE.md) · [`SESSION_MIGRATION`](src/runbooks/RUNBOOK_SESSION_MIGRATION.md) · [`SECURITY_MODEL`](src/runbooks/RUNBOOK_SECURITY_MODEL.md) · [`PRODUCT_CONTEXT`](src/managers/MANAGER_PRODUCT_CONTEXT.md)
- **Just the best thing?** [`tests-that-cannot-fail`](src/skills/SKILL_TESTS_THAT_CANNOT_FAIL.md) — three assertion shapes that pass *identically* against broken and fixed code.

---

## Weak points

- **Never deployed end to end.** You'd be first.
- **41 unregistered tokens** in the audit commands — `/ai-init` can't prompt for them.
- **No sync.** Re-running `deploy` overwrites; your copy drifts until you re-copy.
- **A dozen unexercised docs.** Some playbooks describe a process nobody has ever run.

---

## Documentation

| Document | For |
| --- | --- |
| [CATALOG.md](CATALOG.md) | All 114 files, each with a one-line description, grouped by layer. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Conventions, prefix rules, the skill-or-doc test, the quality bar, the release process. |

---

## License

Not licensed — all rights reserved (Michał Dopieralski / interdisciplinary-xyz). Ask first.
