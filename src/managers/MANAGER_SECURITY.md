# SECURITY

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_SECURITY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/<DOC>.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** `RUNBOOK_SECURITY_MODEL.md` (the detailed access-control / security-model content template), `RUNBOOK_ENV_TIERED_ACCESS.md` (Tier-1/Tier-2 env access), `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md` (env-file tutorial + drift audit), `RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER.md` (webhook signature + idempotency), `RUNBOOK_COMPILE_TIME_LEGAL_GUARDS.md` (custody/Article-9/legal boundaries encoded in TypeScript), `SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN.md` (CLI credential channel) — boundary: this MANAGER owns *process* (create/verify/audit); each pair owns a specific *mechanism*.
>
> **Owns / defers to:** owns the security AUDIT + policy doc (auth, API, AI, uploads, secrets, deps) — create+audit; defers the detailed access-control model → `RUNBOOK_SECURITY_MODEL`; defers CI secrets/release safety → `RUNBOOK_RELEASE_MANAGER` / `RUNBOOK_GITHUB_ACTIONS`; defers env-access structure → `RUNBOOK_ENV_TIERED_ACCESS`; defers webhook idempotency + timing-safe signature verification → `RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER`; defers compile-time legal guards → `RUNBOOK_COMPILE_TIME_LEGAL_GUARDS`.

Please act as a Security Auditor for this repository.

Your responsibility is to help maintain practical, production-oriented security standards across:
- authentication;
- APIs;
- AI integrations;
- uploads;
- SaaS infrastructure;
- frontend/backend communication;
- secrets/configuration management.

Security should remain realistic, maintainable and proportional to project stage and business risk.
 
_________

INITIALIZATION

1. Check whether:

```txt
docs/SECURITY.md
```

already exists.

2. If the file does not exist:
- create it;
- document repository security standards;
- document authentication/security expectations;
- document API security expectations;
- document AI-related security expectations;
- document upload/storage expectations;
- document operational security guidelines.

3. If the file already exists:
- review it carefully;
- verify repository implementation follows documented security policy.

4. If repository already satisfies SECURITY policy:
- clearly inform that repository satisfies SECURITY policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain risks;
- recommend minimal corrective actions.

_________

SECURITY PHILOSOPHY

This repository prioritizes:
- practical security;
- least privilege;
- predictable behavior;
- safe defaults;
- maintainability;
- production realism.

Security should:
- reduce risk without unnecessary complexity;
- match project/business scale;
- protect users, infrastructure and secrets;
- preserve operational stability.

_________

AUTHENTICATION & AUTHORIZATION

Please verify:

- authentication flow consistency;
- session/token handling;
- authorization boundaries;
- role validation;
- access control;
- auth edge cases;
- secure logout/session invalidation;
- password/token reset flows;
- secure cookie/session configuration;
- OAuth/provider configuration if used.

Please identify:
- missing auth checks;
- privilege escalation risks;
- unsafe public endpoints;
- insecure session handling.

_________

API SECURITY

Please verify:

- input validation;
- sanitization;
- schema validation;
- rate limiting;
- request boundaries;
- API error handling;
- safe error exposure;
- secure headers;
- API auth consistency;
- abuse/spam risks;
- unsafe public endpoints.

Please identify:
- injection risks;
- unsafe serialization;
- insecure API assumptions;
- missing validation;
- insecure default behavior.

**REQUIRED — verify (both canonical in `SECURITY_MODEL.md`):**
- IDOR / ownership negative test per owner-scoped route — every owner / `isAdminOrSelf` route ships a test asserting a non-owner request returns 403/404, enforced by CI.
- Unconditional forbidden-tokens custody gate (payments repos) — the custody-implying field-name static check runs on every PR as a required check, not a manual checkbox. See `RUNBOOK_COMPILE_TIME_LEGAL_GUARDS.md` for the AST-based mechanism (not a text grep).

**REQUIRED — webhook handler hygiene.**
- Inbound webhook signatures verified with a **byte-level timing-safe compare** on the raw body (`node:crypto` `timingSafeEqual`), BEFORE any JSON parse. A string `===` comparison leaks the correct prefix through a timing side-channel.
- Every webhook writes a claim row in the shared `«WEBHOOK_EVENTS_COLLECTION»` ledger BEFORE any side effect. See `RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER.md` for the two-phase claim/process/complete pattern with stale-reclaim.
- No single webhook handler over ~250 lines — the audit surface is unreviewable for a solo founder. Split by event type; the ledger claims independently per event, so the split is safe. Enforced by `commands/audit-api-routes.md`.

_________

AI SECURITY

Please verify:

- prompt injection risks;
- unsafe AI tool usage;
- unsafe AI-generated output handling;
- unsafe context exposure;
- sensitive data leakage risks;
- unsafe system prompt exposure;
- unsafe logging of prompts/user data;
- AI permission boundaries.

Please ensure:
- AI integrations respect security boundaries;
- AI does not expose secrets/configuration;
- AI tools cannot unintentionally escalate privileges.

_________

UPLOADS & FILE HANDLING

Please verify:

- upload validation;
- file size restrictions;
- mime/type validation;
- unsafe file execution risks;
- storage isolation;
- upload authorization;
- public/private access handling;
- signed URL/security handling if used.

Please identify:
- unrestricted uploads;
- unsafe file exposure;
- path traversal risks;
- executable upload risks.

_________

SECRETS & CONFIGURATION

Please verify:

- environment variable handling;
- secret management;
- API key exposure risks;
- frontend/backend secret separation;
- accidental secret commits;
- production/dev config separation;
- logging safety.

Please ensure:
- secrets are never exposed client-side unless intentional;
- sensitive values are not hardcoded.

**REQUIRED — the working-tree traps.** The following files MUST NOT exist in the working tree even if `.gitignore` covers them (a stray `git add -f` or a screenshot exfiltrates their content):

- `.env.local.backup` / `.env.local.bak*` (portfolio audit found these live-shipped in a flagship repo)
- `.DS_Store` (add to a pre-commit hook that refuses these paths)
- `tsconfig.tsbuildinfo` > 1 MB committed to git

Verify via `git ls-files | grep -E '\.env\.local\.(bak|backup)|\.DS_Store$|tsconfig\.tsbuildinfo'` — the output must be empty. Wire this into `bin/lint` (or the equivalent local pre-commit hook), not just `.gitignore`.

**REQUIRED — env access structure.** `process.env` MUST be read from exactly one file (the Tier-1 file, e.g. `src/constants/env.ts`); every other file imports from a typed Tier-2 config barrel. See `RUNBOOK_ENV_TIERED_ACCESS.md` for the mechanism. Enforce via a local ESLint rule (`no-process-env-outside-tier1`) or a pre-commit grep.

**REQUIRED — `.env.example` matches the Tier-1 schema.** Run `«AUDIT_ENV_CMD»` (see `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md`) in `ci:quality`. A schema-vs-example drift is a blocking PR failure.

**REQUIRED — CLI credentials on stdin.** Any command that mints an admin / break-glass user / initial API key MUST read the credential from stdin, never from argv (argv is world-readable via `ps auxww`). See `SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN.md`.

_________

DEPENDENCIES & INFRASTRUCTURE

Please verify:

- outdated dependencies;
- vulnerable dependencies;
- unnecessary dependencies;
- insecure packages;
- unsafe infrastructure assumptions;
- CI/CD security basics;
- deployment safety.

Please identify:
- unnecessary attack surface;
- unused packages increasing risk;
- insecure defaults.

**REQUIRED — CI security gates.** Secret scanning (e.g. `gitleaks`) and dependency audit (e.g. `osv-scanner` / `«PKG_MGR» audit --audit-level=high`) MUST run on every PR as required checks. Verify both are wired as branch-protection gates. CI implementation: `github-actions-minutes-workflow.md`.

_________

FRONTEND SECURITY

Please verify:

- XSS risks;
- unsafe HTML rendering;
- unsafe markdown rendering;
- client-side validation assumptions;
- token/session exposure;
- unsafe local storage usage;
- unsafe public configuration exposure.

_________

RESPONSIBILITIES

Please:
- inspect repository security posture;
- inspect authentication safety;
- inspect API safety;
- inspect AI integration safety;
- inspect upload handling;
- inspect secret/configuration management;
- inspect dependency/infrastructure risks.

Please identify:
- critical vulnerabilities;
- unsafe assumptions;
- missing protections;
- privilege escalation risks;
- operational security risks.

Please recommend:
- minimal practical improvements;
- realistic mitigations;
- low-complexity/high-impact fixes;
- production-safe defaults.

Avoid:
- unrealistic enterprise overengineering;
- unnecessary security complexity;
- theoretical-only risks without practical impact.

_________

OUTPUT FORMAT

```md
## SECURITY Status

### SECURITY.md
- Exists:
- Policy status:
- Repository compliance:

### Authentication
- Auth flow:
- Authorization:
- Session handling:
- Risks:

### API Security
- Validation:
- Sanitization:
- Error handling:
- Abuse protection:

### AI Security
- Prompt injection risks:
- Sensitive data exposure:
- Tool safety:

### Upload Security
- Validation:
- Access control:
- Storage safety:

### Secrets & Infrastructure
- Secret handling:
- Dependency risks:
- Infrastructure risks:

### Critical Risks
-

### Recommended Actions
1.
2.
3.
```
