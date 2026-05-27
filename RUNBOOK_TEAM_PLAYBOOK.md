# Team Playbook

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_TEAM_PLAYBOOK` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/TEAM_PLAYBOOK.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The process framework (workflow → code standards → code organization → testing → env setup → deployment) carries over as-is; swap in this repo's stack, commands, and conventions.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«NODE_VERSION»` / `«PKG_MGR»` — Node version (`nvm use`) and package manager (npm/pnpm/yarn)
> - `«DEV_COMMANDS»` (concept group) — install + dev-server commands; expands to the body token `«LOCAL_URLS»` (the local web/admin URLs and ports, incl. any local-domain wrapper)
> - `«BRANCH_STRATEGY»` (concept group) — branch model + commit convention; expands to body tokens `«MAIN_BRANCH»`, `«FEATURE_BRANCH_PATTERN»`, `«COMMIT_CONVENTION»`, `«COMMIT_LINT_TOOL»`
> - `«GIT_HOOKS»` (concept group) — pre-commit / pre-push behavior; expands to the body tokens `«GIT_HOOKS_PRECOMMIT»` (lint-staged, commitlint) and `«GIT_HOOKS_PREPUSH»` (test gates)
> - `«CI_CHECKS»` — what each PR runs (unit, type, E2E, perf)
> - `«LINT_CONFIG»` (concept group) — linter/formatter setup; expands to body tokens `«LINT_PRESET»`, `«LINT_KEY_RULES»`, `«LINT_STAGED_TOOL»`
> - `«API_CLIENT»` (concept group) — client/server data-access; expands to body tokens `«CLIENT_API_CONVENTION»`, `«SERVER_API_CONVENTION»`
> - `«DOMAIN_OWNERSHIP»` (concept group) — module/domain map; expands to body tokens `«DOMAIN»` (one row per domain), `«OWNER_CONCERN»` (per-domain ownership), `«ALLOWED_DEPS»` (allowed dependency edges)
> - `«FILE_NAMING»` (concept group) — naming/folder conventions; expands to body tokens `«COMPONENT_NAMING»`, `«TEST_NAMING»`, `«CONSTANTS_NAMING»`, `«BARREL_NAMING»`
> - `«TEST_SETUP»` (concept group) — testing framework + locations; expands to the body tokens `«TEST_SETUP_UNIT»` (unit framework, colocation, mocking), `«TEST_SETUP_E2E»` (E2E framework, base URL, CI runner, skipped suites), and `«TEST_SETUP_TYPES»` (type-check strictness + command)
> - `«ENV_SETUP»` (concept group) — required env vars + validation; expands to body tokens `«ENV_VAR_1»` and `«PURPOSE»` (one row per env var)
> - `«DEPLOY_TARGET»` (concept group) — deploy platform + build specifics; expands to body tokens `«DEPLOY»`, `«BUILD_OUTPUT_MODE»`, `«SOURCEMAP_HANDLING»`, `«EXTERNAL_PACKAGES»`

## Development Workflow

### Getting Started

```sh
«DEV_COMMANDS»
# what to write here, e.g.:
#   nvm use            # «NODE_VERSION»
#   «PKG_MGR» install   # install dependencies
#   «PKG_MGR» start:dev # start dev server (+ any local-domain wrapper)
```

«LOCAL_URLS»
(what to write here: the local web/admin URLs and ports, plus any alternate variants.)

### Branch Strategy

«BRANCH_STRATEGY»
(what to write here: the branch model and commit convention, e.g.:)

- `«MAIN_BRANCH»` -- production-ready code
- `«FEATURE_BRANCH_PATTERN»` -- feature branches (merge to main via PR)
- «COMMIT_CONVENTION» -- e.g. conventional commits `type(scope): description`

### Before Committing

«GIT_HOOKS_PRECOMMIT»
(what to write here: pre-commit hook behavior, e.g.:)

- «LINT_STAGED_TOOL» -- formatter + linter on staged files
- «COMMIT_LINT_TOOL» -- validates commit message format

### Before Pushing

«GIT_HOOKS_PREPUSH»
(what to write here: pre-push hook behavior, e.g. runs the unit-test suite.)

### CI Checks

Every PR triggers:

- «CI_CHECKS»
- (what to write here: the checks each PR runs — unit tests, type checking, E2E, performance, etc.)

---

## Code Standards

«LINT_CONFIG»
(what to write here: linter/formatter setup and the key rules enforced, e.g.:)

- «LINT_PRESET» (base ruleset/preset)
- «LINT_KEY_RULES» (notable custom rules — unused-imports, import sorting, no-console, framework rules)

### API Client

«API_CLIENT»
(what to write here: the client/server data-access conventions, e.g.:)

**Client-side:** «CLIENT_API_CONVENTION» (the shared fetch wrapper, timeout, credentials, error type, URL handling)

**Server-side:** «SERVER_API_CONVENTION» (direct DB/CMS calls or `fetch` with caching/revalidation for ISR)

---

## Code Organization Rules

### Domain Ownership

(what to write here: map each module/domain to its responsibility and the modules it may depend on, to keep dependency edges explicit.)

| Domain   | Owner concern   | Can depend on   |
| -------- | --------------- | --------------- |
| «DOMAIN» | «OWNER_CONCERN» | «ALLOWED_DEPS»  |

(one row per domain)

### File Naming

«FILE_NAMING»
(what to write here: the naming/folder conventions, e.g.:)

- Components: «COMPONENT_NAMING»
- Constants: «CONSTANTS_NAMING»
- Tests: «TEST_NAMING»
- Barrel exports: «BARREL_NAMING»

### What Not to Touch

See your decision log for protected areas (if you keep one — see the `RUNBOOK_DECISION_LOG.md` template in the `ai-product-builder` library folder).

---

## Testing Standards

### Unit Tests

«TEST_SETUP_UNIT»
(what to write here: unit test framework, file location/colocation, mocking approach, environment, and notable coverage targets.)

### E2E Tests

«TEST_SETUP_E2E»
(what to write here: E2E framework, test location, base URL, CI runner/start command, and any CI-skipped suites and why.)

### Type Checking

«TEST_SETUP_TYPES»
(what to write here: type-check strictness settings and the command to run before merging.)

---

## Environment Setup

«ENV_SETUP»
(what to write here: where env vars live, how they're validated at startup, and the required-variables list, e.g.:)

- «ENV_VAR_1» -- «PURPOSE»

(one bullet per required env var)

**IMPORTANT:** Never modify `.env`, `.env.local`, or `.env.example` files via automation — environment variables are managed manually.

---

## Deployment

«DEPLOY_TARGET»
(what to write here: the deploy platform and build specifics, e.g.:)

- «DEPLOY» with «BUILD_OUTPUT_MODE» (and any custom server)
- «SOURCEMAP_HANDLING» (error-monitoring source maps uploaded then deleted, if applicable)
- «EXTERNAL_PACKAGES» (packages externalized from the bundle for smaller output)
