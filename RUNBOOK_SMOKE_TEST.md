# Smoke test checklist

Manual QA scenarios for `«PROJECT»`. Run through before every release. Companion to [`RUNBOOK_E2E.md`](./RUNBOOK_E2E.md) (automated coverage) and to the `«SMOKE_TESTS»` placeholder in [`MAINTENANCE.md`](./MAINTENANCE.md) / [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md), which both reference this doc as the scenario inventory.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_SMOKE_TEST` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/SMOKE_TEST.md` and localize the items below.
>
> **Reusability:** template-ready — the per-page row template (Page / Route / Critical elements / Action / Pass criteria) is the abstraction. Every product fills in its own pages and core flows; the structure stays.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product under test.
> - `«LOCALES»` — supported locales (drives §10 i18n + 404 sections).
> - `«PAGES»` — the canonical list of pages/routes to smoke (replace the §1–§N section headers below).
> - `«AUTH»` — auth stack (drives §5 cases — email/password, social providers, logout).
> - `«PAYMENTS»` — payment processor (drives §6 — checkout, billing portal, plan-update).
> - `«ADMIN_PATH»` — admin/CMS route (drives §13 — collections, media, globals).
> - `«HEALTH_ENDPOINT»» — for §14 the health check.
> - Any third-party surfaces (Slack/Discord/SSO/webhook receiver) — add a section per surface.

## How to use this checklist

- **Per-page rows are the unit of work.** Each page = one row using the template: **Page / Route / Critical elements / Action / Pass criteria**. A page passes only when every cell is satisfied.
- **Run on a clean session.** New browser profile, no logged-in state, no prior cookies (for the unauthenticated paths). Switch to a seeded test user for the authenticated paths.
- **Capture deviations as issues immediately.** A smoke fail is not "fix it before release" — it's "this release does not ship".
- **Re-run §1 (the core funnel) after any deploy** — even non-functional changes can break the critical path.

## Page row template

> Use this template per page. Don't paraphrase — keep the column ordering so a reviewer can scan in any direction.

| Page          | Route          | Critical elements                                | Action                                  | Pass criteria                                                                                       |
| ------------- | -------------- | ------------------------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| «PAGE_NAME»   | «/route»       | «components / sections / data that must render» | «what the user does on this page»       | «what success looks like — redirect lands, data persists, event fires, no console errors, ...»     |

---

## §1. Landing / homepage

| Page         | Route       | Critical elements                                                                          | Action                                                | Pass criteria                                                                  |
| ------------ | ----------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Homepage     | `/`         | «hero section, primary marketing modules, pricing teaser, footer»                          | Land on `/`; scroll through                           | Redirects to locale prefix (e.g. `/en`); every section renders; footer visible |
| Locale home  | `/«locale»` | Same as above, localized strings                                                           | Switch locale via URL                                 | All copy translates; no missing-key fallbacks visible                          |

(one row per landing variant)

## §2. Navigation & header

| Page          | Route   | Critical elements                                                  | Action                          | Pass criteria                                                |
| ------------- | ------- | ------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------ |
| Header (desktop) | (global) | «brand mark, nav items, CTA button, sticky behavior»            | Click each nav item; scroll     | All links resolve; CTA fires the right intent; sticky works  |
| Header (mobile)  | (global) | Hamburger menu                                                  | Open + navigate                 | Menu opens/closes; all links work on mobile breakpoint       |

## §3. Marketing / content sub-pages

| Page          | Route                  | Critical elements                       | Action       | Pass criteria                              |
| ------------- | ---------------------- | --------------------------------------- | ------------ | ------------------------------------------ |
| «About»       | `/«locale»/about»      | Section header + body content from CMS  | Land on page | Heading + body render; no broken markdown  |
| «Pricing»     | `/«locale»/pricing»    | Tier cards, CTAs, FAQ                   | Land on page | All tiers render; CTAs wire to checkout    |
| «Legal pages» | `/«locale»/«slug»»     | Section header + full text              | Land on page | Content renders without truncation         |
| «Blog index»  | `/«locale»/blog»       | Post grid                               | Land on page | All cards link to `/«locale»/blog/<slug>»  |

