# Incident Runbook

`«PROJECT»` pre-launch + early-MVP runbook. A handful of likely
incidents, ordered by frequency. Each section is short on purpose — when
you're paged at 3am you want a paste-and-run checklist, not prose.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_INCIDENTS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/RUNBOOK.md` and localize the items below.
>
> **Reusability:** template-ready — the incident-triage structure (symptom → triage commands → causes table → manual recovery) is reusable; the stack, commands, and incident list are «placeholders». Localize the tokens below per repo.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + canonical domain (used in `curl …«HEALTH_ENDPOINT»`, OAuth handler URL).
> - `«HEALTH_ENDPOINT»` — health-check path (e.g. `/api/health`).
> - `«OBSERVABILITY»` — error monitor + log source (e.g. Sentry + a deploy-platform log CLI).
> - `«DEPLOY»` — hosting/runtime + CLI (e.g. Vercel; `«DEPLOY» logs --since 30m`).
> - `«PAYMENTS»` — provider + CLI/envs (e.g. Stripe; `«PAYMENTS» events list --limit 5`, `«PAYMENTS_WEBHOOK_SECRET»`).
> - `«AUTH»` — identity provider + CLI (e.g. Firebase; `«AUTH» auth export`, secure-cookies flag).
> - `«DB_CMS»` — database + connection env + admin path (e.g. MongoDB Atlas, `«DB_URI»`, `«ADMIN_PATH»`).
> - `«AI_PROVIDER»` — model provider + env + models (e.g. OpenAI, `«AI_API_KEY»`, the model names in use).
> - `«INTEGRATIONS»` — integrations with their own failure modes (e.g. a chat integration: signing secret, bot token, `«SLASH_COMMAND»`).
> - `«INCIDENT_LIST»` — replace the incident sections below with the ones that match this product's stack.

**First two minutes of any incident:**

1. Open `«OBSERVABILITY»` and filter by the last 30 minutes. Note the issue title.
2. Open the `«DEPLOY»` dashboard, current deployment. Note the commit SHA.
3. `curl -fsS https://«DOMAIN»«HEALTH_ENDPOINT»` — is the basic
   pulse alive? If it 5xx's, you're in **`«DB_CMS»` timeout** territory
   (see the database-timeout incident).

If `«OBSERVABILITY»` shows a clear stack trace pointing at one file: jump to that
file's section below.

---

## #1 — `«PAYMENTS»` webhook fails / users not upgraded

**Symptom:** A user paid, the `«PAYMENTS»` dashboard shows the payment, but in
`«PROJECT»` their plan is still on the free tier.

**Triage**

```bash
# 1. Confirm webhook fired
«PAYMENTS» events list --limit 5
# Look for the checkout/payment-completed event for the user's email/customer
```

Check the `«PAYMENTS»` dashboard → Webhooks → recent deliveries.
Anything 4xx or 5xx is the lead.

```bash
# 2. Check runtime logs for the webhook route
«DEPLOY» logs --since 30m | grep -i 'payments\|webhook'
```

**Common causes**

