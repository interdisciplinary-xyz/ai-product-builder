---
description: Interactively bootstrap a doc's «placeholders» by prompting the user, save answers to .claude/ai-init.local.json, optionally render to docs/<NAME>.local.md.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /ai-init

Bootstrap (or incrementally refresh) the repo-wide `«placeholder»` values for one or more docs in the `ai-product-builder` library. Follow `MANAGER_INIT.md` for the full spec — this command is the convenient shortcut.

## Argument

`$ARGUMENTS` — the target doc name. Accept either:
- the library name (`RUNBOOK_RELEASE_MANAGER`), or
- the deployed name (`RELEASE_MANAGER`) — resolve to its `RUNBOOK_*.md` / `MANAGER_*.md` source.

If no argument is given, list available docs (RUNBOOKs + MANAGERs in the `ai-product-builder` library) and ask which to init.

## Flow

1. **Resolve** `$ARGUMENTS` to a target file under the `ai-product-builder` library.
2. **Open** `.claude/ai-init.local.json` — create with `{ "_version": 1, "tokens": {}, "_meta": { "last_init": "<today>", "docs_rendered": [] } }` if missing. **Committed**, not gitignored.
3. **Parse** the target doc's Reuse-block "Local definitions to provide per repo" list. Extract every `«TOKEN»` and its description. Cross-check `PLACEHOLDERS.md` for canonical examples.
4. **Classify** each token (see `MANAGER_INIT.md` § "TOKEN CLASSIFICATION"):
   - `«SCREAMING_SNAKE»` → persistent → prompt if missing from answer file.
   - `«lowercase»` → inline-fill → **skip**.
   - Date/version/per-invocation (`«X.Y.Z»`, `«DATE»`, `«MILESTONE»`) → **skip** (asked fresh per invocation by the consuming doc, not persisted).
   - File-backed (`«SHARED_PATHS»`, `«CODEOWNERS»`) → prompt for the path; offer to create the file with a sensible default if missing.
   - Secret-shaped (`*_SECRET`, `*_KEY`, `*_PASSWORD`, `*_TOKEN` without `_ENV`) → **refuse**; route to `.env.local`.
5. **For each missing persistent token:** read repo-discoverable defaults first (`.nvmrc` → `«NODE_VERSION»`, `package.json` → `«PKG_MGR»`/`«PROJECT»`, `git symbolic-ref` → `«TRUNK»`), show the doc's description + a `PLACEHOLDERS.md` example, prompt the user (Enter accepts the default).
6. **Save** answers to `.claude/ai-init.local.json` (pretty-printed JSON, 2-space indent). **Never delete** existing tokens — other docs may reference them.
7. **Offer to render** the filled doc to `docs/<NAME>.local.md` (drop the `RUNBOOK_`/`MANAGER_` prefix). Default: **No**.
8. **Print** the `INIT Status` output block from `MANAGER_INIT.md` § "OUTPUT FORMAT".

## Don'ts

- ❌ Don't auto-fill from heuristics — discovered values are *defaults*, still confirmed.
- ❌ Don't fill `«lowercase»` inline-fill tokens.
- ❌ Don't delete existing answers on re-run.
- ❌ Don't write secrets to the answer file — refuse and route to `.env.local`.
- ❌ Don't render `<NAME>.local.md` unless the user says yes.

See `MANAGER_INIT.md` for the full spec.
