# Emails workflow — when & why we email users

> **Audience:** founder / on-call doing pre-release QA on the email layer.

The canonical inventory of every email `«PROJECT»` sends a user: the trigger (exact code path), when it fires, why, who receives it, and how to test it manually. Companion to [`RUNBOOK_EMAIL_DELIVERABILITY.md`](./RUNBOOK_EMAIL_DELIVERABILITY.md) (DNS + inbox-placement matrix) and [`RUNBOOK_E2E.md`](./RUNBOOK_E2E.md) (app-flow automated tests).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_EMAILS_WORKFLOW` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/EMAILS_WORKFLOW.md` and localize the items below.
>
> **Reusability:** template-ready — the "canonical email inventory" pattern (one row per template, columns: trigger / when / why / recipient / test entry-point) is generic across providers. The two load-bearing abstractions — (a) **never throw — fail closed to error monitor**, (b) **dev/no-key returns `{ success: false }`** — are what keep the calling flow correct regardless of vendor.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product these emails belong to.
> - `«EMAIL_PROVIDER»` — the transactional-email vendor (e.g. Resend, Postmark, SendGrid) + the env var that holds its API key (e.g. `«EMAIL_API_KEY»`).
> - `«EMAIL_SENDER»` — the From identity (e.g. `«PROJECT» <hello@«DOMAIN»>`).
> - `«EMAIL_TEMPLATES_PATH»` / `«EMAIL_WRAPPERS_PATH»` — where templates + send wrappers live in source (e.g. `src/lib/email/templates/`, `src/lib/email/emails.ts → send-email.ts`).
> - `«EMAIL_SEND_ROUTE»` — the internal "fire any template on demand" route + its secret header (e.g. `POST /api/email/send` with `x-api-secret: $«EMAIL_API_SECRET_ENV»`).
> - `«EMAIL_SCHEMA»` — the schema that enumerates valid `type` values (e.g. `emailSendSchema`).
> - `«OBSERVABILITY»` — the error monitor receiving "fail closed" captures, with `domain: 'email'` tag.
> - `«CRON_SECRET»` — bearer secret for cron-route emails.
> - The canonical list of templates — fill in §"Email catalog" below.
> - Any **provider-managed** emails outside this inventory (e.g. password-reset sent by the auth provider, not the transactional vendor) — call them out in the "Exceptions" callout so they're not "missing".

## How email works here

| Property                | Value                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider                | **«EMAIL_PROVIDER»** (`«EMAIL_API_KEY»`)                                                                                                                                           |
| Sender                  | `«EMAIL_SENDER»`                                                                                                                                                                   |
| Templates               | `«EMAIL_TEMPLATES_PATH»`                                                                                                                                                           |
| Send wrappers           | `«EMAIL_WRAPPERS_PATH»`                                                                                                                                                            |
| **Failure mode**        | **Never throws** — failures are logged to «OBSERVABILITY» (`domain: 'email'`) and the calling flow continues. **The send wrapper is a fail-closed boundary; callers never `try/catch`.** |
| **Dev / no-key**        | Returns `{ success: false }` when `«EMAIL_API_KEY»` is unset (local dev sends nothing — but every call site still runs and is type-checked).                                       |
| Tagging                 | Each send is tagged for provider analytics (`category: <type>`).                                                                                                                   |
| Manual test entry point | `«EMAIL_SEND_ROUTE»` (rate-limited; fires any `type` value enumerated in `«EMAIL_SCHEMA»` — see § "How to test").                                                                  |

> **Exceptions (provider-managed emails not in this inventory).** Any email the auth provider sends directly (e.g. password reset via the auth SDK) is outside this catalog — `«PROJECT»` doesn't control its template or timing. Call those out here so they're not perceived as "missing".

## Two abstractions that keep this safe

1. **Never throw — fail closed to the error monitor.** Every `send«Type»Email()` wrapper catches its own provider error, captures it to «OBSERVABILITY» with `domain: 'email'` + a sub-tag (`template`, `recipient-state`, etc.), and returns `{ success: false }`. Callers (route handlers, model hooks, cron jobs) treat email as best-effort — a failed send must never roll back the underlying action (account creation, payment confirmation, etc.). This makes the calling flow easy to reason about and keeps the error-monitor signal the single source of truth for "is email healthy".
2. **Dev / no-key returns `{ success: false }`.** When `«EMAIL_API_KEY»` is unset (typical local dev), wrappers no-op and return `{ success: false }`. Every call site still runs, every code path is exercised, every type-check is satisfied. Don't add a "skip if local dev" branch at every call site — keep the no-op inside the wrapper, where it stays out of the calling flow's concern.

## Email catalog

A canonical inventory of every template. **Each row is the contract between code (trigger) and product (recipient experience).** Group by category — account lifecycle, billing/payments, sharing/team, lifecycle crons — so a reviewer can scan one section at a time.

### A. Account lifecycle (event-triggered)

| Email                | Trigger (code path)                | When                      | Why                              | Recipient   | Test entry-point                       |
| -------------------- | ---------------------------------- | ------------------------- | -------------------------------- | ----------- | -------------------------------------- |
| `«template-name»`    | `«collection/hook or route»`       | «exact condition»         | «one-line user-experience goal»  | «who»       | `«EMAIL_SEND_ROUTE»` with `type: ...`  |

