# Pricing Strategy

> **Last updated:** «DATE» — «CHANGELOG_NOTE» (what changed and the source-of-truth file for the gating constants, e.g. `«METERED_LIMITS»` in `src/.../constants.ts`).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PRICING_STRATEGY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_PRICING_STRATEGY.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (tier table → metering rules → data architecture → feature gating → payment integration → gating rules → cost-per-action), then replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product these plans belong to
> - `«PLAN_TIERS»` — the tier names and the per-feature inclusion matrix (rows = features, cols = tiers)
> - `«CURRENCY»` + `«TIER_PRICES»` — price per tier and billing cadence
> - `«METERED_LIMITS»` — any usage meters/quotas per tier (e.g. uses/month) and refill rules
> - `«FEATURE_REGISTRY»` — the canonical feature list shown in the pricing matrix
> - `«CMS_COLLECTIONS»` — if pricing is CMS-driven, the collections/seed source
> - `«PAYMENT_PRICE_IDS»` / `.versionrc` / payment processor — processor price IDs and the gating-constants source-of-truth file
>
> Token convention: camelCase tokens (e.g. `«priceIdField»`, `«customerIdField»`) are code identifiers — keep them as field/variable names in code; `«SCREAMING_SNAKE»` tokens are concepts/slots filled per repo.

## Plan Tiers

(The headline pricing matrix. Rows = features, columns = tiers. Use Yes/No or a metered value per cell.)

| Feature   | «TIER_1» | «TIER_2» | «TIER_3» |
| --------- | -------- | -------- | -------- |
| «FEATURE» | «value»  | «value»  | «value»  |

(one row per «feature» in the canonical feature registry; cells are Yes/No or a metered limit like "«N» / month")

## Pricing decisions matrix (template)

The locked decisions behind the pricing matrix above — what was chosen, and **why per the ICP**. Re-derive this table on every pricing change so the rationale survives. Every row is a decision you must defend to a customer (or to your future self at the next pricing review).

> **Why this lives here, not in the payment-processor runbook:** these are *product* decisions (tier shape, anchor, trial, currency, metering policy). The processor runbook (e.g. [`RUNBOOK_PAYMENTS_LIFECYCLE.md`](./RUNBOOK_PAYMENTS_LIFECYCLE.md)) only mechanizes what's decided here — the products + prices to create, the webhooks to wire. Keep the *why* out of the *how*.

| Decision              | Choice                                            | Why (per ICP)                                                                                       |
| --------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **«TIER_1» price**    | «PRICE_TIER_1» / «CADENCE»                        | «one-line ICP rationale — e.g. lowest first-time ask, coffee-per-month frame»                       |
| **«TIER_2» price**    | «PRICE_TIER_2» / «CADENCE» («N»% off vs monthly)  | «why the upsell exists — better unit economics, anchor framing, etc.»                               |
| Billing toggle        | «monthly + yearly under one product / separate»   | «UI implication — toggle on pricing card, default cadence, etc.»                                    |
| Anchor / framing      | «monthly→yearly delta / strikethrough / none»     | «why this anchor was chosen + which copy lines depend on it»                                        |
| Metered cap policy    | «N / month, refill rules, carryover?»             | «what cap triggers the cross-sell / upgrade prompt»                                                 |
| Cross-sell SKUs       | «one-time packs / overage rate / none»            | «why bundled-only — e.g. processor fees prohibit single-unit SKU below «N»; defer to vX.Y.Z»        |
| Trial period          | «none / N days / freemium»                        | «ICP conversion-velocity rationale — does a trial accelerate or delay revenue from a high-intent buyer?» |
| Currency              | «single currency only / multi»                    | «geo coverage of target ICP + tax-handling complexity defer rationale»                              |
| **«TIER_3» price**    | «PRICE_TIER_3» / «CADENCE», «min-seat floor»      | «multi-seat model — volume discount %, what extra capability justifies the per-seat tier»           |
| Tax behavior          | «inclusive / exclusive»                           | «B2B vs B2C posture; whether tax-engine integration is in scope»                                    |

(one row per locked decision; keep the column ordering: Decision / Choice / Why)

> **Decision-rule for editing this table:** any change here is a pricing-policy change. Record it in [`MANAGER_DECISION_LOG.md`](./MANAGER_DECISION_LOG.md) with the price-impact estimate and the trigger (cohort signal, churn read, win-rate). The Choice column changes when policy changes; the Why column changes when ICP understanding changes — never edit Choice without re-validating Why.

## Implementation

### Data Architecture («CMS-Driven» or hardcoded)

