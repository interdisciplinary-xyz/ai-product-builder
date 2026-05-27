# Email QA matrix — pre-launch

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_EMAIL_QA_MATRIX` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/EMAIL_QA_MATRIX.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (matrix columns → auth-setup once → per-template `curl` rows → per-inbox render checklist → required env), then **enumerate the template rows against your repo's actual transactional email catalog** — pull the list from `EMAILS_WORKFLOW.md`. The shape is the matrix; the rows are per-repo.
>
> **Pairs with:** `RUNBOOK_EMAILS_WORKFLOW.md` (the canonical catalog of every transactional template — when each fires, why, who receives it; this matrix QAs each one), `RUNBOOK_EMAIL_DELIVERABILITY.md` (the domain / DKIM / SPF / DMARC verification this matrix assumes is green), `RUNBOOK_PRE_LAUNCH_CHECKLIST.md` (the engineering launch gate this matrix is a section of), `RUNBOOK_RESEND_DOMAIN_VERIFICATION.md` (or equivalent provider doc — the provider-side setup this matrix exercises).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + sender domain
> - `«EMAIL_PROVIDER»` — transactional provider (e.g. Resend, Postmark, SendGrid)
> - `«EMAIL_SEND_ROUTE»` — the local manual-trigger endpoint (e.g. `/api/email/send`)
> - `«EMAIL_SEND_AUTH_HEADER»` — the header name + env var name that gates the manual route (e.g. `x-api-secret: $«EMAIL_API_SECRET_ENV»`)
> - `«EMAIL_TEMPLATE_COUNT»` — number of transactional templates in the discriminated-union payload (from `EMAILS_WORKFLOW.md`)
> - `«EMAIL_TEMPLATE_NAMES»` — the list of `type` discriminator values (from the email-send schema)
> - `«SENDER_DISPLAY»` — the `From:` header value (e.g. `«PROJECT» <hello@«DOMAIN»>`)
> - `«EMAIL_LOCAL_DEV_PORT»` — the dev-server port for local `curl` testing (e.g. 3000)
> - `«BRAND_COLOR»` — the brand colour every template should use

---

> **Purpose:** verify every transactional template renders correctly across the major inbox vendors **before** launch. The local `«EMAIL_SEND_ROUTE»` accepts a discriminated-union payload covering all **`«EMAIL_TEMPLATE_COUNT»`** templates (see `docs/EMAILS_WORKFLOW.md`). Run each `curl` from a terminal with the dev server running; each sends one real email through `«EMAIL_PROVIDER»` to whatever `to` address you pass.
>
> **Faster path:** most repos have a single script (e.g. `scripts/email-deliverability-test.ts`) that triggers all templates in one command. Prefer it for the deliverability sweep; use the per-template `curl`s when you need to vary the payload.

---

## Matrix shape

The matrix has one row per template:

| Template | Trigger | Test entry-point (`curl`) | Gmail web | Gmail iOS | Apple Mail Mac | Apple Mail iOS | Outlook | Status |
| -------- | ------- | ------------------------- | --------- | --------- | -------------- | -------------- | ------- | ------ |
| `«EMAIL_TEMPLATE_NAME_1»` | (from `EMAILS_WORKFLOW`) | `curl …` (see below) | ☐ | ☐ | ☐ | ☐ | ☐ | not-started |
| `«EMAIL_TEMPLATE_NAME_2»` | … | `curl …` | ☐ | ☐ | ☐ | ☐ | ☐ | not-started |
| … | | | | | | | | |

**Status values:** `not-started` · `in-progress` · `passing` · `failing-«inbox»` · `blocked-«reason»`.

Fill one row per template (`«EMAIL_TEMPLATE_COUNT»` rows total). Pull the trigger column from `EMAILS_WORKFLOW.md` — don't re-derive it here.

---

## Auth setup (once)

> The `«EMAIL_SEND_ROUTE»` is gated behind `«EMAIL_SEND_AUTH_HEADER»` to prevent external abuse. Set up your shell once:

```bash
export «EMAIL_API_SECRET_ENV»=$(grep "^«EMAIL_API_SECRET_ENV»=" .env.local | cut -d= -f2- | tr -d '"' | tr -d "'")
export EMAIL_TO=your-real-inbox@gmail.com
```

(Replace `«EMAIL_API_SECRET_ENV»` with your route's actual env-var name.)

---

## Per-template `curl` shape

Every template send looks like this — replace `«TEMPLATE_NAME»` and the payload fields per template:

```bash
curl -X POST http://localhost:«EMAIL_LOCAL_DEV_PORT»«EMAIL_SEND_ROUTE» \
  -H "content-type: application/json" \
  -H "«EMAIL_SEND_AUTH_HEADER»" \
  -d "{\"type\":\"«TEMPLATE_NAME»\",\"to\":\"$EMAIL_TO\",\"«FIELD_1»\":\"«VALUE»\",\"«FIELD_2»\":\"«VALUE»\"}"
