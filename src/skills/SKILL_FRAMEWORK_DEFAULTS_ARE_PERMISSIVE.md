# Framework defaults are permissive

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md`. **Additional install target:** `.claude/skills/framework-defaults-are-permissive/SKILL.md`.
>
> **Reusability:** template-ready — the surface enumeration, the two traps, the both-ops rule and the locks-are-free invariant are portable verbatim; **fill the `«placeholders»`** and re-derive the surface table from this repo's own `«DB_CMS»`.
>
> **Pairs with:** `RUNBOOK_SECURITY_MODEL.md` (the repo's auth tiers and IDOR guard) and `MANAGER_SECURITY.md` (the audit that runs this repo-wide) — boundary: this skill owns the **auto-generated** surface your `«DB_CMS»` exposes for free; the security model owns the **hand-written** routes.
>
> **Owns / defers to:** Owns access control on framework-generated CRUD (collections, globals, fields). Defers hand-written route auth, IDOR and webhook signing → `RUNBOOK_SECURITY_MODEL.md`; the repo-wide audit → `MANAGER_SECURITY.md`; the proof standard → `SKILL_TESTS_THAT_CANNOT_FAIL.md`.
>
> **Local definitions to provide per repo:**
> - `«DB_CMS»` — the CMS/ORM that auto-generates an API surface, **and the surfaces it generates** (fill the table below from its own docs, not from memory)
> - `«ACCESS_HELPER»` — the repo's canonical access predicates (the collection-level one, the own-document one, and — critically — the **field-level** one, which is a different type)
> - `«API_ROUTES»` — the hand-written routes, so you can tell them apart from the generated ones
> - `«INCIDENT_REF»` — how this repo cites the incident that motivated the rule

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: framework-defaults-are-permissive
description: >-
  «DB_CMS» auto-generates a public REST + GraphQL surface for every collection, global
  and field — and unspecified access does NOT default to closed. It falls through to a
  permissive built-in (typically "any authenticated principal", which on a registration-open
  collection means "any visitor, after one request"). Three separate vulnerabilities in
  this repo were this one class («INCIDENT_REF»). Use when adding or editing any «DB_CMS»
  collection, global, or field; when a field holds billing, entitlement, consent, role,
  deletion or lifecycle state; or when reviewing any diff that touches «DB_CMS» config.
  Especially fire when a diff adds a field and specifies only `update` — locking update
  alone is half a lock, and the create path is wide open. Defer to the repo's security
  model for hand-written route auth and IDOR; this skill owns the surface you did not
  write and cannot see.
---
```

---

## The damage

`«DB_CMS»` generates a **public REST + GraphQL surface for every collection, global and field you define.** You did not write it, it is not in `«API_ROUTES»`, it does not appear in your route inventory, and it is live.

**Unspecified access does not default to closed. It falls through to a permissive built-in** — typically `({ req: { user } }) => Boolean(user)`: *any authenticated principal at all*, with **no role check.** And if registration is open (it almost always is — the client creates its own account), "any authenticated principal" means **"any anonymous visitor, after a two-request warm-up."**

Three separate vulnerabilities in the same repo were this single class. («INCIDENT_REF».) This skill is the checklist that stops the fourth.

## When to use

- Adding or editing **any** `«DB_CMS»` collection, global, or field config.
- Adding a field that holds **money, entitlement, role, consent, deletion, or lifecycle** state.
- Reviewing any diff that touches `«DB_CMS»` config — including one that "only adds a field".
- Any time you find yourself reasoning *"nothing in the app writes that from the browser"* — the app is not the threat model. The generated surface is.

## Step 1 — enumerate every surface you get for free

**Do this from `«DB_CMS»`'s own documentation, not from memory, and write the answers down.** The whole failure mode is a surface you did not know existed.

