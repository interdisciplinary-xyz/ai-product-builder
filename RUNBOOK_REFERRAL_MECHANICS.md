# Referral Mechanics

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_REFERRAL_MECHANICS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_REFERRAL_MECHANICS.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the model-decision / anti-abuse / tracking / eligibility / implementation / KPI / break-even structure is reusable; the benefit amounts, attribution windows, and jurisdiction constraints are «placeholders». Localize the tokens below per repo.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product whose referral program this is.
> - `«REFERRAL_MODEL»` — one-sided or two-sided.
> - `«FRIEND_BENEFIT»` — what the referred user gets (e.g. a credit, a discount, a free feature).
> - `«REFERRER_BENEFIT»` — what the referrer gets (e.g. a credit, an extension, a payout, a feature unlock).
> - `«PAYOUT_TIMING»` — when the benefit fires (e.g. on signup, on activation, on first payment, on Nth payment).
> - `«ATTRIBUTION_WINDOW»` — how long a referral link stays attributable after click (e.g. 30 days).
> - `«REFERRAL_CODE_LENGTH»` — code length / format (e.g. 8 alphanumeric chars).
> - `«K_FACTOR_TARGET»` — target viral coefficient (e.g. 0.3 — each user invites enough peers that ~30% become users).
> - `«JURISDICTION»` — the regulatory environment that constrains the model (e.g. consumer-protection / AML / advertising rules).
> - `«ANTI_ABUSE_RATE_LIMIT»` — max attributable referrals per referrer per `«WINDOW»` (e.g. 50 per month).
> - `«PAYMENTS»` — payment provider that handles payouts/credits where the benefit is monetary.

Source of truth for how referrals work in `«PROJECT»` — model choice, anti-abuse, tracking, eligibility, implementation checklist, and the break-even math that decides whether the program is viable.

Pair with [`COMMUNITY_MODEL.md`](./COMMUNITY_MODEL.md) (where the referral loop sits inside the wider acquisition engine), [`ACTIVATION_EVENT.md`](./ACTIVATION_EVENT.md) (gates the payout if eligibility requires activation), [`PRICING_STRATEGY.md`](./PRICING_STRATEGY.md) (the prices the credits / discounts are denominated in), and the `MANAGER_LAUNCH_GTM` (where the program slots into the launch sequence).

---

## Referral model decision

The first commit. The model choice determines every downstream parameter.

| Decision                          | Choice                                                    | Why (per ICP)                                                                              |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Sidedness**                     | «one-sided / two-sided»                                    | «who gets the benefit and why — e.g. two-sided is fairer but more expensive; one-sided is cheaper but less effective» |
| **Friend benefit (`«FRIEND_BENEFIT»`)** | «e.g. credit / discount / free month / feature unlock» | «why this size — coffee-per-month framing, anchor against the regular price»                |
| **Referrer benefit (`«REFERRER_BENEFIT»`)** | «e.g. credit / discount / payout / feature unlock»  | «aligned with referrer's stated motivation — money-motivated vs. status-motivated vs. utility-motivated» |
| **Payout timing (`«PAYOUT_TIMING»`)** | «on signup / on activation / on first payment / on Nth payment» | «how much fraud surface vs. how strong the signal — payout-on-payment is most defensible but slowest» |
| **Cap per referrer**              | «e.g. unlimited / N referrals per month / N total»         | «balance virality vs. abuse risk; document the cap source-of-truth»                        |
| **Currency**                      | «product credits / cash payout / both»                     | «cash payouts trigger AML / tax / regulatory exposure under `«JURISDICTION»` — see compliance»  |

(one row per locked decision; keep the column ordering: Decision / Choice / Why)

**Decision-rule for editing this table.** Any change here is a referral-policy change. Record it in [`DECISION_LOG.md`](./DECISION_LOG.md) with the projected impact on `«K_FACTOR_TARGET»` and the trigger (cohort signal, abuse incident, fraud rate). The **Choice** column changes when policy changes; the **Why** column changes when ICP understanding changes — never edit Choice without re-validating Why.

**Hard rule on `«PAYOUT_TIMING»`.** Paying on signup is the maximum-fraud surface — every fake email becomes a payout. Paying on activation is the minimum defensible bar. Paying on first payment is the most defensible against abuse and the slowest to feel rewarding. Pick consciously; document the tradeoff.

---

## Anti-abuse

Every referral program is an attack surface. The question is **not** "will someone try to game this," it's "how much will we let them before it hurts."

### Self-referral

