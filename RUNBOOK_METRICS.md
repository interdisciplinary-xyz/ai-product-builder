# Metrics

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_METRICS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_METRICS.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (NSM → activation → daily value → retention → expansion → cost, each as a metric/definition/target/instrumented table), then replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product being measured
> - `«NORTH_STAR_METRIC»` — must match NORTH_STAR.md
> - `«METRIC_DEFINITIONS»` — per stage, the metrics, their formulas, and the events backing them
> - `«METRIC_TARGETS»` — the target/threshold for each KPI
> - `«EVENT_NAME»` — analytics event identifiers referenced in definitions
> - `«ANALYTICS_STACK»` — the instrumentation tools (e.g. product analytics, error monitoring, billing dashboard, CMS queries)

Key metrics for tracking product health and growth, organized by subscription lifecycle stage.

---

## North Star Metric

**«NORTH_STAR_METRIC»** (must match NORTH_STAR.md).

See [NORTH_STAR.md](./NORTH_STAR.md) for rationale and launch targets.

If these targets disagree with NORTH_STAR.md, NORTH_STAR wins.

---

## Activation

**"Did the user get value?"**

(Metrics proving a new user reached first value. Each row: metric, formula with event names, target, instrumentation.)

| Metric    | Definition                          | Target   | Instrumented      |
| --------- | ----------------------------------- | -------- | ----------------- |
| «METRIC»  | `«event_name»` / «denominator»      | «TARGET» | «analytics tool»  |

(one row per activation «metric»)

## Daily Value

**"Why do users come back?"**

(Metrics of recurring, in-the-loop usage.)

| Metric    | Definition                          | Target   | Instrumented      |
| --------- | ----------------------------------- | -------- | ----------------- |
| «METRIC»  | «definition with event name»        | «TARGET» | «analytics tool»  |

(one row per daily-value «metric»)

## Retention

**"Are users still here after 30 days?"**

(Cohort return and repeat-engagement metrics.)

| Metric    | Definition                          | Target   | Instrumented      |
| --------- | ----------------------------------- | -------- | ----------------- |
| «METRIC»  | «definition with event name»        | «TARGET» | «analytics tool»  |

(one row per retention «metric» — e.g. D7 return, D30 return, repeat-action rate)

## Expansion

**"Are users upgrading?"**

(Monetization-expansion metrics — conversions between tiers and seat growth.)

| Metric    | Definition                          | Target   | Instrumented      |
| --------- | ----------------------------------- | -------- | ----------------- |
| «METRIC»  | «definition with event name»        | «TARGET» | «analytics tool»  |

(one row per expansion «metric» — e.g. free→paid, paid→higher-tier, seats per account)

---

## Cost Metrics

(Per-user and per-call cost guardrails, each with an alert threshold.)

| Metric    | Definition                          | Alert threshold |
| --------- | ----------------------------------- | --------------- |
| «METRIC»  | «definition»                        | «THRESHOLD»     |

(one row per cost «metric» — e.g. variable cost per user, API calls per day, cache hit rate, storage growth)

---

## Current Instrumentation

(What's wired up today, what each tool tracks, and its status.)

| Tool      | What It Tracks                      | Status    |
| --------- | ----------------------------------- | --------- |
| «TOOL»    | «what it tracks»                    | «status»  |

(one row per tool in the «ANALYTICS_STACK» — product analytics, tag manager, error monitoring, billing dashboard, health endpoint, CMS queries)

### Instrumentation Gaps (MVP)

(Metrics not yet trackable — list the custom events still needed.)

1. **«EVENT_NAME»** — «what should fire it»

(one numbered bullet per missing event)
