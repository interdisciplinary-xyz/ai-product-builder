---
description: Pre-deploy validation — runs full CI checks and build to catch issues before merge
allowed-tools: Bash, Read, Grep, Glob
---

# Deploy Check

> **🔧 Reuse & local setup**
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `.claude/commands/deploy-check.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders».
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - Package manager + quality/build commands — `«PKG_MGR» «QUALITY_CMD:format»` / `«QUALITY_CMD:lint»` / `«QUALITY_CMD:types»` / `«QUALITY_CMD:unit»` / `«QUALITY_CMD:build»` (or the repo's aggregate quality command).
> - Trunk branch name — `«TRUNK»` (and `origin/«TRUNK»`).
> - Commit convention — Conventional Commits (`type(scope): description`).

Run a full pre-deploy validation to ensure the branch is ready for merge to `«TRUNK»`. This simulates what CI does.

Extends `/test` (the unit/lint/type/format subset) with build + git checks.

## Checks (run in order)

1. **Format** — `«PKG_MGR» «QUALITY_CMD:format»`
2. **Lint** — `«PKG_MGR» «QUALITY_CMD:lint»`
3. **Type check** — `«PKG_MGR» «QUALITY_CMD:types»`
4. **Unit tests** — `«PKG_MGR» «QUALITY_CMD:unit»`
5. **Build** — `«PKG_MGR» «QUALITY_CMD:build»`

## Additional Checks

After the standard checks pass:

6. **Uncommitted changes** — `git status` to check for forgotten files
7. **Commit messages** — `git log «TRUNK»..HEAD --oneline` to verify all commits follow Conventional Commits format (`type(scope): description`)
8. **Branch is up to date** — `git fetch origin «TRUNK» && git log HEAD..origin/«TRUNK» --oneline` to check if «TRUNK» has advanced

## Report

Provide a deployment readiness report:

```
Deploy Check Results
========================
Format:     pass/fail
Lint:       pass/fail
Types:      pass/fail
Tests:      pass/fail (X passed)
Build:      pass/fail
Clean tree: pass/fail
Commits:    pass/fail
Up to date: pass/fail

Verdict: READY / NOT READY
```

If NOT READY, list each issue and how to fix it.
