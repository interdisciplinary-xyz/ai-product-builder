# «FEATURE_NAME» — Feature Spec

**Date:** «DATE»
**Branch:** «BRANCH» (e.g. `release/1.7.0`)
**Status:** Spec — awaiting sign-off; build deferred until acceptance
**Issue:** «ISSUE_LINK» (e.g. `#90`)

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_FEATURE_SPEC` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/SPECS/«FEATURE_NAME».md` (one file per feature) and localize the items below. **Pairs with** `MANAGER_DESIGN_REVIEW.md` (the playbook that creates & audits per-feature specs).
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (purpose statement → section table with funnel-stage verdict → proposed order → per-section spec (Job / Above-the-fold / Levers / Acceptance) → cross-cutting copy rules → out-of-scope → build plan → sign-off acceptance). The funnel framework (AIDA) is one example skeleton; substitute Jobs-To-Be-Done, AARRR, or any other structure that fits the feature.
>
> **Local definitions to provide per repo** (replace the example content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«FEATURE_NAME»` — the page or feature being spec'd (e.g. `homepage-aida-redesign`, `checkout-flow`, `onboarding-v2`)
> - `«SECTIONS»` — the list of sections / steps / surfaces this feature is composed of
> - `«FUNNEL_FRAMEWORK»` — the structure used to evaluate each section's job (e.g. AIDA — Attention/Interest/Desire/Action; AARRR; JTBD)
> - `«SKILLS_APPLIED»` — the agent skills / disciplines guiding this spec (e.g. marketing-psychology, copywriting, ui-ux-pro-max)
> - `«LEVERS»` — the marketing-psychology / behavioral levers each section pulls (e.g. anchoring, social proof, authority, loss aversion, decoy effect)
> - `«ACCEPTANCE»` — the testable pass criteria per section (viewport, a11y, copy length, link integrity)
> - `«COPY_RULES»` — the cross-cutting copy rules this spec must honor (deferred to `BRAND_VOICE_GUIDELINE.md` — restate, don't redefine)
> - `«OUT_OF_SCOPE»` — what this spec intentionally does NOT decide (visual pixels, analytics instrumentation, etc.)
>
> **Cross-refs:** `BRAND_VOICE_GUIDELINE.md` (copy rules), `UX_PRINCIPLES.md` (interaction patterns), `DESIGN_SYSTEM.md` (tokens & components — do not redefine here), `DECISION_LOG.md` (record any sub-decisions this spec produces, e.g. a section cut).

## What this spec is

Not a pixel-level redesign. A **structural rework** of «FEATURE_NAME» so each section has one clear job in the chosen funnel framework. Existing sections were authored individually; this spec proves each one is doing funnel-leveraged work and proposes cuts / merges / reorderings where it isn't.

Skills applied: «SKILLS_APPLIED»
(what to write here: the named disciplines guiding the spec — e.g. marketing-psychology for the levers, copywriting for headline discipline, ui-ux-pro-max for hierarchy, a brand/voice skill as the no-overclaim brake.)

## Current sections vs. «FUNNEL_FRAMEWORK» jobs

(Example uses AIDA — Attention / Interest / Desire / Action. Substitute another framework if it fits the feature better.)

| Section | Currently does | Funnel stage | Verdict |
|---|---|---|---|
| «Section1» | «what it does today» | «stage» (e.g. A) | KEEP / TIGHTEN / CUT / MOVE — «one-line reason» |
| «Section2» | «…» | «stage» | «…» |
| «SectionN» | «…» | «stage» | «…» |

(what to write here: every existing section, the job it does *today*, which funnel stage it serves, and a verdict — `KEEP`, `KEEP — needs tightening`, `MOVE`, or `CUT`.)

## Proposed order («FUNNEL_FRAMEWORK»-clean)

```
1. «Section»                — «Stage»   : «one-line job»
2. «Section»                — «Stage»   : «one-line job»
3. «Section»                — «Stage»   : «one-line job»
…
N. «Section»                — «Stage»   : «one-line job»
```

Removed: «sections cut» (with reason). Any cut that the user has not yet approved is tracked as a separate decision and noted in `DECISION_LOG.md`.

## Section-by-section spec

Repeat the block below for each kept / moved / tightened section. Every section MUST have all four headings (Job · Above-the-fold · Levers · Acceptance) — no exceptions. Empty headings are a smell that the section doesn't earn its place.

### «N». «SectionName» — «Funnel stage»

**Job:** «In one sentence, what this section achieves for the visitor. If the section can't be described in one sentence, it's doing too much — split it or cut it.»

**Above-the-fold content (in order):**
- «element 1» (e.g. tagline / small caption)
- «element 2» (e.g. H1 — max N words)
- «element 3» (e.g. subheadline — one sentence)
- «element 4» (e.g. primary CTA — verb-first, sentence case)
- «element 5» (e.g. secondary CTA — what action / where it goes)

**Below the fold (if any):**
- «supporting elements» (e.g. trust signal row, stat pills, social-proof carousel)
- Layout: «desktop layout» / «mobile layout»

**Marketing-psychology levers («LEVERS»):**
- **«Lever 1»** — «how this section pulls it» (e.g. *Anchoring* — the "60 seconds" framing sets the time-cost expectation low)
- **«Lever 2»** — «how this section pulls it»
- **«Lever 3»** — «how this section pulls it»

(what to write here: 2–5 named behavioral / persuasion levers from the marketing-psychology skill — anchoring, social proof, authority bias, loss aversion (softened), decoy effect, bandwagon, mimetic desire, activation-energy reduction, foot-in-the-door, pratfall, IKEA effect, etc. Each lever must say HOW this section pulls it — not just name-drop.)

**Acceptance («ACCEPTANCE»):**
- [ ] «testable criterion 1» (e.g. H1 is exactly one line on desktop and ≤ 2 lines on 320px-width mobile)
- [ ] «testable criterion 2» (e.g. primary CTA visible above the fold on a 720×1280 mobile viewport without scroll)
- [ ] «testable criterion 3» (e.g. axe a11y violations: 0)
- [ ] «testable criterion 4» (e.g. all critical elements fit in 720px viewport height)
- [ ] «testable criterion 5» (e.g. CTA copy matches the hero CTA verbatim — no surprise rewording)

(what to write here: 3–6 binary, machine-or-eye-checkable criteria. Every box must be tickable without judgment calls. "Looks good" is not acceptance; "H1 ≤ 8 words, axe 0 violations, CTA visible above 720px fold" is.)

---

(Repeat the block above for every section in the proposed order.)

## Cross-cutting copy rules

Per `BRAND_VOICE_GUIDELINE.md` — do **not** restate the full rulebook here; cite the rules this spec specifically depends on:

- «rule 1» (e.g. verb-first CTAs)
- «rule 2» (e.g. no guilt-driven framing; no urgency manipulation)
- «rule 3» (e.g. headlines max N words)
- «rule 4» (e.g. sentence case throughout — no Title Case)
- «rule 5» (e.g. calm-confidence tone)

«COPY_RULES»
(what to write here: any feature-specific copy constraints not already in `BRAND_VOICE_GUIDELINE.md` — e.g. EN/PL parity requirements, locale-specific sentence-case rules, a "no claim that can't be substantiated" gate.)

## Out of scope (this spec)

«OUT_OF_SCOPE»

- «item 1» (e.g. visual / pixel-level design — colors, fonts, spacing live in `DESIGN_SYSTEM.md`)
- «item 2» (e.g. new illustrations or photography)
- «item 3» (e.g. conversion analytics instrumentation — tracked in a separate issue)
- «item 4» (e.g. mobile-specific layouts beyond responsive breakpoints)

(what to write here: explicit non-goals. The point is to prevent scope creep during build and to make "we're not solving that here" a decision, not a surprise.)

## Build plan (next session)

If approved, the build is ~«EFFORT» focused hours:

1. «step 1» (e.g. reorder the sections list in the CMS seed)
2. «step 2» (e.g. cut/move sections per the verdict table)
3. «step 3» (e.g. apply copy edits per the section specs above)
4. «step 4» (e.g. spec-acceptance smoke test against the local environment)

(what to write here: ordered, time-bounded build steps. Reference the file paths to touch where known. This is the handoff to the engineering session that follows sign-off.)

## Acceptance for THIS spec (sign-off)

Build is blocked until every box is ticked:

- [ ] User confirms «critical decision 1» (e.g. section order)
- [ ] User confirms «critical decision 2» (e.g. cut/keep verdict for the contested section)
- [ ] User approves «critical decision 3» (e.g. new FAQ list / pillar copy)
- [ ] User approves «critical decision 4» (e.g. headline + subheadline copy)

Once all boxes are ticked, the build is unblocked. Any subsequent change to the above requires a new spec rev (date + delta) — not silent edits.
