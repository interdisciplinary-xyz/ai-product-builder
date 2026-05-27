# Payment compliance architecture

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PAYMENTS_COMPLIANCE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/PAYMENTS_COMPLIANCE.md` and localize the items below.
>
> **Reusability:** template-ready — the platform-vs-PI boundary, the provider split, the forbidden-pattern list, and the custody-vs-marketplace distinction are reusable; provider names, route paths, schema names, and milestone references are «placeholders». Not legal advice — validate with `«JURISDICTION»` counsel before relying on it.
>
> **Pairs with:** `AI/RUNBOOK_SECURITY_MODEL.md` (forbidden-tokens CI gate, payment route auth model), `AI/RUNBOOK_LEGAL_RISK.md` (jurisdiction-level risk register), `AI/RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md` (data-handling at checkout), `AI/RUNBOOK_PAYMENTS_LIFECYCLE.md` (operational payment flows).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the platform's product name; used in the SaaS-vs-PI sign-off line.
> - `«JURISDICTION»` — applicable legal regime(s) (e.g. EU/PL under PSD2 + AML; US state-level money-transmitter rules) — drives the custody-boundary rationale and the regulator name to cite.
> - `«PAYMENT_PROVIDER_PRIMARY»` — the routed-to-third-party-account provider (e.g. Stripe Connect Express).
> - `«PAYMENT_PROVIDER_SECONDARY»` — the local-merchant-credential provider (if applicable; e.g. P24/local provider) — mark "N/A" if the product only uses one provider.
> - `«PLATFORM_FEE_MECHANISM»` — provider-native fee primitive used if/when the platform charges a per-payment fee (e.g. `application_fee_amount` / `application_fee_percent`; connected-account splits) — never a manual transfer.
> - `«CUSTODY_BOUNDARY»` — one-sentence statement of the SaaS-vs-PI delineation for this product (e.g. "platform receives SaaS subscription fees only; end-user funds settle in the creator's payment provider account and never touch the platform's bank account").
> - `«PLATFORM_SAAS_BILLING»` — the platform's own billing surface (e.g. the platform's own Stripe subscription on `POST /api/subscription/checkout`).
> - `«CREATOR_PROVIDER_COLLECTION»` — the per-creator provider-credentials schema (e.g. a `payment-providers` collection).
> - `«ENCRYPTION_HELPER»` — the at-rest encryption module for stored provider credentials.
> - `«FORBIDDEN_TOKENS_SPEC»` — the static test path that enforces the forbidden-field-name list.
> - `«ASSERT_NO_CUSTODY»` — the runtime guard that rejects custody-implying fields at the input boundary.

## TL;DR

**«PROJECT» is SaaS / paywall infrastructure, not a payment institution under `«JURISDICTION»`.**

End-user money flows directly from the supporter / customer to the creator's own payment provider account. The platform never receives, holds, pools, splits, delays, or redistributes end-user funds.

This document is the source of truth for what is *allowed* and what is *forbidden* in the codebase. If a feature feels like it would put the platform back in the position of "holding money on behalf of a creator," it is forbidden — even if the immediate UX appeal is high — until and unless `«JURISDICTION»` legal review explicitly approves.

---

## The two contractual relationships

```
                            ┌───────────────────────┐
                            │       «PROJECT»       │
                            │   (the platform —     │
                            │    SaaS vendor)       │
                            └───────────┬───────────┘
                                        │
                                        │ subscription invoice
                                        │ (platform's own «PLATFORM_SAAS_BILLING» — paid
                                        │  by the creator to the platform)
                                        │
                                ┌───────▼────────┐
                                │    Creator     │
                                └───────┬────────┘
                                        │
                                        │ creator connects own provider
                                        │ (e.g. «PAYMENT_PROVIDER_PRIMARY»
                                        │  connected-account, or
                                        │  «PAYMENT_PROVIDER_SECONDARY»
                                        │  merchant credentials —
                                        │  encrypted at rest by platform)
                                        │
                            ┌───────────▼────────────┐
                            │  Creator's payment     │
                            │  provider account      │
                            │  («PAYMENT_PROVIDER_   │
                            │   PRIMARY» or          │
                            │   «PAYMENT_PROVIDER_   │
                            │   SECONDARY»)          │
                            └───────────▲────────────┘
                                        │
                                        │ end-user payment
                                        │ (uses the creator's creds —
                                        │  money never touches the
                                        │  platform's bank account)
                                        │
                                ┌───────┴────────┐
                                │    End user    │
                                │   (supporter)  │
                                └────────────────┘
```

The platform appears in two relationships, both as a software vendor:

1. **Platform ↔ Creator** — SaaS subscription. The creator pays the platform a recurring subscription fee for the product. This is the ONLY money path that touches the platform's own accounts.
2. **End user ↔ Creator (via the creator's provider)** — content payment. Brokered through the creator's `«PAYMENT_PROVIDER_PRIMARY»` or `«PAYMENT_PROVIDER_SECONDARY»` account. The platform sets up the checkout (signs the request with the creator's stored credentials), but never receives, holds, splits, delays, or transfers the funds.

There is **no third relationship** in which the platform holds end-user money on behalf of the creator. If you find yourself designing such a relationship, stop and read this document — and see [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) (Custody-Field Static Check) for the CI gate that fails the build the moment custody-implying field names appear.

---

## Provider model A — `«PAYMENT_PROVIDER_PRIMARY»` (routed connected-account, e.g. Stripe Connect Express)

### Account type

- The creator owns the provider account end-to-end.
- Onboarding (identity verification, bank details, KYC) is performed on a provider-hosted page. «PROJECT» never receives the creator's banking or personally-identifying information.
- The provider handles disputes, chargebacks, and payouts directly with the creator.
- The platform stores only the **opaque account identifier** plus a small set of non-secret status flags (e.g. `charges_enabled`, `payouts_enabled`, `details_submitted`).

### How the platform initiates a payment on the creator's behalf

When an end user starts a payment on a creator's profile, the platform calls the provider with the creator's opaque account identifier set on the request (e.g. a `stripeAccount` request option). The provider routes the payment to the creator's account directly. Funds settle in the creator's account. **No transfer through the platform's account occurs.**

### Platform fees (deferred until product needs them)

If the product later decides to take a per-payment platform fee, it **MUST** use `«PLATFORM_FEE_MECHANISM»` on the underlying primitive (PaymentIntent / Checkout Session / equivalent). The provider routes the fee directly to the platform without the platform ever holding the gross transaction. Any other approach (manual transfers, splits, holds, scheduled releases) is forbidden — see "Forbidden patterns" below.

---

## Provider model B — `«PAYMENT_PROVIDER_SECONDARY»` (local-merchant credentials)

(Use this section if the product supports a regional provider that has no Connect-style routed-account equivalent — e.g. a local card acquirer in `«JURISDICTION»`. Omit if the product is single-provider.)

`«PAYMENT_PROVIDER_SECONDARY»` has no routed-connected-account equivalent. The creator must:

1. Open their own `«PAYMENT_PROVIDER_SECONDARY»` merchant account directly with the provider.
2. Paste the resulting merchant credentials (e.g. POS / Merchant ID, signing key, API key, API URL) into the platform dashboard.
3. The platform encrypts each sensitive value at rest (versioned envelope, see `«ENCRYPTION_HELPER»`) and stores it on a `«CREATOR_PROVIDER_COLLECTION»` row.
4. The platform decrypts these credentials **server-side only**, on demand, when:
   - registering a new transaction session against the creator's account, or
   - verifying the signature of an inbound webhook event for a transaction owned by that creator.
5. Funds settle in the creator's merchant account directly. **No transfer through the platform's account occurs.**

The end-user payment flow is:

```
End user submits donate/pay form
   │
   │ (transaction-init route)
   ▼
Platform looks up creator → loads creator's «CREATOR_PROVIDER_COLLECTION» row
   │
   │ Decrypts creator's signing + API keys server-side only
   ▼
Platform calls «PAYMENT_PROVIDER_SECONDARY» transaction-register with creator's keys
   │
   │ Returns a provider-hosted checkout token
   ▼
End user redirected to provider → completes payment
   │
   ▼
Provider settles funds into creator's merchant account
   │
   │ Sends webhook (signed with creator's signing key)
   ▼
Platform identifies creator from the inbound session id →
loads creator's signing key → verifies signature → marks transaction completed
```

The platform's bank account is never on this flow.

---

## Forbidden patterns in the codebase

The following patterns are forbidden anywhere in this codebase. They imply the platform is acting as a payment institution / wallet provider and would expose the platform to `«JURISDICTION»` payments regulation (e.g. PSD2 in the EU; money-transmitter rules in US states; analogous regimes elsewhere).

### Forbidden field names (enforced by static test)

The static test at `«FORBIDDEN_TOKENS_SPEC»` fails the build if any of these tokens appear in non-allowlisted source files:

- `platformBalance`, `creatorBalance`, `availableBalance`, `pendingBalance`
- `withdrawableAmount`
- `walletBalance`
- `payoutSchedule`, `settlementBatch`

These names imply platform-managed money and would require regulatory approval to implement under `«JURISDICTION»`.

The runtime guard `«ASSERT_NO_CUSTODY»` enforces an even broader list at the input boundary — when a third-party SDK response or admin payload would persist a custody-implying field, the guard throws.

CI gate: the forbidden-tokens static check runs on **every PR** as a required check, not a manual checkbox — see [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) (Custody-Field Static Check).

### Forbidden architectural patterns

- The platform must NOT collect end-user payments into the platform's own bank account.
- The platform must NOT pool, split, delay, release, or redistribute creator funds.
- The platform must NOT maintain creator balances of any form.
- The platform must NOT implement wallet, withdraw, payout (from the platform), pending balance, or available funds features.
- The platform must NOT manually transfer funds from the platform account to creators.
- The platform must NOT describe itself, anywhere in marketing or product copy, as "collecting payments on behalf of creators."

### Forbidden UI copy

UI text rendered by the dashboard or public profile must NOT use any of these words to describe the platform's relationship to the funds:

- "balance" / "available balance" / "pending balance"
- "withdraw" / "withdrawal"
- "payout" (when describing money LEAVING «PROJECT»)
- "wallet"
- "collected by «PROJECT»"
- "we hold your money"

Approved copy ships in the localized message catalog under the relevant payment-provider / paywall namespaces. Mirror that copy for any new surface.

---

## Custody-vs-marketplace distinction

A useful mental model when reviewing a feature request:

| Pattern                                                                                          | Custody? | Allowed? |
| ------------------------------------------------------------------------------------------------ | -------- | -------- |
| Platform sets up checkout on creator's `«PAYMENT_PROVIDER_PRIMARY»` account → funds go to creator | No       | Yes      |
| Platform stores encrypted `«PAYMENT_PROVIDER_SECONDARY»` keys → signs requests server-side       | No       | Yes      |
| Platform takes `«PLATFORM_FEE_MECHANISM»` per payment (provider routes fee directly)             | No       | Yes      |
| Platform receives end-user funds → splits → forwards to creator                                  | **Yes**  | No       |
| Platform shows "available balance" for a creator                                                 | **Yes**  | No       |
| Platform schedules / executes "payouts" from a platform account to creators                      | **Yes**  | No       |
| Platform holds funds during a "review" or "cooling-off" period                                   | **Yes**  | No       |

The legal-and-engineering rule: **if a number on the screen represents money the platform has and the creator will receive later, the platform is in custody, and the platform is a payment institution under `«JURISDICTION»`.** Marketplace patterns are designed so that number never exists on the platform side.

---

## Allowed patterns

For clarity:

- The platform CAN charge a creator for the SaaS subscription via `«PLATFORM_SAAS_BILLING»`. This is the ONLY revenue path that involves the platform's bank account.
- The platform CAN store encrypted creator-provider credentials and use them server-side to sign transaction-register and webhook-verify requests.
- The platform CAN call `«PAYMENT_PROVIDER_PRIMARY»` with the creator's connected-account identifier to initiate end-user checkouts on the creator's account. Funds go to the creator directly; no transfer touches the platform.
- The platform CAN use `«PLATFORM_FEE_MECHANISM»` if/when product decides to charge a per-payment fee. The provider routes the fee directly without the platform taking custody of the gross transaction.
- The platform CAN persist a payment record (e.g. a `transactions` row) recording that an end-user payment occurred. This is a payment record, not an accounting balance.

---

## Glossary

| Term                  | Meaning                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Creator**           | A user who has signed up to publish content via «PROJECT». Pays a SaaS subscription to the platform. Connects their own payment provider for end-user payments.                                        |
| **End user**          | The person paying a creator for content access. Their money goes to the creator's payment provider directly.                                                                                            |
| **Payment provider**  | The third party that actually processes the end-user payment: `«PAYMENT_PROVIDER_PRIMARY»` (connected-account model) or `«PAYMENT_PROVIDER_SECONDARY»` (creator-owned merchant account, if applicable). |
| **Platform SaaS fee** | The recurring subscription the creator pays to the platform. Charged via `«PLATFORM_SAAS_BILLING»`. The ONLY money the platform receives.                                                              |
| **End-user payment**  | The payment from an end user to a creator. Settles in the creator's payment provider account. The platform never takes custody.                                                                         |
| **Custody**           | The legal status of holding someone else's money. «PROJECT» does not custody end-user money under any circumstances.                                                                                    |
| **Connect / routed-account model** | The provider's product family for marketplaces and platforms that route payments to third-party accounts without the platform taking custody (e.g. `«PAYMENT_PROVIDER_PRIMARY»` connected accounts). |
| **Signing key**       | A per-merchant secret used to sign `«PAYMENT_PROVIDER_SECONDARY»` transaction registration and webhook events. Stored encrypted at rest, decrypted server-side only.                                    |

---

## Future warning

Any of the following features require `«JURISDICTION»` legal review **before** any code lands in this repo. The static guardrail tests will fail the build even on a feature branch if the forbidden tokens appear:

- A creator-facing "balance" or "available funds" view.
- A creator-facing "payout" or "withdrawal" action.
- A platform-managed pooling, split, or settlement system for end-user payments.
- Storing or transmitting end-user card / bank details directly.
- Any feature that says or implies "«PROJECT» pays the creator."

If a product decision genuinely needs one of these, the path is:

1. Discuss with `«JURISDICTION»` counsel about regulatory implications (e.g. PSD2 + AML/KYC + electronic-money licensing in the EU; money-transmitter analysis in US states).
2. Document the legal basis as a decision record (see `RUNBOOK_DECISION_LOG.md`).
3. Update this document.
4. Update the static guardrail allowlist.
5. Update the dashboard / public copy.

Skipping any step is a compliance regression. See [`LEGAL_RISK.md`](./LEGAL_RISK.md) for the broader `«JURISDICTION»` risk register, and [`gdpr-pre-launch-checklist.md`](./compliance/gdpr-pre-launch-checklist.md) for data-handling obligations that fire at checkout.

---

## Related code (fill per repo)

| Concept                                          | Location                                                |
| ------------------------------------------------ | ------------------------------------------------------- |
| Schema for per-creator providers                 | `«CREATOR_PROVIDER_COLLECTION»`                         |
| Schema header reminding "no custody fields"      | `«TRANSACTIONS_COLLECTION»`                             |
| Encryption helpers                               | `«ENCRYPTION_HELPER»`                                   |
| Forbidden-field runtime guard                    | `«ASSERT_NO_CUSTODY»`                                   |
| Provider repository (server-only)                | `«PROVIDER_REPOSITORY»`                                 |
| Sanitization (no secret leaks)                   | `«PROVIDER_SANITIZER»`                                  |
| `«PAYMENT_PROVIDER_SECONDARY»` session helper    | `«SECONDARY_SESSION_HELPER»` (if applicable)            |
| `«PAYMENT_PROVIDER_PRIMARY»` onboarding helpers  | `«PRIMARY_ONBOARDING_HELPERS»`                          |
| Connect onboarding endpoint                      | `«PRIMARY_ONBOARDING_ROUTE»`                            |
| Connect refresh endpoint                         | `«PRIMARY_REFRESH_ROUTE»`                               |
| `«PAYMENT_PROVIDER_SECONDARY»` config endpoint   | `«SECONDARY_CONFIG_ROUTE»` (if applicable)              |
| Sanitized provider list                          | `«PROVIDER_LIST_ROUTE»`                                 |
| End-user transaction init                        | `«TRANSACTION_INIT_ROUTE»`                              |
| Multi-tenant webhook                             | `«WEBHOOK_ROUTE»`                                       |
| Static guardrail test                            | `«FORBIDDEN_TOKENS_SPEC»`                               |
| Dashboard panel                                  | `«PROVIDERS_PANEL_PATH»`                                |
| Compliance copy                                  | localized message catalog (per `«LOCALES»`)             |
