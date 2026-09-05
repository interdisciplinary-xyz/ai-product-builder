# ENV_TIERED_ACCESS.md — one file touches `process.env`, everyone else imports typed config

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_ENV_TIERED_ACCESS.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the structural pattern that isolates every `process.env` read into a single Tier-1 file with Zod-validated schema, and exposes a typed Tier-2 config barrel that every other file imports. Companion to [`ENV_EXAMPLE_TEMPLATE.md`](./ENV_EXAMPLE_TEMPLATE.md) (which teaches the `.env.example` shape).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_ENV_TIERED_ACCESS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the two-tier structure is generic; only the schema fields and the language of the validator are per-repo.
>
> **Pairs with:** `MANAGER_SECURITY.md` (secrets & configuration), `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md` (the `.env.example` that documents the schema), `RUNBOOK_CLAUDE_MD.md` (where the pattern is declared repo-wide) — boundary: this runbook owns the *access mechanism* (Tier-1 + Tier-2); the ENV_EXAMPLE runbook owns the *human-facing documentation* of the same schema; SECURITY owns the *secret-handling policy*.
>
> **Local definitions to provide per repo:**
> - `«ENV_TIER1_PATH»` — the sole file allowed to touch `process.env` (e.g. `src/constants/env.ts`)
> - `«CONFIG_TIER2_PATH»` — the typed config barrel (e.g. `src/config/index.ts`)
> - `«VALIDATOR»` — the runtime schema library (e.g. `zod`, `valibot`, `arktype`)
> - `«INSTRUMENTATION_ENTRYPOINT»` — where the schema is executed on process start (e.g. `src/instrumentation.ts` for Next; `main.tsx` for Vite; `server.ts` for a Node service)

---

## 1. The rule

> **Only `«ENV_TIER1_PATH»` may reference `process.env`. Everyone else imports typed values from `«CONFIG_TIER2_PATH»`.**

Two files. That's the rule.

- **Tier-1** (`«ENV_TIER1_PATH»`): calls `«VALIDATOR».parse(process.env)` **once** at process start, from `«INSTRUMENTATION_ENTRYPOINT»`. Fails fast (throws) with a readable error if any required variable is missing or malformed. Exports the parsed object with narrow types.
- **Tier-2** (`«CONFIG_TIER2_PATH»`): re-exports the Tier-1 fields plus any *derived* config (URL builders, feature-flag composites, precomputed constants). Every other file in the repo — API routes, components, tests — imports from Tier-2, never from `process.env`.

A grep for `process\.env` should return exactly one file: `«ENV_TIER1_PATH»`. Anything else is a violation.

---

## 2. Why this exists

Without the rule:

- A `NEXT_PUBLIC_` leak lands in a client bundle because someone read `process.env.INTERNAL_SECRET` in a component and the bundler thought "sure, that's a `process.env` lookup, I'll inline it."
- A missing var surfaces as `undefined` mid-request, is `??`'d away with a default that looks reasonable, and the site runs in a wrong state for a week.
- Adding a required env means grepping every `process.env.FOO` in the codebase to see if it's still optional or now required — the schema is scattered.
- Typos (`process.env.STIRPE_KEY`) fail silently.
- The `.env.example` and the actual reads drift — one has vars the other doesn't. See `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md` for the human-facing half.

With the rule, all five die on a single Tier-1 change.

---

## 3. Tier-1 — the sole reader

```ts
// «ENV_TIER1_PATH»  (e.g. src/constants/env.ts)
//
// The ONLY file in the repo that touches process.env.
// A grep for `process\.env` in any other file is a review-blocking violation
// (see the local ESLint rule `no-process-env-outside-tier1`).

import { z } from '«VALIDATOR»';

const schema = z.object({
  // Server-only — MUST be undefined on the client bundle
  DATABASE_URL:            z.string().url(),
  «PAYMENTS»_SECRET_KEY:   z.string().startsWith('«PAYMENTS_KEY_PREFIX»'),
  «OBSERVABILITY»_DSN:     z.string().url().optional(),

  // Public — safe to inline into client bundle
  NEXT_PUBLIC_SITE_URL:    z.string().url(),
  NEXT_PUBLIC_«CMS»_ID:    z.string(),

  // Environment discriminator (not NODE_ENV — that's inlined at build)
  APP_ENV:                 z.enum(['development', 'preview', 'production']),
});

// Fail loud on boot, with a formatted error the operator can act on.
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`env schema violation on boot:\n${issues}\n\nsee .env.example`);
}

export const env = Object.freeze(parsed.data);
```

Called once from `«INSTRUMENTATION_ENTRYPOINT»`:

```ts
// «INSTRUMENTATION_ENTRYPOINT»
import { env } from '«ENV_TIER1_PATH»';   // top-level import runs the parse

export function register() {
  // env is now validated; the app cannot boot in a broken-config state.
  if (env.«OBSERVABILITY»_DSN) initObservability(env.«OBSERVABILITY»_DSN);
}
```

---

## 4. Tier-2 — the typed config barrel

