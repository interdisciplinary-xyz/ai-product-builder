# Pre-launch verification checklist

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PRE_LAUNCH_CHECKLIST` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/PRE_LAUNCH_CHECKLIST.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (security headers → SEO → observability → performance → operational → acceptance gate), then **run each verification against the target repo** — fill in real commands, real env vars, real `file:line` references. The shape is the checklist; the checks are per-repo.
>
> **Pairs with:** `RUNBOOK_SECURITY_DEEP.md` (the security baseline the headers check enforces), `RUNBOOK_OBSERVABILITY.md` (the observability stack the SEN tagging check verifies), `RUNBOOK_SMOKE_TEST.md` (the post-deploy smoke test that runs after this gate passes), `RUNBOOK_STRIPE_TEST_CHECKLIST.md` (the payment-specific checklist this gate hands off to), `RUNBOOK_EMAIL_QA_MATRIX.md` (the per-template email QA shape — extracted from this doc), `MANAGER_LAUNCH_GTM.md` (the GTM order-of-ops this engineering gate unblocks). If the user's Claude session has the `web-vitals-a11y-audit` skill installed, defer the Lighthouse / a11y deeps to it.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + canonical URL (e.g. `www.acme.app`)
> - `«PROD_URL»` — full production URL (typically `https://«DOMAIN»`)
> - `«DEPLOY»` — hosting platform (e.g. Vercel)
> - `«OBSERVABILITY»` — error monitoring stack (e.g. Sentry)
> - `«ANALYTICS_TOOL»` — product analytics (e.g. GA4, PostHog)
> - `«SESSION_REPLAY_TOOL»` — session replay (e.g. Microsoft Clarity, FullStory)
> - `«PAYMENTS»` — payments provider (e.g. Stripe)
> - `«EMAIL_PROVIDER»` — transactional email (e.g. Resend)
> - `«HEALTH_ENDPOINT»` — health route (e.g. `/api/health`)
> - `«CORE_PAGES»` — the 4–6 pages exercised in the smoke test (homepage, pricing, primary CTA flow, contact)
> - `«EMAIL_TEMPLATE_COUNT»` — number of transactional templates in scope (from `RUNBOOK_EMAILS_WORKFLOW.md`)

---

