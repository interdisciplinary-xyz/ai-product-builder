---
description: Audit API routes and their OpenAPI docs — route↔spec parity, doc completeness, stale entries, authn/authz, and cross-cutting route hygiene (rate-limit, observability tags, validation, stable errors). Meant to run every 1–2 weeks.
allowed-tools: Bash, Read, Grep, Glob, Write
---

# API Route & Docs Audit

> **🔧 Reuse & local setup**
>
> Canonical copy — vendored at `docs/ai-product-builder/commands/audit-api-routes.md` (source of truth template). To activate as a slash command: copy to `.claude/commands/audit-api-routes.md` and fill the `«placeholders»`.
>
> **Reusability:** template-ready — the shape (automated parity → doc completeness → stale entries → hygiene → auth) is generic; the greps use `«API_ROUTES»` + your repo's protection helpers.
>
> **Pairs with:** `MANAGER_SECURITY.md` (the auth / IDOR discipline this audit enforces); `MANAGER_ARCHITECTURE.md` (the route conventions).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - API surface glob + base dir — `«API_ROUTES»` (e.g. `src/app/api/**/route.ts`) + `«API_ROUTES_DIR»` (the base dir for `find`, e.g. `src/app/api`).
> - OpenAPI hand-authored spec path — `«OPENAPI_SPEC»` (or `«no-spec»` if you don't maintain one).
> - Package manager + sub-commands — `«PKG_MGR»`, `«QUALITY_CMD:audit-obs-tags»`, `«QUALITY_CMD:types»`, `«QUALITY_CMD:test-openapi-parity»`.
> - Observability stack — `«OBSERVABILITY»` + domain/route sub-tag taxonomy in `.claude/CLAUDE.md`. `«OBS_CAPTURE_PATTERN»` = the grep pattern that matches your provider's capture calls (e.g. `Sentry\.(capture|withScope)`).
> - Route-hygiene helpers (paths / names — used in `grep -qE` patterns below) — `«RATE_LIMIT_HELPER»` (e.g. `checkRateLimit|Limiter\.check`), `«VALIDATION_HELPER»` (e.g. `parseBody|safeParse|z\.`), `«AUTH_HELPER»` (e.g. `requireAuth|verifyOrgMembership`), `«STABLE_ERROR_HELPER»` (e.g. `apiError`).
> - Hygiene-check exemption filters — `«ROUTE_HYGIENE_FILTER»` (routes exempted from the rate-limit/validation/obs-capture checks, e.g. `webhook|slack/events|og/|health|cron/`), `«AUTHN_FILTER»` (routes exempted from the auth-gate check, typically a stricter subset).
> - Payments + auth stacks referenced in exception lists — `«PAYMENTS»`, `«AUTH»`, `«DB_CMS»` (for custom collection endpoints), `«EMAIL_API_SECRET_ENV»` (bearer-secret internal-send env-var name).
> - Per-invocation — `«DATE»` (report filename suffix).

Periodic health check on the API surface and its hand-authored OpenAPI docs (if you maintain one). Catches the drift that accrues as routes are added/changed: undocumented or stale docs, incomplete operation specs, and missing cross-cutting protections.

**Sources of truth:**

- **Handlers** → `«API_ROUTES»` + any custom endpoints attached to `«DB_CMS»` collections. The "API Routes" section of `.claude/CLAUDE.md` is the intended inventory.
- **Docs** → `«OPENAPI_SPEC»` (hand-authored) — skip step 2 if you don't maintain one.
- **Observability taxonomy** → the domain table in `.claude/CLAUDE.md` (routes use a `route`/`endpoint` sub-tag).
- **Route conventions** → `«STABLE_ERROR_HELPER»` (stable codes), `«RATE_LIMIT_HELPER»`, `«VALIDATION_HELPER»`.

Do **not** auto-fix. Surface findings ranked by severity, then offer to address them.

## Steps

### 1. Automated enforcers (run — these already exist in most well-scaffolded repos; the audit's job is to run + trend them)

```bash
# Route→spec parity + tag-declaration drift guard (scans REAL handlers + any custom endpoints)
«PKG_MGR» «QUALITY_CMD:test-openapi-parity»
# Every «OBSERVABILITY» capture call carries a canonical domain + sub-tag
«PKG_MGR» «QUALITY_CMD:audit-obs-tags»
# Route props / RouteContext typing
«PKG_MGR» «QUALITY_CMD:types»
```

The parity test is the hard check (real → spec: a handler with no doc entry FAILS). It does **not** check doc _completeness_ or _stale_ entries — that's steps 2–3.

### 2. Doc completeness (what the parity test doesn't cover) — skip if you don't maintain OpenAPI

The parity test only asserts a path+method entry _exists_. Scan `«OPENAPI_SPEC»` for operations that exist but are thin:

```bash
# operations (method blocks) vs how many declare responses / summary — a gap = under-documented op
grep -cE "^\s{6}(get|post|patch|put|delete):" «OPENAPI_SPEC»       # operation count
grep -cE "responses:" «OPENAPI_SPEC»                                # should be ~= operation count
grep -cE "summary:" «OPENAPI_SPEC»
```

Flag operations missing `responses`, `summary`, a `requestBody` (POST/PATCH), or the common error responses (401 on auth'd routes, 429 on rate-limited routes). Spot-check a handful rather than parsing YAML exhaustively.

### 3. Stale spec entries (reverse direction — the parity test allows these)

The parity test permits spec paths with no on-disk handler (virtual routes owned by middleware / edge-auth libraries). A documented path whose handler was _deleted_ also slips through. List spec paths, subtract discovered handlers + the known virtual set, and flag the remainder as **candidates** for a human to confirm (still-virtual vs dead doc).

### 4. Route hygiene (cross-cutting protections)

Non-webhook, non-cron routes should carry the standard protections. Report routes missing each; keep an allowlist of legitimate exceptions.

```bash
# Iterate with `while read`, NOT `for f in $(...)` — the latter word-splits the
# path list oddly in some shells and false-flags EVERY route. Pipe find→grep→while.
FILTER='«ROUTE_HYGIENE_FILTER»'   # e.g. 'webhook|slack/events|slack/commands|og/|health|cron/'
# missing rate-limit (allowlist: signature-verified webhooks, bearer-secret internal routes)
find «API_ROUTES_DIR» -name route.ts | grep -vE "$FILTER" | while read f; do
  grep -qE "«RATE_LIMIT_HELPER»" "$f" || echo "no-rate-limit: $f"
done
# body-taking routes that DON'T validate: reads a body but has no zod parse/schema
find «API_ROUTES_DIR» -name route.ts | grep -vE "$FILTER" | while read f; do
  grep -qE "await request\.json|await req\.json" "$f" && ! grep -qE "«VALIDATION_HELPER»" "$f" && echo "body-not-validated: $f"
done
# missing «OBSERVABILITY» capture (baseline: expect 0 — every route should observe failures)
find «API_ROUTES_DIR» -name route.ts | grep -vE "$FILTER" | while read f; do
  grep -qE "«OBS_CAPTURE_PATTERN»" "$f" || echo "no-obs-capture: $f"
done
```

**Known-legitimate exceptions** (do not report as findings): signature-verified webhooks (e.g. `«PAYMENTS»` webhook, email-provider webhook — they verify a signature instead of rate-limiting), internal bearer-secret routes (revalidation, internal send-mail — gated by `«EMAIL_API_SECRET_ENV»` or equivalent), read-only GETs that take no body (validation N/A). List yours here.

### 4b. Authentication & authorization

Two distinct questions — **authentication** (_who are you?_) and **authorization** (_are you allowed to touch THIS resource?_). Both must hold on any route that reads or mutates user/org data.

```bash
# AUTHN: routes with NO recognised auth gate. Match BOTH per-user and per-org gates
# — otherwise team routes false-flag.
find «API_ROUTES_DIR» -name route.ts | grep -vE "«AUTHN_FILTER»" | while read f; do
  grep -qE "«AUTH_HELPER»" "$f" || echo "no-auth-gate: $f"
done
```

**Legitimately public** (do not report): anonymous rate-limited endpoints, token-consumers where the ephemeral token IS the credential (login-token consume, deletion confirmation, unsubscribe via signed link), payment checkout routes with their own Origin-allowlist. **Bearer-secret exceptions** (authed, but not via a session): internal revalidation / internal send routes gated by an `_ENV`-named secret. Anything else lacking an auth gate is a real finding.

**AUTHZ (the harder half — mostly manual):** for every authenticated route that takes a resource id (`:userId`, `:id`, `orgId`, a slug), confirm it can't reach _another_ user's row. Established safe patterns: id derived from the session (`const { uid } = auth`), an explicit `uid !== userId → 403`, or a `where` clause scoped to the session uid (`where: { user: { equals: uid } }`). Flag any id-taking route that trusts the client's id **without** one of these — that's an IDOR. Spot-check the routes surfaced by recent changes; this is the one check a grep can't fully settle. See `MANAGER_SECURITY.md`.

### 5. Qualitative spot-check

Sample recently-changed routes (`git log --since=… --name-only -- '«API_ROUTES»'`): does each new/changed route have a matching spec entry (if you maintain one) with responses + errors, the right `«OBSERVABILITY»` `domain` + `route`/`endpoint` sub-tag (`.claude/CLAUDE.md` taxonomy), and stable `«STABLE_ERROR_HELPER»` codes? Depth = spot-check for drift trends.

## Report

Emit a status report (Parity → Doc Completeness → Stale Entries → Route Hygiene → Auth → Risks/Gaps → Recommended Actions). For each automated check: PASS/FAIL + count.

Track these headline **counts** run-over-run: parity-test undocumented routes (PASS=0), obs-tag audit unknown + drift, ops missing `responses`/`summary`, stale spec-path candidates, routes missing rate-limit, routes missing validation, routes missing auth (minus the public allowlist), suspected-IDOR routes.

1. **Write** the report to `docs/audits/api-routes-«DATE».md` (create `docs/audits/` if missing; get the date from the environment, don't hardcode).
2. **Compare** every headline count against the most recent prior `docs/audits/api-routes-*.md` (skip on first run).
3. **On regression only** (any tracked count higher, or the parity/tags test flips to FAIL): open a GitHub issue — `gh issue create` — titled `API-route audit: «N» regression(s) on «DATE»`, body listing each regressed count (was → now) + the new offenders + a link to the report. If nothing regressed, do **not** open an issue.

Keep the terminal summary to Risks/Gaps + Recommended Actions, and state plainly whether an issue was opened.

## Notes

- Report-only. If findings warrant fixes, offer a scoped branch — don't edit routes in the audit pass.
- If run on a dirty working tree, `«QUALITY_CMD:audit-obs-tags»` / `«QUALITY_CMD:types»` reflect the whole tree — note it, or run on a clean branch for attributable results.
- Sibling audits: `/audit-design-system`, `/audit-performance`. General structure/health: `/audit-structure`.
