# Business & Feature Value Plan

> **Last updated:** «DATE»
> **MVP Status:** «MVP_STATUS» (what's built, what's pending — e.g. "P1-P3 complete; one item pending: …")

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_BUSINESS_PLAN` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_BUSINESS_PLAN.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (price-promise → fee-loss table → billing decision → "what's worth paying for" → plan structure → unit economics → funnel), then replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product/company this plan covers
> - `«TARGET_PRICE_POINT»` — the headline price promise (e.g. up to $X/user/month)
> - `«CURRENCY»` — billing currency for all tables
> - `«PAYMENT_PROCESSOR_FEES»` — per-transaction fee model (e.g. $X fixed + Y% per charge) driving the loss-% table
> - `«BILLING_CYCLES»` — the cycle/price rows (monthly/quarterly/annual) and the chosen billing decision
> - `«VALUE_INFLECTION»` — the moment/feature that is actually monetizable (the core product thesis)
> - `«MVP_STATUS»` — current build state for the status blockquote
>
> Note: `«amount»`/`«n»` are fill-inline (vary per cell), not global-replace.

Target price point: **«TARGET_PRICE_POINT»** (the headline price promise, e.g. up to «amount»/user/month). This document defines what we build, what we charge for, and how we stay profitable at that price.

---

## The Hard Truth About «TARGET_PRICE_POINT»

(Explain why the headline price is hard to sustain — usually payment-processor fees eat a large share of small charges.)

The payment processor charges **«PAYMENT_PROCESSOR_FEES»** (fixed fee + % per transaction) per transaction. On a «amount» charge:

| Billing Cycle      | Charge      | Processor Fee | You Keep   | Loss % |
| ------------------ | ----------- | ------------- | ---------- | ------ |
| «CYCLE» («amount») | «CHARGE»    | «FEE»         | «NET»      | «LOSS%»|

(one row per «billing cycle» — e.g. monthly / quarterly / annual at the relevant prices)

**Decision: «BILLING_CYCLES»** — state the chosen billing cadence and price (what to write here: the cadence that keeps the price promise while minimizing fee loss, and why). Explain the trade-off (e.g. annual billing keeps the "under «TARGET_PRICE_POINT»" promise while cutting processing losses from «HIGH_LOSS%» to «LOW_LOSS%»; monthly billing at «amount» is/ isn't viable).

---

## What Is Actually Worth Paying For

(Identify the value inflection point — the moment a user gets enough value to pay. State what is free vs. what is monetizable, and why.)

«VALUE_INFLECTION» — describe the moment/feature where the user crosses from "nice to have" to "worth paying for." Everything before it is the acquisition/distribution funnel; this is the product.

| Layer            | What It Does                                | Monetizable?                  |
| ---------------- | ------------------------------------------- | ----------------------------- |
| «LAYER»          | «what this layer does for the user»         | «yes/no + why»                |

(one row per product «layer», ordered from acquisition → the monetizable inflection → future upsell; mark which layer is the actual paywall)

---

## Plan Structure

### Free Plan («STATUS»)

(What every user gets for free — the distribution engine. List the features that let users create and share value without paying.)

| Feature   | Included | Notes                          |
| --------- | -------- | ------------------------------ |
| «FEATURE» | Yes/No   | «scope/limit notes»            |

(one row per Free-tier «feature»)

**Why free?** (Explain the strategic reason the free tier exists — e.g. free users create shareable content that becomes the marketing/distribution channel for paid users.)

### «PAID_TIER_1» («TIER_PRICE»)

(The first paid tier. State the trigger/aha-moment that unlocks it.)

| Feature   | Included | Notes                          |
| --------- | -------- | ------------------------------ |
| «FEATURE» | Yes/No   | «scope/limit notes»            |

(one row per «feature» in this tier; start with "Everything in Free")

**Why this works:** (Explain the natural, high-intent conversion point — when and why a user hits this paywall.)

### «PAID_TIER_2» («TIER_PRICE» — target pricing)

(A higher tier, e.g. team/enterprise. Note which features are built vs. planned.)

| Feature   | Included        | Notes                          |
| --------- | --------------- | ------------------------------ |
| «FEATURE» | Yes/Planned     | «status: built / pending»      |

(one row per «feature» in this tier; start with "Everything in «PAID_TIER_1»")

**Status:** (Summarize what's built vs. pending for this tier.)

---

## Unit Economics at «TIER_PRICE»

### Cost Per User (One-Time)

(Costs incurred once per user — e.g. AI generation on signup, initial storage.)

| Cost Item     | Free User | Paid User | Notes                          |
| ------------- | --------- | --------- | ------------------------------ |
| «COST_ITEM»   | «amount»  | «amount»  | «what drives this cost»        |

(one row per one-time «cost item»; include a Total row)

### Cost Per User (Recurring Monthly)

(Costs that recur per active user per month — e.g. reads, on-demand generation, infra share.)

| Cost Item     | Free User | Paid User | Notes                          |
| ------------- | --------- | --------- | ------------------------------ |
| «COST_ITEM»   | «amount»  | «amount»  | «what drives this cost»        |

(one row per recurring «cost item»; include a Total row)

### Revenue Per Paid User

(Walk from gross payment down to net, subtracting processor fees and the per-user costs above.)

| Item                                | Amount   |
| ----------------------------------- | -------- |
| «REVENUE_OR_COST_LINE»              | «amount» |

(one row per line: gross payment, processor fee, one-time AI cost, recurring x12, then Net per user/year and Net per user/month)

### Break-Even Analysis

(How many paid users cover each fixed monthly cost, and the realistic combined break-even.)

| Monthly Fixed Cost  | Amount   | Paid Users Needed |
| ------------------- | -------- | ----------------- |
| «FIXED_COST_ITEM»   | «amount» | «n»               |

(one row per fixed-cost line; end with a "Realistic monthly burn" row and the implied break-even user count)

---

## «CORE_REVENUE_FEATURE»: The Core Revenue Feature

(Document the architecture of the single feature that drives revenue — the monetizable inflection from above. Cover how it's generated, cached, and kept cheap.)

### Architecture

(Describe the generation pipeline step by step — inputs, model/engine, multi-locale or multi-variant handling, caching.)

1. **«STEP»** — «what happens»
2. **«STEP»** — «what happens»

(one step per stage of the pipeline)

### Output Type (Actual Implementation)

(Paste the real output schema/type for this feature once implemented — this is product-specific; replace with your own.)

```
«OUTPUT_TYPE_SCHEMA» — the structured shape the core feature returns
```

### Cost Per «UNIT_OF_WORK»

(Cost breakdown for one generation, and for a cache hit.)

| Component         | Cost     | Notes                          |
| ----------------- | -------- | ------------------------------ |
| «COMPONENT»       | «amount» | «cache miss / cache hit / etc»|

(one row per cost component; include total-per-new and total-per-cached rows)

### Caching Strategy

(Describe the cache key, what invalidates it, and how cache coverage improves with scale.)

«CACHING_STRATEGY» — cache key, invalidation trigger (e.g. content hash), and expected hit rate at scale.

### Resilience

(List the failure-handling measures for the core feature — parsing fallbacks, retries, graceful degradation.)

- «RESILIENCE_MEASURE»

(one bullet per resilience measure)

---

## Implementation Priority

(Track build phases as checklists. Keep one section per priority phase; mark each task's status.)

### «PHASE» — «Phase Name»

| Task     | Status      |
| -------- | ----------- |
| «TASK»   | «✅ / ⏳»   |

(one row per task; repeat this subsection per priority phase)

---

## What We Explicitly Do NOT Build (Yet)

(Scope discipline — what's deliberately out of scope and why.)

| Feature       | Reason                         |
| ------------- | ------------------------------ |
| «FEATURE»     | «why it's deferred»            |

(one row per deferred «feature»)

---

## Conversion Funnel

(Map the path from first touch to paid conversion, with the conversion rate at each step.)

```
«ENTRY_STEP» (public)
    |
    v
