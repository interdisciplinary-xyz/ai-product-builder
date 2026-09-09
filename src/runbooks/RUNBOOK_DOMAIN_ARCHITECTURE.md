# DOMAIN_ARCHITECTURE.md — the domain DAG, encoded and audited

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_DOMAIN_ARCHITECTURE.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the *implementation* of the domain-boundary policy declared as REQUIRED in `MANAGER_ARCHITECTURE.md` §DOMAIN BOUNDARIES. What a well-shaped `src/domains/*` looks like, how the barrel + `/server` split works, the AST-based audit script that gates cross-domain edges, the `ui` base-leaf convention, the 4-file component folder pattern, and the ratchet that prevents new cycles.
>
> Extracted from the reference implementations in `empatalk-app` (14 domains + 20 lib subsystems + `no-deep-domain-import` local ESLint rule) and `respect.click` (8 domains + `ui` base-leaf + 224-line AST-parsing audit script).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_DOMAIN_ARCHITECTURE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the barrel convention, the AST-audit shape, the `ui` base-leaf idea, the `/server` sub-entrypoint, and the ratchet mechanism are portable verbatim; only the specific domain names and paths differ per repo.
>
> **Pairs with:** `MANAGER_ARCHITECTURE.md` (the policy this runbook implements), `RUNBOOK_RELEASE_MANAGER.md` §domain-scoped E2E (which only works if this DAG is real), `commands/audit-structure.md` (invokes the audit script), `RUNBOOK_NAMING_CONVENTIONS.md` §8 (the same kebab-case rule, as a cheatsheet row). Boundary: this runbook owns the **mechanism** (files, scripts, rules) and is where the casing rule is enforced; the ARCHITECTURE MANAGER owns the **policy** (which domains exist, who owns what); NAMING_CONVENTIONS indexes the shape and defers here.
>
> **Local definitions to provide per repo:**
> - `«DOMAIN_PATHS»` — inherited from core tokens (e.g. `src/domains/<d>/**`)
> - `«BASE_LEAF»` — the domain every other domain may depend on but which depends on nothing (typically `ui`)
> - `«AUDIT_DOMAIN_SCRIPT»` — the audit binary + its `pnpm` alias (e.g. `scripts/tools/audit-domain-graph.ts` invoked as `«PKG_MGR» arch:check --strict`)
> - `«LOCAL_ESLINT_DIR»` — where the local ESLint rules live (e.g. `eslint-local-rules/`)
> - `«SERVER_SUBENTRY»` — the sub-entrypoint name for Node-only exports (typically `server`, so `@/domains/foo/server`)

**Last reviewed:** «DATE»

---

## 1. The rule (three sentences)

> **Every feature is a directory under `«DOMAIN_PATHS»`. Its public surface is one barrel file. Cross-domain imports go through the barrel; deep imports do not exist.**

Everything below is the mechanism that makes those three sentences enforceable instead of aspirational.

---

## 2. The layout

```
src/
├─ domains/
│  ├─ ui/                          ← base leaf: depends on nothing
│  │  ├─ components/
│  │  │  ├─ button/                ← 4-file component convention (§4)
│  │  │  │  ├─ button.tsx
│  │  │  │  ├─ button.constants.ts
│  │  │  │  ├─ button.spec.tsx
│  │  │  │  └─ index.ts            ← per-component barrel
│  │  │  └─ index.ts               ← re-exports Button, Input, Modal, ...
│  │  └─ index.ts                  ← the domain barrel — the ONLY public surface
│  │
│  ├─ auth/                        ← depends on: ui
│  │  ├─ components/               ← client-safe
│  │  ├─ hooks/
│  │  ├─ server/                   ← §5 — Node-only surface
│  │  │  └─ index.ts               ← the `/server` sub-entrypoint barrel
│  │  └─ index.ts                  ← the domain barrel (client-safe)
│  │
│  ├─ dashboard/                   ← depends on: ui, auth, plan
│  │  └─ ... same shape ...
│  │
│  └─ plan/                        ← depends on: ui
│     └─ ...
│
└─ lib/                            ← integration / util subsystems, each with its own barrel
   ├─ payments/index.ts
   ├─ rate-limit/index.ts
   ├─ sentry/index.ts
   └─ ...
```

