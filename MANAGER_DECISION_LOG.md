# DECISION LOG

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_DECISION_LOG` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/<DOC>.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** `RUNBOOK_DECISION_LOG.md` (the decision-log / ADR content template — formerly named "ARCHITECTURE_DECISIONS"; the two are now unified under DECISION_LOG) — boundary: this MANAGER owns *process* (create/verify/audit); the RUNBOOK owns *content shape*.
>
> **Owns / defers to:** owns the decision-log PROCESS (record/verify architectural & technical decisions + rationale/tradeoffs); defers the live architecture map → `MANAGER_ARCHITECTURE`.

Please act as a Decision Log Manager for this repository.

Your responsibility is to preserve architectural reasoning, implementation rationale and important technical decisions across repository evolution.

This workflow exists because both humans and AI systems tend to forget:
- why decisions were made;
- what alternatives were rejected;
- what tradeoffs existed;
- what technical constraints shaped implementation.

_________

INITIALIZATION

1. Check whether:

```txt
docs/DECISION_LOG.md
```

already exists.

2. If the file does not exist:
- create it;
- initialize repository decision log;
- document major architectural decisions;
- document important technical constraints;
- document known tradeoffs.

3. If the file already exists:
- review it carefully;
- verify repository decisions are properly documented;
- identify undocumented architectural decisions;
- identify stale or conflicting decision entries.

4. If repository already satisfies Decision Log policy:
- clearly inform that repository satisfies DECISION_LOG policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain risks;
- recommend minimal corrective actions.

_________

PURPOSE

This workflow exists to preserve:

- architectural reasoning;
- implementation rationale;
- technical constraints;
- tradeoffs;
- rejected approaches;
- operational decisions;
- workflow decisions;
- release/process decisions.

The goal is to:
- reduce context loss;
- reduce repeated discussions;
- reduce architecture drift;
- reduce contradictory AI decisions;
- improve onboarding;
- improve long-term maintainability.

_________

WHAT SHOULD BE DOCUMENTED

Please document important decisions such as:

- architecture choices;
- framework/library choices;
- database decisions;
- authentication decisions;
- API design decisions;
- deployment/infrastructure decisions;
- monorepo decisions;
- testing strategy decisions;
- AI workflow decisions;
- CI/CD decisions;
- release workflow decisions;
- performance/security tradeoffs;
- rejected implementation approaches.

Avoid documenting:
- trivial implementation details;
- temporary debugging notes;
- low-impact cosmetic decisions.

_________

ADR-REQUIRED TRIGGERS (REQUIRED)

This is the **canonical** list of changes that MUST carry a decision record. **REQUIRED:** a merge is blocked unless a `DECISION_LOG.md` entry is added when the PR:

- (a) adds a new dependency;
- (b) creates a new domain;
- (c) changes a domain's public barrel.

Enforced by a CI diff-check (the `adr` gate) — see `github-actions-minutes-workflow.md`.

These are exactly the events that change test/build blast radius (a new dependency widens the build, a new or re-barrelled domain shifts what domain-scoped testing must run), so each one is worth a recorded decision.

_________

DECISION ENTRY FORMAT

Each important decision should include:

```md
## Decision: <title>

### Date
YYYY-MM-DD

### Status
- proposed
- accepted
- deprecated
- replaced

### Context
Why decision was needed.

### Decision
What was decided.

### Tradeoffs
Pros/cons and compromises.

### Alternatives Considered
Rejected or competing approaches.

### Constraints
Technical/business limitations influencing decision.

### Consequences
Expected impact and future implications.

### Related Files
Relevant repository paths/files.
```

_________

DECISION QUALITY RULES

Please ensure:
- decisions reflect actual repository state;
- decisions are verified against implementation;
- decisions explain rationale clearly;
- decisions remain concise and maintainable;
- stale decisions are marked appropriately.

Please identify:
- undocumented architecture drift;
- conflicting decisions;
- outdated assumptions;
- decisions no longer matching implementation.

_________

AI WORKFLOW INTEGRATION

AI systems should:
- read Decision Log before major changes;
- preserve accepted architectural direction;
- avoid contradicting previous decisions without explanation;
- document significant new tradeoffs.

Decision Log should act as:
- architectural memory;
- long-term reasoning layer;
- implementation continuity layer.

_________

RESPONSIBILITIES

Please:
- preserve architectural memory;
- preserve implementation rationale;
- preserve important tradeoffs;
- preserve workflow/process decisions;
- reduce contradictory implementation patterns;
- reduce re-learning cost.

Please identify:
- missing rationale;
- undocumented tradeoffs;
- architecture drift;
- stale decisions;
- conflicting decisions.

Please recommend:
- minimal documentation updates;
- missing decision entries;
- deprecated decision cleanup.

_________

OUTPUT FORMAT

```md
## DECISION LOG Status

### DECISION_LOG.md
- Exists:
- Policy status:
- Repository compliance:

### Architectural Decisions
- Documented:
- Missing:
- Conflicting:
- Stale:

### Workflow Decisions
- Release workflow:
- QA workflow:
- AI workflow:
- Session migration workflow:

### Risks
-

### Recommended Actions
1.
2.
3.
```
