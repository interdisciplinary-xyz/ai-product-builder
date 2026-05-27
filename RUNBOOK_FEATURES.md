# Features

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_FEATURES` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/FEATURES.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The structure (table of contents → per-feature section with description / detail table / related files) is generic; one placeholder example feature is shown — repeat the pattern per feature.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the platform whose features are inventoried
> - `«FEATURE_INVENTORY»` — the full list of features and the TOC ordering
> - `«PER_FEATURE_DETAIL»` — for each feature: behavior, plan gating, CMS/block types, and key routes
> - `«INTEGRATIONS»` — third-party surfaces (auth providers, payments, chat apps, analytics) and their config
> - `«FEATURE_FLAGS»` — env-var flag names controlling feature visibility
> - `«LOCALES»` — supported languages for the i18n section

Complete feature inventory of the «PROJECT» platform.

---

## Table of Contents

(What to write here: list every feature in `«FEATURE_INVENTORY»`, one anchor link per feature, in the order they appear below.)

1. [«Feature Name»](#feature-name)
2. «… (one entry per feature)»

---

## «Feature Name»

(What to write here: one section per feature. Open with 1–3 sentences describing what the feature is and the user value. Then fill the optional detail table, key implementation notes, and related files. Repeat this whole section per feature.)

«Short description of the feature — what it does and why it matters. Note any plan gating (e.g. Free / Pro / Team) inline.»

**«Detail table heading — e.g. Block types / Funnel structure / Output structure»:**

(What to write here: use a table when the feature has a set of sub-items — block types, funnel phases, output sections, commands, routes. Keep the headers; replace the placeholder row.)

| «Column A»   | «Column B»                  |
| ------------ | --------------------------- |
| `«item»`     | «what it is / what it does» |

(One row per «item».)

**Key implementation details:**

(What to write here: bullet the non-obvious behaviors — caching/revalidation, AI model + token budgets, rate limiting, gating logic, locale handling. Replace with this feature's specifics.)

- «Implementation note 1»
- «Implementation note 2»

**Related files:**

(What to write here: list the actual source paths that implement this feature — components, API routes, collections, services.)

- `«path/to/component-or-domain»` — «what lives here»
- `«path/to/api-route-or-collection»` — «what lives here»

---

(repeat per feature)

---

## Integrations

(What to write here: document each third-party surface in `«INTEGRATIONS»` — auth providers, payments, chat-app bots, analytics/observability, CMS. For each: what it's used for, key routes/events, and config/env vars. Reuse the per-feature pattern above for anything substantial.)

- «Auth provider» — «flow + where sessions live»
- «Payments provider» — «checkout/portal/webhook routes + events handled»
- «Chat-app bot / external surface» — «commands + linking flow»
- «Analytics & observability» — «event taxonomy, error monitoring, consent gating»

## Feature Flags (Env-Var)

_(if your repo uses feature flags; otherwise document your system)_

(What to write here: describe how feature visibility is toggled. Keep the env-var pattern if it fits; otherwise document your flagging system. List the flag names in `«FEATURE_FLAGS»`.)

```bash
# .env.local or hosting env
«ENV_VAR_NAME»=«flagA,flagB»
```

«Explain resolution rules (e.g. any key in the comma-separated list is `true`, all others `false`) and the consumer API (`useFeatureFlags()` / `isEnabled('flag')`). Record any trade-off (e.g. flag changes require a deploy).»

## Internationalization

(What to write here: state which locales ship (`«LOCALES»`), the routing approach, how CMS content and any AI generation handle locales, and how to add a new locale.)

«Describe the i18n setup — routing library, locale prefix scheme, CMS localization, lazy single-locale AI generation if applicable, and the steps to enable an additional locale.»
