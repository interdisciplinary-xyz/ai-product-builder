# E2E test inventory + critical-path coverage

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_E2E` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/e2e.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The two-section structure (critical paths + spec inventory), the "how to add a test" guidance, and the "out of scope" section are portable; **fill the critical-path list, the spec catalogue, and the baseline with this repo's actual coverage**.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product this inventory covers
> - `«CRITICAL_PATHS»` — this repo's own CP list; the embedded paths are illustrative and must be rewritten
> - `«SPEC_INVENTORY»` — the `e2e/*.spec.ts` catalogue table; generate from this repo's actual spec files (count, filenames, intents)
> - `«E2E_CMD»` — the run/update commands (e.g. `«PKG_MGR» test:e2e`, `… --project=chromium`, `… test:e2e:visual:update`); swap to this repo's runner (e.g. Playwright)
> - `«BASELINE_DATE»` — the "Last reviewed" date; pair with `«TEST_COUNT»` for the latest pass/skip/fail counts; update on each review
> - `«ENV_GATES»` — credentialed-setup gating helpers + the services they gate (e.g. «AUTH», «DB_CMS», «PAYMENTS»-test-mode, AI key, billing-test DB URI, cron secret, integration signing secret)
> - `«TEST_HELPERS»` — mandatory per-flow helpers (e.g. a cookie-consent dismissal helper)
> - `«OUT_OF_SCOPE»` — what's deliberately not asserted by the e2e runner (e.g. Playwright): visual regression specifics, email rendering, perf budgets
> - E2E↔domain mapping — **REQUIRED**: how each spec maps to a domain, by path (`e2e/<domain>/**`) or tag (`@<domain>`), so the release merge can scope E2E to the changed domains (see "Domain-mapping" below)
> - `«DOMAIN_PATHS»` — where feature domains live, for deriving changed domains from the diff (e.g. `src/domains/<d>/**`)
> - `«SHARED_PATHS»` — cross-cutting paths that force the **full** E2E suite when changed (e.g. `src/lib`, `packages/shared`, design system, config, lockfile, CI, cross-domain contracts/shared fixtures)

**Last reviewed:** «DATE»

This doc is the canonical inventory of end-to-end test coverage on
«PROJECT». Two-section structure:

1. **Critical paths** — the journeys that, if broken, materially
   damage the business (revenue gone, users locked out, key signal
   corrupted, trust lost). Each carries an explicit coverage status.
2. **Spec inventory** — a flat catalogue of every `e2e/*.spec.ts`
   file with its purpose so a future contributor can find the right
   spot to add a test instead of duplicating one.

Run all specs with `«E2E_CMD»` (e.g. `«PKG_MGR» test:e2e`). Latest
baseline («BASELINE_DATE»): **«TEST_COUNT» passed, «TEST_COUNT» skipped, «TEST_COUNT» failed.**
Skips are «ENV_GATES»-gated specs that need credentialed setup the CI
runner doesn't provide.

---

## Domain-mapping (REQUIRED)

E2E specs **MUST be domain-mapped** so the release merge can run only the
changed domains' E2E instead of the whole suite. Map each spec to a domain by:

- **path** — `e2e/<domain>/**` (or `«DOMAIN_PATHS»/<domain>/e2e/**`), **or**
- **tag** — `@<domain>` on the `describe`/`test`.

Pick **one** convention and apply it to every spec; the Spec inventory's CP
column should make each spec's domain unambiguous.

**Required at the `release/* → «TRUNK»` merge:** run only the E2E of the
domains whose files changed (union when several), and **fall back to the full
E2E suite** when a `«SHARED_PATHS»` file or a cross-domain contract/shared
fixture changes. Mechanism (diff → changed domains → scoped run + fallback):
[`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) §4.2. CI implementation:
[`github-actions-minutes-workflow.md`](./github-actions-minutes-workflow.md). Do **not** re-paste that bash/YAML
here — cross-reference it.

**Visual-regression + a11y specs are domain-mapped too (REQUIRED).** Screenshot/visual-
regression and a11y (axe) specs MUST follow the **same** domain-mapping (path `e2e/<domain>/**`
or tag `@<domain>`) as E2E, so the release merge can scope them to the changed domains with a
full-suite fallback on `«SHARED_PATHS»` changes — same diff→changed-domains→scoped-run+fallback
mechanism: [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) §4.2.

---

## Flaky-test quarantine (REQUIRED)

Flaky specs **must never be merged as green**, and must never silently block the gate either.
The canonical handling:

- **Tag the flaky spec `@quarantine`.** Quarantined specs are **excluded** from the
  `e2e-gate` / `unit-gate` required checks (a flake can't fail the merge), and are run on a
  separate non-blocking lane.
- **Retry at most once.** A quarantined spec is retried a single time; persistent failure
  does not gate the merge but is still surfaced on the non-blocking lane.
- **Auto-file a tracking issue.** Entering quarantine **auto-files a tracking issue** (label
  e.g. `flaky` + a `priority:` label). Quarantine is **temporary** — every entry needs a
  **tracking issue + an owner**; an unowned/issue-less quarantine entry is itself a failure.
- **Count is non-increasing — shrink, not grow.** CI **asserts the quarantine count is
  non-increasing** between runs: a PR may *remove* quarantined specs but must not *add* net
  new ones without justification. This is the **same "shrink, not grow" mechanism** as the
  a11y `KNOWN_VIOLATIONS` allowlist (see `QUALITY_ASSURANCE.md` §4) — an allowlist that may
  only ratchet **down**.

---

## Critical paths

_(One subsection per critical path. Lead with a single sentence describing the journey, then list the assertions as checkboxes — `[x]` covered (cite the spec file), `[ ]` a named **Gap** with the reason it isn't covered yet. Delete the example below and write your repo's CP list.)_

### CP-1 · «Critical path name»

«One- or two-sentence description of the journey-level behavior.»

- [x] «assertion that is covered» — `e2e/«spec-file».spec.ts`
- [x] «another covered assertion» — `e2e/«spec-file».spec.ts`
- [ ] **Gap:** «assertion not yet covered» — «why (e.g. needs «ENV_GATES» credentialed setup)».
- [ ] **Gap («ENV_GATES»-gated):** «full happy path that requires credentialed setup».

---

## Spec inventory («TEST_COUNT» files, ~«TEST_COUNT» tests)

_(Alphabetical. One row per `e2e/*.spec.ts` file: its name, the critical path(s) it aligns to (or "cross-cutting"), and its intent. Generate from the repo's actual spec files; delete the example rows.)_

| Spec                    | CP                   | Intent                                  |
| ----------------------- | -------------------- | --------------------------------------- |
| `«spec-file».spec.ts`   | «CP-N / cross-cutting» | «one-line description of what it asserts» |
| `«spec-file».spec.ts`   | «CP-N («ENV_GATES»-gated)» | «one-line description»             |

---

## How to add a new test

1. Find the right spec from the inventory above. Add a new `test(...)`
   inside the existing `describe` block where the journey matches.
2. If the scenario doesn't fit anywhere, file a new `*.spec.ts` with
   the journey name (e.g. `«journey-name».spec.ts`) and add
   an entry to the inventory in this doc. **Domain-map it** (path
   `e2e/<domain>/**` or tag `@<domain>`) — an unmapped spec breaks
   release-time domain-scoping (see "Domain-mapping" above).
3. Keep specs CI-safe by default. If the test needs credentialed setup
   («ENV_GATES»: «AUTH» / «PAYMENTS»-test-mode / «DB_CMS» seed data),
   gate it behind the repo's `«ENV_GATES»` helpers (e.g. an
   `checkAuthEnv` / `checkE2ECredentials` guard).
4. Apply the mandatory per-flow helpers («TEST_HELPERS», e.g. a
   `dismissCookieConsent(page)` helper) after the first `page.goto()`
   in any flow that interacts with buttons — a consent banner can
   block clicks beneath it.
5. Update the relevant CP entry above when you add coverage. The
   "Gap" bullets are the running TODO list for journey-level e2e.

## What's deliberately out of scope

_(List what is intentionally NOT asserted by the e2e runner (e.g. Playwright), with where it's handled instead. Generic candidates — «OUT_OF_SCOPE»:)_

- **Visual regression** — handled by a dedicated screenshot spec; update
  baselines via `«E2E_CMD» test:e2e:visual:update`. Note the
  pinned browser/viewport/motion settings.
- **Email rendering / workflow** — not asserted by the e2e runner (e.g. Playwright); see
  `docs/emails-workflow.md` for when/why/how-to-test and manual QA.
- **Performance budgets** — handled via a separate CI job, not via
  e2e-runner assertions (e.g. Playwright).