- Same email domain (e.g. `+alias@gmail.com`) → reject. Normalize emails before matching.
- Same payment fingerprint (e.g. same card across referrer and friend) → reject. Use `«PAYMENTS»` fingerprinting.
- Same device / cookie / IP at signup → flag for manual review; do not auto-reject (legitimate household sign-ups exist).
- Referrer and friend share the same `«AUTH»` UID across providers → reject.

### Sybil (one human, many fake accounts)

- Rate limit: max `«ANTI_ABUSE_RATE_LIMIT»` attributable referrals per referrer per `«WINDOW»` (e.g. 50 / month). Above the cap, payouts queue for review.
- Device fingerprinting at signup — flag if the same device creates more than N accounts in a short window.
- Velocity check — if a single referrer drives a spike of M referrals in a short period (e.g. > N in 1 hour), pause auto-payouts pending review.
- Tie the cap source-of-truth to a single constant (e.g. `«ANTI_ABUSE_RATE_LIMIT»` in the gating-constants file referenced in `PRICING_STRATEGY.md`) so it's not duplicated.

### Fake accounts

- Don't pay on signup; pay on **activation** at the earliest (per `«ACTIVATION_DEF»` from [`ACTIVATION_EVENT.md`](./ACTIVATION_EVENT.md)). An activated user has demonstrated real engagement.
- Email verification required before the referral attribution lands — an unverified email is not a referral.
- Optionally require the friend's account to survive a "no chargeback / no refund within `«COOLING_WINDOW»` (e.g. 14 days)" period before the payout lands. Cross-ref [`PRICING_STRATEGY.md`](./PRICING_STRATEGY.md) for the refund policy.

### Detection + response

- Log every attribution + payout decision in an audit table; retain per the data-retention policy.
- Periodic (weekly) sweep: top-N referrers by volume → spot-check for patterns (shared IPs, similar usernames, similar payment fingerprints).
- Suspected abuse → pause payouts, contact the referrer, give them a chance to explain — false positives happen.
- Confirmed abuse → reverse the payouts, disable the referral code, document in [`DECISION_LOG.md`](./DECISION_LOG.md) for pattern memory.

**Anti-pattern.** Auto-paying on signup with no rate limit. The post-launch fraud cleanup costs more than the program ever earned.

---

## Tracking

How an attribution is captured, written, and later read.

### UTM convention

Every share URL carries the standard UTM convention from `MANAGER_LAUNCH_GTM`:

```
https://«DOMAIN»/?ref=«REFERRAL_CODE»&utm_source=referral&utm_medium=«share-method»&utm_campaign=«UTM_CAMPAIGN»
```

- `utm_source=referral` — distinguishes referral traffic from organic / paid in the analytics
- `utm_medium=«share-method»` — `share-link`, `share-email`, `share-sms`, etc.
- `utm_campaign=«UTM_CAMPAIGN»` — links back to the launch / season the referral was part of (cross-ref `LAUNCH_SOCIAL.md`)

### Referral codes

- Code length: `«REFERRAL_CODE_LENGTH»` (e.g. 8 alphanumeric chars, ambiguous-character-free — no `0`/`O`, no `1`/`I`/`l`).
- Generated on referrer-account creation (or lazily on first share); stored on the user record as `«referralCode»`.
- Unique constraint enforced at the DB level — collision attempts retry with a new code.
- Human-typeable for cases where the user shares "use code XYZ" verbally.

### Attribution write

When a friend lands via `?ref=«code»`:

1. Set a first-party cookie (`«referralCookieName»`, expiry = `«ATTRIBUTION_WINDOW»`) capturing the code.
2. On signup, read the cookie and write the attribution: `{ referredBy: <referrerUserId>, attributedAt: now }` on the friend's user record.
3. Idempotent — if the friend's record already has `referredBy`, do not overwrite (first-touch attribution wins).
4. If the friend signs in via an already-existing account (not signup), no attribution writes — referrals only apply to new signups within the attribution window.

### Attribution window

- `«ATTRIBUTION_WINDOW»` (e.g. 30 days) from click → signup. Older clicks expire.
- Document the choice: shorter windows are stricter / less generous to the referrer; longer windows reward earlier touches but invite ambiguity.

### Read sites

- Payout decision (when `«PAYOUT_TIMING»` fires): read `referredBy` on the friend's user record → credit the referrer per the eligibility rules.
- Referrer dashboard: show the referrer their referred-users list, current pending payouts, total earned.
- Analytics funnel: filter on `utm_source=referral` to attribute downstream revenue / activation to the channel.

---

## Eligibility

