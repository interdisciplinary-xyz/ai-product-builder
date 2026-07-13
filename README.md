# ai-product-builder

Playbooks, templates and agent skills for solo founders shipping products with Claude Code.

You copy it into your repo and run it *against* your repo. There is no package to install and
nothing to import — the artifacts are markdown, and the runtime is your coding agent.

```bash
git clone https://github.com/interdisciplinary-xyz/ai-product-builder
cd ai-product-builder
npm run deploy -- ../my-app/docs        # 95 docs + commands, skills, agents, calculators
```

```
my-app/docs/
├── RELEASE_MANAGER.md        ← staged-branch CI policy, «placeholders» ready to fill
├── SECURITY_MODEL.md         ← auth tiers, IDOR guard, webhook signing
├── MANAGER_SECURITY.md       ← the playbook that audits the file above
├── … 92 more
├── commands/                 → .claude/commands/     (11 slash-commands)
├── skills/                   → .claude/skills/       (4 ambient rules)
└── agents/                   → .claude/agents/       (4 exec lenses + template)
```

## Why

Every repo you start re-litigates the same forty decisions: how releases are cut, what a PR
must contain, when an ADR is required, what "done" means for a payment path. You answer them
badly, under time pressure, in a Slack thread nobody can find six weeks later.

This library is those decisions, written down once, as documents an AI agent can *execute* —
not just read.

You **run** a playbook (`MANAGER_SECURITY.md`); it produces and then audits the document your
team lives with (`SECURITY_MODEL.md`). You **fill** a runbook. A **skill** you never invoke at
all — it fires on its own, at the moment you're about to make the mistake it knows about.

