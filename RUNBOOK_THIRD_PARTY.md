# Third-Party Services

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_THIRD_PARTY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/THIRD-PARTY.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The cost-model framework (paid/usage-based → free/included → self-hosted → cost summary) and the per-service table shape (Purpose / Pricing / Used by / Env var / Notes) carry over as-is; fill in this product's vendor inventory.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline). `«SERVICE_LIST»` and `«PER_SERVICE_FACTS»` below are concept groups, not literal body tokens — they expand to the per-service `«SERVICE_NAME»` / `«PURPOSE»` / etc. tokens you fill in each table:
> - `«SERVICE_LIST»` (concept group) — every external service, grouped by cost model (paid/usage-based, free/included, self-hosted); expands to one `«SERVICE_NAME»` block per vendor in the body
> - `«PER_SERVICE_FACTS»` (concept group) — for each service block, fill `«PURPOSE»`, `«PRICING_MODEL»`, `«CONSUMER»` (Used by), `«ENV_VARS»`, `«HOSTING»` (self-hosted), and `«NOTES»`
> - `«ENV_VARS»` — the env var names each service requires
> - `«PRICING_MODEL»` — pricing basis and current tier per service (per-token, per-MAU, per-transaction, per-event, flat, free)
> - `«COST_SUMMARY»` (concept group) — the Cost Summary table: one row per service filling `«COST_MODEL»`, `«COST_DRIVER»`, `«RISK_LEVEL»`
> - `«TECH_STACK»` — runtime/hosting facts referenced (deploy platform, DB, CMS, framework) needed to describe self-hosted services
> - `«PROJECT»` — the product whose third-party stack this catalogs (typically **inherited** from `.claude/CLAUDE.md`); referenced in the overview line and section headers

Overview of external services used across the «PROJECT» platform, organized by cost model for monitoring usage and maintenance costs.

---

## Paid / Usage-Based Services

(what to write here: one entry per paid or usage-billed vendor. Copy the table below for each — fill purpose, pricing basis/tier, what consumes it, env vars, key routes/endpoints, and operational notes.)

### «SERVICE_NAME»

|             |                       |
| ----------- | --------------------- |
| **Purpose** | «PURPOSE»             |
| **Pricing** | «PRICING_MODEL»       |
| **Used by** | «CONSUMER»            |
| **Env var** | «ENV_VARS»            |
| **Notes**   | «NOTES»               |

(one entry per vendor — duplicate this table block per paid/usage-based service)

---

## Free / Included Services

(what to write here: one entry per free or bundled service — analytics, tag managers, CI minutes within free tier, etc.)

### «SERVICE_NAME»

|             |                       |
| ----------- | --------------------- |
| **Purpose** | «PURPOSE»             |
| **Pricing** | «PRICING_MODEL»       |
| **Used by** | «CONSUMER»            |
| **Env var** | «ENV_VARS»            |
| **Notes**   | «NOTES»               |

(one entry per vendor — duplicate this table block per free/included service)

---

## Self-Hosted Services

(what to write here: one entry per service you run yourself — CMS, websocket server, queue, etc. Reference `«TECH_STACK»` facts for hosting details.)

### «SERVICE_NAME»

|              |                      |
| ------------ | -------------------- |
| **Purpose**  | «PURPOSE»            |
| **Hosting**  | «HOSTING»            |
| **Env var**  | «ENV_VARS»           |
| **Notes**    | «NOTES»              |

(one entry per vendor — duplicate this table block per self-hosted service)

---

## Cost Summary

(what to write here: one row per service summarizing its cost model, primary cost driver, and risk level.)

| Service        | Cost Model    | Primary Cost Driver | Risk Level   |
| -------------- | ------------- | ------------------- | ------------ |
| «SERVICE_NAME» | «COST_MODEL»  | «COST_DRIVER»       | «RISK_LEVEL» |

(one row per vendor)
