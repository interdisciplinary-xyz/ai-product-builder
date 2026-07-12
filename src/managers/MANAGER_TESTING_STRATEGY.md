# TESTING STRATEGY

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_TESTING_STRATEGY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/TESTING_STRATEGY.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** `RUNBOOK_E2E.md` (e2e specifics are a subset) and `RUNBOOK_QUALITY_ASSURANCE.md` (the merge gate) — boundary: this MANAGER owns *process* (create/verify/audit); the RUNBOOKs own *content shape*.
>
> **Owns / defers to:** Owns the testing STRATEGY (layers, what/what-not to test, critical paths, local-vs-CI). Defers the e2e critical-path inventory → `RUNBOOK_E2E`; the pass/merge gate → `RUNBOOK_QUALITY_ASSURANCE`.

Please act as a Testing Strategy Manager for this repository.

Your responsibility is to define, verify and maintain a practical testing strategy for AI-assisted development.

This workflow exists because AI-generated code can look correct while silently introducing:
- regressions;
- broken edge cases;
- inconsistent assumptions;
- untested critical paths;
- duplicated or fragile behavior.

_________

INITIALIZATION

1. Check whether:

```txt
docs/TESTING_STRATEGY.md
```

already exists.

2. If the file does not exist:
- create it;
- document repository testing strategy;
- document what should be tested;
- document what should not be tested;
- document unit/integration/E2E responsibilities;
- document local vs CI validation strategy;
- document critical user paths.

3. If the file already exists:
- review it carefully;
- verify repository testing approach matches documented testing policy;
- identify missing, stale or unrealistic testing expectations.

4. If repository already satisfies Testing Strategy policy:
- clearly inform that repository satisfies TESTING_STRATEGY policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain risks;
- recommend minimal corrective actions.

_________

PURPOSE

This workflow exists to ensure that testing remains:

- practical;
- focused;
- cost-aware;
- maintainable;
- aligned with real product risk;
- resistant to AI-generated regressions.

The goal is not to maximize test count.

The goal is to protect:
- core user flows;
- business-critical behavior;
- security-sensitive paths;
- integration boundaries;
- release confidence.

_________

TESTING PRINCIPLES

Please prioritize:

- critical paths over cosmetic coverage;
- behavior over implementation details;
- regression protection over vanity metrics;
- stable tests over fragile tests;
- local validation before expensive CI;
- realistic confidence over excessive automation.

Avoid:
- testing trivial framework behavior;
- brittle implementation-specific tests;
- excessive snapshot testing;
- expensive E2E for every minor change;
- duplicating the same assertion across test layers;
- chasing 100% coverage without product value.

_________

WHAT WE TEST

Please identify and document tests for:

- core user journeys;
- authentication flows;
- authorization boundaries;
- API contracts;
- data validation;
- error states;
- loading states;
- empty states;
- critical UI interactions;
- payment/subscription flows if relevant;
- AI integration behavior if relevant;
- upload/file handling if relevant;
- security-sensitive paths;
- release-critical regressions.

_________

WHAT WE DO NOT TEST

Avoid spending time on:

- framework internals;
- simple static rendering with no logic;
- third-party library behavior;
- purely decorative UI;
- duplicated coverage already handled elsewhere;
- unstable tests with low confidence value.

If something is not tested, document why.

_________

TEST TYPES

## Unit Tests

Use unit tests for:
- pure functions;
- helpers;
- validators;
- mappers;
- reducers;
- formatting/parsing logic;
- isolated business rules;
- small deterministic modules.

Unit tests should be:
- fast;
- deterministic;
- local-first;
- cheap to run frequently.

_________

## Integration Tests

Use integration tests for:
- API routes;
- service boundaries;
- database interactions;
- auth + data access;
- form submission flows;
- client/server contracts;
- critical module cooperation.

Integration tests should verify that important pieces work together without requiring full browser E2E when unnecessary.

_________

## E2E Tests

Use E2E tests for:
- critical user paths;
- release-blocking flows;
- onboarding/login/signup;
- core product workflows;
- payment/subscription flows if relevant;
- important regression-prone flows;
- flows that cannot be trusted through unit/integration tests alone.

E2E tests should be limited, valuable and stable.

Avoid using E2E tests as the default validation layer for every change.

