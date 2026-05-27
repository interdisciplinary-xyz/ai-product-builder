# Daily ritual — 10-min check, every weekday

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_DAILY_RITUAL` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/DAILY_RITUAL.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (errors → analytics → session replay → payments → user feedback, in that order), then replace every «placeholder» with your product's actual surfaces.
>
> **Pairs with:** `RUNBOOK_WEEKLY_RETRO.md` (the weekly aggregation), `RUNBOOK_FOUNDER_DASHBOARD.md` (single-screen health view this ritual walks), `RUNBOOK_DECISION_THRESHOLDS.md` (cross-reference when a number looks suspiciously good), `MANAGER_FOUNDER_OPS.md` (the cadence this is a leg of).
>
> **Local definitions to provide per repo** (replace inline or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product you're running the loop on
> - `«OBSERVABILITY_URL»` — error / telemetry dashboard (e.g. Sentry organization issues view)
> - `«ANALYTICS_URL»` — product analytics dashboard (e.g. GA4, PostHog, Plausible)
> - `«SESSION_REPLAY_URL»` — session replay surface (e.g. Microsoft Clarity, FullStory, PostHog replays)
> - `«PAYMENTS_PROVIDER_URL»` — payments dashboard (e.g. Stripe → Payments)
> - `«EMAIL_PROVIDER_URL»` — transactional email dashboard (e.g. Resend, Postmark) — referenced for failed-payment recovery emails
> - `«SUPPORT_CHANNEL»` — where users actually talk to you (e.g. Slack channel, Discord, support inbox)
> - `«EVENT_NAME»` — the core conversion events this product tracks (defined in `METRICS.md`, not redefined here)

> Open in this order. Anything anomalous → file a ticket immediately, don't try to remember.
>
> **Skipping a day is allowed. Skipping two in a row is the signal you're losing the loop.** Surface that in the next weekly retro.

---

## 1. Errors — new in last 24h (~2 min)

URL: `«OBSERVABILITY_URL»`

What to look for:

- New issue types not seen yesterday
- Unresolved-issue count climbing
- Anything tagged with a payments / auth domain — always P0 (paid customers are bleeding silently)

What to do:

- Resolve obvious junk inline (one-off network blips, etc.)
- File a ticket for anything that needs code investigation
- Match the canonical tag taxonomy (see `METRICS.md` / `.claude/CLAUDE.md`) when filing

## 2. Analytics — realtime + funnel (~2 min)

URL: `«ANALYTICS_URL»`

Tabs to open:

- Realtime — last-30-min users (sanity: anyone alive?)
- Reports → Engagement → Events — the core `«EVENT_NAME»` set (defined in `METRICS.md`)

What to look for:

- Drop in any event vs the rolling 7-day average
- **Spike in any event** (something working that wasn't before — capture it!)
- Funnel walk: where's the biggest drop-off?

KPI definitions live in `METRICS.md` — this ritual surfaces values; it does not redefine them.

## 3. Session replay — 1-2 random sessions (~3 min)

URL: `«SESSION_REPLAY_URL»`

Pick 1-2 sessions from yesterday. Watch them at 2x speed.

Note:

- Where did they hesitate? (heat-map of confusion = next week's iteration target)
- Did they rage-click anything?
- Did they reach the activation moment, or churn before it?

**This is the highest-information minute of your day. Don't skip it.**

## 4. Payments — new subscriptions or failed payments (~1 min)

URL: `«PAYMENTS_PROVIDER_URL»`

What to look for:

- New subscription events not yet emailed/onboarded
- Failed payment events — verify the recovery email fired in `«EMAIL_PROVIDER_URL»`
- Refunds requested

What to do:

- **Send a personal hello to every new paid customer THE SAME DAY** (or as soon as you see it). 2 sentences max: "Saw your signup, welcome, hit reply with anything weird." This is your differentiator vs every other faceless SaaS.

## 5. User feedback — bug reports / DMs (~2 min)

Tabs to open:

- `«SUPPORT_CHANNEL»` (your support channel)
- DMs from anyone who's used the product

What to do:

- Reply to everything within 24h, even if just "got it, looking into this"
- File tickets for anything that's not immediately fixable
- Surface delightful comments somewhere durable — these are PMF tells

---

## Anti-patterns

- **Optimizing the ritual into a script.** The point is your eyes on the data, not automation.
- **Reading the data you wanted to see.** Cross-reference `DECISION_THRESHOLDS.md` when a number looks suspiciously good.
- **Skipping session replay because it feels passive.** Watching real users IS the work — not the analytics charts.
- **Filing tickets at the end of the week instead of the moment you see them.** Weekend-Friday-you remembers less than mid-day-Monday-you.
- **Batching the same-day-hello to "later this week".** "Later" turns into "never" and the moment is gone.

---

_Daily ritual is the input. Weekly retro at `WEEKLY_RETRO.md` is the output._