(one row per content page in `«PAGES»»)

## §4. Core funnel — anonymous entry

| Page                   | Route                | Critical elements                                                                     | Action                                                                        | Pass criteria                                                                                  |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| «Public entry surface» | `/«locale»/«entry»»  | «the entry flow's first interactive step (form, survey, generator, etc.)»             | Walk through the **N** input screens                                          | Required-field validation blocks; supported input types accept; submit triggers backend action |
| Anonymous lead gate    | `/«locale»/«entry»»  | Email/contact gate before persisting anonymous result                                  | Submit gate                                                                   | Success UI shown; lead-capture analytics event fires; lead email sent (when API key set)       |

(one row per entry-funnel page)

## §5. Authentication (`«AUTH»»)

| Page          | Route                | Critical elements                | Action                                 | Pass criteria                                                                |
| ------------- | -------------------- | -------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| Register      | `/«locale»/register» | Email + password form, validation| Submit a fresh valid signup            | Account created; redirected to first authenticated step; welcome email sent  |
| Login         | `/«locale»/login»    | Email + password form            | Submit valid + invalid                 | Valid: redirected to app home. Invalid: clear error message                  |
| Social login  | `/«locale»/login»    | Provider button(s)               | Click → complete OAuth                 | New user: account created. Existing: signed in. Slug collisions resolved     |
| Logout        | (global)             | Logout button                    | Click logout                           | Session cleared; protected routes no longer reachable                        |

## §6. Authenticated core surfaces

(one row per authenticated page in `«PAGES»» — typical: dashboard / account / profile / settings)

| Page              | Route                       | Critical elements                                         | Action                              | Pass criteria                                                                                  |
| ----------------- | --------------------------- | --------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| «Account»         | `/«locale»/app/account»     | Profile tab, billing tab, settings tab                    | Update profile data + save           | Changes persist; success state shown; no console errors                                        |
| «Public profile»  | `/«locale»/«u»/[slug]»      | Owner data, share/print, cross-user CTA (if applicable)   | View own + someone else's profile    | Owner-only widgets only show when viewing own; cross-user CTAs only when viewing others        |
| «Team / org»      | `/«locale»/app/team»        | Multi-user widgets, role-gated controls                   | Land as a team-tier user             | Role-gated controls hidden for non-eligible users; widgets render with seeded data             |

## §7. Payments (`«PAYMENTS»»)

| Page              | Route               | Critical elements                  | Action                                    | Pass criteria                                                                                          |
| ----------------- | ------------------- | ---------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Pricing card CTA  | `/«locale»/pricing» | Tier card upgrade button           | Click upgrade as authenticated user       | POST to `«CHECKOUT_PATH»» creates session; redirected to processor checkout                            |
| Pricing card CTA  | `/«locale»/pricing» | Tier card upgrade button           | Click upgrade as anonymous user           | Redirected to login/register first                                                                     |
| Post-checkout     | `/«locale»/app/account?upgraded=true»    | Success-state copy   | Complete a test-mode checkout             | User plan updates in DB; `«planExpiresAt»» is set; success state shown                                 |
| Billing portal    | `/«locale»/app/account»                   | "Manage subscription" CTA | Click manage                       | Opens processor portal; cancellation flow completes; plan reverts at period end                        |

(full payments verification lives in [`RUNBOOK_PAYMENTS_LIFECYCLE.md`](./RUNBOOK_PAYMENTS_LIFECYCLE.md) §2; this is only the surface-level smoke)

## §8. Pricing surfaces

| Page                | Route               | Critical elements                                      | Action       | Pass criteria                                          |
| ------------------- | ------------------- | ------------------------------------------------------ | ------------ | ------------------------------------------------------ |
| Homepage pricing    | `/«locale»#pricing» | N tier cards (highlighted CTA tier)                    | Land on page | All cards render; CTAs wire correctly                  |
| Full pricing page   | `/«locale»/pricing» | All tier details, FAQ                                  | Land on page | Cards + FAQ render; no missing CMS data                |

## §9. Internationalization (`«LOCALES»»)

| Page          | Route                | Critical elements        | Action                       | Pass criteria                                       |
| ------------- | -------------------- | ------------------------ | ---------------------------- | --------------------------------------------------- |
| Locale switch | `/«locale»» variants | All UI strings translate | Visit each `«LOCALES»» URL  | All copy translates; CMS body translates; no missing-key fallbacks |

