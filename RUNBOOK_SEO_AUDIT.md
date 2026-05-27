# SEO_AUDIT.md — Technical + programmatic SEO audit record

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_SEO_AUDIT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/SEO_AUDIT.md` and localize the items below.
>
> **Reusability:** template-ready — the audit structure (metadata table → structured data → robots/sitemap → Search Console snapshot → thin content → programmatic inventory → roadmap) is generic across SEO programs; the stack-specific bits (metadata API, validator, RUM vendor) are `«placeholders»`.
>
> **Pairs with:** `MANAGER_SEO.md` (the agent playbook that produces this file), `BRAND_VOICE_GUIDELINE.md` (title + meta-description voice), `FEATURE_SPEC.md` (per-feature SEO acceptance), `ROADMAP.md` (programmatic-SEO planning), `DESIGN_REVIEW.md` (page-level conversion downstream of SEO traffic).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product being audited.
> - `«DOMAIN»` — the primary user-facing domain.
> - `«LOCALES»` — locales in scope (e.g. en, pl).
> - `«ADMIN_PATH»` — admin route excluded from the public sitemap.
> - `«METADATA_API»` — the framework's metadata mechanism (e.g. Next.js `metadata.ts` / `generateMetadata`, SvelteKit `<svelte:head>`).
> - `«STRUCTURED_DATA_VALIDATOR»` — the validator used (e.g. Schema.org validator, Google Rich Results Test).
> - `«SEARCH_CONSOLE_PROPERTY»` — the verified property URL.
> - `«SITEMAP_PATH»` — the sitemap path (default `/sitemap.xml`).
> - `«ROBOTS_PATH»` — the robots path (default `/robots.txt`).

> **Verdict (top of doc — must be dated within current release cycle):**
>
> | Field | Value |
> |---|---|
> | Audited build | «commit SHA» |
> | Audit date | «DATE» |
> | Auditor | «name / role» |
> | Verdict | «Pass / Pass with findings / Fail» |
> | Findings vs last audit | «−N / flat / +N» |

---

## 1. Per-route metadata audit table

Every shipped public route lives here. Orphans (live routes not in this table) are findings.

| Path | Title | Description | OG image | Canonical | hreflang reciprocal | Robots | Status |
|---|---|---|---|---|---|---|---|
| `/` | «title ≤ 60 chars» | «desc 140–160 chars» | `og-home.png` 1200×630 | `https://«DOMAIN»/` | yes | `index, follow` | Pass |
| `/pricing` | ... | ... | ... | ... | yes | `index, follow` | Pass |
| `/«core-flow»` | ... | ... | ... | ... | yes | `index, follow` | Pass |
| `/blog/[slug]` | (per-post, ≤ 60) | (per-post, 140–160) | (per-post 1200×630) | absolute | yes | `index, follow` | Pass |
| `/account` | ... | ... | — | self | n/a | `noindex, follow` | Pass (noindex by policy) |
| `/search` | ... | ... | — | self | n/a | `noindex, follow` | Pass (noindex by policy) |
| `«ADMIN_PATH»/**` | (excluded) | — | — | — | — | `noindex, nofollow` | Excluded |
| ... | ... | ... | ... | ... | ... | ... | ... |

Per-route checks performed:
- title uniqueness across the table;
- description uniqueness across the table;
- canonical is absolute, points at a 200 URL;
- hreflang reciprocal across `«LOCALES»` (verified by crawl);
- OG image exists at the declared URL, returns 200, is 1200×630;
- robots decision is explicit (not implicit from the framework default).

---

## 2. Structured-data coverage

Tool: `«STRUCTURED_DATA_VALIDATOR»`.

| Route type | Required schema(s) | Implemented | Sourced from data layer | Validator errors |
|---|---|---|---|---|
| Homepage | `Organization` + `WebSite` | yes | yes | 0 |
| Article (`/blog/[slug]`) | `Article` | yes | yes (CMS) | 0 |
| Product (`/product/[id]`) | `Product` + (real) `aggregateRating` | yes | yes (DB) | 0 |
| Profile (`/u/[handle]`) | `Person` or `ProfilePage` | yes | yes (DB) | 0 |
| FAQ page | `FAQPage` | yes (only where Q+A is real) | yes (CMS) | 0 |
| Breadcrumbs | `BreadcrumbList` | yes (every nested route) | yes (route layer) | 0 |
| ... | ... | ... | ... | ... |

Verify:
- JSON-LD reads from the same data layer the page renders from — no hardcoded duplicates;
- only one schema graph per page;
- `aggregateRating` is sourced from real reviews;
- `datePublished` / `dateModified` match CMS, not build time;
- `image` URLs are absolute + reachable.

---

## 3. Robots + sitemap state

