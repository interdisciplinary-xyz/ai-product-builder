# ai-product-builder

A curated library of **MANAGER playbooks** + **RUNBOOK templates** for AI-assisted product
engineering. Designed for solo founders and small teams shipping with Claude Code, Cursor,
and GitHub Copilot.

> **What this is:** a hand-curated, source-of-truth library you copy *from* and run *against*
> your repos.
>
> **What this is not:** a Claude Code plugin or marketplace. The naming convention
> (`MANAGER_X` / `RUNBOOK_X`) is library-only; deployed copies in a target repo use the
> un-prefixed name (`docs/X.md`).

## What's in it

| Layer | Count | Role | Example |
|---|:--:|---|---|
| **`MANAGER_*`** | **25** | Agent playbook — *run it* with Claude / Cursor against a repo; the playbook creates / verifies / audits a target doc | `MANAGER_RELEASE_MANAGER`, `MANAGER_SECURITY` |
| **`RUNBOOK_*`** | **63** | Content template — *copy it* into the repo's `docs/X.md` and fill the `«placeholders»` | `RUNBOOK_RELEASE_MANAGER.md` → `docs/RELEASE_MANAGER.md` |
| **`commands/*`** | **6** | Claude Code slash-commands | `/ai-init`, `/review`, `/test`, `/deploy-check`, `/content-editor`, `/web-interface-guidelines` |
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
| Command | Purpose |
|---|---|
| `/ai-init` | Interactive bootstrap of a doc's `«placeholders»`; saves to `.claude/ai-init.local.json` |
| `/review` | Targeted code review |
| `/test` | Run repo tests + summarise |
| `/deploy-check` | Pre-deploy readiness check |
| `/content-editor` | CMS / content editing workflow |
| `/web-interface-guidelines` | Apply the universal interface-guidelines check |

## Required policies the library enforces by convention

These are stated as **REQUIRED** across the appropriate MANAGER + RUNBOOK pairs:

- **Domain-scoped E2E** at the `release/* → main` merge (only the changed domains' E2E run; full-suite fallback on `«SHARED_PATHS»` changes; CI implementation in `github-actions-minutes-workflow.md`).
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

The library is verified against this battery (run `bin/lint` — see TODO below):

| Check | Status |
|---|:--:|
| Reuse-block coverage on every layer doc | ✅ 100% |
| MANAGER has Layer + Pairs-with + Owns/defers + OUTPUT FORMAT | ✅ 25/25 |
| RUNBOOK marked `Reusability: template-ready` | ✅ 63/63 |
| Zero product-name leaks (`empatalk`, `respect.click`, etc.) | ✅ |
| Zero deprecated tokens outside the glossary | ✅ |
| `«TOKEN»` discipline (canonical names registered in `PLACEHOLDERS.md`) | ✅ |
| `/ai-init` hint in every layer doc | ✅ 87/87 |

## Honest weak points (we know about these)

This library is **policy declared in prose, not enforcement deployed in repos.** Until at least one policy ships in a real `.github/`, the "REQUIRED" markers are intentions, not gates.

| # | Weak point | Concrete fix |
|---|---|---|
| 1 | **No live deployment** — 0 repos have actually adopted these docs end-to-end | Pick one repo; deploy the 5-doc minimum + `CODEOWNERS` + `shared-paths.txt` + the `boundaries` lint job |
| 2 | **No library-quality CI** — broken cross-refs, missing tokens, drift all go undetected | A 50-line `bin/lint`: cross-refs resolve, body tokens are in Reuse blocks, no orphan files, no deprecated tokens |
| 3 | **No sync mechanism for deployed copies** — when this library updates, repo copies drift silently | Add `_canonical_version` to each doc + a `bin/sync` script per repo |
| 4 | **No usage telemetry** — we don't know which docs are read, run, or dead weight | After 60 days of real use, audit which docs got read / referenced / run; retire unused |
| 5 | **Context cost** — MANAGERs are 200–400 lines each; running several burns LLM context | Mark MANAGER sections as "essential" / "deep"; agents can read essentials by default |

See `MANAGER_DOC_FRESHNESS.md` for the quarterly sweep that catches drift.

## Contributing

This library is curated by hand. Improvements welcome via PR, but:
- preserve the Reuse-block convention on every layer doc;
- run the (forthcoming) `bin/lint` before proposing changes;
- if you add a new MANAGER, also add its paired RUNBOOK (and vice versa) unless the boundary doc explicitly says no pair;
- new canonical tokens go in `PLACEHOLDERS.md`.

## License

See [LICENSE](./LICENSE).
