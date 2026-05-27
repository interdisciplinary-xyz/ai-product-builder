# Project Audit — «PROJECT»

> **Date:** «AUDIT_DATE»
> **Branch:** `«AUDIT_BRANCH»`
> **Auditor:** «AUDITOR» (e.g. Automated / Claude Code)

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_AUDIT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/AUDIT.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». This is a **point-in-time findings report** skeleton: keep the section layout (Code Quality, Security, Architecture, Performance, Testing, Accessibility, SEO, CI/CD, Action Items) and the grade table, but **generate all findings against the target repo** — fill in real grades, bug counts, and `file:line` references; do not ship the placeholder examples.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — audit subject.
> - `«AUDIT_DATE»` / `«AUDIT_BRANCH»` / `«AUDITOR»` — the run's metadata.
> - `«REPO_LAYOUT»` — source paths the findings reference (e.g. `src/domains/*`, `src/lib/*`, `src/app/api/*`, `src/shared/*`); generate `file:line` refs from the target tree.
> - `«GRADE_AREAS»` — the audited dimensions and their grades (generate per repo).
> - `«STACK_TOOLS»` — toolchain assumed by findings (TypeScript strictness, ESLint, test runner, a11y checks, sitemap/robots, CI pipeline) — adjust to the repo's actual tools.
> - `«ACTION_ITEMS»` — the prioritized fix list (generate per repo).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Code Quality](#2-code-quality)
3. [Security](#3-security)
4. [Architecture & Dependencies](#4-architecture--dependencies)
5. [Performance](#5-performance)
6. [Testing](#6-testing)
7. [Accessibility](#7-accessibility)
8. [SEO](#8-seo)
9. [CI/CD](#9-cicd)
10. [Action Items](#10-action-items)

---

## 1. Executive Summary

_(One row per audited area. Assign a grade and a one-line note for each. Add/remove areas to match the repo.)_

| Area          | Grade   | Notes                          |
| ------------- | ------- | ------------------------------ |
| Code Quality  | «grade» | «one-line summary of finding»  |
| Security      | «grade» | «one-line summary of finding»  |
| Architecture  | «grade» | «one-line summary of finding»  |
| Performance   | «grade» | «one-line summary of finding»  |
| Testing       | «grade» | «one-line summary of finding»  |
| Accessibility | «grade» | «one-line summary of finding»  |
| SEO           | «grade» | «one-line summary of finding»  |
| CI/CD         | «grade» | «one-line summary of finding»  |

---

## 2. Code Quality

_(For each subsection: state the finding, severity, and back it with `file:line` references from the target repo. The subsections below are the recommended checklist — keep the ones that apply.)_

### 2.1 TypeScript Strictness

- Is `strict: true` enabled in `tsconfig.json`?
- Count `as any` type assertions across the codebase.

### 2.2 Type Assertions — «severity» («N» instances)

_(One row per instance. List the file, line, and the assertion pattern.)_

| File           | Line  | Pattern                  |
| -------------- | ----- | ------------------------ |
| `«path/file»`  | «line» | `«assertion pattern»`   |

### 2.3 Non-null Assertions — «severity» («N» instances)

_(One row per instance.)_

| File          | Line   |
| ------------- | ------ |
| `«path/file»` | «line» |

### 2.4 Console Statements in Production — «severity» («N» instances)

`console.*` calls in client/server code that should be replaced with a structured logger or error-tracking client. List the offending files grouped by client vs. server.

### 2.5 ESLint Configuration

Note the lint rules that materially protect quality (e.g. no-unused-imports, import sorting, restricted imports, sort-keys, curly). Flag anything disabled.

### 2.6 Code Duplication — «severity»

Describe repeated patterns (e.g. validation blocks, data-access blocks) and how often they recur. Recommend an extraction (e.g. a shared helper).

```ts
// «illustrative duplicated snippet»
```

**Recommendation:** «extract a shared utility».

### 2.7 TODO/FIXME/HACK Comments

Count and locate stray TODO/FIXME/HACK markers, or note NONE FOUND.

---

## 3. Security

_(Work through the checklist below. For each item state the finding + severity and cite `file:line`. Highlight any CRITICAL bug inline.)_

### 3.1 Authentication

- Auth mechanism («AUTH», e.g. Firebase Auth / NextAuth / sessions).
- Cookie flags (`httpOnly`, `sameSite`, `secure`).
- Middleware / route-level enforcement on protected routes.

**Endpoints without auth (by design):**

_(One row per intentionally-public endpoint.)_

| Endpoint          | Reason            |
| ----------------- | ----------------- |
| `«METHOD /path»`  | «why it's public» |

### 3.2 Authorization

Do authenticated write endpoints verify ownership? Show the check and list the endpoints that enforce it.

```ts
// «illustrative ownership check»
```

### 3.3 Input Validation

Are inputs validated (e.g. with a schema library)? List the schemas and the constraints they enforce.

### 3.4 Rate Limiting

Is there rate limiting on sensitive endpoints (login, write/create endpoints)? Flag any that are unprotected.

### 3.5 CORS

Document the CORS policy (whitelist, credentials handling) and any gaps (hardcoded fallbacks, endpoints missing headers).

### 3.6 «PAYMENTS» Webhook

Is webhook signature verification implemented? Check for idempotency. Flag any CRITICAL bug (e.g. missing metadata that silently breaks a flow).

### 3.7 Hardcoded Secrets — «severity»

_(One row per finding.)_

| File          | Line   | Issue                       |
| ------------- | ------ | --------------------------- |
| `«path/file»` | «line» | «secret / hardcoded value»  |

### 3.8 Security Headers

Check for `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`.

### 3.9 Password Validation

Document password requirements and flag weak policies.

### 3.10 Database Security

Are queries parameterized / free of string concatenation?

### 3.11 Error Information Leakage

Do error responses leak internals (stack traces, schema structure, raw validation messages)?

---

## 4. Architecture & Dependencies

### 4.1 Domain / Module Structure

Describe the structure (e.g. domain-driven layout) and check for cross-module relative imports, barrel exports, circular dependencies.

```
«src/...»   — «module map»
```

### 4.2 Server/Client Boundary

Are server-only utilities isolated? Is server-only code (admin SDKs, secrets) kept off the client?

### 4.3 Unused Dependencies

_(One row per unused/suspect dependency.)_

| Package    | Version   | Reason                      |
| ---------- | --------- | --------------------------- |
| `«pkg»`    | «version» | «why it's unused/suspect»   |

### 4.4 Bundle Size Concerns

_(One row per heavy dependency. Note size and how it's used; flag wasteful imports.)_

| Package | Size     | Usage                  |
| ------- | -------- | ---------------------- |
| `«pkg»` | «~N KB»  | «where/how it's used»  |

### 4.5 Configuration Issues

_(One row per config concern.)_

| Config        | Issue                  |
| ------------- | ---------------------- |
| `«configfile»`| «misconfiguration»     |

### 4.6 Environment Variables

- Is there an `.env.example` reference for required vars?
- Is there runtime validation (e.g. a schema) for env vars at startup?
- Is any sensitive data committed to the repo? (e.g. «PAYMENTS» credentials, «DB_CMS» keys, auth signing keys.)

---

## 5. Performance

### 5.1 Caching Strategy

Document rendering/caching posture (static vs. dynamic, ISR, stale-while-revalidate, API response caching). Flag everything-dynamic / `revalidate: 0` patterns.

```ts
// «illustrative caching config»
```

### 5.2 Framework Performance Optimization

Check for memoization usage and performance monitoring, as appropriate to the framework.

### 5.3 Heavy Libraries Not Lazy-Loaded

Flag heavy libraries imported eagerly that could be code-split (e.g. via dynamic import).

### 5.4 Excessive Client Components

Flag components marked client-side that are mostly server-renderable.

### 5.5 Image Optimization

Is an optimized image component used with proper dimensions and `alt` text? Flag raw image tags.

### 5.6 Media (video/audio)

Flag unoptimized media (autoplay without lazy-load, no `prefers-reduced-motion`, no poster).

---

## 6. Testing

### 6.1 Test Coverage

_(One row per test category. Fill in counts and coverage estimates.)_

| Category          | Files | Tested  | Coverage |
| ----------------- | ----- | ------- | -------- |
| «category»        | «N»   | «N»     | «~%»     |

**«N» test files** total. Note what they cover and what they miss.

### 6.2 Untested Routes / Modules

List critical paths with zero coverage (e.g. API routes, payment/webhook flows).

### 6.3 E2E Test Gaps

List the journeys covered and the critical ones missing (see [`e2e.md`](./e2e.md)).

### 6.4 Test Quality

Describe the dominant test pattern and what behavior is left untested (e.g. functional behavior, validation, error states).

---

## 7. Accessibility

### 7.1 Automated Testing

Is an a11y assertion tool wired into the test suite? Are assertions present in component specs?

### 7.2 Component Library

Does the UI library provide built-in ARIA / keyboard support?

### 7.3 Issues

_(List concrete a11y issues with `file:line`, e.g.:)_

- **«issue» — «N» instances:** «description + key locations».
- «Auto-playing media without controls / no `prefers-reduced-motion`».
- «Missing keyboard-navigation E2E tests».

---

## 8. SEO

### 8.1 Metadata

Document metadata coverage (root + per-page), multi-locale support («LOCALES»).

### 8.2 Missing

_(One row per missing SEO artifact.)_

| Item                   | Status  |
| ---------------------- | ------- |
| «sitemap.xml»          | «status»|
| «robots.txt»           | «status»|
| «JSON-LD»              | «status»|
| «canonical tags»       | «status»|
| «hreflang»             | «status»|

---

## 9. CI/CD

### 9.1 Workflows

_(One row per workflow.)_

| Workflow   | Trigger   | Status   |
| ---------- | --------- | -------- |
| «workflow» | «trigger» | «status» |

### 9.2 Missing from Pipeline

List checks not gating the pipeline (lint, typecheck, bundle-size, coverage, shared build artifacts).

### 9.3 Issues

List CI issues (disabled artifact uploads, secret-handling, caching, missing gates).

---

## 10. Action Items

_(Prioritized fix list, bucketed by urgency. One row per item; cite `file:line` for CRITICAL/HIGH where possible.)_

### CRITICAL (Fix Immediately)

| #   | Issue            | File          | Line   |
| --- | ---------------- | ------------- | ------ |
| 1   | «critical issue» | `«path/file»` | «line» |

### HIGH (This Sprint)

| #   | Issue        | Recommendation        |
| --- | ------------ | --------------------- |
| 2   | «high issue» | «how to fix»          |

### MEDIUM (Next Sprint)

| #   | Issue          | Recommendation        |
| --- | -------------- | --------------------- |
| 3   | «medium issue» | «how to fix»          |

### LOW (Backlog)

| #   | Issue       | Recommendation        |
| --- | ----------- | --------------------- |
| 4   | «low issue» | «how to fix»          |