| Symptom in logs                 | Likely cause                                                          | Fix                                       |
| ------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| `«Invalid signature»`           | `«PAYMENTS_WEBHOOK_SECRET»` rotated at the provider but not on host  | Update env var, redeploy                  |
| `«User not found»`              | User's customer id not linked yet                                    | Manually patch in `«ADMIN_PATH»`          |
| 200 in logs but plan unchanged  | Idempotent handler skipped — check the event-id dedup                | Inspect the user record's plan-expiry     |
| Timeout                         | `«DB_CMS»` cold-start exceeded the request budget                    | See the database-timeout incident         |
<!-- (one row per failure mode you've actually seen) -->

**Manual recovery (last resort)**

Go to `«ADMIN_PATH»` → Users → find the user → set their plan and
plan-expiry directly. Note the provider customer id in the audit
trail. File a ticket to figure out why the automated path failed.

---

## #2 — `«INTEGRATION»` bot returns 500 / `«SLASH_COMMAND»` slash command broken

**Symptom:** Workspace runs `«SLASH_COMMAND» help`, gets either no response or
"command failed."

**Triage**

```bash
# 1. Verify the slash-command endpoint is reachable
curl -fsS https://«DOMAIN»«COMMANDS_ROUTE» -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'token=ignore&command=«SLASH_COMMAND»&text=help'
# Expect 401 (signature missing) or a structured integration response.
# A 500 means the route itself is broken.

# 2. Look at runtime logs
«DEPLOY» logs --since 30m | grep -i 'integration\|signing\|signature'
```

**Common causes**

| Symptom                                        | Cause                                                                         | Fix                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `«Invalid signature»` on every request         | Signing-secret mismatch between the integration's app config and the host      | Re-copy the signing secret from the integration's app settings                          |
| `«not authed»` on bot calls                    | Bot token rotated/revoked                                                      | Reinstall the app in the workspace, copy a fresh token                                  |
| 200 returned but no message posted             | Post-message rate-limited or the response URL expired (~3s)                    | Ensure data-touching commands use the async pattern (defer first, do work, then post)   |
| URL verification failing on event subscription | Endpoint returning JSON instead of the `challenge` echo                        | Ensure the events route echoes `{ challenge }` for the verification handshake           |
<!-- (one row per failure mode) -->

**Manual recovery**

Reinstall the integration's app in the affected workspace. Confirm the bot is
present in any channel you want it active in (it can't post in channels
it isn't a member of).

---

## #3 — `«AI_PROVIDER»` quota exceeded / 429 / model deprecated

**Symptom:** `«AI-backed features»` return errors. UI shows a generic
"try again" toast.

**Triage**

```bash
# 1. Check the «AI_PROVIDER» dashboard usage
# «usage dashboard URL»  — current month's spend, hard limit

# 2. Look at error pattern
«DEPLOY» logs --since 1h | grep -iE 'ai|model|429|quota|rate.?limit'
```

**Common causes**

| Code                            | Cause                                                       | Fix                                                          |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| 429                             | Hit rate limit (per-minute or per-day)                      | Wait it out OR raise tier on the `«AI_PROVIDER»` dashboard   |
| 401                             | API key revoked/expired                                     | Rotate `«AI_API_KEY»`                                        |
| `«model_not_found»`             | The configured `«MODEL»` was deprecated                     | Update the model name in the AI service module(s)            |
| 500 + "context length exceeded" | Long input blew the context window                          | Trim input in the relevant service; add a length guard       |
<!-- (one row per failure mode) -->

**What the code already does (verify it's still working)**

- An AI rate limiter caps user-driven AI calls per user — protects
  against runaway spend
- Expensive results are cached by an input hash — re-runs with
  identical input are free
- AI enrichment is non-blocking: if it fails the user still completes
  the core flow, just without the AI output

If you discover the limiter isn't firing (e.g., serverless cold-start
resets), document and decide whether to add a Redis-backed limiter
(pre-launch: probably not worth it at low traffic).

---

## #4 — `«DB_CMS»` timeout / connection storm

**Symptom:** `«HEALTH_ENDPOINT»` 5xx's. Pages spin and never load.
`«OBSERVABILITY»` shows a server-selection / connection-timeout error.

**Triage**

```bash
# 1. DB provider dashboard → cluster status
# «DB dashboard URL»  — check for ongoing maintenance

# 2. Connection pool saturation?
«DEPLOY» logs --since 30m | grep -iE 'db|pool|connection'

# 3. Try a direct connection
«DB_CMS» shell "«DB_URI»" --eval 'ping'
```

**Common causes**

| Symptom                 | Cause                                                                                | Fix                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| All requests timing out | Free-tier cluster auto-paused                                                        | Visit dashboard, cluster wakes; redeploy not needed                                                          |
| Intermittent timeouts   | Pool exhaustion on cold-start (serverless creates a fresh client per invocation)    | Confirm the DB connection is cached/reused. If recurring, switch to a dedicated cluster                      |
| Network error           | IP allowlist drift (the host rotates outbound IPs)                                   | DB provider → Network Access → ensure outbound IPs are allowed (no static IPs on most serverless hosts)      |
| Authentication failure  | Connection-string user rotated                                                      | Rotate `«DB_URI»`                                                                                            |
<!-- (one row per failure mode) -->

**Manual recovery**

Restart the deployment from the `«DEPLOY»` dashboard. If the DB
provider is the problem, there's nothing to do but wait or escalate via support.

---

## #5 — User locked out / can't log in

**Symptom:** User reports "I get a 401 every time I try to log in" or
"the page reloads forever after I sign in."

**Triage** — get from the user:

1. Email
2. Login method (email, social provider, …)
3. Browser + version
4. Whether they cleared cookies recently
5. Screenshot of the error if any

```bash
# 1. Check «AUTH» admin — is the user record active?
«AUTH» auth export users.json
grep -A 1 'their.email@example.com' users.json

# 2. Check «DB_CMS» — does the user exist?
# «ADMIN_PATH» → Users → search by email or auth UID

# 3. Look for the failed login in the deploy logs
«DEPLOY» logs --since 30m | grep -i 'their.email\|401\|token'
```

**Common causes**

| Symptom                                     | Cause                                                                              | Fix                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 401 on the login route                      | Cookie not being set (browser blocking 3rd-party cookies, or secure-cookie mismatch) | Confirm the secure-cookies flag is enabled in production. Test in incognito + a second browser to rule out the browser.   |
| Infinite reload after login                 | Auth + app user records out of sync — app-side user missing                       | The bootstrap path auto-creates the app user on first visit; check it didn't fail. Manually create in `«ADMIN_PATH»`.     |
| "Account exists with different credentials" | User signed up with email/password, now trying social with the same email          | The auth provider needs account linking. Document the limitation; for now, ask the user to use the original method.       |
| Social login redirects to error             | OAuth provider's redirect URI changed                                             | Verify the provider config matches `https://«DOMAIN»«OAUTH_HANDLER_PATH»`                                         |
<!-- (one row per failure mode) -->

**Manual recovery**

1. Reset their password via the `«AUTH»` admin or have them
   use the "forgot password" flow.
2. If the app-side user is stale, delete it via `«ADMIN_PATH»` and let
   the bootstrap path recreate it on next login.
3. Last resort: have them sign up with a different email; merge
   accounts later if it matters.

---

## How to extend this runbook

When a real incident hits, after you've recovered:

1. Add a row to whichever section it belongs in (or a new section if
   it's a new class of incident).
2. Capture the exact symptom phrase you'd grep for.
3. Capture the exact command that proved the diagnosis.
4. Resist over-explaining — terse beats thorough at 3am.

Goal: every incident class on this page should be diagnosable in 60
seconds by someone who has never seen it before.

---

## Per-domain incident runbook (template)

Use this template when an **entire failure domain** needs its own focused runbook beyond the paste-and-run sections above. Typical candidates: `«PAYMENTS»` webhooks, `«AUTH»` failures, `«AI_PROVIDER»` outages, `«DB_CMS»` connection storms, `«INTEGRATIONS»` signing-secret drift. Each per-domain runbook should be terse, observable-first, and pair 1:1 with the alert rules in `«OBSERVABILITY»`.

### Section A — Scope + entry points

State the domain in one line + the handlers / routes / surfaces it covers. Reference the `tags.domain` value used in `«OBSERVABILITY»` so this doc and the alert rules align.

```
Domain: «domain» (e.g. payments / auth / ai-calls / db)
Entry points: «route or handler list» (e.g. POST «WEBHOOK_PATH», «LOGIN_PATH», cron «CRON_PATH»)
Observability tag: domain:«domain»
```

### Section B — Alert rules (configure in `«OBSERVABILITY»`)

| Alert | Filter | Threshold | Notify |
|-------|--------|-----------|--------|
| «one-line name» | `domain:«domain»` + `«sub-tag»` + «HTTP class» | «N in «window»» | «channel / on-call» |
| «invalid signature» | message match `…invalid signature…` | ≥ 1 | instant |
| «creds not resolved» | `step:creds-not-resolved` | ≥ 1 | instant |

**Per-actor context:** ensure events carry the tags that make a single event diagnosable without code-spelunking — typically an actor id (creator, user, tenant), a session/request hash (never a raw token), and the upstream provider's event id.

### Section C — Triage checklist

A short numbered list of what to do **in order**. Each step names the surface you check (provider dashboard, app logs, DB collection) and the exact filter or grep.

```
1. Identify the provider/branch from the «OBSERVABILITY» tag (e.g. «sub-tag»).
2. Find the affected actor — «DB_CMS» query by «id field» / provider event metadata.
3. Inspect the idempotency ledger — was this event id already marked processed?
4. Read handler logs at the same timestamp — distinguish 4xx (rejected) from 5xx (retry storm risk).
5. Open the provider dashboard → delivery log → replay only after the fix lands.
```

### Section D — Common causes table

One row per failure mode **you've actually seen**. Resist adding hypothetical rows — false familiarity makes 3am triage worse.

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `«error string a reviewer would grep for»` | «one-line cause» | «one-line action» |
| `«…»` | «…» | «…» |
| Idempotent replay | Benign duplicate (already-processed event id) | 200 `{ idempotent: true }` — no action |

### Section E — Manual smoke (non-production only)

A 2-3 step procedure to **deliberately trigger the alert path** so on-call can confirm the alert wiring works without waiting for a real incident.

```
1. POST a tampered/expired payload to «ENDPOINT» → expect «4xx» + warning event.
2. Confirm «OBSERVABILITY» fires the matching alert (or surfaces the issue with the expected tags).
3. Verify the idempotency ledger did NOT mark this as processed.
```

**Never** replay production events without verifying idempotency first.

### Section F — Code references

Pin the handlers + idempotency helpers + the unit specs that exercise the failure paths. These paths are the first thing a fresh on-call clicks into.

- Handler(s): `«path/to/handler/route.ts»`
- Idempotency: `«markEventProcessed»` / `«isEventProcessed»` in `«path/to/idempotency»`
- Tagging on failure: handlers tag `domain:«domain»` + `step:«…»` so Section B's filters resolve
- Unit coverage: `«path/to/spec.ts»`

### Section G — Acceptance (the checklist that closes the runbook ticket)

- [ ] Runbook + code tags documented (this section)
- [ ] Failing-event smoke documented (Section E)
- [ ] Alert rules created in `«OBSERVABILITY»` UI (Section B — **ops task**)
- [ ] On-call dry-run: find the affected actor from a single event in under 60 seconds

> Example domains where this template has paid back: webhook failures (`«PAYMENTS»` signing / creds rotation), auth failures (cookie / OAuth redirect drift), AI calls (`«AI_PROVIDER»` 429 / model deprecation), DB timeouts (pool exhaustion). Use the same shape for each so on-call only learns it once.
