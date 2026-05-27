# Decision thresholds — pre-committed before first user

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_DECISION_THRESHOLDS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/DECISION_THRESHOLDS.md`, **fill the bands BEFORE first user lands**, and commit. Bands set after data lands are confirmation bias.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the band STRUCTURE (kill / iterate / expand) and the **gate patterns** (`any 2 of` for kill, `all of` for expand) — those are load-bearing. Replace every «placeholder» with your product's facts.
>
> **Pairs with:** `RUNBOOK_DAILY_RITUAL.md` / `RUNBOOK_WEEKLY_RETRO.md` (where bands get checked), `RUNBOOK_FOUNDER_DASHBOARD.md` (where signal values are read), `METRICS.md` (KPI definitions — never redefined here), `MANAGER_FOUNDER_OPS.md` (the cadence this lives inside), `DECISION_LOG.md` (ADR target when a band genuinely needs to move).
>
> **Local definitions to provide per repo** (replace inline or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product whose thresholds these are
> - `«TRIGGER_COHORT_N»` — the activated-user count at which bands re-open (e.g. 50)
> - `«PMF_TARGET»` — the primary PMF signal (e.g. Sean Ellis "very disappointed" %)
> - `«KILL_BAND»` — the kill-side value for each signal (e.g. `< 25%` of N ≥ 30)
> - `«ITERATE_BAND»` — the middle band (between kill and expand)
> - `«EXPAND_BAND»` — the expand-side value for each signal (e.g. `≥ 40%` of N ≥ 30)
> - `«HYPOTHESES»` — the 3–5 pre-launch bets the product encodes
> - `«MUST_HAVE_ANSWER»` — the answer you expect when a user is asked what value they get

> **Why this exists:** the most common PMF-read failure isn't bad data — it's the founder reading the data they wanted to see instead of the data they actually got. This doc pre-commits thresholds + hypotheses **BEFORE** first user lands. Future-us reads this list at the «TRIGGER_COHORT_N»-user mark and is forced to face whichever bet failed.
>
> **Rule:** numbers below are reviewed at the «TRIGGER_COHORT_N»-activated-user mark, not before. Re-opening this doc earlier is itself a signal that confirmation bias is winning.

---

## 1. Kill threshold — when do we walk away?

If **any two** of these fire after «TRIGGER_COHORT_N» activated users (definition lives in `METRICS.md`), the verdict is **kill** — not iterate, not pivot. Document the lessons in `DECISION_LOG.md` and move on.

| Signal                       | Source of truth                                            | `«KILL_BAND»` threshold |
| ---------------------------- | ---------------------------------------------------------- | ----------------------- |
| `«PMF_TARGET»`               | In-app / email survey                                      | **«KILL_BAND»** (e.g. `< 25%` of N ≥ 30) |
| Free → Paid conversion       | `«PAYMENTS_PROVIDER_URL»` / subscription-created events    | **«KILL_BAND»** (e.g. `< 1%` of activated by week 4) |
| Organic share / referral     | `«ANALYTICS_URL»` — share event ÷ activated users          | **«KILL_BAND»** (e.g. `< 5%` by week 4) |
| Re-engagement email CTR      | `«EMAIL_PROVIDER_URL»` → stage-1/2/3 opens                 | **«KILL_BAND»** (e.g. `< 5%` sustained) |
| Median time-to-first-value   | `«ANALYTICS_URL»` — first-value event minus signup time    | **«KILL_BAND»** (e.g. `> 30 minutes`) |

> _FOUNDER TO CONFIRM each row — these are framework defaults. Override if the bet is different from what's assumed._

---

## 2. Expand threshold — when do we double down?

If **all five** fire by the trigger window, the verdict is **expand** — open paid acquisition, schedule the funding/narrative push, start hiring conversations. Partial fire = stay in iterate.

| Signal                       | `«EXPAND_BAND»` threshold |
| ---------------------------- | ------------------------- |
| `«PMF_TARGET»`               | **«EXPAND_BAND»** (e.g. `≥ 40%` of N ≥ 30) |
| Paid customers               | **«EXPAND_BAND»** (e.g. `≥ 10` by week 4, paid only) |
| Week-4 retention             | **«EXPAND_BAND»** (e.g. `≥ 30%` of week-1 cohort active in week 4) |
| Median time-to-first-value   | **«EXPAND_BAND»** (e.g. `< 10 minutes`) |
| Organic share / referral     | **«EXPAND_BAND»** (e.g. `≥ 15%` of activated by week 4) |

> _FOUNDER TO CONFIRM. The "≥ N paid by week 4" is the floor that justifies expand; override if the bar should be different for this product._

---

## 3. Iterate band — the middle case

Anything between `«KILL_BAND»` and `«EXPAND_BAND»` is **`«ITERATE_BAND»`** — the verdict is **change ONE thing** next week (matches the Weekly Retro's "What I'm changing next week"). Re-read at the next trigger cohort.

- If the primary `«PMF_TARGET»` lands in the middle band → segment the cohort, fix the top friction, re-survey at the next cohort window.
- If conversion lands in the middle band → likely pricing or paid-feature discoverability; ONE pricing experiment, not five.
- If retention lands in the middle band → likely a second-visit value gap; one targeted re-engagement experiment.

Hard rule: iterate means **ONE change**. The constraint is the point.

---

## 4. Pre-launch hypotheses

These are things we **assume** are true. Each maps to a tracked event (see `METRICS.md`) so the post-«TRIGGER_COHORT_N»-users read can prove or disprove them mechanically.

| #      | Hypothesis (`«HYPOTHESES»`)                                                                 | What proves it false                                                                                |
| ------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **H1** | «hypothesis about the core viral / share loop»                                              | «the event-level signal that refutes it»                                                            |
| **H2** | «hypothesis about the secondary distribution channel»                                       | «the event-level signal that refutes it»                                                            |
| **H3** | «hypothesis about the upgrade trigger»                                                      | «the event-level signal that refutes it»                                                            |
| **H4** | «hypothesis about who the paying ICP actually is»                                           | «the event-level signal that refutes it»                                                            |
| **H5** | «hypothesis about what users pay for vs what we think they pay for»                         | «the event-level signal that refutes it»                                                            |

> _FOUNDER TO CONFIRM: are these your actual bets, or are you betting on something different? If the latter, write the real list — these are the framework defaults inferred from the product surface._

---

## 5. The "must-have feature" answer we're hoping for

When the day-7 follow-up email asks **"what's the main benefit you get from `«PROJECT»`?"**, we expect convergence on:

> «MUST_HAVE_ANSWER» — the one-sentence value statement the founder *expects* to hear.

> _FOUNDER TO PICK ONE_ primary expected answer. Alternates become "secondary indicators." If real users converge on a **third answer entirely** (e.g. an unexpected use-case that wasn't even in the product brief), THAT is the most important PMF signal this milestone — pivot toward whatever they actually said.

---

## Workflow

- **Re-open this doc only at the «TRIGGER_COHORT_N»-activated-users mark.** Earlier reads are confirmation bias. (Exception: if the data is so far below `«KILL_BAND»` that «TRIGGER_COHORT_N» isn't reachable, file an emergency review.)
- **Each threshold above is wired to a real event** that's tracked per `METRICS.md`. No new instrumentation needed — manual `«ANALYTICS_URL»` + `«PAYMENTS_PROVIDER_URL»` + `«EMAIL_PROVIDER_URL»` dashboard reads at the trigger cohort.
- **Moving a band after data lands** requires an ADR in `DECISION_LOG.md` with the rationale. Silent goalpost moves are forbidden.
- **Output:** at the «TRIGGER_COHORT_N»-user mark, fill in the actual numbers next to each threshold above, decide kill / iterate / expand, and commit the result.

## Out of scope

- Building automation to track the thresholds (manual dashboard reads at < 100 users is fine)
- Choosing exact numbers above the founder's commitment level (framework defaults; founder overrides)
- Acting on partial data before the «TRIGGER_COHORT_N»-user mark
