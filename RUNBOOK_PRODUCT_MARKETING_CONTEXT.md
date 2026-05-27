# Product & Marketing Context — «PROJECT»

> Consumed by: `copywriting`, `marketing-psychology`, `programmatic-seo` skills.
> Keep this file in sync with landing-page constants and CMS content.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PRODUCT_MARKETING_CONTEXT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `.claude/product-marketing-context.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the section framework (product identity → what it does → capabilities → how it works → audience → brand voice → positioning → CTAs → feature/SEO table → changelog types); fill every field with the new product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PRODUCT_IDENTITY»` — name, tagline, category, stage, website, contact
> - `«PRODUCT_ONE_LINER»` — what it does, in one paragraph
> - `«CORE_CAPABILITIES»` — the headline features and the step framework (e.g. a 3-step verb framework)
> - `«TARGET_AUDIENCE»` — primary + secondary segments, their pains, and integration targets
> - `«BRAND_VOICE»` — voice attributes table + do/don't examples + copy principles
> - `«POSITIONING»` — origin statement, problem space, differentiation, CTA patterns
> - `«FEATURE_SEO_TABLE»` — feature → SEO label → description rows for copy/SEO reference
> - `«CHANGELOG_TYPES»` — commit-type → section-heading map. The table is the conventional-commits default (industry standard) — keep it and only adjust rows that differ from this repo's changelog config; you don't need to replace the whole table.

---

## Product Identity

(what to write here: fill each field with this product's facts.)

| Field    | Value              |
| -------- | ------------------ |
| Name     | «PROJECT»     |
| Tagline  | «TAGLINE»          |
| Category | «CATEGORY»         |
| Stage    | «STAGE»            |
| Website  | «WEBSITE»          |
| Contact  | «CONTACT_EMAIL»    |

## What «PROJECT» Does

«PRODUCT_ONE_LINER»
(what to write here: one paragraph describing what the product does and the core problem it solves.)

### Core Capabilities

(what to write here: the headline features, one numbered item each — bold name + one-line description.)

1. **«CAPABILITY_NAME»** — «CAPABILITY_DESCRIPTION»

(one row per capability)

### How It Works («N»-Step Framework)

(what to write here: name the steps of the core user journey — a short verb-led label per step with a one-line explanation. Adjust the number of steps to match «N»; the three below are illustrative — add or remove bullets.)

- **«STEP_1»** — «STEP_1_DESCRIPTION»
- **«STEP_2»** — «STEP_2_DESCRIPTION»
- **«STEP_3»** — «STEP_3_DESCRIPTION»

(one bullet per step — adjust the number of steps to match «N»)

## Target Audience

### Primary: «PRIMARY_SEGMENT»

- «PRIMARY_SEGMENT_TRAITS» (what to write here: who they are)
- «PRIMARY_SEGMENT_PAINS» (what to write here: the pains/frustrations they feel)
- «PRIMARY_SEGMENT_GOAL» (what to write here: what they want to achieve)

### Secondary: «SECONDARY_SEGMENT»

- «SECONDARY_SEGMENT_TRAITS» (what to write here: who they are)
- «SECONDARY_SEGMENT_PAINS» (what to write here: their unmet needs)
- «SECONDARY_SEGMENT_GOAL» (what to write here: what they're looking for)

### Integrations Target

- «INTEGRATION_TARGETS» (what to write here: the platforms/channels the product integrates with)

## Brand Voice & Tone

(what to write here: the named voice attributes + a one-line description each.)

| Attribute        | Description              |
| ---------------- | ------------------------ |
| «VOICE_ATTRIBUTE» | «ATTRIBUTE_DESCRIPTION» |

(one row per voice attribute)

### Voice Examples

- **Do:** «DO_EXAMPLE» (what to write here: an on-voice line)
- **Do:** «DO_EXAMPLE_2»
- **Don't:** «DONT_EXAMPLE» (what to write here: an off-voice line to avoid — e.g. jargon/corporate-speak)
- **Don't:** «DONT_EXAMPLE_2»

### Copy Principles

(what to write here: the rules that govern all copy for this product.)

1. «COPY_PRINCIPLE_1»
2. «COPY_PRINCIPLE_2»
3. «COPY_PRINCIPLE_3»

(one line per principle)

## Positioning

### Origin Statement

«ORIGIN_STATEMENT»
(what to write here: the founding "why" / who built it for whom.)

### Problem Space

- «PROBLEM_1» (what to write here: the market/user problems the product addresses, one per line)

### Differentiation

- **«DIFFERENTIATOR_1»** — «DIFFERENTIATOR_1_DETAIL» (what to write here: what sets the product apart — including any "not X, not Y" framing and the technical core)

(one bullet per differentiator)

### CTA Patterns

- «SEGMENT_A»: "«CTA_A»" (what to write here: the call-to-action per audience segment)
- «SEGMENT_B»: "«CTA_B»"
- General: "«CTA_GENERAL»"

## Product Features (for SEO / Copy Reference)

(what to write here: map each feature to an SEO-friendly label and a one-line description.)

| Feature        | SEO-friendly label   | Description           |
| -------------- | -------------------- | --------------------- |
| «FEATURE_NAME» | «SEO_LABEL»          | «FEATURE_DESCRIPTION» |

(one row per feature)

## Conventional Changelog Types (from changelog config)

When writing release notes or changelogs, use these section labels.

(map each commit type to its release-notes heading; mark hidden types as _(hidden)_. Defaults below are the conventional-commits standard — keep them and adjust only the rows that differ from your config; no need to replace the whole table.)

| Commit type | Section heading |
| ----------- | --------------- |
| `feat`      | Features        |
| `fix`       | Bug Fixes       |
| `perf`      | Performance     |
| `refactor`  | Refactoring     |
| `docs`      | Documentation   |
| `test`      | Tests           |
| `ci`        | CI/CD           |
| `chore`     | _(hidden)_      |
| `style`     | _(hidden)_      |
| `build`     | _(hidden)_      |