| Generated surface | Ops it exposes | Default when access is unspecified |
|---|---|---|
| Collection (REST) | `create` · `read` · `update` · `delete` | «fill from the docs — usually permissive» |
| Collection (GraphQL) | queries + mutations, **same access, separate endpoint** | «same default, different door» |
| Global | `read` · `update` | «update is the one everybody forgets» |
| Field | `create` · `read` · `update` | «unspecified field-create typically permits» |
| Admin/auth endpoints | login, refresh, forgot-password, **account create** | «is registration open? then so is "authenticated"» |
| Versions / drafts / revisions | read (+ restore) | «often inherits — often not» |
| Bulk / `where`-based ops | update-many, delete-many | «a filter is not a permission» |
| File uploads / media | create, read (public URLs) | «public by default is the norm» |

If a row in that table is `«fill from …»` when you commit, **you have not done the exercise.** The answer "I assume it's closed" is exactly the assumption that produced «INCIDENT_REF».

## The two traps

### Trap 1 — the global that only declares `read`

A global config that specifies only `access.read` gets `access.update = <permissive default>` **injected for it** during config sanitisation. So *any* logged-in principal can overwrite it, and the role is never consulted. With open registration, that is anyone on the internet, two requests in.

Site-wide header, footer, feature flags, pricing table, banner copy — all globals, all writable.

```ts
// ❌ Half-specified. `update` is injected as: Boolean(user).
access: {
  read: () => true,        // public content — correct
},                         // ← and now anyone with an account rewrites your footer
```

```ts
// ✅ Every global specifies read AND update. Explicitly. Always.
access: {
  read: () => true,
  update: «ACCESS_HELPER».isAdmin,     // never omit — omission means Boolean(user)
},
```

> **Every global MUST specify `update` (and `read`) explicitly. Never rely on the default.**

### Trap 2 — the field that only locks `update`

On a **create-open collection** — and your users collection is create-open, because registration is unauthenticated — a field that specifies only `access.update` still has a **permissive `create`**. Unspecified field-`create` permits. So the value can be **seeded at account-creation time** (`POST /api/users`, with the field in the body) even though it cannot be PATCHed afterwards.

Locking `update` alone is **half a lock**, and it is the more reassuring half.

```ts
// ❌ Locked against modification. Wide open at creation.
{
  name: 'subscriptionId',
  type: 'text',
  access: {
    update: «ACCESS_HELPER».isAdminField,     // ← and create? create is a free-for-all
  },
}
```

```ts
// ✅ Both ops. Every time. On every sensitive field.
{
  name: 'subscriptionId',
  type: 'text',
  access: {
    create: «ACCESS_HELPER».isAdminField,
    update: «ACCESS_HELPER».isAdminField,
  },
}
```

> **On any create-open collection, a sensitive field MUST lock BOTH `create` and `update`.**

Sign up with `{ email, password, role: 'admin', subscriptionId: 'sub_free_forever', quotaUsed: -9999 }` in the body. If any of those stick, the field was `update`-only.

## What the naive fix still gets wrong

**1. Field-level access is a different type from collection-level access.** The collection-level predicate may return a *query constraint* (a `Where`) for non-admins — that is how own-document scoping works. The field-level predicate **must return a plain boolean.** Passing the collection-level helper into a field's `access` typically compiles, and then silently permits, because a truthy object is truthy. `«ACCESS_HELPER»` must expose a **separately-typed field-level helper**, and you must use it. This is the bug that survives the review where everyone agreed the lock was there.

**2. Never hand-roll the predicate inline.** `user?.role === 'admin'` scattered across 27 collections means the role model has 27 edit sites, and the next one will be typo'd. Use `«ACCESS_HELPER»`; a role-model change should be one diff.

**3. GraphQL is a second door on the same room — but only if the access rules are shared.** They usually are. Confirm it. And confirm bulk `where`-based operations respect field-level access, because a `update-many` that bypasses field locks is a lock that only guards single-document writes.

