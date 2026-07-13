# Catalog

Every artifact in the library, grouped by what it's for. Names link to the source file; the
right-hand column is the name the file takes **once deployed** (the `RUNBOOK_` prefix is
stripped on build — see [Adopt it](README.md#adopt-it)).

- [Process, engineering, governance](#process-engineering-governance)
- [Resilience and incident response](#resilience-and-incident-response)
- [Security, legal, compliance](#security-legal-compliance)
- [Testing and quality](#testing-and-quality)
- [Design and UX](#design-and-ux)
- [Product strategy and discovery](#product-strategy-and-discovery)
- [Launch and growth](#launch-and-growth)
- [Content and marketing](#content-and-marketing)
- [Solo-founder operating cadence](#solo-founder-operating-cadence)
- [Slash-commands](#slash-commands)
- [Skills](#skills)
- [Exec board](#exec-board)
- [Calculators](#calculators)
- [Config](#config)

A **MANAGER** is a playbook you *run* against a repo. A **RUNBOOK** is a template you *fill*.
They come in pairs where a playbook produces a document.

---

## Process, engineering, governance

| Playbook (run it) | Template (fill it) |
|---|---|
| [`MANAGER_AI_WORKFLOW`](src/managers/MANAGER_AI_WORKFLOW.md) | [`AI_PROMPT_REGISTRY`](src/runbooks/RUNBOOK_AI_PROMPT_REGISTRY.md) |
| [`MANAGER_ARCHITECTURE`](src/managers/MANAGER_ARCHITECTURE.md) | [`DATA_MODEL_GUIDE`](src/runbooks/RUNBOOK_DATA_MODEL_GUIDE.md) |
| [`MANAGER_CONTRIBUTING`](src/managers/MANAGER_CONTRIBUTING.md) | [`PULL_REQUEST_TEMPLATE`](src/runbooks/RUNBOOK_PULL_REQUEST_TEMPLATE.md) |
| [`MANAGER_DECISION_LOG`](src/managers/MANAGER_DECISION_LOG.md) | [`DECISION_LOG`](src/runbooks/RUNBOOK_DECISION_LOG.md) |
| [`MANAGER_DEV_ONBOARDING`](src/managers/MANAGER_DEV_ONBOARDING.md) | [`ONBOARDING_PACK`](src/runbooks/RUNBOOK_ONBOARDING_PACK.md) |
| [`MANAGER_DOC_FRESHNESS`](src/managers/MANAGER_DOC_FRESHNESS.md) | [`AUDIT`](src/runbooks/RUNBOOK_AUDIT.md) |
| [`MANAGER_ENGINEERING_STANDARDS`](src/managers/MANAGER_ENGINEERING_STANDARDS.md) | [`DEV_PORTLESS`](src/runbooks/RUNBOOK_DEV_PORTLESS.md) |
| [`MANAGER_INIT`](src/managers/MANAGER_INIT.md) | [`CLAUDE_MD`](src/runbooks/RUNBOOK_CLAUDE_MD.md) |
| [`MANAGER_PROJECT`](src/managers/MANAGER_PROJECT.md) | [`PROJECT_PLAN`](src/runbooks/RUNBOOK_PROJECT_PLAN.md) |
| [`MANAGER_TESTING_STRATEGY`](src/managers/MANAGER_TESTING_STRATEGY.md) | [`QUALITY_ASSURANCE`](src/runbooks/RUNBOOK_QUALITY_ASSURANCE.md) |
| — | [`RELEASE_MANAGER`](src/runbooks/RUNBOOK_RELEASE_MANAGER.md) — the staged-branch CI policy |
| — | [`SESSION_MIGRATION`](src/runbooks/RUNBOOK_SESSION_MIGRATION.md) — AI-session handoff |
| — | [`GITHUB_ACTIONS`](src/runbooks/RUNBOOK_GITHUB_ACTIONS.md) · [`MAINTENANCE`](src/runbooks/RUNBOOK_MAINTENANCE.md) · [`PERMISSIONS_AND_AUTONOMY`](src/runbooks/RUNBOOK_PERMISSIONS_AND_AUTONOMY.md) |

## Resilience and incident response

[`MANAGER_INCIDENT_RESPONSE`](src/managers/MANAGER_INCIDENT_RESPONSE.md) →
[`INCIDENTS`](src/runbooks/RUNBOOK_INCIDENTS.md) ·
[`BACKUP_RECOVERY`](src/runbooks/RUNBOOK_BACKUP_RECOVERY.md) ·
[`SECRETS_ROTATION`](src/runbooks/RUNBOOK_SECRETS_ROTATION.md) ·
[`OBSERVABILITY`](src/runbooks/RUNBOOK_OBSERVABILITY.md)

## Security, legal, compliance

[`MANAGER_SECURITY`](src/managers/MANAGER_SECURITY.md) →
[`SECURITY_MODEL`](src/runbooks/RUNBOOK_SECURITY_MODEL.md) ·
[`THIRD_PARTY`](src/runbooks/RUNBOOK_THIRD_PARTY.md)

[`MANAGER_PAYMENTS_COMPLIANCE`](src/managers/MANAGER_PAYMENTS_COMPLIANCE.md) →
[`PAYMENTS_COMPLIANCE`](src/runbooks/RUNBOOK_PAYMENTS_COMPLIANCE.md) ·
[`PAYMENTS_LIFECYCLE`](src/runbooks/RUNBOOK_PAYMENTS_LIFECYCLE.md) ·
[`LEGAL_RISK`](src/runbooks/RUNBOOK_LEGAL_RISK.md) ·
[`GDPR_PRE_LAUNCH_CHECKLIST`](src/runbooks/RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md)

## Testing and quality

| Playbook | Template |
|---|---|
| [`MANAGER_A11Y_AUDIT`](src/managers/MANAGER_A11Y_AUDIT.md) | [`A11Y_AUDIT`](src/runbooks/RUNBOOK_A11Y_AUDIT.md) |
| [`MANAGER_PERFORMANCE`](src/managers/MANAGER_PERFORMANCE.md) | [`WEB_VITALS_AUDIT`](src/runbooks/RUNBOOK_WEB_VITALS_AUDIT.md) |
| [`MANAGER_SEO`](src/managers/MANAGER_SEO.md) | [`SEO_AUDIT`](src/runbooks/RUNBOOK_SEO_AUDIT.md) |
| [`MANAGER_I18N`](src/managers/MANAGER_I18N.md) | [`TRANSLATION_WORKFLOW`](src/runbooks/RUNBOOK_TRANSLATION_WORKFLOW.md) |

Unpaired: [`E2E`](src/runbooks/RUNBOOK_E2E.md) ·
[`SMOKE_TEST`](src/runbooks/RUNBOOK_SMOKE_TEST.md) ·
[`EMAIL_QA_MATRIX`](src/runbooks/RUNBOOK_EMAIL_QA_MATRIX.md) ·
[`EMAIL_DELIVERABILITY`](src/runbooks/RUNBOOK_EMAIL_DELIVERABILITY.md) ·
[`EMAILS_WORKFLOW`](src/runbooks/RUNBOOK_EMAILS_WORKFLOW.md)

## Design and UX

[`MANAGER_DESIGN_SYSTEM`](src/managers/MANAGER_DESIGN_SYSTEM.md) ·
[`MANAGER_DESIGN_REVIEW`](src/managers/MANAGER_DESIGN_REVIEW.md) →
[`FEATURE_SPEC`](src/runbooks/RUNBOOK_FEATURE_SPEC.md) ·
[`UX_PRINCIPLES`](src/runbooks/RUNBOOK_UX_PRINCIPLES.md) ·
[`BRAND_VOICE_GUIDELINE`](src/runbooks/RUNBOOK_BRAND_VOICE_GUIDELINE.md) ·
[`RFC_TEMPLATE`](src/runbooks/RUNBOOK_RFC_TEMPLATE.md)

## Product strategy and discovery

[`MANAGER_PRODUCT_CONTEXT`](src/managers/MANAGER_PRODUCT_CONTEXT.md) ·
[`MANAGER_DISCOVERY`](src/managers/MANAGER_DISCOVERY.md) ·
[`MANAGER_EXPERIMENT`](src/managers/MANAGER_EXPERIMENT.md) →
[`PRODUCT_POSITIONING`](src/runbooks/RUNBOOK_PRODUCT_POSITIONING.md) ·
[`BUSINESS_PLAN`](src/runbooks/RUNBOOK_BUSINESS_PLAN.md) ·
[`ICP`](src/runbooks/RUNBOOK_ICP.md) ·
[`NORTH_STAR`](src/runbooks/RUNBOOK_NORTH_STAR.md) ·
[`METRICS`](src/runbooks/RUNBOOK_METRICS.md) ·
[`FEATURES`](src/runbooks/RUNBOOK_FEATURES.md) ·
[`ROADMAP`](src/runbooks/RUNBOOK_ROADMAP.md) ·
[`SCALING`](src/runbooks/RUNBOOK_SCALING.md) ·
[`COMMUNITY_MODEL`](src/runbooks/RUNBOOK_COMMUNITY_MODEL.md) ·
[`TEAM_PLAYBOOK`](src/runbooks/RUNBOOK_TEAM_PLAYBOOK.md) ·
[`PRICING_STRATEGY`](src/runbooks/RUNBOOK_PRICING_STRATEGY.md) ·
[`ACTIVATION_EVENT`](src/runbooks/RUNBOOK_ACTIVATION_EVENT.md) ·
[`USER_OBSERVATION`](src/runbooks/RUNBOOK_USER_OBSERVATION.md) ·
[`EXPERIMENT_DESIGN`](src/runbooks/RUNBOOK_EXPERIMENT_DESIGN.md)

## Launch and growth

[`MANAGER_LAUNCH_GTM`](src/managers/MANAGER_LAUNCH_GTM.md) →
[`LAUNCH_NARRATIVE`](src/runbooks/RUNBOOK_LAUNCH_NARRATIVE.md) ·
[`LAUNCH_SOCIAL`](src/runbooks/RUNBOOK_LAUNCH_SOCIAL.md) ·
[`LAUNCH_TARGET_LIST`](src/runbooks/RUNBOOK_LAUNCH_TARGET_LIST.md) ·
[`OUTREACH_TEMPLATES`](src/runbooks/RUNBOOK_OUTREACH_TEMPLATES.md) ·
[`POWER_MOVES`](src/runbooks/RUNBOOK_POWER_MOVES.md) ·
[`PRE_LAUNCH_CHECKLIST`](src/runbooks/RUNBOOK_PRE_LAUNCH_CHECKLIST.md) ·
[`REFERRAL_MECHANICS`](src/runbooks/RUNBOOK_REFERRAL_MECHANICS.md)

## Content and marketing

[`MANAGER_CONTENT_PUBLISHING`](src/managers/MANAGER_CONTENT_PUBLISHING.md) →
[`PRODUCT_MARKETING_CONTEXT`](src/runbooks/RUNBOOK_PRODUCT_MARKETING_CONTEXT.md)

## Solo-founder operating cadence

[`MANAGER_FOUNDER_OPS`](src/managers/MANAGER_FOUNDER_OPS.md) →
[`DAILY_RITUAL`](src/runbooks/RUNBOOK_DAILY_RITUAL.md) ·
[`WEEKLY_RETRO`](src/runbooks/RUNBOOK_WEEKLY_RETRO.md) ·
[`DECISION_THRESHOLDS`](src/runbooks/RUNBOOK_DECISION_THRESHOLDS.md) ·
[`FOUNDER_DASHBOARD`](src/runbooks/RUNBOOK_FOUNDER_DASHBOARD.md)

---

## Slash-commands

Install to `.claude/commands/`. Run on demand:

| Command | What it does |
|---|---|
| [`/ai-init`](src/commands/ai-init.md) | Fills a doc's `«placeholders»` interactively; persists answers to `.claude/ai-init.local.json` |
| [`/board`](src/commands/board.md) | Convenes the four exec lenses on a scope question, injects live state, then **synthesizes the disagreement** into one call with the dissent recorded |
| [`/review`](src/commands/review.md) | Targeted code review against your standards |
| [`/test`](src/commands/test.md) | Runs the test battery, reports a pass/fail table |
| [`/deploy-check`](src/commands/deploy-check.md) | Pre-deploy readiness verdict: READY / NOT READY |
| [`/content-editor`](src/commands/content-editor.md) | Drives a headless CMS through its admin API |
| [`/web-interface-guidelines`](src/commands/web-interface-guidelines.md) | Applies a 16-category frontend/a11y check |

Recurring audits — each writes a **dated report**, diffs it against the previous one, and opens
an issue **only on regression**:

| Command | Checks | Pairs with |
|---|---|---|
| [`/audit-structure`](src/commands/audit-structure.md) | Architecture DAG, tag taxonomy, type drift | `MANAGER_ARCHITECTURE` |
| [`/audit-api-routes`](src/commands/audit-api-routes.md) | Route ↔ spec parity, authn/authz, route hygiene | `MANAGER_SECURITY` |
| [`/audit-design-system`](src/commands/audit-design-system.md) | Token drift, component reuse, a11y | `MANAGER_DESIGN_SYSTEM` |
| [`/audit-performance`](src/commands/audit-performance.md) | Bundle size, Core Web Vitals, query hygiene | `MANAGER_PERFORMANCE` |

## Skills

Install to `.claude/skills/<name>/SKILL.md`. Unlike everything else here, a skill **fires
without being asked** — see [Skill or doc?](CONTRIBUTING.md#skill-or-doc).

| Skill | The counterintuitive thing it knows |
|---|---|
| [`tests-that-cannot-fail`](src/skills/SKILL_TESTS_THAT_CANNOT_FAIL.md) | Three assertion shapes pass **identically** against broken and fixed code. Run your guard against the pre-fix code and watch it fail — if it passes, it asserts nothing. |
| [`claim-before-side-effect`](src/skills/SKILL_CLAIM_BEFORE_SIDE_EFFECT.md) | Your idempotency marker is written *after* the irreversible thing already happened. It looks safe. It isn't. |
| [`never-throws-contract`](src/skills/SKILL_NEVER_THROWS_CONTRACT.md) | The client resolves `{success: false}` instead of throwing — so your `try/catch` is dead code and a bare `await` swallows every failure. |
| [`framework-defaults-are-permissive`](src/skills/SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md) | Unspecified access falls through to *allow*. Lock create **and** update — update-only is the reassuring half. |

[`SKILL_TEMPLATE`](src/skills/SKILL_TEMPLATE.md) is the anatomy for writing your own.

## Exec board

Install to `.claude/agents/`. Four read-only advisory lenses, convened by `/board`:

[`AGENT_CEO`](src/agents/AGENT_CEO.md) (revenue and trust first) ·
[`AGENT_CFO`](src/agents/AGENT_CFO.md) (every cent correct and defensible) ·
[`AGENT_CPO`](src/agents/AGENT_CPO.md) (the funnel is the product) ·
[`AGENT_CTO`](src/agents/AGENT_CTO.md) (a green pipeline that skips the money path is a lie)

The layer's one rule: **the agent file holds the lens; live state is injected at invocation.**
A persona that hardcodes an issue number or a version rots within weeks.
[`AGENT_TEMPLATE`](src/agents/AGENT_TEMPLATE.md) is the anatomy.

## Calculators

A playbook that ends in a number should ship the calculator that produces it.

| Script | Question it answers |
|---|---|
| [`sensitivity-table.py`](src/scripts/sensitivity-table.py) | Which variable, off by 50%, kills the model? Prints break-even, contribution margin, and trip-wires — not a forecast. |
| [`score-sean-ellis.py`](src/scripts/score-sean-ellis.py) | What's the PMF read *after* discounting polite signal? Prints a raw verdict and a discounted one. They frequently disagree. |

## Config

[`SETTINGS_TEMPLATE.json`](src/config/SETTINGS_TEMPLATE.json) — the permission deny-list.
The agent may do everything local and everything draft-shaped; **the human merges, deploys, and
touches secrets.** Paired with
[`PERMISSIONS_AND_AUTONOMY`](src/runbooks/RUNBOOK_PERMISSIONS_AND_AUTONOMY.md), which explains
every deny line.
