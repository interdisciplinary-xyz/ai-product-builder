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

Check for `docs/TESTING_STRATEGY.md`. If it does not exist, create it and document the test
layers, critical paths, what is deliberately not tested, and the local-versus-CI split. If it
does, verify the suite matches it and name the gaps. Say plainly whether the repo satisfies
the policy, and give the smallest corrective action if not.

_________

PURPOSE

Testing here stays practical, focused, cost-aware, maintainable, aligned with real product
risk, and resistant to AI-generated regressions. The goal is not to maximise test count. It is
to protect core user flows, business-critical behaviour, security-sensitive paths, integration
boundaries, and release confidence.

_________

PRINCIPLES

Prioritise critical paths over cosmetic coverage, behaviour over implementation detail,
regression protection over vanity metrics, stable tests over fragile ones, local validation
before expensive CI, and realistic confidence over exhaustive automation.

Avoid testing framework behaviour, brittle implementation-specific assertions, excessive
snapshots, E2E for every minor change, the same assertion duplicated across layers, and 100%
coverage chased without product value.

_________

WHAT WE TEST, AND WHAT WE DO NOT

**Test:** core user journeys, authentication flows, authorization boundaries, API contracts,
data validation, error, loading and empty states, critical UI interactions, security-sensitive
paths, release-critical regressions, and payment, AI-integration and file-upload flows where
they exist.

**Do not test:** framework internals, static rendering with no logic, third-party library
behaviour, decorative UI, coverage already handled elsewhere, and unstable tests with low
confidence value.

If something is not tested, document why. An untested path with a stated reason is a
decision; one without is an oversight nobody can tell from a decision.

_________

TEST TYPES

**Unit.** Pure functions, helpers, validators, mappers, reducers, formatting and parsing,
isolated business rules, small deterministic modules. Fast, deterministic, local-first, cheap
to run constantly.

**Integration.** API routes, service boundaries, database interactions, auth plus data access,
form submission, client/server contracts, critical module cooperation. Prove the pieces work
together without paying for a browser.

**E2E.** Critical user paths, release-blocking flows, onboarding, login and signup, core
workflows, regression-prone flows, and anything unit and integration cannot be trusted to
cover. Limited, valuable and stable. Never the default validation layer for every change.

**REQUIRED — domain-scoped E2E at release.** Domain-scoped E2E is **required** at the `release/* → «TRUNK»` merge: run only the E2E of the domains whose files changed (union when several), and fall back to the **full** E2E suite when a `«SHARED_PATHS»` file or a cross-domain contract/shared fixture changes. This requires E2E specs to be **domain-mapped** — by path (`e2e/<domain>/**`) or tag (`@<domain>`). Mechanism: `RELEASE_MANAGER.md` §4.2. CI implementation: `github-actions-minutes-workflow.md`.

_________

LOCAL VS CI

Prefer local validation on `scope/*` work: lint, typecheck, unit, integration, local build,
and local E2E where it helps. It is cheaper, faster to iterate against, and does not spend
GitHub Actions minutes.

Use cloud CI mainly on `release/*` and «TRUNK»: release verification, staging validation,
deployment previews, final merge confidence, production readiness. Avoid expensive CI on an
unstable `scope/*` branch unless it is asked for.

_________

CRITICAL PATHS

Maintain a list of the repository's critical paths, each in this shape:

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


Review them before merging `scope/*` into `release/*`, before major releases, before risky
refactors, and before any auth, API or security change.

_________

AI-GENERATED CODE TESTING RULES

When code is generated or heavily modified by AI, verify the edge cases, the assumptions, the
error handling, type safety, integration boundaries, regression risk, and consistency with
existing test patterns. AI-generated code should not be trusted because it compiles. Prefer
small, meaningful tests that prove behaviour.

_________

TEST REVIEW RESPONSIBILITIES

Inspect existing coverage, find missing critical paths, compare expected behaviour against
tested behaviour, and detect duplicated, low-value, flaky or fragile tests. Identify untested
business logic, missing regression coverage, auth and API gaps, fragile E2E flows, and both
over- and under-testing. Recommend the smallest set of high-impact tests.

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
