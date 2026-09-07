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

Check for `docs/ENGINEERING_STANDARDS.md`. If it does not exist, create it and document the
conventions, philosophy, coding standards, acceptable patterns and implementation
expectations. If it does, verify the repository follows it and name the inconsistent or
undocumented patterns. Say plainly whether the repo satisfies the policy; if it does not,
give the gaps and the smallest corrective action.

_________

PURPOSE

This document is the repository's coding constitution. QA validates implementation quality;
Engineering Standards define how code should be written. They are complementary, not
duplicates. The goal is less architecture drift, fewer inconsistent patterns, less
AI-generated chaos, less fragmentation and slower maintainability decay.

Filled, it becomes the repository's architectural guardrails, its shared engineering
language, and the baseline every engineering decision is measured against.

_________

WHAT TO DOCUMENT AND VERIFY

Each heading is one section of `docs/ENGINEERING_STANDARDS.md`. Document it, check it against
the code, and report where they disagree.

**Philosophy.** Simplicity over cleverness, maintainability over short-term hacks, readability
over abstraction for its own sake, consistency over personal preference, explicitness over
hidden magic, reuse over duplication where reasonable. Enforce DRY, KISS, predictable patterns
and low operational complexity. Avoid speculative abstraction, overengineering, unnecessary
indirection, framework gymnastics and mixed implementation styles.

**Architecture conventions.** The structure philosophy: feature-first or layer-first, modular
boundaries, shared libraries, monorepo conventions, frontend/backend separation, API
boundaries. Structure stays predictable and organisation scales.

**REQUIRED:** domain-boundary lint (no cross-domain deep imports; dependency direction `domain → shared` only; no cycles; no `server-only` in client-reachable barrels) is enforced as a CI gate — see `ARCHITECTURE.md` (boundaries) and `github-actions-minutes-workflow.md` (the `boundaries` gate).

**Components and modules.** Component structure, reusable-component philosophy, the
hooks/services/utils separation, shared logic, UI versus business logic, file organisation.
Flag duplicated logic, unclear boundaries, oversized modules and tight coupling.

**Naming.** Conventions for files, folders, components, hooks, services, utilities, APIs,
types and interfaces, tests, and environment variables. Naming reflects responsibility and
reduces ambiguity.

**Typing.** Type-safety expectations, TypeScript standards, interface and type organisation,
API, schema and validation typing. Enforce strong typing where practical; avoid unsafe
implicit behaviour and casual `any`. Avoid type gymnastics too: an unreadable type is a
comment nobody can fix.

**Error handling.** Philosophy, async errors, API error conventions, frontend error states,
logging and reporting. Failures stay predictable and errors stay actionable, without leaking
anything sensitive. No silent failures, swallowed exceptions or inconsistent error shapes.

**Async and data flow.** Async standards, loading states, retry behaviour, request and data
flow, concurrency. State transitions stay predictable; loading and error states are handled
the same way everywhere.

**Validation and API contracts.** Validation philosophy, schema validation, request and
response expectations, input sanitisation, the frontend/backend contract. Validation happens
consistently and API behaviour is explicit.

**Logging and observability.** Logging, debugging, monitoring and production-safe standards.
Logs stay actionable and leak nothing. No noisy logs, no inconsistent formats.

**Testing philosophy.** Unit versus integration versus E2E, testing priorities, local versus
CI, critical paths, regression expectations. Align with `docs/TESTING_STRATEGY.md` rather than
restating it. Tests protect important behaviour, stay maintainable, and do not calcify into
brittle over-testing.

_________

AI-ASSISTED DEVELOPMENT RULES

Follow the repository's conventions, preserve its architecture, and reuse an existing pattern
before inventing one. Inspect what is there before generating code. AI-written code should
read as native to the repository, not as obviously AI-written.

_________

RESPONSIBILITIES

Inspect the repository's conventions, architectural consistency, implementation patterns,
maintainability and quality consistency. Identify inconsistent patterns, drift,
fragmentation, duplicated logic, overengineering, weak abstractions and unclear boundaries.
Recommend simpler implementations, genuinely reusable abstractions, and improvements to
standardisation, consistency and maintainability.

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
