# RFC «N» — «SHORT_TITLE»

**Date:** «DATE»
**Author:** «AUTHOR»
**Status:** Proposed — awaiting decision (Accept / Decline / Defer)
**Category:** «CATEGORY» (e.g. Developer Velocity · Code Quality · Production Readiness · Content & Marketing · Observability & Ops · Architecture · Security)
**Effort:** «EFFORT» (Small ≈ 1–2h · Medium ≈ 3–6h · Large ≈ 6–12h+)

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_RFC_TEMPLATE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/RFC-«N»-«slug».md` (or `docs/rfcs/«N»-«slug».md` if you keep RFCs in a subfolder) and localize the items below. **One RFC = one proposal = one file.** Do not stack multiple proposals in one RFC; if you have several, file several.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the CARD SHAPE (Problem → What it does → Effort → Category → Decision → Rationale → Related), then replace every «placeholder» with the proposal's facts.
>
> **Local definitions to provide per repo** (fill inline):
> - `«N»` — the RFC number (monotonic; check the highest existing `docs/RFC-*.md` and add one)
> - `«SHORT_TITLE»` — 3–6 words; becomes the filename slug
> - `«CATEGORY»` — which dimension of the system this RFC moves
> - `«EFFORT»` — rough size, not a commitment (Small / Medium / Large)
> - `«PROBLEM»` — the concrete pain, with `file:line` references where known
> - `«PROPOSAL»` — what the change actually does (bullet list of concrete actions)
> - `«DECISION»` — Accept / Decline / Defer (with revisit-when), filled at decision time
> - `«RATIONALE»` — why the decision was made; what tradeoff was chosen
>
> **Cross-refs:** `MANAGER_DECISION_LOG.md` — an RFC is a **proposed decision**. Once accepted, the outcome graduates into `DECISION_LOG.md` (Decision / Why / Alternatives / Revisit-when). A declined RFC stays in `docs/RFC-«N»-…` as the record of "we thought about this and chose not to" — equally valuable architectural memory. **Don't duplicate**: the RFC owns the proposal trail; the decision log owns the outcome.

---

## Problem

«PROBLEM»

(what to write here: 2–6 sentences describing the concrete pain. Include `file:line` references, current behavior vs. expected behavior, and *why this hurts now* — not abstract or speculative pain. If the problem is "nobody has visibility into X," say what surface they look at today and what's missing.)

## What it does

«PROPOSAL»

- «concrete action 1» (e.g. installs «tool» and runs it as «command»)
- «concrete action 2» (e.g. reports X per Y, flags Z above threshold)
- «concrete action 3» (e.g. adds a CI gate / a Husky hook / a new route / a new env var)
- «concrete action 4»

(what to write here: bullet the **concrete moving parts** of the proposal. A reader should be able to estimate it themselves after reading this list. If you can't list 3+ concrete actions, the proposal isn't shaped enough to decide on yet — sketch more, then RFC.)

## Effort

«EFFORT» — rough estimate, not a commitment.

- **Small** ≈ 1–2 hours (config change, small script, single skill)
- **Medium** ≈ 3–6 hours (a new endpoint, a CI workflow, a non-trivial skill, a small migration)
- **Large** ≈ 6–12+ hours (a new integration, a webhook system, a multi-file refactor)

If "Large," consider splitting into multiple RFCs so each can be decided / shipped independently.

## Category

«CATEGORY»

Used for prioritization at decision time. Common categories:
- **Developer Velocity** — makes daily work faster / less error-prone
- **Code Quality & Reliability** — catches bugs before ship, enforces standards
- **Production Readiness** — unblocks or hardens production deployment
- **Content & Marketing** — copy, translations, SEO, CMS
- **Observability & Ops** — monitoring, deployment confidence, incident tooling
- **Architecture** — structural changes, new domains, dependency moves
- **Security** — auth, rate limiting, CSP, secret handling

## Alternatives considered

- _«Alternative A»_ — «why it loses to the proposal»
- _«Alternative B»_ — «why it loses, or why deferred»
- _Do nothing_ — «cost of inaction»

(what to write here: at least one realistic alternative, including "do nothing." If there's no alternative, the RFC is probably too obvious to need a record — just ship it.)

## Decision

> **`«DECISION»`** — «filled at decision time: Accept / Decline / Defer-until-«condition»»

- **Decided on:** «DATE»
- **Decided by:** «who signed off»

## Rationale

«RATIONALE»

(what to write here: 2–4 sentences. Why this decision and not the alternatives? What tradeoff was chosen? If `Defer`, name the condition that flips it to `Accept` — "revisit after first 100 paying users," "revisit when bundle exceeds 500KB," etc. Vague defers ("maybe later") become silent declines and waste the RFC.)

## Consequences

- **If Accepted:** «what changes immediately, what follow-up tickets this spawns, what success looks like 30 days from now»
- **If Declined:** «what remains broken / unaddressed; whether a smaller version is still on the table»
- **If Deferred:** «what condition triggers re-evaluation; who watches for it»

## Related

- **Files / paths affected:** «list of paths the build would touch»
- **Decision log entry:** if Accepted, link the resulting `DECISION_LOG.md` entry once written; if Declined, this RFC IS the record — note that here
- **Related RFCs:** «numbers of any RFCs that depend on or are blocked by this one»
- **Issue / PR:** «issue number, PR link if a build exists»
