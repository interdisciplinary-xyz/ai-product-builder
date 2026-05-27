# «PROJECT» — Product Roadmap

> **Last updated:** «DATE» (e.g. 2026-05-25)
> **Branch:** «TRUNK» (e.g. main)

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_ROADMAP` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/ROADMAP.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The structure (vision → testable hypothesis → feature-completeness matrix → removed-from-scope → milestones with acceptance criteria/targets → out-of-scope) is generic; the example vision, hypothesis, matrix rows, and milestones are placeholders to replace.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product this roadmap covers
> - `«VISION_STATEMENT»` — the product vision paragraph
> - `«BETA_HYPOTHESIS»` — the testable hypothesis and its pass thresholds (retention %, satisfaction %)
> - `«FEATURE_STATE_MATRIX»` — surfaces and their shipped/planned state
> - `«MILESTONES»` — the upcoming milestone breakdown and version cadence
> - `«MILESTONE_TRACKER_URL»` — link to the live ticketed plan (e.g. GitHub milestones)

The roadmap below tracks **what is shipping** (completed) and **what is next** (organized by milestone in the issue tracker). For the live, ticketed plan see «MILESTONE_TRACKER_URL» — this document is the human-readable strategic frame.

---

## Vision

(What to write here: the `«VISION_STATEMENT»` — a short paragraph on what the product does and the change it creates for users. Then the testable `«BETA_HYPOTHESIS»` with explicit pass thresholds.)

«VISION_STATEMENT — one paragraph describing the product and its core value.»

The product hypothesis to test («N»-user beta) _(assumes a pre-PMF product — adapt the gates if you're past PMF)_: «BETA_HYPOTHESIS» (what users will do, plus pass thresholds, e.g. week-4 retention above X% and a satisfaction/"very disappointed" rate clearing Y%).

---

## Feature Completeness Overview

(What to write here: the `«FEATURE_STATE_MATRIX»` — one row per surface with its current state. Mark shipped with ✅; note planned/partial states inline. Keep the headers; replace the placeholder row.)

Every row below is **shipped** unless explicitly noted. Items removed from scope are listed in the next section.

| Surface         | State                                       |
| --------------- | ------------------------------------------- |
| «Surface name»  | «✅ shipped detail / ⏳ planned / partial»  |

(One row per «surface».)

---

## Removed from Scope

(What to write here: features that were built then cut to sharpen focus. Note where/when removed and what was cleaned up. Keep the headers; replace the placeholder row. Omit this section if nothing was removed.)

| Removed in   | Feature                          |
| ------------ | -------------------------------- |
| «ref / date» | «what was removed and why»       |

(One row per removed feature.)

---

## Active Milestones (live in the issue tracker)

(What to write here: the `«MILESTONES»` breakdown. One `###` per milestone with a version label and relative target. Lead with a one-line goal, then bullet the acceptance criteria. Drop real version numbers/dates in the canonical template; fill them per repo.)

### «vX.Y» — «Milestone name» _(target: «relative or absolute»)_

«One-line goal for this milestone.»

- «Acceptance criterion / deliverable»
- «Acceptance criterion / deliverable»

### «vX.Y+1» — «Milestone name» _(target: «relative or absolute»)_

«One-line goal — e.g. onboard the first «N» users; define and measure activation/retention.»

- «Acceptance criterion / deliverable»

(Repeat one section per milestone. Suggested arc: launch readiness → first users → PMF signal → activation optimization → monetization validation → post-PMF decision _(assumes a pre-PMF product — adapt the gates if you're past PMF)_. Adapt to your product.)

---

## Out of Scope (For Now)

(What to write here: items deliberately deferred until a gate is cleared (e.g. PMF confirmed). One bullet each. Note the re-evaluation trigger. _(assumes a pre-PMF product — adapt the gates if you're past PMF)_)

Items deliberately deferred until «gate» (e.g. PMF is confirmed). Re-evaluate after «milestone».

- «Deferred item 1»
- «Deferred item 2»

«One line on what gets re-prioritized first if the gating decision is to expand.»
