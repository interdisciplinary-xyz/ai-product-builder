# Project Plan — v«X.Y.Z»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PROJECT_PLAN` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/PROJECT_PLAN-v«X.Y.Z».md` (one per milestone) and fill the `«placeholders»`.
>
> **Reusability:** template-ready — the structure is generic; only the milestone-specific content is filled in per milestone.
>
> **Pairs with:** `MANAGER_PROJECT.md` (the playbook that creates / verifies / maintains this doc) — boundary: this RUNBOOK owns *content shape*; `MANAGER_PROJECT` owns *process*.
>
> **Local definitions to provide per milestone** (fill the placeholders below):
> - `«X.Y.Z»` — milestone version (matches GitHub milestone `v«X.Y.Z»` and `scope/v«X.Y.Z»`).
> - `«MILESTONE_GOAL»` — one-sentence success criterion.
> - `«NSM_DELTA»` — north-star metric impact (see `NORTH_STAR.md` / `METRICS.md`).
> - `«TARGET_DATE»` — milestone due date.
> - `«DRI»` — milestone DRI handle.
> - `«WIP_CAP»` — soft WIP cap (default 12).
> - `«MILESTONE_URL»` / `«TRACKING_ISSUE_URL»` — links to the matching GitHub milestone + pinned tracking issue.

> **Status:** «🟢 on-track / 🟡 at-risk / 🔴 off-track»  ·  **DRI:** @«handle»  ·  **Target:** «DATE»  ·  **WIP cap:** «12»
> (Auto-updated by the weekly status snapshot — see §"Status snapshots".)

---

## Milestone

**Goal.** «one sentence — what success looks like»

**NSM impact.** «which north-star metric this moves, and by how much»