When a referral is **eligible** for payout — the gates the referred user (friend) must cross before the referrer gets paid.

- **Activated.** The friend must satisfy `«ACTIVATION_DEF»` from [`ACTIVATION_EVENT.md`](./ACTIVATION_EVENT.md). Unactivated signups don't trigger payouts. (Minimum bar; defensible against fake accounts.)
- **Paying** (where the program ties to revenue). The friend must complete a successful payment via `«PAYMENTS»` — and survive the `«COOLING_WINDOW»` (e.g. 14 days) without refund / chargeback. Cross-ref [`PRICING_STRATEGY.md`](./PRICING_STRATEGY.md) for the refund policy that defines this window.
- **First-touch.** The referrer is the user whose code was on the friend's first attributed signup — not subsequent re-attribution attempts.
- **Same jurisdiction allowed.** Some `«JURISDICTION»` rules restrict cross-border referrals (especially with cash payouts — AML / tax / advertising rules). Document the geographic scope: "open to users in `«REFERRAL_GEO_SCOPE»` only" if relevant. When in doubt, defer to legal counsel; see [`PAYMENTS_COMPLIANCE.md`](./PAYMENTS_COMPLIANCE.md) for the broader compliance posture.
- **Not a self-referral.** Enforced by the anti-abuse checks above.
- **Within the cap.** The referrer hasn't exceeded `«ANTI_ABUSE_RATE_LIMIT»` for the period.

**Hard rule on `«JURISDICTION»` compliance.** Cash-payout referral programs in many jurisdictions trigger reporting / withholding / consumer-protection requirements. **Default to product credits, not cash.** Only graduate to cash payouts after a compliance review per [`PAYMENTS_COMPLIANCE.md`](./PAYMENTS_COMPLIANCE.md) — never as the launch default.

---

## Mechanics implementation checklist

What gets built. Each item is a discrete deliverable; the program isn't "shipped" until every checked item is live.

