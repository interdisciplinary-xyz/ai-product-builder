# Security Model

> **Note:** this is the security **MODEL** (architecture, access matrix, controls); the pre-merge security checklist lives in [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_SECURITY_MODEL` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_SECURITY_MODEL.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the layered-visibility / access-matrix / rate-limit / env-validation structure is reusable; the auth stack, collections, and endpoints are «placeholders». Localize the tokens below per repo.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + canonical domain (also drives admin seed `«ADMIN_EMAIL»` and profile/route URL patterns).
> - `«AUTH»` — client identity + admin auth (e.g. Firebase Auth + a CMS admin panel).
> - `«DB_CMS»` — database + CMS (e.g. MongoDB + Payload).
> - `«COLLECTION_NAMES»` — the permission-matrix rows (the collections/tables in this repo) and their access helpers (e.g. `isAdminOrSelf`).
> - `«API_ROUTES»` — custom/public endpoint list and the auth rule per route.
> - `«PAYMENTS»` — payment provider + webhook/env (e.g. Stripe: `«PAYMENTS_SECRET_KEY»`, `«PAYMENTS_WEBHOOK_SECRET»`).
> - `«ENV_VARS»` — the schema-validated required/optional env-var names (e.g. DB URI, app secret, AI key, auth-cookie keys, cron secret).
> - `«RATE_LIMITS»` — limiter names/windows (e.g. `aiLimiter`, `authLimiter`) and backing store (in-memory vs Redis).
> - `«OBSERVABILITY»` — error monitor + release tag (e.g. Sentry, release = commit SHA, PII-free user context).
> - `«LOCALES»` — supported locales used in route prefixes (e.g. `en`).
> - `«INTEGRATIONS»` — third-party integrations with their own security model (e.g. a chat integration: signing secret + bot token).

**Last reviewed:** «DATE»

## Data Visibility Layers

(Define the visibility tiers this product exposes — e.g. public / team / private — and what each tier can see. Keep the layered-visibility model; replace the example field names and rows below.)

### «Field» Visibility

Each «record/field» has a `visibility` field that controls where it is shown:

| Level       | Visible to            | Stored          |
| ----------- | --------------------- | --------------- |
| `«public»`  | «who can see it»      | «where stored»  |
<!-- (one row per visibility tier) -->

Filtering happens at query time in the `«READ_ENDPOINT»` endpoint. A `«viewerScope»` query parameter determines whether scoped (e.g. team-level) data is included.

### «Resource» Data

| Data           | «Tier A» | «Tier B» | «Tier C»     |
| -------------- | -------- | -------- | ------------ |
| `«field»`      | Yes      | Yes      | «who/Admin»  |
<!-- (one row per data field shown on the resource) -->

---

## Authentication Architecture

### «AUTH» (Client-Side Identity)

(Describe the client identity provider and how sessions are established — e.g. Firebase Auth.)

- «Sign-in methods» (e.g. email/password + social OAuth)
- Tokens stored in HTTP-only cookies via «auth library»
- Cookie signature key rotation supported (current + previous keys)
- Server components validate tokens via «token-verification helper»

### «ADMIN_AUTH» (Admin Panel)

(Describe the admin auth system, if separate — e.g. a CMS admin panel.)

- Separate auth system for the admin panel
- Only `role: "admin"` users can access `«ADMIN_PATH»`
- Admin user seeded on boot (`«ADMIN_EMAIL»`)

### Middleware Protection

- Most authenticated routes require `«AUTH»` authentication
- `«ADMIN_PATH»` and `«API_PREFIX»/*` (except login/logout) bypass the auth middleware
- **Public without auth:** «list the routes reachable without auth — e.g. marketing pages, public profiles, blog, post-checkout landings with a one-time token»
- «Any legacy → redirect rules»
- «Any guard that redirects authenticated users based on onboarding state»

---

## API Access Control

### Ownership-Based Security (`«access module»`)

All data-layer operations enforce ownership via token verification. A shared access module typically provides helpers like:

| Helper                | Purpose                                                                                |
| --------------------- | -------------------------------------------------------------------------------------- |
| `«getUserId(req)»`    | Parses the auth cookie/header, verifies the token, returns the user id or null         |
| `«requireAuth(req)»`  | Wraps the above; throws 401 if no valid token                                          |
| `«isAdmin»`           | Only admin-authenticated users                                                         |
| `«isAdminOrSelf»`     | Admin → full access; user → restricted to their own document                           |
<!-- (one row per access helper) -->

### Collection Permission Matrix

(One row per collection/table — the CRUD rule for each, where access tiers are typically Public / Auth / Owner / Admin / System.)

| Collection      | Create   | Read     | Update   | Delete   |
| --------------- | -------- | -------- | -------- | -------- |
| `«Collection»`  | «rule»   | «rule»   | «rule»   | «rule»   |
<!-- (one row per collection) -->

**REQUIRED — IDOR / ownership negative test per owner-scoped route.** Every route in this matrix (or the custom-endpoint list below) whose rule is owner / `«isAdminOrSelf»` MUST ship a test asserting a **non-owner** request returns **403/404** (not the resource). CI asserts the test exists per owner-scoped route — e.g. a co-located `*.idor.spec.ts` file or an `@idor`-tagged case — and fails the PR if an owner route has no matching negative test. See [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md) (AuthZ checklist) and [`github-actions-minutes-workflow.md`](./github-actions-minutes-workflow.md) (CI gate).

### Custom Endpoint Protection

Custom endpoints verify the authenticated user id matches the resource owner (unless noted):

- `«METHOD «ROUTE»»` — «auth rule, e.g. public (rate-limited) / UID === :userId / plan-gated»
<!-- (one row per custom endpoint, with its auth rule) -->

**Other routes** (under `«api dir»`): «summarize the auth model per route group — e.g. payment checkout/portal/webhook (auth or signature), invites (membership), crons (`«CRON_SECRET»`), public creates, IP-rate-limited demos, internal email send (`«internal API secret»`)».

### Public Endpoints (No Auth)

| Endpoint              | Purpose             |
| --------------------- | ------------------- |
| `«METHOD «ROUTE»»`    | «what it serves»    |
<!-- (one row per public endpoint; note webhook routes that rely on signature verification instead of auth) -->

---

## «PAYMENTS» Security

(Keep the checkout / portal / webhook split — it applies to any payment provider, e.g. Stripe.)

### Checkout Route (`«POST «CHECKOUT_ROUTE»»`)

- Verifies the auth token via cookies
- Validates the token's user id === `body.userId`, else 403
- Looks up the price/plan id from the source of truth (CMS/DB) by tier
- Falls back to a `«PRICE_ID»` env var if lookup fails

### Portal Route (`«POST «PORTAL_ROUTE»»`)

- Verifies the auth token via cookies
- Looks up the user, verifies the user's customer id === `body.customerId`
- Prevents users from accessing other users' billing portals

### Webhook Route (`«POST «WEBHOOK_ROUTE»»`)

- Verifies the provider signature via `«PAYMENTS_WEBHOOK_SECRET»`
- Handles the relevant events (e.g. checkout completed, subscription updated/deleted, payment failed)
- Uses elevated/internal access for writes (updates plan, customer/subscription ids, expiry)
- Persists the real period-end from the provider's subscription API

### Custody-Field Static Check (payments repos)

**REQUIRED — unconditional CI gate.** The custody-implying field-name static check (e.g. `«FORBIDDEN_TOKENS_SPEC»`, such as `forbidden-tokens.static.spec.ts`) runs on **every PR** as a required check — not a manual checkbox. It fails the build if any field with a custody-implying name (e.g. `balance`, `walletId`, `payoutSchedule`, `settlementBatch`) is added, asserting the platform never holds funds. CI implementation: [`github-actions-minutes-workflow.md`](./github-actions-minutes-workflow.md) (`forbidden-tokens` gate).

---

## CI Security Gates

**REQUIRED.** Secret scanning (e.g. `gitleaks`) and dependency audit (e.g. `osv-scanner` / `«PKG_MGR» audit --audit-level=high`) run on every PR as required checks. Mechanism + branch-protection wiring: [`github-actions-minutes-workflow.md`](./github-actions-minutes-workflow.md).

---

## Rate Limiting

In-memory sliding-window rate limiter per user ID or IP address. Best-effort guard (not shared across serverless instances).

| Limiter     | Limit    | Window     | Applied To              |
| ----------- | -------- | ---------- | ----------------------- |
| `«limiter»` | «N req»  | «window»   | «which endpoints»       |
<!-- (one row per limiter — e.g. an AI limiter, an auth limiter, a general read limiter, per-IP demo/beacon limiters) -->

Returns `429 Too Many Requests` with `Retry-After` header when exceeded.

**Scaling note:** For distributed deployments, replace with a Redis-based limiter (e.g. `@upstash/ratelimit`).

---

## Environment Validation

A schema (e.g. Zod) validates environment variables at startup (e.g. via an `instrumentation.ts → register()` hook):

**Required** (hard error if missing — names logged, never values):

- Core: «app base URL, DB URI, app secret»
- `«AUTH»`: «the auth provider's required keys»
- Auth cookies: «cookie name + current/previous signature keys»
- `«AI_PROVIDER»`: «AI API key»
<!-- (one bullet per required category — list the names, never values) -->

**Optional** (warning if missing, features gracefully disabled):

- `«PAYMENTS»`: «secret key, price id, webhook secret»
- Email: «email API key», `«CRON_SECRET»`
- Analytics: «analytics ids»
- `«OBSERVABILITY»`: «error-monitor DSN / project url»
- `«INTEGRATIONS»`: «integration API urls/tokens»
<!-- (one bullet per optional category) -->

---

## Error Monitoring (`«OBSERVABILITY»`)

(Generic guidance for any error monitor, e.g. Sentry. Replace helper/file names with the repo's.)

- All runtimes (client / server / edge) share a single init helper. Each top-level config file just calls it with its runtime.
- Every captured event is tagged with a `release` = the commit SHA (the browser bundle reads a public-exposed copy of it).
- After login, set the error-monitor user context to **PII-free** identifiers only (e.g. id + opaque username — no email, no display name). Clear it on logout.
- A `beforeSend` hook filters out noise that happens routinely in dev/CI (e.g. local API connection errors).
- Source maps uploaded during the production build, then deleted from the build output.
- All API error handlers capture exceptions with domain/route tags for triage grouping.

---

## «Feature» Consent Model

(Per-feature security/consent example. Document any feature that exposes one user's data to another, or that processes sensitive data — keep the Consent / Data-used split.)

### Consent Model

Document whether the feature requires the data subject's consent, the rationale (e.g. data is opt-in / public by design), and any future opt-out flag planned.

### Data Used

Document exactly which data the feature reads, and whether any private/sensitive inputs are exposed in the output vs. only used to derive a result.

---

## «INTEGRATION» Security

(Security model for a third-party integration — e.g. a chat bot. Keep the Account-linking / Data-access split.)

### Account Linking

1. User runs `«SLASH_COMMAND» login` in `«INTEGRATION»`
2. A one-time token is generated with a short expiry
3. User clicks a link to `«DOMAIN»«LINK_ROUTE»?token={token}`
4. The web app consumes the token via the integration's API
5. The link is persisted against the user record (scoped to the integration's team/user ids)

### Data Access

- The integration accesses data via the web app's API only
- It has no direct database access
- Outbound calls (e.g. to an `«AI_PROVIDER»` model) send only the minimum necessary, non-private data

---

## «Tenant» Data Isolation

(Multi-tenant / org-scoped isolation rules.)

- Tenant/org members are stored in the `«ORG_COLLECTION»` collection
- Scoped data is filtered when the viewer's scope matches and the viewer is a member
- Member-listing endpoints are admin-only
- Tenant-wide analyses require the appropriate plan on the requesting user

---

## Cookie Consent (GDPR)

- Cookie consent banner implemented in `«consent module path»`
- Privacy-first: only essential cookies set before consent
- Analytics cookies (e.g. GA4 / GTM) only activated after user consent
- Privacy Policy and Terms of Service pages served from `«DB_CMS»`

---

## Attack-surface overview (template)

(Use this table after every full security audit. One row per attack surface — keep the columns stable so audits stay comparable across releases. The point is to give a one-page posture readout that a non-security reviewer can scan in 30 seconds and that an auditor can diff against the prior pass.)

| Surface              | Exposure                                          | Auth tier                                  | Validators                              | Risk class                             |
| -------------------- | ------------------------------------------------- | ------------------------------------------ | --------------------------------------- | -------------------------------------- |
| `«SURFACE»`          | «public / authed / owner / admin / signature»     | «AUTH» / `«requireAuth»` / signature / none | «Zod schema» / regex / DTO / none       | «critical / high / medium / low / ok»  |

**Standard rows to consider** (rename / drop / add per repo):

- Authentication (`«AUTH»` flow — sign-in, sign-up, password reset, session refresh)
- Authorization (per-collection rules from the permission matrix; IDOR/ownership surface)
- Input validation (`«API_ROUTES»` — schema coverage on POST/PUT/PATCH/DELETE)
- Payment processing (`«PAYMENTS»` checkout / portal / webhook; custody-field static check)
- Secrets management (`«ENV_VARS»` validation, key rotation, client-bundle leak surface)
- Client-side surface (XSS via `dangerouslySetInnerHTML`, `localStorage` PII, third-party scripts)
- Security headers (`Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`)
- CORS posture (allowlist enforcement, credentialed-request behavior on unknown origin)
- Rate limiting (`«RATE_LIMITS»` coverage per high-abuse endpoint)
- `«AUTH»` cookie configuration (`secure`, `sameSite`, `maxAge`, `httpOnly`)
- Observability + audit trail (`«OBSERVABILITY»` PII filtering, auth-event logging)
- Dependency posture (CI dependency-audit gate, known-deprecated packages)

For each row, "Risk class" is the **current** posture after audit, not the inherent risk of the surface. A well-rate-limited auth flow can sit at "ok"; an unmiddlewared payment webhook is "critical" until fixed.

---

## Remediation roadmap (template)

(Use this section to publish findings from a full audit as a roadmap. Categorize by severity, attach estimated effort, and give each item explicit acceptance criteria so a reviewer can mark it done objectively. Severity tiers map to the prioritization windows in the team's release cadence — adjust the windows to match `RUNBOOK_RELEASE_MANAGER.md`.)

### Critical (this week — block the next release if open)

| #             | Finding                       | Estimated effort   | Acceptance criteria                                                          |
| ------------- | ----------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `«FINDING_ID»` | «one-line description»        | «hours / days»     | «the concrete state that proves it's fixed — a test, a config, a CI gate»    |

Typical critical patterns: hardcoded secret in source / client bundle; mass-assignment that escalates plan or role; missing user-id in `«PAYMENTS»` checkout metadata (breaks subscription activation); zero rate limiting on auth or registration; weak password policy with mismatched front/back validators.

### High (this sprint)

| #             | Finding                       | Estimated effort   | Acceptance criteria                                                          |
| ------------- | ----------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `«FINDING_ID»` | «one-line description»        | «hours / days»     | «test name / CI gate / config diff»                                          |

Typical high patterns: IDOR on owner-scoped reads; admin-only list endpoint missing role check; unsanitized HTML via `dangerouslySetInnerHTML`; missing security headers; permissive CORS fallback; missing CSRF posture on state-changing routes; sensitive PII in `localStorage`; missing webhook idempotency on `«PAYMENTS»`; email-based authZ where an immutable id should be used; no email verification gate.

### Medium (next sprint)

| #             | Finding                       | Estimated effort   | Acceptance criteria                                                          |
| ------------- | ----------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `«FINDING_ID»` | «one-line description»        | «hours / days»     | «test name / CI gate / config diff»                                          |

Typical medium patterns: user-enumeration via distinct error strings; debug mode enabled outside production; weak cookie config (`secure: false`, long `maxAge`, `sameSite: lax` on auth); non-null assertion on a critical secret that should hard-fail with a descriptive error; weak session-id format validation; missing transaction idempotency; deprecated crypto library still imported; 200 on not-found; full error objects logged to `console.error` instead of `«OBSERVABILITY»`.

### Low (backlog)

| #             | Finding                       | Estimated effort   | Acceptance criteria                                                          |
| ------------- | ----------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `«FINDING_ID»` | «one-line description»        | «hours / days»     | «test name / CI gate / config diff»                                          |

Typical low patterns: validator messages mismatched to the field they validate; base URL hardcoded to localhost; no security-event audit trail; no 2FA; missing `.env.example`; framework strict-mode disabled.

**Acceptance-criteria discipline.** Each row's acceptance criteria must be *observable* — a passing test, a CI gate flipping green, a config value visible in a deployed environment, or a referenced doc section. Avoid "review and improve" language; that is not an acceptance criterion. The roadmap rolls forward into a tracking issue per row, and is reviewed at the same cadence as `AUDIT.md`.
