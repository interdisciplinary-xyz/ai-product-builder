# 20 Power Moves — «PROJECT»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_POWER_MOVES` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/POWER_MOVES.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (boardroom-read across CEO/CTO/CFO/Data lenses → legend → ~20 moves grouped A–G → mental-models index → one-line summary), then **generate all 20 moves against your target repo's actual constraints** — do not ship the example moves. The shape is the artefact; the moves are per-launch.
>
> **Pairs with:** `MANAGER_LAUNCH_GTM.md` (the GTM order-of-ops these moves slot into), `RUNBOOK_DECISION_THRESHOLDS.md` (the verdict bands these moves are guard-railed by), `RUNBOOK_NORTH_STAR.md` (the metric every move ultimately moves), `RUNBOOK_PRE_LAUNCH_CHECKLIST.md` (the engineering launch gate the "unblock launch" moves point at), `MANAGER_DISCOVERY.md` (the PMF read the "protect the PMF read" moves preserve), `MANAGER_FOUNDER_OPS.md` (the cadence in which moves get executed). If the user's Claude session has the `unit-economics-pressure-test` skill installed, defer the CFO-lens moves' math to it.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product
> - `«HORIZON»` — the time window these moves cover (e.g. next 30 days, this quarter, pre-launch sprint)
> - `«STAGE»` — current stage (pre-launch / launched-pre-PMF / post-PMF / scaling)
> - `«NORTH_STAR_METRIC»` — the metric all moves serve (from `RUNBOOK_NORTH_STAR.md`)
> - `«VERDICT_COHORT_SIZE»` — the activated-cohort size that triggers the verdict (from `RUNBOOK_DECISION_THRESHOLDS.md`)
> - `«VERDICT_WINDOW_END»` — the deadline date for the read window (from `RUNBOOK_DECISION_THRESHOLDS.md`)
> - `«PRICE_POINT»` — the headline price (for the CFO-lens moves)

---

> **Last updated:** «DATE» · **Horizon:** «HORIZON» · **Stage:** «STAGE»
> (verdict read at the **«VERDICT_COHORT_SIZE»-activated-user** mark against `decision-thresholds.md`; window neutral to **«VERDICT_WINDOW_END»**).
>
> Prioritised by **Theory of Constraints** (fix the bottleneck first), **80/20**, and **Inversion** (eliminate what guarantees failure).

---

## Boardroom read — where we actually are

The boardroom read is the single most important section. It forces the founder to look at the product through four independent lenses **before** picking moves — so the moves come out of the constraint, not out of the comfort zone.

| Lens         | Finding                                                                                                                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CEO / PO** | The current stage in plain language. The North Star metric. The honest read on whether the product is over-built / under-distributed / mid-PMF. The binding constraint right now (one sentence).                                                                                    |
| **CTO**      | What's strong (tests, observability, infra). What's a launch-critical gap (open P1s, masked errors, env corruption, missing instrumentation). One sentence on "if launch flopped tomorrow on a technical reason, it would be this."                                                  |
| **CFO**      | Payments status (sandbox / live). COGS read. Headline price. Stripe/Paddle/whatever fee floor. The headline financial unknown (e.g. conversion rate untested; LTV unmeasurable; unit economics not pressure-tested).                                                                |
| **Data / Growth** | Instrumentation health: are the funnel events, activation event, PMF-survey trigger all wired? What's missing — a new event, or just a saved view on existing events? One sentence on what would block the PMF read if launch happened today.                                  |

**Blunt cross-exec verdict (one paragraph):** what's the actual problem? "Not a product problem — a distribution + can't-take-money + flying-blind problem"-shaped sentence. Forces the move list to reflect reality, not preference.

---

## Legend

| Field      | Meaning                                                           |
| ---------- | ----------------------------------------------------------------- |
| **Lens**   | Which exec champions it — `PO` · `CTO` · `CFO` · `CEO` · `Growth` |
| **Model**  | The mental model that justifies the move                          |
| **Effort** | Rough size — `S` (<½ day) · `M` (1–2 days) · `L` (3+ days)        |
| **Ref**    | Issue / ticket / ADR reference (optional)                          |

---

## A. Unblock the launch (the binding constraint)

Moves that, if not done, mean the launch literally cannot happen or cannot be measured. These are **always first**.

Typical shape (fill per repo):

- **Flip payments to live.** `CFO` · _Theory of Constraints_ · **S** — the entire free→paid signal is unmeasurable in sandbox. Flip live; run one real founder transaction end-to-end; confirm the webhook sets the plan.
- **Run a launch-day pre-mortem.** `CTO` · _Prospective hindsight + Inversion_ · **S** — ask "it's 4 weeks on and launch flopped — why?" Force the top 5 (spam-foldering, SSR 500, webhook 5xx, broken share link, a11y blocker) and pre-empt each before the smoke test.
- **Restore prod eyes before users arrive.** `CTO` · _You can't manage what you can't see_ · **S** — re-enable source-map upload + verify error monitoring + verify analytics receive the activation event. Launching blind to prod errors on your one first impression is reckless.