Run this against the production deploy (or a final pre-prod preview that mirrors prod env vars) **before** flipping payments to live mode and **before** the first launch-channel post (per the LAUNCH_GTM manager's order of operations).

Each box has three things:

- **Status** — what's wired in code (✓), partially wired (⚠), or not applicable (n/a).
- **Run this** — exact command or click-path to verify.
- **Expected** — what passing looks like.

---

## 1 · Security headers

Status: **wired** in your framework's headers config (verify the file).

```bash
curl -sI «PROD_URL» | grep -iE "x-frame|x-content|referrer|strict-transport|permissions"
```

Expected output (order may vary):

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

If any are missing in the prod response, your hosting edge stripped them — check the platform's headers override; nothing in code needs to change.

Defers full security policy review to `SECURITY_DEEP.md`.

---

## 2 · SEO / discoverability

### 2.1 — `/robots.txt` resolves and allows crawling

```bash
curl -s «PROD_URL»/robots.txt
```

Expected: 200 OK, body lists `Allow: /`, `Disallow: /admin` (and other private routes), and points sitemap to `«PROD_URL»/sitemap.xml`.

### 2.2 — `/sitemap.xml` resolves and includes core pages

```bash
curl -s «PROD_URL»/sitemap.xml | grep -oE "<loc>[^<]+</loc>" | head -20
```

Expected to include at minimum the `«CORE_PAGES»` + any CMS-driven content (blog posts, public artefacts, profile pages, etc.).

### 2.3 — Canonical link on `/`

```bash
curl -s «PROD_URL»/ | grep -oE '<link[^>]+canonical[^>]+>'
```

Expected: `<link rel="canonical" href="«PROD_URL»/">`.

### 2.4 — Locale variants + hreflang (if multilingual)

If the app supports `«LOCALES»`, repeat the canonical check per locale and verify `hreflang` tags reference each variant. If the app is single-locale, mark this **n/a**.

### 2.5 — OG image renders for the canonical URLs

Code is typically wired; the manual visual check is the actual ask:

| URL                                    | OG handler                                              |
| -------------------------------------- | ------------------------------------------------------- |
| `«PROD_URL»/`                          | the default OG handler                                  |
| `«PROD_URL»/«CORE_PAGE_2»`             | default (or CMS metadata fall-through)                  |
| `«PROD_URL»/«CORE_PAGE_3»`             | default                                                 |
| `«PROD_URL»/«PUBLIC_ARTEFACT_SAMPLE»`  | the per-artefact OG handler (e.g. `/api/og/profile/[slug]`) |

Paste each URL into a fresh chat app DM (to yourself), wait for unfurl, screenshot. Attach screenshots to the launch issue as evidence.

If a per-artefact OG doesn't render, the most common cause is the edge runtime can't reach the API — confirm the relevant env var points at a publicly-reachable instance.

---

## 3 · Observability

### 3.1 — Error events tagged with deploy SHA

`«OBSERVABILITY»` init code should read the deploy commit SHA (typically exposed via the hosting platform's env vars) on both server and client.

After the next prod deploy:

1. `«OBSERVABILITY»` → **Releases** — confirm a release matching the latest `git rev-parse --short HEAD` exists with source maps attached.
2. Throw a deliberate test error (e.g. visit an endpoint with intentionally invalid params) and verify the resulting event is tagged with the deploy SHA.

### 3.2 — User context fires after login

Auth provider should fire user-id-only context (no PII like email or display name) on login state change; `null` on logout.

To verify:

1. Log into prod from incognito.
2. Trigger a deliberate captured error.
3. `«OBSERVABILITY»` → newest issue → expect the user field populated with the auth UID.

### 3.3 — `«HEALTH_ENDPOINT»` returns 200 with `db: "connected"`

```bash
curl -s «PROD_URL»«HEALTH_ENDPOINT» | python3 -m json.tool
```

Expected:

```json
{
  "status": "healthy",
  "version": "1.x.x",
  "uptime": <number>,
  "db": "connected",
  "dbConfigured": true,
  "timestamp": "«DATE»T..."
}
```

> **Known limitation pattern:** many health routes return HTTP 200 even when DB is disconnected — only the JSON `db` field flips. A `curl -fsS` won't catch that. If your health endpoint behaves this way, document it as a follow-up — not a launch blocker.

### 3.4 — `«ANALYTICS_TOOL»` DebugView / realtime shows events

Verify the analytics client mounts only after consent is accepted (cookie consent gating). Required env vars exist in the **Production** scope under the correct naming convention (`NEXT_PUBLIC_*` for client-exposed vars in Next.js, etc.).

To verify:

1. Open the analytics tool's DebugView / realtime view.
2. In a separate browser, open prod in **incognito** with the analytics debugger enabled.
3. Accept cookies (the consent banner state must be "accepted" — analytics gating depends on this).
4. Click around. Expect `page_view` + any custom events the core flow emits.

### 3.5 — `«SESSION_REPLAY_TOOL»` dashboard shows recent sessions

`«SESSION_REPLAY_TOOL»` mounts only if its env var is set AND consent is accepted.

Verify: open the session-replay dashboard 5–10 min after browsing prod with consent accepted. Expect at least one session with the right URL.

Defers full observability rollout to `OBSERVABILITY.md`.

---

## 4 · Performance baseline

### 4.1 — Lighthouse mobile (signed out): perf ≥ 75, a11y ≥ 90, SEO ≥ 90

Run from a fresh Chrome incognito profile:

1. Open prod homepage.
2. DevTools → Lighthouse → **Mobile** + **Performance, Accessibility, Best Practices, SEO**.
3. Run.

Save the report HTML and attach to the launch issue. Defers deeper audits to the `web-vitals-a11y-audit` skill when available.

### 4.2 — LCP ≤ 2.5 s on `/`

Same Lighthouse run captures this. A sustained warm-cache LCP under 2.5 s on a mid-tier 4G simulation is the bar.

### 4.3 — No console errors on the core pages

In the same incognito session, hit each of `«CORE_PAGES»`. DevTools → Console — expect zero red errors. Yellow warnings (deprecation, dev-mode) are fine.

---

## 5 · Operational

### 5.1 — Dead-link crawl

```bash
«QUALITY_CMD:crawl» «PROD_URL»
```

(Or whatever the project's crawler script is.) BFS over same-origin links; exits non-zero on any non-2xx.

If the site has many pages (e.g. with a blog), bump the max-pages env var.

Expected: exit 0 + summary line ending `0 dead links`.

### 5.2 — Incident runbook pinned

The repo's incident runbook (`docs/INCIDENTS.md`, derived from the `INCIDENTS` runbook template in AI/) is referenced from `README.md`. The pinning is purely an ops action.

Pin the URL in your on-call communication surface (Slack channel, Notion page, wherever your incident response lives). Without this, the first 2 a.m. webhook outage is a treasure hunt.

---

## 6 · Email QA (deferred)

The per-template email QA matrix has its own runbook — see **`EMAIL_QA_MATRIX.md`**. That runbook covers each of the `«EMAIL_TEMPLATE_COUNT»` templates with: template name · trigger · test entry-point command · per-inbox-vendor render checklist · status.

Run that matrix end-to-end as part of this pre-launch gate; check the box below only when every template is green.

- [ ] Email QA matrix run end-to-end (see `EMAIL_QA_MATRIX.md`)

---

## Acceptance

The launch is gateable when:

- [ ] Every box above is either ticked OR has a follow-up issue filed with a non-launch-blocker label.
- [ ] Lighthouse report + the OG screenshots are attached to the launch issue.
- [ ] The error-monitoring alert rule covering the launch event class is live (safety net catches anything the observability checks miss).
- [ ] `EMAIL_QA_MATRIX.md` is green.

After this is green, the payments-flip gate (`STRIPE_TEST_CHECKLIST.md`) and the first founder transaction are the next steps, then the GTM motion in the LAUNCH_GTM manager is unblocked.

---

_Defers security baseline to `SECURITY_DEEP.md`; defers observability rollout to `OBSERVABILITY.md`; defers email QA detail to `EMAIL_QA_MATRIX.md`; defers payments-specific QA to `STRIPE_TEST_CHECKLIST.md`; defers post-launch smoke to `SMOKE_TEST.md`; defers GTM order-of-ops to the LAUNCH_GTM manager. This doc is the source-of-truth for the engineering launch gate._