| Environment | `«ROBOTS_PATH»` posture | `«SITEMAP_PATH»` state | Notes |
|---|---|---|---|
| Production (`«DOMAIN»`) | allow all except `«ADMIN_PATH»`, internal APIs, search params | live, fresh `lastmod`, no preview URLs, no `noindex` URLs | submitted to Search Console + Bing |
| Preview / staging | `User-agent: *` + `Disallow: /` (or edge `X-Robots-Tag: noindex`) | absent or returns 404 | verified on a recent preview deploy |
| Localhost | n/a | n/a | — |

Verify:
- production robots + sitemap return 200 with expected content;
- preview blocks all crawlers (and the mechanism is verified — not just configured);
- sitemap entry count ≈ indexable route count (off by < 5%);
- sitemap `lastmod` reflects real route update times.

---

## 4. Search Console signals snapshot

Property: `«SEARCH_CONSOLE_PROPERTY»`
Date range: last 28 days.

| Query | Impressions | Clicks | CTR | Avg position |
|---|---|---|---|---|
| «query 1» | «N» | «N» | «%» | «pos» |
| «query 2» | ... | ... | ... | ... |
| ... | ... | ... | ... | ... |
| **Top 20 total** | «sum» | «sum» | «avg» | «avg» |

Coverage state:
- Valid: «N» URLs
- Excluded (with reason breakdown): «N» — top reasons: `Crawled - currently not indexed: N`, `Duplicate without user-selected canonical: N`, `Discovered - currently not indexed: N`
- Errors: «N» (if non-zero, list)

---

## 5. Thin-content list with `noindex` decisions

| Route pattern | Reason | Decision | Notes |
|---|---|---|---|
| `/search?q=...` | parameterized search, infinite-cardinality | `noindex, follow` | policy |
| `/tag/[tag]` (when items < 3) | thin | `noindex, follow` | template-level rule |
| `/thank-you/*` | post-conversion confirmation | `noindex, follow` | policy |
| `«ADMIN_PATH»/**` | internal | `noindex, nofollow` | policy |
| `/legal/draft-*` | drafts | `noindex, follow` | until published |
| ... | ... | ... | ... |

Reject pattern: `noindex` applied to legitimate content as "I'm not confident in this page yet" — either fix or delete.

---

## 6. Programmatic-SEO inventory

Skip this section if the repo doesn't run programmatic-SEO surfaces.

| Template | Pages live | Data source | Freshness rule | Quality bar met | Internal-linking hub |
|---|---|---|---|---|---|
| `/«directory»/[slug]` | 1,240 | DB table `«table»` | regenerate weekly; `noindex` if `lastUpdated > 90d` and no underlying data change | yes — unique title + 2 substantive sections | hub: `/«directory»` |
| `/«compare»/[a]-vs-[b]` | 320 | curated CSV | manual review per page | yes — editorial pass | hub: `/«compare»` |
| ... | ... | ... | ... | ... | ... |

Verify:
- each template has a unique-content rule (not just a templated header swap);
- each template has a freshness rule (auto-`noindex` for stale pages);
- internal linking is intentional (hub-and-cluster), not "every page links to every other";
- launch pace vs existing index: ≤ 10× existing indexed page count per release.

---

## 7. Remediation roadmap

Grade by **actual exposure** (see `QUALITY_ASSURANCE.md` §7). A homepage canonical bug is Critical; a `/blog/[slug]` OG image gap is Medium.

### Critical (must fix before release)

| # | Finding | Route | Owner | Due |
|---|---|---|---|---|
| 1 | Surprise `noindex` on top-traffic route | «route» | «owner» | «DATE» |
| 2 | Non-reciprocal hreflang across `«LOCALES»` | site-wide | «owner» | «DATE» |
| ... | ... | ... | ... | ... |

### High (current cycle)

| # | Finding | Route | Owner | Due |
|---|---|---|---|---|

### Medium (next release)

| # | Finding | Route | Owner | Due |
|---|---|---|---|---|

### Low (backlog)

| # | Finding | Route | Owner |
|---|---|---|---|

Each Critical/High finding MUST have a tracked issue (`audit` + `seo` + `priority:` labels).

---

## 8. Cross-references

- [`MANAGER_SEO.md`](./MANAGER_SEO.md) — the agent playbook that produces / verifies / audits this file.
- [`BRAND_VOICE_GUIDELINE.md`](./BRAND_VOICE_GUIDELINE.md) — title + meta-description voice rules (no overclaim, no urgency).
- [`FEATURE_SPEC.md`](./FEATURE_SPEC.md) — per-feature SEO acceptance criteria.
- [`ROADMAP.md`](./ROADMAP.md) — programmatic-SEO planning + pace.
- [`DESIGN_REVIEW.md`](./DESIGN_REVIEW.md) — page-level conversion (SEO traffic that lands + bounces is wasted).
- `«METADATA_API»` source files — the source of truth for per-route metadata.
- `«SEARCH_CONSOLE_PROPERTY»` — the live Search Console property the snapshot in §4 comes from.
