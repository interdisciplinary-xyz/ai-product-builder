# RELEASE_MANAGER.md — Release workflow & CI cost-control policy

> **Canonical / source-of-truth copy** (lives in the `ai-product-builder` library). Unified from the
> multiple project variants across the codebase. To adopt in a repo,
> copy to `docs/RELEASE_MANAGER.md` and fill the `«placeholders»`. **Where this
> template and a repo's *verified* CI config disagree, the verified config wins.**
>
> **Scope:** how work moves from implementation to production, and how we keep
> GitHub Actions spend low while still gating «TRUNK». Companion to
> [`RUNBOOK_QUALITY_ASSURANCE.md`](./RUNBOOK_QUALITY_ASSURANCE.md) (the quality bar) and
> [`RUNBOOK_SESSION_MIGRATION.md`](./RUNBOOK_SESSION_MIGRATION.md) (session handoff).
>
> **This is the POLICY doc.** Its implementation companion is
> [`RUNBOOK_GITHUB_ACTIONS.md`](./RUNBOOK_GITHUB_ACTIONS.md) —
> the concrete workflow YAML that enacts the §3 cost-control policy below.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_RELEASE_MANAGER` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_RELEASE_MANAGER.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — generic branch/CI cost-control policy already abstracted with `«placeholders»`; no product-specific names or findings embedded (the §7 blocker list is an explicit per-repo fill-in).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«NODE_VERSION»` — Node version (must match `.nvmrc`; `engines` cap) (e.g. 22.15.1) — §5, §9.
> - `«QUALITY_CMD»` — the aggregate quality command (format + lint + types + unit + repo audits) (e.g. `pnpm ci:quality`) — §4, §6.
> - Branch naming — `scope/vX.Y.Z` → `release/X.Y.Z` (or `release/vX.Y.Z`) → «TRUNK» (e.g. main); the CI guards key off the `scope/`/`release/**` prefixes — §1.
> - `«PKG_MGR»` + commands — `«QUALITY_CMD:types»` / `«QUALITY_CMD:unit»` / `«QUALITY_CMD:lint»` + `«QUALITY_CMD:format»` / `«E2E_CMD»` / `«BUILD_CMD»` (e.g. `pnpm test:types` / `test:unit` / `standard` / `test:e2e --project=chromium` / `build`) — §4.
> - `«TEST_CMD»` + its **affected/changed-only** mode — unit/integration runner for scoped runs (e.g. `vitest related` / `vitest --changed`, `jest --changedSince`, `turbo ...[ref]`, `nx affected`); **REQUIRED on `feat/*`/`fix/*` PRs** (the `unit-gate` check) — §4.1.
> - `«DOMAIN_PATHS»` — where domains live, for path-based scoping (e.g. `src/domains/<d>/**`) — §4.1.
> - `«SHARED_PATHS»` — cross-cutting paths that force a **full** test run when changed (e.g. `src/lib`, `packages/shared`, design system, config, lockfile, CI) — §4.1, §4.2.
> - E2E↔domain mapping — how specs map to domains: path (`e2e/<domain>/**`) or tag (`@<domain>`), plus the diff base (`origin/«TRUNK»`) — §4.2.
> - CI workflow names + triggers — `ci.yml`, `release.yml`, the performance/Lighthouse workflow — §3.
> - Per-repo open P1/P2 blockers (issue numbers + impact) or `gh issue list --label audit` — §7.
> - Issue labels — `audit` + a `priority:` label — §7.

## Goal

Ship validated code to «TRUNK» (e.g. main) at the **lowest safe CI cost**. The lever
is *where* validation happens: cheap checks run locally on `scope/*`; paid cloud CI runs
only on the release-line PR into «TRUNK» (plus the post-merge safety net).

---

## 1. Staged branch workflow

```text
scope/*     → implementation + cheap LOCAL validation (cloud CI skipped on purpose)
release/*   → staging: cloud CI + E2E + preview; release-readiness gate
«TRUNK»     → validated, production-ready code only (e.g. main)
```

Optional middle layer (repos that track one-issue-one-PR, e.g. monorepos):

```text
feat/<#>-slug | fix/<#>-slug   → one issue → one branch, cut from latest release/*
```

