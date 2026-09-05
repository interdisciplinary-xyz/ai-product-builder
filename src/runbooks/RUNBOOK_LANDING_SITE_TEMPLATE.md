# LANDING_SITE_TEMPLATE.md — the marketing/landing-site blueprint

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_LANDING_SITE_TEMPLATE.md`. Copy to `docs/LANDING_SITE_TEMPLATE.md` in a new landing-site repo (or use as the scaffold for `create-landing-site`); fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the "cut a new marketing site" playbook. Codifies the shared shape 8+ sibling landing sites already follow **by hand**, so drift stops accumulating and a new site earns the blueprint for free.
>
> **Companion to** [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) (branch topology + CI cost tiers), [`DEV_PORTLESS.md`](./DEV_PORTLESS.md) (portless local dev + HTTPS), and [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md) (merge gate).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_LANDING_SITE_TEMPLATE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — every load-bearing convention (dep pins, script vocabulary, folder shape, README block set, CMS token naming) is fully generic. Only the site's product-specific content sits outside the blueprint.
>
> **Pairs with:** `MANAGER_ARCHITECTURE.md` (folder shape enforcement), `RUNBOOK_RELEASE_MANAGER.md` (branch-topology + CI cost tiers), `RUNBOOK_DEV_PORTLESS.md` (portless dev), `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md` (env-file contract), `RUNBOOK_CLAUDE_MD.md` (repo-memory shape) — boundary: this runbook owns *the shape of a landing-site repo*; the pairs own each subsystem inside it.
>
> **Local definitions to provide per repo:**
> - `«PROJECT»` — site name (also brand ID for a multi-brand template)
> - `«DOMAIN»` — canonical hostname (`www.` policy declared in §Load-bearing invariants)
> - `«LOCALES»` — supported locale list (`en, pl` / `pl, en, de` / …); order matters — first is default and typically path-unprefixed
> - `«CMS»` — CMS choice, one of `{ storyblok, sanity, payload, none-static }`; the blueprint carries a per-CMS token-naming block below
> - `«CMS_SPACE_ID»` — CMS-side project/space identifier (**not** in `package.json` — always in `«ENV_EXAMPLE»`)
> - `«NODE_VERSION»`, `«PKG_MGR»` — inherited from library core tokens
> - `«CI_FILE»` — the workflow filename (blueprint locks this at `.github/workflows/ci.yml` — see below for why)
> - `«DEPLOY»` — hosting target
> - `«OBSERVABILITY»` — error/telemetry provider (typically Sentry) — the triad `sentry.{client,server,edge}.config.ts` is templated
> - `«DATE»` — used only for the "last verified" line

---

## 1. Why this exists

Eight of the ten landing sites in the portfolio show the same three recent commits (`docs: prettier --write README.md`, `docs: convert Domains + API sections from bullets to tables`, `docs: apply respect.click formatting blueprint`) — a **manual normalization sprint** applying an implicit blueprint to real repos. This runbook is that blueprint, written down, so:

- a new site starts on-blueprint instead of copy-and-forking a random sibling;
- the drift categories the sprint fights (Storyblok token names diverging four ways, CI files named three ways, motion-library sprawl, dead `Untitled` files) are declared out of bounds up front;
- the "Load-bearing invariants" block (invented in `warszawskaakademiamalucha.pl`) — the numbered list of things that break quietly — is a required README section, not a per-repo invention.

If you cannot look at a new landing site and this runbook side-by-side and reconcile every deviation, the site (or the runbook) is wrong.

---

## 2. The template shape

Anything under `«PLACEHOLDER»` is fill-per-repo. Everything else is verbatim.

```
«PROJECT»/
├─ .github/
│  └─ workflows/
│     ├─ ci.yml                         ← ALWAYS this filename (§4 invariant)
│     └─ cms-probe.yml                  ← if «CMS» != none-static
├─ .husky/
│  ├─ commit-msg                        ← runs commitlint
│  ├─ pre-commit                        ← runs lint-staged
│  └─ pre-push                          ← runs «PKG_MGR» standard + «PKG_MGR» test:types
├─ docs/
│  ├─ audits/                           ← dated audit snapshots (YYYY-MM-DD-<name>.md)
│  ├─ plans/                            ← dated design docs (YYYY-MM-DD-<name>.md)
│  └─ runbooks/                         ← operational runbooks
├─ src/
│  ├─ app/[locale]/                     ← locale-scoped route root
│  ├─ app/api/                          ← preview/revalidate/webhook routes only
│  ├─ components/                       ← `section-*` per CMS blok
│  ├─ domains/                          ← analytics, cookie-consent, cms (optional: push, security)
│  └─ lib/                              ← integration helpers (never business logic)
├─ .env.example                         ← teaches WHY per var (see RUNBOOK_ENV_EXAMPLE_TEMPLATE)
├─ .gitignore
├─ .nvmrc                               ← «NODE_VERSION»; MUST match package.json engines
├─ commitlint.config.js
├─ next.config.ts                       ← (or vite.config.ts / react-router.config.ts)
├─ package.json                         ← the SCRIPT VOCABULARY below is fixed
├─ portless.json                        ← `«PROJECT».local` → localhost:<port>
├─ README.md                            ← the 11-SECTION SHAPE below is required
├─ repo.svg                             ← logo referenced from README badge row
├─ sentry.client.config.ts
├─ sentry.edge.config.ts
├─ sentry.server.config.ts
└─ tsconfig.json
```

---

## 3. Script vocabulary (verbatim)

`package.json` must expose exactly these script names for `«PKG_MGR» standard` / `«PKG_MGR» standard:fix` and their siblings. **Verbatim.** Do not invent local aliases; the portfolio-wide convention is the whole point.

```json
{
  "scripts": {
    "start:dev":         "portless «PROJECT» -- next dev --turbopack",
    "build":             "next build",
    "start":             "next start",

    "standard":          "«PKG_MGR» standard:format && «PKG_MGR» standard:lint && «PKG_MGR» test:types",
    "standard:fix":      "«PKG_MGR» standard:format:fix && «PKG_MGR» standard:lint:fix",
    "standard:format":   "prettier --check .",
    "standard:format:fix":"prettier --write .",
    "standard:lint":     "next lint",
    "standard:lint:fix": "next lint --fix",

    "test:types":        "tsc --noEmit",
    "test":              "vitest run --coverage",
    "test:e2e":          "playwright test",
    "test:a11y":         "playwright test --grep @a11y",
    "test:performance":  "lhci autorun",
    "test:audit":        "«PKG_MGR» audit:content && «PKG_MGR» audit:seo",

    "audit:content":     "tsx scripts/audit/content.ts",
    "audit:seo":         "tsx scripts/audit/seo.ts",

    "cache:clean":       "rm -rf node_modules .next dist .next-audit"
  }
}
```

Rules:

- The `standard` chain is the local mirror of `«PKG_MGR» ci:quality` — one entry point for humans, same steps as CI.
- Test-runner drift (Vitest vs Jest) is a portfolio smell — pick **one** in this blueprint (Vitest) and stick to it. Existing Jest repos remain a legacy exception; new repos MUST use Vitest.
- `cache:clean` names the same three-plus-audit-dir set across every repo. A per-repo variant is a smell.

---

## 4. Load-bearing invariants (required README section)

**Copy this block into every landing site's `README.md` and fill the placeholders.** The block exists to name the things that break quietly — invariants a fresh session cannot infer from the code.

```md
## Load-bearing invariants (brief)

