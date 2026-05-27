# Ideal Client Profiles

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_ICP` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/ICP.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (confidence labels → strategic frame → per-persona sections → anti-ICP → funnel map → channel matrix → messaging cheat-sheet → validation plan → evolution rules); replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product this ICP governs
> - `«ICP_PERSONAS»` — the named personas (1–3 typical; deferred personas marked as such)
> - `«ICP_STRATEGIC_FRAME»` — the one-sentence go-to-market wedge that explains *why* this persona, *now*
> - `«PERSONA_NAME»`, `«PERSONA_TAGLINE»`, `«PERSONA_SNAPSHOT»` — per-persona identity
> - `«PERSONA_DEMOGRAPHICS»`, `«PERSONA_BEHAVIORS»`, `«PERSONA_ALTERNATIVES»` — situation
> - `«PERSONA_AHA_MOMENT»`, `«PERSONA_VALUES»`, `«PERSONA_NEEDS_NOT»` — value signals
> - `«PERSONA_PRICING»`, `«PERSONA_RETENTION_BET»` — economics
> - `«PERSONA_CHANNELS»` — where to find them
> - `«ANTI_ICP_GROUPS»` — the wrong-audience / wrong-product / wrong-scale / wrong-intent table rows
> - `«VALIDATION_CRITERIA»` — the per-persona validation + falsifying signals
> - `«ICP_REVIEW_CADENCE»` — when this doc is revisited (e.g. after every 5-interview batch, at 30/90 days post-launch)

Source-of-truth document for who «PROJECT» is built for.

This is a working tool, not marketing fluff. Every product decision (features, copy, pricing, channels, integrations) should test against the personas below. If the answer is _"this serves none of them,"_ the decision is probably wrong.

> **Status.** State the doc's status — pre-launch hypothesis vs. validated against `«N»` paying customers. Every persona below is a *bet* until proven by data. The "Validation plan" section at the end defines how we'll know which parts of this doc survive contact with reality.

---

## Confidence labels

Every numerical or behavioral claim in this doc carries one of three tags:

| Tag             | Meaning                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| `[shipped]`     | Verifiable in the code, CMS, or production data right now                   |
| `[v«X»-target]` | Planned for the named release; not yet in code (pricing, features, etc.)    |
| `[hypothesis]`  | Educated guess, no data yet — must be validated post-launch                 |

Treat `[hypothesis]` claims as falsifiable bets, not facts. When you cite this doc in a decision, cite the tag too.

---

## How to use this doc

Before merging a feature, writing copy, or running a campaign, ask:

1. **Whom does this serve?** Name a persona from `«ICP_PERSONAS»`. If you can't, it's not ICP-aligned.
2. **What signal does it trigger for them?** Pride · upgrade desire · retention · referral. If none, why are we building it?
3. **What does this take away from the others?** Resource trade-offs are real. Be honest about who you're prioritizing.
4. **Would the anti-ICP also benefit?** If yes, you're at risk of attracting the wrong audience. Fix the framing.

When stuck, default to the persona that funds the runway you'd need to serve the others.

---

## The strategic frame

«ICP_STRATEGIC_FRAME» — the one-paragraph go-to-market thesis. Name the wedge persona, the artefact or behavior that converts them, and the loop by which they pull in the next persona.

Three implications to spell out:

1. **What the hero feature is** — the one capability that the wedge persona pays for.
2. **What the viral / referral loop is** — how use of the product creates a touch-point with the next persona.
3. **What funds what** — which tier funds development, which tier funds growth, and what threshold gates the next investment.

> **Note on positioning drift.** If positioning has shifted since the last update, name the superseded doc(s) and flag them stale.

---

## Persona template

For each persona in `«ICP_PERSONAS»`, fill the following sections. Keep deferred personas (e.g. team / enterprise tier you are not yet building for) explicitly marked as such — they exist in this doc to clarify what we are *not* doing.

### Persona «N»: «TIER_NAME» — _"«PERSONA_TAGLINE»"_

#### Snapshot

> «PERSONA_SNAPSHOT» — name, age, role, location, years in role. One paragraph on how they found `«PROJECT»` and what they did next.

#### Demographics + situation `[hypothesis]`

- **Age**: «AGE_RANGE»
- **Geography**: «GEOGRAPHIES»
- **Income**: «INCOME_RANGE»
- **Tech sophistication**: «TECH_LEVEL»
- **Time horizon**: «TIME_HORIZON»

#### Current behavior `[hypothesis]`

- «BEHAVIOR_1»
- «BEHAVIOR_2»
- «BEHAVIOR_3»

#### Today's alternatives (what they do without us)

- «ALTERNATIVE_1»
- «ALTERNATIVE_2»

Name what we replace, what we don't compete with, and the viral hook (if any) we add on top.

#### What brings them to «PROJECT»

«ARRIVAL_TRIGGER» — the signal, the channel, the headspace they're in.

#### The aha moment `[hypothesis]`

«PERSONA_AHA_MOMENT» — the specific in-product event that turns curiosity into commitment. Sequenced as: signup → aha → conversion, with **timing gates** (is this gated by product friction or by external user cadence?).

#### What they value

- «VALUE_1»
- «VALUE_2»
- «VALUE_3»

#### What they do NOT need

- «PERSONA_NEEDS_NOT_1»
- «PERSONA_NEEDS_NOT_2»

This list is as important as the "what they value" list — it tells the roadmap what to refuse.

#### Where to find them

- «PERSONA_CHANNELS» — communities, social platforms, podcasts, peer groups.

#### Pricing / economics

«PERSONA_PRICING» — tier name, price point, price label (e.g. `[v«X»-target]` if not yet live). Include a small calibration table:

| Calibration point | Math |
| ----------------- | ---- |
|                   |      |

#### Retention bet `[hypothesis]`

«PERSONA_RETENTION_BET» — target retention rate, lock-in mechanism, validation point.

#### Implications for product

- «PRODUCT_IMPLICATION_1»
- «PRODUCT_IMPLICATION_2»

---

## Anti-ICP — who NOT to acquire

Grouped by _why_ they're a trap, since the response differs for each.

### Wrong audience (will never pay)

| Persona | Signal to watch for |
| ------- | ------------------- |
| «WRONG_AUDIENCE_1» | «SIGNAL_1» |
| «WRONG_AUDIENCE_2» | «SIGNAL_2» |

**Response:** Don't kill the funnel for them — they're cheap. But don't measure success on their signups, and watch out for them inflating activation metrics.

### Wrong product (we're not what they think we are)

| Persona | Signal to watch for |
| ------- | ------------------- |
| «WRONG_PRODUCT_1» | «SIGNAL_1» |
| «WRONG_PRODUCT_2» | «SIGNAL_2» |

**Response:** Update copy to clarify context. Reject feature requests that drag toward the wrong use case.

### Wrong scale (too big for us, we're too small for them)

| Persona | Signal to watch for |
| ------- | ------------------- |
| «WRONG_SCALE_1» | «SIGNAL_1» |

**Response:** Politely decline. Re-evaluate at `«SCALE_THRESHOLD»` only.

### Wrong intent (defeats the value prop)

| Persona | Signal to watch for |
| ------- | ------------------- |
| «WRONG_INTENT_1» | «SIGNAL_1» |

**Response:** Add a structural constraint (e.g. require real-name, require domain match) so the value prop holds.

When acquisition campaigns or content drift toward these audiences, kill those channels. They inflate metrics without driving revenue or PMF signal.

---

## Funnel mapping

| Stage          | Persona inhabits this stage | Conversion to next |
| -------------- | --------------------------- | ------------------ |
| **Awareness**  | «AWARENESS_PERSONA»         | «AWARENESS_CONV»   |
| **Activation** | «ACTIVATION_PERSONA»        | «ACTIVATION_CONV»  |
| **Conversion** | «CONVERSION_PERSONA»        | «CONVERSION_CONV»  |
| **Retention**  | «RETENTION_PERSONA»         | «RETENTION_CONV»   |
| **Expansion**  | «EXPANSION_PERSONA»         | «EXPANSION_CONV»   |

State the key insight — whether your personas are *different* people or the *same* person at different funnel stages. The acquisition strategy diverges sharply between those two cases.

---

## Acquisition channels by ICP

| Channel | «PERSONA_1» | «PERSONA_2» | «PERSONA_3» |
| ------- | ----------- | ----------- | ----------- |
| «CHANNEL_1» |   |   |   |
| «CHANNEL_2» |   |   |   |
| «CHANNEL_3» |   |   |   |
| Paid ads    |   |   |   |

Note explicit avoidances (e.g. paid ads pre-PMF) with a target trigger for revisiting.

---

## Messaging cheat sheet by persona

### Homepage hero

> «HOMEPAGE_HERO» — the sentence each persona should recognize themselves in within 1 second.

### Upgrade page (per paying tier)

> «UPGRADE_HEADLINE»
> **«PRICE_POINT»**
> · «UPGRADE_BULLET_1»
> · «UPGRADE_BULLET_2»

### Email subject lines by persona

| Email type | «PERSONA_1» | «PERSONA_2» | «PERSONA_3» |
| ---------- | ----------- | ----------- | ----------- |
| Welcome    |             |             |             |
| Activation nudge |       |             |             |
| Retention  |             |             |             |
| Monthly newsletter |     |             |             |

---

## Validation plan

Personas are bets. Here's how we know each one is real.

### Per-persona validation criteria

For each persona, define a small set of `«VALIDATION_CRITERIA»` with explicit thresholds, e.g.:

- ≥ «N»% of registered users complete the activation event within «WINDOW» `[shipped: NORTH_STAR target]`
- Median time from signup to first share is `<` «DAYS»
- ≥ «N»% of paid upgrades happen within «DAYS» of signup (fast conversion = right persona)
- ≥ «N»% Y1 retention measured on first cohort that hits 12 months

**Falsifying signal** (per persona): the explicit condition under which we'd conclude this persona is wrong and rewrite. Without a falsifier, the persona is a bet with no stop-loss.

### Review cadence

- **After every «PMF_COHORT_SIZE»-customer interview batch** — update relevant persona sections.
- **At `«ICP_REVIEW_30D»` post-launch** — first quantitative pass against validation criteria.
- **At `«ICP_REVIEW_90D»` post-launch** — second pass; commit or pivot.

Findings from each review go into git history; preserve the prior hypothesis in the commit log so future-you can see what we used to believe and why it changed.

---

## How this doc evolves

Update when:

- **The first «FIRST_N_PAYING» paying customers don't fit any of these personas.** Then we discovered who `«PROJECT»` _actually_ serves; rewrite to match reality.
- **A new use case emerges from interviews.** Add a new persona only if «N»+ customers ask for the same thing across different sessions.
- **We pivot positioning.** Major rewrite required, with `docs/PRODUCT_POSITIONING.md` updated in the same PR.
- **Pricing changes** materially shift who's in scope.

Doc gets revisited every quarter at minimum, and after every «PMF_COHORT_SIZE»-interview research batch.

---

## Cross-references

- `docs/PRODUCT_POSITIONING.md` — what `«PROJECT»` _is_ and _isn't_
- `docs/BRAND_VOICE_GUIDELINE.md` — how to write for these personas
- `docs/ROADMAP.md` — what we're building for them
- `docs/PRICING_STRATEGY.md` — current pricing implementation
- `docs/NORTH_STAR.md` — the metric we're optimizing across all personas
- `docs/ACTIVATION_EVENT.md` — what counts as "activated" (gates the PMF read)
- `docs/USER_RESEARCH.md` — interview + observation scripts (incl. Sean Ellis PMF)

---

_Last updated: «DATE» — «UPDATE_NOTE»._
