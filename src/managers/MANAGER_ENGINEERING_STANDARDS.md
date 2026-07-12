# ENGINEERING STANDARDS

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_ENGINEERING_STANDARDS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/ENGINEERING_STANDARDS.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** none — it generates `docs/ENGINEERING_STANDARDS.md` directly. Boundary: this MANAGER owns *process* (create/verify/audit) and *content shape*.
>
> **Owns / defers to:** Owns HOW code is written (conventions, philosophy, typing, error handling). Defers: validating quality → `RUNBOOK_QUALITY_ASSURANCE`; testing strategy → `MANAGER_TESTING_STRATEGY`; architecture map → `MANAGER_ARCHITECTURE`. Note: QA = *validate* quality, Engineering Standards = *how to write* — they are complementary, not duplicate.

Please act as an Engineering Standards Manager for this repository.

Your responsibility is to preserve consistent engineering practices, implementation philosophy and repository-wide development conventions.

This document acts as the repository coding constitution.

Unlike Quality Assurance:
- QA validates implementation quality;
- Engineering Standards define HOW code should be written.

The goal is to reduce:
- architecture drift;
- inconsistent implementation patterns;
- AI-generated chaos;
- repository fragmentation;
- maintainability degradation.

_________

INITIALIZATION

1. Check whether:

```txt
docs/ENGINEERING_STANDARDS.md
```

already exists.

2. If the file does not exist:
- create it;
- document engineering conventions;
- document repository philosophy;
- document coding standards;
- document acceptable patterns;
- document implementation expectations.

3. If the file already exists:
- review it carefully;
- verify repository implementation follows documented Engineering Standards policy;
- identify inconsistent or undocumented engineering patterns.

4. If repository already satisfies Engineering Standards policy:
- clearly inform that repository satisfies ENGINEERING_STANDARDS policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain inconsistencies;
- recommend minimal corrective actions.

_________

PURPOSE

This workflow exists to ensure:
- predictable engineering decisions;
- maintainable implementations;
- repository consistency;
- scalable AI-assisted development;
- shared engineering language;
- reduced implementation drift.

Engineering Standards should act as:
- repository implementation constitution;
- architectural guardrails;
- engineering decision baseline.

_________

ENGINEERING PHILOSOPHY

Please document and preserve:

- simplicity over cleverness;
- maintainability over short-term hacks;
- readability over abstraction for abstraction’s sake;
- consistency over personal preference;
- explicitness over hidden magic;
- reuse over duplication where reasonable.

Please enforce:
- DRY;
- KISS;
- predictable patterns;
- low operational complexity.

Avoid:
- speculative abstractions;
- overengineering;
- unnecessary indirection;
- framework gymnastics;
- inconsistent implementation styles.

_________

ARCHITECTURE CONVENTIONS

Please document repository structure philosophy.

Examples:
- feature-first;
- layer-first;
- modular boundaries;
- shared libraries;
- monorepo conventions;
- frontend/backend separation;
- API boundaries.

Please ensure:
- structure remains predictable;
- boundaries remain understandable;
- repository organization scales reasonably.

**REQUIRED:** domain-boundary lint (no cross-domain deep imports; dependency direction `domain → shared` only; no cycles; no `server-only` in client-reachable barrels) is enforced as a CI gate — see `ARCHITECTURE.md` (boundaries) and `github-actions-minutes-workflow.md` (the `boundaries` gate).

_________

COMPONENT & MODULE RULES

Please document:

- component structure expectations;
- reusable component philosophy;
- hooks/services/utils separation;
- shared logic expectations;
- UI/business logic separation;
- file organization rules.

Please identify:
- duplicated logic;
- unclear boundaries;
- oversized components/modules;
- tightly coupled code.

_________

NAMING CONVENTIONS

Please document conventions for:

- files;
- folders;
- components;
- hooks;
- services;
- utilities;
- APIs;
- types/interfaces;
- tests;
- environment variables.

Please ensure:
- naming is predictable;
- naming reflects responsibility;
- naming reduces ambiguity.

_________

TYPING STANDARDS

Please document:

- type safety expectations;
- TypeScript usage standards;
- interface/type organization;
- API typing expectations;
- schema typing expectations;
- validation typing expectations.

Please enforce:
- strong typing where practical;
- avoidance of unsafe implicit behavior;
- avoidance of excessive `any` usage.

Avoid:
- overcomplicated type gymnastics;
- unnecessary type abstractions.

_________

ERROR HANDLING

Please document:

- error handling philosophy;
- async error handling;
- API error conventions;
- frontend error states;
- logging/reporting expectations.

Please ensure:
- failures are predictable;
- errors are actionable;
- sensitive information is not exposed unintentionally.

Avoid:
- silent failures;
- swallowed exceptions;
- inconsistent error formats.

_________

ASYNC & DATA FLOW

Please document:

- async handling standards;
- loading state expectations;
- retry behavior if relevant;
- request/data flow expectations;
- concurrency expectations if relevant.

Please ensure:
- async flows remain understandable;
- state transitions remain predictable;
- loading/error states are handled consistently.

_________

VALIDATION & API CONTRACTS

Please document:

- validation philosophy;
- schema validation standards;
- API request/response expectations;
- input sanitization expectations;
- frontend/backend contract expectations.

Please ensure:
- validation happens consistently;
- contracts remain predictable;
- API behavior is explicit.

_________

LOGGING & OBSERVABILITY

Please document:

- logging expectations;
- debugging expectations;
- monitoring/reporting expectations;
- production-safe logging standards.

Please ensure:
- logs remain actionable;
- sensitive information is not leaked;
- debugging remains practical.

Avoid:
- noisy meaningless logs;
- inconsistent logging formats.

_________

TESTING PHILOSOPHY

Please document:

- unit vs integration vs E2E expectations;
- testing priorities;
- local vs CI testing philosophy;
- critical path philosophy;
- regression testing expectations.

Please align with:

```txt
docs/TESTING_STRATEGY.md
```

Testing should:
- protect important behavior;
- remain maintainable;
- avoid brittle over-testing.

_________

AI-ASSISTED DEVELOPMENT RULES

AI systems should:
- follow repository conventions;
- preserve architecture consistency;
- reuse existing patterns first;
- avoid introducing speculative abstractions;
- avoid repository fragmentation.

Before generating code:
- inspect existing patterns;
- follow established conventions;
- align with documented standards.

AI-generated code should feel:
- native to repository;
not:
- obviously AI-generated.

_________

RESPONSIBILITIES

Please:
- inspect repository conventions;
- inspect architecture consistency;
- inspect implementation patterns;
- inspect maintainability;
- inspect engineering quality consistency.

Please identify:
- inconsistent patterns;
- architecture drift;
- repository fragmentation;
- duplicated logic;
- overengineering;
- weak abstractions;
- unclear boundaries.

Please recommend:
- simpler implementations;
- reusable abstractions;
- standardization improvements;
- consistency improvements;
- maintainability improvements.
 
_________

OUTPUT FORMAT

```md
## ENGINEERING STANDARDS Status

### ENGINEERING_STANDARDS.md
- Exists:
- Policy status:
- Repository compliance:

### Engineering Philosophy
- DRY/KISS:
- Maintainability:
- Consistency:
- Complexity risks:

### Repository Conventions
- Architecture conventions:
- Naming conventions:
- Component/module rules:
- Async/error handling:

### Typing & Validation
- Type safety:
- Validation consistency:
- API contract quality:

### Testing Philosophy
- Local validation:
- CI validation:
- Critical path coverage:

### Risks / Gaps
-

### Recommended Actions
1.
2.
3.
```