**What it is not:** a Claude Code plugin, a marketplace, or a framework. It is a pile of
opinionated markdown and a build script. If you want something that installs and does things to
your codebase automatically, this is the wrong repo — see [Alternatives](#alternatives).

> [!IMPORTANT]
> **This is policy declared in prose, not enforcement deployed in CI.** The "REQUIRED" markers
> throughout the library are intentions until you wire one into a real `.github/` and watch it
> fail a PR. No repo has done that yet — see [Status](#status).

## Status

**v0.2.0.** Maintained, actively used to build the tooling in it, and **not yet proven in
production anywhere.**

Being specific, because the alternative is misleading you: `docs/ai-product-builder/` exists in
zero repos. Two repos adopted some of these documents by hand and then **disowned them** — every
playbook copy in one carries a banner reading *"NOT wired to this repo… treat as a template, not
current process."* Roughly a dozen documents here describe a process nobody has ever performed.

That's the honest state. The content is good; the adoption is unproven. Weigh accordingly.

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Contents

- [Why](#why) · [Status](#status) — is this for me, and is it alive
- [Adopt it](#adopt-it) — the copy, and what it overwrites
- [Use it](#use-it) — filling the `«placeholders»`, running a playbook
- [What's inside](#whats-inside) — the six layers, with counts
- [Start here](#start-here) — three doors, by what you came for
- [What this library believes](#what-this-library-believes) — the four opinions
- [Known weak points](#known-weak-points) — what you'd be signing up for
- [Alternatives](#alternatives) · [Contributing](#contributing) · [License](#license)

## Adopt it

```bash
npm run deploy -- ../my-app/docs
```

That's the whole adoption story, and it has four properties worth stating plainly:

**It is a copy, not a dependency.** The files land in your repo and belong to you.

**Updating means re-running the command.** There is no sync mechanism. **Local edits to deployed
files will be overwritten.** That's the contract — fill the `«placeholders»`, but if you fork a
document's *structure*, you own it from then on.

**Names change on the way in.** `RUNBOOK_METRICS.md` deploys as `METRICS.md` — the prefix is a
shipping-crate label, not part of the name. Playbooks keep their `MANAGER_` prefix so they stay
recognisable as library artifacts. ([Why](CONTRIBUTING.md#why-the-prefixes-behave-differently).)

**Three layers install outside `docs/`.** Commands, skills and agents belong in `.claude/`:

```bash
cd ../my-app
mkdir -p .claude/commands .claude/skills .claude/agents
cp -r docs/commands/* .claude/commands/
cp -r docs/skills/*   .claude/skills/
cp -r docs/agents/*   .claude/agents/
```

## Use it

Every document ships full of `«PLACEHOLDER»` tokens. `/ai-init` fills them by asking you, once,
and remembering the answers for every subsequent document.

```
/ai-init RELEASE_MANAGER
```

```
NODE_VERSION   found .nvmrc → 22.15.1        [Enter to accept]
PKG_MGR        found package.json → pnpm     [Enter to accept]
TRUNK          found git → main              [Enter to accept]
QUALITY_CMD    ? pnpm ci:quality
```

Answers persist to `.claude/ai-init.local.json` (committed). The next document only asks about
tokens it hasn't seen. Secrets are refused, not stored.

Then run a playbook against your repo:

```
Run MANAGER_SECURITY.md against this codebase.
```

It reads `SECURITY_MODEL.md`, walks your routes, and reports what the document claims versus
what the code does.

## What's inside

| Layer | Files | What it is | |
|---|:--:|---|---|
| **Managers** | 25 | Playbooks you *run* against a repo. They create, verify, or audit a document. | [table →](CATALOG.md#managers) |
| **Runbooks** | 64 | Documents you *fill*. This is what your team lives with. | [table →](CATALOG.md#runbooks) |
| **Commands** | 11 | Slash-commands: 7 workflow + 4 recurring audits. | [below](#commands) |
| **Skills** | 5 | Ambient rules that fire **without being asked**. | [below](#skills) |
| **Agents** | 5 | Read-only exec lenses, convened by `/board`. | [below](#agents) |
| **Scripts** | 2 | Calculators. Python, no dependencies. | [below](#scripts) |
| **Config** | 1 | The permission deny-list. | [below](#config-and-meta) |
| **Meta** | 1 | The `«token»` glossary. | [below](#config-and-meta) |

The two big layers live in **[CATALOG.md](CATALOG.md)** — 89 rows would drown this page. The
other six are small enough to show here.

### Commands

The four `audit-*` commands write a **dated report**, diff it against the last one, and open an
issue **only when a number gets worse**. Install to `.claude/commands/`.

| Command | What running it does |
|---|---|
| [`/ai-init`](src/commands/ai-init.md) | Prompts for a doc's `«placeholder»` values and saves them to `.claude/ai-init.local.json`. |
| [`/board`](src/commands/board.md) | Fans a scope question out to all four exec lenses, then synthesizes their **disagreement** into one call. |
| [`/review`](src/commands/review.md) | Diffs the branch against trunk; reviews it against your lint, i18n, design-token and auth conventions. |
| [`/test`](src/commands/test.md) | Runs format, lint, type-check and unit tests in order; reports a pass/fail table. |
| [`/deploy-check`](src/commands/deploy-check.md) | Adds build, clean-tree, commit-convention and up-to-date-with-trunk checks. Prints READY / NOT READY. |
| [`/content-editor`](src/commands/content-editor.md) | Reads, creates, updates or deletes CMS content per locale via the admin API. |
| [`/web-interface-guidelines`](src/commands/web-interface-guidelines.md) | Reviews files against a11y, focus, forms, animation and performance rules. |
| [`/audit-structure`](src/commands/audit-structure.md) | Runs the repo's own architecture-DAG, observability-tag and type-drift enforcers. |
| [`/audit-api-routes`](src/commands/audit-api-routes.md) | Checks route ↔ spec parity, rate-limit / validation / auth gates, and IDOR risk. |
| [`/audit-design-system`](src/commands/audit-design-system.md) | Greps raw hex, arbitrary utility values and one-off components; trends the counts. |
| [`/audit-performance`](src/commands/audit-performance.md) | Measures First Load JS, PageSpeed, raw `<img>`, unused deps, unindexed hot fields. |

### Skills

The only layer that **fires without being asked** — a skill exists precisely because you don't
know you need it. Install to `.claude/skills/<name>/SKILL.md`.

| Skill | The counterintuitive thing it knows |
|---|---|
| [`tests-that-cannot-fail`](src/skills/SKILL_TESTS_THAT_CANNOT_FAIL.md) | A guard never observed failing against the pre-fix code asserts **nothing**. Regex alternations, mocked throws and conditional skips pass in both worlds. |
| [`claim-before-side-effect`](src/skills/SKILL_CLAIM_BEFORE_SIDE_EFFECT.md) | A marker stamped **after** an irreversible call is a re-send window, not idempotency. |
| [`never-throws-contract`](src/skills/SKILL_NEVER_THROWS_CONTRACT.md) | The client resolves `{success: false}` instead of throwing — so your `try/catch` is dead code. |
| [`framework-defaults-are-permissive`](src/skills/SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md) | Unspecified access falls through to *any authenticated user*; locking only `update` leaves `create` open. |
| [`SKILL_TEMPLATE`](src/skills/SKILL_TEMPLATE.md) | The anatomy for writing your own. The frontmatter **is** the skill. |

### Agents

Read-only advisory lenses. The lens lives in the file; live state is injected at invocation, so
they don't rot. Install to `.claude/agents/`.

| Agent | Its bias |
|---|---|
| [`ceo`](src/agents/AGENT_CEO.md) | Distribution and trust beat features. One bet per release. |
| [`cfo`](src/agents/AGENT_CFO.md) | Ranks by revenue-at-risk × probability − build cost. Blocks traffic on a leaking money path. |
| [`cpo`](src/agents/AGENT_CPO.md) | The funnel is the product. Never ship the editor before the viewer. |
| [`cto`](src/agents/AGENT_CTO.md) | Correctness over cleverness. A green pipeline that skips the money path is a lie. |
| [`AGENT_TEMPLATE`](src/agents/AGENT_TEMPLATE.md) | The anatomy: lens in the file, state injected, one invariant, a named verdict. |

### Scripts

*A playbook that ends in a number should ship the calculator that produces it.* Standard library
only, no dependencies.

| Script | What it answers |
|---|---|
| [`sensitivity-table.py`](src/scripts/sensitivity-table.py) | **Which variable, off by 50%, kills the model?** Ranks the damage and exposes the monthly-vs-annual fee physics. Prints trip-wires, not a forecast. |
| [`score-sean-ellis.py`](src/scripts/score-sean-ellis.py) | **What's the PMF read after discounting polite signal?** The bundled example scores **raw 40% PASS / discounted 20% FAIL**. |

### Config and meta

| File | Deployed as | What it is |
|---|---|---|
| [`SETTINGS_TEMPLATE.json`](src/config/SETTINGS_TEMPLATE.json) | `.claude/settings.json` | Denies merge, rebase, force-push, the deploy CLI and every `.env` write. The human merges, deploys and touches secrets. |
| [`PLACEHOLDERS.md`](src/meta/PLACEHOLDERS.md) | `docs/PLACEHOLDERS.md` | The canonical `«token»` glossary. `«SCREAMING_SNAKE»` is one value per repo; `«lowercase»` is filled inline. |

## Start here

Three doors, depending on why you're here.

**"I'm evaluating whether to adopt."** Read [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md).
It's the most opinionated document in the library and the one most likely to make you disagree.
If you can live with it, the rest will fit.

**"I want the five documents that earn their keep on day one."**

1. [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md) — staged-branch CI cost control (`scope/* → release/* → main`)
2. [`QUALITY_ASSURANCE`](src/runbooks/RUNBOOK_QUALITY_ASSURANCE.md) — the pre-merge gate
3. [`SESSION_MIGRATION`](src/runbooks/RUNBOOK_SESSION_MIGRATION.md) — so the next AI session resumes instead of re-learning
4. [`SECURITY_MODEL`](src/runbooks/RUNBOOK_SECURITY_MODEL.md) — auth tiers, IDOR guard, webhook signing
5. [`PRODUCT_CONTEXT`](src/managers/MANAGER_PRODUCT_CONTEXT.md) — what you're building and what you refuse to build

**"Just show me the single best thing in here."**
[`SKILL_TESTS_THAT_CANNOT_FAIL`](src/skills/SKILL_TESTS_THAT_CANNOT_FAIL.md) — three assertion
shapes that pass *identically* against broken and fixed code. One of them shipped a fully
deployed, e2e-tested route that zero pages referenced, for months, with CI green.

## What this library believes

Four opinions, which you're free to reject — but they're why the documents look the way they do.

**A green test suite is not evidence.** Before a regression guard is worth writing, run it
against the pre-fix code and watch it fail. If it passes, it asserts nothing.

**An audit that reports the same twelve false positives forever gets run twice and then never
again.** So every audit command carries a *known-legitimate-exceptions* list, diffs against its
last run, and opens an issue **only when a number gets worse**.

**The human merges, deploys, and touches secrets.** The agent may do everything local and
everything draft-shaped. That line is enforced by a permission deny-list, not by good intentions.

**A doc is opened by someone who already decided to act; a skill has to ambush them.** Nobody
thinks *"I should consult the never-throws document"* while writing a `try/catch`. That's the
whole reason the skill layer exists — and why a skill without a `description` is just a document
in the wrong folder. ([The rule](CONTRIBUTING.md#skill-or-doc).)

## Known weak points

We'd rather you hear these from us.

| Weak point | What it means for you |
|---|---|
| **Never deployed end to end** | Nothing here has been proven against a real repo's CI. You'd be first. |
| **41 unregistered tokens** | Four slash-commands use `«placeholders»` that `/ai-init` can't prompt for. You'd fill them by hand. |
| **No sync mechanism** | Re-running `deploy` overwrites. When the library updates, your copy drifts silently until you re-copy. |
| **A dozen unexercised documents** | Some playbooks describe a process nobody has ever run. They're theory. |
| **Context cost** | Playbooks run 200–400 lines. Running several in one session burns a lot of an agent's context. |

## Alternatives

Use something else if:

- **You want agents and skills that install themselves.** This library is markdown you copy;
  a plugin marketplace is a better fit. Start with [`anthropics/skills`](https://github.com/anthropics/skills)
  or [`wshobson/agents`](https://github.com/wshobson/agents).
- **You want breadth over opinion.** This library takes hard positions — staged-branch releases,
  domain-scoped E2E, a permission deny-list. An `awesome-*` list will give you more options and
  fewer arguments.
- **You have a team with an established process.** These documents are written for a solo founder
  or a small team deciding things for the first time. If you already have a release policy, you
  don't need ours — take the [skills](CATALOG.md#skills) and leave the rest.

What you get here that those don't: the playbooks and the documents are **paired**, so a document
has something that audits it, and the whole thing is meant to be *run*, not read.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — repo layout, the skill-or-doc rule, token conventions,
and the release process. Run `npm run check` before opening a PR.

## License

**Not licensed.** No `LICENSE` file has been chosen, so by default all rights are reserved by the
copyright holder (Michał Dopieralski / interdisciplinary-xyz). The repository is private; if you
want to use this outside the org, ask first.
