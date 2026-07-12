# North Star

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_NORTH_STAR` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_NORTH_STAR.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (why-we-exist → NSM → why-this-metric vs alternatives → how-to-measure → targets → success/failure/value signals → core belief), then replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product this north star governs
> - `«MISSION_THESIS»` — the one-paragraph reason the product exists / what it optimizes for
> - `«NORTH_STAR_METRIC»` — the single NSM and its precise definition
> - `«REJECTED_ALTERNATIVES»` — candidate metrics and why each was not chosen
> - `«MEASUREMENT_INPUTS»` — the component rates/events that compose the NSM (with event names)
> - `«LAUNCH_TARGETS»` — target values/thresholds for the NSM

## Why «PROJECT» Exists

(The one-paragraph mission thesis: the problem the product attacks, what it optimizes for instead of the default, and why that is solvable.)

«MISSION_THESIS» — state the dominant alternative behavior, the dimension your product optimizes for instead, and the premise that makes it worth doing.

## North Star Metric

**«NORTH_STAR_METRIC»** (the single sentence defining the one metric that captures delivered value).

(Explain in one paragraph how this single metric captures the full value chain — what each part of the definition proves about the user's experience.)

### Why This Metric

(For each plausible alternative metric, state why it was rejected — vanity, too narrow, gameable, lagging, etc.)

| Alternative        | Why Not                                       |
| ------------------ | --------------------------------------------- |
| «ALT_METRIC»       | «why it was not chosen»                        |

(one row per rejected candidate metric)

### How to Measure

(events or query-derived — adapt to your analytics model)

(The component rates/events that compose the NSM, with the exact event names and denominators.)

1. **«COMPONENT_RATE»** — `«event_name»` / «denominator»
2. **«COMPONENT_RATE»** — «definition with event name»
3. **Combined:** «the north-star count, expressed as the intersection of the components»

(one step per measurement input)

### «MILESTONE» Launch Targets

(Concrete target values for the NSM and its inputs at defined time horizons.)

| Metric        | «HORIZON_1» Target | «HORIZON_2» Target |
| ------------- | ------------------ | ------------------ |
| «METRIC»      | «TARGET»           | «TARGET»           |

(one row per metric feeding the NSM; columns are your chosen time horizons, e.g. 30-day / 90-day)

## What Success Looks Like

(Qualitative behaviors that prove the NSM is being moved for the right reasons.)

- «SUCCESS_SIGNAL»

(one bullet per qualitative success signal)

## What Failure Looks Like

(The failure modes — the behaviors that mean the metric is flat or being gamed.)

- «FAILURE_SIGNAL»

(one bullet per qualitative failure signal)

## Signals of Real Value

(Leading indicators that users get genuine, unprompted value.)

1. **«VALUE_SIGNAL»** — «what the behavior demonstrates»

(one numbered bullet per real-value signal)

## Core Belief

(The foundational assumption about your users that justifies the whole product. One short paragraph.)

«CORE_BELIEF» — the truth about user motivation and the gap your product fills.