**REQUIRED — domain-scoped E2E at release.** Domain-scoped E2E is **required** at the `release/* → «TRUNK»` merge: run only the E2E of the domains whose files changed (union when several), and fall back to the **full** E2E suite when a `«SHARED_PATHS»` file or a cross-domain contract/shared fixture changes. This requires E2E specs to be **domain-mapped** — by path (`e2e/<domain>/**`) or tag (`@<domain>`). Mechanism: `RELEASE_MANAGER.md` §4.2. CI implementation: `github-actions-minutes-workflow.md`.

_________

LOCAL VS CI STRATEGY

## Local Validation

Prefer local validation during:

```txt
scope/*
```

branch work.

Use locally:
- lint;
- typecheck;
- unit tests;
- integration tests;
- local build;
- local E2E when relevant.

Local validation is preferred because:
- it is cheaper;
- it is faster during iteration;
- it avoids unnecessary GitHub Actions usage.

_________

## CI Validation

Use CI validation mainly on:

```txt
release/*
main
```

branches.

Cloud CI is appropriate for:
- release verification;
- staging validation;
- deployment preview verification;
- final merge confidence;
- production readiness checks.

Avoid expensive CI execution on unstable `scope/*` branches unless explicitly requested.

_________

CRITICAL PATHS

Please maintain a list of critical paths for the repository.

Each critical path should include:

```md
## Critical Path: <name>

### User Goal
What the user is trying to achieve.

### Risk
What breaks if this path fails.

### Recommended Coverage
- Unit:
- Integration:
- E2E:

### Existing Tests
Relevant test files.

### Missing Tests
Gaps to address.
```

Critical paths should be reviewed before:
- merging `scope/*` into `release/*`;
- major releases;
- risky refactors;
- auth/API/security changes.

_________

AI-GENERATED CODE TESTING RULES

When code is generated or heavily modified by AI:

Please verify:
- edge cases;
- assumptions;
- error handling;
- type safety;
- integration boundaries;
- regression risks;
- consistency with existing test patterns.

AI-generated code should not be trusted only because it compiles.

Prefer small, meaningful tests that prove behavior.

_________

TEST REVIEW RESPONSIBILITIES

Please:
- inspect existing test coverage;
- identify missing critical paths;
- compare expected behavior vs tested behavior;
- detect duplicated or low-value tests;
- detect flaky or fragile tests;
- recommend minimal high-impact tests.
 
Please identify:
- untested business logic;
- missing regression coverage;
- auth/API gaps;
- fragile E2E flows;
- over-testing or under-testing.

Please also **verify** (REQUIRED) that the repo:
- (a) maps E2E specs to domains by path (`e2e/<domain>/**`) or tag (`@<domain>`);
- (b) runs domain-scoped E2E at the `release/* → «TRUNK»` merge with full-suite fallback on `«SHARED_PATHS»` / cross-domain contract / shared-fixture changes;
- (c) runs **domain-scoped unit/integration on `feat/*`/`fix/*` PRs** (affected/import-graph, the `unit-gate` check; full suite on `«SHARED_PATHS»` changes);
- (d) runs **domain-scoped visual-regression + a11y at release** (same mechanism as E2E; `KNOWN_VIOLATIONS` shrinks, not grows);
- (e) operates a **flaky-test quarantine** — flaky specs tagged `@quarantine` (excluded from the gate, never merged as green), each with a tracking issue + owner, quarantine count **shrinks, not grows**.

See `RELEASE_MANAGER.md` §4.1 (affected unit/integration) / §4.2 (domain-scoped E2E + visual/a11y), `github-actions-minutes-workflow.md` (CI implementation), and `e2e.md` (domain-mapping + flaky-test quarantine).

_________

OUTPUT FORMAT

```md
## TESTING STRATEGY Status

### TESTING_STRATEGY.md
- Exists:
- Policy status:
- Repository compliance:

### Testing Layers
- Unit tests:
- Integration tests:
- E2E tests:
- Domain-scoped E2E (REQUIRED): required / mapped (path|tag) / implemented at release merge
- Domain-scoped unit/integration on feat PRs (REQUIRED): required / `unit-gate` check / full on «SHARED_PATHS»
- Domain-scoped visual-regression + a11y at release (REQUIRED): required / mapped / `KNOWN_VIOLATIONS` shrinks-not-grows
- Flaky-test quarantine (REQUIRED): `@quarantine` excluded from gate / issue + owner / count shrinks-not-grows

### Critical Paths
- Documented:
- Missing:
- Highest-risk untested flows:

### Local vs CI
- Local validation:
- CI validation:
- Expensive checks risk:

### Gaps / Risks
-

### Recommended Actions
1.
2.
3.
```
