<!-- DELETE this setup block after copying into .github/ -->
<!--
**🔧 Reuse & local setup**

**🚀 First time?** Run `/ai-init RUNBOOK_PULL_REQUEST_TEMPLATE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).

Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_PULL_REQUEST_TEMPLATE.md` (source of truth template). GitHub requires the actual PR template at `.github/pull_request_template.md` — copy from the vendored doc to that location, fill the `«placeholders»`, and delete this setup block from the `.github/` copy.

**Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders».

**Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
- `«PROJECT»` — the product/app name; used in the compliance-boundary intro
- Compliance boundary — keep/replace/drop the (commented-out) "Compliance boundary" section; the template text describes a generic payment-tooling vendor that never holds funds («PAYMENTS» provider per-account credentials, connected-account IDs, forbidden-tokens grep spec) — only applies to payments products
- Communication surfaces — the surfaces this repo keeps honest at PR time (here a Design System route and an API Docs route); rename/remove rows that don't exist
- `«PKG_MGR» / «QUALITY_CMD»` — quality-gate commands (type-check, lint, unit, build, e2e, i18n-validation); swap to this repo's runner + script names
- `«ERROR_TAXONOMY»` — the canonical error-monitoring `tags.domain` / `tags.step` value set; replace with this repo's domains or drop if no error monitor
- `«ENV_REGISTRY»` — where env vars must be registered (here an env example file + a typed env/secrets module); point at this repo's locations
- `«CI_CHECKS»` — the required green CI checks named in Review policy («DEPLOY» preview, bundle-size, page-speed, etc.)
-->

<!--
  «PROJECT» PR template.

  Pull requests are one of the team's shared communication
  surfaces between the team and any agent reviewing the work,
  alongside:
    - the Design System at «DESIGN_SYSTEM_ROUTE» (e.g. /design-system)
    - the API docs at «API_DOCS_ROUTE» (e.g. /api/docs)

  Keep this description honest: future-you reads it on a flame, and
  every reviewer/agent uses it as the contract for what changed +
  how to verify it. Skip a section only when it truly doesn't apply
  (and strike it through with `~~`); never leave the placeholder
  comments in the rendered text.
-->

<!--
  🏷️  PR TITLE — set this at the top of the "Open a pull request" form; GitHub cannot set
  the title from a body template.

  MUST be:  «PROJECT» - <branch-name>
  Examples: «PROJECT» - scope/v1.35.0
            «PROJECT» - release/v1.35.0
            «PROJECT» - fix/<slug>
            «PROJECT» - hotfix/<slug>

  «PROJECT» is the repo's human short name (e.g. empatalk, respect.click, savei, onestpromo),
  not the full GitHub owner/repo path.

  All naming — branches, PR titles, commit messages, merge-commit titles, tags, and the
  commitlint config that enforces them (including the promotion-squash regex carve-out) — is
  in ONE place: `NAMING_CONVENTIONS.md` §1 cheatsheet. If any of the below drifts from that
  runbook, that runbook wins.

  Rule + rationale: `RUNBOOK_RELEASE_MANAGER.md` §1 rule 4.
-->

## Summary

<!-- 1–3 sentences. What changed and why now. Link the issue(s) this closes. -->

Closes #

<!-- (uncomment if this is a payments product) Compliance boundary section.
     KEEP this section only if the PR touches payments / providers / webhooks / encryption.

## Compliance boundary

«PROJECT» is a SaaS / payment-tooling vendor, NOT a payment institution. End-user money flows directly to the customer's own «PAYMENTS» provider account; the platform never holds, splits, delays, or redistributes funds. Confirm none of these regress:

- per-account encrypted «PAYMENTS» credentials still server-only
- connected-account integration stores only the account ID + non-secret status flags
- payment webhooks verify with the ACCOUNT's signing key, not the platform's
- no field added with custody-implying name (`balance`, `walletId`, `payoutSchedule`, `settlementBatch`, etc. — guarded by the static grep spec at «FORBIDDEN_TOKENS_SPEC», e.g. `src/lib/server/payments/forbidden-tokens.static.spec.ts`)
-->

## Test plan

<!-- How a reviewer (or future-you) can verify this works. Be specific.
     Examples of the shape we want:
       - [ ] Run `«QUALITY_CMD:unit» src/path/to/spec.ts` — N tests passing
       - [ ] Visit `/route/under/test` — verify X renders, Y doesn't
       - [ ] Trigger a «PAYMENTS» event via CLI — verify an error-monitor event with `tags.context = '«PAYMENTS»_webhook'`
     Prefer concrete commands + observable outcomes over prose. -->

- [ ]

## Out of scope

<!-- What you considered shipping but chose NOT to. Prevents scope creep
     + tells reviewers when to stop asking "why didn't you also fix X". -->

