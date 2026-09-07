# ai-product-builder

Playbooks, templates and agent skills for solo founders shipping products with Claude Code.

## Contents

- 📦 [What's inside](#whats-inside) — all eight layers
- ⚡ [Quick start](#quick-start) — clone, deploy, done
- 🤔 [Why](#why) — the problem, and what this is **not** for
- 🚦 [Status](#status) — is it alive, has anyone used it
- 🚪 [Start here](#start-here) — three doors, by what you came for
- ⚠️ [Weak points](#weak-points) — what you'd be signing up for
- 🤝 [Contributing](CONTRIBUTING.md) — conventions, release process
- 📄 [License](#license)

## What's inside

| | Layer | Files | What it is |
|---|---|:--:|---|
| 🎛️ | [Managers](CATALOG.md#managers) | 25 | Playbooks you **run** against a repo. They create, verify, or audit a doc. |
| 📘 | [Runbooks](CATALOG.md#runbooks) | 78 | Docs you **fill**. This is what your team lives with. |
| ⌨️ | [Commands](CATALOG.md#commands) | 11 | Slash-commands. The 4 audits open an issue **only on regression**. |
| ⚡ | [Skills](CATALOG.md#skills) | 9 | Ambient rules that fire **without being asked**. |
| 🎩 | [Agents](CATALOG.md#agents) | 5 | Read-only exec lenses; `/board` reports their **disagreement**. |
| 🧮 | [Scripts](CATALOG.md#scripts) | 4 | Calculators. A playbook ending in a number ships the one that produces it. |
| 🔒 | [Config](CATALOG.md#config) | 1 | The deny-list. The human merges, deploys, touches secrets. |
| 🏷️ | [Meta](CATALOG.md#meta) | 1 | The `«token»` glossary. |

**[→ CATALOG.md](CATALOG.md)** — all 134 files, each with a one-line description.

## Quick start

```bash
git clone https://github.com/interdisciplinary-xyz/ai-product-builder
cd ai-product-builder
npm run deploy -- ../my-app/docs
```

```
my-app/docs/
├── 📘 RELEASE_MANAGER.md     ← a doc you fill, «placeholders» ready
├── 🎛️ MANAGER_SECURITY.md    ← a playbook you run, which audits the docs
├──    … 93 more
├── ⌨️ commands/              → .claude/commands/
├── ⚡ skills/                → .claude/skills/
└── 🎩 agents/                → .claude/agents/
```

Commands, skills and agents belong in `.claude/`, not `docs/`:

```bash
cd ../my-app && mkdir -p .claude/{commands,skills,agents}
cp -r docs/commands/* .claude/commands/ && cp -r docs/skills/* .claude/skills/ && cp -r docs/agents/* .claude/agents/
```

Then `/ai-init RELEASE_MANAGER` fills the `«placeholders»` — it asks once and remembers.
Re-running `deploy` **overwrites**; there is no sync. `RUNBOOK_` is stripped on the way in
([why](CONTRIBUTING.md#why-the-prefixes-behave-differently)).

## Why

Every repo re-litigates the same forty decisions: how releases are cut, what a PR must contain,
when an ADR is required. You answer them badly, under time pressure, in a Slack thread nobody
can find six weeks later.

This library is those decisions, written once, as documents an agent can **execute** — not just
read. You *run* a playbook; it produces and then audits the doc your team lives with. A **skill**
you never invoke at all: it fires on its own, at the moment you're about to make the mistake.

**Not** a plugin, a marketplace, or a framework — it's opinionated markdown and a build script.
If you want something that installs itself, try [anthropics/skills](https://github.com/anthropics/skills)
or [wshobson/agents](https://github.com/wshobson/agents).

## Status

**v0.2.0.** Maintained, and **not yet proven anywhere.** Two repos adopted these docs by hand and
then disowned them — every playbook copy in one carries a banner reading *"NOT wired to this
repo."* It is policy in prose, not enforcement in CI.

The content is good; the adoption is unproven. Weigh accordingly.

## Start here

- 🔍 **Evaluating?** Read [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md) — the most
  opinionated doc here. If you can live with it, the rest will fit.
- 🚀 **Adopting?** The five that earn their keep on day one:
  [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md) ·
  [`QUALITY_ASSURANCE`](src/runbooks/RUNBOOK_QUALITY_ASSURANCE.md) ·
  [`SESSION_MIGRATION`](src/runbooks/RUNBOOK_SESSION_MIGRATION.md) ·
  [`SECURITY_MODEL`](src/runbooks/RUNBOOK_SECURITY_MODEL.md) ·
  [`PRODUCT_CONTEXT`](src/managers/MANAGER_PRODUCT_CONTEXT.md)
- 💎 **Just the best thing?** [`tests-that-cannot-fail`](src/skills/SKILL_TESTS_THAT_CANNOT_FAIL.md)
  — three assertion shapes that pass *identically* against broken and fixed code.

## Weak points

- **Never deployed end to end.** You'd be first.
- **388 unregistered tokens** library-wide — `/ai-init` can't prompt for what no glossary declares. `npm run check` counts them on every run; the number may only go down.
- **No sync.** Re-running `deploy` overwrites; your copy drifts until you re-copy.
- **A dozen unexercised docs.** Some playbooks describe a process nobody has ever run.

## License

Not licensed — all rights reserved (Michał Dopieralski / interdisciplinary-xyz). Ask first.