## B. Protect the PMF read (don't fool yourself)

Moves that preserve the integrity of the PMF read once the cohort lands. These are **second**, because a launch without a clean read is a launch without a learning.

Typical shape (fill per repo):

- **Build the verdict funnel before the data, not after.** `PO` · _Goodhart's Law_ · **M** — wire the exact threshold events into one analytics funnel so the cohort read is mechanical, not a scramble. Measure the metric that decides the verdict — nothing else.
- **Lock the scoring rubric as a Ulysses pact.** `PO` · _Commitment device + Confirmation bias_ · **S** — finish the PMF scoring methodology **now, before responses arrive**, so polite "very disappointed" gets discounted by a rule rather than by hope.
- **Make the must-have question falsifiable.** `PO` · _Falsifiability (Popper)_ · **S** — ship + tag the day-«N» "what's the main benefit?" capture so the two value-prop hypotheses are decided by data, not vibes.
- **Don't peek early.** `CEO` · _Discipline over confirmation bias_ · **S** — `DECISION_THRESHOLDS.md` says read at «VERDICT_COHORT_SIZE» activated — honour it. A mid-week vanity check is itself a bias signal. (A deliberate _do-nothing_ move.)

## C. Move the north-star levers (activation + share)

Moves that move `«NORTH_STAR_METRIC»` directly. Picked from the funnel where the drop-off is biggest (Theory of Constraints applied to user flow, not infrastructure).

Typical shape (fill per repo):

- **Fix the highest-leverage email personalization gap.** `CTO / PO` · _Peak-end + Personalisation_ · **S** — re-engagement CTR < «threshold» is a **kill** signal; broken personalisation (e.g. raw email local-part as greeting) sabotages it.
- **Drive time-to-first-value under «N» minutes.** `PO` · _Theory of Constraints + Zeigarnik_ · **M** — instrument per-screen drop-off on the core flow; cut or merge the lowest-signal screens. The faster the "aha", the higher every downstream metric.
- **Make sharing the default, not a choice.** `PO / Growth` · _Default effect + Network effects_ · **M** — if the North Star is _shared_ artefacts, post-creation surface a one-tap, pre-filled share CTA. Reduce friction to near zero.
- **Engineer the reveal as the "peak".** `PO` · _Peak-end rule_ · **M** — the value-artefact reveal is the emotional high of the whole flow. Make it feel specific (not a horoscope) and instantly shareable.

## D. Cheap pre-PMF distribution loops

Moves that compound traffic / signups without paid spend, picked for high leverage at the current cohort gate.

Typical shape (fill per repo):

- **Seed N friendly partner accounts to test the wedge hypothesis.** `Growth` · _Network effects / wedge_ · **M** — instrument the referral / referredBy attribution. If the wedge hypothesis holds, that's the flywheel to pour into.
- **Concentrate SEO on the top «N» intents.** `Growth` · _80/20 + Lindy / compounding_ · **M** — pick the few highest-intent keywords and compound them across the weeks-to-verdict — don't spread thin across all of them.
- **Anchor + loss-frame at the comparison ceiling.** `CFO / Growth` · _Anchoring + Loss aversion_ · **S** — at the free-tier wall, show the strike-through annual vs monthly + the "you've used your free X" copy. Precisely where pricing hypotheses get measured.
- **Email onboarding drip.** `PO / Growth` · _Rule of 7 + Commitment & Consistency + Zeigarnik_ · **M** — N% of users who complete the core flow never return. Email is the only re-engagement channel. Drip across days 0 / 1 / 3 / 5 / 7 — each email a micro-commitment; the "your X is N% complete" lever creates the open loop.
- **Blog / SEO translation blitz.** `Growth` · _First-Mover + Compounding_ · **S** — N posts × N locales = N×N indexed pages from existing content. Translation is pure leverage on already-written content; founder-written translations only (auto-translation kills the voice).
- **Public artefacts as SEO landing pages.** `Growth` · _Compounding + Zero-Price Effect_ · **S** — each user-generated public artefact is a unique long-tail page. Verify indexability, add JSON-LD schema, include in sitemap. SEO budget = 0, page count scales with users.

## E. Financial guardrails

Moves that prevent the company from making an expensive irreversible mistake. These are guardrails — pre-launch insurance, cheap to build.

Typical shape (fill per repo):

- **Run the unit-economics pressure test before paid acquisition.** `CFO` · _Margin of safety + Second-order thinking_ · **S** — find the break-even conversion at `«PRICE_POINT»` including the payment-processor fee floor. Know the number **before** any paid-acquisition spend. Defers math to `unit-economics-pressure-test` skill when available.
- **Add an AI-spend / external-service circuit breaker.** `CTO / CFO` · _Fail-safe / margin of safety_ · **S** — per-user limits cap one user; add a **global daily ceiling + alert** so a runaway loop or demo-endpoint abuse can't surprise the card.

## F. Engineering risk worth paying down now