Rules for the layout:

- **One barrel per domain.** `src/domains/<d>/index.ts`. This is the *only* public path other domains may import from.
- **Sub-entrypoint for Node-only code.** If the domain has server-only code (Node crypto, DB clients, secrets), it lives under `src/domains/<d>/server/` with its own barrel — see §5.
- **Every component is a folder, not a file.** See §4.
- **`src/lib/*` is for cross-cutting infrastructure only** (payments SDK wrapper, rate-limit helper, observability init). NEVER for domain business logic. Anything domain-specific goes in the domain.

---

## 3. The barrel — the ONLY public surface

```ts
// ✅ src/domains/plan/index.ts — the public surface
export { PlanCard } from './components/PlanCard';
export { usePlanEntitlement } from './hooks/usePlanEntitlement';
export { PLAN_TIERS, type PlanTier } from './constants';
// Deliberately NOT re-exported: internal utilities, private hooks, test fixtures.
```

```ts
// ✅ Consumer — imports via the barrel
import { PlanCard, usePlanEntitlement } from '@/domains/plan';

// ❌ Deep import — fails the boundary lint (§6)
import { PlanCard } from '@/domains/plan/components/PlanCard';
import { INTERNAL_HELPER } from '@/domains/plan/utils/internal';
```

The barrel is the contract. What's exported is what other domains may use; everything else is private to the domain. Change the internals freely — the barrel is the API.

**Every directory carries an `index.ts` that re-exports the directories beneath it — one level at a time.**

```ts
// ✅ src/domains/plan/components/index.ts — one line per folder beside it
export { PlanCard } from './plan-card';
export { PlanTable } from './plan-table';

// ✅ src/domains/plan/index.ts — re-exports the child directory, not a folder inside it
export * from './components';
export { PLAN_TIERS, type PlanTier } from './constants';

// ❌ the domain barrel reaching two levels down
export { PlanCard } from './components/plan-card';
```

The chain is `plan-card/index.ts` → `components/index.ts` → `plan/index.ts`. A domain barrel that reaches straight into `./components/plan-card` has to be edited every time a component moves — which is precisely the coupling the barrel exists to remove. `./server` is the one deliberate exception: it is a child directory the client-safe barrel must NOT re-export, per §5.

**Adding an export** is a decision. It expands the domain's public surface and everyone else can now depend on it. Treat every `export {...}` in `index.ts` as an ADR-adjacent change.

---

## 4. The 4-file component folder convention

Every reusable component is a directory with four files:

```
button/
├─ button.tsx           ← the component
├─ button.constants.ts  ← constants used only by Button (types, style tokens, defaults)
├─ button.spec.tsx      ← the component's tests (co-located, not in a top-level `__tests__/`)
└─ index.ts             ← re-exports Button + its public types; NOTHING ELSE
```

Rules:

- **Every directory is kebab-case** — and so is every file. `button/`, `layer-icon/`, `command-palette/`. One casing rule for the whole tree — routes, domains and component folders alike — because a tree with two rules is a tree you have to guess at, and the wrong guess resolves on macOS and 404s on Linux. Exported identifiers stay PascalCase (`export function Button`): that is a JavaScript convention, not a filesystem one. Same rule, stated as a cheatsheet row, in `RUNBOOK_NAMING_CONVENTIONS.md` §8.
- **Filename == directory name.** `button/button.tsx`, not `button/index.tsx` (the latter breaks stack traces — every frame reads `index.tsx` and you cannot tell the components apart).
- **`index.ts` is a barrel, not code.** No component logic. Just re-exports.
- **Constants live in `.constants.ts`.** If they're used outside the component, they're not "constants for this component" — hoist to the domain constants file.
- **Tests co-located, not centralised.** A `__tests__/` top-level is an anti-pattern in this convention; a Button that moves without its test rots invisibly.

