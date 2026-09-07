# Placeholder glossary & conventions

> **🔧 Reuse & local setup**
>
> Canonical copy — vendored at `docs/ai-product-builder/PLACEHOLDERS.md` (source of truth). Nothing in this file is filled per repo: it is the glossary the other docs' `«tokens»` are declared against.
>
> **Reusability:** template-ready — the token names, the two-kind rule and the deprecated-alias table are portable verbatim; a repo adds rows only when it coins a token no library doc already has.
>
> **Pairs with:** `MANAGER_INIT.md` (fills these interactively) and every layer doc's own `Local definitions to provide per repo` list. Boundary: this file says what a token **means**; MANAGER_INIT says how it gets **filled**; each doc says which ones **it** needs.
>
> **Owns / defers to:** Owns the canonical token names, the `«SCREAMING_SNAKE»` vs `«lowercase»` rule and the deprecated-alias table. Defers *the interactive fill flow, the answer file and secret handling* → `MANAGER_INIT.md`; *the slash-command surface* → `commands/ai-init.md`; *which tokens a given doc needs* → that doc's Reuse block.
>
> **Local definitions to provide per repo:** none.

**Last reviewed:** «DATE»

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

Owned by [`MANAGER_INIT.md`](./MANAGER_INIT.md), invoked as `/ai-init <DOC>`.

This file is the **glossary** — what each token means. How tokens get filled, where the
answers are stored, what the tool refuses to prompt for and how a re-run behaves are all
one document over there. Restating any of it here is how the init spec ended up in four
files.

## Layering tokens (`RUNBOOK_CLAUDE_MD`)

Used by the "what goes where" + declared-exception tables in `RUNBOOK_CLAUDE_MD.md`.
Pairs with the existing `«DOMAIN_PATHS»` (where feature domains live).

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«SHARED_LIB_PATH»` | repo | Where cross-cutting infrastructure lives — the directory that becomes a junk drawer if the layering rule isn't written down | src/lib |
| `«DEEP_IMPORT_PATH»` | per-occurrence | One deliberate deep import / rule-break, declared **with its reason** in the exception table | @/lib/x/sub-entrypoint |

## Landing-site + env-tier tokens (`RUNBOOK_LANDING_SITE_TEMPLATE`, `RUNBOOK_ENV_TIERED_ACCESS`, `RUNBOOK_ENV_EXAMPLE_TEMPLATE`)

Used by the landing-site blueprint + the Tier-1/Tier-2 env access pattern + the `.env.example` tutorial pattern. Extracted from a portfolio-wide audit that found 8 sibling sites manually normalizing to an implicit blueprint. `repo` = one value per site.

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«CI_FILE»` | repo | The workflow filename — the blueprint locks this at `.github/workflows/ci.yml` so README badges and audit reports stay portable | .github/workflows/ci.yml |
| `«CMS»` | repo | CMS choice — one of `storyblok`, `sanity`, `payload`, `none-static` | storyblok |
| `«CMS_SPACE_ID»` | repo | CMS project / space identifier — always in `.env.example`, never in `package.json` | 286732 |
| `«CMS_ACCESS_TOKEN_ENV»` | repo | Server-only CMS token env-var name — split from the public bridge token; `import 'server-only'` gates it | STORYBLOK_ACCESS_TOKEN |
| `«CMS_PUBLIC_TOKEN_ENV»` | repo | Public CMS bridge token env-var name — safe to inline; needed by the visual editor | NEXT_PUBLIC_STORYBLOK_PUBLIC_TOKEN |
| `«CMS_HOST»` | repo | CMS API hostname for the scheduled probe | api.storyblok.com |
| `«CMS_HEALTH_QUERY»` | repo | Real read query the scheduled probe hits (must exercise the actual read path, not a liveness ping) | https://api.storyblok.com/v2/cdn/stories/home?token=… |
| `«PROBE_SCHEDULE»` | repo | Cron expression for `cms-probe.yml` | `0 7 * * *` |
| `«ENV_EXAMPLE»` | repo | Path to the committed `.env` template that teaches WHY per var | .env.example |
| `«ENV_TIER1_PATH»` | repo | The sole file allowed to read `process.env` (Tier-1, Zod-validated on boot) | src/constants/env.ts |
| `«CONFIG_TIER2_PATH»` | repo | The typed config barrel every other file imports from | src/config/index.ts |
| `«VALIDATOR»` | repo | Runtime schema library used in Tier-1 | zod |
| `«INSTRUMENTATION_ENTRYPOINT»` | repo | Where the Tier-1 parse executes on process start (throws on missing env) | src/instrumentation.ts |
| `«AUDIT_ENV_CMD»` | repo | Script that diffs `.env.example` against the Tier-1 schema | pnpm audit:env |
| `«PAYMENTS_TEST_PREFIX»` / `«PAYMENTS_LIVE_PREFIX»` | repo | Provider-specific key prefixes the Tier-1 schema validates against | sk_test / sk_live |
| `«PAYMENTS_KEY_PREFIX»` | repo | Either of the above — used when the schema accepts both (validated by `startsWith`) | sk |
| `«RATE_LIMITER»` | repo | Rate-limit backend (typically Upstash Redis) referenced in `.env.example` traps | Upstash |