**4. `read` is not free either.** A field locked for `create`/`update` but readable exposes internal state (a «PAYMENTS» customer id, a lifecycle stage, an internal risk score) to anyone who can read the document. Lock `read` on anything you would not print in the UI.

## The invariant that makes locks free

> **Every legitimate writer in the app bypasses access control anyway.**

The webhook handler, the post-checkout provisioning, the quota consumer, the scheduled job's claim ([[claim-before-side-effect]]) — **all of them** go through the local/server API with an explicit **`overrideAccess: true`**. Access control governs **only the auto-generated HTTP surface.**

Therefore locking a field to the admin-only field helper **costs the app nothing** and closes a browser-reachable hole. The locks are free.

The corollary is the load-bearing part: **if you find yourself wanting to *loosen* a lock to make app code work, the app code is wrong.** It should be using `overrideAccess: true`, not asking for a weaker permission. A loosened lock to unblock a feature is how the third one of these ships.

## The proof obligation

Config without a test **regresses silently** — a future refactor drops one line from an `access:` block and nothing anywhere goes red.

Write a **tripwire**, not a re-test of the helper. One `denies(op)` assertion, three principals:

```ts
// ✅ admin permitted AND ordinary user denied AND anonymous denied — for BOTH ops.
const denies = (fn) => {
  expect(fn({ req: { user: adminUser } })).toBe(true);
  expect(fn({ req: { user: normalUser } })).toBe(false);
  expect(fn({ req: { user: undefined } })).toBe(false);      // ← the one people omit
};

for (const field of LOCKED_FIELDS) {
  denies(Users.fields[field].access.create);   // both ops
  denies(Users.fields[field].access.update);   // both ops
}

for (const global of ALL_GLOBALS) {
  expect(global.access?.update).toBeDefined(); // absence IS the vulnerability
  denies(global.access.update);
}
```

Two properties make this a real guard rather than a decorative one:

- **`toBeDefined()` on every global's `update`** — because the bug is *omission*, and an assertion that only checks the locks that exist can never catch the one that does not.
- **A new global or a new sensitive field fails CI until it is added to the list** — the list must be *exhaustive by construction* (derive it from the config, do not hand-maintain it), or the guard rots exactly as [[tests-that-cannot-fail]] describes.

Then do the thing that is not optional: **remove one lock and watch the test go red.** A green access test that has never been seen failing is the drift-tolerant assertion in its most expensive form.

## Checklist

- [ ] The surface table above is **filled in from `«DB_CMS»`'s docs** — every generated endpoint enumerated, no `«fill from …»` left.
- [ ] Every **global** specifies `read` **AND** `update` explicitly. No omissions anywhere.
- [ ] Every **field** holding billing / entitlement / role / consent / deletion / lifecycle state locks **both `create` and `update`**.
- [ ] Field-level locks use the **field-typed** helper from `«ACCESS_HELPER»` (returns a boolean), never the collection-typed one (may return a query).
- [ ] `read` is locked on any field that should not be publicly visible.
- [ ] No inline `user?.role === '…'` — the predicate lives in `«ACCESS_HELPER»`.
- [ ] The legitimate writer for each locked field uses `overrideAccess: true` (it almost certainly already does).
- [ ] A tripwire test asserts `admin ✅ / user ❌ / anon ❌` on **both ops**, plus `toBeDefined()` on every global's `update` — and has been **observed failing** with a lock removed.

## Related

- Incident / plan: «INCIDENT_REF»
- Why the app's own writers are unaffected by these locks: [[claim-before-side-effect]] — `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`
- Why the access test must be observed failing: [[tests-that-cannot-fail]] — `SKILL_TESTS_THAT_CANNOT_FAIL.md`
- Hand-written route auth, IDOR, webhook signing: `RUNBOOK_SECURITY_MODEL.md`
- The repo-wide audit that runs this: `MANAGER_SECURITY.md`
