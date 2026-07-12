# Placeholder glossary & conventions

Canonical token names and fill conventions for **every template in this folder**. When
you copy a doc into a repo, replace these `«tokens»`. Define the repeated ones **once**
in the repo's `.claude/CLAUDE.md`, then each doc only needs its extra specifics.

## Conventions

- **Guillemets `«…»` wrap ONLY a token to replace.** Real example values are written
  unwrapped, as `(e.g. …)`. So: `«NODE_VERSION»` is a token; `(e.g. 22.15.1)` is an example.
- **`«SCREAMING_SNAKE»`** = a named slot with **one value per repo** → safe to global
  find-replace.
- **`«lowercase»` / `«what goes here»`** = **fill inline**; the value differs at each
  occurrence (e.g. `«metric»`, `«amount»`, `«status»`, `«finding»`). Do *not* global-replace.
- **Sub-commands use a colon:** `«QUALITY_CMD:lint»`, `«QUALITY_CMD:types»`, etc.
- **Keep literal flags outside the token:** write `«DEPLOY» logs --since 30m`, never
  `«DEPLOY logs --since 30m»`. Same for any nested token inside a command.
- A single regex `«[^»]+»` should cleanly enumerate every fill slot in a file.

## Core tokens

| Token | Meaning | Example |
|---|---|---|
| `«PROJECT»` | Product / app / brand name | Acme |
| `«DOMAIN»` | Primary domain / URL | acme.app |
| `«REPO_URL»` | Canonical repo URL (no trailing slash) — used by issue-query links across docs | https://github.com/acme/acme-web |
| `«NODE_VERSION»` | Node version (from `.nvmrc`) | 22.15.1 |
| `«PKG_MGR»` | Package manager | pnpm / npm / yarn |
| `«QUALITY_CMD»` | Aggregate local gate | pnpm ci:quality |
| `«QUALITY_CMD:format\|lint\|types\|unit\|e2e\|build»` | Individual scripts | pnpm test:types |
| `«BUILD_CMD»` / `«TEST_CMD»` / `«E2E_CMD»` | Build / test / e2e commands | pnpm build |
| `«DB_CMS»` | Database / CMS | MongoDB + Payload |
| `«AUTH»` | Auth stack | Firebase Auth |
| `«PAYMENTS»` | Payment processor | Stripe |
| `«DEPLOY»` | Hosting / CI platform | Vercel + GitHub Actions |
| `«LOCALES»` | Supported locales | en, pl |
| `«TRUNK»` | Trunk branch | main |
| `«DATE»` | A date | 2026-05-25 |
| `«PORT»` | Dev server port (multi-brand: `«PORT_A»`/`«PORT_B»`) | 3000 |
| `«AI_PROVIDER»` | LLM provider | OpenAI |
| `«OBSERVABILITY»` | Error / telemetry | Sentry |
| `«HEALTH_ENDPOINT»` | Health route | /api/health |
| `«ADMIN_PATH»` | Admin route | /admin |
| `«DOMAIN_PATHS»` | Where feature domains live (path-based test scoping) | src/domains/<d>/** |
| `«SHARED_PATHS»` | Cross-cutting paths that force a full test/CI run when changed — a **single committed list** (e.g. `.github/shared-paths.txt`), read by CI + docs (never restated) | src/lib, packages/shared, config, lockfile, CI |
| `«API_ROUTES»` | API route file glob (for the OpenAPI / route-security parity gate) | app/api/**/route.ts |
| `«EMAIL_API_SECRET_ENV»` | Env-var name holding the secret for the internal email-send route (`x-api-secret` header) | EMAIL_API_SECRET / API_SECRET / etc. |

## Skill-layer tokens (`SKILL_*`)