1. **Canonical host.** `«DOMAIN»` is the canonical hostname; non-canonical variants
   301 → canonical. Middleware enforces this **before** i18n resolution.
2. **Locale prefix policy.** `«LOCALES:0»` is the default and is served **unprefixed**;
   every other locale is path-prefixed. `next-intl` (or equivalent) must be configured
   with `localePrefix: 'as-needed'`.
3. **`next typegen` before `tsc`.** Type errors from framework-generated route types
   otherwise mask real errors. The `test:types` script must run typegen first.
4. **CMS token naming.** `«CMS_ACCESS_TOKEN_ENV»` (server-only, `import 'server-only'`)
   and `«CMS_PUBLIC_TOKEN_ENV»` (visual-editor bridge) are separate values; the split is
   a **build-time instruction, not an access-control decision** — say so in the .env
   comment. Do not name them any of the four common variants that don't match this rule.
5. **Consent-first analytics.** No analytics library — Sentry included — fires before
   consent. `src/domains/cookie-consent/` owns the gate; a script tag that bypasses it
   is a P1.
6. **Allowlist CSP.** `next.config.ts` sets a strict CSP with an allowlist for the CMS
   asset domain(s), the analytics endpoints, and `«DOMAIN»` self. `'unsafe-inline'` is a
   deliberate exception if it exists at all — cite the incident that justifies it.
7. **Static homepage rule.** The home route MUST render statically (`export const dynamic
   = 'error'`) — a fallback that opts into SSR is silent perf debt.
