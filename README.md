# ai-product-builder

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

| Build | Runtime | Tooling |
| --- | --- | --- |
| npm scripts (`build`, `check`, `deploy`) | Node.js for the build shim; Python 3 stdlib for the two calculators | Bash (`bin/build`) |

The library ships **no runtime dependencies**. `bin/build` is a shell script; every calculator under `src/scripts/` uses the Python standard library only. `package.json` declares neither `dependencies` nor `devDependencies`.

---

## Architecture

The library is a corpus of ~100 curated markdown files organised into eight layers under `src/`. `bin/build` walks that tree and emits the exact shape a consumer repo expects: filled-in docs land in `docs/`, executable commands, skills and agents land in `.claude/`, calculators run in place. Cross-links resolve inside the built tree — `npm run check` enforces that on every PR.

### Domains:

The eight layers of the library. Each row links to its section in the catalog.

|  | Layer | Files | What it is |
| --- | --- | ---: | --- |
| Managers | [Managers](CATALOG.md#managers) | 25 | Playbooks you **run** against a repo. They create, verify or audit a doc — usually the paired runbook. |
| Runbooks | [Runbooks](CATALOG.md#runbooks) | 64 | Docs you **fill**. This is the artifact your team actually lives with. |
| Commands | [Commands](CATALOG.md#commands) | 11 | Slash-commands. The four `audit-*` ones write a dated report and open an issue **only when a number gets worse**. |
| Skills | [Skills](CATALOG.md#skills) | 5 | The only layer that fires **without being asked**. Ambushes the diff at the moment you're about to make the mistake. |
| Agents | [Agents](CATALOG.md#agents) | 5 | Read-only exec lenses (CEO/CFO/CPO/CTO). `/board` fans out to all four and reports their **disagreement**. |
| Scripts | [Scripts](CATALOG.md#scripts) | 2 | Calculators. A playbook ending in a number ships the one that produces it. |
| Config | [Config](CATALOG.md#config) | 1 | The permission deny-list. Denies merge, rebase, force-push, the deploy CLI, and every `.env` write. |
| Meta | [Meta](CATALOG.md#meta) | 1 | The canonical `«token»` glossary every other document reads from. |

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

The library's public surface is one command. It copies the built tree into a target repo's `docs/` and (via manual sub-copy) `.claude/` directories:

```bash
npm run deploy -- ../my-app/docs
```

Re-running `deploy` **overwrites** — there is no sync. If you edited a doc in the consumer repo, your changes will be lost on the next run. Two supporting entry points round out the interface:

- `npm run build` — emit the deploy-shaped tree into `dist/` for local inspection.
- `npm run check` — build in memory and verify every internal cross-link resolves. Run before opening a PR.

---

### Scripts

Declared in [`package.json`](package.json).

| Name | Description |
| --- | --- |
| `npm run build` | Walk `src/`, emit the deploy-shaped tree into `dist/` for inspection. |
| `npm run check` | Build in memory and verify every internal cross-link resolves. |
| `npm run deploy -- <target>` | Emit the tree directly into the target directory (typically `../my-app/docs`). |

Two Python calculators under `src/scripts/` also ship — standard library only, run in place:

| Script | Run it | What it answers |
| --- | --- | --- |
| `sensitivity-table.py` | `python3 src/scripts/sensitivity-table.py` | Which variable, off by 50%, kills the model? |
| `score-sean-ellis.py` | `python3 src/scripts/score-sean-ellis.py responses.json` | The PMF read after discounting polite signal. |

---

### Environment

**No environment variables required.** The library is pure markdown plus a shell build script — there is no runtime, no server, no service account, no secrets. `.env.example` does not exist and would carry nothing if it did.

The `.claude/settings.json` template the library deploys into consumer repos denies every `.env` write on that side by policy — see [`PERMISSIONS_AND_AUTONOMY`](src/runbooks/RUNBOOK_PERMISSIONS_AND_AUTONOMY.md).

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

- [CATALOG.md](CATALOG.md) — all 114 files, each with a one-line description, grouped by layer.
- [CONTRIBUTING.md](CONTRIBUTING.md) — conventions, the prefix rules, the skill-or-doc test, the quality bar, the release process.

---

## License

Not licensed — all rights reserved (Michał Dopieralski / interdisciplinary-xyz). Ask first.