## §10. 404 + routing edge cases

| Page                | Route                  | Critical elements              | Action                                     | Pass criteria                                                  |
| ------------------- | ---------------------- | ------------------------------ | ------------------------------------------ | -------------------------------------------------------------- |
| Unmatched route     | `/«any-typo»»          | Branded 404 page                | Visit a typo                               | 404 page renders; branded; nav back to home                    |
| Localized 404       | `/«locale»/«any-typo»» | Branded 404 in selected locale  | Visit a localized typo                     | 404 copy localized                                             |
| Tier-gated route    | `/«locale»/«gated»»    | Tier-gate redirect or empty-state | Visit as wrong-tier user                | Redirected to upgrade page OR empty-state shown — never crash  |

## §11. Third-party integrations

(one row per integration surface — chat platforms, SSO callback receivers, webhook receivers, etc.)

| Page              | Route               | Critical elements              | Action                                | Pass criteria                                                   |
| ----------------- | ------------------- | ------------------------------ | ------------------------------------- | --------------------------------------------------------------- |
| «Integration link»| `/«locale»/app/«provider»/link?token=…» | Token-validation flow | Visit with valid + invalid tokens | Valid: identity linked. Invalid/missing: redirected to account  |

## §12. Feature flags

| Surface       | Flag                   | Action                                            | Pass criteria                                                     |
| ------------- | ---------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| Flag-gated UI | `«FLAG_KEY»`           | Set/unset `NEXT_PUBLIC_ENABLED_FEATURE_FLAGS»     | Enabled: gated UI visible. Disabled: gated UI hidden. Comma list works |

## §13. Admin panel (`«ADMIN_PATH»»)

| Page              | Route                                  | Critical elements                | Action                          | Pass criteria                                          |
| ----------------- | -------------------------------------- | -------------------------------- | ------------------------------- | ------------------------------------------------------ |
| Admin login       | `«ADMIN_PATH»»                         | Login form                       | Sign in with admin credentials  | Reaches admin dashboard                                |
| Each collection   | `«ADMIN_PATH»/collections/«name»»      | List view + editor               | Open + edit a doc               | Edits persist; no console errors                       |
| Media uploads     | `«ADMIN_PATH»/collections/media»       | Upload widget                    | Upload + delete a test asset    | Asset appears + can be re-used in a doc                |
| Globals           | `«ADMIN_PATH»/globals/«name»»          | Editor                           | Save a no-op change             | Save succeeds                                          |

## §14. Performance & errors

| Surface         | Critical elements                       | Action                                          | Pass criteria                                                            |
| --------------- | --------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| Homepage        | Console + network                       | Load with DevTools open                         | Zero console errors; zero 404 API calls; no broken images                |
| Health endpoint | `«HEALTH_ENDPOINT»»                     | curl from the deployed env                      | HTTP 200, `ok: true`                                                     |
| SEO metadata    | `<title>` + `<meta description>`        | View source on homepage + CMS pages             | Each page has unique, populated title + description; OG image set        |

## §15. Responsive design

| Breakpoint   | Pages to check                                       | Pass criteria                                                                      |
| ------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 375 px       | Homepage, pricing, blog, account                     | Layouts stack vertically; nav collapses to hamburger; no horizontal scroll         |
| 768 px       | Same                                                 | Tablet layouts render; no awkward gaps                                              |
| 1440 px      | Same                                                 | Full desktop layout; no layout shift on initial render                              |

---

## Cross-references

- [`RUNBOOK_E2E.md`](./RUNBOOK_E2E.md) — automated coverage that should subsume this list over time.
- [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md) — the gate this smoke is part of (`«SMOKE_TESTS»` placeholder).
- [`MAINTENANCE.md`](./MAINTENANCE.md) — pre-release smoke schedule.
- [`RUNBOOK_PAYMENTS_LIFECYCLE.md`](./RUNBOOK_PAYMENTS_LIFECYCLE.md) — deep payments verification (§7 here is only surface-level).
- [`RUNBOOK_EMAIL_DELIVERABILITY.md`](./RUNBOOK_EMAIL_DELIVERABILITY.md) — deep email-delivery verification.
