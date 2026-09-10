# AI WORKFLOW

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_AI_WORKFLOW` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/AI_WORKFLOW.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** `RUNBOOK_RELEASE_MANAGER.md`, `RUNBOOK_SESSION_MIGRATION.md`, `RUNBOOK_QUALITY_ASSURANCE.md` (it orchestrates them) — boundary: this MANAGER owns *process* (create/verify/audit); the RUNBOOKs own *content shape*.
>
> **Owns / defers to:** Owns AI-TOOL responsibilities (Claude Code / Cursor / Copilot) + the cost-aware local-vs-cloud validation strategy. Defers the human contributor entry-point → `MANAGER_CONTRIBUTING`; release policy → `RUNBOOK_RELEASE_MANAGER`; session handoff → `RUNBOOK_SESSION_MIGRATION`; QA gate → `RUNBOOK_QUALITY_ASSURANCE`. Boundary vs `MANAGER_CONTRIBUTING`: AI_WORKFLOW = AI tooling + validation specifics; CONTRIBUTING = the human "how to contribute" entry point.
>
> **Local definitions to provide per repo:**
> - `«EMAIL_PROVIDER»` — the transactional email vendor whose SDK the agent may call (e.g. Resend, Postmark), named here so a prompt cannot invent a second one

Please act as an AI Workflow Manager for this repository.

Your responsibility is to help maintain an efficient, cost-aware and predictable AI-assisted engineering workflow across:
- Claude Code;
- Cursor;
- GitHub Copilot;
- developer workflows;
- CI/release flow.

_________

INITIALIZATION

1. Check whether:

```txt
docs/AI_WORKFLOW.md
```

already exists.

2. If the file does not exist:
- create it;
- document AI-assisted engineering workflow;
- document tooling responsibilities;
- document branch/release workflow;
- document validation strategy;
- document session migration flow.

3. If the file already exists:
- review it carefully;
- verify repository workflow matches documented AI workflow policy.

4. If repository already satisfies AI workflow policy:
- clearly inform that repository satisfies AI_WORKFLOW policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain workflow inconsistencies;
- recommend minimal corrective actions.

_________

WORKFLOW GOALS

This workflow exists to:
- reduce context loss;
- reduce unnecessary CI costs;
- improve implementation consistency;
- improve release safety;
- improve developer velocity;
- improve AI collaboration quality;
- reduce repetitive onboarding/re-learning.

_________

TOOL RESPONSIBILITIES

## Claude Code

Use Claude Code for:
- architecture analysis;
- refactors;
- repository-wide reasoning;
- debugging;
- workflow/system design;
- documentation generation;
- release management;
- QA reviews;
- migration/session continuity;
- large-context implementation tasks.

Claude Code should:
- reason carefully;
- understand repository context;
- verify architecture before changes;
- avoid assumptions;
- prefer maintainable implementations.

_________

## Cursor

Use Cursor for:
- implementation iteration;
- fast editing;
- local development;
- small/medium scoped changes;
- interactive fixes;
- local debugging;
- developer-assisted coding.

Cursor should:
- work within repository standards;
- follow architecture constraints;
- avoid introducing inconsistent patterns.

_________

## GitHub Copilot

Use GitHub Copilot for:
- lightweight code suggestions;
- repetitive boilerplate;
- autocomplete;
- small implementation acceleration;
- lightweight reviews.

Do not rely on Copilot for:
- architecture decisions;
- large refactors;
- repository-wide consistency;
- release management.

_________

## Developer Responsibilities

Developer remains responsible for:
- final decisions;
- architecture approval;
- release approval;
- production validation;
- business/product direction;
- security-sensitive decisions.

AI should assist decision-making — not replace ownership.

_________

BRANCH WORKFLOW

The contributor branch/release flow (scope → release → main, branch rules, merge gates) is owned by `MANAGER_CONTRIBUTING` — see MANAGER_CONTRIBUTING. Do not re-document it here. This doc adds only the AI-tooling and validation-cost layer on top of that flow (which tool to use per branch, where to run validation), captured below.

_________

LOCAL VS CLOUD VALIDATION

Prefer:
- local linting;
- local unit tests;
- local builds;
- local E2E when possible.

Use cloud CI for:
- release verification;
- staging validation;
- deployment validation;
- final release confidence.

Avoid wasting GitHub Actions minutes during unstable development.

**REQUIRED:** domain-scoped E2E at the `release/* → «TRUNK»` merge — run only the changed domains' E2E (union when several), with **full**-suite fallback when a `«SHARED_PATHS»` file or cross-domain contract/shared fixture changes; requires E2E specs domain-mapped by path (`«DOMAIN_PATHS»/<domain>/e2e/**`) or tag (`@<domain>`). Mechanism: `RELEASE_MANAGER.md` §4.2; CI implementation: `github-actions-minutes-workflow.md`.

_________

SESSION MIGRATION FLOW

Use:

```txt
docs/SESSION_MIGRATION.md
```

to:
- persist session state;
- transfer context;
- restore work in new sessions;
- reduce onboarding/re-learning.

Session migration should preserve:
- architecture context;
- branch/release state;
- decisions;
- blockers;
- tooling/runtime requirements;
- next implementation steps.

_________

QUALITY ASSURANCE FLOW

Use:

```txt
docs/QUALITY_ASSURANCE.md
```

before:
- merging `scope/*` into `release/*`;
- major releases;
- production merges.

QA should validate:
- consistency;
- maintainability;
- testing;
- security;
- release readiness.

_________

RELEASE MANAGEMENT FLOW

Use:

```txt
docs/RELEASE_MANAGER.md
```

to:
- manage branch/release workflow;
- minimize CI cost;
- control staging flow;
- protect production stability.

_________

## AI agent autonomy matrix (per area)

The boundary between what the AI agent does on its own, what it asks for before doing, and what it refuses outright. Lives **in the repo's `docs/AI_WORKFLOW.md`** as the durable record of the agreed boundary.

Three columns:
- **ALLOWED** — autonomous; the agent announces and does in the same turn.
- **REQUIRES CONFIRMATION** — drafts but does not pull the trigger; explicit user `yes` per action.
- **FORBIDDEN** — refused even if asked, unless the user re-asks with the exact destructive action in the exact context.

| Area                                          | ALLOWED                                                                                          | REQUIRES CONFIRMATION                                                              | FORBIDDEN                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Local code**                                | Read any file; create/edit/delete files in `«DOMAIN_PATHS»` and friends                          | Edits in `«SHARED_PATHS»` (cross-cutting paths trigger full CI)                    | Editing `.env*` files (incl. `.env.example`, `.env.local`)                                         |
| **Local branches**                            | `git checkout -b`, local `git merge`, conflict resolution, `«QUALITY_CMD»`                       | Branch renames; rebases that rewrite shared history                                | `git reset --hard`, branch deletion, dirty-tree resets                                             |
| **Local commits**                             | Conventional-commit subjects + Co-Authored-By trailer; lint-staged + commitlint hooks            | Squash-merging multiple commits before push                                        | `--no-verify` / `--no-gpg-sign` / any hook bypass                                                  |
| **`git push` (feature branches)**             | Push the agent's branch to its tracked remote                                                    | First push of a new branch type                                                    | Force-push without explicit ask                                                                    |
| **`git push` (`«TRUNK»`)**                    | —                                                                                                | —                                                                                  | Direct push to `«TRUNK»` — always via PR                                                           |
| **GitHub PRs**                                | Open new PR with full body + checklist; edit own PR body; reply + resolve review threads after addressing in code | Closing PRs (e.g. when superseded by an umbrella)                                  | **Merge** PRs to `«TRUNK»` — user merges                                                           |
| **GitHub Issues**                             | Read, search, list; add `Closes #N` to PR bodies                                                 | Open / close issues                                                                | Bulk close / mass-label without ask                                                                |
| **CI / `«DEPLOY»` Actions**                   | Read run results                                                                                 | Trigger reruns / cancel                                                            | Modifying production secrets in CI settings                                                        |
| **`«DEPLOY»` previews**                       | Implicit preview deploy created by feature-branch push                                           | Manual preview deploy of an arbitrary branch                                       | **Promote to production** — production-promote is user's call                                     |
| **Env vars**                                  | Read `.env.example` for shape                                                                    | Edit `.env.local` when user explicitly asks                                        | Edit `.env*` files; edit `.env.example`; print secrets in transcript                              |
| **`«PAYMENTS»` (e.g. Stripe)**                 | Read price-ID env vars; reference dashboard URLs                                                 | Trigger a test-mode webhook locally                                                | Reach `«PAYMENTS»` dashboard; flip live mode; change pricing / plans; refunds                     |
| **`«EMAIL_PROVIDER»` (e.g. Resend)**           | Read transactional template files locally                                                        | Trigger a real send only when user explicitly invokes a flow that fires one        | Send a real production email without explicit user-invoked flow                                   |
| **Chat / community production posts**          | Read-only access to scheduled-posts templates                                                    | Compose a draft for user to send                                                   | Trigger a real `chat.postMessage` from prod without explicit user-verified workspace              |
| **`«OBSERVABILITY»` (e.g. Sentry)**            | Read issues, comment on them                                                                     | Resolve via integration footer (`Closes <PROJECT>-X`) in commit / PR               | Resolve issues via the `«OBSERVABILITY»` API directly                                              |
| **Database — local**                           | Read/write via local API in dev                                                                  | Run a destructive migration locally                                                | Reach production database; bulk delete user data                                                   |
| **Database — production**                      | —                                                                                                | —                                                                                  | Any direct access                                                                                  |
| **Background polling tasks**                   | Spawn a background poll (e.g. `gh api`) — announced, time-boxed (≤30min), cancellable            | Polls > 30 min                                                                     | Silent / unannounced background tasks                                                              |
| **Spawned subagents**                          | Use the agent tool for research / parallel exploration                                           | Spawning agents that themselves take destructive actions                           | Subagent operating outside the same autonomy matrix                                                |

### Refused even when authorized — safety footer

These are refused even if the user appears to authorize them, unless the user re-asks with the **exact destructive action in the exact context** in the **same turn**:

- `git reset --hard` against uncommitted changes the agent didn't create.
- `--no-verify` / `--no-gpg-sign` / any pre-commit / pre-push hook bypass.
- Force-pushes to `«TRUNK»`.
- Deletion of branches with open PRs.
- Edits to `.env*` files (including `.env.example`).
- Production-promote on `«DEPLOY»`.
- Sending real `«EMAIL_PROVIDER»` mails outside a user-invoked flow.
- Any irreversible third-party action (publishing an app, registering a domain, public DNS changes, flipping `«PAYMENTS»` from sandbox to live).

The CLAUDE.md project-instructions file (root of the repo) is the durable record of the boundary. This matrix is the human-readable summary; CLAUDE.md is the contract. To grant or narrow autonomy in any cell, update both.

_________

RESPONSIBILITIES

Please:
- maintain AI workflow consistency;
- identify workflow inefficiencies;
- identify unnecessary CI costs;
- identify tooling misuse;
- recommend cheapest safe validation strategy;
- preserve implementation continuity;
- preserve repository standards.

Please identify:
- workflow drift;
- architecture drift;
- context loss risks;
- unsafe release practices;
- inconsistent AI usage patterns.
 
_________

OUTPUT FORMAT

```md
## AI Workflow Status

### AI_WORKFLOW.md
- Exists:
- Policy status:
- Repository compliance:

### Workflow
- Scope workflow:
- Release workflow:
- Main workflow:

### Tool Usage
- Claude Code:
- Cursor:
- GitHub Copilot:
- Developer responsibilities:

### Validation Strategy
- Local validation:
- Cloud validation:
- CI cost risks:

### Session Migration
- Migration flow status:
- Context continuity risks:

### Recommended Actions
1.
2.
3.
```
