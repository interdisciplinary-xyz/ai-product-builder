# PAYLOAD_APP_TEMPLATE.md — standing up a Next + React + TypeScript + Payload repo

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_PAYLOAD_APP_TEMPLATE.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the shared shape of a `«PROJECT»` repo running Next.js App Router + React + TypeScript + Payload CMS on MongoDB — the layout, the `(payload)` route group, the tooling every sibling already carries, and the four places the existing repos disagree. Enough to create a new one that looks like the others on day one instead of on the third refactor.
>
> Extracted from the five sibling repos actually running this stack: `empatalk.app`, `onestpromo`, `przyjacieledomudziecka.pl`, `respect.click`, `youtube-manager`.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PAYLOAD_APP_TEMPLATE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the layout, the route group, the script set and the drift decisions are portable verbatim; only the project name, the collection list and the storage adapter differ per repo.
>
> **Pairs with:** `CLAUDE_MD.md` (the project memory this scaffolds), `DOMAIN_ARCHITECTURE.md` (the `src/domains` rule this layout obeys), `DEV_PORTLESS.md` (the local HTTPS host), `ENV_EXAMPLE_TEMPLATE.md` (the env file), `QUALITY_ASSURANCE.md` (the gate `ci:quality` runs). Boundary: this runbook owns **the shape of a new repo on this stack**; each of those owns its own subject and is linked, not restated.
>
> **Owns / defers to:** Owns the stack choice, the file layout, the `(payload)` route group and the four drift resolutions below. Defers *domain boundaries and barrels* → `DOMAIN_ARCHITECTURE.md`; *the branch and PR naming* → `NAMING_CONVENTIONS.md`; *what the quality gate checks* → `QUALITY_ASSURANCE.md`; *the data model itself* → `DATA_MODEL_GUIDE.md`; *observability wiring* → `OBSERVABILITY.md`.
>
> **Local definitions to provide per repo:**
> - `«PROJECT»` — inherited from core tokens; the repo's human short name
> - `«NODE_VERSION»` / `«PKG_MGR»` — inherited from core tokens
> - `«DB_CMS»` — inherited from core tokens; on this stack it is Payload + MongoDB
> - `«PAYLOAD_STORAGE»` — the storage adapter (`@payloadcms/storage-vercel-blob` or `@payloadcms/storage-s3`)
> - `«COLLECTIONS»` — one line per Payload collection this repo defines

**Last reviewed:** «DATE»

---

## 1. The rule (three sentences)

> **Payload is a library inside the Next app, not a service beside it. Its admin and API live in one `(payload)` route group; its config and collections live in one place; everything else is an ordinary `src/domains` app.**

If a new repo on this stack does not look like the five below on day one, it will not look like them ever.

---

## 2. What the siblings actually run

Measured, not aspirational:

| repo | next | payload | react | node | pnpm |
|---|---|---|---|---|---|
| `empatalk.app` | 15.5.18 | 3.84.1 | ^19.2.6 | v22.22.0 | 10.6.2 |
| `onestpromo` | ^16.2.12 | ^3.88.0 | ^19.0.0 | 24.9.0 | 10.30.3 |
| `przyjacieledomudziecka.pl` | 15.5.18 | ^3.84.1 | ^19.2.6 | 22.15.1 | 10.28.1 |
| `respect.click` | ^15.5.23 | ^3.83.0 | ^19.2.5 | 22.15.1 | 10.28.1 |
| `youtube-manager` | ^16.2.12 | ^3.88.0 | ^19.0.0 | 24.9.0 | 10.30.3 |

All five: `@payloadcms/db-mongodb`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `"type": "module"`, pnpm, husky.

**Start a new repo on the newest row** — Next 16, Payload 3.88, Node 24. The 15.x repos are not wrong; they are older, and a new repo has no reason to be born behind.

---

## 3. The layout