**Companion:**
- GitHub milestone: [`v«X.Y.Z»`](«MILESTONE_URL»)
- Pinned tracking issue: [#«N»](«TRACKING_ISSUE_URL»)
- Branch: `scope/v«X.Y.Z»` (per `RELEASE_MANAGER.md` §1)

---

## In scope

- #«N» — «one-liner» — DRI @«handle» — `size:«s»`
- #«N» — «one-liner» — DRI @«handle» — `size:«m»`
- …

## Out of scope (explicit — we said no to this on purpose)

- «what we are intentionally **not** doing this milestone — and why»
- «…»

> A milestone without an explicit out-of-scope list will bloat. Be specific.

---

## Workstreams

### «Workstream A»

| # | Title | DRI | Size | Status | DoD |
|---|---|---|---|---|---|
| #«N» | «one-liner» | @«handle» | `s` | todo / doing / review / done | [DoD](«link») |
| #«N» | «one-liner» | @«handle» | `m` | doing | [DoD](«link») |

### «Workstream B»

| # | Title | DRI | Size | Status | DoD |
|---|---|---|---|---|---|
| #«N» | «one-liner» | @«handle» | `s` | todo | [DoD](«link») |

---

## Dependencies

- #«N» is **blocked-by** #«M» — «what unblocks it»
- #«N» **unblocks** #«K»
- External: «vendor / team / library» — «what we need, by when»

> GitHub renders `blocked-by:` / `unblocks:` task-lists as a graph in the issue. Keep dependencies there; this section is a human summary.

---

## RAID (live queries — do not edit by hand)

- **Risks** — [open](«REPO_URL»/issues?q=is:open+is:issue+label:risk:+milestone:v«X.Y.Z»)
- **Assumptions** — [open](«REPO_URL»/issues?q=is:open+is:issue+label:assumption:+milestone:v«X.Y.Z»)
- **Issues / blockers (p0/p1)** — [open](«REPO_URL»/issues?q=is:open+is:issue+label:issue:+label:priority:p0,priority:p1+milestone:v«X.Y.Z») — *(same list as `RELEASE_MANAGER.md` §7)*
- **Dependencies** — [open](«REPO_URL»/issues?q=is:open+is:issue+label:dep:+milestone:v«X.Y.Z»)

> Status, plan, RAID and history live in GitHub. This doc *mirrors* them; it never replaces them.

---

## Status snapshots (append-only — newest on top)

### «DATE» — week «N»
- Open / In-progress / Closed: «X / Y / Z»
- Burndown vs target: «X days remaining, on-track / at-risk / off-track»
- Blockers: «#N (DRI), #M (DRI)» — or "none"
- New risks (last 7d): «#N — one-line»
- Oversize / decompose asks: «#N»
- CI minutes burned this week: «X»
- Notes: «one sentence»

### «DATE» — week «N-1»
- …

---

## Scope-change log

| Date | Issue | Decision | Impact |
|---|---|---|---|
| «DATE» | #«N» | Accepted / Deferred / Cut | «brief — date slip / cost / RAID delta» |

> Adds after the milestone is locked require a `scope-change` issue (see `MANAGER_PROJECT.md`). Silent additions are reverted.

---

## Closeout retro (fill at milestone close; file as `docs/RETRO-v«X.Y.Z».md`)

### Keep
- «what worked — do it again»

### Change
- «what worked but could be better»

### Try
- «new experiment for next milestone»

> Closeout decisions that change how we work next time → file an ADR in `docs/DECISION_LOG.md` (per `MANAGER_DECISION_LOG` triggers).

---

## Related

- Product context — `docs/PRODUCT_CONTEXT.md`
- Roadmap (long-horizon) — `docs/ROADMAP.md`
- Release flow — `docs/RELEASE_MANAGER.md` (its §7 blocker list = this plan's `issue:` RAID — **one list, two views**)
- Decisions — `docs/DECISION_LOG.md`
- Architecture — `docs/ARCHITECTURE.md`
- Quality gate — `docs/QUALITY_ASSURANCE.md`
- Incidents (reactive) — `docs/RUNBOOK.md` *(per-repo deployed name of `RUNBOOK_INCIDENTS`)*

---

## Per-issue verdict matrix (appendix)

> Use this section when the milestone has enough open issues that a per-track summary isn't enough — you want a single audit table for "what closes / what carries forward / what we silently shipped earlier." Pairs with the scope-aggregate PR body in `pull_request_template.md` (the PR links here as its **source of truth** for verdicts).

### Verdict legend

| Verdict | Meaning |
|---------|---------|
| **Close** | Acceptance met on this branch (or already on «TRUNK»); close issue when its PR merges |
| **Partial** | Meaningful progress; keep issue open with narrowed scope |
| **Deferred** | Out of scope for this milestone; carry forward on `release/v«X.Y.Z»` or later |
| **Shipped** | Already closed on GitHub before this milestone started — listed for accounting |

### Verdict table (skeleton — one row per open issue)

| # | Title | Track | Verdict | PR | Notes |
|---|-------|-------|---------|----|-------|
| [#«N»](«ISSUE_URL») | «one-liner» | «A / B / C / …» | **Close** | [#«PR»](«PR_URL») | «what landed; manual QA gate if any» |
| [#«N»](«ISSUE_URL») | «one-liner» | «A» | **Partial** | [#«PR»](«PR_URL») | «narrowed scope summary» |
| [#«N»](«ISSUE_URL») | «one-liner» | «B» | **Deferred** | — | «one-line reason; blocked-by #«M» if any» |
| [#«N»](«ISSUE_URL») | «one-liner» | «C» | **Shipped** | [#«earlier PR»](«PR_URL») | «which milestone / PR shipped it» |

### Summary counts

| Verdict | Count |
|---------|------:|
| Close | «N» |
| Partial | «N» |
| Deferred | «N» |
| Shipped | «N» |

### Merge actions for the scope PR

- **Close on merge:** «#…»
- **Close after QA:** «#…» (🧪 rows)
- **Keep open (partial):** all 🟡 rows above
- **Deferred on `release/v«X.Y.Z»`:** «#…»
