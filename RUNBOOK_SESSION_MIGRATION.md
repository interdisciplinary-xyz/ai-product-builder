# SESSION_MIGRATION.md — Session offload & restore policy

> **Canonical / source-of-truth copy** (lives in the `ai-product-builder` library). Unified from the
> multiple project variants across the codebase. To adopt in a repo,
> copy to `docs/SESSION_MIGRATION.md` and fill the `«placeholders»`.
>
> **Scope:** how an AI/developer session persists ("hands off") and restores
> ("hands on") its state across sessions, terminals, machines, and agents — so the
> next session **resumes instead of re-learning the repo**. Companion to
> [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) (flow/cost) and
> [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md) (quality bar).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_SESSION_MIGRATION` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_SESSION_MIGRATION.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — session offload/restore policy is fully generic; the only variable bits are paths and the re-verify commands, already marked with `«placeholders»`.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«/absolute/path/to/repo»` — repo root used in the quick re-verify block — §5.
> - `«NODE_VERSION»` — Node version expected by `nvm use` (match `.nvmrc`) (e.g. 22.15.1) — §4, §5.
> - `«QUALITY_CMD»` — the authoritative green check on restore (e.g. `pnpm ci:quality`) — §4.
> - `«PKG_MGR»` — package manager for dependency restore (e.g. `pnpm install`) — §4.
> - Doc/memory paths — `docs/plans/`, `«docs/vX.Y.Z-progress».md`, `~/.claude/projects/<project-dir>/memory/MEMORY.md`, `.claude/CLAUDE.md`, `docs/DECISION_LOG.md` — §2.
> - Issue label for findings — `audit` (used in the re-verify `gh issue list`) — §5.

## 1. Purpose

Preserve, across a machine/terminal/developer/AI-agent switch: implementation
continuity, architecture understanding, release/PR state, debugging context,
decisions + rationale, and environment/tooling knowledge. **Zero context loss.**

---

## 2. Where migration state lives

| Layer | Location | Role / lifetime |
|---|---|---|
| **Migration snapshot** (point-in-time) | `docs/plans/YYYY-MM-DD-session-migration.md` | The handoff for a specific session. **Newest = source of truth.** |
| Referenced design/impl plans | `docs/plans/YYYY-MM-DD-<topic>-{design,implementation}.md` | Detailed plans a snapshot points at |
| Milestone scope | `docs/«vX.Y.Z-progress».md` | Per milestone |
| **Cross-session memory** | `~/.claude/projects/<project-dir>/memory/MEMORY.md` (+ `memory/*.md`) | Durable facts, auto-loaded each session; supersede-on-conflict |
| Architecture / decisions canon | `.claude/CLAUDE.md`, `docs/DECISION_LOG.md` | Long-lived (always verify against code) |
| Governance docs | `RELEASE_MANAGER.md`, `QUALITY_ASSURANCE.md`, this file | Process + standards (stable) |

**Naming convention:** the canonical filename is `YYYY-MM-DD-session-migration.md`.
A same-date `-session-handoff.md` is an accepted synonym **(legacy compat — earlier
name)**; if both exist, the one with the later mtime / an explicit "supersedes" line wins.
**`MEMORY.md` should point to the newest** migration doc on its first line
("read first"); update that pointer whenever you write a new offload.

---

## 3. Session Offload ("hands off")

Run **before** ending a session / switching machine, terminal, developer, or agent.

1. **Create/update** `docs/plans/<today>-session-migration.md`. If a same-day doc
   already exists, **append a continuation section** — do not fork the source of truth.
2. **Verify every claim against actual code** — cite `file:line` for non-obvious facts.
   Do not invent architecture. Mark anything unverified as such.
3. **Reference, don't duplicate** — point at the latest design docs and the prior
   snapshot for unchanged context; record only the **delta** + a re-verification note.
4. **Update project memory** if a durable fact changed (correct/delete stale entries);
   update the `MEMORY.md` "read first" pointer.
5. **Record, don't auto-commit** — note *what is uncommitted*; leave the commit
   decision to the maintainer (manual-merge workflow). **But commit the snapshot if
   the next session is on another machine** — uncommitted docs do not travel.

---

## 4. Session Restore ("hands on")

Run when starting a new session / resuming / onboarding.

1. **Locate** the newest `docs/plans/*-session-{migration,handoff}.md`.
2. **Read**, in order: that snapshot → its referenced design docs → `MEMORY.md` →
   `.claude/CLAUDE.md` + relevant `docs/`.
3. **Treat the newest snapshot as source of truth** where it conflicts with older docs/memory.
4. **Verify before trusting the tree** (run the checks, don't assume):
   - `git branch --show-current` · `git status --short` · `gh pr list`
   - `nvm use` (match `.nvmrc`) · `«PKG_MGR» install` (e.g. `pnpm install`) if needed
   - `«QUALITY_CMD»` (the authoritative green check — e.g. `pnpm ci:quality`; see `QUALITY_ASSURANCE.md`)
   - each listed env gotcha
5. **Flag staleness** — note any doc/memory the snapshot marks stale, and any drift since.
6. **Summarize** current state, risks, blockers, exact next steps.
7. **Do not start implementation automatically** — wait for explicit go-ahead.

---

## 5. Required migration-snapshot structure

A snapshot is complete when it answers all of:

- [ ] **Branch + target + PR/release state** (numbers + draft/ready + CI status).
- [ ] **Completed vs unfinished/uncommitted work** this session.
- [ ] **Verified architecture/stack** (paths/`file:line`, not prose) — or a pointer to the snapshot that still holds + a re-verification date.
- [ ] **Trustworthy vs stale docs** (with the corrected fact + why).
- [ ] **Key decisions + rationale** (why, not just what).
- [ ] **Discovered issues / technical debt / blockers** (link to issues).
- [ ] **Environment / tooling gotchas** — required Node / package-manager / runtime versions; CI quirks.
- [ ] **Exact next steps** (ordered, copy-pasteable, with file paths).
- [ ] **Verification status** — which gates ran, results, what's pending.
- [ ] **Quick re-verify block** (see below).

### Quick re-verify block (template)

```bash
cd «/absolute/path/to/repo»
git branch --show-current && git status --short
source ~/.nvm/nvm.sh && nvm use            # expect «NODE_VERSION» (e.g. 22.15.1)
gh pr list --state open                    # expect «#…»
gh issue list --label audit --limit 50     # current findings
ls docs/plans/*-session-*.md               # newest = source of truth
```

---

## 6. Anti-patterns (flag during offload & restore)

- Inventing architecture not present in code, or copying stale docs forward unverified.
- A snapshot with no `git`/branch/version verification.
- **Forking a same-day source of truth** into a second conflicting doc.
- Recording the *happy path* only — capture blockers and gotchas too.
- Auto-committing uncommitted work during offload (manual-merge repos).
- Auto-implementing on restore without explicit go-ahead.
- Letting an uncommitted snapshot be the only copy when moving machines.
- Trusting stale docs (e.g. a CLAUDE.md locale/architecture claim that no longer matches the shipped app).