«STEP» ──────────────────── «CONVERSION_RATE» of previous
    |
    v
«STEP» ──────────────────── «CONVERSION_RATE» of previous
    |
    v
Hits paywall → converts ──── «CONVERSION_RATE» of those who hit paywall
```

(one line per funnel step, from entry → activation → share/distribution → paywall → conversion)

### Revenue Projection

(Project revenue at increasing user-base sizes using the funnel rates above.)

| Users Registered | «MID_STEP» | «SHARE_STEP» | Paid Conversions | Annual Revenue |
| ---------------- | ---------- | ------------ | ---------------- | -------------- |
| «n»          | «n»    | «n»      | «n»          | «amount»       |

(one row per user-base scale, e.g. 100 / 1,000 / 10,000 / 100,000)

**Break-even (~«BREAK_EVEN_USERS» paid users) requires approximately «REGISTERED_USERS_NEEDED» registered users** based on funnel assumptions.

---

## Cost Control Strategy

(The levers that keep per-user cost low, when they apply, and their impact.)

| Strategy   | When     | Impact                | Status      |
| ---------- | -------- | --------------------- | ----------- |
| «STRATEGY» | «PHASE»  | «cost impact»         | «✅ / Planned»|

(one row per cost-control «strategy»)

---

## Metrics to Track

(The KPIs that confirm the model works. Keep in sync with METRICS.md and NORTH_STAR.md.)

| Metric     | Target      | Tool                  |
| ---------- | ----------- | --------------------- |
| «METRIC»   | «TARGET»    | «instrumentation»     |

(one row per «metric» — e.g. activation rate, share rate, free-to-paid conversion, churn, cost per paid user, LTV/CAC ratio)