## Webhook-ledger + legal-guard tokens (`RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER`, `RUNBOOK_COMPILE_TIME_LEGAL_GUARDS`)

Used by the shared webhook-events ledger pattern + the compile-time legal-boundary guard mechanism. `repo` kind unless noted.

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«WEBHOOK_EVENTS_COLLECTION»` | repo | The shared ledger table/collection every inbound webhook claims through | webhook-events |
| `«PROVIDERS»` | repo | Comma-list of providers routed through the ledger — used in per-provider prefixes | stripe, przelewy24, resend, slack |
| `«PROVIDER»` | per-occurrence | One provider from `«PROVIDERS»` — the current handler's provider | stripe |
| `«SLOW_PATH_MS»` | repo | Slow-path warning threshold — set below the provider's retry cliff (5s for Stripe's 10s cliff) | 5000 |
| `«RECLAIM_INTERVAL_MIN»` | repo | How often the stale-claim reclaim cron runs | 10 |
| `«STALE_THRESHOLD_MS»` | repo | Age above which a `claimed`/`processing` row is considered orphaned and reclaimable | 300000 |
| `«GUARD_NAME»` | repo | Semantic name of a compile-time legal guard — one guard per boundary | NO_CUSTODY |
| `«GUARD_SPEC_PATH»` | repo | The test file that runs the guard in CI | src/lib/server/no-custody/forbidden.static.spec.ts |
| `«ALLOWLIST_PATH»` | repo | The small file listing intentional exceptions (each requires an ADR) | src/lib/server/no-custody/allowlist.ts |
| `«JURISDICTION»` | repo | The legal regime a guard enforces — cited in each forbidden-entry rationale | PL / EU under PSD2 |

## Doc-freshness probe tokens (`RUNBOOK_DOC_FRESHNESS_PROBES`)

Used by the `<!-- probe:key -->…<!-- /probe -->` marker mechanism that regenerates numeric doc claims from code. `repo` kind.

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«PROBE_SCRIPT»` | repo | The runner that scans docs, executes probes, and rewrites markers | scripts/tools/docs-audit.ts |
| `«PROBE_REGISTRY»` | repo | The file mapping probe keys → queries (each query is a pure function of the repo) | scripts/tools/probes.ts |

## Privacy + schema-first tokens (`RUNBOOK_PRIVACY_CONTRACT_TEST`, `RUNBOOK_SCHEMA_FIRST_GDPR_AVOIDANCE`)

`repo` kind.

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«INTEGRATION_TEST_DIR»` | repo | Where integration tests (real DB, no mocks) live | src/__integration__ |
| `«TEST_DB_HARNESS»` | repo | Fixture that spins up + tears down a real DB per test | testcontainers / ephemeral MongoDB |
| `«SCHEMA_PATH»` | repo | Where DB schema is defined (Payload collections, Prisma schema, Mongoose models) | src/payload/collections/*.ts |

## Ops runbook tokens (`RUNBOOK_TRIAGE_TREE_RUNBOOK`)

`repo` kind.

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«OPS_RUNBOOK_PATH»` | repo | Where the operational (incident-triage) runbook lives | docs/RUNBOOK.md |
| `«ESCALATION_ROSTER»` | repo | Where the on-call / escalation contact list lives | docs/ESCALATION.md |

## Portfolio-lessons skill tokens (`SKILL_RATIONALE_COMMENTS`, `SKILL_LAYOUT_NOT_PAGE_SINGLETONS`, `SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN`)

`repo` kind unless noted.

| Token | Kind | Meaning | Example |
|---|---|---|---|
| `«DENY_LIST_FILE»` | repo | The file holding a `NEVER_CACHE` / forbidden-tokens / any allow-or-deny list — used in rationale-comment examples | src/domains/shared/never-cache.ts |
| `«LAYOUT_PATH»` | repo | The route-tree layout file that will hold a singleton whose second construction throws | app/(shell)/layout.tsx |
| `«SINGLETON_PRIMITIVE»` | repo | The specific primitive that throws on second construction in this codebase | AudioContext.createMediaElementSource |
| `«CREATE_USER_CMD»` | repo | The CLI command that mints the break-glass / bootstrap account | pnpm create:user --can-push |
| `«RUNTIME»` | repo | The runtime the CLI executes under (used only to pick a recipe) | Node |
