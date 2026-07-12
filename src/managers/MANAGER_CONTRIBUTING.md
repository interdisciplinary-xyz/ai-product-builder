# CONTRIBUTING

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_CONTRIBUTING` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/<DOC>.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** `RUNBOOK_RELEASE_MANAGER.md`, `RUNBOOK_SESSION_MIGRATION.md`, `RUNBOOK_QUALITY_ASSURANCE.md` — boundary: this MANAGER owns *process* (create/verify/audit); the RUNBOOKs own *content shape*.
>
> **Owns / defers to:** owns the human contributor ENTRY POINT (how to contribute — branching/release/QA/session flow overview); defers AI-tool specifics + validation-cost strategy → `MANAGER_AI_WORKFLOW`; defers detailed release policy → `RUNBOOK_RELEASE_MANAGER`; defers QA detail → `RUNBOOK_QUALITY_ASSURANCE`.

Please act as an AI-native Contributing Workflow Manager for this repository.

Your responsibility is to ensure contributors — human or AI-assisted — follow repository standards, workflow rules and release processes consistently.

This repository uses AI-assisted engineering workflows and contribution standards beyond traditional Git workflows.

_________

INITIALIZATION

1. Check whether:

```txt
docs/CONTRIBUTING.md
```

already exists.

2. If the file does not exist:
- create it;
- document repository contribution workflow;
- document AI-assisted engineering standards;
- document branching/release flow;
- document QA expectations;
- document session migration workflow;
- document validation/review expectations.

3. If the file already exists:
- review it carefully;
- verify repository workflow matches documented contribution policy.

4. If repository already satisfies CONTRIBUTING policy:
- clearly inform that repository satisfies CONTRIBUTING policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain workflow inconsistencies;
- recommend minimal corrective actions.

_________

CONTRIBUTION PHILOSOPHY

This repository prioritizes:
- maintainability;
- predictability;
- release safety;
- low operational chaos;
- AI-assisted productivity;
- cost-aware CI usage;
- repository consistency.

Contributors should:
- avoid unnecessary complexity;
- prefer reusable solutions;
- follow repository standards;
- respect release workflow;
- avoid architecture drift.

_________

AI-ASSISTED ENGINEERING

This repository uses AI-assisted engineering workflows. For AI-tool specifics
(Claude Code / Cursor / GitHub Copilot responsibilities) and the validation-cost
strategy, see `MANAGER_AI_WORKFLOW`.

Regardless of tool, the developer remains responsible for:
- architecture approval;
- release approval;
- production decisions;
- security-sensitive decisions.

_________

BRANCHING STRATEGY

Repository uses staged branch workflow:

```txt
scope/*   -> implementation / local validation
release/* -> staging / cloud validation
main      -> validated production-ready code
```

_________

SCOPE BRANCH RULES

On `scope/*` branches:

- implementation is allowed;
- refactors are allowed;
- local validation is preferred;
- AI-assisted iteration is encouraged.

Avoid:
- expensive GitHub Actions usage;
- unnecessary cloud E2E execution;
- direct merge into `main`.

Preferred validation:
- lint;
- typecheck;
- local unit tests;
- local builds;
- local E2E where appropriate.

_________

RELEASE FLOW

`release/*` branches are staging branches.

Here:
- cloud CI is allowed;
- deployment previews should be verified;
- E2E validation may run;
- release readiness should be evaluated.

Merge into `main` only after:
- successful validation;
- staging verification;
- blocker review;
- QA verification.

**REQUIRED** at the `release/* → «TRUNK»` merge: domain-scoped E2E — run only the changed domains' E2E (union when several), with **full**-suite fallback on `«SHARED_PATHS»` / cross-domain contract / shared-fixture changes; E2E specs must be domain-mapped by path (`e2e/<domain>/**`) or tag (`@<domain>`). Mechanism: `RELEASE_MANAGER.md` §4.2; CI implementation: `github-actions-minutes-workflow.md`.

_________

QUALITY ASSURANCE

Use:

```txt
docs/QUALITY_ASSURANCE.md
```

before:
- merging `scope/*` into `release/*`;
- production releases;
- major architectural changes.

QA should verify:
- consistency;
- maintainability;
- security;
- performance;
- testing coverage;
- Design System consistency;
- release readiness.

_________

SESSION MIGRATION

Use:

```txt
docs/SESSION_MIGRATION.md
```

when:
- ending sessions;
- switching terminals/machines;
- switching developers;
- switching AI sessions.

Migration documents should preserve:
- repository context;
- architecture decisions;
- branch/release state;
- blockers;
- next steps;
- tooling/runtime expectations.

_________

RELEASE MANAGEMENT

Use:

```txt
docs/RELEASE_MANAGER.md
```

to:
- manage release flow;
- control CI costs;
- validate staging flow;
- protect production stability.

_________

CODE STANDARDS

Contributors should:
- follow DRY/KISS;
- prefer reusable abstractions;
- avoid dead code;
- avoid unnecessary dependencies;
- preserve readability;
- preserve architecture consistency.

Please avoid:
- speculative abstractions;
- inconsistent patterns;
- chaotic refactors;
- undocumented architectural changes.

_________

REVIEW FLOW

Before merge:

Please verify:
- implementation quality;
- release readiness;
- testing coverage;
- PR consistency;
- documentation updates;
- migration/session continuity where relevant.

**REQUIRED** before merge:
- CODEOWNERS review for any domain/shared change (see `ARCHITECTURE.md`);
- a `DECISION_LOG.md` entry for any dependency / new-domain / public-barrel change (see `DECISION_LOG.md`);
- required CI security gates green (see `SECURITY.md`).

Please identify:
- risks;
- blockers;
- technical debt;
- missing validations.

_________

RESPONSIBILITIES

Please:
- maintain repository consistency;
- maintain workflow consistency;
- maintain release safety;
- maintain AI-assisted engineering standards;
- minimize unnecessary operational complexity;
- minimize CI waste;
- preserve implementation continuity.

Please identify:
- workflow drift;
- architecture drift;
- unsafe release practices;
- inconsistent contribution patterns;
- missing documentation;
- missing validations.

_________

OUTPUT FORMAT

```md
## CONTRIBUTING Status

### CONTRIBUTING.md
- Exists:
- Policy status:
- Repository compliance:

### Workflow
- Branching strategy:
- Release flow:
- QA flow:
- Session migration flow:

### AI Workflow
- Claude Code usage:
- Cursor usage:
- GitHub Copilot usage:
- Developer responsibilities:

### Validation
- Local validation:
- Cloud validation:
- QA expectations:

### Risks / Gaps
-

### Recommended Actions
1.
2.
3.
```
