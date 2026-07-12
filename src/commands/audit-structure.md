---
description: Run the repo's structure/health audits — architecture DAG, observability-tag taxonomy, and generated-type drift
allowed-tools: Bash, Read, Grep, Glob
---

# Structural Audit

> **🔧 Reuse & local setup**
>
> Canonical copy — vendored at `docs/ai-product-builder/commands/audit-structure.md` (source of truth template). To activate as a slash command: copy to `.claude/commands/audit-structure.md` and fill the `«placeholders»`.
>
> **Reusability:** template-ready — the shape (three enforcers + report-only stance) is generic; the specific `«QUALITY_CMD:*»` sub-keys are per repo.
>
> **Pairs with:** `MANAGER_ARCHITECTURE.md` (the playbook that defines the boundary rules this command enforces).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - Package manager + sub-commands — `«PKG_MGR»`, `«QUALITY_CMD:arch-check»` (dependency-graph enforcer), `«QUALITY_CMD:audit-obs-tags»` (observability tag taxonomy check), `«QUALITY_CMD:types-drift»` (generated-type drift guard).
> - Observability stack — `«OBSERVABILITY»` (e.g. Sentry) + the domain/route sub-tag taxonomy documented in `.claude/CLAUDE.md`.
> - Database / CMS — `«DB_CMS»` (used in the generated-type drift step).
> - Supported locales — `«LOCALES»` (used in the i18n parity one-off).
> - Architecture doc — the domain/dependency-graph documentation this enforces against (e.g. `docs/ai-product-builder/MANAGER_ARCHITECTURE.md` or a repo-local `docs/DOMAIN_ARCHITECTURE.md`).

Run the codebase's built-in structural + health audits and summarize the results. These are the repo's own enforcers — the point is to run + trend them, not to duplicate their logic here.

## Steps

1. **Architecture DAG** — `«PKG_MGR» «QUALITY_CMD:arch-check»`
   Reports illegal cross-domain edges (vs the documented dependency graph) + cycles. Report-only; the count must only ever go down. See `MANAGER_ARCHITECTURE.md`.

2. **Observability tag taxonomy** — `«PKG_MGR» «QUALITY_CMD:audit-obs-tags»`
   Verifies every `«OBSERVABILITY»` capture call (`captureException` / `captureMessage` for Sentry; equivalent for other providers) carries a canonical `domain` + sub-tag from the taxonomy in `.claude/CLAUDE.md`. Drift silently breaks alert-routing rules.

3. **Generated-type drift** — `«PKG_MGR» «QUALITY_CMD:types-drift»`
   Confirms generated-type files (e.g. `«DB_CMS»`-generated types, OpenAPI-generated clients) match their source configs. This is the schema-drift guard.

## Report

For each audit: PASS/FAIL + the count of violations, then list the top offenders (file → rule). Flag any regression vs the last known-good count. Do not auto-fix — surface findings for a human decision, then offer to address them.

## Notes

- Related one-offs (not in this command; run them separately when relevant): dead-internal-link crawler, i18n message-key parity vs `«LOCALES»`.
- File / domain-layout conventions are enforced by the arch-check step + code review; the convention itself lives in `MANAGER_ARCHITECTURE.md`.
- Sibling audits: `/audit-design-system`, `/audit-api-routes`, `/audit-performance`.