**Naming convention:** `scope/vX.Y.Z` → `release/X.Y.Z` (or `release/vX.Y.Z`) → «TRUNK» (e.g. main).
The CI guards key off the `scope/` and `release/**` prefixes, so a `v` asymmetry is
harmless — but pick one pattern per repo and stay consistent. A legacy `prerelease/*`
prefix may exist; prefer `scope/*` for new aggregate work.

**Hard rules**
1. **Never** merge `scope/*` directly into «TRUNK». Scope always targets its `release/*`.
2. Implementation (`feat/*`/`fix/*`) branches start from the **latest `release/*`**.
3. The `release/* → «TRUNK»` merge is a **single approved PR**, **merged manually by the maintainer** — automation must not merge to «TRUNK».

---

## 2. Branch responsibilities

| Branch | Purpose | Allowed work | Cloud CI posture |
|---|---|---|---|
| `scope/*` | Implementation, review, AI-assisted iteration (Claude Code / Cursor / Copilot); roadmap & scope docs | Code, fixes, refactors, **local** validation | **Skipped by design** (0 runner minutes) |
| `feat/*`, `fix/*`, `chore/*` | One issue ↔ one PR (optional layer) | Implementation | **Full** on PR into `release/*` |
| `release/*` | Staging / release-readiness umbrella | Stabilisation, last fixes; avoid large new scope | **Cloud CI + E2E** on the umbrella PR |
| «TRUNK» (e.g. main) | Production-ready truth | Only validated release merges; tags + changelog | **Full** on push (safety net); auto-release |

- On `scope/*`: prefer local validation; do **not** trigger expensive Actions / cloud E2E unless explicitly requested; open the PR as **draft** while WIP.
- On `release/*`: cloud CI + Playwright E2E expected; verify the deployment preview; evaluate readiness.
- On «TRUNK»: accept only validated merges; `release.yml` auto-bumps version + changelog on push (skipping its own `chore(release):` commits).

---

## 3. CI / GitHub Actions cost-control policy

Cost control is enforced **in the workflow config**, not by convention. Typical layout:

### `ci.yml` — the consolidated PR gate
- **Triggers:** `pull_request` → `[«TRUNK», release/**]` (e.g. `[main, master, release/**]`), `push` → `[«TRUNK»]` (e.g. `[main]`), manual `workflow_dispatch`. Scope branches never start a run on their own.
- **Path filters:** `paths-ignore` skips `**/*.md`, `docs/**`, `LICENSE` — docs-only changes cost zero minutes.
- **Scope guard:** every job carries `if: !startsWith(github.head_ref, 'scope/')` → a PR whose **head** is `scope/*` is skipped even when its **base** is `release/**`.
- **Draft guard (optional):** jobs require `pull_request.draft == false` → draft PRs cost nothing until marked ready.
- **Concurrency:** `cancel-in-progress: true` kills superseded runs on the same ref.

Tiered jobs, cheapest → most expensive, **gated** so a cheap failure never burns expensive minutes:

| Tier | Job | ~Cost | Runs when |
|---|---|---|---|
| 0 | `commit naming` (commitlint) | ~20 s | PR events, non-`scope/*` head |
| 1 | `quality` — lint + format + types + unit (one runner) | ~1–2 min | non-`scope/*` head |
| 2 | `e2e` — build + bundle budget + Playwright (chromium) | ~3–7 min | `needs: quality` (only if Tier 1 green) |

