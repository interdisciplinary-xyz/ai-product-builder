# acme-app — project memory

<!--
  A FILLED example of RUNBOOK_CLAUDE_MD.md. Read them side by side.

  Real: the stack versions, the package manager, the database, the directory shape and
  the branch model — all measured from the five sibling repos running this stack.
  Illustrative: the project name, the domains, the port. No repo called acme-app exists.
-->

This is the file every Claude Code / Cursor session loads first. It is **project memory**,
not a handbook — it links out to `docs/` rather than restating it. If a section grows past
~15 lines, prune it or move the detail into the canonical doc.

## The four rules that make this file work

1. **Facts, not aspirations.** If it is not true today, it does not belong here.
2. **Link, do not restate.** Anything longer than a paragraph lives in `docs/`.
3. **One definition site.** Tokens defined here are read by every other doc.
4. **Delete on drift.** A wrong line here is worse than a missing one; the agent trusts it.

## Project overview

acme-app is a content-driven web product: a public marketing and catalogue site backed by a
Payload admin that the client edits directly. Two audiences, one deploy.

- Trunk: `main`
- Deployed on Vercel; preview per PR.

## Tech stack

| | |
|---|---|
| Runtime | Node 24.9.0 (`.nvmrc`, bare — no `v` prefix) |
| Package manager | pnpm 10.30.3 |
| Framework | Next.js 16.2 (App Router), React 19 |
| Language | TypeScript, `"type": "module"` |
| CMS + database | Payload 3.88 on MongoDB (`@payloadcms/db-mongodb`) |
| Rich text | `@payloadcms/richtext-lexical` |
| Storage | `@payloadcms/storage-vercel-blob` |
| Observability | Sentry (server + edge + client config at the repo root) |
| Tests | Vitest (unit), Playwright (e2e) |
| Local dev | Portless — `https://acme-app.local`, no ports |

## Branching

```
scope/vX.Y.Z  →  release/vX.Y.Z  →  main
```

- Work happens on `scope/vX.Y.Z`. Post-scope fixes are `fix/<slug>`; emergencies are `hotfix/<slug>`.
- PR titles are `acme-app - <branch-name>` — e.g. `acme-app - scope/v1.4.0`.
- Commits are Conventional Commits: `type(scope): description`.
- Never commit directly to `main`.

Shapes are owned by `docs/NAMING_CONVENTIONS.md` §1; the reason the flow has two stages is in
`docs/RELEASE_MANAGER.md` §1. If this section disagrees with those, they win.

## Project structure

```
src/
  app/
    (payload)/          — admin + API; the ONLY place Payload owns
    (site)/             — public routes
  payload.config.ts
  payload/collections/  — one file per collection
  domains/              — feature modules; see docs/DOMAIN_ARCHITECTURE.md
    catalogue/  pages/  enquiries/
  lib/                  — cross-cutting infrastructure ONLY, never domain logic
```

Cross-domain imports go through the barrel. Deep imports do not exist. `pnpm arch:check --strict`
fails the build on either.

## Commands

Only what runs daily. Release-time commands live in `docs/RELEASE_MANAGER.md`.

```bash
pnpm start:dev          # portless → https://acme-app.local
pnpm ci:quality         # format + lint + types + unit — must be clean before pushing
pnpm test:types         # generate:types, then tsc --noEmit
pnpm test:unit          # vitest run --passWithNoTests
pnpm generate:types     # payload-types.ts from the collections
pnpm payload            # Payload CLI
```

`generate:types` runs inside `test:types` on purpose. Skip it after a schema change and
TypeScript validates yesterday's shape while the admin breaks at runtime.

## Architecture

Three domains behind one Next app. `catalogue` and `pages` read from Payload; `enquiries` writes
to it and sends mail. Payload's local API is the only path to the database — no domain opens a
Mongo client. Detail in `docs/ARCHITECTURE.md`.

## Code style

- Server-only modules never re-export from a barrel a client component can reach.
- Comments say *why*, never *what* — see `.claude/skills/rationale-comments/`.
- TODOs never land in `main`; open an issue instead.

## Environment

One validated file, `src/lib/env.ts`. Edit the schema there, never read `process.env` directly.
Payload needs `PAYLOAD_SECRET` and `DATABASE_URI`; blob storage needs
`BLOB_READ_WRITE_TOKEN`. `.env.example` documents every one — see `docs/ENV_EXAMPLE_TEMPLATE.md`.

## Important notes

- The admin sets secure cookies. Over plain `http://localhost` you are logged out on every
  navigation — use the Portless host.
- `payload-types.ts` is generated. Never hand-edit it.
- Collections are domain content and live in `src/payload/collections/`, never `src/lib/`.
