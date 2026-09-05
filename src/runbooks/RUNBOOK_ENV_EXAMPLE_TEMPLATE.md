# ENV_EXAMPLE_TEMPLATE.md — `.env.example` as onboarding tutorial

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_ENV_EXAMPLE_TEMPLATE.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the shape of `.env.example` in every repo. Not "list of variables" — a **teaching document** that explains *why* each variable is the shape it is, so a first-time contributor can fill it correctly without reading source. Companion to [`ENV_TIERED_ACCESS.md`](./ENV_TIERED_ACCESS.md) (the code-side pattern).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_ENV_EXAMPLE_TEMPLATE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the format (grouped, commented, tutorial-shaped) is generic; the specific keys are per-repo.
>
> **Pairs with:** `RUNBOOK_ENV_TIERED_ACCESS.md` (the Tier-1 schema this file documents), `MANAGER_SECURITY.md`, `MANAGER_DEV_ONBOARDING.md` — boundary: this runbook owns *how the example file reads to a human*; the ENV_TIERED_ACCESS runbook owns *how the schema is enforced in code*.
>
> **Local definitions to provide per repo:**
> - `«ENV_EXAMPLE»` — the path (nearly always `.env.example`)
> - `«ENV_TIER1_PATH»` — the Tier-1 file whose schema this example mirrors (see `RUNBOOK_ENV_TIERED_ACCESS.md`)
> - `«AUDIT_ENV_CMD»` — the script that cross-checks `.env.example` against the Tier-1 schema (e.g. `pnpm audit:env`)

---

## 1. The rule

An `.env.example` is not a list of variables. It is the **first thing a new contributor reads** when they want the app to boot, and it earns its keep only if a smart engineer who has never seen the codebase can:

- fill every value without opening a source file;
- understand *why* each value is the shape it is (secret vs public, why this token expires, what happens when it's missing);
- recognize which values are safe to commit and which are `.env.local`-only.

If any of the three fails, the file is a manifest, not a tutorial. Every landing site + product in the portfolio that has an audited `.env.example` has this problem to some degree — this runbook is the fix.

---

## 2. The format

Every `.env.example` follows the same shape:

```dotenv
# ─── «PROJECT» — environment ─────────────────────────────────────────────────
#
# Copy this file to `.env.local` (which IS gitignored) and fill the values below.
# `.env.example` (this file) IS committed — never put a real secret in it.
#
# The schema this documents is enforced by «ENV_TIER1_PATH» (see
# RUNBOOK_ENV_TIERED_ACCESS.md). If a value is missing on boot, the app fails
# to start with a readable error naming the offender.
#
# Groups below match Tier-1's schema order. Keep the two in lockstep — the
# audit script `«AUDIT_ENV_CMD»` diffs them.

# ─── App runtime ─────────────────────────────────────────────────────────────

# Which environment this instance believes itself to be. Not NODE_ENV — that
# gets inlined at build time and can't be re-read at runtime. `preview` gates
# preview-only diagnostics; `production` locks them off.
APP_ENV=development

# Absolute URL of this instance. Used for absolute link construction, OG image
# baseUrl, and email templates. Must include the protocol; no trailing slash.
NEXT_PUBLIC_SITE_URL=https://«PROJECT».local

# ─── Database ────────────────────────────────────────────────────────────────

# «DB_CMS» connection string. Include the auth query params (`?authSource=…`
# etc) here rather than in code — the driver reads them.
#
# SECURITY: this reveals the DB host + user. Rotate the password on any leak;
# the connection string alone does not grant access if the network layer is
# locked down but do NOT rely on that for the actual credential.
DATABASE_URL=mongodb://localhost:27017/«PROJECT»

# ─── Payments — «PAYMENTS» ───────────────────────────────────────────────────

# Server-only secret key. Never NEXT_PUBLIC_ this — it gives full API access.
# Development uses `«PAYMENTS_TEST_PREFIX»` prefix; production `«PAYMENTS_LIVE_PREFIX»`.
# The Tier-1 schema rejects a key that doesn't match one of the two prefixes.
«PAYMENTS»_SECRET_KEY=«PAYMENTS_TEST_PREFIX»_

# Webhook signing secret. See RUNBOOK_PAYMENTS_LIFECYCLE.md §webhooks —
# rotate this on any suspected leak; the check is `timingSafeEqual`, not
# a plain string compare.
«PAYMENTS»_WEBHOOK_SECRET=whsec_

# ─── Observability — «OBSERVABILITY» ─────────────────────────────────────────

# DSN. Optional in dev (unset = no capture). REQUIRED in production —
# the deploy pipeline gates on it.
NEXT_PUBLIC_«OBSERVABILITY»_DSN=

# ─── CMS — «CMS» ─────────────────────────────────────────────────────────────

# Server-only access token. `import 'server-only'` gates the file that reads
# this. NEVER NEXT_PUBLIC_ this one — it grants preview-content read + write.
«CMS_ACCESS_TOKEN_ENV»=

# Public bridge token — safe to inline into the client bundle. Needed by the
# visual editor to read draft content. If your CMS doesn't support two-token
# separation, delete this line and lock the CMS to server-only rendering.
«CMS_PUBLIC_TOKEN_ENV»=

# ─── Rate limits — «RATE_LIMITER» ────────────────────────────────────────────

# Upstash Redis for cross-instance rate limits. WITHOUT THESE, the limiter
# falls back to a per-process in-memory Map — safe in dev, DECEPTIVE on
# Vercel where "5 per minute" becomes "5 × instance count per minute".
# Set both together or neither.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ─── Legacy — DO NOT DELETE ──────────────────────────────────────────────────

# The following vars are unused by current code, but the removal was
# discovered to break the deploy checklist («INCIDENT_REF»). Keep them
# named so «AUDIT_ENV_CMD» knows they are intentionally documented.
# LEGACY_AUTH_SECRET=(removed 2026-04-12, kept for audit history)
```

Notes on shape:

- **Section headers** (`# ─── name ───`) match Tier-1 schema groupings.
- **Per-var comments** answer *why* the value is the shape it is — what it does, what happens when it's missing, whether it's secret.
- **Empty values** are placeholders for the operator to fill; **defaults** (`APP_ENV=development`) are the safe pre-filled value.
- **`SECURITY:` markers** call out anything with a leak surface that isn't obvious.
- **Legacy section** — never silently delete a variable name. If a var is removed from code, either delete the line and note it in the commit, or keep the line as an audit note.

---

## 3. The audit — keep it in sync

`.env.example` and the Tier-1 schema drift the moment you stop looking. A dedicated audit script keeps them tied:

```ts
// scripts/audit/env.ts — invoked as «AUDIT_ENV_CMD»
import { readFileSync } from 'node:fs';
import { z } from '«VALIDATOR»';

// Walk the source to extract the schema keys. Simplest: reuse the schema.
import { envSchema } from '@/«ENV_TIER1_PATH»';
const schemaKeys = new Set(Object.keys((envSchema as z.ZodObject<never>).shape));

const exampleKeys = new Set(
  readFileSync('.env.example', 'utf8')
    .split('\n')
    .filter((l) => /^[A-Z][A-Z0-9_]*=/.test(l))
    .map((l) => l.split('=')[0])
);

const inSchemaOnly = [...schemaKeys].filter((k) => !exampleKeys.has(k));
const inExampleOnly = [...exampleKeys].filter((k) => !schemaKeys.has(k));

if (inSchemaOnly.length || inExampleOnly.length) {
  console.error('.env.example ↔ Tier-1 schema drift');
  if (inSchemaOnly.length)  console.error('  schema has, example missing:', inSchemaOnly);
  if (inExampleOnly.length) console.error('  example has, schema missing:', inExampleOnly);
  process.exit(1);
}
console.log('.env.example matches Tier-1 schema');
```

Wire it into `ci:quality` — a schema-vs-example drift is a broken PR.

---

## 4. Anti-patterns

- **A one-liner value with no comment.** If a first-time reader has to `grep -rn KEY_NAME` to know what a variable does, the tutorial has failed.
- **Copying the production `.env` and blanking the values.** The example gets stale immediately; use a hand-curated file that the audit keeps aligned with the schema.
- **Committing a real secret "just this once for the demo."** The moment it's in `git log`, treat it as leaked and rotate. `.env.example` is committed; `.env.local` is gitignored.
- **A `.env.local.bak*` or `.env.local.backup` next to `.env.local`** in the working tree — a `git add -f` accident or a screenshot leaks it even though `.gitignore` covers it. Delete on sight; add a pre-commit hook that refuses these filenames.
- **A section named "Optional" containing everything.** Every var is required until you have a specific reason otherwise — and that reason belongs in the per-var comment, not in a section header.
- **Removing a variable silently.** Either delete + note in the commit, or keep as a documented legacy line — never silent removal.

---

## 5. Checklist

- [ ] Header block explains what this file is, that it's committed, and where the enforcement lives.
- [ ] Sections match Tier-1 schema groupings.
- [ ] Every variable has an inline comment explaining what it does.
- [ ] Every SECRET variable has a `SECURITY:` marker.
- [ ] Defaults are the safe pre-filled value; unknowns are empty placeholders.
- [ ] Legacy variables are named + dated, not deleted silently.
- [ ] `«AUDIT_ENV_CMD»` is wired into CI and passes.
- [ ] No `.env.local`, `.env.local.bak*`, `.env.local.backup` files exist in the working tree.
- [ ] A first-time reader can boot the app after 10 minutes with this file open.

## 6. Related

- The Tier-1 schema this file documents: [`ENV_TIERED_ACCESS.md`](./ENV_TIERED_ACCESS.md)
- Secrets policy: [`MANAGER_SECURITY.md`](./MANAGER_SECURITY.md)
- Onboarding flow: [`MANAGER_DEV_ONBOARDING.md`](./MANAGER_DEV_ONBOARDING.md)
- Long-lived credential rotation: [`SECRETS_ROTATION.md`](./SECRETS_ROTATION.md)

**Last reviewed:** «DATE»
