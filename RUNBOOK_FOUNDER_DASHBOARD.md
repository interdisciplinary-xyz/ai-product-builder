# Founder Dashboard — single-screen business health

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_FOUNDER_DASHBOARD` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/FOUNDER_DASHBOARD.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the **row STRUCTURE** (`metric → surface → look for → action threshold`) and the **four sections** (acquisition / activation / retention / revenue), then replace every «placeholder» with your product's actual surfaces. KPI **definitions** are deferred to `METRICS.md` — this doc renders values and action thresholds, it does not redefine what each metric means.
>
> **Pairs with:** `RUNBOOK_DAILY_RITUAL.md` (the daily walk that uses this doc), `RUNBOOK_WEEKLY_RETRO.md` (the Monday review), `RUNBOOK_DECISION_THRESHOLDS.md` (kill / iterate / expand bands), `METRICS.md` (KPI definitions), `MANAGER_FOUNDER_OPS.md` (the cadence this is the dashboard layer of).
>
> **Local definitions to provide per repo** (replace inline or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product this dashboard surfaces
> - `«ANALYTICS_URL»` — product analytics dashboard (e.g. GA4, PostHog, Plausible)
> - `«PAYMENTS_PROVIDER_URL»` — payments dashboard (e.g. Stripe → Home)
> - `«OBSERVABILITY_URL»` — error / telemetry dashboard
> - `«EMAIL_PROVIDER_URL»` — transactional email dashboard
> - `«AI_PROVIDER_URL»` — AI provider usage page (if applicable)
> - `«HEALTH_ENDPOINT»` — health-check route on `«DOMAIN»` (e.g. `/api/health`)
> - `«ADMIN_PATH»` — admin surface (e.g. `/admin`) once Option B graduates
> - `«EVENT_NAME»` — the core conversion events (defined in `METRICS.md`)
> - `«ACTIVATION_DEFINITION»` — single source in `METRICS.md`
> - `«TRIGGER_COHORT_N»` — cohort size at which `DECISION_THRESHOLDS.md` re-opens (e.g. 50)

## How to use this doc

This is your morning bookmark bar. Open it, walk the sections top-to-bottom (~3 minutes), and you have a single read of every metric the discovery loop needs.

Each row is **(metric → where to look → what to look for → action threshold)**.

KPI **definitions** live in `METRICS.md`. This doc renders values + action thresholds; it does not redefine what each metric means. If a target here disagrees with `METRICS.md`, `METRICS.md` wins.

Graduate-to-Option B trigger: cohort > «TRIGGER_COHORT_N» active users OR daily review time exceeds 10 min → build an internal `«ADMIN_PATH»/dashboard` page aggregating these views via server-side data fetching, owned by the next milestone.

---

## Acquisition — daily, ~30s

| Metric              | Surface                                                          | Look for                                                      | Action threshold                                                          |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Signups today       | `«ANALYTICS_URL»` → Realtime → Events → signup `«EVENT_NAME»`    | At least 1 new event / day during outreach window             | 0 signups across 3 consecutive days → reach out to next batch of targets  |
| Source distribution | `«ANALYTICS_URL»` → Acquisition → Traffic acquisition            | Direct vs Referral vs Organic Search ratio                    | If 100% Direct, outreach attribution is broken (likely missing UTM tags)  |
| Referrer top 5      | `«ANALYTICS_URL»` → Acquisition → Source/medium                  | Expected outreach channels should appear                      | Missing expected channel = UTM bug or outreach hasn't shipped             |

---

## Activation — daily, ~30s

The activation event fires per `«ACTIVATION_DEFINITION»` (defined in `METRICS.md` — never redefined here).

| Metric                    | Surface                                                                | Look for                                                | Action threshold                                                                                     |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Activations today         | `«ANALYTICS_URL»` → Realtime → Events → activation `«EVENT_NAME»`      | Should fire shortly after each completing signup        | If activation/signup ratio drops below 0.4, friction in the activation path                          |
| Time to activation        | `«ANALYTICS_URL»` → Engagement → Events → activation timing            | Median should be <24h                                   | >48h median = first-session value is unclear; investigate via session replay                         |
| Activation rate (last 7d) | `«ANALYTICS_URL»` → custom report: signups vs activated                | 40%+ baseline; 60%+ healthy                             | Below 30% sustained = product friction; reach out to 3 non-activated users                           |

---

## Retention — weekly cohort

| Metric            | Surface                                            | Look for                        | Action threshold                                            |
| ----------------- | -------------------------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| DAU               | `«ANALYTICS_URL»` → Reports → User → 1-day active  | Trending up week-over-week      | Flat or declining 3 weeks → engagement loop missing         |
| WAU               | Same, 7-day filter                                 | ~3-5× DAU for return-cadence products | If DAU=WAU, users come once and don't return          |
| Stickiness (DAU/MAU) | `«ANALYTICS_URL»` → Free-form exploration       | 20%+ healthy; 30%+ habit-forming| <10% = one-shot tool, not a habit                           |
| Week-1 retention  | `«ANALYTICS_URL»` → User retention                 | 40%+ first cohort; 50%+ stretch | <30% = product value isn't sticking — this is the PMF signal |
| Week-4 retention  | Same                                               | 20%+ first cohort               | <15% = power-user loop missing                              |
| Week-12 retention | Same                                               | 10%+ stretch                    | Below this = churn is structural, not noise                 |

**Reading cohort tables:** the diagonal "leak" tells you when users drop. If everyone leaves between week-1 and week-2, the second-visit value isn't clear. If they leave between week-4 and week-8, the long-term hook is missing.

---

## Revenue — weekly, ~1min

| Metric                 | Surface                                                                 | Look for                           | Action threshold                                                                |
| ---------------------- | ----------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| MRR                    | `«PAYMENTS_PROVIDER_URL»` → Home                                        | First milestone $; trending up     | Plateau 3 months at low MRR = pricing or value-prop bug                         |
| MRR delta              | Same — top-of-page delta %                                              | Positive every week                | Two consecutive negative weeks = churn investigation                            |
| Free → Paid conversion | Manual count from `«PAYMENTS_PROVIDER_URL»` vs total signups            | 3-5% baseline SaaS                 | <1% = pricing too high or paid features under-discoverable                      |
| ARPU                   | `«PAYMENTS_PROVIDER_URL»` → Reports → Net revenue / customer count      | Stable or rising                   | Falling = downgrade trend; check tier mix                                       |
| Logo churn             | `«PAYMENTS_PROVIDER_URL»` → Customers → cancelled in last 30d           | <3% monthly for SaaS at this stage | >5% sustained = post-onboarding value gap                                       |
| Revenue churn          | `«PAYMENTS_PROVIDER_URL»` → Subscriptions → MRR movements               | Similar threshold to logo churn    | Revenue churn > logo churn = premium-tier customers leaving (worse signal)      |

---

## Product health — daily, ~30s

| Metric                 | Surface                                                          | Look for                           | Action threshold                                                           |
| ---------------------- | ---------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| Error rate             | `«OBSERVABILITY_URL»` → Issues → last 24h                        | <5 unresolved issues, no P1 spikes | New P1 (auth, payments, core-domain) = investigate same day                |
| Top issue              | Same view, sorted by event count                                 | Should be info-level / known       | Sudden change in #1 issue = regression                                     |
| AI cost / day          | `«AI_PROVIDER_URL»` → Usage (if applicable)                      | Within budget for current cohort   | >2× expected = check for runaway loops (likely a generator without limits) |
| Health endpoint uptime | `curl https://«DOMAIN»«HEALTH_ENDPOINT»` weekly                  | 200 + recent uptime                | Non-200 = `«DEPLOY»` / `«DB_CMS»` / `«AUTH»` down                          |

