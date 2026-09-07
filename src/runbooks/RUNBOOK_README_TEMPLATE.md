# README template — the canonical shape

The README is the repo's front page. Every human, every AI agent, and every drive-by contributor lands here first. This runbook is the **exact shape** every repo in the portfolio uses, distilled from the 17-repo docs-sweep that culminated in `interdisciplinary-xyz/*` merging `docs/readme.md` PRs across the fleet.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_README_TEMPLATE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_README_TEMPLATE.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the section skeleton, the Stack 3-col table, the Architecture tables (Domains / Components / API / Scripts / Environment), the centered theme-adaptive logo, the `---` separator convention, and the Documentation link-table are portable verbatim; **the per-domain rows, per-endpoint tables and env-var groupings are yours to fill.**
>
> **Pairs with:** [`SKILL_PRIVATE_REPO_README_IMAGES.md`](./SKILL_PRIVATE_REPO_README_IMAGES.md) (how the logo actually renders on GitHub, public + private, light + dark) and [`RUNBOOK_RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) (the release flow the "Release flow" section names) — boundary: this runbook owns **the section shape**; the skill owns **image rendering mechanics**; the release runbook owns **branch policy**.
>
> **Owns / defers to:** Owns the README skeleton — section list, ordering, separators, table shapes, the Stack table, and the Documentation table. Defers image rendering → `SKILL_PRIVATE_REPO_README_IMAGES.md`; the API surface itself → `MANAGER_ARCHITECTURE.md` and the OpenAPI spec; the release flow named in the "Release flow" section → `RUNBOOK_RELEASE_MANAGER.md`.
>
> **Local definitions to provide per repo:**
> - `«PROJECT»` — the product's human short name (title of the H1)
> - `«REPO_SLUG»` — the `<org>/<repo>` GitHub path (for the CI badge)
> - `«LOGO_PATH»` — repo-relative path to the logo (SVG preferred, PNG acceptable) — see [`SKILL_PRIVATE_REPO_README_IMAGES.md`](./SKILL_PRIVATE_REPO_README_IMAGES.md)
> - `«LOGO_WIDTH»` — display width (typically 96–200)
> - `«ONE_LINER»` — a single sentence that names the job, not the implementation
> - `«STACK_LINKS»` — the App / Tests / Tools link triples (each cell hyperlinked)
> - `«DOMAINS»` — the domain table rows (name + one-line purpose)
> - `«API_GROUPS»` — the grouped API tables (bold group heading + Method/Path/Purpose rows)
> - `«SCRIPTS»` — the two-column Scripts table (`npm run` name + purpose)
> - `«ENV_CATEGORIES»` — categorised env-var bullets (auth, payments, storage, observability, etc.)
> - `«DOCS_LINKS»` — the Documentation table's two-column link inventory (deployed doc + purpose)

**Last reviewed:** «DATE»

---

## Purpose

Every repo in the portfolio uses the same README shape so that:

1. **A stranger can leave in under 60 seconds** — the header tells them what it does; the Stack table tells them what it's built on; the Documentation table tells them where the rest lives. No archaeology, no scrolling, no reading source to answer *"what is this?"*.
2. **An AI agent has a canonical entry point** — the section names are stable (`## Stack`, `## Architecture`, `## Quick start`, `## Release flow`, `## Documentation`), so agents can grep for them across the portfolio without per-repo adaptation.
3. **Future-you can navigate in the dark** — the Table of contents mirrors every H2 (and the nested Architecture children), so a fresh clone in six months is still readable.

## Steps

### Step 1 — Copy the skeleton

Copy the section skeleton in the [Canonical shape](#canonical-shape) block below into a new `README.md`. Fill placeholders in place; delete sections that genuinely do not apply (mark with `~~strikethrough~~` in review, delete on merge).

### Step 2 — Wire the logo

Follow [`SKILL_PRIVATE_REPO_README_IMAGES.md`](./SKILL_PRIVATE_REPO_README_IMAGES.md) verbatim:

- Repo-relative path (`«LOGO_PATH»`, never leading `/`).
- Centered with `<p align="center">` (never `<div>`, never `align="center"` on `<img>`).
- SVG carrying an inline `<style>` block with `@media (prefers-color-scheme: dark)` for GitHub theme parity.

### Step 3 — Fill the Stack table

The Stack is a **3-column table** (App / Tests / Tools). Every cell is a Markdown link — never bare text. If a category is empty (a docs repo with no tests, a library with no tooling), keep the column and write `—`; a missing column breaks the shape for the next reader.

### Step 4 — Fill the Architecture sub-sections

Four required sub-sections under `## Architecture`, in this order, each a table (never a bulleted list):

1. `### Domains` — one row per domain, `| Domain | Purpose |`.
2. `### Components` — the client-side surfaces (one row per top-level, `| Component | Purpose |`).
3. `### API` — grouped by area (bold heading per group + `| Method | Path | Purpose |` table per group).
4. `### Scripts` — `| Script | Purpose |` for every `package.json > scripts` entry a human would run.

### Step 5 — Environment

Env vars go under `### Environment`, categorised as **bullet lists** (not a table — the values are too long, and categorisation is the primary read). Group by concern: `**Auth:**`, `**Payments:**`, `**Storage:**`, `**Observability:**`, `**Feature flags:**`. One bullet per variable; describe *what breaks without it*, not what it is.

### Step 6 — Quick start, Release flow, Documentation, License

`## Quick start` is 3–7 shell commands, copy-paste runnable. `## Release flow` is a two-line summary linking to `RUNBOOK_RELEASE_MANAGER.md`. `## Documentation` is a **two-column link table** — `| Doc | Purpose |`. `## License` is a single paragraph (MIT if unstated).

### Step 7 — Separators between top-level sections

Every top-level `## Section` boundary carries a `---` separator on the line before it. This is not decoration — it is how the TOC's anchor jumps land at a visible break. A README without separators reads as one long wall on the GitHub renderer.

### Step 8 — Prove it renders

Push to a `docs/readme.md` branch (see [`RUNBOOK_RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) — "Docs branches"). Open the branch's README on github.com. Verify:

- Logo centered, renders in **both** light and dark themes.
- TOC anchors jump to the right sections.
- Every table renders as a table (no collapsed rows from misaligned pipes).
- Nothing 404s, especially the logo, viewed from an **incognito window** (the private-repo trap — see [`SKILL_PRIVATE_REPO_README_IMAGES.md`](./SKILL_PRIVATE_REPO_README_IMAGES.md)).

## Canonical shape

Copy from here down. Placeholders in `«ANGLE_BRACKETS»`.

````markdown
# «PROJECT»

![CI](https://github.com/«REPO_SLUG»/actions/workflows/ci.yml/badge.svg)

<p align="center">
  <img src="«LOGO_PATH»" width="«LOGO_WIDTH»" alt="«PROJECT»">
</p>

«ONE_LINER»

---

## Table of content

1. [Stack](#stack)
2. [Architecture](#architecture)
   - [Domains](#domains)
   - [Components](#components)
   - [API](#api)
   - [Scripts](#scripts)
   - [Environment](#environment)
3. [Quick start](#quick-start)
4. [Release flow](#release-flow)
5. [Documentation](#documentation)
6. [License](#license)

---

## Stack

| App | Tests | Tools |
|---|---|---|
| [«Framework»](«URL») | [«Test runner»](«URL») | [«CI»](«URL») |
| [«Language»](«URL») | [«E2E»](«URL») | [«Package manager»](«URL») |
| [«UI lib»](«URL») | [«Coverage»](«URL») | [«Formatter»](«URL») |

<!-- Every cell is a link. If a column is empty, write `—`, do not delete the column. -->

---

## Architecture

«One paragraph — how the pieces fit. Name the primary flow (browser → API → DB) and
the boundary that keeps this repo honest (a domain boundary, a compliance line, a
public/private surface split). Two to four sentences.»

### Domains

| Domain | Purpose |
|---|---|
| `«domain-a»` | «one line» |
| `«domain-b»` | «one line» |

### Components

| Component | Purpose |
|---|---|
| `«Component»` | «what it renders / owns» |

### API

**«Group A — e.g. Auth»**

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | «one line» |
| `POST` | `/api/auth/logout` | «one line» |

**«Group B — e.g. Content»**

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/content/:slug` | «one line» |

### Scripts

| Script | Purpose |
|---|---|
| `«PKG_MGR» dev` | Local dev server |
| `«PKG_MGR» build` | Production build |
| `«PKG_MGR» test` | Unit + integration |
| `«PKG_MGR» test:e2e` | Playwright, chromium only |
| `«PKG_MGR» ci:quality` | Aggregate: format + lint + types + unit |

### Environment

**Auth**

- `«AUTH_SECRET»` — session signing; rotation breaks all sessions.
- `«OAUTH_CLIENT_ID»` / `«OAUTH_CLIENT_SECRET»` — SSO provider credentials.

**Payments**

- `«PAYMENTS_API_KEY»` — server-only; never in client bundles.
- `«PAYMENTS_WEBHOOK_SECRET»` — verifies incoming webhook signatures.

**Storage**

- `«DB_URI»` — «DB_CMS» connection string.

**Observability**

- `«OBSERVABILITY_DSN»` — error monitor endpoint.

**Feature flags**

- `«FEATURE_FLAG_KEY»` — «what it toggles».

---

## Quick start

```bash
«PKG_MGR» install
cp .env.example .env.local        # fill the required vars from § Environment
«PKG_MGR» dev                     # http://localhost:3000
```

Run the aggregate gate before opening a PR:

```bash
«PKG_MGR» ci:quality              # format + lint + types + unit
```

---

## Release flow

`scope/vX.Y.Z` → `release/vX.Y.Z` → `main`. Full policy: `docs/RELEASE_MANAGER.md`.

---

## Documentation

| Doc | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` | System map: stack, structure, domain boundaries |
| `docs/RELEASE_MANAGER.md` | Branch flow + CI cost policy |
| `docs/GITHUB_ACTIONS.md` | CI implementation |
| `docs/QUALITY_ASSURANCE.md` | The pre-merge gate |
| `docs/SECURITY_MODEL.md` | Auth tiers, IDOR, rate limits, webhook signing |
| `docs/DECISION_LOG.md` | ADR log |
| `docs/MAINTENANCE.md` | Costs, monitoring, hygiene sweeps |

<!-- In the consumer repo, wrap each row's first cell in a Markdown link
     pointing at the same path (e.g. link the `ARCHITECTURE.md` cell to
     `docs/ARCHITECTURE.md`). Left as plain text here to keep the library's
     link-check clean; the consumer fills in real links. -->


---

## License

Released under the MIT license. See [`LICENSE`](LICENSE) for the full text.
````

## Gotchas

**1. `<p align="center">` is the ONLY reliable centering** — see [`SKILL_PRIVATE_REPO_README_IMAGES.md`](./SKILL_PRIVATE_REPO_README_IMAGES.md). Do not "improve" it to a `<div>` or `<center>`; GitHub's sanitiser will strip and the image will fall to the left, silently.

**2. Leading-slash image paths (`/logo.svg`) 404 on private repos.** The proxy rewrite happens for public repos and hides the bug until the day someone flips the repo private. Always use repo-relative paths (`public/logo.svg`).

**3. The Stack table is 3 columns, always.** Two-column stack tables lose the tools ↔ tests distinction; four-column tables lose the shape. If a category is empty, write `—` — do not delete the column.

**4. `### Environment` is bullets, not a table.** Env var values are long, and the categorisation (Auth / Payments / Storage / …) is the primary read. A table forces truncation; bullets let each var describe *what breaks without it*, which is what the reader actually needs.

**5. `### API` is grouped bold-heading + per-group tables — not one big flat table.** A flat table with 40 endpoints is unreadable; grouped tables let the reader jump to the group they care about. The bold heading (`**Auth**`) is the "sub-sub-header" the flat markdown grammar does not have.

**6. Table alignment breaks between local prettier and CI prettier if versions differ** — see [`SKILL_CI_TRANSIENT_FAILURE_TOLERANCE.md`](./SKILL_CI_TRANSIENT_FAILURE_TOLERANCE.md). Pin `prettier` in devDeps; invoke via `«PKG_MGR» exec prettier`; verify before pushing.

**7. `---` separators between top-level sections are not decoration.** They are how TOC anchor jumps land at a visible break; without them, the GitHub-rendered page reads as one long scroll and the TOC feels broken even when it works.

**8. Every image needs `alt`.** Missing `alt` is a screen-reader miss AND it is the only text a viewer sees when the image *does* 404 — including your own preview when you push the wrong path. Name every image (`alt="«PROJECT»"`).

**9. Case-duplicated files on case-insensitive filesystems.** macOS/Windows can hold both `README.md` and `readme.md` as the same inode; committing both produces a case-only diff that breaks on case-sensitive filesystems (Linux CI). Delete the lowercase one, commit the uppercase (`README.md`) as the canonical name — GitHub renders both, but the case-only diff is a portability trap.

**10. Docs-only PRs and branch protection.** A `docs/readme.md` PR that changes only markdown often skips CI (`paths-ignore` in `ci.yml`); if branch protection requires a check that never reports, the PR needs an admin merge. Either bundle a trivial non-docs change, merge as admin, or configure branch protection to accept `Skipped` as passing.

## Related

- Canonical image rendering + logo mechanics: [`SKILL_PRIVATE_REPO_README_IMAGES.md`](./SKILL_PRIVATE_REPO_README_IMAGES.md)
- Docs branch convention (`docs/readme.md`): [`RUNBOOK_RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) — "Docs branches"
- Prettier version alignment (why the table renders differ between local and CI): [`SKILL_CI_TRANSIENT_FAILURE_TOLERANCE.md`](./SKILL_CI_TRANSIENT_FAILURE_TOLERANCE.md)
- The architecture map the `## Architecture` section summarises: [`MANAGER_ARCHITECTURE.md`](./MANAGER_ARCHITECTURE.md)
- Portfolio evidence — the shape shipped verbatim across: respect.click, empatalk-app, fairtomorrow, savei, boatstands.com, craftwave.pl, soundhike.pl, mitchdope.com, moonrie, musinet, neatual.com, onestpromo, hannajuszczak.pl, warszawskaakademiamalucha.pl, szwedswd.com, interdisciplinary.xyz, ai-product-builder
