# ai-product-builder

A curated library of **MANAGER playbooks** + **RUNBOOK templates** for AI-assisted product
engineering. Designed for solo founders and small teams shipping with Claude Code, Cursor,
and GitHub Copilot.

> **What this is:** a hand-curated, source-of-truth library you **build into each repo** and
> run *against*.
>
> **What this is not:** a Claude Code plugin or marketplace. Placeholders are filled **in
> place** via `/ai-init`.

### Deployment convention (changed in v0.2.0 — read this)

A **`RUNBOOK_` prefix is a shipping-crate label: it names the crate, not the thing inside.**
`bin/build` strips it on deploy, so `RUNBOOK_METRICS.md` lands in the consumer repo as
`METRICS.md`. A **`MANAGER_` prefix is kept** — a playbook stays recognisably a library
artifact rather than a doc the repo owns, and dropping it would collide with the runbook of
the same name.

This is not a preference; it is what already happened. v0.1.0 claimed the prefix was
preserved on deploy. In the two repos that adopted these docs by hand, **`RUNBOOK_` survived
in 2 files out of ~30 — people stripped it**, exactly as the docs told them to. Worse, the
library's own cross-links were already written against the *stripped* names, which is why 43
of them were broken. Matching reality fixed all 43.

Layers that are not documentation (`skills/`, `agents/`, `scripts/`, `config/`) install into
`.claude/`, not `docs/` — each file's Reuse block names its target.

## Contents

