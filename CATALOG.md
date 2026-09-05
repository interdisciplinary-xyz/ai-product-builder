# Catalog

Every file in the library, by layer. **Source** links to the file in this repo; **Deployed as**
is the name it takes in your repo after `npm run deploy` (the `RUNBOOK_` prefix is stripped,
`MANAGER_` is kept — [why](CONTRIBUTING.md#why-the-prefixes-behave-differently)).

| Layer | Files | Goes to |
|---|:--:|---|
| 🎩 [Agents](#agents) | 5 | `.claude/agents/` |
| ⌨️ [Commands](#commands) | 11 | `.claude/commands/` |
| 🔒 [Config](#config) | 1 | `.claude/settings.json` |
| 🎛️ [Managers](#managers) | 25 | `docs/` |
| 🏷️ [Meta](#meta) | 1 | `docs/` |
| 📘 [Runbooks](#runbooks) | 74 | `docs/` |
| 🧮 [Scripts](#scripts) | 2 | run in place |
| ⚡ [Skills](#skills) | 8 | `.claude/skills/` |

---

## Agents

🎩 Read-only advisory lenses. Convened by [`/board`](src/commands/board.md), which injects live
state and reports where they **disagree**. The lens lives in the file; the state never does.

| Source | Deployed as | What it is |
|---|---|---|
| [`AGENT_CEO.md`](src/agents/AGENT_CEO.md) | `ceo.md` | Strategy lens: distribution and trust beat features; one bet per release. |
| [`AGENT_CFO.md`](src/agents/AGENT_CFO.md) | `cfo.md` | Money lens: ranks by revenue-at-risk × probability − build cost; blocks traffic on a leaking money path. |
| [`AGENT_CPO.md`](src/agents/AGENT_CPO.md) | `cpo.md` | Funnel lens: the funnel is the product; never ship the editor before the viewer. |
| [`AGENT_CTO.md`](src/agents/AGENT_CTO.md) | `cto.md` | Risk lens: correctness over cleverness; a green pipeline that skips the money path is a lie. |
| [`AGENT_TEMPLATE.md`](src/agents/AGENT_TEMPLATE.md) | — | The anatomy for writing your own. Lens in the file, live state injected, one invariant, a named verdict. |

## Commands

⌨️ Slash-commands. The four `audit-*` ones write a **dated report**, diff it against the previous
run, and open an issue **only when a number gets worse**.

| Source | Deployed as | What running it does |
|---|---|---|
| [`ai-init.md`](src/commands/ai-init.md) | `/ai-init` | Prompts for a doc's `«placeholder»` values, saves them to `.claude/ai-init.local.json`, optionally renders the doc. |
| [`board.md`](src/commands/board.md) | `/board` | Gathers backlog, commits and docs; fans out to all four exec lenses; synthesizes their disagreement into one call. |
| [`review.md`](src/commands/review.md) | `/review` | Diffs the branch against trunk and reviews it against your lint, i18n, design-token and auth conventions. |
| [`test.md`](src/commands/test.md) | `/test` | Runs format, lint, type-check and unit tests in order; reports a pass/fail table. |
| [`deploy-check.md`](src/commands/deploy-check.md) | `/deploy-check` | Adds build, clean-tree, commit-convention and up-to-date-with-trunk checks; prints READY / NOT READY. |
| [`content-editor.md`](src/commands/content-editor.md) | `/content-editor` | Reads, creates, updates or deletes CMS content per locale via the admin API. |
| [`web-interface-guidelines.md`](src/commands/web-interface-guidelines.md) | `/web-interface-guidelines` | Reviews files against a11y, focus, forms, animation and performance rules. Brevity over grammar. |
| [`audit-structure.md`](src/commands/audit-structure.md) | `/audit-structure` | Runs the repo's own architecture-DAG, observability-tag and type-drift enforcers; summarizes PASS/FAIL. |
| [`audit-api-routes.md`](src/commands/audit-api-routes.md) | `/audit-api-routes` | Checks route ↔ OpenAPI parity, rate-limit / validation / auth gates, and IDOR risk. |
| [`audit-design-system.md`](src/commands/audit-design-system.md) | `/audit-design-system` | Greps raw hex, arbitrary utility values and one-off components; trends the counts run over run. |
| [`audit-performance.md`](src/commands/audit-performance.md) | `/audit-performance` | Measures First Load JS, PageSpeed scores, raw `<img>`, unused deps, unindexed hot fields. |

## Config

🔒 The permission boundary, in one file.

| Source | Deployed as | What it is |
|---|---|---|
| [`SETTINGS_TEMPLATE.json`](src/config/SETTINGS_TEMPLATE.json) | `.claude/settings.json` | Allow-lists git / gh / package / read-only Bash. **Denies merge, rebase, force-push, the deploy CLI, and every `.env` write.** The human merges, deploys and touches secrets. |

Paired with [`PERMISSIONS_AND_AUTONOMY`](src/runbooks/RUNBOOK_PERMISSIONS_AND_AUTONOMY.md),
which explains every deny line — JSON can't carry comments.

## Managers

🎛️ A playbook you **run** against a repo. It creates, verifies, or audits a document — usually the
runbook of the same name.

| Source | What running it does |
|---|---|
| [`MANAGER_A11Y_AUDIT.md`](src/managers/MANAGER_A11Y_AUDIT.md) | Audits WCAG 2.1 AA per release, enforcing the axe gate and shrinking the known-violations allowlist. |
| [`MANAGER_AI_WORKFLOW.md`](src/managers/MANAGER_AI_WORKFLOW.md) | Defines AI-tool responsibilities and the cost-aware local-vs-cloud validation strategy. |
| [`MANAGER_ARCHITECTURE.md`](src/managers/MANAGER_ARCHITECTURE.md) | Maintains a verified architecture map — stack, structure, domain boundaries, system flows. |
| [`MANAGER_CONTENT_PUBLISHING.md`](src/managers/MANAGER_CONTENT_PUBLISHING.md) | Runs the editorial calendar, pre-publish checklist, promotion and quarterly content audit. |
| [`MANAGER_CONTRIBUTING.md`](src/managers/MANAGER_CONTRIBUTING.md) | Builds the human contributor entry point — branching, release, QA and session flow. |
| [`MANAGER_DECISION_LOG.md`](src/managers/MANAGER_DECISION_LOG.md) | Records architectural decisions, rejected alternatives and tradeoffs as verified ADRs. |
| [`MANAGER_DESIGN_REVIEW.md`](src/managers/MANAGER_DESIGN_REVIEW.md) | Writes per-feature specs before build, then verifies the shipped UI against them. |
| [`MANAGER_DESIGN_SYSTEM.md`](src/managers/MANAGER_DESIGN_SYSTEM.md) | Audits components, tokens, spacing, typography, responsive rules and UI states for drift. |
| [`MANAGER_DEV_ONBOARDING.md`](src/managers/MANAGER_DEV_ONBOARDING.md) | Guarantees a day-one green build and a 30-minute domain smoke for a new dev. |
| [`MANAGER_DISCOVERY.md`](src/managers/MANAGER_DISCOVERY.md) | Paces PMF reads, scores qualitative quotes, and refreshes the living ICP doc. |
| [`MANAGER_DOC_FRESHNESS.md`](src/managers/MANAGER_DOC_FRESHNESS.md) | Sweeps docs for drift, dates them, and retires the ones that stopped earning their place. |
| [`MANAGER_ENGINEERING_STANDARDS.md`](src/managers/MANAGER_ENGINEERING_STANDARDS.md) | Defines how code is written — conventions, philosophy, typing, error handling. |
| [`MANAGER_EXPERIMENT.md`](src/managers/MANAGER_EXPERIMENT.md) | Enforces hypothesis discipline, pre-launch kill criteria, and a decision at the end. |
| [`MANAGER_FOUNDER_OPS.md`](src/managers/MANAGER_FOUNDER_OPS.md) | Keeps the daily ritual, weekly retro, dashboard pass and decision bands alive. |
| [`MANAGER_I18N.md`](src/managers/MANAGER_I18N.md) | Maintains the locale list, translation cadence, missing-key detection, pseudo-locale and RTL checks. |
| [`MANAGER_INCIDENT_RESPONSE.md`](src/managers/MANAGER_INCIDENT_RESPONSE.md) | Grades SEVs, names an incident commander, drives blameless post-mortems to action items. |
| [`MANAGER_INIT.md`](src/managers/MANAGER_INIT.md) | Interactively fills any doc's `«placeholders»` and persists them to `.claude/ai-init.local.json`. |
| [`MANAGER_LAUNCH_GTM.md`](src/managers/MANAGER_LAUNCH_GTM.md) | Sequences narrative, channels, target list and outreach against cohort gates and kill criteria. |
| [`MANAGER_PAYMENTS_COMPLIANCE.md`](src/managers/MANAGER_PAYMENTS_COMPLIANCE.md) | Verifies the code stays on the SaaS side of the payment-institution custody boundary. |
| [`MANAGER_PERFORMANCE.md`](src/managers/MANAGER_PERFORMANCE.md) | Enforces Core Web Vitals and bundle budgets as ratcheting CI gates, per release. |
| [`MANAGER_PRODUCT_CONTEXT.md`](src/managers/MANAGER_PRODUCT_CONTEXT.md) | Captures stage, ICP, priorities and anti-goals, so the agent builds the right thing. |
| [`MANAGER_PROJECT.md`](src/managers/MANAGER_PROJECT.md) | Turns one milestone's scope into a plan with RAID, status, and a clean closeout. |
| [`MANAGER_SECURITY.md`](src/managers/MANAGER_SECURITY.md) | Audits auth, APIs, AI integrations, uploads, secrets and dependencies against the security policy. |
| [`MANAGER_SEO.md`](src/managers/MANAGER_SEO.md) | Audits metadata, canonicals, hreflang, JSON-LD, robots/sitemap; gates thin programmatic pages. |
| [`MANAGER_TESTING_STRATEGY.md`](src/managers/MANAGER_TESTING_STRATEGY.md) | Defines test layers, critical paths, what **not** to test, and the local-vs-CI split. |

## Meta

🏷️ The token glossary every other document reads from.

| Source | Deployed as | What it is |
|---|---|---|
| [`PLACEHOLDERS.md`](src/meta/PLACEHOLDERS.md) | `PLACEHOLDERS.md` | The canonical `«token»` glossary. `«SCREAMING_SNAKE»` is one value per repo; `«lowercase»` is filled inline per occurrence. |

## Runbooks

📘 A document you **fill**. This is the artifact your team actually lives with. Sorted by deployed
name.

| Source | Deployed as | What it becomes |
|---|---|---|
| [`RUNBOOK_A11Y_AUDIT.md`](src/runbooks/RUNBOOK_A11Y_AUDIT.md) | `A11Y_AUDIT.md` | WCAG 2.1 AA audit record — axe scan, allowlist, keyboard, contrast, motion findings. |
| [`RUNBOOK_ACTIVATION_EVENT.md`](src/runbooks/RUNBOOK_ACTIVATION_EVENT.md) | `ACTIVATION_EVENT.md` | Locked definition of the activation event — its schema, its write site, its read sites. |
| [`RUNBOOK_AI_PROMPT_REGISTRY.md`](src/runbooks/RUNBOOK_AI_PROMPT_REGISTRY.md) | `AI_PROMPT_REGISTRY.md` | Inventory of every LLM prompt — model, tokens, temperature, cost tier, safety notes. |
| [`RUNBOOK_AUDIT.md`](src/runbooks/RUNBOOK_AUDIT.md) | `AUDIT.md` | Point-in-time repo audit — graded code quality, security, perf, testing, CI, action items. |
| [`RUNBOOK_BACKUP_RECOVERY.md`](src/runbooks/RUNBOOK_BACKUP_RECOVERY.md) | `BACKUP_RECOVERY.md` | Backup inventory with RPO/RTO targets, the restore runbook, and a drill cadence. |
| [`RUNBOOK_BRAND_VOICE_GUIDELINE.md`](src/runbooks/RUNBOOK_BRAND_VOICE_GUIDELINE.md) | `BRAND_VOICE_GUIDELINE.md` | Tone principles, vocabulary, UI copy rules, messaging hierarchy, AI-content rules. |
| [`RUNBOOK_BUSINESS_PLAN.md`](src/runbooks/RUNBOOK_BUSINESS_PLAN.md) | `BUSINESS_PLAN.md` | Price promise, fee losses, plan structure, unit economics, funnel. |
| [`RUNBOOK_CLAUDE_MD.md`](src/runbooks/RUNBOOK_CLAUDE_MD.md) | `CLAUDE_MD.md` | Thin project-memory template defining the canonical tokens every other doc reads. |
| [`RUNBOOK_CMS_PROBE_SCHEDULED.md`](src/runbooks/RUNBOOK_CMS_PROBE_SCHEDULED.md) | `CMS_PROBE_SCHEDULED.md` | Scheduled GitHub Actions probe that catches silent CMS outages the fail-open fallback masks. |
| [`RUNBOOK_COMMUNITY_MODEL.md`](src/runbooks/RUNBOOK_COMMUNITY_MODEL.md) | `COMMUNITY_MODEL.md` | Viral loop, distribution channels, segments, content plan, anti-patterns. |
| [`RUNBOOK_COMPILE_TIME_LEGAL_GUARDS.md`](src/runbooks/RUNBOOK_COMPILE_TIME_LEGAL_GUARDS.md) | `COMPILE_TIME_LEGAL_GUARDS.md` | The `FORBIDDEN_TOKENS`-style AST allowlist that encodes a legal boundary (custody, Article 9) as a build-failing static check. |
| [`RUNBOOK_DAILY_RITUAL.md`](src/runbooks/RUNBOOK_DAILY_RITUAL.md) | `DAILY_RITUAL.md` | The ten-minute weekday check: errors, analytics, replays, payments, feedback — in order. |
| [`RUNBOOK_DATA_MODEL_GUIDE.md`](src/runbooks/RUNBOOK_DATA_MODEL_GUIDE.md) | `DATA_MODEL_GUIDE.md` | Source-of-truth data model — per-collection field tables, relationships, integrity rules. |
| [`RUNBOOK_DECISION_LOG.md`](src/runbooks/RUNBOOK_DECISION_LOG.md) | `DECISION_LOG.md` | Single-file ADR log — Decision / Why / Alternatives / Revisit-when. Append and supersede. |
| [`RUNBOOK_DECISION_THRESHOLDS.md`](src/runbooks/RUNBOOK_DECISION_THRESHOLDS.md) | `DECISION_THRESHOLDS.md` | Kill / iterate / expand bands, pre-committed **before** the first user arrives. |
| [`RUNBOOK_DEV_PORTLESS.md`](src/runbooks/RUNBOOK_DEV_PORTLESS.md) | `DEV_PORTLESS.md` | Portless local dev — HTTPS `.local` hostnames, no ports, webhook-ready. |
| [`RUNBOOK_DOC_FRESHNESS_PROBES.md`](src/runbooks/RUNBOOK_DOC_FRESHNESS_PROBES.md) | `DOC_FRESHNESS_PROBES.md` | The `<!-- probe:key --><!-- /probe -->` marker mechanism that regenerates numeric doc claims from code — the implementation half of `MANAGER_DOC_FRESHNESS`. |
| [`RUNBOOK_E2E.md`](src/runbooks/RUNBOOK_E2E.md) | `E2E.md` | E2E inventory — critical-path coverage, spec catalogue, how to add tests, what's out of scope. |
| [`RUNBOOK_EMAILS_WORKFLOW.md`](src/runbooks/RUNBOOK_EMAILS_WORKFLOW.md) | `EMAILS_WORKFLOW.md` | Transactional email inventory — trigger, timing, recipient, test entry-point per template. |
| [`RUNBOOK_EMAIL_DELIVERABILITY.md`](src/runbooks/RUNBOOK_EMAIL_DELIVERABILITY.md) | `EMAIL_DELIVERABILITY.md` | SPF/DKIM/DMARC DNS setup, inbox-placement matrix, remediation steps. |
| [`RUNBOOK_EMAIL_QA_MATRIX.md`](src/runbooks/RUNBOOK_EMAIL_QA_MATRIX.md) | `EMAIL_QA_MATRIX.md` | Pre-launch email QA — per-template triggers and per-inbox render checks. |
| [`RUNBOOK_ENV_EXAMPLE_TEMPLATE.md`](src/runbooks/RUNBOOK_ENV_EXAMPLE_TEMPLATE.md) | `ENV_EXAMPLE_TEMPLATE.md` | `.env.example` as onboarding tutorial — one comment per var explaining *why* it is the shape it is, plus the `audit:env` script that catches schema drift. |
| [`RUNBOOK_ENV_TIERED_ACCESS.md`](src/runbooks/RUNBOOK_ENV_TIERED_ACCESS.md) | `ENV_TIERED_ACCESS.md` | Tier-1/Tier-2 env access — one file (Zod-validated on boot) touches `process.env`; every other file imports a typed config barrel. |
| [`RUNBOOK_EXPERIMENT_DESIGN.md`](src/runbooks/RUNBOOK_EXPERIMENT_DESIGN.md) | `EXPERIMENT_DESIGN.md` | One experiment — hypothesis, variants, sample size, kill/success criteria, instrumentation. |
| [`RUNBOOK_FEATURES.md`](src/runbooks/RUNBOOK_FEATURES.md) | `FEATURES.md` | Feature catalogue — per-feature description, detail table, related files. |
| [`RUNBOOK_FEATURE_SPEC.md`](src/runbooks/RUNBOOK_FEATURE_SPEC.md) | `FEATURE_SPEC.md` | Per-section jobs, levers, acceptance criteria, build plan, sign-off. |
| [`RUNBOOK_FOUNDER_DASHBOARD.md`](src/runbooks/RUNBOOK_FOUNDER_DASHBOARD.md) | `FOUNDER_DASHBOARD.md` | One screen of business health — acquisition, activation, retention, revenue, with action thresholds. |
| [`RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md`](src/runbooks/RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md) | `GDPR_PRE_LAUNCH_CHECKLIST.md` | Lawful basis, Article 9 data, DPAs, retention, incident readiness. |
| [`RUNBOOK_GITHUB_ACTIONS.md`](src/runbooks/RUNBOOK_GITHUB_ACTIONS.md) | `GITHUB_ACTIONS.md` | The CI cost policy — branch model, per-job cost, domain-scoped E2E, required gates. |
| [`RUNBOOK_ICP.md`](src/runbooks/RUNBOOK_ICP.md) | `ICP.md` | Personas, anti-ICP, funnel map, channel matrix, validation plan. |
| [`RUNBOOK_INCIDENTS.md`](src/runbooks/RUNBOOK_INCIDENTS.md) | `INCIDENTS.md` | Incident triage — per-incident symptoms, triage commands, causes, manual recovery. |
| [`RUNBOOK_LAUNCH_NARRATIVE.md`](src/runbooks/RUNBOOK_LAUNCH_NARRATIVE.md) | `LAUNCH_NARRATIVE.md` | The founder-voice launch post — anecdote, what it does, moat, audience, CTA. |
| [`RUNBOOK_LAUNCH_SOCIAL.md`](src/runbooks/RUNBOOK_LAUNCH_SOCIAL.md) | `LAUNCH_SOCIAL.md` | Per-channel post matrix — anti-patterns, posting order, UTM convention, one-shot gating. |
| [`RUNBOOK_LAUNCH_TARGET_LIST.md`](src/runbooks/RUNBOOK_LAUNCH_TARGET_LIST.md) | `LAUNCH_TARGET_LIST.md` | Scored list of first-cohort users — ICP-fit rubric, columns, where to mine them. |
| [`RUNBOOK_LANDING_SITE_TEMPLATE.md`](src/runbooks/RUNBOOK_LANDING_SITE_TEMPLATE.md) | `LANDING_SITE_TEMPLATE.md` | The marketing/landing-site blueprint — the shared shape 8+ sibling landing sites already follow by hand, now codified so drift stops accumulating. |
| [`RUNBOOK_LEGAL_RISK.md`](src/runbooks/RUNBOOK_LEGAL_RISK.md) | `LEGAL_RISK.md` | Data/AI processing, regime matrix, liability, IP, recommendations. |
| [`RUNBOOK_MAINTENANCE.md`](src/runbooks/RUNBOOK_MAINTENANCE.md) | `MAINTENANCE.md` | Running costs — service cost table, free-tier cliffs, cost-per-action, monitoring checklist. |
| [`RUNBOOK_METRICS.md`](src/runbooks/RUNBOOK_METRICS.md) | `METRICS.md` | Canonical KPI definitions — NSM, activation, retention, expansion, cost — with targets. |
| [`RUNBOOK_NORTH_STAR.md`](src/runbooks/RUNBOOK_NORTH_STAR.md) | `NORTH_STAR.md` | Mission thesis, the one north-star metric, rejected alternatives, targets, failure signals. |
| [`RUNBOOK_OBSERVABILITY.md`](src/runbooks/RUNBOOK_OBSERVABILITY.md) | `OBSERVABILITY.md` | Event taxonomy, dual-emit flow, consent gate, error tags, source-map upload. |
| [`RUNBOOK_ONBOARDING_PACK.md`](src/runbooks/RUNBOOK_ONBOARDING_PACK.md) | `ONBOARDING_PACK.md` | Day-one guide — prereqs, first green build, reading order, 30-minute smoke. |
| [`RUNBOOK_OUTREACH_TEMPLATES.md`](src/runbooks/RUNBOOK_OUTREACH_TEMPLATES.md) | `OUTREACH_TEMPLATES.md` | Founder-voice DM/email templates and the cadence for recruiting the first cohort. |
| [`RUNBOOK_PAYMENTS_COMPLIANCE.md`](src/runbooks/RUNBOOK_PAYMENTS_COMPLIANCE.md) | `PAYMENTS_COMPLIANCE.md` | The platform-vs-payment-institution boundary — custody rules, provider split, forbidden-token CI gate. |
| [`RUNBOOK_PAYMENTS_LIFECYCLE.md`](src/runbooks/RUNBOOK_PAYMENTS_LIFECYCLE.md) | `PAYMENTS_LIFECYCLE.md` | Processor setup, test-mode verification, the live flip, and the founder's own $-test. |
| [`RUNBOOK_PERMISSIONS_AND_AUTONOMY.md`](src/runbooks/RUNBOOK_PERMISSIONS_AND_AUTONOMY.md) | `PERMISSIONS_AND_AUTONOMY.md` | The *why* behind `settings.json` — autonomy table, deny-list rationale, the prune ritual. |
| [`RUNBOOK_POWER_MOVES.md`](src/runbooks/RUNBOOK_POWER_MOVES.md) | `POWER_MOVES.md` | Twenty prioritized launch-horizon moves across CEO/CTO/CFO/data lenses. |
| [`RUNBOOK_PRE_LAUNCH_CHECKLIST.md`](src/runbooks/RUNBOOK_PRE_LAUNCH_CHECKLIST.md) | `PRE_LAUNCH_CHECKLIST.md` | The engineering launch gate — headers, SEO, observability, performance, acceptance criteria. |
| [`RUNBOOK_PRIVACY_CONTRACT_TEST.md`](src/runbooks/RUNBOOK_PRIVACY_CONTRACT_TEST.md) | `PRIVACY_CONTRACT_TEST.md` | Three integration-test shapes (intersection-only reveal, cascade delete, non-derivability) that prove a privacy claim against a real DB, not a mock. |
| [`RUNBOOK_PRICING_STRATEGY.md`](src/runbooks/RUNBOOK_PRICING_STRATEGY.md) | `PRICING_STRATEGY.md` | Tier table, metering limits, feature gating, price IDs, cost-per-action math. |
| [`RUNBOOK_PRODUCT_MARKETING_CONTEXT.md`](src/runbooks/RUNBOOK_PRODUCT_MARKETING_CONTEXT.md) | `PRODUCT_MARKETING_CONTEXT.md` | The product-facts pack your copywriting and SEO skills read from. |
| [`RUNBOOK_PRODUCT_POSITIONING.md`](src/runbooks/RUNBOOK_PRODUCT_POSITIONING.md) | `PRODUCT_POSITIONING.md` | Category claim, what-it-is-not, ICP, anti-positioning, differentiators. |
| [`RUNBOOK_PROJECT_PLAN.md`](src/runbooks/RUNBOOK_PROJECT_PLAN.md) | `PROJECT_PLAN.md` | Per-milestone plan — goal, DRI, WIP cap, RAID, status snapshots. |
| [`RUNBOOK_PULL_REQUEST_TEMPLATE.md`](src/runbooks/RUNBOOK_PULL_REQUEST_TEMPLATE.md) | `PULL_REQUEST_TEMPLATE.md` | The `.github` PR template — quality gates, error taxonomy, env registry, review policy. |
| [`RUNBOOK_QUALITY_ASSURANCE.md`](src/runbooks/RUNBOOK_QUALITY_ASSURANCE.md) | `QUALITY_ASSURANCE.md` | The pre-merge gate — commands, audits, budgets, severity rules. |
| [`RUNBOOK_REFERRAL_MECHANICS.md`](src/runbooks/RUNBOOK_REFERRAL_MECHANICS.md) | `REFERRAL_MECHANICS.md` | Referral spec — model choice, benefits, attribution, anti-abuse, k-factor, break-even. |
| [`RUNBOOK_RELEASE_MANAGER.md`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md) | `RELEASE_MANAGER.md` | Branch flow from implementation to production, plus the CI cost-control policy. |
| [`RUNBOOK_RFC_TEMPLATE.md`](src/runbooks/RUNBOOK_RFC_TEMPLATE.md) | `RFC_TEMPLATE.md` | One-proposal RFC card — problem, proposal, effort, decision, rationale. |
| [`RUNBOOK_ROADMAP.md`](src/runbooks/RUNBOOK_ROADMAP.md) | `ROADMAP.md` | Vision, a testable beta hypothesis, feature-state matrix, milestones with acceptance criteria. |
| [`RUNBOOK_SCALING.md`](src/runbooks/RUNBOOK_SCALING.md) | `SCALING.md` | Scaling audit — bottlenecks by severity, phased fix roadmap, cost projections. |
| [`RUNBOOK_SCHEMA_FIRST_GDPR_AVOIDANCE.md`](src/runbooks/RUNBOOK_SCHEMA_FIRST_GDPR_AVOIDANCE.md) | `SCHEMA_FIRST_GDPR_AVOIDANCE.md` | The safest data is data you never had — schema-design pattern that makes Article 9 special-category collection structurally impossible. |
| [`RUNBOOK_SECRETS_ROTATION.md`](src/runbooks/RUNBOOK_SECRETS_ROTATION.md) | `SECRETS_ROTATION.md` | Secret inventory, rotation cadence, per-vendor playbooks, emergency-leak revocation. |
| [`RUNBOOK_SECURITY_MODEL.md`](src/runbooks/RUNBOOK_SECURITY_MODEL.md) | `SECURITY_MODEL.md` | Auth tiers, access matrix, rate limits, webhook signing, env validation. |
| [`RUNBOOK_SEO_AUDIT.md`](src/runbooks/RUNBOOK_SEO_AUDIT.md) | `SEO_AUDIT.md` | Technical SEO audit — metadata, structured data, sitemap, thin content, programmatic inventory. |
| [`RUNBOOK_SESSION_MIGRATION.md`](src/runbooks/RUNBOOK_SESSION_MIGRATION.md) | `SESSION_MIGRATION.md` | How an AI session hands off and restores state instead of re-learning the repo. |
| [`RUNBOOK_SMOKE_TEST.md`](src/runbooks/RUNBOOK_SMOKE_TEST.md) | `SMOKE_TEST.md` | Manual per-page QA run before every release — route, action, pass criteria. |
| [`RUNBOOK_TEAM_PLAYBOOK.md`](src/runbooks/RUNBOOK_TEAM_PLAYBOOK.md) | `TEAM_PLAYBOOK.md` | Team conventions — workflow, branching, code standards, testing, env setup, deployment. |
| [`RUNBOOK_THIRD_PARTY.md`](src/runbooks/RUNBOOK_THIRD_PARTY.md) | `THIRD_PARTY.md` | Vendor inventory by cost model — purpose, pricing, env vars, cost-risk summary. |
| [`RUNBOOK_TRANSLATION_WORKFLOW.md`](src/runbooks/RUNBOOK_TRANSLATION_WORKFLOW.md) | `TRANSLATION_WORKFLOW.md` | Locale matrix, key-naming convention, missing-key audit, new-locale checklist, i18n gotchas. |
| [`RUNBOOK_TRIAGE_TREE_RUNBOOK.md`](src/runbooks/RUNBOOK_TRIAGE_TREE_RUNBOOK.md) | `TRIAGE_TREE_RUNBOOK.md` | Write the ops runbook as a decision tree ("can you reach `/`? if yes ..."), not section-per-subsystem. |
| [`RUNBOOK_USER_OBSERVATION.md`](src/runbooks/RUNBOOK_USER_OBSERVATION.md) | `USER_OBSERVATION.md` | Usability observation script plus the Sean Ellis PMF interview, with scoring bands. |
| [`RUNBOOK_UX_PRINCIPLES.md`](src/runbooks/RUNBOOK_UX_PRINCIPLES.md) | `UX_PRINCIPLES.md` | Design system, visual identity, copy rules, notifications, accessibility target. |
| [`RUNBOOK_WEB_VITALS_AUDIT.md`](src/runbooks/RUNBOOK_WEB_VITALS_AUDIT.md) | `WEB_VITALS_AUDIT.md` | Core Web Vitals audit — LCP/INP/CLS budgets, bundle offenders, fix roadmap. |
| [`RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER.md`](src/runbooks/RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER.md) | `WEBHOOK_IDEMPOTENCY_LEDGER.md` | Shared `webhook-events` ledger + two-phase claim/process/complete + timing-safe signature + slow-path SLO — one pattern across every provider. |
| [`RUNBOOK_WEEKLY_RETRO.md`](src/runbooks/RUNBOOK_WEEKLY_RETRO.md) | `WEEKLY_RETRO.md` | The Friday retro — numbers, learned, changing, decision-threshold check, anti-patterns. |

## Scripts

🧮 Python, standard library only, no dependencies. *A playbook that ends in a number should ship
the calculator that produces it.*

| Source | Run it | What it answers |
|---|---|---|
| [`sensitivity-table.py`](src/scripts/sensitivity-table.py) | `python3 sensitivity-table.py` | **Which variable, off by 50%, kills the model?** Moves each one the wrong way, ranks the damage, and exposes the monthly-vs-annual fee physics. Prints trip-wires, not a forecast. |
| [`score-sean-ellis.py`](src/scripts/score-sean-ellis.py) | `python3 score-sean-ellis.py responses.json` | **What's the PMF read after discounting polite signal?** Prints a raw verdict and a discounted one. The bundled example scores **raw 40% PASS / discounted 20% FAIL**. |

Also here: [`README.md`](src/scripts/README.md) (how to run them, and the rule they exist to
serve) and [`examples/pmf-responses.example.json`](src/scripts/examples/pmf-responses.example.json)
— fifteen responses engineered so the raw verdict passes and the honest one doesn't.

## Skills

⚡ The only layer that **fires without being asked**. A skill exists because you *don't know you
need it* — it ambushes the diff at the moment you're about to make the mistake it knows about.
([Skill or doc?](CONTRIBUTING.md#skill-or-doc))

| Source | Deployed as | The counterintuitive thing it knows |
|---|---|---|
| [`SKILL_TESTS_THAT_CANNOT_FAIL.md`](src/skills/SKILL_TESTS_THAT_CANNOT_FAIL.md) | `tests-that-cannot-fail/` | A guard never observed failing against the pre-fix code asserts **nothing**. Regex alternations, mocked throws and conditional skips pass in both worlds. |
| [`SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`](src/skills/SKILL_CLAIM_BEFORE_SIDE_EFFECT.md) | `claim-before-side-effect/` | A marker stamped **after** an irreversible call is a re-send window, not idempotency. Claim the row first. |
| [`SKILL_NEVER_THROWS_CONTRACT.md`](src/skills/SKILL_NEVER_THROWS_CONTRACT.md) | `never-throws-contract/` | The client resolves `{success: false}` instead of throwing — so your `try/catch` is dead code and a bare `await` silently drops every failure. |
| [`SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md`](src/skills/SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md) | `framework-defaults-are-permissive/` | Unspecified access falls through to *any authenticated user*, and locking only `update` leaves `create` wide open. |
| [`SKILL_RATIONALE_COMMENTS.md`](src/skills/SKILL_RATIONALE_COMMENTS.md) | `rationale-comments/` | A comment that RESTATES the code is noise the next session will delete. A comment that STATES WHY is the load-bearing prose that stops the guard from being deleted. |
| [`SKILL_LAYOUT_NOT_PAGE_SINGLETONS.md`](src/skills/SKILL_LAYOUT_NOT_PAGE_SINGLETONS.md) | `layout-not-page-singletons/` | Host singletons (`AudioContext`, `SharedWorker`, a page-level `<audio>` fed into an analyser) throw on the second navigation. Hoist them into a layout, not a page. |
| [`SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN.md`](src/skills/SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN.md) | `ephemeral-credentials-on-stdin/` | A password on argv is world-readable via `ps auxww` / `/proc/<pid>/cmdline`. The bootstrap-admin credential reads from stdin, never argv. |
| [`SKILL_TEMPLATE.md`](src/skills/SKILL_TEMPLATE.md) | — | The anatomy for writing your own. The frontmatter **is** the skill; a body that lists current facts rots and then argues with the diff. |
