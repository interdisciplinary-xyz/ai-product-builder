# PRIVACY_CONTRACT_TEST.md — prove the privacy claim in an integration test

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_PRIVACY_CONTRACT_TEST.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the integration-test pattern that asserts a privacy claim (intersection-only reveal, cascade delete, non-derivable inference) against a real database — not against mocks. Companion to [`GDPR_PRE_LAUNCH_CHECKLIST.md`](./GDPR_PRE_LAUNCH_CHECKLIST.md) (the policy checklist) and [`SCHEMA_FIRST_GDPR_AVOIDANCE.md`](./SCHEMA_FIRST_GDPR_AVOIDANCE.md) (avoiding the data class altogether).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PRIVACY_CONTRACT_TEST` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the three test shapes (intersection-only, cascade-delete, non-derivable) are generic; only the query shape and the seed helpers are per-repo.
>
> **Pairs with:** `RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md` (the pre-launch policy), `RUNBOOK_SCHEMA_FIRST_GDPR_AVOIDANCE.md` (the schema-level sibling), `MANAGER_TESTING_STRATEGY.md` (the layer this test sits in) — boundary: this runbook owns *proving the privacy claim*; the checklist owns *deciding which claims to make*; the schema-first runbook owns *avoiding the class of data that would need proving*.
>
> **Local definitions to provide per repo:**
> - `«INTEGRATION_TEST_DIR»` — where integration tests live (e.g. `src/__integration__/`)
> - `«DB_CMS»` — the real (test) DB the integration tests run against
> - `«TEST_DB_HARNESS»` — the fixture that spins up + tears down a real DB per test (e.g. `testcontainers`, an ephemeral MongoDB in Docker, a per-suite Postgres schema)

---

## 1. The rule

> **Every user-facing privacy claim gets a test that runs against a real database and asserts what the user sees — not what the code intends to show.**

A privacy claim is a statement like:

- "We show you only what overlaps with the other person, never our raw data."
- "When you delete your account, all your data is deleted."
- "We do not infer your religion from your listening history."

Each is easy to write on the privacy page and hard to prove without a test. The pattern is: **seed a real DB with two adversarial users, exercise the real code path, assert what surfaces.**

---

## 2. The three test shapes

### 2.1 Intersection-only reveal

The claim: when user A sees user B's overlap, they see *only* the overlap — never B's full input.

```ts
// «INTEGRATION_TEST_DIR»/discovery-intersection.integration.test.ts
import { setupTestDb, cleanupTestDb } from '@/test/harness';
import { discoveryQuery } from '@/domains/discovery/queries';