- [Repo layout](#repo-layout) — `src/` tree, `bin/build`, and the deployed layout
- [What's in it](#whats-in-it) — the seven layers at a glance
- [Quickest path to value](#quickest-path-to-value) — `/ai-init` in one command
- [Minimum-viable adoption](#minimum-viable-adoption-the-5-docs-that-earn-their-keep-on-day-1) — the 5 docs that earn their keep on day 1
- [Catalog by theme](#catalog-by-theme) — all 88 playbooks and templates, grouped
- [Skill or doc?](#skill-or-doc) — the rule that decides which format a thing wants
- [Required policies](#required-policies-the-library-enforces-by-convention) — what the library enforces by convention
- [The init system](#the-init-system) — how `«placeholders»` are declared and filled
- [Quality bar](#quality-bar) — the verification battery
- [Honest weak points](#honest-weak-points-we-know-about-these) — what's still prose, not enforcement
- [Contributing](#contributing)
- [License](#license)

## Repo layout

Sources live under `src/`, grouped by layer. Docs deploy **flat** so that a doc's
bare-filename cross-references (`E2E.md`) resolve; everything else keeps its shape:

```
src/
├── managers/    25  MANAGER_*.md  ──▶  docs/MANAGER_*.md        (prefix kept)
├── runbooks/    63  RUNBOOK_*.md  ──▶  docs/*.md                (prefix STRIPPED)
├── meta/         1  PLACEHOLDERS.md ▶  docs/PLACEHOLDERS.md
├── commands/    11  slash-commands ▶  .claude/commands/*.md
├── skills/       5  SKILL_*.md    ──▶  .claude/skills/<name>/SKILL.md   +  docs/SKILL_*.md
├── agents/       5  AGENT_*.md    ──▶  .claude/agents/<name>.md
├── scripts/      2  calculators   ──▶  run in place
└── config/       2  settings      ──▶  .claude/settings.json
README.md                          ──▶  docs/README.md
```

A **skill ships twice** from one source: flat as a readable doc, *and* as a drop-in
`.claude/skills/<name>/SKILL.md` with its YAML frontmatter hoisted out of the source's
`## Frontmatter to install with` block. You never hand-copy it into a second home, so the two
cannot drift apart.

```bash
bin/build                                    # → dist/
bin/build --out ../my-app/docs
bin/build --check                            # build, then verify every cross-link resolves
```

The same three via npm (`package.json` carries no dependencies — the scripts are just aliases):

```bash
npm run build
npm run deploy -- ../my-app/docs
npm run check
```

`dist/` is generated — never commit it, never edit it. Edit under `src/` and rebuild.

## What's in it

| Layer | Count | Role | Example |
|---|:--:|---|---|
| **`MANAGER_*`** | **25** | Agent playbook — *run it* against a repo; it creates / verifies / audits a target doc | `MANAGER_SECURITY` |
| **`RUNBOOK_*`** | **63** | Content template — fill the `«placeholders»` in place via `/ai-init` | `RUNBOOK_METRICS.md` → `docs/METRICS.md` |
| **`commands/*`** | **11** | Slash-commands — 7 workflow + 4 recurring audits | `/ai-init`, `/board`, `/deploy-check` |
| **`SKILL_*`** | **5** | **Ambient rule** — fires *without being asked*, on the strength of its frontmatter `description`, at the moment you're about to make the mistake | `SKILL_TESTS_THAT_CANNOT_FAIL` |
| **`AGENT_*`** | **5** | Exec-persona subagents — read-only advisory lenses (CEO / CFO / CPO / CTO), convened by `/board` | `AGENT_CTO.md` → `.claude/agents/cto.md` |
| **`scripts/*`** | **2** | Executable calculators — *a playbook that ends in a number ships the calculator that produces it* | `sensitivity-table.py`, `score-sean-ellis.py` |
| **`config/*`** | **2** | `settings.json` deny-list + the autonomy contract that explains it | `SETTINGS_TEMPLATE.json` |
| meta | 2 | `README.md` (this file) + `PLACEHOLDERS.md` (canonical token glossary) | — |

Every layer doc carries a **`🔧 Reuse & local setup`** block declaring:
- what it **owns** and what it **defers to** (boundary discipline);
- the **placeholders** it expects per repo;
- a `🚀 First time?` hint pointing to the init tool.

## Quickest path to value

```bash
# Inside any target repo (Claude Code session):
/ai-init RUNBOOK_RELEASE_MANAGER
```

The init tool reads the doc's `Local definitions` schema, prompts you interactively
(skipping `«lowercase»` inline-fill tokens and refusing secret-shaped ones), and writes
your answers to a **committed** `.claude/ai-init.local.json`. Re-running on the next
doc only prompts for **new** tokens — your existing answers are preserved.

See `MANAGER_INIT.md` for the full spec.

## Minimum-viable adoption (the 5 docs that earn their keep on day 1)

Start with these — they cover *ship-confidently*, *what to ship*, and *how to hand off*:

1. **`RELEASE_MANAGER.md`** — staged-branch CI cost-control policy (`scope/* → release/* → main`, domain-scoped E2E at the release merge).
2. **`QUALITY_ASSURANCE.md`** — pre-merge quality gate (`ci:quality` aggregate, principles, checklists).
3. **`SESSION_MIGRATION.md`** — AI-session handoff so the next session resumes instead of re-learning.
4. **`SECURITY_MODEL.md`** — technical security baseline (auth tiers, IDOR guard, webhook signing, env hygiene).
5. **`PRODUCT_CONTEXT.md`** — what you're building, ICP, anti-goals — orients every AI session.

Adopt more as they earn their place.

## Catalog by theme

### ⚙️ Process, engineering, governance
`MANAGER_AI_WORKFLOW` · `MANAGER_ARCHITECTURE` · `MANAGER_CONTRIBUTING` · `MANAGER_DECISION_LOG` · `MANAGER_DEV_ONBOARDING` · `MANAGER_DOC_FRESHNESS` · `MANAGER_ENGINEERING_STANDARDS` · `MANAGER_INIT` · `MANAGER_PROJECT` · `MANAGER_TESTING_STRATEGY` ·
`RUNBOOK_AI_PROMPT_REGISTRY` · `RUNBOOK_ARCHITECTURE` · `RUNBOOK_AUDIT` · `RUNBOOK_DATA_MODEL_GUIDE` · `RUNBOOK_DECISION_LOG` · `RUNBOOK_DEV_PORTLESS` · `RUNBOOK_GITHUB_ACTIONS` · `RUNBOOK_MAINTENANCE` · `RUNBOOK_ONBOARDING_PACK` · `RUNBOOK_PROJECT_PLAN` · `RUNBOOK_PULL_REQUEST_TEMPLATE` · `RUNBOOK_QUALITY_ASSURANCE` · `RUNBOOK_RELEASE_MANAGER` · `RUNBOOK_SESSION_MIGRATION`

### 🚨 Resilience & incident response
`MANAGER_INCIDENT_RESPONSE` · `RUNBOOK_INCIDENTS` · `RUNBOOK_BACKUP_RECOVERY` · `RUNBOOK_SECRETS_ROTATION` · `RUNBOOK_OBSERVABILITY`

### 🔒 Security, legal, compliance
`MANAGER_SECURITY` · `MANAGER_PAYMENTS_COMPLIANCE` · `RUNBOOK_SECURITY_MODEL` · `RUNBOOK_PAYMENTS_COMPLIANCE` · `RUNBOOK_PAYMENTS_LIFECYCLE` · `RUNBOOK_LEGAL_RISK` · `RUNBOOK_THIRD_PARTY` · `RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST`

### 🧪 Testing & quality
`RUNBOOK_E2E` · `RUNBOOK_SMOKE_TEST` · `MANAGER_A11Y_AUDIT` + `RUNBOOK_A11Y_AUDIT` · `MANAGER_PERFORMANCE` + `RUNBOOK_WEB_VITALS_AUDIT` · `MANAGER_SEO` + `RUNBOOK_SEO_AUDIT` · `MANAGER_I18N` + `RUNBOOK_TRANSLATION_WORKFLOW` · `RUNBOOK_EMAIL_QA_MATRIX` · `RUNBOOK_EMAIL_DELIVERABILITY` · `RUNBOOK_EMAILS_WORKFLOW`

### 🎨 Design & UX
`MANAGER_DESIGN_SYSTEM` · `MANAGER_DESIGN_REVIEW` · `RUNBOOK_FEATURE_SPEC` · `RUNBOOK_UX_PRINCIPLES` · `RUNBOOK_BRAND_VOICE_GUIDELINE` · `RUNBOOK_RFC_TEMPLATE`

### 💼 Product strategy & discovery
`MANAGER_PRODUCT_CONTEXT` · `MANAGER_DISCOVERY` · `MANAGER_EXPERIMENT` · `RUNBOOK_PRODUCT_POSITIONING` · `RUNBOOK_BUSINESS_PLAN` · `RUNBOOK_ICP` · `RUNBOOK_NORTH_STAR` · `RUNBOOK_METRICS` · `RUNBOOK_FEATURES` · `RUNBOOK_ROADMAP` · `RUNBOOK_SCALING` · `RUNBOOK_COMMUNITY_MODEL` · `RUNBOOK_TEAM_PLAYBOOK` · `RUNBOOK_PRICING_STRATEGY` · `RUNBOOK_ACTIVATION_EVENT` · `RUNBOOK_USER_OBSERVATION` · `RUNBOOK_EXPERIMENT_DESIGN`

### 📣 Launch & growth
`MANAGER_LAUNCH_GTM` · `RUNBOOK_LAUNCH_NARRATIVE` · `RUNBOOK_LAUNCH_SOCIAL` · `RUNBOOK_LAUNCH_TARGET_LIST` · `RUNBOOK_OUTREACH_TEMPLATES` · `RUNBOOK_POWER_MOVES` · `RUNBOOK_PRE_LAUNCH_CHECKLIST` · `RUNBOOK_REFERRAL_MECHANICS`

### 📝 Content & marketing
`MANAGER_CONTENT_PUBLISHING` · `RUNBOOK_PRODUCT_MARKETING_CONTEXT`

### 🧑‍🚀 Solo founder / small-team operating cadence
`MANAGER_FOUNDER_OPS` · `RUNBOOK_DAILY_RITUAL` · `RUNBOOK_WEEKLY_RETRO` · `RUNBOOK_DECISION_THRESHOLDS` · `RUNBOOK_FOUNDER_DASHBOARD`

### ⌨️ Slash-commands

**Workflow** — run on demand:

| Command | Purpose |
|---|---|
| `/ai-init` | Interactive bootstrap of a doc's `«placeholders»`; saves to `.claude/ai-init.local.json` |
| `/board` | Convene the exec board (`ceo`/`cfo`/`cpo`/`cto`) on a scope question — gathers live state, injects it into all four lenses, then **synthesizes the disagreement** into one call with the dissent recorded |
| `/review` | Targeted code review |
| `/test` | Run repo tests + summarise |
| `/deploy-check` | Pre-deploy readiness check |
| `/content-editor` | CMS / content editing workflow |
| `/web-interface-guidelines` | Apply the universal interface-guidelines check |

**Recurring audits** — each writes a dated report; meant to run every 1–2 weeks:

| Command | Purpose | Pairs with |
|---|---|---|
| `/audit-structure` | Architecture DAG, observability-tag taxonomy, generated-type drift | `MANAGER_ARCHITECTURE` |
| `/audit-api-routes` | Route↔OpenAPI-spec parity, doc completeness, stale entries, authn/authz, route hygiene | `MANAGER_SECURITY`, `MANAGER_ARCHITECTURE` |
| `/audit-design-system` | Token drift, component reuse, a11y, responsive + visual consistency | `MANAGER_DESIGN_SYSTEM` |
| `/audit-performance` | Client bundle size, Core Web Vitals, unused deps, query/index hygiene | `MANAGER_PERFORMANCE`, `RUNBOOK_WEB_VITALS_AUDIT` |

### 🎩 Exec board (advisory personas)

`AGENT_TEMPLATE` (the anatomy) · `AGENT_CEO` · `AGENT_CFO` · `AGENT_CPO` · `AGENT_CTO` — four
read-only lenses, convened by `/board`.

The layer's one rule: **the agent file holds the lens; the live state is injected at
invocation.** A persona never hardcodes an issue number, a version or a revenue figure — it
receives them from `/board`, which gathers the backlog, the recent commits and the doc bundle
fresh each time. The output's value is where the four lenses **conflict**, not where they agree.

## Skill or doc?

Adding something new? This is the rule that decides its format, and it is the sharpest thing
we learned from auditing two real repos:

> **A skill is a trigger + a refusal + (optionally) a script. A doc is everything else.**
> If you delete the `description` and the artifact loses nothing, it was always a doc.

The distinction is about **who initiates**:

- **A doc** is opened by a human who has *already decided* to do the thing. You don't need a
  trigger, because the human supplies it. Every `MANAGER_*` playbook is correctly a doc.
- **A skill** must **ambush the diff** — it exists precisely because the human *does not know
  they need it*. Nobody thinks "I should consult the never-throws doc" while writing a
  `try/catch`. That's why the frontmatter *is* the skill: no `description`, no auto-fire, and
  what you've really written is a doc filed in the wrong folder.

Both surveyed repos got this wrong in the same direction: **19 of one repo's 28 "skills" have
no frontmatter at all** and can never fire. They are docs wearing a skill costume. Don't add
to that pile.

One hard anti-pattern: **never write a skill whose body is a list of current facts** (a bug
list, a status snapshot, a "known issues" register). It will rot, silently, and keep firing
with stale content. If you must, it carries a staleness banner and a regeneration command.

## Required policies the library enforces by convention

These are stated as **REQUIRED** across the appropriate MANAGER + RUNBOOK pairs:

- **Domain-scoped E2E** at the `release/* → main` merge (only the changed domains' E2E run; full-suite fallback on `«SHARED_PATHS»` changes; CI implementation in `GITHUB_ACTIONS.md`).
- **Domain-boundary enforcement** (no cross-domain deep imports; `domain → shared` only; no cycles; lint via `eslint-plugin-boundaries` or `dependency-cruiser`).
- **`«SHARED_PATHS»` single source of truth** (`.github/shared-paths.txt` committed; CI + docs read it; never restated).
- **`CODEOWNERS` per domain** (every `src/domains/*` + shared layer owned; branch protection requires code-owner review).
- **ADR-required triggers** (new dependency / new domain / public-barrel change → entry in `DECISION_LOG.md`).
- **CI security gates** (`secrets` scan, `deps` audit, `api-parity`, `forbidden-tokens` for payments repos).
- **Flaky-test quarantine** with shrink-not-grow allowlist.
- **IDOR / ownership negative test** required per owner-scoped route.

## The init system

Every layer doc declares its required `«placeholders»` in its Reuse-block `Local definitions to provide per repo` list. The init tool reads that schema, prompts you only for the **persistent `«SCREAMING_SNAKE»`** tokens (skips `«lowercase»` inline-fill + per-invocation + secret-shaped), and persists answers.

```bash
/ai-init RUNBOOK_RELEASE_MANAGER     # first doc — prompts for everything missing
/ai-init RUNBOOK_QUALITY_ASSURANCE   # next doc — only prompts for NEW tokens
```

Answer file shape (`.claude/ai-init.local.json` in the target repo — **committed**):

```json
{
  "_version": 1,
  "tokens": {
    "PROJECT": "Acme",
    "DOMAIN": "acme.app",
    "NODE_VERSION": "22.15.1",
    "PKG_MGR": "pnpm",
    "QUALITY_CMD": "pnpm ci:quality",
    "DB_CMS": "MongoDB + Payload",
    "AUTH": "Firebase Auth",
    "PAYMENTS": "Stripe",
    "DEPLOY": "Vercel",
    "LOCALES": "en, pl",
    "TRUNK": "main"
  },
  "_meta": { "last_init": "2026-05-26", "docs_rendered": [] }
}
```

Secrets **never** belong here — they live in `.env.local`. See `MANAGER_INIT.md` for the full spec.

## Quality bar

The library is verified against this battery (cross-refs via `bin/build --check`; the rest still by hand):

| Check | Status |
|---|:--:|
| Cross-links resolve in the built tree (`bin/build --check`) | ✅ 0 broken (was 43) |
| Reuse-block coverage on every layer doc | ✅ 100% |
| MANAGER has Layer + Pairs-with + Owns/defers + OUTPUT FORMAT | ✅ 25/25 |
| RUNBOOK marked `Reusability: template-ready` | ✅ 63/63 |
| Every `SKILL_*` carries an installable frontmatter block | ✅ 4/4 |
| Zero product-name leaks (`empatalk`, `respect.click`, etc.) | ✅ |
| `«TOKEN»` discipline — every token registered in `PLACEHOLDERS.md` | ⚠️ **41 unregistered in `src/commands/`** |
| `/ai-init` hint in every layer doc | ✅ |
| Both calculators run clean with no args | ✅ 2/2 |

The `«TOKEN»` row was marked ✅ before anyone checked it. It isn't: the slash-commands use 41
tokens (`«API_ROUTES_DIR»`, `«BRAND_TOKENS_PATH»`, …) that appear in no glossary, so `/ai-init`
cannot prompt for them. Fixing that is the next obvious job.

## Honest weak points (we know about these)

This library is **policy declared in prose, not enforcement deployed in repos.** Until at least one policy ships in a real `.github/`, the "REQUIRED" markers are intentions, not gates.

| # | Weak point | Concrete fix |
|---|---|---|
| 1 | **Never deployed — and rejected where it was tried.** `docs/ai-product-builder/` exists in **zero** repos. Two repos adopted some docs by hand; both **disowned** them. Every `MANAGER_*` copy in one carries a banner reading *"NOT wired to this repo… Treat as a template, not current process"*, and in the other the library-derived docs are the deadest cohort in the tree. ~12 library docs describe a process **neither repo has ever performed** | Stop assuming distribution is the blocker. Deploy the 5-doc minimum to **one** repo, wire **one** policy into `.github/`, and let it fail a PR. Retire the dozen docs nobody runs |
| 2 | **Partial library-quality CI** — `bin/build --check` now catches broken cross-refs (0 remain). Unregistered tokens (41), orphan files and drift still go undetected, and no workflow runs the check | Extend the check to tokens / orphans / deprecated aliases; run it in CI |
| 3 | **No sync mechanism for deployed copies** — when this library updates, repo copies drift silently. This is not hypothetical: it is exactly how the hand-copied docs rotted | Add `_canonical_version` to each doc + a `bin/sync` |
| 4 | **No usage telemetry** — we don't know which docs are read, run, or dead weight. The audit commands' trend-comparison step has fired **zero** times in the wild, because no audit has ever been run twice | After 60 days of real use, audit which docs got read / referenced / run; retire unused |
| 5 | **Context cost** — MANAGERs are 200–400 lines each; running several burns LLM context | Mark MANAGER sections as "essential" / "deep" |

See `MANAGER_DOC_FRESHNESS.md` for the quarterly sweep that catches drift.

## Contributing

This library is curated by hand. Improvements welcome via PR, but:
- preserve the Reuse-block convention on every layer doc;
- edit under `src/` (never `dist/`) and run `bin/build --check` before proposing changes;
- if you add a new MANAGER, also add its paired RUNBOOK (and vice versa) unless the boundary doc explicitly says no pair;
- new canonical tokens go in `PLACEHOLDERS.md`.

## License

See [LICENSE](./LICENSE).