Used by the `SKILL_*` layer (auto-triggered agent rules installed at
`.claude/skills/<name>/SKILL.md`). **Kind** follows the same classification as above:
`repo` = one value per repo (`/ai-init` prompts for it, safe to global find-replace);
`per-occurrence` = fill inline at each use, like `«DATE»` (`/ai-init` skips it).

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«SCHEDULER»` | repo | Scheduled-job / queue runner that invokes background work — **and its delivery guarantee** (almost always at-least-once) | platform cron + a queue consumer |
| `«EXTERNAL_PROVIDER»` | repo | Third-party service behind an **irreversible** side effect (mail, charge, push, outbound webhook) | transactional email API |
| `«CLIENT_FN»` | repo | A client/wrapper that **resolves** `{ success: false }` instead of throwing — so `try/catch` around it is dead code | sendEmail + its send*Email wrappers |
| `«VOID_HELPER»` | repo | The repo's **attributed** fire-and-forget wrapper for `«CLIENT_FN»` (greppable, captures once) | voidEmailSend |
| `«ACCESS_HELPER»` | repo | The repo's canonical access predicates — including the separately-typed **field-level** one | src/access.ts → isAdmin / isAdminOrSelf / isAdminField |
| `«REGEN_CMD»` | repo | The one command that regenerates a stateful skill's list (required by its staleness banner) | pnpm audit:routes |
| `«MARKER_FIELD»` | per-occurrence | The idempotency/claim marker a job stamps on a row — **one per job**, not one per repo | welcomeSentAt · reengagementStage |
| `«INCIDENT_REF»` | per-occurrence | How the repo cites the incident/issue that motivated a rule. **Cite the tracker; never hardcode a number that rots** | the repo's issue/incident ID |

## Agent-layer tokens (`AGENT_*` + `/board`)

Used by the `AGENT_*` exec-persona layer (installed at `.claude/agents/<name>.md`) and by
the `/board` command that convenes them. **Kind** follows the classification above.

The layer's one rule: **the agent file holds the lens, never the state.** These tokens are
deliberately *durable* — a year, a win-condition, an invariant, a command. Live state (issue
numbers, versions, ARR) is **never** tokenized into a persona; it is injected at invocation
by `commands/board.md`. See `AGENT_TEMPLATE.md`.

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«FUTURE_YEAR»` | repo | The year an exec persona writes back from — the retrospective device that licenses confident, past-tense judgment | ~3 years out (e.g. 2029) |
| `«WIN_CONDITION»` | repo | One sentence describing the future in which «PROJECT» already won; each persona restates it through its own lens (financial / funnel / reliability) | became the default X for Y, profitable at Z |
| `«DOMAIN_INVARIANT»` | repo | The **one** business rule that must never break; any scope item that violates it is killed on sight | we never hold customer funds · we never over-claim outcomes |
| `«BACKLOG_CMD»` | repo | The command that prints the live backlog — the **only** legal source of issue numbers for a persona | gh issue list --limit 100 --state open |
| `«CODE_PATHS_TO_READ»` | per-occurrence | The code paths a given lens must read before it is allowed to judge — **different per persona** (CFO: the money path; CPO: the funnel; CTO: routes + auth + CI) | src/lib/server/payments/** |
| `«TIME_BUDGET»` | repo | The team's real weekly capacity — what "too big to test in 7 days" means in this repo | 5–10 h/week (solo founder) |
| `«CEO_NAME»` / `«CFO_NAME»` / `«CPO_NAME»` / `«CTO_NAME»` | repo | Optional human name for each exec persona (a named advisor argues; a job title hedges). Delete the token and speak as "the CEO" if you'd rather not name them | — |

`«NORTH_STAR_METRIC»` (already used by `RUNBOOK_NORTH_STAR.md`, `RUNBOOK_METRICS.md`,
`RUNBOOK_EXPERIMENT_DESIGN.md`, `RUNBOOK_POWER_MOVES.md`) is reused as-is by this layer —
do **not** introduce a `«NORTH_STAR»` variant.

## Script- & config-layer tokens (`scripts/`, `config/`)

Used by `config/SETTINGS_TEMPLATE.json` + `RUNBOOK_PERMISSIONS_AND_AUTONOMY.md`
(the Claude Code permission contract installed at `.claude/settings.json`). All are
`repo` kind — one value per repo, safe to global find-replace.

**Note the split between `«DEPLOY»` and `«DEPLOY_CLI»`:** the first is the *platform*
(prose: "hosted on X"); the second is the *binary* whose `env` / `deploy` subcommands
appear in the deny-list. Keep literal subcommands **outside** the token —
`«DEPLOY_CLI» env pull`, never `«DEPLOY_CLI env pull»`.

| Token | Meaning | Example |
|---|---|---|
| `«TIER_PRICES»` | Price point(s) under test, per tier | 12 / 29 / 99 |
| `«CADENCE»` | Billing cadence being stressed | annual |
| `«CURRENCY»` | Currency symbol / code for money figures | $ |
| `«METRIC_TARGETS»` | Conversion / churn / burn assumptions under test | 2% conv, 5% churn, $30/mo burn |
| `«ENV_VAR»` | An environment variable name referenced in prose | «PAYMENTS»_WEBHOOK_SECRET |
| `«DEPLOY_CLI»` | Deploy platform's **CLI binary** — the one whose `env add`/`rm`/`pull` and `deploy`/`promote`/`rollback` subcommands are denied to the agent | the hosting provider's CLI |
| `«DB_CLI»` | Database / CMS **CLI binary**, allowed only against a *local* instance | mongosh / psql / redis-cli |
| `«RUNTIME_CLI»` | Language-runtime binary the agent may run freely | node / python3 / go |
| `«DOCS_DOMAIN»` | A documentation domain the agent may `WebFetch` without asking — one allow-list line per domain | docs.example.com |

## Deprecated aliases — do not use

| Old | Use |
|---|---|
| `«PRODUCT_NAME»`, `«BRAND_NAME»`, `«PRODUCT»` | `«PROJECT»` |
| `«PRIMARY_DOMAIN»` | `«DOMAIN»` |
| `«PACKAGE_MANAGER»` | `«PKG_MGR»` |
| `«AGGREGATE_QUALITY_CMD»` | `«QUALITY_CMD»` |
| `«DB/CMS»`, `«DB»`, `«CMS_OR_ORM»` | `«DB_CMS»` |
| `«AUTH_STACK»` | `«AUTH»` |
| `«DEPLOY_PLATFORM»` | `«DEPLOY»` |
| `«YYYY-MM-DD»` | `«DATE»` |
| `«BUILD/TEST/E2E»`, `«E2E_COMMANDS»` | `«BUILD_CMD»` / `«TEST_CMD»` / `«E2E_CMD»` |
| `«22.15.1»` (literal-as-token) | `«NODE_VERSION»` |

## Init system (interactive bootstrap)

Every layer doc carries a **"Local definitions to provide per repo"** list in its
`🔧 Reuse & local setup` block. To fill these interactively instead of by hand:

```bash
/ai-init RUNBOOK_RELEASE_MANAGER
```

(or invoke `MANAGER_INIT.md` against any doc — same flow, no slash command needed).

The init tool:
- **prompts only for `«SCREAMING_SNAKE»`** persistent tokens (skips `«lowercase»` inline-fill
  and per-invocation tokens like `«DATE»` / `«X.Y.Z»`);
- **persists answers** to **`.claude/ai-init.local.json`** (committed — repo facts, not
  secrets);
- is **diff-aware on re-run** — only prompts for newly-added tokens; never deletes existing
  answers;
- offers to **render a filled `docs/ai-product-builder/<NAME>.local.md`** when asked (default: no; co-located with the vendored template);
- **refuses secrets** (`*_SECRET` / `*_KEY` / `*_PASSWORD` / `*_TOKEN` without `_ENV` suffix)
  and routes them to `.env.local`.

### Answer-file shape

`.claude/ai-init.local.json`:

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
    "TRUNK": "main",
    "DOMAIN_PATHS": "src/domains/[^/]+",
    "SHARED_PATHS": ".github/shared-paths.txt"
  },
  "_meta": {
    "last_init": "2026-05-26",
    "docs_rendered": []
  }
}
```

Token keys are **bare** (no `«»`). Guillemets only appear in templates.

See **`MANAGER_INIT.md`** for the full spec (token classification, special tokens,
file-backed bootstrap, anti-patterns).


## Layering tokens (`RUNBOOK_CLAUDE_MD`)

Used by the "what goes where" + declared-exception tables in `RUNBOOK_CLAUDE_MD.md`.
Pairs with the existing `«DOMAIN_PATHS»` (where feature domains live).

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«SHARED_LIB_PATH»` | repo | Where cross-cutting infrastructure lives — the directory that becomes a junk drawer if the layering rule isn't written down | src/lib |
| `«DEEP_IMPORT_PATH»` | per-occurrence | One deliberate deep import / rule-break, declared **with its reason** in the exception table | @/lib/x/sub-entrypoint |
