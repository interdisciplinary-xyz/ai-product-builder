# Data Model Guide

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_DATA_MODEL_GUIDE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_DATA_MODEL_GUIDE.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Keep the structure (source-of-truth statement, per-collection field tables, key relationships, data-integrity rules), but **fill the collections and fields with the target product's own data model**.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product this guide covers.
> - `«DB_CMS»` — database + CMS and which is source of truth (e.g. MongoDB + Payload as source of truth; identity provider identity-only).
> - `«AUTH»` — identity provider + the ID convention (e.g. provider UID == `Users.id`).
> - `«COLLECTION_NAMES»` — the actual collections + globals for this product.
> - `«USER_FIELDS»` — the per-field tables (plan/billing/email-lifecycle/integration fields are product-specific).
> - `«PAYMENTS»` — billing fields + locking rules (e.g. customer/subscription IDs, expiry, webhook-only writes).
> - `«DOMAIN»` concepts — product nouns stored (e.g. surveys, factors, guidelines, organizations).
> - `«LOCALES»` — how locale-keyed fields are stored (e.g. a field keyed by locale).
> - `«SCHEMA_HISTORY»` — migration/PR notes are repo-specific; do not carry another product's PR numbers.

**Last reviewed:** «DATE»

## Source of Truth

State which store is authoritative. Example: **«DB_CMS» (e.g. MongoDB/Payload)** is the source of truth for all application data. The «AUTH» provider is identity-only (email, password hash, OAuth tokens). Application state lives in «DB_CMS» collections.

State the primary-key convention. Example: **User document IDs** are «AUTH» UIDs — the `Users.id` matches the provider `uid` on registration.

State the collection inventory. Example: **Current count: «N» collections** (+ «N» globals: «...»). Record material schema migrations in `«SCHEMA_HISTORY»` (repo-specific — do not carry over another product's PR numbers).

---

## Collections

_(One subsection per collection/model. Keep the field table headers (Field / Type / Notes); list each collection's fields and access/locking notes. Delete the example below and document your real collections.)_

### «CollectionName» (e.g. Users)

«One-line description of the entity and what it stores.»

| Field        | Type    | Notes                                          |
| ------------ | ------- | ---------------------------------------------- |
| id           | text    | «primary key, e.g. «AUTH» UID»                 |
| «field»      | «type»  | «constraints / meaning»                        |
| «planField»  | select  | «plan tiers, e.g. free/pro/team»               |
| «billingId»  | text    | «PAYMENTS» customer/subscription ID (webhook-only writes) |
| «localized»  | json    | «field keyed by locale, e.g. `{ en: "..." }»   |

**Access / locking notes:** describe any fields locked against self-mutation (e.g. billing fields writable only by admin or webhook with `overrideAccess: true`), and how related entities (e.g. team membership) are resolved.

---

## Key Relationships

_(Sketch the relationships between collections — FK relationships, match-by-value links, and cache keys.)_

```
«CollectionA» ◄──── «CollectionB».field (relationship)
                  |
«Users» ──┬── «Comparisons / cache keys»
          ├── «Feedback / owner-scoped records»
          └── «PAYMENTS» (customer / subscription IDs)
```

## Data Integrity Rules

_(List the invariants a future contributor must not break. Generic candidates:)_

- **Stable IDs** — keys stored in user data (question IDs, factor IDs) are stable in code; never rename stored values.
- **Cache keys** — describe the cache-key format (e.g. sorted user IDs); changing the format orphans cached data.
- **Plan migrations** — boot-time, idempotent renames of legacy plan tiers.
- **Locale-keyed fields** — note write order and any side effects (e.g. an email fires on first locale write).
- **Visibility filtering** — where private/visibility-scoped data is filtered (at query time vs. write time).
- **«PAYMENTS» fields** — populated by the webhook with `overrideAccess: true`, not by end users.

## Related docs

_(Keep cross-links to the repo's other docs. Examples:)_

- [`FEATURES.md`](./FEATURES.md) — product behavior
- `emails-workflow.md` (repo-local, if your repo has one) — transactional email triggers
- [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) — access control matrix