## Risk & rollback

<!-- 1–2 sentences. Worst case if this misbehaves in prod, how we'd
     notice (error-monitor tag, dashboard, user report), and what rollback
     looks like (revert the commit, flip a feature flag, re-run a
     migration backwards). -->

---

### Communication surfaces checklist

These shared surfaces are kept honest at PR time — the Design System, the API Docs, and this PR description. Tick what applies; strike out (`~~strike~~`) what doesn't.

- [ ] **Design System** — any new UI consumes primitives from «UI_PRIMITIVES_PATH» (e.g. `@/shared/ui`) or domain components from «DOMAIN_COMPONENTS_PATH» (e.g. `@/domains/<area>/components`); if a primitive was added or changed, it's showcased on the Design System route.
- [ ] **API Docs** — any new/changed/removed route is reflected in «API_DOCS_SOURCE» (e.g. `src/lib/server/api-docs/openapi.ts`) and browseable at the API Docs route.
- [ ] **PR description** — all applicable sections above filled; no `<!-- ... -->` placeholders left in the rendered text.

### Quality gates

- [ ] `«QUALITY_CMD:types» && «QUALITY_CMD:lint» && «QUALITY_CMD:unit»` clean locally
- [ ] `«QUALITY_CMD:i18n»` clean («LOCALES» parity, e.g. en, pl)
- [ ] `«QUALITY_CMD:build»` succeeds (catches `'server-only'` / barrel-leak issues that don't show up in unit tests)
- [ ] Pre-push hook gates passed (i18n + types + lint + format + unit). E2e remains in CI on push to «TRUNK» as the authoritative gate; run `«QUALITY_CMD:e2e»` locally when working on flows that touch the smoke suite.
- [ ] Error-monitor tags follow the canonical taxonomy: `tags.domain` is one of «ERROR_TAXONOMY» (e.g. `payments` / `plans` / `auth` / `cms` / `analytics`); `tags.step` describes the branch within the route handler

### Hygiene

- [ ] No new `TODO` / `FIXME` / `console.log` / dead code introduced
- [ ] No `'server-only'` imports added on a path reachable from a client component (use direct sub-package paths instead of broad domain barrels — see the pattern in «BARREL_EXAMPLE», e.g. `@/domains/<area>/index.ts`)
- [ ] No env vars added without entries in «ENV_REGISTRY» (e.g. an env example file AND either a typed env module or a documented server-only secrets module for deferred secret resolution)
- [ ] No new `@ts-expect-error` / `@ts-ignore` without a comment explaining why and a link to the follow-up issue

### Review policy

- [ ] **No-open-comments policy** — every automated AND human review thread is addressed-and-resolved (or marked outdated by code change) before merge. New commits since last review trigger a re-request.
- [ ] CI checks all green («CI_CHECKS» — e.g. «DEPLOY» preview, preview comments, bundle-size, page-speed)
- [ ] Branch is `MERGEABLE` (no conflicts; no draft state)
- [ ] **REQUIRED** — domain-boundary lint passes (no cross-domain deep imports; see ARCHITECTURE.md)
- [ ] **REQUIRED** — if this PR adds a dependency / new domain / changes a domain's public barrel → a DECISION_LOG.md entry is added (see DECISION_LOG.md)

<!-- (payments repos) The custody forbidden-tokens check runs unconditionally in CI — it is not a manual checkbox here. -->


🤖 Authored with [Claude Code](https://claude.com/claude-code) when applicable.

---

## Release umbrella PR (variant)

<!--
  Use this shape when the PR is the **release-line umbrella** for a milestone (e.g. `release/v«X.Y.Z»` → «TRUNK»). It collects multiple scope/feature sub-PRs and is the GitHub anchor for the milestone's progress. Do NOT replicate per-issue status here — link to the matrix instead.
-->

### Summary (release umbrella)

**Release umbrella** for milestone [`v«X.Y.Z»`](«MILESTONE_URL») — «one-line theme of this milestone».

- **Branch:** `release/v«X.Y.Z»` (rebased onto «TRUNK» before merge)
- **Scope aggregate PR:** [#«SCOPE_PR»](«SCOPE_PR_URL») (`scope/v«X.Y.Z»` → this branch)
- **Issue matrix:** [`docs/plans/«DATE»-scope-v«X.Y.Z»-open-issues-matrix.md`](«MATRIX_PATH»)

All open issues are assigned to milestone **`v«X.Y.Z»`**. Sub-PRs target `release/v«X.Y.Z»`, not «TRUNK».

### Milestone `v«X.Y.Z»` — open issues by track

<!-- One table per workstream. Drop tracks that don't apply. Keep titles ≤ 60 chars so the table doesn't wrap. -->

#### Track «A» — «workstream name»

| Issue | Title | Scope PR |
|-------|-------|----------|
| [#«N»](«ISSUE_URL») | «one-liner» | [#«SCOPE_PR»](«SCOPE_PR_URL») |
| [#«N»](«ISSUE_URL») | «one-liner» | follow-up sub-PR |

#### Track «B» — «workstream name»

| Issue | Title | Scope PR |
|-------|-------|----------|
| [#«N»](«ISSUE_URL») | «one-liner» | [#«SCOPE_PR»](«SCOPE_PR_URL») (partial) |

### Workflow (release line)

1. Land [#«SCOPE_PR»](«SCOPE_PR_URL») into `release/v«X.Y.Z»`.
2. Open `fix/<issue>-…` branches from `release/v«X.Y.Z»` for follow-ups.
3. When milestone acceptance is met: squash-merge this umbrella → «TRUNK».
4. Close issues per **matrix verdicts** — not every issue closes with one PR.

### Acceptance (release umbrella)

- [ ] `release/v«X.Y.Z»` rebased on latest «TRUNK»
- [ ] CI green after the scope PR(s) merge
- [ ] Milestone [`v«X.Y.Z»`](«MILESTONE_URL») reflects closed vs open accurately (matrix is the audit trail)

### Review policy (release umbrella)

- Do **not** merge to «TRUNK» until scope PR(s) land and CI is green on the release branch
- Use the matrix doc for per-issue close vs carry-forward decisions
- Sub-PR comments / Copilot threads are resolved on their own PRs, not this umbrella

---

## Scope aggregate PR (variant)

<!--
  Use this shape when the PR is a **scope aggregate** for a milestone (e.g. `scope/v«X.Y.Z»` → `release/v«X.Y.Z»`). It bundles the first slice of work across tracks; the per-issue matrix doc is the source of truth for verdicts.
-->

### Summary (scope aggregate)

**Scope PR** for milestone [`v«X.Y.Z»`](«MILESTONE_URL») → merges into [`release/v«X.Y.Z»`](«RELEASE_PR_URL») (not «TRUNK»).

First **aggregate slice** of «one-line theme». N issues partial, M close-ready, K deferred to follow-up PRs on the release branch.

| | |
|---|---|
| **Branch** | `scope/v«X.Y.Z»` |
| **HEAD** | `«sha»` |
| **Local quality gate** | `«QUALITY_CMD»` ✅ · «N» unit tests |
| **CI policy on `scope/**`** | «describe — e.g. "skipped; run locally before merge"» |
| **Review threads** | All threads resolved ✅ / pending |
| **Matrix** | [`docs/plans/«DATE»-scope-v«X.Y.Z»-open-issues-matrix.md`](«MATRIX_PATH») |
| **Updated** | «DATE» |

### Status legend

| Emoji | Status | GitHub action |
|:-----:|--------|---------------|
| ✅ | **Close** | `Closes #«N»` when this PR merges |
| 🧪 | **QA** | Code ready — close after manual verification |
| 🟡 | **Partial** | Keep open; narrowed scope |
| ⏳ | **Deferred** | Follow-up on `release/v«X.Y.Z»` |
| ☑️ | **Shipped** | Already closed in an earlier milestone |

### Progress snapshot

| Status | Count | Issues |
|--------|------:|--------|
| ✅ Close | «N» | «#…» |
| 🧪 QA | «N» | «#…» |
| 🟡 Partial | «N» | see per-track tables |
| ⏳ Deferred | «N» | «#…» |
| ☑️ Shipped | «N» | «#…» |

### Per-track issue tables

<!-- One table per workstream (same tracks as the matrix doc). -->

#### Track «A» — «workstream name»

| Status | Issue | Title | Notes |
|:------:|:-----:|-------|-------|
| 🧪 | [#«N»](«ISSUE_URL») | «one-liner» | «what's done / what QA needs to confirm» |
| 🟡 | [#«N»](«ISSUE_URL») | «one-liner» | «narrowed scope summary» |

### Closes (when merged + QA)

Closes #«N», #«N» (all ✅ rows).
Closes #«N» after manual QA (🧪 rows).
Does **not** close 🟡 partial or ⏳ deferred issues.

### What's deferred (and why)

- #«N» — «one-line reason» — track on `release/v«X.Y.Z»`
- #«N» — «one-line reason» — depends on #«M»

### Acceptance (scope aggregate)

- [ ] `«QUALITY_CMD»` clean locally (types + lint + format + unit + i18n + routing)
- [ ] OpenAPI / route docs synced for any new/changed routes
- [ ] All review threads on this PR resolved
- [ ] Matrix doc reflects the verdicts for every milestone issue
- [ ] Merge order documented (e.g. "merge this → `release/v«X.Y.Z»`, then run CI on the release PR")