```

Enumerate one block per template from `«EMAIL_TEMPLATE_NAMES»`. Each template's payload schema is defined in the discriminated-union type (typically `emailSendSchema` or equivalent — see `EMAILS_WORKFLOW.md`).

**Common template categories** (your repo will vary):

- **Account lifecycle** — welcome, set-password, profile-viewed
- **Survey / core flow** — results, completion, share prompt
- **Billing** — subscription confirmed, payment failed, plan changed
- **Sharing / team** — comparison invite, team invite, mention notification
- **Re-engagement** — day-1, day-7, day-30 drip; reactivation
- **Auth (provider-managed)** — password reset (often handled by auth SDK, not this catalog)

---

## Per-template render checklist (run once per template, in each mail client)

For each row in the matrix above, open the resulting email in each inbox column and walk this checklist:

- [ ] **Subject line** correct in inbox preview (not the literal template tag)
- [ ] **Preview text** (first 100 chars) sensible — not raw HTML
- [ ] **From-name + from-address** is `«SENDER_DISPLAY»` (NOT the provider's sandbox sender like `noreply@resend.dev`)
- [ ] **Reply-to** set to a monitored address
- [ ] **Layout** renders without scroll on mobile (Gmail iOS + Apple Mail iOS)
- [ ] **Dark mode** rendering in iOS Mail (templates often break here)
- [ ] **CTA buttons** clickable, text legible
- [ ] **Logo image** loads (not broken-image icon)
- [ ] **Email preferences / unsubscribe footer link** present + points at a real preferences route
- [ ] **Brand colour** `«BRAND_COLOR»` used throughout — not the provider's default blue / indigo
- [ ] **Personalization slots** filled (no `{{firstName}}` literal showing through)
- [ ] **Links** carry UTM tags where appropriate (see `LAUNCH_SOCIAL.md` UTM convention for re-engagement emails)

Mark the row's inbox checkbox `✓` only when all of the above pass in that inbox.

---

## Required production env

For the templates to actually deliver from the live deploy:

- **`«EMAIL_PROVIDER»` API key** — the provider's project secret. Without it, the `getProvider()` / equivalent client returns `null` and `sendEmail()` silently no-ops (returns `{ success: false }`; doesn't throw).
- **Domain verification.** `«EMAIL_PROVIDER»` → Domains → `«DOMAIN»` must show all green (DKIM, SPF, DMARC records added in DNS). Without verification, real emails from `«SENDER_DISPLAY»` land in spam.

Defers full DNS / DKIM setup to `EMAIL_DELIVERABILITY.md` and `RESEND_DOMAIN_VERIFICATION.md` (or the equivalent provider runbook).

---

## Acceptance

The email QA gate is closeable when:

- [ ] Every row in the matrix is `passing` for at least Gmail web + Apple Mail iOS (the two most-common inboxes for most consumer products); Outlook + Gmail iOS green for B2B audiences.
- [ ] Domain verification (DKIM + SPF + DMARC) is green in `«EMAIL_PROVIDER»`.
- [ ] Production env vars for `«EMAIL_PROVIDER»` are set.
- [ ] Any `failing-«inbox»` row has a follow-up issue filed with a non-launch-blocker label (or is fixed before launch).

After this is green, `PRE_LAUNCH_CHECKLIST.md` § 6 can be ticked.

---

_Defers the catalog of templates (what each one is for, when it fires) to `EMAILS_WORKFLOW.md`; defers DNS / DKIM / SPF / DMARC setup to `EMAIL_DELIVERABILITY.md`; defers provider-side setup to `RESEND_DOMAIN_VERIFICATION.md` (or equivalent). This doc is the source-of-truth for the per-template render-QA matrix._
