# GDPR pre-launch checklist

> ⚠️ **Not legal advice.** This is an engineering + product wiring checklist only — code cannot replace legal review. Re-derive it per product and per jurisdiction, and review with qualified counsel before relying on it.
>
> ⚠️ **Per-jurisdiction scope.** This checklist is EU/GDPR-shaped. Re-scope it for other regimes (e.g. CCPA/CPRA in California, or any sector regulator) — the lawful-basis, consent, retention, and data-subject-rights mechanics differ by regime.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/compliance/gdpr-pre-launch-checklist.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders».
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product/app name and its launch milestone used in the sign-off line
> - `«PRIVACY_ROUTE»` / `«TERMS_ROUTE»` / `«ACCOUNT_ROUTE»` / `«PUBLIC_PROFILE_ROUTE»` — privacy/terms/account/public-profile route paths (e.g. `/privacy`, `/terms`, `/app/account`, `/u/[handle]`); swap to this repo's URLs
> - `«SUB_PROCESSORS»` — the actual production sub-processor / DPA list (your «DEPLOY» host, «DB_CMS», «AUTH», «PAYMENTS», «EMAIL_TOOL», any AI/error-monitor vendors); replace with this repo's stack
> - `«ANALYTICS_TOOLS»` — analytics/consent tools the cookie banner must match
> - `«EMAIL_TOOL»` — transactional/marketing email provider + template split
> - `«DB_CMS»` collections — data-model collections/fields referenced for retention/export/deletion (e.g. users, leads, feedback collections; an email-suppression flag); rename to this repo's schema
> - `«EMAIL_SUPPRESSION_FLAG»` — the boolean field on user/lead/feedback records that re-engagement jobs MUST check before sending (e.g. `users.emailSuppressed`); name what your schema uses
> - `«SECRET_NAMES»` — secrets that must stay server-only (e.g. a cron secret + webhook secrets); list this repo's
> - `«ARTICLE_9_FIELDS»` — the special-category fields this product collects (e.g. health/diagnosis fields, self-declared sensitive attributes); name what applies, or drop if none

## Lawful basis & consent

- [ ] Privacy policy and Terms linked from signup, survey, and checkout (`«PRIVACY_ROUTE»`, `«TERMS_ROUTE»`)
- [ ] Marketing email only after explicit opt-in; transactional vs marketing separated in «EMAIL_TOOL» templates
- [ ] Cookie / analytics consent banner matches what «ANALYTICS_TOOLS» actually load
- [ ] Engagement / re-engagement jobs (your data-collection surfaces) respect `«EMAIL_SUPPRESSION_FLAG»` / bounce flags across the relevant `«DB_CMS»` collections (e.g. users, leads, feedback)

## Article 9 (special category) — sensitive / special-category data

<!-- (Omit this section if the product collects no special-category data («ARTICLE_9_FIELDS»).) -->

- [ ] Your data-collection surfaces and profile fields reviewed: no public display of special-category data («ARTICLE_9_FIELDS») by default
- [ ] Public profile (`«PUBLIC_PROFILE_ROUTE»`) shows only what the user chose to publish
- [ ] Data export (`«ACCOUNT_ROUTE»` or support process) documented in privacy policy
- [ ] Deletion request path documented (support email + «DB_CMS» admin purge runbook)

## Processors & DPAs

- [ ] DPA on file or accepted ToS for every sub-processor: «SUB_PROCESSORS»
- [ ] Sub-processor list in privacy policy matches production stack

## Retention

- [ ] Anonymous leads: retention window defined («COLLECTION» (e.g. users, leads, feedback))
- [ ] Feedback (your data-collection surfaces): access limited to admin role
- [ ] Logs («DEPLOY» host, error monitor): retention settings reviewed

## Incident readiness

- [ ] «SECRET_NAMES» (cron secret and webhook secrets) not in client bundles
- [ ] Breach notification contact in privacy policy

**Sign-off:** Founder + counsel when moving past «PROJECT»'s launch milestone.
