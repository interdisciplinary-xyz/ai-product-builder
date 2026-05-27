# Placeholder glossary & conventions

Canonical token names and fill conventions for **every template in this folder**. When
you copy a doc into a repo, replace these `«tokens»`. Define the repeated ones **once**
in the repo's `.claude/CLAUDE.md`, then each doc only needs its extra specifics.

## Conventions

- **Guillemets `«…»` wrap ONLY a token to replace.** Real example values are written
  unwrapped, as `(e.g. …)`. So: `«NODE_VERSION»` is a token; `(e.g. 22.15.1)` is an example.
- **`«SCREAMING_SNAKE»`** = a named slot with **one value per repo** → safe to global
  find-replace.
- **`«lowercase»` / `«what goes here»`** = **fill inline**; the value differs at each
  occurrence (e.g. `«metric»`, `«amount»`, `«status»`, `«finding»`). Do *not* global-replace.
- **Sub-commands use a colon:** `«QUALITY_CMD:lint»`, `«QUALITY_CMD:types»`, etc.
- **Keep literal flags outside the token:** write `«DEPLOY» logs --since 30m`, never
  `«DEPLOY logs --since 30m»`. Same for any nested token inside a command.
- A single regex `«[^»]+»` should cleanly enumerate every fill slot in a file.

## Core tokens

| Token | Meaning | Example |
|---|---|---|
| `«PROJECT»` | Product / app / brand name | Acme |
| `«DOMAIN»` | Primary domain / URL | acme.app |
| `«NODE_VERSION»` | Node version (from `.nvmrc`) | 22.15.1 |
| `«PKG_MGR»` | Package manager | pnpm / npm / yarn |
| `«QUALITY_CMD»` | Aggregate local gate | pnpm ci:quality |
| `«QUALITY_CMD:format\|lint\|types\|unit\|e2e\|build»` | Individual scripts | pnpm test:types |
| `«BUILD_CMD»` / `«TEST_CMD»` / `«E2E_CMD»` | Build / test / e2e commands | pnpm build |
| `«DB_CMS»` | Database / CMS | MongoDB + Payload |
| `«AUTH»` | Auth stack | Firebase Auth |
| `«PAYMENTS»` | Payment processor | Stripe |
| `«DEPLOY»` | Hosting / CI platform | Vercel + GitHub Actions |
| `«LOCALES»` | Supported locales | en, pl |
| `«TRUNK»` | Trunk branch | main |
| `«DATE»` | A date | 2026-05-25 |
| `«PORT»` | Dev server port (multi-brand: `«PORT_A»`/`«PORT_B»`) | 3000 |
| `«AI_PROVIDER»` | LLM provider | OpenAI |
| `«OBSERVABILITY»` | Error / telemetry | Sentry |
| `«HEALTH_ENDPOINT»` | Health route | /api/health |
| `«ADMIN_PATH»` | Admin route | /admin |
| `«DOMAIN_PATHS»` | Where feature domains live (path-based test scoping) | src/domains/<d>/** |
| `«SHARED_PATHS»` | Cross-cutting paths that force a full test/CI run when changed — a **single committed list** (e.g. `.github/shared-paths.txt`), read by CI + docs (never restated) | src/lib, packages/shared, config, lockfile, CI |
| `«API_ROUTES»` | API route file glob (for the OpenAPI / route-security parity gate) | app/api/**/route.ts |
| `«EMAIL_API_SECRET_ENV»` | Env-var name holding the secret for the internal email-send route (`x-api-secret` header) | EMAIL_API_SECRET / API_SECRET / etc. |

## Deprecated aliases — do not use

| Old | Use |
|---|---|
| `«PRODUCT_NAME»`, `«BRAND_NAME»`, `«PRODUCT»` | `«PROJECT»` |
| `«PRIMARY_DOMAIN»` | `«DOMAIN»` |
| `«PACKAGE_MANAGER»` | `«PKG_MGR»` |
| `«AGGREGATE_QUALITY_CMD»` | `«QUALITY_CMD»` |
| `«DB/CMS»` | `«DB_CMS»` |
| `«AUTH_STACK»` | `«AUTH»` |
| `«DEPLOY_PLATFORM»` | `«DEPLOY»` |
| `«YYYY-MM-DD»` | `«DATE»` |
| `«BUILD/TEST/E2E»`, `«E2E_COMMANDS»` | `«BUILD_CMD»` / `«TEST_CMD»` / `«E2E_CMD»` |
| `«22.15.1»` (literal-as-token) | `«NODE_VERSION»` |

## Init system (interactive bootstrap)

Every layer doc carries a **"Local definitions to provide per repo"** list in its
`🔧 Reuse & local setup` block. To fill these interactively instead of by hand:

```bash
/ai-init RUNBOOK_RELEASE_MANAGER
```

(or invoke `MANAGER_INIT.md` against any doc — same flow, no slash command needed).

The init tool:
- **prompts only for `«SCREAMING_SNAKE»`** persistent tokens (skips `«lowercase»` inline-fill
  and per-invocation tokens like `«DATE»` / `«X.Y.Z»`);
- **persists answers** to **`.claude/ai-init.local.json`** (committed — repo facts, not
  secrets);
- is **diff-aware on re-run** — only prompts for newly-added tokens; never deletes existing
  answers;
- offers to **render a filled `docs/<NAME>.local.md`** when asked (default: no);
- **refuses secrets** (`*_SECRET` / `*_KEY` / `*_PASSWORD` / `*_TOKEN` without `_ENV` suffix)
  and routes them to `.env.local`.

### Answer-file shape

`.claude/ai-init.local.json`:

```json
{
  "_version": 1,
  "tokens": {
    "PROJECT": "Acme",
    "DOMAIN": "acme.app",
    "NODE_VERSION": "22.15.1",
    "PKG_MGR": "pnpm",
    "QUALITY_CMD": "pnpm ci:quality",
    "DB_CMS": "MongoDB + Payload",
    "AUTH": "Firebase Auth",
    "PAYMENTS": "Stripe",
    "DEPLOY": "Vercel",
    "LOCALES": "en, pl",
    "TRUNK": "main",
    "DOMAIN_PATHS": "src/domains/[^/]+",
    "SHARED_PATHS": ".github/shared-paths.txt"
  },
  "_meta": {
    "last_init": "2026-05-26",
    "docs_rendered": []
  }
}
```

Token keys are **bare** (no `«»`). Guillemets only appear in templates.

See **`MANAGER_INIT.md`** for the full spec (token classification, special tokens,
file-backed bootstrap, anti-patterns).