Enforced by `pnpm arch:check --strict` (see §6): a `button.tsx` without a sibling `index.ts` is a violation; so is a folder whose main file does not match its name, and so is a folder that is not kebab-case.

---

## 5. The `/server` sub-entrypoint

When a domain has code that must never reach the client bundle (DB access, secrets, Node crypto, filesystem), the client-safe barrel MUST NOT re-export it. Instead, a second barrel under `<domain>/server/` carries the Node-only surface.

```
src/domains/auth/
├─ index.ts              ← client-safe: hooks, components, session-reader
├─ server/
│  ├─ index.ts           ← Node-only: password hashing, JWT signing, DB adapter
│  ├─ hashPassword.ts
│  └─ session.server.ts
├─ components/
├─ hooks/
└─ constants.ts
```

```ts
// ✅ Client component
import { useSession } from '@/domains/auth';

// ✅ Server route / API handler
import { hashPassword, verifyJWT } from '@/domains/auth/server';

// ❌ Client component trying to reach server surface — bundler leak
import { hashPassword } from '@/domains/auth/server';   // fails boundary lint
```

The rule that makes it safe:

> **A client-imported barrel must stay free of server-only code.** If `@/domains/auth` (the client barrel) re-exports anything from `./server/`, the client bundle now contains the server code — and every secret it depends on.

The `/server` sub-entrypoint is deliberately NOT re-exported from the parent barrel. It's imported by its full path (`@/domains/auth/server`) so the boundary lint can distinguish client-reachable vs server-only import sites.

---

## 6. The audit — AST-based, ratcheted, gated

Text greps for `@/domains/x` false-flag every comment and every string literal that mentions the path. The audit MUST parse the AST and only count real `import` / `export … from` / dynamic `import()` edges.

### 6.1 The `ALLOWED` map (the DAG)

Encoded as data, not prose:

```ts
// scripts/tools/audit-domain-graph.ts
export const ALLOWED: Record<string, ReadonlyArray<string>> = {
  //   domain            may import:
  ui:                    [],                              // base leaf
  auth:                  ['ui'],
  plan:                  ['ui'],
  dashboard:             ['ui', 'auth', 'plan'],
  billing:               ['ui', 'auth', 'plan'],
  onboarding:            ['ui', 'auth'],
  // ... one line per domain
};

// Domains that have server-only counterparts (deep import from another domain's
// /server surface is a SEPARATE allowlist — a client-reaching import of a
// /server surface is always a violation, per §5).
export const SERVER_DEPS_ALLOWED: Record<string, ReadonlyArray<string>> = {
  'dashboard/server': ['auth/server', 'plan/server'],
};

// Cycles that are permanently accepted (empty = zero-cycle policy).
export const ACCEPTED_CYCLES: ReadonlyArray<[string, string]> = [];
```

Add a domain → add a row. Remove a domain → remove the row and its uses. The `ALLOWED` map is the DAG, checked into git, reviewed on every change.

### 6.2 The audit itself

```ts
// scripts/tools/audit-domain-graph.ts (extract)
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const violations: string[] = [];

for (const file of project.getSourceFiles('«DOMAIN_PATHS»')) {
  const [thisDomain] = file.getFilePath().match(/domains\/([^/]+)/)!.slice(1);

  for (const decl of file.getImportDeclarations()) {
    const spec = decl.getModuleSpecifierValue();
    const m = spec.match(/^@\/domains\/([^/]+)(?:\/(.+))?$/);
    if (!m) continue;
    const [, targetDomain, subPath] = m;

    if (targetDomain === thisDomain) continue;   // same-domain imports fine

    // Cross-domain — must be either the barrel OR an allowed sub-entrypoint
    if (subPath && subPath !== 'server') {
      violations.push(`${file.getFilePath()}: deep import → @/domains/${targetDomain}/${subPath}`);
      continue;
    }

    const allowed = ALLOWED[thisDomain] ?? [];
    if (!allowed.includes(targetDomain)) {
      violations.push(`${file.getFilePath()}: cross-domain edge → ${thisDomain} → ${targetDomain} (not in ALLOWED)`);
    }
  }
}

// Cycle detection — proper DFS on the ALLOWED map (omitted for brevity;
// see `respect.click`'s `scripts/tools/audit-domain-graph.ts` for the canonical
// implementation, ~224 lines including cycle detection + component-shape check).
```

