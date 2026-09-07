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
> **Local definitions to provide per repo** — for the layering + exception tables below:
> - `«SHARED_LIB_PATH»` — where cross-cutting infrastructure lives (e.g. `src/lib`) — the directory that becomes a junk drawer if the layering rule isn't written down
> - `«DEEP_IMPORT_PATH»` — one row per deliberate deep import / rule-break, with its reason
> - `«ENV_VALIDATION_PATH»` — where env vars are parsed and validated (e.g. `src/lib/env.ts`), so the agent edits the schema rather than reading `process.env` directly
>
> **Pairs with:** the rest of the repo's `docs/*` — this file is the index, not the source of truth, for any topic it mentions. Also pairs with [`PERMISSIONS_AND_AUTONOMY.md`](./PERMISSIONS_AND_AUTONOMY.md) + `.claude/settings.json`: this file tells the agent what is **true**; that pair tells it what it may **do**.

## The four rules that make this file work

Everything below is an application of these. If you only keep four lines, keep these.

1. **Don't restate — link.** A fact written in two files is a fact that will be wrong in one of them. This file names the canonical doc for each topic and stops. It is an **index**, not a handbook. *(Pricing numbers live in `PRICING_STRATEGY.md`. Do not copy one here "for convenience" — convenience is how the number goes stale.)*
2. **Where a doc disagrees with the code, the code wins.** Say this out loud, in the file, where an agent will read it. Otherwise a confident, obsolete sentence in a doc beats the actual source — and the agent will "fix" working code to match a stale line.
3. **Write the negatives.** The most valuable line in this file is often about something that does **not** exist. See [Inline negative facts](#inline-negative-facts--the-highest-value-lines-in-this-file).
4. **A deliberate exception is declared, not commented.** Every rule you deliberately break is listed in a table *with the reason it exists*. See [Declared exceptions](#declared-exceptions--every-deliberate-rule-break-with-its-reason).

## Project overview

One paragraph: what `«PROJECT»` is, the deployed shape (single app / monorepo / service split), and the one-sentence reason a contributor cares. Link out to `docs/PRODUCT_CONTEXT.md` for the longer version.

- **Product:** `«PROJECT»` — «one-line description»
- **Primary domain:** `«DOMAIN»`
- **Deploy shape:** «single-app / monorepo / N services», hosted on `«DEPLOY»`

> **Docs index — read this before answering from memory.** `docs/README.md` is the canonical map of every doc, tagged ✅ Canonical / ⚠️ Superseded / 🕰️ Historical. **Where a doc disagrees with the code, the code wins.** Canonical sources of truth: pricing → `PRICING_STRATEGY.md`; ICP → `ICP.md`; data model → `DATA_MODEL_GUIDE.md`; security → `SECURITY_MODEL.md`; decisions → `DECISION_LOG.md`; release flow → `RELEASE_MANAGER.md`. «one line per canonical doc». **Don't restate any of them here — link.**

(That paragraph is the highest-leverage block in the file: it is the one an agent reads *before* it starts guessing. Keep it at the top, keep it to one paragraph, and keep the staleness tiebreak in it.)

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

### What goes where (the layering rule)

The single question an agent gets wrong most often is *"where does this new file go?"* — and the cost is invisible: a shared-utils directory silently becomes a junk drawer, and load-bearing business rules end up buried in a folder called `helpers`.

Answer it with a table, and give every bucket a **falsifiable test** — a question with a yes/no answer that a tired human or an agent can apply without judgement. A bucket without a test is a vibe, and vibes do not survive a refactor.

| Bucket | Home | Falsifiable test |
|---|---|---|
| **Integration / subsystem** — wraps a third party or owns a cross-cutting concern | `«SHARED_LIB_PATH»/<name>/` | Would a second consumer reuse it **as-is**? Does it own an `«OBSERVABILITY»` tag of its own? |
| **Pure helper** — no I/O, no product policy; publishable to a package registry unchanged | `«SHARED_LIB_PATH»/utils/<name>/` | **Could you explain it without mentioning `«PROJECT»`?** If you can't, it isn't a util. |
| **Product / business logic** — encodes a rule about *your* users, plans, teams, funnels | `«DOMAIN_PATHS»/<domain>/` — **never** `utils/` | Does it reference a plan tier, an account, an org, a funnel stage? Then it's product logic. |

*(One row per bucket. The test column is not optional — it is the only column that gets used.)*

Two corollaries, both easy to get wrong, both worth stating in the file:

- **A shared-lib module that imports a domain is almost always misfiled.** It's product logic wearing an infrastructure costume. The import direction *is* the test.
- **Business logic is not "minor stuff." Small ≠ generic.** A 40-line function deciding who gets a paid seat belongs in the domain that owns seats, not in `utils/`. Burying a load-bearing rule in a helper bucket is precisely how it gets lost — and then re-implemented, differently, six months later.

### Declared exceptions — every deliberate rule-break, with its reason

Every real codebase breaks its own rules on purpose. The failure isn't the exception; it's that the exception is **indistinguishable from an accident** — because it lives in a code comment that no linter reads and no reviewer greps.

**If a deep import (or any rule-break) is deliberate, declare it rather than commenting it.** A declared exception is a decision. An undeclared one is a bug that hasn't been noticed yet, and an agent tidying up will "fix" it and break your build in a way typecheck will not catch.

| Exception | Why it exists |
|---|---|
| `«DEEP_IMPORT_PATH»` | «the concrete reason — e.g. "pulls a heavy SDK that must not enter the client bundle"; "the CMS config graph imports this barrel, so barrelling it deadlocks type generation"» |

*(One row per deliberate rule-break. If the reason doesn't fit in a sentence, the exception is probably a design problem wearing a table row.)*

Two rules of thumb that fall out of this:

- **A barrel is only as safe as its heaviest re-export.** One helper that pulls a server-only SDK into a widely-imported barrel breaks a build in a way `tsc` cannot see.
- **Declaring an exception is the point of the rule, not a loophole in it.** The list being *visible* is what makes it reviewable — and what makes an unlisted deep import an unambiguous error rather than a judgement call.

### Inline negative facts — the highest-value lines in this file

Positive facts ("auth lives in `«DOMAIN_PATHS»/auth`") are cheap: an agent finds them by reading the code. **Negative facts are unfindable by reading the code**, because the thing isn't there. Absence leaves no trace — so an agent confidently recreates the file you deleted last month, re-adds the hook you removed as dead code, and reintroduces the pattern you spent a week removing.

Write the negatives **inline, next to the positive fact they qualify**, in the form *"there is NO x — «reason»"*:

```markdown
constants/
  env.ts    — the ONLY place that reads process.env
  ui.ts     — UI constants
  (NOTE: there is NO app.ts — app URLs live in config/urls.ts, see below)

Hooks at `«SHARED_LIB_PATH»/queries/hooks/` (exact set — see hooks/index.ts):
  - useCreateTransaction(), useUpdateUser(), …
  (There is no usePlans() hook — queries/plans.ts was removed as dead code.)
```

Each of these is a load-bearing sentence. `(there is NO app.ts)` is what stops an agent from creating `app.ts` — a plausible, conventional, *wrong* file that would fork your config layer. Without the line, nothing prevents it: the code cannot say "and also, don't add this."

Write one whenever:

- you **deleted** something for a reason («dead code», «superseded by X», «it broke Y»);
- you **deliberately did not build** something an agent would expect to exist («no Redis — in-memory is fine at this size»);
- a conventional file **is absent on purpose** («no `app.ts`», «no `index.ts` here — the barrel would create a cycle»);
- a name exists but **does not do what its name implies** («`e2e/` is the spec home, not a product domain»).

Two failure modes to avoid: a negative fact **without a reason** ("there is no `app.ts`") gets deleted by the next reader as noise, and a negatives *section* at the bottom of the file never gets read. **Reason, and inline — both, or it doesn't work.**

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

## Branching

Four lines, because this is the file an agent loads before it opens a terminal — and an agent that
does not know the flow will branch off `«TRUNK»` and open a PR straight at it.

```
scope/vX.Y.Z  →  release/vX.Y.Z  →  «TRUNK»
```

- Work happens on `scope/vX.Y.Z`. Post-scope fixes are `fix/<slug>`; production emergencies are `hotfix/<slug>`.
- PR titles are `«PROJECT» - <branch-name>` — e.g. `«PROJECT» - scope/vX.Y.Z`.
- Commits are Conventional Commits: `type(scope): description`.
- Never commit directly to `«TRUNK»`.

Every string shape above is owned by [`NAMING_CONVENTIONS.md`](./NAMING_CONVENTIONS.md) §1; the
reason the flow has two stages is in [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) §1. This section
is a pointer, not a second copy — if it disagrees with those two, they win.

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
