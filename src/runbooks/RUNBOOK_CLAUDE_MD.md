# CLAUDE.md — `«PROJECT»` project memory (thin template)

A repo's `.claude/CLAUDE.md` is the single file every Claude Code / Cursor / Copilot session loads first. It is **project memory**, not a full handbook — link out to the deeper docs (`docs/ARCHITECTURE.md`, `docs/DECISION_LOG.md`, `docs/RUNBOOK.md`, …) rather than restating them.

Keep this file short. If a section grows past ~15 lines, either prune it or move the detail into the canonical doc and link back from here.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_CLAUDE_MD` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_CLAUDE_MD.md` (source of truth template). To activate in this repo: copy to `.claude/CLAUDE.md` (the path Claude Code / Cursor / Copilot loads first) and fill the `«placeholders»` via `/ai-init RUNBOOK_CLAUDE_MD`.
>
> **Reusability:** template-ready — every section below is generic; only the `«placeholders»` need per-repo values. Define the **canonical tokens** (e.g. `«PROJECT»`, `«DOMAIN»`, `«NODE_VERSION»`, `«PKG_MGR»`, `«QUALITY_CMD»`, `«DB_CMS»`, `«AUTH»`, `«PAYMENTS»`, `«DEPLOY»`, `«OBSERVABILITY»`, `«AI_PROVIDER»`, `«TRUNK»`) **once here** — every other doc in the `ai-product-builder` library reads them from this file rather than restating them.
>
> **Pairs with:** the rest of the repo's `docs/*` — this file is the index, not the source of truth, for any topic it mentions.

## Project overview

One paragraph: what `«PROJECT»` is, the deployed shape (single app / monorepo / service split), and the one-sentence reason a contributor cares. Link out to `docs/PRODUCT_CONTEXT.md` for the longer version.

- **Product:** `«PROJECT»` — «one-line description»
- **Primary domain:** `«DOMAIN»`
- **Deploy shape:** «single-app / monorepo / N services», hosted on `«DEPLOY»`

## Tech stack

The shortest list that lets a fresh agent pick the right library/idiom on the first try. Anything that drifts often (versions) lives in lockfiles + `.nvmrc`, not here.

- **Runtime:** Node `«NODE_VERSION»` (use `nvm use` — `.nvmrc` is present)
- **Package manager:** `«PKG_MGR»` (do **not** mix runners)
- **Language:** TypeScript (strict mode + `noUncheckedIndexedAccess`)
- **Framework:** «framework + major version» (e.g. Next.js «N»)
- **CSS / UI:** «styling system + component primitives»
- **State:** «server-state lib» + «client-state pattern»
- **Auth:** `«AUTH»`
- **DB / CMS:** `«DB_CMS»`
- **Payments:** `«PAYMENTS»` (drop this line if not applicable)
- **AI:** `«AI_PROVIDER»` — «which models for which surfaces» (drop if not applicable)
- **Observability:** `«OBSERVABILITY»`
- **i18n:** «i18n_library» — supported locales: `«LOCALES»` (drop if EN-only)

## Project structure

A diagrammed tree of the top-level layout. Keep it shallow — one level deep is usually enough; agents read code, not ASCII trees. Note the path alias used in imports.

```
«TRUNK»
  src/
    app/            — «framework router / entrypoint»
    «DOMAIN_PATHS»  — domain-driven feature modules
    lib/            — shared utilities + integrations
    …
  scripts/          — repo-local CLI tools
  docs/             — canonical docs (ARCHITECTURE, DECISION_LOG, RUNBOOK, …)
```

Path alias: `«@/*»` maps to `./src/*`.

## Commands

Only the commands a contributor or agent runs **daily**. Anything used once per release lives in `docs/RELEASE_MANAGER.md`.

```bash
# Dev
«PKG_MGR» «start:dev»           # local dev server (port «PORT»)

# Quality gate (must be clean before pushing)
«QUALITY_CMD»          # aggregate: format + lint + types + unit + i18n + build
«QUALITY_CMD:types»    # tsc --noEmit
«QUALITY_CMD:lint»     # ESLint
«QUALITY_CMD:unit»     # unit tests
«E2E_CMD»              # e2e tests (Playwright / Cypress / …)
«BUILD_CMD»            # production build (catches server-only / barrel-leak issues)
```

## Architecture

A 5-10 line orientation pointing at the **shape**, not the details. Anything longer goes in `docs/ARCHITECTURE.md` (which this section links to).

- **Provider hierarchy / boot order:** «outermost → innermost», noting any provider that wires observability or auth user-context.
- **Server → client data flow:** «middleware → server layout → providers → client».
- **Domain boundaries:** every domain under `«DOMAIN_PATHS»` is imported only via its public barrel; deep imports are forbidden (enforced by an import-boundary linter — see `docs/ARCHITECTURE.md`).
- **Shared paths:** changes to `«SHARED_PATHS»` force a full test/CI run (single committed list — never restate the paths here).
- **API conventions:** «route shape, validation pattern, error response shape» — see `docs/ARCHITECTURE.md` and the API docs route.

## Code style

The few rules that **agents get wrong** by default. The rest is enforced by ESLint + Prettier + import-sort and doesn't need restating here.

- **Imports:** auto-sorted (`simple-import-sort`); no manual ordering.
- **Logging:** only `console.warn` / `console.error` are allowed; never `console.log` in committed code.
- **Curly braces:** always required.
- **Server-only modules:** never re-export from a barrel that a client component can reach.
- **TODOs:** never land in `«TRUNK»` — open a tracking issue instead.

## Environment

How env vars are managed; never paste actual values here.

- **`.env.example`** — committed template (frozen keys + safe defaults); update when the env contract changes.
- **`.env.local`** — gitignored; per-developer secrets.
- **Startup validation:** Zod schema in `«ENV_VALIDATION_PATH»` rejects boot on missing/invalid required vars.
- **Never commit:** `.env`, `.env.local`, provider credentials. Update `.env.example` when adding a required key.

## Important notes

A short list of footguns + invariants that **aren't obvious from the code**. The rule: if a contributor would have to break the system to learn it, document it here.

- Always run `nvm use` before any commands (Node `«NODE_VERSION»` required).
- Domain-boundary lint is a **required** CI gate — see `docs/ARCHITECTURE.md`.
- `«OBSERVABILITY»` tag taxonomy: every captured exception must include `tags.domain` from the canonical set — see `docs/ARCHITECTURE.md` (or a dedicated `docs/OBSERVABILITY.md` if present). Drift breaks alert rules silently.
- `«PAYMENTS»` invariants (drop if not applicable): the platform is **never** the merchant of record; payment credentials stay server-only; webhook signatures verify against the **account's** signing key, not the platform's. Static grep guards in CI block custody-implying field names.
- Loading skeletons / modal patterns / cache key formats: when in doubt, copy the existing pattern in the same domain — do not invent a new one.