(Describe where pricing display data lives — CMS collections, config files, etc.)

«DATA_ARCHITECTURE» — e.g. pricing display is CMS-managed via collections:

- **«FEATURES_COLLECTION»** — centralized registry of «N» product features with localized names
- **«PLANS_COLLECTION»** — «N» plans with pricing, feature inclusions, CTAs, and processor price IDs

(Note the seed order and where they're admin-editable.)

### Feature Gating («STATUS»)

(Describe the access-control layer kept off the network hot path.)

- `«PLAN_FEATURES»` constant maps feature keys to minimum tier
- `«PLAN_HIERARCHY»` defines tier ordering: `«TIER_1» < «TIER_2» < «TIER_3»`
- `«FEATURE_HOOK»()` hook with the gating feature keys:
  - `«feature_key»` («tier»)

  (one bullet per gated feature key → minimum tier)
- `«UPGRADE_PROMPT»` component shown to lower-tier users on gated features
- `«METERED_LIMITS»` controls per-plan usage caps (tracked via `«usageField»` + `«resetField»` on the user record)

### User Plan Storage

(The fields on the user/account record that hold plan state.)

- `plan` field on the user record: `'«TIER_1»' | '«TIER_2»' | '«TIER_3»'` (saved to JWT/session)
- `«planExpiresAt»` populated from the processor's period-end
- `«customerIdField»` and `«subscriptionIdField»` saved by webhook
- `«organizationId»` links users to multi-seat accounts

## Payment Integration («STATUS»)

(example — adapt to your processor «PAYMENTS». The Checkout / Webhook / Billing Portal flow below reflects one processor's surface; map each step to your own.)

### Checkout Flow

(Step-by-step from CTA click to processor-hosted checkout.)

1. User clicks CTA on pricing card (CTA action: `checkout`)
2. `«PRICING_CARD»` component sends `POST «CHECKOUT_ENDPOINT»` with `{ userId, userEmail, tier }`
3. Route verifies auth, looks up `«priceIdField»` from the Plans source
4. Falls back to `«PRICE_ID_ENV_VAR»` env var if lookup fails
5. Creates a checkout session with `tier` in metadata
6. Redirects user to processor-hosted checkout

### Webhook Events

(Map each processor event to the state change it triggers.)

| Event              | Action                                                                |
| ------------------ | --------------------------------------------------------------------- |
| «WEBHOOK_EVENT»    | «state change: set plan, save ids, set expiry, downgrade, etc.»       |

(one row per «webhook event» you handle — checkout completed, subscription updated, subscription deleted, payment failed, …)

### Billing Portal

(How users self-manage their subscription.)

- `POST «PORTAL_ENDPOINT»` creates a billing portal session
- Verifies ownership: the authenticated user must match the stored `«customerIdField»`
- Users can manage subscription, update payment method, cancel

### Frontend Pricing Components

(The UI components that render pricing, and the data hook behind them.)

All pricing UI is data-driven via the `«usePlans»()` hook:

- `«COMPONENT»` — «what it renders»

(one bullet per pricing UI component — card, full page, homepage section, billing tab, …)

### «METERED_FEATURE» Auto-Loading

(If a metered/cached feature loads on view but only generates on action, document the two-phase flow.)

1. **Cache check** — on load, a cache-only query fetches any existing result
2. **Generate on action** — a separate query (with a `generate` flag) runs only on explicit user action
3. **Counter sync** — after generation, the usage counter is returned and reflected in the UI

(This avoids unnecessary generation cost while showing cached results instantly.)

## Gating Rules

(Plain-language rules for what each tier can and cannot do.)

- «GATING_RULE» — e.g. "«TIER_1» users get «N» free uses, then see the upgrade prompt"

(one bullet per gating rule, per tier)

## «AI_OR_VARIABLE» Cost per User

(If the product has variable per-action cost — AI calls, third-party APIs — list the cost per action.)

| Action     | Model/Provider | Calls per trigger | Estimated cost |
| ---------- | -------------- | ----------------- | -------------- |
| «ACTION»   | «MODEL»        | «N»               | «AMOUNT»       |

(one row per cost-bearing «action»)

(Describe any cost-reduction strategy — e.g. lazy single-variant generation, hash-based caching, on-demand generation — and the % saving vs. the naive approach.)

## Future Considerations

(Known gaps and planned pricing/billing improvements.)

- «FUTURE_CONSIDERATION»

(one bullet per planned improvement — e.g. enforce expiry in gating, create customer on registration, notify on payment failure, usage-based limits, configurable model names)
