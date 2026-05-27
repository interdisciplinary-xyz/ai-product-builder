# QUALITY_ASSURANCE.md — Standards & pre-merge gate

> **Canonical / source-of-truth copy** (lives in the `ai-product-builder` library). Unified from the
> multiple project variants across the codebase. To adopt in a repo,
> copy to `docs/QUALITY_ASSURANCE.md` and fill the `«placeholders»`.
>
> **Scope:** *what "good" means* and how we verify it. Run **repeatedly**,
> especially before `scope/* → release/*`. Companion to
> [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) (which owns branch/CI cost policy)
> and [`SESSION_MIGRATION.md`](./SESSION_MIGRATION.md) (session handoff).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_QUALITY_ASSURANCE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_QUALITY_ASSURANCE.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — quality bar already abstracted with `«placeholders»` for the variable bits (audits, budgets, baselines); the exposure/severity rule is an explicit per-repo fill-in.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«NODE_VERSION»` — Node version (must match `.nvmrc`), via `nvm use` (e.g. 22.15.1) — §1.
> - `«QUALITY_CMD»` — the aggregate quality command (format + lint + types + unit + repo audits) (e.g. `pnpm ci:quality`) — §1, §8.
> - Quality sub-commands — `«QUALITY_CMD:format»` / `«QUALITY_CMD:lint»` / `«QUALITY_CMD:types»` / `«QUALITY_CMD:unit»` / `«E2E_CMD»` / link-crawl (e.g. `pnpm standard:format` / `standard:lint` / `test:types` / `test:unit` / `test:e2e --project=chromium` / `crawl:links`) — §1.
> - `«observability audit»` — command + pass bar (e.g. `pnpm audit:sentry-tags`, target: 100%) — §1.
> - `«security audit»` — command + pass bar (e.g. `tsx scripts/tools/security-audit.ts`, target: 100%) — §1.
> - `«UNIT_TEST_BASELINE»` — unit-test baseline count — §1.
> - `«bundle budget»` — shared first-load JS bundle budget (e.g. 350 KB) — §6.
> - Deployment exposure + the resulting severity grading rule — §7.
> - Issue labels — `audit` + category + `priority:` — §9.

## 1. The quality gate (single source of truth)

The authoritative local gate is:

```bash
nvm use && «QUALITY_CMD»      # format + lint + types + unit (+ repo audits) (e.g. pnpm ci:quality)
```

Because `ci.yml` **skips `scope/*` by design** (cost control — see `RELEASE_MANAGER.md`),
quality on scope branches MUST be proven locally with this command. Cloud CI only
gates at the `release/* → «TRUNK»` PR. A scope branch is not "QA-passed" until
`«QUALITY_CMD»` is green **and** the supplementary audits below pass.

> Commands below assume pnpm; swap in your own runner («PKG_MGR») and script names.

| Check | Command | Pass bar |
|---|---|---|
| Format | `«QUALITY_CMD:format»` (e.g. `pnpm standard:format`) | clean |
| Lint | `«QUALITY_CMD:lint»` (e.g. `pnpm standard:lint`) | 0 errors |
| Types | `«QUALITY_CMD:types»` (`tsc --noEmit`, strict + `noUncheckedIndexedAccess`) (e.g. `pnpm test:types`) | 0 errors |
| Unit | `«QUALITY_CMD:unit»` (Vitest) (e.g. `pnpm test:unit`) | all green (baseline: «UNIT_TEST_BASELINE» tests) |
| E2E (flows) | `«E2E_CMD»` (e.g. `pnpm test:e2e --project=chromium`) | green |
| «observability audit» | (e.g. `pnpm audit:sentry-tags`) | (target: 100%) |
| «security audit» | (e.g. `tsx scripts/tools/security-audit.ts`) | (target: 100%) |
| Dead links (on demand) | link-crawl (e.g. `pnpm crawl:links`) | no broken same-origin links |
| Perf (cloud, manual) | Lighthouse / Page Speed Insights `workflow_dispatch` | no regressions |

> **Tooling gotcha:** run **one** `tsc`/`«QUALITY_CMD»` at a time — concurrent runs
> thrash and hang. Match CI's Node with `nvm use` first. In some shells recursive
> content search (`grep -r`, `rg`) over `src` can hang — run heavy dead-code/dep
> scans in CI or after a clean `nvm use`, not from a flaky local run.

---

## 2. Code-quality principles (must hold)

Enforced (lint/format/types) **and** reviewed (human/agent):

- **DRY** — no copy-pasted logic; extract a shared abstraction before the third copy. Track known offenders (don't tolerate silently).
- **KISS** — no god components/modules; >~400 lines is a smell. Refactor revenue-critical code only behind its existing tests, no behavior change.
- **Predictable patterns** — match surrounding idioms, naming, comment density.
- **Reusable abstractions** — build from Design System primitives; extract only when reuse is earned (≥2 real call-sites). Inline first, generalize later.
- **Architecture consistency** — shared logic in the shared layer (`src/lib`/`packages/shared`), app-specific in apps; documented shims only; respect the server/client boundary (`server-only`; secrets via the env proxy, never `process.env` in feature code).
- **Readability** — self-explanatory names; comments explain *why*. **Stale comments are bugs.**
- **No dead code** — delete unreferenced exports/files (word-boundary grep proves zero importers; `tsc` is the backstop).
- **No `console.log`** (allow `console.warn`/`console.error`); no unused imports; curly braces always.
- **Error handling + observability** — funnel errors through one reporter; webhooks **never throw** (return 200/4xx, log); RSC reads degrade gracefully (`[]`) or re-throw deliberately. Telemetry events carry consistent tags (e.g. `tags.domain` + a sub-tag).

---

## 3. API-quality checklist

- [ ] **Input validation** via a schema validator (if applicable — your stack's equivalent, e.g. Zod `parseBody(schema, …)`); cap anonymous-create field lengths; validate referenced IDs exist before write.
- [ ] **Sanitization** of user HTML (if applicable — your stack's equivalent, e.g. DOMPurify `sanitizeHtml`/`stripHtml`) and of AI-prompt inputs (if applicable — your stack's equivalent, e.g. `sanitizeForPrompt`: strip code fences/fake roles/control tokens) before storage/render/model.
- [ ] **AuthZ** — correct tier (public / public-rate-limited / authenticated / owner / admin / webhook); ownership invariant on owner routes (IDOR guard); verify auth edge cases (missing/expired cookie, non-owner, admin bypass).
- [ ] **Webhooks** — signature verified (e.g. «PAYMENTS» HMAC; per-creator CRC, timing-safe) + idempotent (if applicable — your stack's equivalent, e.g. a `webhook-events (provider, externalId)` dedupe store).
- [ ] **Resilience** — no handler throws uncaught; rate limiting on public/abuse-prone routes (if applicable — your stack's equivalent, e.g. Upstash + in-memory fallback) with `Retry-After`.
- [ ] **Security headers / CSP** as tight as the framework allows (track `unsafe-inline` → nonce migration); path containment via boundary check, not `startsWith`.
- [ ] **Compliance** — no platform-custody fields where forbidden (if applicable — your stack's equivalent, e.g. `assertNoPlatformCustody` + forbidden-tokens gate).
- [ ] **Docs/API parity (OpenAPI/route-security parity)** — any new/changed route updates the OpenAPI spec (e.g. `/api/docs`) **and** the route-security registry in the **same commit**.

---

## 4. Frontend-quality checklist

- [ ] **Design System (design-system showcase)** — use primitives (`Typography`/`Field`/`Button`/`Modal`/`Section*` …); new shared UI registered in `/design-system`, which must stay honest (a DS claim that contradicts code is a bug).
- [ ] **States** — every async surface has explicit **loading / empty / error** states.
- [ ] **Accessibility (WCAG 2.1 AA)** — accessible name per control; one `<h1>`/page; unique landmarks (no nested `<main>`); skip-to-content link; focus management on view/step swaps; `aria-live` for dynamic status; icons `aria-hidden`; AA contrast. The axe suite is the gate (if applicable — your stack's equivalent, e.g. a `KNOWN_VIOLATIONS` allowlist that must shrink, not grow).
- [ ] **Responsive** — phone→desktop (1→2→3→4-col grids, aligned heights); `prefers-reduced-motion` honored (`motion-safe:`); verified by responsive/viewport e2e.
- [ ] **SEO / meta** — per-route metadata (canonical + hreflang where multi-locale); JSON-LD where applicable and not hardcoded to values that drift from CMS; `noindex` for thin/private surfaces.
- [ ] **Color** — brand/design tokens only (no raw hex literals).
- [ ] **Visual regression** — baseline-committed screenshot suite where used.

> **REQUIRED — visual-regression + a11y are domain-scoped at the release merge.** At the
> `release/* → «TRUNK»` merge, the visual-regression and a11y (axe) suites are **domain-scoped**
> (run only the changed domains' specs, full-suite fallback on `«SHARED_PATHS»` changes) — the
> **same** mechanism as E2E, so these specs must be domain-mapped too. The `KNOWN_VIOLATIONS`
> a11y allowlist **must shrink, not grow**. Don't re-paste the mechanism here — see
> `RELEASE_MANAGER.md` §4.2, `github-actions-minutes-workflow.md`, and `e2e.md` (domain-mapping
> + flaky-test quarantine).

---

## 5. Testing expectations

- **Unit/component (Vitest + Testing Library + axe):** co-located `*.spec.{ts,tsx}`; every shared component and domain component (render + key interaction + a11y); new logic ships with tests; mock `fetch`/env. **REQUIRED:** domain-scoped (affected/import-graph) unit/integration runs on `feat/*`/`fix/*` PRs (the `unit-gate` check), full suite on `«SHARED_PATHS»` changes — see `RELEASE_MANAGER.md` §4.1 and `github-actions-minutes-workflow.md`.
- **Logic layer (often the weak spot — raise coverage):** query functions, hooks, webhook handlers, payment/encryption helpers, parsers, budget math, ledger/verification.
- **E2E (Playwright, chromium):** critical paths — auth/onboarding, the core domain flow, payments/checkout + webhook, dashboard, SEO/sitemap, responsive, a11y. Note where CI runs only a thin slice vs local-only specs. At the `release/* → «TRUNK»` gate, E2E is **domain-scoped (required)** — only the changed domains' specs run, with a **full**-suite fallback on `«SHARED_PATHS»` / cross-domain contract changes; this requires specs to be domain-mapped (path `e2e/<domain>/**` or tag `@<domain>`). See `RELEASE_MANAGER.md` §4.2, `github-actions-minutes-workflow.md`, `e2e.md`.
- **Regression discipline:** refactors keep tests green with no behavior change; **every bug fix lands with a test that fails before the fix.**
- **Rule:** no placeholder spec files (`it.todo` only) merged as "coverage."
- **Flaky specs → quarantine (REQUIRED):** a flaky spec is **never merged as green** — tag it `@quarantine` (excluded from the gate, retried once, auto-files a tracking issue + owner) and the quarantine count must **shrink, not grow**. Mechanism: `e2e.md` (Flaky-test quarantine).

---

## 6. Build & performance

- **Build stability** — `«BUILD_CMD»` green (e.g. `pnpm build`; set `--max-old-space-size` for OOM headroom if needed); multi-brand/app swaps must build.
- **Bundle health** — budget «bundle budget» shared first-load JS (e.g. 350 KB; enforced in CI off the single `build:test`); bundle-analyzer (e.g. `pnpm analyze`) to inspect; consolidate redundant deps; don't remove framework peer-deps.
- **Rendering** — respect RSC/client boundaries; lazy-load heavy/modal components; ISR + tag revalidation for hot pages; avoid client over-fetching and unbounded list endpoints.
- **Perf budget** — Core Web Vitals (LCP/INP/CLS) via the manual cloud perf run before release.

---

## 7. Severity model

Grade findings by **actual exposure**, not the textbook label, and re-grade if the
exposure changes. Example for a local-only / LAN app: no finding is "Critical";
classic web-exposure issues (CSP, login limiter) are **Medium**; a11y and
install/usability goals are **High** because they block the owner's real use.
Re-grade upward if the app goes multi-tenant/public.

> Per-repo: state the deployment exposure and the resulting grading rule here.

---

## 8. QA gate — before `scope/* → release/*`

> This is the **quality** half of the promotion gate; the **release/process** half
> (CI status, version bump, P1 blockers, maintainer approval) lives in
> `RELEASE_MANAGER.md` §9 — run both before promoting.

- [ ] `nvm use && «QUALITY_CMD»` green (format + lint + types + unit).
- [ ] Repo audits green (e.g. observability tags 100%, security audit 100%).
- [ ] No new dead code / unused deps / duplicated component / `console.log`.
- [ ] New/changed API: validated + sanitized + authz'd + OpenAPI updated.
- [ ] New UI: DS primitive + a11y assertion + loading/empty/error states; no new known-a11y-violations (if applicable — your stack's equivalent, e.g. `KNOWN_VIOLATIONS`).
- [ ] Tests added for the change (not just `it.todo`); critical paths have e2e (domain-mapped, so the release gate can run **domain-scoped E2E** — see `RELEASE_MANAGER.md` §4.2).
- [ ] No open **P1** for the milestone (see `RELEASE_MANAGER.md`).
- [ ] Founder-decision items (security posture, contrast palette, noindex) explicitly deferred, not silently skipped.
- [ ] Working tree committed; build sane.

---

## 9. QA Status report template

```md
## Quality Assurance Status

### Repository QA Policy
- QUALITY_ASSURANCE.md exists / QA policy status / Repository compliance

### Code Quality
- Consistency / Dead code / Unused dependencies / DRY/KISS status

### API Quality
- Validation / Security / Performance / Docs consistency

### Frontend Quality
- Design System / Accessibility / Responsive UX / SEO/meta

### Testing
- Unit tests / E2E coverage / Missing scenarios

### Risks / Technical Debt

### Recommended Actions
```

> File any *new* finding as a GitHub issue (label `audit` + category + `priority:`),
> one per finding. Live findings: `gh issue list --label audit`.