test('intersection-only reveal — A sees overlap, not B\'s full artist list', async () => {
  const db = await setupTestDb();
  try {
    // Seed two users with partial artist overlap.
    const alice = await db.seed.user({ artists: ['radiohead', 'aphex', 'burial', 'boards'] });
    const bob   = await db.seed.user({ artists: ['radiohead', 'aphex', 'kraftwerk', 'sbtrkt'] });

    // Exercise the REAL query, not a mock.
    const card = await discoveryQuery({ viewer: alice.id, subject: bob.id });

    // The overlap MUST be exactly {radiohead, aphex} — a superset would leak,
    // a subset would understate.
    expect(new Set(card.overlappingArtists)).toEqual(new Set(['radiohead', 'aphex']));

    // The response object MUST NOT contain any Bob-only artist, at any depth.
    const rendered = JSON.stringify(card);
    expect(rendered).not.toContain('kraftwerk');
    expect(rendered).not.toContain('sbtrkt');
    // Nor Alice's non-overlapping artists — the query is symmetric.
    expect(rendered).not.toContain('burial');
    expect(rendered).not.toContain('boards');

    // And the count MUST match the intersection, not either input side.
    expect(card.overlapCount).toBe(2);
    expect(card.overlapCount).not.toBe(alice.artists.length);
    expect(card.overlapCount).not.toBe(bob.artists.length);
  } finally {
    await cleanupTestDb(db);
  }
});
```

The last assertions matter more than they look. It's easy to accidentally return Bob's artist count as the response's "count" (rendering Alice a card that shows "42 artists in common" when the real overlap is 2). The stringify-and-scan check is a **coarse net** — a leak that landed in a `raw` field, a debug object, or a nested resource would slip past a happy-path assertion, but `JSON.stringify(card).not.toContain('sbtrkt')` catches it.

### 2.2 Cascade delete

The claim: when a user's account is deleted, every row that names them is gone.

```ts
// «INTEGRATION_TEST_DIR»/deletion-cascade.integration.test.ts
test('account deletion — every referencing row is gone', async () => {
  const db = await setupTestDb();
  try {
    const user = await db.seed.user({ name: 'Ephemeral' });
    await db.seed.discoveryCard({ subject: user.id, viewer: 'other-user' });
    await db.seed.consentRecord({ user: user.id, at: new Date() });
    await db.seed.auditLog({ actor: user.id, action: 'login' });

    await deleteAccount({ user: user.id });

    // Every referencing collection must be zero-count for this user.
    expect(await db.count('users', { id: user.id })).toBe(0);
    expect(await db.count('discovery-cards', { subject: user.id })).toBe(0);
    expect(await db.count('discovery-cards', { viewer: user.id })).toBe(0);
    expect(await db.count('consent-records', { user: user.id })).toBe(0);
    expect(await db.count('audit-logs', { actor: user.id })).toBe(0);

    // The full-text scan across the DB — a JSONB / MongoDB text search for the
    // user id — is the coarse net that catches a table nobody remembered.
    const anywhere = await db.rawQuery("SELECT tbl_name FROM /* everywhere the id appears */");
    expect(anywhere).toEqual([]);
  } finally {
    await cleanupTestDb(db);
  }
});
```

**The coarse net is the key part.** The named-collection assertions catch what you remember; the DB-wide scan catches what you forgot. A cascade-delete that misses one legacy audit table is a GDPR incident.

For hosted DBs (Turso, PlanetScale) where physical deletion is not immediate, this test proves the *logical* deletion is complete. State the provider's retention window in the Article 30 record; don't claim physical erasure the provider doesn't guarantee.

### 2.3 Non-derivability

The claim: the data you store cannot be used to infer the class of data you promised not to collect.

```ts
// «INTEGRATION_TEST_DIR»/non-derivable.integration.test.ts
test('listening history is not derivable to religious affiliation', () => {
  // This is a NEGATIVE test — you're asserting a boundary that no code
  // enforces. It exists to catch a future PR that ADDS an inference.
  //
  // Read every field of the exported user data and confirm no field name
  // or value matches a special-category vocabulary.
  const exported = exportUserData({ user: 'u1' });
  const forbidden = /religion|faith|denomination|prayer|worship|halal|kosher/i;

  const flat = JSON.stringify(exported);
  const matches = flat.match(forbidden);
  expect(matches, `special-category vocabulary in export: ${matches}`).toBeNull();
});
```

The non-derivability test is the softest of the three — it's a lint on the export, not on the inference itself. Its value is that it catches the PR that adds `derivedReligion` as a field, not that it proves no ML model could derive it. Pair with the schema-first pattern in `RUNBOOK_SCHEMA_FIRST_GDPR_AVOIDANCE.md`.

---

## 3. Where the tests live

- `«INTEGRATION_TEST_DIR»/*.integration.test.ts` — one per privacy claim.
- Run in the `test` lane, not `test:e2e` — they use a real DB but not a real browser.
- **Do not** move these to a slow / manual lane. The moment they stop running on every PR, the invariant they protect stops being enforced.

The DB is real. This is the load-bearing property. Mocking `db.find` and asserting the mock's return value is one of the shapes in `SKILL_TESTS_THAT_CANNOT_FAIL.md` — it proves nothing about the actual query the user's account executes.

---

## 4. Anti-patterns

- **Mocking the DB in a privacy contract test.** A mock's return value is exactly what the test writer chose; the whole point is to run the real query against seeded data.
- **Asserting only what the response *should* contain.** The response leak is what the test guards against — always add a `not.toContain` on the seed values that must NOT surface.
- **Only testing the happy path.** The intersection-only test with 100% overlap catches nothing — the two seeded users must have disjoint-plus-overlap data so both leak modes are visible.
- **Cascade delete tested only with `deleteMany` on the users table.** The test must run the app's `deleteAccount` code path, not a bare SQL delete.
- **A privacy claim in the privacy policy without a matching test file.** Every claim that can be tested with these three shapes should have a test named after it, so a compliance review can grep for the claim and find the enforcement.

---

## 5. Verification checklist

- [ ] Every explicit privacy claim in `docs/privacy.md` (or the equivalent) has a test file named after it.
- [ ] Every intersection-only test asserts both the intersection AND the absence of non-intersection seed values.
- [ ] Every cascade-delete test includes the DB-wide "anywhere the id appears" scan.
- [ ] All privacy tests run in the fast `test` lane, not manual or slow.
- [ ] Tests use `«TEST_DB_HARNESS»` (a real ephemeral DB), not a mock.
- [ ] Test failures produce a readable diff — the seed values are named (`'sbtrkt'` not `'artist-1'`) so a leak is legible in the failure message.
- [ ] `RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md` references this file under the "provable claims" section.

## 6. Related

- The policy checklist: [`GDPR_PRE_LAUNCH_CHECKLIST.md`](./GDPR_PRE_LAUNCH_CHECKLIST.md)
- Avoid the data class entirely: [`SCHEMA_FIRST_GDPR_AVOIDANCE.md`](./SCHEMA_FIRST_GDPR_AVOIDANCE.md)
- The testing strategy this sits in: [`MANAGER_TESTING_STRATEGY.md`](./MANAGER_TESTING_STRATEGY.md)
- Why a mock-driven privacy test proves nothing: `SKILL_TESTS_THAT_CANNOT_FAIL.md`

**Last reviewed:** «DATE»
