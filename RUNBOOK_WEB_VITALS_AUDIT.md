# WEB_VITALS_AUDIT.md — Core Web Vitals + bundle audit record

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_WEB_VITALS_AUDIT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/WEB_VITALS_AUDIT.md` and localize the items below.
>
> **Reusability:** template-ready — the audit structure (inventory → lab → bundle → offenders → roadmap → RUM cross-ref) is generic across CWV programs; the stack-specific bits (analyzer command, lighthouse runner, RUM vendor) are `«placeholders»`.
>
> **Pairs with:** `MANAGER_PERFORMANCE.md` (the agent playbook that produces this file), `OBSERVABILITY.md` (RUM signal — primary verdict), `QUALITY_ASSURANCE.md` §6 (build + bundle gate), `GITHUB_ACTIONS.md` (CI cadence — lighthouse runs off the PR path), `RELEASE_MANAGER.md` (manual + nightly perf cadence), `DESIGN_SYSTEM.md` (perf primitives: image, font, lazy).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product being audited.
> - `«DOMAIN»` — the primary user-facing domain.
> - `«LCP_TARGET»` — Largest Contentful Paint p75 budget (e.g. ≤ 2.5s mobile).
> - `«INP_TARGET»` — Interaction to Next Paint p75 budget (e.g. ≤ 200ms).
> - `«CLS_TARGET»` — Cumulative Layout Shift p75 budget (e.g. ≤ 0.1).
> - `«BUNDLE_BUDGET»` — shared first-load JS ceiling (e.g. 350 KB).
> - `«BUNDLE_ANALYZER_CMD»` — bundle-analyzer command (e.g. `pnpm analyze`).
> - `«LIGHTHOUSE_CMD»` — lighthouse runner (e.g. `pnpm lighthouse` / `lhci autorun`).
> - `«RUM_DASHBOARD_URL»` — the live RUM dashboard URL (Vercel Analytics, PostHog, Datadog RUM, etc.).
> - `«RUM_VENDOR»` — the vendor providing field data.

> **Verdict (top of doc — must be dated within current release cycle):**
>
> | Field | Value |
> |---|---|
> | Audited build | «commit SHA» |
> | Audit date | «DATE» |
> | Auditor | «name / role» |
> | Verdict | «Pass / Pass with budget breach noted / Fail» |
> | Bundle vs `«BUNDLE_BUDGET»` | «N KB / Δ vs last audit» |

---

## 1. Page inventory + targets

| Route | Type | LCP target | INP target | CLS target | Priority |
|---|---|---|---|---|---|
| `/` | landing | `«LCP_TARGET»` | `«INP_TARGET»` | `«CLS_TARGET»` | Critical |
| `/pricing` | conversion | `«LCP_TARGET»` | `«INP_TARGET»` | `«CLS_TARGET»` | Critical |
| `/«core-flow»` | core product | `«LCP_TARGET»` | `«INP_TARGET»` | `«CLS_TARGET»` | Critical |
| `/checkout` | payment | `«LCP_TARGET»` | `«INP_TARGET»` | `«CLS_TARGET»` | Critical |
| `/blog/[slug]` | content | `«LCP_TARGET»` | `«INP_TARGET»` | `«CLS_TARGET»` | High |
| `/account` | authenticated | `«LCP_TARGET»` | `«INP_TARGET»` | `«CLS_TARGET»` | Medium |
| ... | ... | ... | ... | ... | ... |

Targets per metric (defaults — adjust per stage):
- **LCP** ≤ 2.5s (mobile p75) / ≤ 1.8s (desktop p75)
- **INP** ≤ 200ms p75
- **CLS** ≤ 0.1 p75

---

## 2. Lighthouse runs (mobile + desktop)

Tool: `«LIGHTHOUSE_CMD»` — run on the staging preview before promotion + nightly against production.

| Route | LCP mobile | LCP desktop | INP | CLS | TTFB | TBT | Pass? |
|---|---|---|---|---|---|---|---|
| `/` | 2.1s | 1.4s | 120ms | 0.04 | 180ms | 200ms | Pass |
| `/pricing` | 3.1s | 1.9s | 180ms | 0.02 | 210ms | 320ms | **Fail (LCP mobile)** |
| ... | ... | ... | ... | ... | ... | ... | ... |

Notes:
- record the **lab device** (e.g. Moto G Power, throttled 4G);
- record the **network** profile;
- runs are noisy — take the median of 3 runs per route.

---

## 3. Bundle-size table by route

Tool: `«BUNDLE_ANALYZER_CMD»` (from the production build).

| Route | First-load JS | Δ vs prev | vs `«BUNDLE_BUDGET»` | Notes |
|---|---|---|---|---|
| `/` | 280 KB | +4 KB | OK | — |
| `/pricing` | 312 KB | +18 KB | OK | new `react-confetti` — owner: «name» |
| `/«core-flow»` | 410 KB | +6 KB | **+60 KB over** | needs split — owner: «name» |
| ... | ... | ... | ... | ... |

Shared chunks:
- shared first-load JS: «N» KB vs `«BUNDLE_BUDGET»` («±Δ»)
- duplicated deps: «list any — `pnpm why <pkg>`»
- third-party scripts on every route: «count + total transfer»

---

## 4. Top-10 offenders

Ordered by impact on the worst-performing route in §2. Each offender gets an owner + a remediation step in §5.

| # | Offender | Route(s) | Metric hit | Recommended fix |
|---|---|---|---|---|
| 1 | `react-confetti` (180 KB synchronous import) | `/pricing` | bundle, TBT | dynamic import on click only |
| 2 | Self-hosted webfont — no preload | all | LCP, CLS | `next/font` + `display: swap` |
| 3 | Hero image: 1.8 MB, no `width`/`height` | `/` | LCP, CLS | move to DS `<Image>`; AVIF; explicit dims |
| 4 | Third-party chat widget loaded synchronously | all | TBT, INP | `strategy="lazyOnload"` + consent gate |
| 5 | Two semver ranges of `date-fns` | all | bundle | dedupe via lockfile |
| 6 | `lodash` full import in one component | `/«core-flow»` | bundle | `lodash/get` etc. |
| 7 | Locale fan-out (`«LOCALES»` × every page) | all | bundle | per-route locale chunking |
| 8 | Polyfills targeting IE11 | all | bundle | tighten `browserslist` |
| 9 | `useEffect` cascade in `<Dashboard>` | `/account` | INP | co-locate fetch in RSC |
| 10 | Source maps shipped to client | all | transfer | disable client source maps (see `OBSERVABILITY.md` appendix) |

(Replace with real findings per audit. The list is illustrative.)

---

## 5. Remediation roadmap

Grade by **actual exposure** (see `QUALITY_ASSURANCE.md` §7). A landing-page LCP regression is Critical; a `/account` INP regression is High.

### Critical (must fix before release)

| # | Finding | Route | Owner | Due |
|---|---|---|---|---|
| 1 | LCP mobile > 2.5s on `/pricing` | `/pricing` | «owner» | «DATE» |
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

Each Critical/High finding MUST have a tracked issue (`audit` + `perf` + `priority:` labels).

---

## 6. RUM cross-ref

Field data is the **primary** verdict — lab is the canary.

- Vendor: `«RUM_VENDOR»`
- Dashboard: `«RUM_DASHBOARD_URL»`
- Metrics emitted per route: LCP / INP / CLS / TTFB / FCP (p75)
- Lab vs field divergence per route:

| Route | Lab LCP | Field LCP p75 | Δ | Reason |
|---|---|---|---|---|
| `/` | 2.1s | 2.4s | +14% | tolerable variance |
| `/pricing` | 3.1s | 4.8s | +55% | **investigate — likely production-only third-party script** |
| ... | ... | ... | ... | ... |

If divergence > 20% on any metric, file a finding.

Alert thresholds + routing live in `OBSERVABILITY.md` (the analytics pipeline + tag taxonomy).

---

## 7. Cross-references

- [`MANAGER_PERFORMANCE.md`](./MANAGER_PERFORMANCE.md) — the agent playbook that produces / verifies / audits this file.
- [`OBSERVABILITY.md`](./OBSERVABILITY.md) — RUM data pipeline + alert routing (the runtime side of the perf verdict).
- [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md) §6 — build + bundle gate (the static side of the perf verdict).
- [`GITHUB_ACTIONS.md`](./GITHUB_ACTIONS.md) — CI cadence: bundle gate on every PR, lighthouse manual + nightly off the PR path.
- [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) — perf gate at the `release/* → «TRUNK»` promotion.
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — perf primitives (`<Image>`, `<Font>`, `<Lazy>` wrappers).
