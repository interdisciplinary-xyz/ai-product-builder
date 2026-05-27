# Activation event definition

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_ACTIVATION_EVENT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/ACTIVATION_EVENT.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (decision header → activation event in pseudo-code → why-this-composite-signal table → schema + write site → read sites → edge cases → what this does NOT define → locked decisions), then replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product whose activation this defines
> - `«ACTIVATION_DEF»` — the precise composite definition (signals AND'd together)
> - `«ACTIVATION_FIELDS»` — the User/account fields the evaluator reads
> - `«ACTIVATION_EVALUATOR»` — path + function name of the pure decision function
> - `«ACTIVATION_HOOK»` — where the write happens (afterChange / trigger / webhook)
> - `«SURVEY_DELAY»` — how long after activation the Sean Ellis survey fires
> - `«PMF_REPORT_GATE»` — the PMF / funnel views that filter on activated cohort
> - `«ACTIVATION_DATE»` — when the criteria were locked, and by whom

> **Source of truth for when a user is considered "activated" — gates the Sean Ellis PMF survey trigger, the funnel-analytics conversion event, and the qualifying threshold for any "engaged user" count in `«PMF_REPORT_GATE»`.**

Decision locked: **«ACTIVATION_DATE»** by «DECIDERS», per the «MILESTONE» review. Implementation under «ISSUE_REF».

> _If this doc has been reconciled to describe shipped behavior (rather than a draft proposal), note that explicitly here — including the date and the trigger (e.g. a Copilot / reviewer caught drift between the doc and `«ACTIVATION_EVALUATOR»`)._

---

## The activation event

A user is **activated** the first moment all of the following hold:

```
«ACTIVATION_DEF»
  e.g.
  signal_1   (the user completed the core action)
  AND signal_2   (the value artefact exists / is non-empty)
  AND signal_3   (the user returned after the initial session)
```

In English: describe what each signal proves about the user's lived experience. The richest activation definitions combine (a) completion of the core action, (b) creation / receipt of the value artefact, and (c) a "came back" gate that rules out single-session curiosity.

The "came back" gate is usually the crucial one. It rules out:

- **Abandoners** who finished the core action but never returned.
- **Single-session curiosity** where the user completed the flow once and ghosted.
- **Pre-population** in scripts / fixtures / signup-time generation that happens inside the gate window.

State how the "came back" timestamp is bumped (e.g. an authenticated page-load throttled once per hour, a cron heartbeat, or a webhook from the integration). Note any legacy-data fallback.

---

## Why this composite signal

Walk through every alternative considered and why each was rejected. This table is the most important part of the doc — it prevents the team from "simplifying" the definition six months later and re-introducing the noise the composite was designed to filter out.

| Candidate | Why rejected (or chosen) |
| --------- | ------------------------ |
| `signed_up = true` | **Rejected.** Lowest bar. Fires the PMF survey on users who never saw the product. Garbage data. |
| `core_action_completed` (one signal) | **Rejected on its own.** A user who finished the action but never came back hasn't experienced the value — they did the work, never received the artefact. |
| `«EARLIER_DRAFT»` | **Discarded after implementation.** Required new fields that were never added; the composite below captures the same moment with fields that already existed plus a richer signal. |
| **«ACTIVATION_DEF»** | ✅ **Shipped.** Three independent signals, all already tracked. The gate guarantees the "came back" semantic without needing to instrument a specific page view. |

**PMF survey timing:** fires **«SURVEY_DELAY» after activation** (not after signup). The delay gives one re-engagement cycle of natural usage; long enough that the answer reflects _use_, short enough that the user still remembers the experience.

---

## Implementation

### Schema

A single timestamp field on the user record:

```ts
// «ACTIVATION_FIELDS» — e.g. User collection
activatedAt: { type: 'date', readOnly: true, indexed: true }
```

Co-resident fields used by the evaluator (all pre-existing):

- `«SIGNAL_1_FIELD»` — what the field stores and where it's set.
- `«SIGNAL_2_FIELD»` — same.
- `«SIGNAL_3_FIELD»` — the "came back" timestamp; how it's bumped.
- `«SIGNUP_METHOD_FIELD»` — captured at account creation; flows into the activation event payload for attribution.

### Pure decision function

`«ACTIVATION_EVALUATOR»` is the canonical decision logic. Pure (no `new Date()` inside; the caller injects `nowIso`), with unit tests covering: already-activated (idempotency), not-yet branches (each missing signal), activate-now branch, malformed-timestamp defensive behaviour, legacy fallback paths.

Returns one of:

```ts
{ kind: 'already-activated' }
| { kind: 'not-yet'; reason: «NOT_YET_REASONS» }
| { kind: 'activate-now'; daysFromSignup: number; method: «SIGNUP_METHODS» }
```

### Write site — the activation hook

Located at `«ACTIVATION_HOOK»`. On every relevant update:

1. Calls `«ACTIVATION_EVALUATOR»` with current record fields.
2. On `kind: 'activate-now'`: performs a **compare-and-swap** write — sets `activatedAt = now()` filtered by `{ activatedAt: { exists: false } | null }`. Concurrent updates can't both claim activation.
3. If the CAS write claimed (this hook is the one that flipped `null → timestamp`): fires the activation analytics event with `{ daysFromSignup, method }` to «ANALYTICS_TARGETS».
4. If `activatedAt` was already set → returns `'already-activated'` and the hook short-circuits.

This means activation can fire for **any** update that crosses the threshold — not tied to a specific page-load. The hourly "came back" bump is what eventually trips the gate for users who would otherwise sit just under it.

### Read sites

1. **Funnel analytics** — emit the activation event alongside the existing analytics fire if a second analytics tool is wired in. Same `afterChange` block.
2. **PMF survey trigger** — cron / scheduled job finds users where `activatedAt <= now - «SURVEY_DELAY»` AND `«SURVEY_SENT_FIELD» == null` AND `«SUPPRESSION_FIELD» == null`, sends the survey, stamps the sent timestamp for idempotency.

### Edge cases

State the resolution for every edge you've thought through. Common ones:

- **User completes core action, never returns within the gate window** — NOT yet activated. The `too-soon` reason is returned. They will receive re-engagement emails per the existing cron. If they return later, the next hook (typically the "came back" bump itself) re-evaluates and activates them then. PMF survey timer starts from THAT point, not from signup.
- **User has the artefact but no completed core action** (edge legacy / admin-seeded) — NOT activated by the `no-core-action` reason. Defensive.
- **Anonymous-then-signup flow** — note how anonymous activity is migrated at signup and how the gate then triggers on the user's first return. `«SIGNUP_METHOD_FIELD»` is captured as `'«ANONYMOUS_METHOD»'` so the analytics event carries the right attribution.
- **Multi-tenant / org-level** — note whether activation is per-user or per-org and how org changes invalidate or carry the activation timestamp.

---

## What this does NOT define

- **Engagement** (returning users beyond first activation) — separate metric, measured in funnel D1/D7/D30 retention.
- **Conversion** (free → paid) — separate funnel, lives in the billing / plan layer.
- **Power user** — to be defined empirically from cohort behavior post-launch.

---

## Locked decisions table

| Decision | Value | Decided by | Date |
| -------- | ----- | ---------- | ---- |
| Cohort size for first PMF read | «PMF_COHORT_SIZE» (hand-picked, founder personally interview-able) | «DECIDERS» | «ACTIVATION_DATE» |
| Activation criteria | «ACTIVATION_DEF» | «DECIDERS» | «ACTIVATION_DATE» |
| PMF survey fire delay | «SURVEY_DELAY» post-activation | «DECIDERS» | «ACTIVATION_DATE» |
| PMF verdict deadline | «PMF_VERDICT_DATE» — first usable read realistically «FIRST_READ_DATE» | — | — |

---

_Surfaced by the «REVIEW_TRIGGER». Doc reconciled «RECONCILE_DATE» to describe the actually-shipped logic. Unblocks the funnel emit and the PMF survey cron._