`--strict` mode fails the process on any violation. Without `--strict`, it reports counts for trending.

### 6.3 The ratchet

The library-wide invariant: **the violation count may only go down, never up.** A PR that adds a new illegal edge fails CI. A PR that removes one is welcome.

Wire the audit into `ci:quality` as a **required** check. Not a manual step, not a report-only, not a "we'll wire it later" — a required check with `--strict`.

Reference implementation: `empatalk-app`'s `docs/README.md:38` self-declared open P0 #6 (as of 2026-08-20) was *"`pnpm arch:check --strict` is not wired into `ci.yml`."* Don't repeat that.

---

## 7. The local ESLint rule (defence in depth)

`pnpm arch:check` runs in CI. But the developer sees the error only after `git push`. A local ESLint rule catches it in the editor.

```js
// «LOCAL_ESLINT_DIR»/no-deep-domain-import.cjs
module.exports = {
  meta: { type: 'problem' },
  create(ctx) {
    const fname = ctx.getFilename();
    const thisDomain = fname.match(/domains\/([^/]+)/)?.[1];
    return {
      ImportDeclaration(node) {
        const src = node.source.value;
        const m = src.match(/^@\/domains\/([^/]+)(?:\/(.+))?$/);
        if (!m) return;
        const [, targetDomain, subPath] = m;
        if (targetDomain === thisDomain) return;
        if (subPath && subPath !== 'server') {
          ctx.report({ node, message: `deep import into another domain: ${src}. Import from '@/domains/${targetDomain}' (the barrel) instead.` });
        }
      },
    };
  },
};
```

Wire it in `eslint.config.js`:

```js
rules: { 'local/no-deep-domain-import': 'error' }
```

The ESLint rule catches syntax; the AST audit catches the DAG. You need both.

---

## 8. Component-shape check

The 4-file convention is enforced by the same audit script:

```ts
// audit-domain-graph.ts (continued)
import { readdirSync, existsSync } from 'node:fs';

for (const domainDir of readdirSync('src/domains')) {
  const componentsDir = `src/domains/${domainDir}/components`;
  if (!existsSync(componentsDir)) continue;

  const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;    // a bare .tsx file is a violation
    const dir = `${componentsDir}/${entry.name}`;

    if (!KEBAB.test(entry.name)) {
      violations.push(`${dir}: folder names are kebab-case`);
    }
    // Every component folder MUST have name.tsx + index.ts (constants + spec optional but recommended)
    if (!existsSync(`${dir}/${entry.name}.tsx`)) {
      violations.push(`${dir}: missing ${entry.name}.tsx (does the file match the folder name?)`);
    }
    if (!existsSync(`${dir}/index.ts`)) {
      violations.push(`${dir}: missing index.ts (per §4 barrel convention)`);
    }
  }
}
```

---

## 9. When you need to break the rules

Sometimes you legitimately need to import a specific thing from a specific place — a shared type that hasn't earned a public export, a test fixture that lives in another domain. The pattern:

1. **Add the export to the target domain's barrel** if it's genuinely re-usable. This is the answer 90% of the time.
2. **Document the exception in `ALLOWED_DEEP` (a separate map)** if the shared thing is meta / test-scoped / a truly-one-off:

```ts
// audit-domain-graph.ts
export const ALLOWED_DEEP: ReadonlyArray<{ from: string; to: string; reason: string }> = [
  { from: 'domains/e2e/**', to: 'domains/plan/fixtures/**', reason: 'test fixtures; PLAN barrel would leak them to prod' },
  // Every entry cites a reason. Every entry is reviewed on add.
];
```

3. **If the exception grows past ~5 entries**, the DAG design is wrong — refactor a subset of the domains, don't grow the allowlist.

The exception list is small on purpose. A large allowlist is the DAG failing quietly.

---

## 10. Anti-patterns

- **Text-based grep for cross-domain imports.** A comment mentioning `@/domains/x` false-flags. Use AST.
- **`ALLOWED_DEEP` list with more than ~5 entries.** The DAG is wrong; refactor the domains.
- **A domain barrel that lists every component folder by hand.** `export { PlanCard } from './components/plan-card'` in the domain barrel means moving a component edits two files instead of one, and the `components/index.ts` that should have been the seam is dead weight. Re-export the child directory.
- **A tree with two casing rules.** Kebab routes next to PascalCase component folders means every import is a guess. Pick one — kebab, since the filesystem and most routers are case-insensitive in one place and not the other — and let the audit hold it.
- **A component as a single `.tsx` file with a top-level `__tests__/` sibling.** Co-locate the spec + the constants + the barrel. The 4-file folder is a unit that moves together.
- **Re-exporting `/server` from the parent barrel** for "convenience." One line of convenience = the client bundle contains your DB adapter.
- **`src/lib/business-thing/`** — anything domain-specific under `src/lib/` is misplaced. `src/lib/*` is infrastructure only.
- **A new domain without an `ALLOWED` map row.** The domain's edges are unaudited (empatalk-app's `src/domains/journey/` P0 #7).
- **`arch:check` in report-only mode forever.** Every "we'll wire strict next sprint" is another sprint of drift. Wire `--strict` on day one; the empty `ALLOWED` map + zero domains is a fine starting point.

---

## 11. Verification checklist

- [ ] Every feature lives under `«DOMAIN_PATHS»/<name>/` with an `index.ts` barrel.
- [ ] `«BASE_LEAF»` (typically `ui`) depends on nothing.
- [ ] Any server-only surface lives under `<domain>/server/` and is NOT re-exported from the parent barrel.
- [ ] Every directory — domain, sub-entrypoint, component folder — is kebab-case.
- [ ] Every directory has an `index.ts` re-exporting the directories beneath it, and no barrel reaches two levels down.
- [ ] Every reusable component is a 4-file folder (`name.tsx` + `name.constants.ts` + `name.spec.tsx` + `index.ts`), the file matching the folder.
- [ ] `«AUDIT_DOMAIN_SCRIPT»` exists, is AST-based, and covers: deep-import detection + `ALLOWED` map + cycle detection + component-shape check.
- [ ] `«PKG_MGR» arch:check --strict` runs in `ci:quality` as a **required** check.
- [ ] Local ESLint rule (`no-deep-domain-import`) is wired in `eslint.config.js` for editor-time feedback.
- [ ] `ALLOWED_DEEP` (exception list) has ≤ 5 entries; each cites a reason.
- [ ] `ACCEPTED_CYCLES` is empty (or every entry has an ADR).
- [ ] Every new domain added in the last quarter has a row in the `ALLOWED` map — no domain has drifted in unaudited (per empatalk-app P0 #7).

## 12. Related

- Policy this runbook implements: [`MANAGER_ARCHITECTURE.md`](./MANAGER_ARCHITECTURE.md) §DOMAIN BOUNDARIES
- Why domain-scoped E2E only works if this DAG is real: [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) §domain-scoped E2E
- The audit fires here: `commands/audit-structure.md`
- Reference implementations: `empatalk-app` (14 domains, `no-deep-domain-import` local rule), `respect.click` (8 domains, `ui` base-leaf, 224-line AST audit)
- Why every override / suppression needs a rationale comment: [[rationale-comments]] — `SKILL_RATIONALE_COMMENTS.md`