```
«PROJECT»/
├─ src/
│  ├─ app/
│  │  ├─ (payload)/                        ← the ONLY place Payload owns
│  │  │  ├─ admin/[[...segments]]/page.tsx
│  │  │  ├─ admin/[[...segments]]/not-found.tsx
│  │  │  ├─ api/[...slug]/route.ts
│  │  │  ├─ api/graphql/route.ts           ← only if you actually query GraphQL
│  │  │  └─ layout.tsx
│  │  └─ (site)/…                          ← your own routes, ordinary App Router
│  ├─ payload/
│  │  ├─ collections/                      ← one file per collection
│  │  └─ index.ts                          ← the barrel
│  ├─ payload.config.ts                    ← §4 decision 1
│  ├─ domains/                             ← DOMAIN_ARCHITECTURE.md applies here
│  └─ lib/                                 ← cross-cutting infrastructure only
├─ scripts/
├─ .env.example        .nvmrc         .npmrc
├─ .husky/             .lintstagedrc.json  .prettierrc.json  .prettierignore
├─ eslint.config.mjs   eslint-local-rules/
├─ commitlint.config.mjs               .versionrc.json
├─ vitest.config.ts    playwright.config.ts
├─ sentry.server.config.ts  sentry.edge.config.ts  sentry.client.config.ts
├─ next.config.mjs     postcss.config.mjs   tsconfig.json
├─ portless.json       knip.json
└─ package.json        pnpm-lock.yaml       pnpm-workspace.yaml
```

Everything above the `scripts/` line is in all five repos already. Below it, coverage is 3–4 of 5 — see §6.

---

## 4. The four places the siblings disagree

A blueprint that hides its own drift is a blueprint nobody trusts. These are real, measured, and each gets one answer.

**Decision 1 — `payload.config.ts` goes in `src/`.** Three repos put it at `src/payload.config.ts`, two at the repo root. Pick `src/`: the config imports collections from `src/`, and a root config means every import crosses the `src` boundary for no benefit. Point `tsconfig` and the Payload CLI at it explicitly.

**Decision 2 — collections go in `src/payload/collections/`.** The five repos use three different homes: `src/payload/collections` (2), `src/collections` (2), `src/lib/server/payload/collections` (1). `src/payload/` wins because it keeps config and collections adjacent, and because `src/lib/` is reserved for cross-cutting infrastructure — a collection is domain content, and `DOMAIN_ARCHITECTURE.md` §2 is explicit that domain-specific code never lands in `lib/`.

**Decision 3 — always write `(payload)/layout.tsx`.** Four of five have it; `empatalk.app` does not. It is required for the admin UI to render its own html shell; without it you inherit the site layout and the admin renders inside your header.

**Decision 4 — `.nvmrc` carries a bare version, no `v`.** Four repos write `24.9.0` / `22.15.1`; `empatalk.app` writes `v22.22.0`. Both work with nvm, only one works with `actions/setup-node`'s `node-version-file`. Bare.

---

## 5. Creating a new one

```bash
«PKG_MGR» create payload-app@latest «PROJECT» --template blank --db mongodb
cd «PROJECT»
echo "«NODE_VERSION»" > .nvmrc          # bare, per §4 decision 4
```

Then, in order:

1. **Move the Payload config to `src/payload.config.ts`** and create `src/payload/collections/`.
2. **Add `(payload)/layout.tsx`** if the template did not.
3. **Fill `.claude/CLAUDE.md`** from `CLAUDE_MD.md` — it is the file every agent session reads first, and it is where `«DB_CMS»`, `«NODE_VERSION»` and the branch model get stated once.
4. **Copy `.env.example`** per `ENV_EXAMPLE_TEMPLATE.md`. Payload needs `PAYLOAD_SECRET` and `DATABASE_URI`; add the storage adapter's variables for `«PAYLOAD_STORAGE»`.
5. **Wire the quality gate** — `ci:quality` per §6, then `QUALITY_ASSURANCE.md` for what it must contain.
6. **Set up local HTTPS** per `DEV_PORTLESS.md`. Payload's admin sets secure cookies; on plain `http://localhost` you will be logged out on every navigation.
7. **Declare the domain graph** per `DOMAIN_ARCHITECTURE.md` before the second feature, not after.