Moves where the engineering debt has a launch-day-flavoured failure mode. Not "tech debt" in the abstract — specific gaps where green CI hides a landmine.

Typical shape (fill per repo):

- **Root-cause the masked critical error, stop hiding it.** `CTO` · _Five Whys + Normalization of deviance_ · **M** — a 500-class error hidden by retries: 2 is a user-facing 500 on first impression under real concurrency. Root-cause or add a graceful boundary — don't let green CI hide a launch-day landmine.
- **Evict the repo from `~/Documents` (iCloud-synced location).** `CTO` · _Eliminate the root cause / Occam_ · **S** — recurring truncation / duplicate / eviction corruption has one root cause: cloud-sync on a working directory. Move to a non-synced path. ~15 minutes; kills a whole incident class.
- **Close the a11y gap on the two highest-traffic surfaces.** `CTO / PO` · _No-regressions / circle of competence_ · **M** — the surfaces where the first cohort lives; an a11y blocker on those is an own-goal. Finish a focused audit — not a broad sweep.

## G. Strategic focus

The "stop doing things" moves. These are typically S-effort but L-impact because they recover the founder's attention.

Typical shape (fill per repo):

- **Declare a feature freeze until the verdict.** `CEO` · _Opportunity cost + Sunk-cost avoidance_ · **S** — building for 0 users is motion, not progress, and a moving product muddies the read. Freeze scope to launch-critical + instrumentation; everything else waits for the `«VERDICT_COHORT_SIZE»`-user verdict. Make the verdict-neutral window explicit policy.

---

## The one-month critical path

Dependency order (not list order). The shape below is the canonical sequencing — fill per repo:

```
[Payments live]
   → [De-risk infra: prod eyes, masked errors, dev env]
   → [Activation levers: email, time-to-value, share-default, reveal peak]
   → [Validation rails: funnel, rubric, must-have capture]
   → [Pre-mortem + smoke test → LAUNCH]
   → [Distribution loops: wedge, SEO, anchor/loss-frame, drip]
   → [Hold; read at «VERDICT_COHORT_SIZE» activated]
```

Run in parallel as guardrails: **unit economics pressure-test**, **spend circuit breaker**, **a11y on top 2 surfaces**, **feature freeze**.

---

## Mental-models index

The 20 moves draw on this index. Each move cites the model that justifies it (the move list above is the SHAPE; this index is the canonical mental-model vocabulary). Fill per launch.

`Theory of Constraints` · `Inversion` · `Prospective hindsight (pre-mortem)` · `Goodhart's Law` ·
`Commitment device` · `Confirmation bias` · `Falsifiability (Popper)` · `Peak-end rule` ·
`Zeigarnik effect` · `Default effect` · `Network effects` · `80/20 (Pareto)` ·
`Lindy / compounding` · `Anchoring` · `Loss aversion` · `Margin of safety` ·
`Second-order thinking` · `Five Whys` · `Normalization of deviance` · `Occam's razor` ·
`Opportunity cost` · `Sunk-cost avoidance` · `Rule of 7` · `Commitment & Consistency` ·
`First-Mover` · `Compounding` · `Zero-Price Effect` · `Endowment Effect` ·
`Hook Model` · `BJ Fogg (B=MAT)` · `Mental Accounting` · `Decoy Effect` ·
`Flywheel Effect` · `Mimetic Desire` · `Mere Exposure Effect` · `EAST Framework` ·
`Social Proof` · `Authority` · `Unity Principle` · `Pratfall Effect` · `Bandwagon Effect` ·
`First Principles` · `Map ≠ Territory` · `Barbell Strategy` · `Circle of Competence` ·
`Local vs. Global Optima` · `Diminishing Returns` · `Goal-Gradient`.

---

## What's NOT on this list (and why)

The discipline of the list is partly what it includes; equally important is what it explicitly *defers*. Fill per launch — common shapes:

| Skipped                          | Reason                                                          | Model                   |
| -------------------------------- | --------------------------------------------------------------- | ----------------------- |
| [Refactor that's dev-velocity-only] | Not user-facing. Ship after launch.                          | Local vs. Global Optima |
| [Incomplete flow that's not core MVP] | Not core to the value-prop hypothesis.                       | Circle of Competence    |
| [Custom admin dashboard]          | The CMS / Stripe / analytics admin is sufficient for launch.    | Occam's Razor           |
| [Multi-participant / multi-org feature] | Post-PMF feature. Zero users need this today.            | Opportunity Cost        |
| [Content rewrite without measurement] | Current content works. Rewrite after measuring completion.   | Second-Order Thinking   |
| [Server-side analytics enhancements] | Client-side is sufficient pre-PMF.                           | Pareto                  |

---

> **One-line summary:** [fill per launch — the blunt cross-exec verdict from the boardroom read above, restated as the move list's organizing thesis. E.g. "Not a product problem — a no-users + can't-take-money + flying-blind problem. Spend the «HORIZON» on distribution, validation, and launch-unblocking; freeze everything else until the «VERDICT_COHORT_SIZE»-user verdict."]