```

Each invariant maps to an audit script or a lint rule (§5). The list is the **contract**; the audit is the **enforcement**.

---

## 5. CI shape

`.github/workflows/ci.yml` — the filename is fixed. Rationale (per `SKILL_RATIONALE_COMMENTS.md`): the README badge URL is portable across forks and the `docs/audits/` reports name the workflow file; renaming it here has broken the badge in `szwedswd.com` (which uses `pr.yml`). New sites use `ci.yml`.

```yaml
# ─── ci.yml ──────────────────────────────────────────────────────────────────
# Cost tier: `scope/**` PRs skip every paid job. This mirrors
# `RUNBOOK_RELEASE_MANAGER.md` §branch-topology and matches the library-wide
# staged flow. Removing the guard doubles the Actions minutes bill.
# (See `SKILL_RATIONALE_COMMENTS.md` — this comment IS the invariant.)
on:
  push:
    branches: [«TRUNK», 'release/**']
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    if: ${{ !startsWith(github.head_ref, 'scope/') }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: '«PKG_MGR»' }
      - run: corepack enable
      - run: «PKG_MGR» install --frozen-lockfile
      - run: «PKG_MGR» standard
      - run: «PKG_MGR» test

  build:
    if: ${{ !startsWith(github.head_ref, 'scope/') }}
    needs: quality
    runs-on: ubuntu-latest
    steps: [ … ]
```

A second workflow, `cms-probe.yml`, runs on a schedule to detect silent CMS outages that the fail-open fallback masks — see [`CMS_PROBE_SCHEDULED.md`](./CMS_PROBE_SCHEDULED.md).

---

## 6. CMS token naming — pick ONE per site

For Storyblok / Sanity / Payload, the four historical variants (`STORYBLOK_ACCESS_TOKEN`, `NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN`, `STORYBLOK_PREVIEW_TOKEN`, `NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN`) collapse to a single canonical pair per CMS.

| CMS | Server-only (build + SSR) | Public (visual-editor bridge) |
|---|---|---|
| Storyblok | `STORYBLOK_ACCESS_TOKEN` | `NEXT_PUBLIC_STORYBLOK_PUBLIC_TOKEN` |
| Sanity | `SANITY_API_READ_TOKEN` | `NEXT_PUBLIC_SANITY_PROJECT_ID` (public) |
| Payload | `PAYLOAD_SECRET` | (no public token — Payload is server-authoritative) |

**Never** put `«CMS_SPACE_ID»` in `package.json` scripts (as at least one sibling site currently does — inline-fill `«site-space-id»` in `.env.example` instead). It's an env value.

---

## 7. Anti-patterns (flag and reject)

- Multiple motion libraries in `dependencies` (GSAP + react-spring + Swiper + react-fast-marquee + react-scroll-parallax + react-type-animation). Pick one motion lib per site.
- Old-style script names (`fix`, `format`, `lint`) — every new site uses the `standard:*` vocabulary.
- CI filename not `ci.yml` — the README badge and the audit reports assume this filename.
- `docs/readme.md` as a working branch name — the branch shows up as a checkout of a file in the `gh` UI. Prefer `docs/readme-blueprint` if you must name a docs-only branch.
- `Untitled` / `NOTEPAD.md` / editor-session dead files at repo root — deleted-on-first-review.
- Branch not on the `scope/* → release/* → main` staged flow (per `RUNBOOK_RELEASE_MANAGER.md`).
- A `.env.example` that lists variables without explaining why each one is the shape it is — see [`ENV_EXAMPLE_TEMPLATE.md`](./ENV_EXAMPLE_TEMPLATE.md).

---

## 8. Fresh-site checklist

- [ ] Repo cloned from an on-blueprint sibling (or from a template) — not from an arbitrary older fork.
- [ ] `package.json` scripts match §3 verbatim; test runner is Vitest.
- [ ] `README.md` includes the 11-section blueprint (Overview, Stack table, Domains, API, Scripts, Environment, Load-bearing invariants, Quick start, Docs, Release process, License).
- [ ] `«CI_FILE» == .github/workflows/ci.yml`; scope-branch skip is wired.
- [ ] CMS token names match §6 for the chosen CMS.
- [ ] `.env.example` uses the tutorial format from `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md`.
- [ ] Sentry triad (`sentry.{client,server,edge}.config.ts`) present and DSN-optional (no-ops without env).
- [ ] `docs/audits/` + `docs/plans/` folders exist (may be empty).
- [ ] `.nvmrc` value == `package.json.engines.node` == CI `setup-node@v4` `node-version-file`.
- [ ] `bin/build --check` (in the library repo) passes if this template's tokens are added to `PLACEHOLDERS.md`.

---

## 9. Related

- Branch topology + CI cost tiers: [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md)
- Portless dev + HTTPS: [`DEV_PORTLESS.md`](./DEV_PORTLESS.md)
- `.env.example` shape: [`ENV_EXAMPLE_TEMPLATE.md`](./ENV_EXAMPLE_TEMPLATE.md)
- Tier-1/Tier-2 env access: [`ENV_TIERED_ACCESS.md`](./ENV_TIERED_ACCESS.md)
- CMS silent-outage probe: [`CMS_PROBE_SCHEDULED.md`](./CMS_PROBE_SCHEDULED.md)
- Repo memory shape: [`CLAUDE_MD.md`](./CLAUDE_MD.md)
- Why the CI comment must survive housekeeping: `SKILL_RATIONALE_COMMENTS.md`

**Last reviewed:** «DATE»