(one row per template in this category)

### B. Billing / payments (webhook-triggered)

| Email                | Trigger (code path)                          | When                       | Why                            | Recipient    | Test entry-point                       |
| -------------------- | -------------------------------------------- | -------------------------- | ------------------------------ | ------------ | -------------------------------------- |
| `«template-name»`    | `«PAYMENTS» webhook → «event.type»`          | «exact event condition»    | «user-experience goal»         | «who»        | Replay the webhook event in test mode. |

(one row per template in this category)

### C. Sharing / team (in-app actions)

| Email                | Trigger (code path)             | When                              | Why                            | Recipient        | Test entry-point                       |
| -------------------- | ------------------------------- | --------------------------------- | ------------------------------ | ---------------- | -------------------------------------- |
| `«template-name»`    | `«route handler»`               | «in-app action»                   | «user-experience goal»         | «who»            | `«EMAIL_SEND_ROUTE»` with `type: ...`  |

(one row per template in this category)

### D. Lifecycle crons (cron-driven)

| Email                          | Cron route               | When (window/schedule)                                       | Why                                                | Recipient                       | Idempotency marker         |
| ------------------------------ | ------------------------ | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------------- | -------------------------- |
| `«template-name»`              | `«/api/cron/...»`        | «window — e.g. ~24h after activation, daily tick»            | «engagement goal — nudge, deepen, win back, PMF»   | «cohort condition»              | `«userColumn»` set on send |

(one row per cron-driven template)

All crons: **Bearer `«CRON_SECRET»` auth**, hard cap N users/tick, idempotent (a per-user timestamp marker is set only on a successful send), and respect email suppression + per-user opt-out flags.

## What does NOT send an email (so you're not surprised)

(List the deliberate **non-sends** that are easy to misread as bugs. This is the most-revisited section of this doc.)

- «cause that looks like it should send but deliberately doesn't, and where the gate lives in code»
- «another non-send (e.g. viewing your own profile, local dev without API key, suppressed user)»

(one bullet per known non-send)

## What a user receives, by journey

```
«Entry surface»
  └─ «email A»

«Signup»
  └─ «email B»  →  «next action»  →  «email C»
       └─ «time»   «cron-driven email D»
       └─ «time»   «cron-driven email E»
       └─ if conditions → «re-engagement chain F → G → H (then stop)»

«Payment»
  └─ «email I»  +  «email J»
       └─ later failure → «email K»

«Social/peer action» → «email L» (throttled)
```

(this is a quick-scan map for "what does the user actually receive in this journey" — keep it short, do not duplicate the catalog)

## How to test each email manually

### 1. Fire any template on demand (fastest)

`«EMAIL_SEND_ROUTE»` sends the real template to any inbox without needing the natural trigger:

```bash
curl -X POST "$BASE«EMAIL_SEND_ROUTE»" \
  -H "content-type: application/json" \
  -H "«auth header»" \
  -d '{"type":"«template-name»","to":"you+«type»@«domain»","«other required fields»":"..."}'
```

Valid `type` values are enumerated in `«EMAIL_SCHEMA»`. Lifecycle emails also have cron entry-points (§2 below) when you want to exercise selection logic, not just rendering.

A companion deliverability script loops every template against a set of test inboxes (Gmail / Outlook / iCloud / Proton) for the inbox-placement matrix — see [`RUNBOOK_EMAIL_DELIVERABILITY.md`](./RUNBOOK_EMAIL_DELIVERABILITY.md).

### 2. Trigger the crons directly

```bash
curl "$BASE/api/cron/«cron-name»" -H "Authorization: Bearer $«CRON_SECRET»"
```

Each returns a JSON run summary (`{ candidates/picked, sent, skipped }`). To exercise the real selection logic, seed a test user whose `«activatedAt»` / `«lastActiveAt»` lands in the relevant window.

### 3. Exercise the natural triggers (true end-to-end)

- **Account-lifecycle emails:** register a fresh account → walk the onboarding flow.
- **Payment emails:** run a real (test-mode) checkout via `«PAYMENTS»`.
- **Payment-failure email:** use the test card that fails on renewal, or replay `«invoice.payment_failed»` in the dashboard.
- **Sharing / team emails:** use the in-app invite + accept flows.
- **Throttled emails (e.g. profile-viewed):** open a profile from a second browser/session.

> **Where to test:** the preview deploy for the active PR, or a healthy local dev server. **⚠️ Before blasting test emails on preview, confirm whether preview shares the production `«EMAIL_API_KEY»` + DB connection.** If so, use `+tag` inboxes you own and avoid seeding junk into prod data.

## Cross-references

- [`RUNBOOK_EMAIL_DELIVERABILITY.md`](./RUNBOOK_EMAIL_DELIVERABILITY.md) — DNS (SPF/DKIM/DMARC), inbox-placement matrix, common-failure remediation.
- [`RUNBOOK_E2E.md`](./RUNBOOK_E2E.md) — automated app-flow coverage.
- `«EMAIL_TEMPLATES_PATH»` — the React/MJML template source.
- `«EMAIL_WRAPPERS_PATH»` — the per-template `send*Email()` wrappers.
