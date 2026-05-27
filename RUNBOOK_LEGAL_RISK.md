# Legal Risk Assessment

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_LEGAL_RISK` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/LEGAL_RISK.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse only the section framework (data processing → AI processing → regime matrix → stage risk assessment → liability areas → IP → prioritized recommendations). **Legal content must be re-derived per product and per jurisdiction** — none of the filled values carry over between products. Not legal advice — validate with counsel for the target jurisdiction.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«JURISDICTIONS»` — applicable legal regimes (e.g. GDPR/EU, CCPA, sector regulators) — drives which requirement matrix applies
> - `«DATA_INVENTORY»` — personal-data categories collected, collection method, storage location/vendor, retention (incl. any Article 9 special-category data)
> - `«AI_PROCESSING»` — what data is sent to which AI provider, for what, and DPA status
> - `«SUB_PROCESSORS»` — third-party processors and their DPA status (auth, DB, payments, analytics, email)
> - `«GDPR_OR_REGIME_STATUS»` — per-requirement current status + action needed (consent, access, erasure, portability, policies, cookies)
> - `«RISK_STAGE»` — launch stage and what is acceptable now vs. required before public scale
> - `«LIABILITY_AREAS»` — product-specific liability surfaces (AI-generated content, consent-less features, workplace/employment use, etc.)
> - `«IP_NOTES»` — IP/licensing considerations for generated and original content
> - `«POLICY_URLS»` — privacy policy / terms / cookie policy locations and review state

> ⚠️ **Re-derive per product/jurisdiction.** This file is a risk-register *framework*, not portable legal content. Every entry below must be reassessed against `«JURISDICTIONS»` and the product's actual data flows, and reviewed by qualified counsel before relying on it.

## Data Processing

### Personal Data Collected

(what to write here: inventory every personal-data category the product touches. Flag any Article 9 / special-category data — health, mental health, neurodivergence, disability, sexual orientation, religion, ethnicity, biometrics — explicitly, since it triggers stricter requirements.)

| Data Type   | Collection Method  | Storage         | Retention       |
| ----------- | ------------------ | --------------- | --------------- |
| «DATA_TYPE» | «COLLECTION_METHOD» | «STORAGE_VENDOR» | «RETENTION»    |

(one row per data category — mark special-category/Article 9 rows clearly)

### AI Processing

(what to write here: describe what user data is sent to which AI provider, for what purpose, what is excluded from outputs, and the DPA status with each provider.)

- «AI_PROCESSING» — what data goes to which provider and why
- «AI_DPA_STATUS» — data-processing-agreement status with each AI provider
- «AI_OUTPUT_BOUNDARY» — what is sent to AI but never surfaced in outputs

## «REGIME» Considerations

(what to write here: pick the requirement matrix for the applicable `«JURISDICTIONS»`. The rows below are the GDPR requirement set — replace/extend per regime. For each requirement record current status, stage acceptability, and the action needed.)

| Requirement                 | Current Status | Stage Status | Action Needed |
| --------------------------- | -------------- | ------------ | ------------- |
| Consent for data processing | «STATUS»       | «STAGE»      | «ACTION»      |
| Right to access             | «STATUS»       | «STAGE»      | «ACTION»      |
| Right to erasure            | «STATUS»       | «STAGE»      | «ACTION»      |
| Data portability            | «STATUS»       | «STAGE»      | «ACTION»      |
| Privacy policy              | «STATUS»       | «STAGE»      | «ACTION»      |
| Terms of service            | «STATUS»       | «STAGE»      | «ACTION»      |
| Cookie consent              | «STATUS»       | «STAGE»      | «ACTION»      |
| Cookie policy               | «STATUS»       | «STAGE»      | «ACTION»      |
| DPA with «AI_PROVIDER» (if you use an AI provider) | «STATUS» | «STAGE» | «ACTION» |

(one row per requirement — add jurisdiction-specific obligations as needed)

### «RISK_STAGE» Risk Assessment

(what to write here: name the current launch stage and justify what level of compliance is acceptable now.)

**«RISK_LEVEL» for «STAGE»** because:

- «WHY_ACCEPTABLE_1» (what to write here: factors that reduce risk at this stage — small user base, policies shipped, manual remediation available, no advertising use, etc.)

**Required before public scale:**

- «PRE_SCALE_REQUIREMENT_1» (what to write here: the compliance gaps that must close before broad launch)

## Liability Areas

(what to write here: enumerate product-specific liability surfaces. For each, describe the exposure, the mitigation, and the current stage status. The three subsections below are common framework slots — rename/add per product.)

### «LIABILITY_AREA_1»

- «EXPOSURE» (what to write here: the risk)
- Mitigation: «MITIGATION»
- **Stage status:** «STAGE_STATUS»

### «LIABILITY_AREA_2»

- «EXPOSURE»
- Mitigation: «MITIGATION»
- **Stage status:** «STAGE_STATUS»

### «LIABILITY_AREA_3»

- «EXPOSURE»
- Mitigation: «MITIGATION»
- **Stage status:** «STAGE_STATUS»

(one subsection per liability area)

## Intellectual Property

(what to write here: IP/licensing considerations — provenance of AI-generated content, ownership of original content, any third-party licensing exposure.)

- «IP_NOTES»

## Recommendations (Prioritized for «STAGE»)

(what to write here: order remediation by urgency. Keep the three-tier framework; fill each tier with concrete actions.)

### Before Launch (Critical)

1. «CRITICAL_ACTION_1»

### Post-Launch (Next Sprint)

«N». «NEXT_SPRINT_ACTION»

### Future (Backlog)

«N». «BACKLOG_ACTION»

(one numbered item per recommendation, continuing the count across tiers)