```ts
// «CONFIG_TIER2_PATH»  (e.g. src/config/index.ts)
//
// Everything else in the codebase imports from here.
// This file re-exports Tier-1 raw values AND exposes derived config.

import { env } from '«ENV_TIER1_PATH»';

export const config = {
  isProd:       env.APP_ENV === 'production',
  isPreview:    env.APP_ENV === 'preview',
  isDev:        env.APP_ENV === 'development',

  site: {
    url:        env.NEXT_PUBLIC_SITE_URL,
    absoluteUrl: (path: string) => new URL(path, env.NEXT_PUBLIC_SITE_URL).toString(),
  },

  db: {
    url:        env.DATABASE_URL,
  },

  payments: {
    secretKey:  env.«PAYMENTS»_SECRET_KEY,
    isLive:     env.«PAYMENTS»_SECRET_KEY.startsWith('«PAYMENTS_LIVE_PREFIX»'),
  },

  observability: {
    dsn:        env.«OBSERVABILITY»_DSN ?? null,
    enabled:    Boolean(env.«OBSERVABILITY»_DSN),
  },
} as const;
```

Every consumer:

```ts
// ✅ every other file in the repo
import { config } from '@/config';

if (config.observability.enabled) { … }
const url = config.site.absoluteUrl('/pricing');
```

**Never:**

```ts
// ❌ blocked by lint
const dsn = process.env.SENTRY_DSN;
```

---

## 5. Enforce it — the local ESLint rule

The rule is only real if the CI blocks the exception. Add a local ESLint rule (or a git pre-commit grep) that fails on any `process.env` outside `«ENV_TIER1_PATH»`.

```js
// eslint-local-rules/no-process-env-outside-tier1.cjs
module.exports = {
  meta: { type: 'problem', schema: [{ type: 'object', properties: { tier1Path: { type: 'string' } }, required: ['tier1Path'] }] },
  create(ctx) {
    const tier1 = ctx.options[0]?.tier1Path;
    if (ctx.getFilename().endsWith(tier1)) return {};
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'MemberExpression' &&
          node.object.object?.name === 'process' &&
          node.object.property?.name === 'env'
        ) {
          ctx.report({ node, message: `process.env is read outside ${tier1}; import from «CONFIG_TIER2_PATH» instead` });
        }
      },
    };
  },
};
```

`eslint.config.js`:

```js
rules: {
  'local/no-process-env-outside-tier1': ['error', { tier1Path: '«ENV_TIER1_PATH»' }],
}
```

For repos without local ESLint rules, a pre-commit grep is the fallback:

```bash
# .husky/pre-commit
FOUND=$(git diff --cached --name-only --diff-filter=ACM -- '*.ts' '*.tsx' '*.js' '*.jsx' \
  | grep -vE '^«ENV_TIER1_PATH»$' \
  | xargs -I {} grep -l 'process\.env' {} 2>/dev/null || true)
if [ -n "$FOUND" ]; then
  echo "process.env is only allowed in «ENV_TIER1_PATH». Offenders:"
  echo "$FOUND"
  exit 1
fi
```

---

## 6. Anti-patterns

- **`process.env` in a component / server-action / route handler.** Import from `«CONFIG_TIER2_PATH»`.
- **A `NEXT_PUBLIC_` prefix on a server-only value** — it will inline into the client bundle. Move to the server-only branch of the Tier-1 schema.
- **Optional-by-default schema.** Every field is required unless there's an explicit reason otherwise; the `.optional()` marks are minimal and each carries a comment naming why the value is skippable.
- **Two Tier-1 files** — one per subsystem, one shared, or one per environment. There is one Tier-1 file per process; more than one defeats the fail-fast property.
- **Reading `process.env` inside a test.** Tests import from `«CONFIG_TIER2_PATH»` too; a mock config is a separate exported object, not a `beforeEach` that pokes `process.env`.
- **Fallback to a "sensible default" in Tier-2.** Defaults belong in the Zod schema (`z.string().default('...')`), not in derived config — the schema is the contract.

---

## 7. Verification checklist

- [ ] `grep -rn 'process\.env' src/` returns exactly one file: `«ENV_TIER1_PATH»`.
- [ ] `«ENV_TIER1_PATH»` is imported at the top of `«INSTRUMENTATION_ENTRYPOINT»` so the schema executes on boot.
- [ ] A boot with a missing required env fails with a readable error naming the missing key.
- [ ] The local ESLint rule (or pre-commit grep) is wired into CI, not just documented.
- [ ] `.env.example` matches the Tier-1 schema — every schema key is documented in the example file (per `RUNBOOK_ENV_EXAMPLE_TEMPLATE.md`).
- [ ] `«CONFIG_TIER2_PATH»` never reads `process.env` — it only re-exports and derives from Tier-1.
- [ ] No `NEXT_PUBLIC_` prefix on a secret; no server-only value without a `NEXT_PUBLIC_` prefix on a public one.

## 8. Related

- Human-facing `.env.example` shape: [`ENV_EXAMPLE_TEMPLATE.md`](./ENV_EXAMPLE_TEMPLATE.md)
- Repo-wide policy: [`MANAGER_SECURITY.md`](./MANAGER_SECURITY.md) (secrets & configuration)
- Where the two-tier pattern is declared in `.claude/CLAUDE.md`: [`CLAUDE_MD.md`](./CLAUDE_MD.md)
- Long-lived credential rotation: [`SECRETS_ROTATION.md`](./SECRETS_ROTATION.md)
- One-shot credentials on the CLI: `SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN.md`

**Last reviewed:** «DATE»
