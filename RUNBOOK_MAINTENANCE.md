# Maintenance & Cost Analysis

Operational reference for monitoring costs, understanding free-tier limits, and planning for growth.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_MAINTENANCE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/MAINTENANCE.md` and localize the items below.
>
> **Reusability:** template-ready — the cost-table / free-tier-cliff / cost-per-action / monitoring-checklist structure is reusable; the services, prices, and usage projections are «placeholders». Re-cost against the repo's actual stack and localize the tokens below.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product this doc costs out.
> - `«SERVICE_LIST»` — the third-party services billed (e.g. an AI provider, a database, a payment provider, an auth provider, a host, an error monitor, CI, integrations, email, analytics) with their env vars.
> - `«AI_PROVIDER»` — model provider + env + models + per-call cost basis (e.g. OpenAI + an API key + the model names).
> - `«DB_CMS»` — database + tier limits (e.g. MongoDB Atlas free → paid tiers) + DB URI.
> - `«AUTH»` / `«PAYMENTS»` / `«EMAIL»` — auth MAU pricing, payment per-txn fee, email tiers, plus their env vars.
> - `«DEPLOY»` — hosting/build-minute billing (e.g. Vercel) + CI minutes (e.g. a CI provider + token).
> - `«USAGE_PROJECTIONS»` — the user-count phases, cost-per-action table, and storage projections (recompute per product).
> - `«QUALITY_CMD»` / build/test commands used in the pre-release checklist (e.g. format + lint + types + unit).
> - `«SMOKE_TESTS»` — the pre-release smoke-test scenarios (product-specific core flows).

---

## Third-Party Services That Generate Costs

| #   | Service       | What It Does          | Billing Model      | Env Var(s)      | Used By         |
| --- | ------------- | --------------------- | ------------------ | --------------- | --------------- |
| 1   | **`«Service»`** | «what it does»      | «per token/txn/…»  | `«ENV_VAR(s)»`  | «scope»         |
<!-- (one row per billed service — e.g. AI provider, database, payment provider, auth provider, host, error monitor, CI, integrations, email, analytics) -->

---

## Free-Tier Limits & Graduation Cliffs

### How much traffic can we handle for free?

(One row per service — its free tier, what you get, the cliff that breaks it, and where paid pricing starts. Fill with the repo's actual services and current prices.)

| Service       | Free Tier   | What You Get        | Cliff (What Breaks)   | Paid Tier Starts At  |
| ------------- | ----------- | ------------------- | --------------------- | -------------------- |
| **`«Service»`** | «free tier» | «limits»          | «what breaks at limit» | «paid pricing»      |
<!-- (one row per service) -->

### Graduation Scenarios

(Define growth phases by user count; for each, list the expected monthly cost and which services change. Keep the phase structure; replace the figures.)

#### Phase 1: «0-N Users» (Current)

**Expected monthly cost: «$range»**

| Service       | Status     | Notes              |
| ------------- | ---------- | ------------------ |
| `«Service»`   | «status»   | «note»             |
<!-- (one row per service) -->

#### Phase 2: «N-M Users»

**Expected monthly cost: «$range»**

| Service       | Change     | Action Required    |
| ------------- | ---------- | ------------------ |
| `«Service»`   | «change»   | «action»           |
<!-- (one row per service that changes; repeat the phase block for each growth phase) -->

---

## Cost Per User Action

Breakdown of what each user action costs in external API calls (one column per cost-driving service):

| User Action     | `«AI_PROVIDER»` | `«DB_CMS»`     | `«AUTH»` | Total Est.   |
| --------------- | --------------- | -------------- | -------------- | ------------ |
| **«action»**    | «calls/tokens»  | «reads/writes» | «auth ops»     | «~$est»      |
<!-- (one row per user-facing action; mark the cache-miss vs cache-hit variants of expensive AI actions separately) -->

### Key Insight

(Call out the most expensive action(s) and why — e.g. one-time-per-user AI generation that is cached on subsequent loads. Replace with this product's cost drivers.)

---

## `«AI_PROVIDER»` Usage Details

Typically the largest cost driver. List each distinct AI usage pattern:

| Consumer        | Model     | Max Tokens   | Trigger          | Calls Per Trigger   |
| --------------- | --------- | ------------ | ---------------- | ------------------- |
| `«Consumer»`    | `«MODEL»` | «N»          | «what triggers»  | «N (cached?)»       |
<!-- (one row per AI call site — note which are cached and which run per-request) -->

**Any dynamic token sizing:** Document the formula used to size token budgets for variable-size inputs (with min/max clamps), and which failures are never cached.

**Any lazy/on-demand generation:** Document any optimization where content is generated for one variant (e.g. locale) at a time and the rest on demand, plus the cost reduction vs. generating everything upfront.

**Monthly projection at «N users» («segment breakdown»):**

| Usage         | Calculation         | Est. Cost    |
| ------------- | ------------------- | ------------ |
| «usage type»  | «N × calls × $rate» | «~$est»      |
| **Total**     |                     | **«~$/mo»**  |
<!-- (one row per AI usage type) -->

**Note:** Flag which costs are one-time-and-cached vs. recurring, so the projection is honest.

---

## `«DB_CMS»` Storage Projection

(One row per data type stored; estimate size-per-record and records-per-user to project storage at scale.)

| Data Type      | Size Per Record | Records Per User | Per 1K Users   |
| -------------- | --------------- | ---------------- | -------------- |
| `«record»`     | «~KB»           | «N»              | «MB»           |
| **Total**      |                 |                  | **«~MB/1K»**   |
<!-- (one row per data type) -->

**The free tier («storage limit»)** supports approximately **«N users»** before the storage limit.

Note any earlier bottleneck (e.g. the free-tier max-connections cap) that bites before storage does.

---

## Monitoring Checklist

(Keep the weekly / monthly / before-release cadence; swap the service-specific checks for this repo's services.)

### Weekly

- [ ] Check `«DB_CMS»` storage usage
- [ ] Review `«AI_PROVIDER»` API usage and billing
- [ ] Review `«OBSERVABILITY»` error volume and unresolved issues
- [ ] Check `«PAYMENTS»` dashboard for failed payments and disputes
<!-- (one item per service to watch weekly) -->

### Monthly

- [ ] `«AUTH»` MAU count
- [ ] Hosting/CDN bandwidth
- [ ] CI minutes consumed
- [ ] Revenue + subscription metrics
- [ ] Email volume + bounce rate
<!-- (one item per service to watch monthly) -->

### Before Each Release

- [ ] Run full CI suite (`«QUALITY_CMD»` — format + lint + types + unit)
- [ ] Verify no new external service dependencies were added without documenting here
- [ ] Check that no secrets/API keys are committed in code

---

## Cost Optimization Opportunities

(One row per known lever. Strike through and mark ✅ Done once applied. Replace with this product's optimizations — common patterns: lazy/on-demand generation, caching expensive results, moving to a cheaper model, Redis-backed rate limiting, read caching.)

| Optimization     | Impact       | Effort      | When to Apply   |
| ---------------- | ------------ | ----------- | --------------- |
| `«optimization»` | «-X% / unlocks Y» | «Low/Med/High» | «phase/trigger» |
<!-- (one row per optimization opportunity) -->

---

## Smoke Test Checklist (Pre-Release)

Manual verification before code freeze. One row per core flow. Keep the generic scenarios that apply to any web app (homepage, registration, login, public/auth pages, payment checkout + webhook, billing portal, health endpoint, cookie consent, unauthenticated-API rejection) and add this product's feature-specific flows.

| #   | Scenario                  | Steps                  | Expected Result        |
| --- | ------------------------- | ---------------------- | ---------------------- |
| 1   | **`«scenario»`**          | «steps»                | «expected result»      |
<!-- (one row per smoke-test scenario — e.g. homepage loads, registration, social login, default plan, public page, payment checkout, payment webhook, billing portal, health endpoint (GET «HEALTH_ENDPOINT»), cookie consent, unauthenticated API returns 401) -->