---

## PMF signal — weekly, ~2min

**The single most important table once the survey cron starts firing — bands defined in `DECISION_THRESHOLDS.md`:**

| Metric                     | Surface                                                                | Look for                                                   | Action threshold                                                            |
| -------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Survey responses count     | `«EMAIL_PROVIDER_URL»` inbox + manual tally of replies tagged for PMF  | Trending up as cohort grows                                | Below N by trigger date = sample size insufficient; extend collection       |
| Primary PMF signal %       | Manual tally from replies (e.g. "very disappointed" %)                 | Compare to `«KILL_BAND»` / `«ITERATE_BAND»` / `«EXPAND_BAND»` in `DECISION_THRESHOLDS.md` | This is the verdict — kill, iterate, or expand   |
| Open-ended quote stack     | Reply text — paste verbatim into a quotes file                         | Patterns emerging across 5+ users                          | Use to write the homepage hero + outreach copy                              |

---

## Owner + cadence

- **Owner**: Founder (you).
- **Cadence**: Acquisition + Activation + Product health daily. Retention + Revenue + PMF weekly (Monday morning).
- **Time budget**: ~5min daily, ~15min weekly Monday review.
- **Graduate-to-Option B trigger**: cohort > «TRIGGER_COHORT_N» active users OR daily review time exceeds 10min → build an internal `«ADMIN_PATH»/dashboard` page aggregating these views (server-side data fetch, behind admin role gate).

---

## Why this lives in docs/ and not the app

At pre-`«TRIGGER_COHORT_N»` scale, building a 5-tab internal dashboard that aggregates `«ANALYTICS_URL»` + `«PAYMENTS_PROVIDER_URL»` + `«OBSERVABILITY_URL»` + `«DB_CMS»` is ~3 days of work that ships zero customer value. The founder has 4 tabs already open every morning — adding "open `docs/FOUNDER_DASHBOARD.md`" is one more bookmark, not a workflow change.

When Option B ships:

- Server-side data fetch pulls `«ANALYTICS_URL»` reports
- `«PAYMENTS_PROVIDER_URL»` API enumerates active subs + MRR
- `«OBSERVABILITY_URL»` API surfaces top-3 unresolved issues
- All on `«ADMIN_PATH»/dashboard` behind admin role gate
- One screen, no tab-juggling

The doc here becomes the spec for what Option B must render.
