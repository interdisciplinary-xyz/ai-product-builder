# Weekly retro — template

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_WEEKLY_RETRO` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_WEEKLY_RETRO.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`. **Each Friday**, copy *that* file to `docs/retros/«DATE».md`, fill it in, commit.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the five-section STRUCTURE (Numbers → Learned → Changing → Decision-thresholds → Anti-patterns), then replace every «placeholder» with your product's facts.
>
> **Pairs with:** `RUNBOOK_DAILY_RITUAL.md` (the daily input this aggregates), `RUNBOOK_DECISION_THRESHOLDS.md` (the pre-committed bands this retro checks against), `RUNBOOK_FOUNDER_DASHBOARD.md` (where the Numbers section reads from), `MANAGER_FOUNDER_OPS.md` (the cadence this is a leg of).
>
> **Local definitions to provide per repo** (replace inline or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product this retro covers
> - `«ANALYTICS_URL»` / `«PAYMENTS_PROVIDER_URL»` / `«OBSERVABILITY_URL»` / `«EMAIL_PROVIDER_URL»` — where the Numbers come from
> - `«METRIC_DEFINITIONS»` — KPI definitions live in `METRICS.md`; this template references them, never redefines
> - `«ACTIVATION_DEFINITION»` — the single activation event for this product (defined once in `METRICS.md`)
> - `«TRIGGER_COHORT_N»` — the cohort size at which `DECISION_THRESHOLDS.md` re-opens
> - `«HYPOTHESES»` — the pre-launch hypotheses tracked in `DECISION_THRESHOLDS.md`
> - `«AI_PROVIDER»` / `«PAYMENTS»` — variable-cost vendor names referenced in the Numbers section's cost line (typically **inherited** from `.claude/CLAUDE.md`)

> Copy this file each Friday → `docs/retros/«DATE».md` → fill it in → commit. **30 minutes max.** The point is to leave a record future-you can read in 6 weeks, not to write a thesis.
>
> Pair with the daily ritual at `docs/ai-product-builder/RUNBOOK_DAILY_RITUAL.md` (the vendored template in this repo's library mirror — works regardless of where the per-week retro file lives). The retro is the weekly aggregation of what daily already surfaced.

---

# Week of «DATE»

## The numbers

> Pull from: `«ANALYTICS_URL»` (acquisition + funnel), `«PAYMENTS_PROVIDER_URL»` (subscriptions), `«OBSERVABILITY_URL»` (errors last 7 days), `«EMAIL_PROVIDER_URL»` (emails sent / opened). KPI definitions in `METRICS.md` — do not redefine here.

- Signups this week: **___** (cumulative: **___**)
- Activated this week: **___** (rate: **___**%)
  - _Activated_ = «ACTIVATION_DEFINITION» (defined in `METRICS.md`)
- Day-1 retention of last week's cohort: ___%
- Day-7 retention of two-weeks-ago cohort: ___%
- Paid conversions this week: **___** (tier mix: «list per tier»)
- Errors this week: **___** new (resolved: **___**, still open: ___)
- Variable cost this week: ~**___** (e.g. AI tokens, third-party API spend — `«AI_PROVIDER»` / `«PAYMENTS»` fees)

## What I learned this week

- **Verbatim quote from a user:**

  > _Paste a real sentence — chat message, email reply, support thread, interview transcript. No paraphrasing. If no user said anything memorable, write that fact down — it's also a signal._

- **Most surprising data point:**

  > _The number you didn't expect, in either direction. "Activation rate is 60% not the 30% I planned for" or "Nobody used feature X this week." Surprise is the cheapest learning signal you have._

- **One thing that's clearly broken:**
  > _The bug or UX gap that's costing the most. If you can't name one, you weren't paying attention._

## What I'm changing next week

> **ONE thing only.** The constraint is the point. If you can't pick one, you don't have enough signal yet — go talk to a user.

-

## Decision-thresholds check

> Cross-reference `DECISION_THRESHOLDS.md`. At the «TRIGGER_COHORT_N»-activated-user mark, fill in the actual numbers next to each threshold there. Before that mark, this section is "n/a — pre-trigger-cohort".

- Primary PMF signal (e.g. Sean Ellis "very disappointed" rate): **___**% of N=**___**
- Free → Paid conversion: ___% of activated
- Organic share / referral rate: ___%
- Median time-to-first-value: ___ minutes
- Hypotheses status: «HYPOTHESES» — H1 [confirmed/refuted/inconclusive], H2 [...], H3 [...], H4 [...], H5 [...]

## Anti-patterns to catch myself doing

If any of these happen, write a one-liner:

- [ ] Did I move the goalposts on a threshold without filing an ADR in `DECISION_LOG.md`?
- [ ] Did I ship a feature this week that wasn't in the active milestone's scope?
- [ ] Did I avoid an uncomfortable user conversation?
- [ ] Did I skip the daily ritual any day this week? (2 in a row = losing the loop)
- [ ] Did I batch user replies to Friday instead of replying same-day?

---

_End of retro. Commit with message:_ `docs(retro): week of «DATE»`.