Cost mechanisms (verify each against the repo's `ci.yml`):
- **`scope/**` PRs skip every job.**
- **Trunk-only `push`** — only «TRUNK» (e.g. main); bare pushes to feature/scope branches run nothing.
- **`e2e needs: quality`** — a lint/type/unit failure never starts Playwright.
- **Build once** — the single `build:test` is also the build gate and the bundle measurement.
- **Concurrency cancel-in-progress.**
- **`ubuntu-latest` only** — no macOS/Windows minute multipliers.
- **`--project=chromium` only** — not the full browser matrix.
- **Caching** — pnpm store, build cache, Playwright browsers, service containers.
- **Affected-only test selection** — `scope/*`/`feat/*`/`fix/*` runs only tests for the changed domains/files; the `release/*` gate runs **full quality + domain-scoped E2E** (only the changed domains' E2E, full E2E on shared-code changes — see §4.1–§4.2).

### Performance workflow (Lighthouse / Page Speed Insights) — off the PR path
**Manual `workflow_dispatch`** (± nightly `schedule`) only. Never blocks a merge.
Local equivalent: `node_modules/.bin/lhci autorun` (call the binary directly — see §5).

### `release.yml` — changelog + tag
`push` → «TRUNK» (e.g. main) only, with a loop guard (`!contains(head_commit.message, 'chore(release):')`).
Runs the version/changelog tool and pushes tags back to «TRUNK».

### ⚠️ Cost note — one-issue-one-PR vs. minutes
Each `feat/*`/`fix/*` PR into `release/*` costs a full run. For large audit backlogs,
**batch low-risk, same-area fixes** into one PR (validate locally first) while keeping
high-risk/structural changes isolated for clean review and revertability.

---

## 4. Validation strategy (local-first ladder)

Run the **cheapest signal first**; only pay for cloud CI at the release gate.

> **REQUIRED — `«SHARED_PATHS»` is a SINGLE committed source of truth.** Keep the
> cross-cutting path list in **one committed file** (e.g. `.github/shared-paths.txt`, one
> path-pattern per line) read by **both** CI and the snippets in this doc. Never restate or
> hardcode the list inline (drift silently mis-scopes tests — a missed shared path lets a
> change skip the full suite). The `grep`/path-filter steps below read that file rather than
> an inline pattern.

```bash
nvm use            # match .nvmrc — REQUIRED (see §5)
«QUALITY_CMD»      # aggregate: format + lint + types + unit (+ repo audits) (e.g. pnpm ci:quality)
```

> Commands below assume pnpm; swap in your own runner («PKG_MGR») and script names.

| Stage | Command | Where |
|---|---|---|
| Types | `«QUALITY_CMD:types»` (`tsc --noEmit`, strict) (e.g. `pnpm test:types`) | local / CI T1 |
| Unit | `«QUALITY_CMD:unit»` (e.g. `pnpm test:unit`) | local / CI T1 |
| Lint + format | `«QUALITY_CMD:lint»` + `«QUALITY_CMD:format»` (e.g. `pnpm standard`) | local / CI T1 |
| **Aggregate (mirrors CI quality)** | `«QUALITY_CMD»` (e.g. `pnpm ci:quality`) | **local — run before any scope→release merge** |
| E2E (flows) | `«E2E_CMD»` (e.g. `pnpm test:e2e --project=chromium`) | local / CI T2 |
| Build sanity (optional) | `«BUILD_CMD»` (e.g. `pnpm build`) | local |

### 4.1 Scoped / affected-only testing (cheap-first on `scope/*` and `feat/*`/`fix/*`)

To keep iteration fast and CI cheap, run **only the tests affected by the PR's changed
files** during scope/feature work — then run the **full** suite at the release gate.

> **REQUIRED on `feat/*`/`fix/*` PRs — domain-scoped unit/integration.** Affected/import-graph
> unit + integration is **no longer an optional optimization**: every `feat/*`/`fix/*` PR
> (into `release/*`) MUST run the affected/import-graph runner in changed-mode — `«TEST_CMD»`
> changed-mode (see the import-graph commands below) — falling back to the **full** suite on
> any `«SHARED_PATHS»` change. `unit-gate` is the **required check** for these PRs. Types and
> lint stay **full** (project-wide) even when tests are scoped. CI implementation:
> [`RUNBOOK_GITHUB_ACTIONS.md`](./RUNBOOK_GITHUB_ACTIONS.md).

**How to scope (pick what your stack supports):**
- **By import graph (preferred — follows the dependency graph, so a change in one domain
  still runs the tests of domains that import it):**
  - Unit/integration: `«TEST_CMD»` in changed-only mode — e.g. `vitest related <files>` /
    `vitest --changed origin/«TRUNK»`, or `jest --findRelatedTests <files>` /
    `jest --changedSince=origin/«TRUNK»`.
  - Monorepo tasks: affected-graph runners — e.g. `turbo run test --filter=...[origin/«TRUNK»]`
    or `nx affected -t test`.
- **By domain/path (simpler, weaker):** map changed `«DOMAIN_PATHS»` (e.g. `src/domains/<d>/**`)
  → run that domain's unit tests + its tagged E2E. In CI, detect changed domains with a
  path-filter step (e.g. `dorny/paths-filter`, `tj-actions/changed-files`) and run a
  per-domain job matrix.

**Guardrails — when affected-only is NOT safe → run the FULL suite:**
- **Shared / cross-cutting changes:** `«SHARED_PATHS»` (e.g. `src/lib`, `packages/shared`,
  design system, config, lockfile, CI workflows, `tsconfig`) affect everything → full suite.
- **The `release/* → «TRUNK»` gate runs full types/lint/unit/build**, but its **E2E layer
  is domain-scoped** to the domains whose files changed (see §4.2) — falling back to full
  E2E on shared-code changes. (Affected-only *unit* selection stays a `scope/*`/`feat/*`/`fix/*` optimization.)
- **Path-only scoping misses import-graph breakage** (domain A importing B). Prefer the
  graph-aware runners above; with path filtering alone, fall back to full on any non-trivial change.
- **Types & lint stay project-wide** — keep `«QUALITY_CMD:types»` (and lint) full even when
  tests are scoped; a change can break a distant type the affected set won't cover.

### 4.2 Domain-scoped E2E at the release merge (DDD) — REQUIRED

> **Required for domain-driven repos.** The `release/* → «TRUNK»` merge MUST run E2E for the
> changed domains only, with a full-suite fallback on shared-code changes (step 3 below).
> This requires E2E specs to be domain-mapped (path or tag). CI implementation:
> [`RUNBOOK_GITHUB_ACTIONS.md`](./RUNBOOK_GITHUB_ACTIONS.md).

This repo is **domain-driven** — code lives under `«DOMAIN_PATHS»` (e.g. `src/domains/<domain>/`).
At the `release/* → «TRUNK»` merge, run E2E **only for the domains whose files changed**:
change `auth` → run `auth` E2E; change `auth` + `headless` → run both; etc.

**1. Derive the changed domains from the release diff:**

```bash
CHANGED_DOMAINS=$(git diff --name-only origin/«TRUNK»...HEAD \
  | grep -oE '«DOMAIN_PATHS»' | sed -E 's#.*/([^/]+)/.*#\1#' | sort -u)
#   ^ e.g. pattern src/domains/[^/]+/  → prints: auth\nheadless
```

**2. Run only those domains' E2E** — pick the convention your specs use:

```bash
# Path-organized specs (e2e/<domain>/** or src/domains/<domain>/e2e/**):
«E2E_CMD» $(echo "$CHANGED_DOMAINS" | sed 's#^#e2e/#')      # e.g. playwright test e2e/auth e2e/headless

# Tag-organized specs (each spec tagged @<domain>):
GREP=$(echo "$CHANGED_DOMAINS" | paste -sd'|' -)            # auth|headless
«E2E_CMD» --grep "@($GREP)"                                 # e.g. playwright test --grep "@(auth|headless)"
```

**3. Guardrail — fall back to the FULL E2E suite when the change is not domain-isolated:**

- any `«SHARED_PATHS»` file changed (shared libs, design system, config, lockfile, CI, `tsconfig`, root app shell);
- a cross-domain contract or shared E2E fixture/helper changed;
- `CHANGED_DOMAINS` is empty but non-doc code changed (the change lives outside any domain).

```bash
if [ -z "$CHANGED_DOMAINS" ] || git diff --name-only origin/«TRUNK»...HEAD | grep -qE -f .github/shared-paths.txt; then
  «E2E_CMD»          # full E2E — a shared change can break any domain
fi
# ^ reads the SINGLE committed «SHARED_PATHS» list (e.g. .github/shared-paths.txt) — never an inline pattern (§4).
```

> Types, lint, unit and build still run **full** at the release gate (cheap, and they catch
> cross-domain breakage E2E scoping would miss). Only the expensive **E2E** layer is domain-scoped.

Cloud validation (CI + E2E + preview) is reserved for the **`release/*` PR**, where it
runs automatically. Don't push scope work to a release branch just to "get CI" — open
the scope→release PR.

---

## 5. Local environment gotchas

- **Node version is mandatory.** Match `.nvmrc` (= «NODE_VERSION», e.g. 22.15.1); `engines` typically forbids `>=23`. A newer shell default (observed: v24) breaks tooling **(example failure mode — yours may differ)**: e.g. `@sentry/core` while loading `next.config.mjs` → "Class extends value undefined" → dev/build/eslint/tsc crash. Run `nvm use` first.
- **`npx` / `«PKG_MGR» dlx` can hang** in this environment — call binaries directly: `node_modules/.bin/<tool>`.
- **Disk pressure** has corrupted the package-manager store before; fix with `«PKG_MGR» install --force` (e.g. `pnpm install --force`). Keep free space.
- **husky pre-push** may run the full local CI on every push — don't bypass with `--no-verify`.

---

## 6. Merge strategy

1. **scope/* → release/*** — open as **draft** while WIP. Before promoting: local `«QUALITY_CMD»` green; review threads resolved; preview sane. Cloud CI is skipped here by design (that's expected, not a failure). Mark ready; **maintainer merges** → this triggers full cloud CI on the open release PR.
2. **release/* → «TRUNK»** — first bring `release/*` up to date with «TRUNK» (absorb hotfixes). Wait for the freshly-triggered cloud CI to pass **after** the scope merge (a green run from before doesn't cover the new code). Confirm the preview, resolve blockers (§7). **Maintainer merges manually** — never auto-merge or `gh pr merge` to «TRUNK».
3. **Hotfixes** applied directly to «TRUNK» (`hotfix/*`) must be merged back **down** into the active `release/*` (and `scope/*`) to prevent divergence.
4. **Tag/changelog** happen automatically via `release.yml` on push to «TRUNK».

---

## 7. Risk / blocker tracking

A release is **not** ready for «TRUNK» while a **P1** is open. Track blockers as
GitHub issues (label e.g. `audit` + a `priority:` label), one per finding; deferred
items are explicitly labelled for a later milestone, **not silently dropped**.

> Per-repo: list the current open P1/P2 blockers here (issue numbers + one-line impact),
> or link to `gh issue list --label audit`.

---

## 8. Known CI foot-guns (accept or guard)

- **`workflow_dispatch` on a scope branch runs everything** — `github.head_ref` is empty for non-PR events, so the `scope/*` skip doesn't apply. Don't manually dispatch `ci.yml` on a `scope/*` branch unless you mean to pay.
- **Docs-only PRs + branch protection** — `paths-ignore` means required checks never report, so a docs-only PR may need an admin merge. Bundle a trivial non-docs change, or merge as admin.
- **Preview deployments still build on `scope/*` PRs** — not GitHub Actions minutes (separate quota), a small cloud cost; fine to leave on, just be aware.
- **Branch protection may not be enforceable** on private repos on a free plan (`…/branches/«TRUNK»/protection` → 403). The "no direct push to «TRUNK»" rule is then **advisory, enforced by discipline + husky**, not the server. Mitigation: never push to «TRUNK» directly; rely on the pre-push gate; upgrade/make-public if hard enforcement is required.

---

## 9. Release Manager checklist (per promotion)

**scope/* → release/*** (CI skipped — the local gate is the only gate)
- [ ] `«QUALITY_CMD»` green locally (correct Node via `nvm use`).
- [ ] Affected unit/integration tests green for the changed domains (**full suite** if a `«SHARED_PATHS»` file changed) — see §4.1. On `feat/*`/`fix/*` PRs this is **REQUIRED** (`unit-gate` check, `«TEST_CMD»` changed-mode).
- [ ] E2E run locally **if** the change touched critical flows (scope/docs-only exempt).
- [ ] Working tree committed/pushed (no orphan local changes).
- [ ] Conventional-commit messages.

**release/* → «TRUNK»** (full cloud CI — the production gate)
- [ ] `release/*` up to date with «TRUNK» (hotfixes absorbed).
- [ ] Cloud CI green on the umbrella PR — commit naming + quality (full) + **E2E for the changed domains** (full E2E if a `«SHARED_PATHS»` file changed; see §4.2).
- [ ] Milestone scope complete; `package.json` bumped to the release version.
- [ ] Deployment preview verified.
- [ ] No open **P1** blockers (§7); deferred items explicitly labelled.
- [ ] Maintainer approval on the single release PR; changelog/tag will be generated by `release.yml`.
