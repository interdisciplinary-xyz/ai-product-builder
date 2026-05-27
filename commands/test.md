---
description: Run the full test suite (unit, types, lint, format) and report results
allowed-tools: Bash, Read
---

# Test Runner

> **🔧 Reuse & local setup**
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `.claude/commands/test.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders».
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - Package manager + test/quality commands — `«QUALITY_CMD:format»` / `«QUALITY_CMD:lint»` / `«QUALITY_CMD:types»` / `«QUALITY_CMD:unit»` (or the repo's aggregate quality command).

Run the project test suite and report results. Execute the following checks in order:

For pre-deploy, see `/deploy-check`.

## Checks

1. **Format check** — `«QUALITY_CMD:format»`
2. **Lint check** — `«QUALITY_CMD:lint»`
3. **Type check** — `«QUALITY_CMD:types»`
4. **Unit tests** — `«QUALITY_CMD:unit»`

If a specific scope is provided: $ARGUMENTS — run only the relevant checks.

## Reporting

After running all checks, provide a summary:

| Check      | Status    | Details            |
| ---------- | --------- | ------------------ |
| Format     | pass/fail | ...                |
| Lint       | pass/fail | ...                |
| Types      | pass/fail | ...                |
| Unit Tests | pass/fail | X passed, Y failed |

If any check fails, show the relevant error output and suggest fixes.
