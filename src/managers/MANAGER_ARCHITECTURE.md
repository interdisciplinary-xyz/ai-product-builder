# ARCHITECTURE

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_ARCHITECTURE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/ARCHITECTURE.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«DOMAIN_PATHS»` — where feature domains live (e.g. `src/domains/<d>/**`); used by the domain-boundary rules + CODEOWNERS.
> - `.github/CODEOWNERS` — ownership map: one owner per `«DOMAIN_PATHS»` domain + the shared layer; backs the per-domain review requirement.
>
> **Pairs with:** `RUNBOOK_DATA_MODEL_GUIDE.md` (data-model detail), `RUNBOOK_DECISION_LOG.md` (decision records), and `RUNBOOK_DOMAIN_ARCHITECTURE.md` (the mechanism — barrels, `/server` split, AST-audit script with the `ALLOWED` map, the ratchet, and the 4-file component convention). Boundary: this MANAGER owns *policy* (create/verify/audit); DOMAIN_ARCHITECTURE owns *mechanism*; DATA_MODEL_GUIDE owns *data-model content shape*.
>
> **Owns / defers to:** Owns the repository architecture map (stack, structure, boundaries, system flows) and the two structural invariants it declares REQUIRED — domain boundaries, and data ownership (a user reaches their own content and nothing else). Defers: how code is written → `MANAGER_ENGINEERING_STANDARDS`; decision records → `MANAGER_DECISION_LOG`; deployment policy → `RUNBOOK_RELEASE_MANAGER`; the access-control mechanism that makes data ownership true — permission matrix, access module, tenant isolation, IDOR negative tests → `RUNBOOK_SECURITY_MODEL`, audited by `MANAGER_SECURITY`.

Please act as an Architecture Manager for this repository.

Your responsibility is to maintain a verified, implementation-aligned source of truth for repository architecture.

This document acts as the architectural core of the repository.

Without a reliable Architecture document, AI systems and developers tend to:
- guess;
- drift;
- introduce inconsistent patterns;
- misunderstand boundaries;
- generate conflicting implementations.

Architecture documentation should reflect REAL repository structure — not theoretical intentions.
_________

INITIALIZATION

Check for `docs/ARCHITECTURE.md`. If it does not exist, create it and document the stack,
infrastructure, repository structure, conventions, boundaries, system flows and
responsibilities. If it does, verify the implementation matches it, and name stale
assumptions and undocumented decisions. Say plainly whether the repo satisfies the policy;
if it does not, give the gaps, the drift, and the smallest corrective action.

_________

PURPOSE

Architecture documentation is the repository's source of truth, implementation map, boundary
definition and memory layer. Without it, both people and AI systems guess, drift, invent
inconsistent patterns, misread boundaries and pay the onboarding cost twice. Document what the repository REALLY is, never
what it was meant to be.

_________

WHAT TO DOCUMENT AND VERIFY

Each heading below is one section of `docs/ARCHITECTURE.md`. For every one: document it,
check it against the implementation, and report where the two disagree.

**Tech stack.** Frontend, backend, framework, runtime and language choices; databases; auth
providers; infrastructure and services; deployment platforms; testing stack; build tooling;
package manager and runtime expectations. Mark deprecated technologies as deprecated.

**Repository structure.** Monorepo organisation, applications, packages and services, shared
libraries, module boundaries, folder ownership. Say why the structure exists and where a new
feature is supposed to go — an architecture doc that cannot place the next module is not
being used. Flag unclear structure, drift and duplicated shared logic.

**Frontend.** Architecture approach, component and design-system structure, state management,
routing, async data fetching, boundaries, and what counts as shared UI versus shared logic.
Prefer a reusable pattern to a one-off.

**Backend.** Structure, API architecture, service and auth boundaries, validation flow,
business-logic organisation, database access patterns, background processing. API boundaries
stay explicit.

**API conventions.** Endpoint, validation and error-response shapes; request/response and
authentication expectations; versioning if it exists. Contracts stay predictable so frontend
and backend do not drift apart.

**State.** Global approach, local philosophy, server/client separation, caching and
synchronisation. Avoid global state nothing global reads, duplicated state logic, and flows
nobody can predict.

**Auth.** Flow, authorization boundaries, session and token handling, protected routes, roles
and permissions. This one drifts silently. Check it against the code, not the intent, and
against §DATA OWNERSHIP below — authentication that works says nothing about whether one
user can read another's rows.

**Database.** Architecture, ORM or query approach, schema philosophy and evolution,
migrations, which module owns which table, indexing and performance assumptions. Confirm every
user-owned table carries the owner column §DATA OWNERSHIP requires.

**Environment and infrastructure.** Local setup, required runtimes and tools, environment
variables, deployment environments, CI/CD structure, cloud services, staging versus
production. Flag inconsistencies, undocumented setup steps and unstated assumptions.

**Conventions.** Folder, naming, shared-module, import and file-organisation conventions,
so the structure stays scalable and predictable.

**Deployment flow.** Strategy, release, staging, production, CI/CD, rollback and recovery.
Align with `docs/RELEASE_MANAGER.md` rather than restating it.

**Shared libraries and design system.** Shared-package philosophy, reusable-library
expectations, design-system boundaries, UI versus shared-logic ownership, cross-package
dependencies. Minimise duplication; keep package boundaries legible.

_________

DOMAIN BOUNDARIES (REQUIRED)

This is the **canonical** definition of how domains depend on each other. **REQUIRED:**

- A domain may import another domain ONLY via its public barrel (`@/«DOMAIN_PATHS»/<domain>/index.ts`); deep imports into another domain's internals are forbidden.
- Dependency direction: `domain → shared` is allowed; `domain → domain` and `shared → domain` are forbidden; no cycles.
- `server-only` modules must NOT be re-exported from a client-reachable barrel (a client-imported barrel must stay free of server-only code).
- Enforced by an import-boundary linter (e.g. `eslint-plugin-boundaries` or dependency-cruiser) as a **REQUIRED** CI gate (`boundaries`) — see `github-actions-minutes-workflow.md`.

This is what makes domain-scoped testing (`RELEASE_MANAGER.md` §4.2) sound: if domains only touch each other through public barrels and never cycle, the set of domains affected by a change is computable from the diff, so scoping E2E to those domains cannot miss breakage.

**Implementation** — the layout, the barrel + `/server` split, the AST-based audit script with the `ALLOWED` map + ratchet, the local ESLint rule, the 4-file component convention, and the reference implementations (`empatalk-app` 14 domains, `respect.click` 8 domains) are documented in [`DOMAIN_ARCHITECTURE.md`](./DOMAIN_ARCHITECTURE.md). Read it before writing the audit script — a text `grep` for `@/domains/x` false-flags comments and string literals.

_________

DATA OWNERSHIP (REQUIRED)

**A user reaches their own content and nothing else.** Every read, write, list, export and
search returns only what the authenticated principal owns or has been explicitly granted.
Another user's row is not merely hidden from the UI — it is unreachable, and a request for it
by id is refused.

This is architecture rather than a security checklist item because the structure is what
decides it. A rule applied route by route is a rule that holds until someone adds a route.

**REQUIRED:**

- **Ownership is in the data model.** Every user-owned record carries an owner id, set on
  create and immutable after it. Ownership is keyed on that id, never on an email or a handle,
  because those change hands and a re-registered address must not inherit a stranger's data.
- **The check lives in the data-access layer, not in each route.** Every query is scoped by
  the principal at the point the data is fetched. A route is free to forget; a repository that
  cannot express an unscoped query has nothing to forget.
- **Deny by default.** An unscoped read is a mistake that has to be written deliberately and
  is visible in review — never the thing you get by leaving something out.
- **Refuse without confirming.** A non-owner's request for an id they do not own answers the
  same way as one for an id that does not exist. A 403 where a 404 belongs tells an attacker
  which ids are real.
- **Every surface, not just the API.** Server actions, background jobs, exports, webhooks,
  cache keys, search indexes and the context assembled for an AI feature each carry the same
  scoping. Cache keys and prompt context are where this is usually lost: a key missing the
  owner id serves one user's data to the next, and a prompt built from an unscoped query
  leaks it in prose rather than in JSON.
- **Elevated access is explicit and audited.** Admin and support impersonation are named
  paths with their own authorization and an audit record — never an ambient capability that
  ordinary code can reach.

**Mechanism, not policy** — the per-collection permission matrix, the shared access module
(`«isAdminOrSelf»` and friends), tenant isolation, and the REQUIRED IDOR negative test on every
owner-scoped route are owned by [`SECURITY_MODEL.md`](./SECURITY_MODEL.md); the audit that
verifies them is `MANAGER_SECURITY`. This section states the invariant the architecture must
make true. Where the two appear to disagree, SECURITY_MODEL is the source of truth for *how*.

_________

CODEOWNERS PER DOMAIN (REQUIRED)

**REQUIRED:**

- Every `«DOMAIN_PATHS»` domain AND the shared layer is owned in `.github/CODEOWNERS`.
- Shared-path changes require an extra reviewer — the same change that forces the full-suite test fallback (`RELEASE_MANAGER.md` §4.2) also broadens review, because a shared change has the widest blast radius.
- Enforced via branch protection "require review from code owners".

_________

_________

AI-ASSISTED DEVELOPMENT RULES

Verify the architecture before implementing. Follow the repository's boundaries, reuse its
existing patterns, and do not invent speculative structure. Before a major change, inspect
what is there and align with it. Where documentation and assumption disagree, the
documentation wins. That is what it is for.

_________

ROUTING AUDIT (CHECK)

Recommended periodic check: when the repo has public routes that distinguish indexable marketing surfaces from gated app surfaces, snapshot the routing table into `docs/ARCHITECTURE.md` (or a sibling under `docs/audits/«DATE»-routing-audit.md`) so metadata, robots posture and sitemap coverage stay aligned with each route's intent. Run this:

- before any milestone that renames, adds or removes a public route segment;
- when introducing a new route group / locale / auth gate;
- when the CI guard for routing (e.g. `«QUALITY_CMD:routing»`) is first added or extended.

Legend: ✅ consistent · ⚠️ deliberate exception · ❌ needs follow-up

| Path | Public URL | Purpose | Auth | `page.metadata` | robots posture | sitemap | Status |
|------|------------|---------|------|-----------------|----------------|---------|--------|
| «route pattern» (e.g. `/[locale]`) | «public URL» (e.g. `/`, `/en`) | «marketing / app / admin» | «public / authed / owner / admin» | ✅ / inline / exempt | index / noindex / disallow | ✅ static / ✅ dynamic / ✗ | ✅ / ⚠️ / ❌ |
| «authed app shell» | «public URL» | «entry point» | authed | ✅ | noindex | ✗ | ✅ |
| «admin** » | `«ADMIN_PATH»` | CMS | admin | N/A | disallow | ✗ | ✅ |

Each row should map to one CI invariant in the routing-validation script (e.g. `scripts/validate-routing.ts`): metadata siblings present, sitemap/robots posture matches the row, production CSP unchanged. Document deliberate exceptions (⚠️) in the script's allow-list — not in prose.

_________

RESPONSIBILITIES

Inspect the repository's architecture, implementation boundaries, structural consistency,
drift and conventions. Identify what is undocumented, stale, inconsistent, duplicated,
fragmented or unowned. Recommend the smallest change that fixes it: clearer boundaries,
more consistent structure, better maintainability, fewer moving parts.

Avoid enterprise overengineering, speculative abstraction, and complexity with no business
value behind it.

_________

OUTPUT FORMAT

```md
## ARCHITECTURE Status

### ARCHITECTURE.md
- Exists:
- Policy status:
- Repository compliance:

### Tech Stack
- Frontend:
- Backend:
- Infrastructure:
- Tooling:

### Repository Structure
- Monorepo structure:
- Shared libraries:
- Boundaries:
- Architecture consistency:

### System Architecture
- Frontend architecture:
- Backend architecture:
- API conventions:
- State management:
- Auth flow:
- Database approach:

### Infrastructure & Deployment
- Environment setup:
- Deployment flow:
- CI/CD consistency:

### Risks / Drift
-

### Recommended Actions
1.
2.
3.
```
