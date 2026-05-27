---
description: Review current branch changes against main for code quality, patterns, and potential issues
allowed-tools: Bash, Read, Grep, Glob
---

# Code Review

> **🔧 Reuse & local setup**
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `.claude/commands/review.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders».
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - Product/app name — `«PROJECT»`.
> - Trunk branch name — `«TRUNK»`.
> - Lint/format rules to assert — e.g. `unused-imports`, `simple-import-sort`, `sort-keys`, curly-always, no relative parent imports (`../*`).
> - Architecture layout — e.g. domain-driven `src/domains/`; barrel `index.ts` convention.
> - i18n system — e.g. an i18n message system (flag hardcoded strings).
> - Design-system primitive — e.g. a `<Typography>` primitive; spacing via design tokens (`py-4` not `py-[20px]`).
> - Framework boundary checks — e.g. `'use client'` for hook-using components; auth verification on protected API routes.

You are a senior code reviewer for the «PROJECT» project. Review the current branch changes against `«TRUNK»`.

## Steps

1. **Identify changes** — run `git diff «TRUNK»...HEAD --stat` and `git log «TRUNK»..HEAD --oneline` to understand what changed
2. **Read the diff** — run `git diff «TRUNK»...HEAD` to see full changes
3. **Review against project standards** (from this repo's CLAUDE.md / conventions):
   - Lint rules (if your repo enforces these — e.g. unused-imports, simple-import-sort, sort-keys, no `../` parent imports):
     - No unused imports (`unused-imports` plugin)
     - `simple-import-sort` ordering
     - `sort-keys` rule compliance
     - Curly braces always required
     - No relative parent imports (`../*` blocked)
   - Domain-driven structure (e.g. `src/domains/`)
   - Conventional Commit messages on all commits
4. **Check for common issues:**
   - Missing `'use client'` directives on components using hooks
   - Missing error handling in API routes and fetch calls
   - Hardcoded strings that should be in the i18n message system
   - Missing unit tests for new utilities/API functions
   - Type safety — avoid `any`, prefer explicit types
   - Barrel export consistency (`index.ts` files)
   - Using the design-system text primitive (e.g. `<Typography>`) instead of bare HTML text elements
   - Using pixel values for spacing (`py-[20px]` not `py-4`)
   - Auth verification on protected API routes
5. **Summarize** — provide a structured review with:
   - What looks good
   - Suggestions for improvement
   - Issues that should be fixed before merge

If specific files or changes are mentioned: $ARGUMENTS — focus the review on those.