- [ ] **Referral code generation.** Code generated on user creation; unique constraint enforced; stored as `«referralCode»` on the user record.
- [ ] **Share URLs.** Profile / dashboard surface exposes the user's referral URL with copy + native-share. Optional channel-specific buttons (email / SMS / social).
- [ ] **Attribution cookie.** First-party `«referralCookieName»` set on landing with `?ref=` param; expiry = `«ATTRIBUTION_WINDOW»`.
- [ ] **Attribution write at signup.** `referredBy` field populated on the friend's user record from the cookie; idempotent (first-touch wins); no overwrite on subsequent signups.
- [ ] **Eligibility evaluator.** Pure function `«REFERRAL_ELIGIBILITY_EVALUATOR»` that reads the friend's state (`activated`, `paying`, `survived-cooling-window`) and returns `eligible` / `not-yet` / `disqualified`. Unit-tested per branch.
- [ ] **Payout / credit write.** On eligibility = `eligible`, credit the referrer per `«REFERRER_BENEFIT»` (e.g. add credits to the referrer's account; or queue a `«PAYMENTS»` payout). Idempotent — same referral can only credit once.
- [ ] **Anti-abuse checks.** Self-referral, sybil, velocity, fingerprint, jurisdiction — wired into the payout decision; pause on suspicion.
- [ ] **Comms email triggers.** Cross-ref [`EMAILS_WORKFLOW.md`](./EMAILS_WORKFLOW.md) for the templates:
  - **Friend lands & signs up** → "Welcome — you got `«FRIEND_BENEFIT»` thanks to «referrer name»."
  - **Eligibility crosses → payout** → referrer notified "Your friend «name» activated. You earned `«REFERRER_BENEFIT»`."
  - **Anti-abuse hold** → referrer notified the payout is under review; not a "you're banned" — a polite hold.
- [ ] **Referrer dashboard.** Lists referred users with status (pending / eligible / disqualified) and pending / earned totals.
- [ ] **Audit log.** Every attribution and payout decision logged with timestamp, decision, reason — retention per the data-retention policy.
- [ ] **Analytics events.** `referral_link_clicked`, `referral_signup`, `referral_eligible`, `referral_payout` — instrumented per [`OBSERVABILITY.md`](./OBSERVABILITY.md). Cross-ref the events to the metrics below.

---

## KPI: viral coefficient + break-even economics

### Viral coefficient («K_FACTOR_TARGET»)

The K-factor: average **referred users acquired per existing user** during the attribution window.

```
K = (invites per user) × (conversion rate of an invite to an activated signup)
```

- **K = 1.0** → each user generates exactly one new user. Self-sustaining growth.
- **K > 1.0** → exponential growth (rare; usually marketing claim, not reality).
- **K < 1.0** → the program adds to acquisition but doesn't replace other channels. Most realistic outcome.

Target: `«K_FACTOR_TARGET»` (e.g. K = 0.3 — each user generates 0.3 new users on average; combined with other channels, contributes meaningfully without being the whole engine).

Read from analytics weekly. If K is **far below** target after `«K_READ_WINDOW»` (e.g. 60 days), the program isn't working — diagnose (low invite rate? low conversion rate? wrong benefit?) before scaling.

### Break-even economics

The cost-of-acquisition math. The program is **viable** only if:

```
(cost of «FRIEND_BENEFIT» + cost of «REFERRER_BENEFIT») < LTV of the new user × probability the user activates
```

- **Cost side.** Add `«FRIEND_BENEFIT»` (face value or marginal cost — if it's a free month of a high-margin product, the marginal cost is small; if it's cash, the marginal cost is face value).
- **Revenue side.** LTV per [`PRICING_STRATEGY.md`](./PRICING_STRATEGY.md). For early-stage products, LTV is a guess — be conservative.
- **Probability of activation.** The fraction of referred signups that cross `«ACTIVATION_DEF»` (read from analytics).

If the math doesn't work, the program is a CAC subsidy in disguise — scaling it loses money faster. Defer to the `unit-economics-pressure-test` skill (if available) for a formal break-even read **before** launching the program at scale.

**Hard rule.** Don't scale a referral program past the cohort gate from `MANAGER_LAUNCH_GTM` (e.g. first 200 activated users) until the break-even math is positive. A program that's losing money per referral isn't fixed by sending more referrals.

---

## Cross-references

- [`COMMUNITY_MODEL.md`](./COMMUNITY_MODEL.md) — where the referral loop sits inside the wider acquisition engine. Referrals are one growth surface; this doc owns the referral-specific mechanics.
- [`ACTIVATION_EVENT.md`](./ACTIVATION_EVENT.md) — the eligibility gate. Payout fires only when the friend satisfies `«ACTIVATION_DEF»`.
- [`PRICING_STRATEGY.md`](./PRICING_STRATEGY.md) — the prices `«FRIEND_BENEFIT»` and `«REFERRER_BENEFIT»` are denominated in; the refund policy that defines `«COOLING_WINDOW»`.
- [`PAYMENTS_COMPLIANCE.md`](./PAYMENTS_COMPLIANCE.md) — cash-payout referral programs need a compliance read under `«JURISDICTION»` before launching.
- [`EMAILS_WORKFLOW.md`](./EMAILS_WORKFLOW.md) — the comms templates the program triggers.
- [`OBSERVABILITY.md`](./OBSERVABILITY.md) — the analytics events backing the K-factor and break-even metrics.
- [`METRICS.md`](./METRICS.md) — where the referral KPIs slot into the wider metric tree.
- [`DECISION_LOG.md`](./DECISION_LOG.md) — any policy change to the model, benefit size, or eligibility goes here.
- `MANAGER_LAUNCH_GTM` (in the AI library) — the launch sequence the referral program slots into; don't scale referrals past the cohort gate without a break-even read.

---

## Anti-patterns

- **Paying on signup.** Maximum-fraud surface. Default to payout on activation at the earliest.
- **Cash payouts as the launch default.** Triggers AML / tax / consumer-protection rules under `«JURISDICTION»` — start with product credits, graduate to cash only after compliance review.
- **No cap on referrals per referrer.** Sybil farms; one motivated bad actor exfiltrates the program's entire budget.
- **No attribution window.** A click from 2 years ago shouldn't earn a payout. `«ATTRIBUTION_WINDOW»` is required.
- **Overwriting first-touch attribution.** A friend who lands via referrer A, then later via referrer B, should reward A. First-touch is defensible; last-touch is gameable.
- **Scaling before the break-even math is positive.** The program is a CAC subsidy at that point — every new referral loses money.
- **K-factor optimism.** Most products land around K = 0.1–0.4. K > 1.0 is marketing copy, not reality. Plan for K < 1.0 and treat overperformance as upside.
- **No audit log.** Without per-decision logging, abuse cleanup is impossible.
- **Tying referrer payouts to friend lifetime revenue forever.** A clean payout terminates the relationship; an open-ended payout creates accounting / compliance / dispute surface that compounds.
- **Treating "the referral program isn't working" as a launch problem.** Most often it's an ICP / activation problem — referrals can't fix a product users aren't excited to share.
