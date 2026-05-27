# Observability

How analytics events flow through the app, what's tracked where, how to add a new event, and how production source-maps are uploaded.

> **Scope:** code-side only. Vendor dashboard configuration (funnels, cohorts, retention charts) is founder-side — provision the env vars + build the views in the vendor UI. See "Founder-side activation" near the bottom.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_OBSERVABILITY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/OBSERVABILITY.md` and localize the items below.
>
> **Reusability:** template-ready — the dual-emit + discriminated-union pattern is generic across analytics stacks; consent-gating, server-side measurement-protocol, and source-map upload are all vendor-agnostic. Reuse the STRUCTURE (taxonomy → dual-emit flow → consent gate → server-side path → tag taxonomy → "adding a new event" → source maps), then replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product being instrumented.
> - `«ANALYTICS_PRIMARY»` / `«ANALYTICS_SECONDARY»` — the two product-analytics vendors emitted in lockstep (e.g. GA4 + PostHog). One is the funnel-of-record; the other is for cohort/retention.
> - `«OBSERVABILITY»` — the error/telemetry vendor (e.g. Sentry); used for breadcrumbs + crash capture + release tagging.
> - `«EVENT_*»` — the analytics event names in the discriminated union (e.g. `«EVENT_ACCOUNT_CREATED»`, `«EVENT_ACTIVATION»`, `«EVENT_SUBSCRIPTION_STARTED»`).
> - `«CONSENT_KEY»` — the storage key + accepted value used to gate emission (e.g. `COOKIE_CONSENT === 'accepted'`).
> - `«SHARED_PATHS»` — where the analytics modules live (e.g. `src/lib/analytics/**`).
> - `«TRACK_BEACON_ROUTE»` — the unload-safe beacon route (allowlisted + rate-limited).
> - `«TAG_DOMAINS»` — the canonical set of `domain` tag values used for grouping in the error monitor's alert rules and dashboards.
> - `«TAG_AUDIT_CMD»` — the command that verifies tag-taxonomy compliance (e.g. `pnpm audit:sentry-tags`).
> - `«DEPLOY»` — hosting/CI platform (e.g. Vercel + GitHub Actions); needed for the source-map upload flag in the appendix.

## TL;DR

- **`«ANALYTICS_PRIMARY»`** (primary funnel) — every `trackEvent()` call emits via the primary vendor's client SDK.
- **`«ANALYTICS_SECONDARY»`** (cohort + retention) — the same `trackEvent()` lazy-imports the secondary client and emits with identical params. **Dual-emit so the funnels stay in lockstep.**
- **`«OBSERVABILITY»` breadcrumbs** — server-side `trackServerEvent()` (Measurement-Protocol-style) also adds breadcrumbs for error-context correlation.
- All client-side paths are gated on `«CONSENT_KEY»`.

## Event taxonomy

Source of truth: the `AnalyticsEvent` **discriminated union** under `«SHARED_PATHS»`. Every event has a string `event` discriminant + per-event params. Adding a new event = adding a variant to that union. TypeScript enforces param shape at every call site.

### Funnel stages (template)

Map each funnel stage to one or more events from the union. The table is the contract between code (event names) and the funnel definition in the vendor dashboard.

| Stage              | Event(s)                                          | Notes                                                                              |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. Landing         | (auto pageview)                                   | No explicit `trackEvent` — relies on platform-level pageview tracking.             |
| 2. Signup          | `«EVENT_ACCOUNT_CREATED»`                         | Include method (email / social / webhook-provisioned).                             |
| 3. First-flow start| `«EVENT_FLOW_STARTED»`                            | First time the user enters the core onboarding flow.                               |
| 4. First-flow done | `«EVENT_FLOW_COMPLETED»`                          | Include elapsed time + any flow-specific dimensions.                               |
| 5. Activation      | `«EVENT_ACTIVATION»`                              | Server-side via `trackServerEvent` from a model hook. Idempotent via a timestamp column on the user. |
| 6. Return D+1      | (return cohort — vendor computes from activation) | No explicit event.                                                                 |
| 7. Return D+7      | (same)                                            |                                                                                    |

(one row per funnel stage; replace the `«EVENT_*»` tokens with the actual variant names from the union)

### Other notable event families (template)

- `«EVENT_QUAL_PROMPT_*»` — qualitative-prompt modal: `_shown` / `_submitted` / `_dismissed`. `_shown` only fires when the modal actually renders. The `beforeunload` branch fires a separate `*_abandonment_signal` event (forwarded via `«TRACK_BEACON_ROUTE»` → server-side) so it doesn't pollute the shown→submitted funnel rate.
- `«EVENT_PMF_SURVEY_*»` — PMF-survey modal: `_shown` / `_submitted` / `_dismissed`. Cross-surface idempotent with any backing email/cron via a `«pmfSentAt»`-style column on the user.
- `«EVENT_SUBSCRIPTION_*»` — payment-processor webhook events (`_started` / `_renewed` / `_canceled`); fire server-side via `trackServerEvent`.
- `«EVENT_OUTBOUND_CLICK»` — from an `<ExternalLink>` wrapper when a tracking label is passed.
- `«EVENT_LEAD_CAPTURED»` — from anonymous lead-capture surfaces (e.g. email gate before signup).

The full list lives in the `AnalyticsEvent` union — read that file when in doubt.

## How an event fires

```
                 ┌─── consent gate ────┐
                 │  («CONSENT_KEY»)    │
                 └──────────┬──────────┘
                            ▼
client trackEvent(...)  ────┼────► «ANALYTICS_PRIMARY» client SDK (e.g. sendEvent)
                            │
                            └────► lazy import('./«analytics-secondary»-client')
                                   └─► capture(name, params)  «ANALYTICS_SECONDARY»

server trackServerEvent(...)  ──► fetch(«ANALYTICS_PRIMARY» Measurement Protocol)
                              └─► «OBSERVABILITY».addBreadcrumb            (error context)

navigator.sendBeacon → «TRACK_BEACON_ROUTE» ── allowlist + rate limit ──► trackServerEvent
   (only for unload-time signals — see `*_abandonment_signal` events above)
```

### Consent gate

All client-side emission is gated on `«CONSENT_KEY»`. **Server-side `trackServerEvent` is NOT gated** (the server has no access to the visitor's consent state) — be careful adding events to server paths that could fire for unconsented anonymous traffic.

The secondary vendor's `init()` itself is also gated on consent — important because `init` would otherwise create localStorage/cookie entries before the user accepts.

### Identification

`identifySecondaryVendorUser(uid, properties)` mirrors `«OBSERVABILITY».setUser({ id, username })` from the auth provider. Both run on every `currentUser` change, gated on consent. On logout, both reset.

## Server-side events

Use `trackServerEvent` from `«SHARED_PATHS»/track-server-event.ts` whenever you need to fire an event from a server-only path (API route, webhook, model/collection hook). It uses the primary vendor's **Measurement Protocol** with a server-only API secret (never expose to the browser).

Pattern:

```ts
import { trackServerEvent } from '@/lib/analytics/track-server-event';

await trackServerEvent(
  { event: '«EVENT_SUBSCRIPTION_STARTED»', tier: '«tier»', method: '«method»' },
  { clientId: user.id, userId: user.id }
);
```

`trackServerEvent` **no-ops when env vars are missing** — safe to call defensively.

## Error-monitor tag taxonomy

Every `«OBSERVABILITY».captureException` / `captureMessage` MUST include a `tags.domain` from the canonical set + a sub-tag (`route`, `endpoint`, `step`, `action`, `template`, or `boundary`). Alert rules + dashboards group on `domain`; drift breaks them.

Canonical domains (`«TAG_DOMAINS»`): «list per repo — e.g. `auth`, `payments`, `email`, `team`, `profile`, `account`, `flow`, `ai`, `analytics`, `plans`, `cms`, `health`, `unknown`».

Run `«TAG_AUDIT_CMD»` to verify compliance across the codebase. Non-zero exit = a violation surfaced.

See `«.claude/CLAUDE.md»` "Error-Monitor Tag Taxonomy" for the full table.

## Adding a new event

1. **Add the variant to `AnalyticsEvent`** in `«SHARED_PATHS»/track-event.ts` with a docstring explaining what the event captures + why.
2. **Call `trackEvent({ event: '«new_name»', ... })` at the surface** that triggers it. TypeScript enforces the param shape against the union.
3. **If server-side:** use `trackServerEvent` instead.
4. **If unload-time (`beforeunload`):** route through `«TRACK_BEACON_ROUTE»` via `navigator.sendBeacon`. Add the event name to the `ALLOWED_EVENTS` set in that route's handler.
5. **Update the funnel definition** in the secondary vendor's dashboard if the new event should be a funnel stage (founder-side).

## Founder-side activation

The code is wired defensively to no-op when env vars are missing. To activate analytics in a deployment:

1. Provision env vars on `«DEPLOY»`:
   - `«ANALYTICS_PRIMARY»`: public measurement ID + server-side API secret (for MP).
   - `«ANALYTICS_SECONDARY»`: public key + public host.
   - `«OBSERVABILITY»`: public DSN + auth token + org + project slugs.
2. Redeploy. Defensive no-op gates flip on automatically.
3. **Secondary vendor dashboard** — create the funnel using the stage table above; pin to the default dashboard view; define the launch cohort if relevant.
4. **Primary vendor audience config** (optional) — for retention reports, mirror the launch cohort definition.

After activation, `trackEvent` calls dual-emit automatically, identification follows from auth state, and the funnels populate without further code changes.

## Cross-references

- [`MANAGER_ARCHITECTURE.md`](./MANAGER_ARCHITECTURE.md) — how analytics fits the layered architecture.
- [`METRICS.md`](./METRICS.md) — the metric definitions backed by these events (instrumentation column).
- `«.claude/CLAUDE.md»` — Error-Monitor Tag Taxonomy (canonical domains).
- `«SHARED_PATHS»/analytics/` — implementations.

---

## Appendix: Production source maps

Production builds **do not** upload source maps to `«OBSERVABILITY»` unless explicitly enabled by an env flag:

```bash
«OBSERVABILITY_UPLOAD_SOURCEMAPS»=true
```

### Why this is gated behind a flag

The default-off posture prevents two foot-guns:

1. **Org-mismatched auth tokens OOM-crash the build.** If `«OBSERVABILITY_AUTH_TOKEN»` is set but points at a project the build can't see, the source-map uploader holds the full source graph in memory while it retries — on serverless builders with an 8 GB ceiling (`«DEPLOY»`), this OOMs the entire deploy. Default-off means a misconfigured token only breaks the upload, not the build.
2. **Preview deploys don't need source maps.** Source-map upload roughly doubles build memory + adds ~1 min. Preview is for product QA, not crash triage — keep the flag **unset** on preview.

Runtime error capture (via the public DSN) is unaffected by this flag — it works in every environment that has the DSN set.

### Founder enablement checklist

1. In `«OBSERVABILITY»`, create an auth token scoped to `project:releases` + `org:read`.
2. On `«DEPLOY»` **Production** environment:
   - `«OBSERVABILITY_ORG»=<org slug>`
   - `«OBSERVABILITY_PROJECT»=<project slug>`
   - `«OBSERVABILITY_AUTH_TOKEN»=<new token>`
   - `«OBSERVABILITY_UPLOAD_SOURCEMAPS»=true`
3. Deploy `«TRUNK»`.
4. Confirm build log: source-map upload succeeds (no "Project not found" / "auth token invalid").
5. In `«OBSERVABILITY»` → **Releases**, confirm the release tagged with the commit SHA has artifacts.
6. Throw a deliberate test error in production; stack frames should map to `.ts` / `.tsx` sources, not minified output.

### Preview deploys

Keep `«OBSERVABILITY_UPLOAD_SOURCEMAPS»` **unset** on preview — upload stays disabled to avoid the OOM ceiling.
