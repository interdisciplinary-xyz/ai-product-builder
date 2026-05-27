# Payments lifecycle — setup → verify → live flip

Umbrella runbook for the **entire** payment-processor lifecycle. Three phases, in order:

- **§1 Setup** — first-time dashboard/click playbook + env/webhook bootstrap.
- **§2 Test-mode verify** — what gets exercised before any release that touches payments.
- **§3 Live flip + first self-transaction** — the founder $-test that closes the launch milestone.

> **Pricing decisions live elsewhere.** Tier shape, price, anchor, trial policy, currency, metering — see [`RUNBOOK_PRICING_STRATEGY.md`](./RUNBOOK_PRICING_STRATEGY.md) "Pricing decisions matrix". This runbook only mechanizes what's decided there.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PAYMENTS_LIFECYCLE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/PAYMENTS_LIFECYCLE.md` and localize the items below.
>
> **Reusability:** template-ready — the three-phase lifecycle (setup → test verify → live flip with founder $-test) is generic across payment processors. The dashboard-click micro-steps differ per `«PAYMENTS»`, but the structure, the env-var hygiene, the webhook-event minimum set, the idempotency check, the signature-failure 400, and the "$5 self-test as the deliverable, not the deploy" framing are portable.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product being paid for.
> - `«PAYMENTS»` — payment processor (e.g. Stripe, Paddle, Lemon Squeezy) + its CLI name (`«PAYMENTS_CLI»`).
> - `«PAYMENTS_SECRET_KEY»` / `«PAYMENTS_PUBLISHABLE_KEY»` / `«PAYMENTS_WEBHOOK_SECRET»` — the env-var names.
> - `«PRICE_TIER_*»` — env-var names per tier × cadence (e.g. `«PRICE_TIER_PRO_MONTHLY»`, `«PRICE_TIER_PRO_YEARLY»`, `«PRICE_TIER_TEAM_MONTHLY»`). The *values* are decided in PRICING_STRATEGY.
> - `«WEBHOOK_PATH»` — webhook route path (e.g. `/api/payments/webhook`).
> - `«CHECKOUT_PATH»` — checkout-session route path.
> - `«PORTAL_PATH»` — billing-portal route path.
> - `«PAYMENTS_TEST_CARD_OK»` / `«PAYMENTS_TEST_CARD_FAIL»` — provider's standard test cards.
> - `«WEBHOOK_EVENTS»` — minimum event set the webhook handler branches on (typically: checkout-completed, subscription-updated, subscription-deleted, invoice-payment-failed).
> - `«OBSERVABILITY»` — error monitor receiving signature failures, slow-handler warnings, and resolve-tier errors (with `domain: 'payments'`).
> - `«ANALYTICS_PRIMARY»` — analytics vendor receiving `subscription_*` events (see OBSERVABILITY runbook).
> - `«FOUNDER_TEST_AMOUNT»` — the smallest defensible price point for the founder self-test (typically the entry tier's monthly price, e.g. $5).

---

## §1 — Setup (first-time playbook)

> **Audience:** founder doing the initial `«PAYMENTS»` configuration.
> **Time:** ~30–60 min the first time; mostly dashboard clicks.

Everything in §1 happens in **sandbox / test mode**. Sandbox is reversible — nothing here touches real money or live customers.

### Step 1.1 — Create products + prices

Per tier × cadence decided in [`RUNBOOK_PRICING_STRATEGY.md`](./RUNBOOK_PRICING_STRATEGY.md) "Pricing decisions matrix":

1. In the `«PAYMENTS»` dashboard → Product catalogue → **Add product**.
2. Fill in product name, description, statement descriptor (≤22 chars), tax behavior (per PRICING_STRATEGY decision).
3. Add a price per cadence under that product:
   - **Default cadence price** (e.g. monthly): standard pricing, `«PRICE_TIER_*_MONTHLY»` value, recurring, set as default.
   - **Upsell cadence price** (e.g. yearly): same product, second price, non-default.
4. **Copy each `price_…` ID** — these become the `«PRICE_TIER_*»` env vars.

Repeat per tier. For seat-based tiers, use the provider's per-unit / quantity-based pricing with a `min_quantity` enforced at checkout creation.

> **Anchor framing lives in the UI, not in the processor.** The pricing card shows the anchor (e.g. monthly→yearly delta with "save N%"); the processor only knows the prices.

### Step 1.2 — Configure the webhook endpoint

1. Dashboard → Developers → Webhooks → **Add endpoint**.
2. Endpoint URL:
   - **Local testing:** use the provider CLI to forward to localhost (`«PAYMENTS_CLI» listen --forward-to localhost:«PORT»«WEBHOOK_PATH»`). CLI prints the signing secret on startup.
   - **Production:** `https://«DOMAIN»«WEBHOOK_PATH»`.
3. **Events to send** — exactly the minimum set the handler branches on (`«WEBHOOK_EVENTS»»). Common set:
   - `«checkout.session.completed»`
   - `«customer.subscription.updated»`
   - `«customer.subscription.deleted»`
   - `«invoice.payment_failed»`
   - (add `«price.created»` / `«price.updated»` / `«price.deleted»` if the CMS plan records sync from the processor)
4. **Capture the `«PAYMENTS_WEBHOOK_SECRET»` signing secret** — different in test vs live.

### Step 1.3 — Configure the customer billing portal

1. Dashboard → Settings → Billing → Customer portal.
2. Enable:
   - ✅ Update payment method
   - ✅ View invoice history
   - ✅ Cancel subscriptions (allow direct cancel — important for trust)
3. Disable / leave off:
   - ❌ Switch plans (avoid; force users back to the pricing page for upsell context)
   - ❌ Update billing details that need custom required fields at v1
4. **Cancellation policy:** at end of billing period (don't surprise users with immediate revocation). Reason collection: optional (helps churn analysis).
5. **Branding:** upload logo, set primary brand color. Cosmetic but worth 5 minutes.

### Step 1.4 — Capture sandbox API keys

Dashboard → Developers → API keys. Copy:

- **Publishable key** — `pk_test_…` (typically unused server-side; save anyway).
- **Secret key** — `sk_test_…` → this is the `«PAYMENTS_SECRET_KEY»` for sandbox.

### Step 1.5 — Wire env vars

**Local dev (`.env.local`):**

```
«PAYMENTS_SECRET_KEY»=sk_test_<from Step 1.4>
«PRICE_TIER_*»=price_<each ID from Step 1.1>
«PAYMENTS_WEBHOOK_SECRET»=whsec_<from Step 1.2 — CLI value when running locally>
```

> ⚠️ Do NOT commit `.env.local`. Per `«.claude/CLAUDE.md»`: never modify `.env`, `.env.local`, or `.env.example` files via tooling.

**Deploy platform `«DEPLOY»`** → Settings → Environment Variables → **Preview** scope:

| Name                       | Value (Preview)                                  |
| -------------------------- | ------------------------------------------------ |
| `«PAYMENTS_SECRET_KEY»`    | `sk_test_…`                                      |
| `«PRICE_TIER_*»`           | `price_…` (one per tier × cadence)               |
| `«PAYMENTS_WEBHOOK_SECRET»`| `whsec_…` (the production-URL endpoint secret)   |

**Production scope** stays empty until §3 (live flip). Empty values are fine — the code defensively returns 503 when `«PAYMENTS_SECRET_KEY»` is unset.

### Step 1.6 — Sync the CMS plan records (if pricing is CMS-driven)

If `«PROJECT»» reads tier ↔ price-ID resolution from a CMS Plans collection (the webhook uses this to map a processor `«price_id»» → app-tier), patch each paid Plan's `«priceIdField»` to the new sandbox `«price_id»». This is belt-and-braces: env-var fallback + CMS source. Drift between the two is a `«OBSERVABILITY»» event with `domain: 'payments'».

### Step 1.7 — Configure error-monitor alerting on `«WEBHOOK_PATH»` (do BEFORE §3)

If a webhook 5xxs in production, the provider retries for ~24 h then gives up. The user has paid but their account state is wrong; you only learn from a support ticket. Wire alerts **before** flipping the live-mode switch.

The webhook handler already calls `«OBSERVABILITY».captureException` / `captureMessage` tagged with `domain: 'payments'` + `route: webhook`. What's missing is the routing rule:

1. `«OBSERVABILITY»` → Alerts → **Create Alert** → **Issues**.
2. **When:** a new event is captured.
3. **If all of:** `domain = payments`, `route = webhook`, level ∈ {error, fatal, warning}.
4. **Then:** notify the founder. **Throttle:** once per issue, max 1 notification per hour — webhook errors come in bursts during a processor outage and you don't want to be DOSed by your own alert.

Optional second rule for the slow-handler warning (the handler emits `level: warning` tagged `step: slow-handler` when a single delivery takes ≥5 s; the provider times out at 10 s):

- **If:** `type = slow-handler` → email-only, lower priority. Slowness is a leading indicator, not a fire.

**Smoke-verify both:** trigger a deliberate failure (`«PAYMENTS_CLI» trigger invoice.payment_failed` or send a malformed signature header). Confirm the event lands in `«OBSERVABILITY»` AND the notification arrives, within a minute.

---

## §2 — Test-mode verification

End-to-end smoke for the payments path. Run this **before tagging any release that touches payments** and again on the production preview deploy.

The webhook handler at `«WEBHOOK_PATH»` is **signature-verified**, **idempotent at the user-record level**, and emits N `«ANALYTICS_PRIMARY»» events (e.g. `subscription_started`, `subscription_renewed`, `subscription_canceled`) via the Measurement Protocol — all of those are exercised below.

Full pass: ~30 minutes.

### Prereqs (one-time)

- [ ] `«PAYMENTS_CLI»» installed + logged in (test mode).
- [ ] `.env.local» populated with **test-mode** `«PAYMENTS_SECRET_KEY»`, every `«PRICE_TIER_*»`, `«PAYMENTS_WEBHOOK_SECRET»».
- [ ] Dev server running on `«PORT»» (and any sibling brand on its own pinned port if multi-brand).
- [ ] Dev DB seeded with at least one test user.
- [ ] **Analytics DebugView open** in another tab to watch `subscription_*` events land.

### Forward webhooks to localhost

```bash
«PAYMENTS_CLI» listen --forward-to localhost:«PORT»«WEBHOOK_PATH»
```

Copy the `whsec_…» it prints into `.env.local` as `«PAYMENTS_WEBHOOK_SECRET»», restart the dev server. Keep this terminal open for the whole session.

### Scenario 1 — Free → paid upgrade (happy path)

Test card: `«PAYMENTS_TEST_CARD_OK»` · any future date · any CVC.

- [ ] Sign in to a fresh free-tier account.
- [ ] Click upgrade CTA → land on processor checkout.
- [ ] Complete checkout with the test card.
- [ ] Verify in CLI terminal: `«checkout.session.completed»» → forwarded → returned 200.
- [ ] Verify `«customer.subscription.created»» → forwarded → 200.
- [ ] In DB, confirm the user record:
  - [ ] `plan` flipped to the purchased tier.
  - [ ] `«customerIdField»» populated.
  - [ ] `«subscriptionIdField»» populated.
  - [ ] `«planExpiresAt»» ≈ 1 cadence from now.
- [ ] Inbox: subscription-confirmed email arrived.
- [ ] **Analytics DebugView:** `subscription_started` event with `tier`, `method=checkout`, `user_id`.
- [ ] App UI shows tier-gated features unlocked.

### Scenario 2 — Renewal rolls the period forward

Use the CLI to advance time:

```bash
«PAYMENTS_CLI» test_clocks list
«PAYMENTS_CLI» test_clocks advance <clock_id> --frozen-time=$(date -v+32d +%s)
```

(or send a test `customer.subscription.updated» webhook from the dashboard if no test-clock was created at checkout)

- [ ] `«customer.subscription.updated»» fires with `previous_attributes.items[0].current_period_end` ≠ new period end.
- [ ] User record `«planExpiresAt»» rolls forward.
- [ ] **DebugView:** `subscription_renewed` fires (correct tier).
- [ ] **No duplicate** `subscription_started`.
- [ ] **No duplicate** confirmation email.

### Scenario 3 — User cancels via billing portal

- [ ] Sign in as the paid user.
- [ ] Click manage-subscription → land on processor portal.
- [ ] Click cancel → confirm.
- [ ] CLI shows `«customer.subscription.updated»» (status → canceled at period end), then eventually `«customer.subscription.deleted»».
- [ ] Until period end, user keeps tier access (verify in app UI).
- [ ] At period end (`«customer.subscription.deleted»»):
  - [ ] User record `plan` flips back to free.
  - [ ] `«subscriptionIdField»» cleared.
  - [ ] `«planExpiresAt»» cleared.
- [ ] **DebugView:** `subscription_canceled` event with `reason=user`.

### Scenario 4 — Payment failure (involuntary churn)

Test card: `«PAYMENTS_TEST_CARD_FAIL»` (succeeds at first then fails on renewal), or simulate:

```bash
«PAYMENTS_CLI» trigger invoice.payment_failed
```

- [ ] `«invoice.payment_failed»» reaches webhook → 200.
- [ ] Payment-failed email arrives at the customer inbox.
- [ ] **DebugView:** `subscription_canceled` with `reason=payment_failed`. (Note: this fires *immediately* on the failed-invoice event — provider dunning continues in the background; if dunning succeeds on retry, no compensating event is emitted by us today. Document this as a known limitation; the count drift is acceptable at low scale.)

### Scenario 5 — Idempotency (replay events)

```bash
«PAYMENTS_CLI» events resend <evt_id>
```

- [ ] Replayed event reaches webhook → 200.
- [ ] User record is **unchanged** (no second tier upgrade, no second `«planExpiresAt»» shift).
- [ ] **No duplicate** confirmation email.
- [ ] **DebugView:** a duplicate `subscription_started` *does* land — analytics is not deduped server-side. Documented as known.

### Scenario 6 — Webhook signature mismatch

```bash
curl -X POST "http://localhost:«PORT»«WEBHOOK_PATH»" \
  -H 'Content-Type: application/json' \
  -H '«signature-header»: t=1,v1=deadbeef' \
  -d '{"type":"«any-event»"}'
```

- [ ] Returns HTTP 400 with `{ "error": "Invalid webhook signature" }`.
- [ ] **No DB writes.**
- [ ] `«OBSERVABILITY»» captured the failure tagged `domain=payments, route=webhook, type=signature`.

### Scenario 7 — Mobile checkout (real device)

Run on an actual iPhone (Safari) + Android (Chrome):

- [ ] Apple Pay button appears on iPhone Safari, completes successfully.
- [ ] Browser-back during checkout returns the user to a sane app state (no broken "pending upgrade" spinner).
- [ ] Slow-3G (DevTools throttle): submit button shows a clear loading state to prevent double-clicks → no double charges.

### When something fails in §2

The most likely failure modes:

- **`Invalid signature` on every request** → `«PAYMENTS_WEBHOOK_SECRET»` rotated in the dashboard but not in `.env.local`.
- **Plan not upgraded but webhook 200'd** → check `session.metadata.userId` is being set on checkout (look for the `client_reference_id` fallback in the route handler).
- **`subscription_renewed` not firing despite period rolling** → the `previous_attributes.items[0].current_period_end` lookup may have changed shape on a `«PAYMENTS»` API-version bump. Check the CLI's `--api-version` matches the dashboard.

---

## §3 — Live flip + first founder transaction

> **Anti-pattern:** flipping live keys without doing a `«FOUNDER_TEST_AMOUNT»» test transaction *yourself first*.
>
> **The test isn't optional — the test IS the deliverable.** "Deployed live mode" is not the milestone. "Founder transacted $«FOUNDER_TEST_AMOUNT»» on a real card, refunded, and captured the evidence" is the milestone.

> **Time budget:** ~30 min if everything goes right. ~90 min if you chase down a mode mismatch.
>
> **Prerequisite:** §2 already verified end-to-end on the preview deploy.

### Step 3.1 — Dashboard preparation in live mode (~10 min)

Toggle dashboard from Test → Live. Repeat Steps **1.1**, **1.2**, **1.3** in live mode:

- [ ] Create the same products + prices (live `price_…» IDs — these are different from sandbox).
- [ ] Configure the customer portal (same options as sandbox).
- [ ] Add the live webhook endpoint pointing at `https://«DOMAIN»«WEBHOOK_PATH»» with the same `«WEBHOOK_EVENTS»» set.
- [ ] **Capture the new live `whsec_…» signing secret** — different from test mode.
- [ ] Capture the live API keys (`sk_live_…», `pk_live_…»).

> **Live activation is a 1–2 day process.** The provider runs business-details / bank-account / identity verification in the background. Don't start §3 until activation is complete.

### Step 3.2 — Env vars on `«DEPLOY»» (~5 min)

In `«DEPLOY»» → Settings → Environment Variables → **Production**:

- [ ] `«PAYMENTS_SECRET_KEY»` = `sk_live_…»
- [ ] `«PAYMENTS_WEBHOOK_SECRET»` = `whsec_…» (live, from Step 3.1)
- [ ] `«PRICE_TIER_*»` = `price_…» (live, one per tier × cadence)

> **Anti-pattern: mode crossing.** If `«PAYMENTS_SECRET_KEY»` is `sk_live_…` but a `«PRICE_TIER_*»` is a test-mode `price_…`, the error monitor fires immediately on first checkout. Verify prefixes match: live keys + live price IDs, not crossed.

### Step 3.3 — Update CMS plan records to live price IDs (~10 min)

If pricing is CMS-driven, repeat Step 1.6 with live `price_…» values. Why this matters: if the live price IDs aren't in the CMS, the webhook falls back to env-var matching with a warning, and a future CMS edit could silently downgrade a paid customer. Belt-and-braces: set both env AND CMS.

### Step 3.4 — Deploy + verify keys are set (~2 min)

```bash
curl https://«DOMAIN»/api/health
# expect HTTP 200, ok=true
```

If health passes but checkout fails in Step 3.5, check deploy logs for the key-shape guard error (`«PAYMENTS_SECRET_KEY» is missing or malformed`). That means the env var didn't actually save.

### Step 3.5 — First founder transaction (~10 min)

> **You are now the first paying customer.** This is the launch-milestone closing condition.

- [ ] Open `https://«DOMAIN»/pricing` in a fresh incognito window (no logged-in session).
- [ ] Click the entry-tier upgrade CTA.
- [ ] **Use a real card (your own).** Live mode rejects test cards.
- [ ] Capture evidence:
  - [ ] Provider payment-intent ID.
  - [ ] Provider customer ID.
  - [ ] Provider subscription ID.
  - [ ] Time from "click pay" to "redirected to app" (target: < 8s).
  - [ ] Screenshot of the provider dashboard showing the live `«FOUNDER_TEST_AMOUNT»» payment.
  - [ ] Screenshot of the billing tab showing the new plan + expiry + "Manage subscription".
  - [ ] Screenshot of the customer portal "Cancel" button visible.

### Step 3.6 — Verify the webhook actually fired (~3 min)

- [ ] Provider dashboard → Webhooks → click the live endpoint → **Recent deliveries**.
- [ ] Confirm `«checkout.session.completed»» shows 200 OK for your transaction.
- [ ] Confirm `«customer.subscription.created»» shows 200 OK.
- [ ] In `«OBSERVABILITY»», search for issues created in the last hour with `domain:payments` — there should be **none** for this test.

If there ARE error-monitor issues from the founder transaction, **STOP**. The flip isn't done. Triage the [`RUNBOOK_INCIDENTS.md`](./RUNBOOK_INCIDENTS.md) flow first, then redo Step 3.5 with a refund.

### Step 3.7 — Refund the test transaction (~2 min)

> Founder gets the money back; product keeps the verification evidence.

- [ ] Provider → Payments → click the founder transaction → Refund (full amount).
- [ ] Provider → Subscriptions → click the founder subscription → Cancel immediately.
- [ ] Verify the cancellation webhook fires (`«customer.subscription.deleted»» 200 OK).
- [ ] Verify in the admin / DB that the founder user is back on `plan: 'free'`.

### Step 3.8 — Close the milestone

- [ ] Record the live-mode evidence under the active release/launch doc.
- [ ] Flip the relevant entry-criterion (typically code-freeze / launch gate) to satisfied. See [`RUNBOOK_RELEASE_MANAGER.md`](./RUNBOOK_RELEASE_MANAGER.md).

---

## If something breaks at any step

| Symptom                                                                  | Most likely cause                                                                              | Fix                                                                                                                |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Checkout 500s with `«PAYMENTS_SECRET_KEY» missing or malformed`          | env var not set, or wrong prefix (test vs live)                                                | Re-check `«DEPLOY»» env, ensure `sk_live_…» not `sk_test_…»                                                        |
| Checkout 503 `«PAYMENTS»» price ID is not configured for this plan`      | CMS Plan has no `«priceIdField»` AND no env-var fallback                                       | Step 1.6 / 3.3 — patch the CMS, OR set the env fallback                                                            |
| Webhook delivery shows 401                                               | `«PAYMENTS_WEBHOOK_SECRET»» mismatch                                                           | Re-copy from the dashboard (right mode), update `«DEPLOY»» env, redeploy                                           |
| Webhook delivery shows 500 with `step: resolve-paid-tier»                | Live price IDs not in CMS Plans                                                                | Step 3.3 — add live price IDs                                                                                      |
| Checkout completes but app account still shows free                      | Webhook didn't fire, OR fired but errored                                                      | Check provider deliveries + `«OBSERVABILITY»»                                                                      |
| Customer Portal shows nothing                                            | `«customerIdField»` not saved on user                                                          | Check `«customer.subscription.updated»» handler ran on initial checkout                                            |
| User redirect from processor broken                                      | `successUrl` / `cancelUrl` config                                                              | Verify checkout-session params in `«CHECKOUT_PATH»` use the right `BASE_URL»                                       |

## What this runbook does NOT cover

- Migrating existing test-mode customers to live mode (intentionally — delete them, don't migrate).
- Setting up Apple Pay / Google Pay domain verification for live mode (do separately if mobile checkout shows the buttons missing — provider → Settings → Payment methods → verify domain).
- Tax handling — the provider's tax engine setup is a separate doc, deferred until first non-domestic customer or a meaningful MRR threshold.
- Compliance posture (PSD2 / KYC / payment-institution boundary) — see [`RUNBOOK_PAYMENTS_COMPLIANCE.md`](./RUNBOOK_PAYMENTS_COMPLIANCE.md).
- Security posture (webhook signature verification details, secret rotation) — see [`SECURITY_MODEL.md`](./SECURITY_MODEL.md).

## Cross-references

- [`RUNBOOK_PRICING_STRATEGY.md`](./RUNBOOK_PRICING_STRATEGY.md) — pricing decisions matrix (the *why* behind the prices created in §1.1).
- [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) — webhook signature verification, `«PAYMENTS_WEBHOOK_SECRET»» rotation, key-shape guards.
- [`RUNBOOK_PAYMENTS_COMPLIANCE.md`](./RUNBOOK_PAYMENTS_COMPLIANCE.md) — PSD2 / KYC / payment-institution boundary.
- [`RUNBOOK_OBSERVABILITY.md`](./RUNBOOK_OBSERVABILITY.md) — analytics events emitted by the webhook + the `domain: 'payments'» tag taxonomy.
- [`RUNBOOK_INCIDENTS.md`](./RUNBOOK_INCIDENTS.md) — what to do when §3 throws something at you.
- [`RUNBOOK_RELEASE_MANAGER.md`](./RUNBOOK_RELEASE_MANAGER.md) — milestone closing criteria.
