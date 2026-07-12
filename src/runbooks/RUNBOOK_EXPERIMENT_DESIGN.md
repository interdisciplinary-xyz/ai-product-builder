# Experiment «N» — «SHORT_TITLE»

**Date:** «DATE»
**Author:** «AUTHOR»
**Status:** Designed → Running → Decided («DECISION_DATE»)
**NSM tie:** «NORTH_STAR_METRIC» (must match NORTH_STAR.md)

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_EXPERIMENT_DESIGN` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical template — vendored at `docs/ai-product-builder/RUNBOOK_EXPERIMENT_DESIGN.md` (source of truth). Each experiment is a new instance: copy the vendored template to `docs/EXPERIMENTS/«N»-«slug».md` (one experiment per file) and fill. **One experiment = one hypothesis = one file.** Do not stack multiple variants of multiple bets in one experiment; if you have several, file several.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the EXPERIMENT SHAPE (hypothesis → variants → sample size + window → kill criteria → success criteria → guardrails → instrumentation → decision), then replace every «placeholder» with the experiment's facts.
>
> **Local definitions to provide per repo / per experiment** (fill inline):
> - `«N»` — the experiment number (monotonic; check the highest existing `docs/EXPERIMENTS/*` and add one)
> - `«SHORT_TITLE»` — 3–6 words; becomes the filename slug
> - `«HYPOTHESIS»` — the NSM-tied directional prediction (e.g. "Variant B will increase activation rate by ≥ 5 percentage points over control")
> - `«BASELINE_RATE»` — the current metric value for the control (e.g. activation rate today)
> - `«MDE»` — Minimum Detectable Effect; the smallest lift the team cares about (e.g. 5 percentage points absolute)
> - `«ALPHA»` — significance threshold (e.g. p ≤ 0.05)
> - `«EXPECTED_DAILY_N»` — daily cohort size entering the experiment
> - `«RUN_DAYS»` — planned experiment window in days
> - `«ALLOCATION_RATIO»` — traffic split (e.g. 50 / 50 or 90 / 10)
> - `«PRIMARY_METRIC»` — the single metric the decision rule reads
> - `«GUARDRAIL_METRICS»` — the metrics that must not tank (e.g. auth-completion, payment-success rate)
> - `«EVENT_NAMES»` — the analytics events used to compute the metric (cross-ref `OBSERVABILITY.md`)
>
> **Cross-refs:** `MANAGER_EXPERIMENT.md` (the playbook this template feeds), `RUNBOOK_METRICS.md` (KPI definitions — never redefined here), `RUNBOOK_NORTH_STAR.md` (the NSM this experiment is predicted to move), `RUNBOOK_OBSERVABILITY.md` (where the events are instrumented), `MANAGER_DECISION_LOG.md` — once decided, the outcome graduates into an ADR. **Don't duplicate**: this file owns the experiment design + raw result; the decision log owns the outcome rationale.

---

## Hypothesis

«HYPOTHESIS»

(What to write here: one sentence, NSM-tied, directional, with a size. "Variant B will increase `«PRIMARY_METRIC»` by ≥ `«MDE»` over the control within `«RUN_DAYS»` days." If you can't write the size, you can't run the experiment — go back to sketching.)

**Why this bet now.** «one paragraph: what changed (new feature shipped, copy rewrite, friction observed in user research), and why the team genuinely doesn't know which variant wins. If the team already knows the answer, the right move is ship-and-measure — defer to `MANAGER_EXPERIMENT`.»

**Predicted mechanism.** «one paragraph: the causal story. "Variant B reduces friction at step X because users currently abandon there at Y rate" — name the leading indicator that would tell you the mechanism is working, separate from the primary metric.»

---

## Variants

| Variant       | Description                                  | Traffic share         |
| ------------- | -------------------------------------------- | --------------------- |
| **A** (control) | «current behavior»                         | «share»               |
| **B** (treatment) | «proposed change»                        | «share»               |

(one row per variant; most experiments are 2-arm. If you need 3+ arms, the math gets harder — defer to the manager for a pre-launch sanity check.)

**Allocation:** `«ALLOCATION_RATIO»` (e.g. 50 / 50 — equal allocation gives the fastest read; 90 / 10 is appropriate when the treatment carries asymmetric risk).

**Randomization unit:** «user / session / org — the unit that gets bucketed. A user-level randomization is the default; session-level introduces cross-contamination if users see both variants on different visits.»

**Eligibility:** «who enters the experiment — e.g. all activated users, all new signups, users in `«LOCALES»` only. Cross-ref `ACTIVATION_EVENT.md` if the experiment runs on the activated cohort.»

---

## Sample size + run window

**Inputs:**
- Baseline rate: `«BASELINE_RATE»` (current value of `«PRIMARY_METRIC»` for the control population)
- Minimum Detectable Effect: `«MDE»` (smallest lift the team cares about)
- Significance: `«ALPHA»` (e.g. p ≤ 0.05)
- Power: «1 − β» (e.g. 0.80 — standard)

**Math:**

For a baseline `p` and an MDE expressed as an absolute lift, a rough rule of thumb is:

```
required n per arm ≈ 16 × p × (1 − p) / MDE²
```

(Use a proper power calculator if available — this is the back-of-envelope sanity check.)

**Required n per arm:** «N»
**Total required cohort:** «2 × N»

**Run window:**

| Cell                                   | Value                                       |
| -------------------------------------- | ------------------------------------------- |
| Expected daily cohort `«EXPECTED_DAILY_N»` | «N / day»                                  |
| Planned window `«RUN_DAYS»`            | «N days»                                    |
| Projected total cohort                 | «EXPECTED_DAILY_N × RUN_DAYS»               |
| Vs. required                           | «≥ required → ship-able / < required → SAMPLE-SIZE THEATRE — go back to the manager» |

**Hard rule.** If projected cohort < required cohort, this experiment is **sample-size theatre**. Either: (a) extend the window (math first); (b) raise the MDE to a size the team actually cares about; (c) cancel and ship-and-measure. Do **not** launch a sample-size-theatre experiment.

**Cross-contamination check:** does the experiment touch a surface that the user could see across multiple sessions / devices / locales without re-bucketing? If yes, randomize at the user level and persist the bucket assignment.

---

## Kill criteria (pre-launch — written before start date)

If **any** of these fire, the experiment is killed within `«KILL_RESPONSE_TIME»` (e.g. 4 hours), regardless of how the primary metric looks. This list is **frozen** before the start date — no mid-flight edits.

- **Guardrail violation:** «GUARDRAIL_METRIC_A» drops by ≥ «X»% in the treatment arm. (Most common: auth-completion, payment-success, page-load-error rate.)
- **Severe primary degradation:** the treatment arm performs **worse** than control by ≥ «Y»% on `«PRIMARY_METRIC»` — even if not yet statistically significant. (Don't burn users on a clearly-worse variant.)
- **Implementation bug surfaces:** any error rate in the treatment arm exceeds «Z»% (e.g. JS errors, 500s, broken images on the treatment-only surface).
- **External event invalidates the read:** major marketing campaign, viral moment, vendor outage, holiday cohort skew. Pause; don't pretend the data is still clean.

(one bullet per kill criterion; minimum two — at least one guardrail + at least one primary-metric floor)

**Hard rule.** Kill criteria are committed **before** any data lands. A kill criterion added after the experiment is running is not a kill criterion — it's a rationalization.

---

## Success criteria

Ship **B** if:
- `«PRIMARY_METRIC»` delta ≥ `«MDE»` AND
- statistical significance p ≤ `«ALPHA»` AND
- no guardrail metric tanked.

Otherwise the decision defaults to **Ship A** (keep control) — see DECISION AT END.

(Success criteria are the **positive** version of the kill criteria. They never override the kill criteria — a treatment that "won" on the primary but tanked a guardrail is still killed.)

---

## Guardrail metrics

The metrics that must NOT tank in the treatment arm. Read alongside `«PRIMARY_METRIC»` on every check-in.

| Guardrail metric        | Tolerance (max degradation) | Kill threshold |
| ----------------------- | --------------------------- | -------------- |
| «GUARDRAIL_METRIC_A»    | «e.g. ≤ 1pp drop»           | «> 3pp drop»   |
| «GUARDRAIL_METRIC_B»    | «e.g. ≤ 2pp drop»           | «> 5pp drop»   |

(one row per guardrail metric — at minimum: auth-completion, primary-funnel-completion-elsewhere, error rate. Add payment-success only if the experiment is safely far from payments per `MANAGER_EXPERIMENT`'s guardrails.)

If the experiment is anywhere near `«PAYMENTS»` or `«AUTH»` flows — **stop**. Defer to `MANAGER_EXPERIMENT` GUARDRAILS section; this experiment likely shouldn't run.

---

## Instrumentation

The analytics events used to compute the primary and guardrail metrics. Cross-ref [`OBSERVABILITY.md`](./OBSERVABILITY.md) for the event-naming convention and where the events fire.

| Event name              | What it proves                            | Read by                                  |
| ----------------------- | ----------------------------------------- | ---------------------------------------- |
| `«EVENT_NAME_A»`        | «what user action it represents»          | «PRIMARY_METRIC» / «GUARDRAIL_METRIC»    |

(one row per event used by the experiment — keep the events small in number; a 12-event experiment is usually 3 experiments smashed together)

**Bucket tagging.** Every event MUST carry the experiment ID and the variant assignment:
```
{ experiment: '«N»-«slug»', variant: 'A' | 'B', ...payload }
```

Without bucket tagging, the analytics query can't separate the arms — the experiment is unread-able. The manager flags any experiment whose events don't carry these fields.

**Sanity-check query (run on day 1):**
- Confirm both arms are receiving traffic in roughly the expected ratio (within 5% of `«ALLOCATION_RATIO»`).
- Confirm the bucket assignment is persistent per user (a user shouldn't switch arms between sessions).
- Confirm `«PRIMARY_METRIC»` is computable from `«EVENT_NAMES»` (a query that returns zero is a broken pipe, not a successful experiment).

---

## Decision at end

The decision rule is **mechanical** — read the deltas, apply the matching row, ship the action. Committed pre-launch. No "let's discuss."

| Outcome                                                                       | Action                  |
| ----------------------------------------------------------------------------- | ----------------------- |
| B beat A: delta ≥ `«MDE»`, p ≤ `«ALPHA»`, no guardrail tanked                 | **Ship B**              |
| B underperformed or didn't move the metric                                    | **Ship A** (kill B)     |
| Either arm tanked a guardrail                                                 | **Kill both** — roll back |
| Inconclusive — neither variant crossed the threshold, all guardrails healthy  | **Extend once** OR kill |

**Extend rule.** Up to **one** extension of `«RUN_DAYS»`. Two extensions means the experiment was sized wrong from the start — kill it; restart with a properly-sized cohort if the bet still matters.

**Decided:** «DECISION_DATE» — «filled at decision time»
**Decision:** «Ship A / Ship B / Kill / Extend» — «filled at decision time»
**Result deltas:** «filled at decision time — primary metric, guardrail metrics, p-value if computed»
**ADR link:** «DECISION_LOG.md#decision-N — filled at decision time»

---

## Related

- **Files / paths affected by the variants:** «list of paths the build touches»
- **`MANAGER_EXPERIMENT` audit row:** the entry in `docs/EXPERIMENTS/INDEX.md` linking this experiment file to its ADR
- **Decision log entry:** once decided, link the resulting `DECISION_LOG.md` entry here — this experiment file IS the raw design + result; the ADR is the outcome rationale
- **Related experiments:** «numbers of any prior or follow-on experiments»
- **Issue / PR:** «issue number, PR link for the variant implementation»