---

## 6. The script set

Five of five: `build`, `start`, `payload`, `commitlint`, `prepare`. Four of five, and worth having on day one:

```jsonc
{
  "ci:quality":      "«PKG_MGR» standard && «PKG_MGR» test:types && «PKG_MGR» test:unit",
  "standard":        "«PKG_MGR» standard:format && «PKG_MGR» standard:lint",
  "standard:fix":    "«PKG_MGR» standard:format:fix && «PKG_MGR» standard:lint:fix",
  "test:types":      "next typegen && tsc --noEmit",
  "test:unit":       "vitest run --passWithNoTests",
  "generate:types":  "payload generate:types",
  "cache:clean":     "rm -rf node_modules .next dist",
  "release":         "commit-and-tag-version"
}
```

`generate:types` is the one people forget. Payload generates `payload-types.ts` from the collections; if it is not regenerated after a schema change, TypeScript keeps validating against yesterday's shape and the error appears at runtime in the admin. Run it in `test:types`, before `tsc`.

---

## 7. Anti-patterns

- **Payload config at the repo root.** See §4 decision 1.
- **Collections under `src/lib/`.** `lib/` is cross-cutting infrastructure; a collection is domain content. `DOMAIN_ARCHITECTURE.md` §2.
- **A second route group serving Payload.** The `(payload)` group is the whole surface. Anything that reaches Payload from outside it should import the local API, not add a route.
- **`.nvmrc` with a `v` prefix.** §4 decision 4.
- **Skipping `generate:types` in CI.** The type check passes and the admin breaks.
- **Running the admin over plain HTTP locally.** Secure cookies; you will blame Payload for a browser policy.
- **A new repo starting on Next 15.** Three siblings are there because they predate 16, not because it was chosen.

---

## 8. Verification checklist

- [ ] `src/payload.config.ts` exists; no `payload.config.ts` at the repo root.
- [ ] Collections live in `src/payload/collections/`, one file each, re-exported from a barrel.
- [ ] `(payload)/admin/[[...segments]]/page.tsx`, `(payload)/api/[...slug]/route.ts` and `(payload)/layout.tsx` all present.
- [ ] `.nvmrc` holds a bare version matching `package.json` `engines` and CI.
- [ ] `«PKG_MGR» ci:quality` runs format, lint, types and unit, and `test:types` runs `generate:types` first.
- [ ] `.env.example` documents `PAYLOAD_SECRET`, `DATABASE_URI` and the `«PAYLOAD_STORAGE»` variables.
- [ ] Local dev is HTTPS per `DEV_PORTLESS.md`.
- [ ] `.claude/CLAUDE.md` is filled, including the branch model.
- [ ] The domain graph is declared before the second feature lands.

## 9. Related

- The project memory this scaffolds: [`CLAUDE_MD.md`](./CLAUDE_MD.md)
- The layout rule `src/domains` obeys: [`DOMAIN_ARCHITECTURE.md`](./DOMAIN_ARCHITECTURE.md)
- Local HTTPS, and why the admin needs it: [`DEV_PORTLESS.md`](./DEV_PORTLESS.md)
- The env file: [`ENV_EXAMPLE_TEMPLATE.md`](./ENV_EXAMPLE_TEMPLATE.md)
- What the gate must contain: [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md)
- The data model itself: [`DATA_MODEL_GUIDE.md`](./DATA_MODEL_GUIDE.md)
- Branch, PR and commit shapes: [`NAMING_CONVENTIONS.md`](./NAMING_CONVENTIONS.md)
