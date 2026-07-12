# Tests that cannot fail

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_TESTS_THAT_CANNOT_FAIL` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_TESTS_THAT_CANNOT_FAIL.md`. **Additional install target:** `.claude/skills/tests-that-cannot-fail/SKILL.md`.
>
> **Reusability:** template-ready — product-neutral as written. The three antipatterns, the ❌/✅ pairs and the governing rule are portable **verbatim**; only `«TEST_CMD»` and the code idioms need swapping to this repo's runner.
>
> **Pairs with:** `RUNBOOK_E2E.md` (the coverage inventory this skill audits the *quality* of) and `RUNBOOK_QUALITY_ASSURANCE.md` (the merge gate) — boundary: those own **how much** is tested; this skill owns **whether a test can fail at all**.
>
> **Owns / defers to:** Owns the falsification standard for a regression guard. Defers *what* to test (layers, critical paths, local-vs-CI) → `MANAGER_TESTING_STRATEGY.md`; the critical-path inventory → `RUNBOOK_E2E.md`; flaky-test quarantine → `RUNBOOK_E2E.md` §Flaky-test quarantine.
>
> **Local definitions to provide per repo:**
> - `«TEST_CMD»` / `«E2E_CMD»` — the runner the examples below should be rewritten against
> - `«INCIDENT_REF»` — how this repo cites the incident that motivated a guard
> - `«EXTERNAL_PROVIDER»` — the collaborator most often mocked into a failure mode it cannot exhibit

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: tests-that-cannot-fail
description: >-
  A green test suite is not evidence. Three assertion shapes pass identically against
  the broken code and the fixed code — a regex that matches the orphaned value as well
  as the wired one, a catch driven by a mock the real collaborator can never produce,
  and a fallback proven by mocking the throw. Each shipped a real defect with CI green
  («INCIDENT_REF»). Use when writing or reviewing any regression guard, any test whose
  name contains "fallback" / "error" / "handles", any `toMatch` / `toContain` / regex
  alternation in an assertion, any `mockRejectedValue` on a collaborator, or any
  `test.skip()` inside a conditional. Especially fire when a session is about to mark a
  bug-fix PR complete because "the test passes" — that is the exact moment this is
  needed and nobody will ask for it. Defer to the repo's testing-strategy doc for what to
  test and at which layer; this skill owns whether the assertion you wrote can fail at all.
---
```

---

## The damage

A test that passes against the broken code is not a weak test. It is **not a test**. It is a line of code that renders green, permanently, in both worlds — and it converts CI from evidence into decoration.

The three shapes below all shipped real defects **with the suite green and coverage rising**. None of them were sloppy. All three were written by someone who believed they had just closed the bug.

> ## The governing rule
>
> **Before a regression guard is worth writing, run it against the pre-fix code and watch it fail.**
> **If it passes, it asserts nothing.**
>
> Not "review it." Not "reason about it." **Run it, red, against the bug** — then fix the bug and watch it go green. A guard that has never been observed failing is an unverified claim, and it is the *only* claim in the diff that nobody will ever check again.

## When to use

- Writing or reviewing any test introduced **by a bug-fix PR** — the regression-guard case.
- Any assertion containing a regex alternation, `toMatch`, `toContain`, `stringContaining`, `expect.any(...)`, or a truthiness check standing in for a value check.
- Any test that reaches an `error` / `catch` / `fallback` branch by mocking a collaborator into rejecting.
- Any `test.skip()` / `it.skip()` / early `return` **inside a conditional** in a test body.
- Reviewing a PR that argues "the test passes" as its evidence of correctness.
- Any test whose name contains `fallback`, `handles`, `gracefully`, `does not crash`, `still works`.

---

## Antipattern 1 — the drift-tolerant assertion

**An assertion that also accepts the value you are guarding against.**

The bug is a value drifting from the intended one to a wrong-but-plausible one. The assertion is written broad enough to accept both. It can now never fail — not because the code is right, but because the assertion has no opinion.

```ts
// ❌ Passes whether the page points at the real card route OR silently falls back.
// The alternation ACCEPTS the failure mode it exists to catch.
expect(ogImage).toMatch(/\/api\/card\/(featured|default)/);

// ❌ Same shape, other clothes:
expect(config.endpoint).toContain('/api/'); // matches the wrong endpoint too
expect(result.url).toBeTruthy(); // matches the fallback URL too
expect(email.to).toEqual(expect.any(String)); // matches the WRONG recipient too
```

**Real consequence.** A route that was fully built, fully deployed and covered by its own passing e2e spec was referenced by **zero** pages — for months, with CI green the entire time — because its test accepted the *fallback* route as a pass. Every layer of the pyramid was green. The feature was, in production, unreachable. («INCIDENT_REF».)

An alternation between the correct value and the value you are guarding against gives you the *appearance* of coverage and none of it.

```ts
// ✅ One exact value. This test has an opinion, and it can be wrong.
expect(ogImage).toBe(`${BASE_URL}/api/card/featured`);

// ✅ And the negative half — assert the thing you removed is GONE.
expect(ogImage).not.toContain('/default');
const res = await fetch(`${BASE_URL}/api/card/legacy`);
expect(res.status).toBe(404); // if the route is meant to be dead, assert it is dead
```

**The tell:** ask *"what would this line have printed on the day of the bug?"* If the answer is "green", delete it and write the exact value.

### The `test.skip()` sub-species

```ts
// ❌ Skips the exact branch it exists to cover. Reports as a pass, forever.
if (response.status() === 404) {
  test.skip();
}
```

A conditional skip is a drift-tolerant assertion with extra steps: on the day the route breaks, the test *stops running* and the lane goes green. **A skip inside a conditional is an unreported failure.** Assert the status; if the resource is legitimately optional, assert *that* — `expect([200, 404]).toContain(status)` is still wrong; branch the test instead.

---

## Antipattern 2 — coverage on an unreachable path

**The test mocks a collaborator into a failure mode the real collaborator cannot exhibit.**

You want to cover the route's `catch`. The real handler is hard to make throw. So you mock the handler module and force a rejection. The catch fires. Coverage lights up green — **on a path production cannot reach**, because the real handler swallows everything and never rejects at all.

```ts
// ❌ The whole collaborator module is mocked, then forced into a rejection
//    the real implementation is structurally incapable of producing.
mock('@/lib/commands', () => ({ handleLookup: mockFn }));
mockFn.mockRejectedValueOnce(new Error('boom'));

const res = await POST(request);
expect(res.status).toBe(500); // ✅ green. ❌ meaningless.
// The real handleLookup catches its own errors and resolves. This 500 is unreachable.
```

Two failures at once, and the second is the expensive one:

1. The `catch` you "covered" may be broken — nothing exercised the real path into it.
2. The *actual* production behaviour (a swallowed error, an empty success response, a silent no-op) has **no test at all**, and now looks covered.

**Coverage percentage cannot distinguish these.** It counts lines executed, not lines reachable. A mocked-in failure mode inflates the number and hides the hole.

```ts
// ✅ Real collaborator. Real throw. Stub what it ACTUALLY depends on.
mockLookupUser.mockRejectedValueOnce(new Error('«DB_CMS» unavailable'));
await expect(handleLookup({ userId: 'u1' })).rejects.toThrow('«DB_CMS» unavailable');

// ✅ And — the discovery this forces — assert what the real collaborator
//    ACTUALLY does today, which is the bug you did not know you had:
mockLookupUser.mockRejectedValueOnce(new Error('«DB_CMS» unavailable'));
const res = await POST(request);
expect(res.status).toBe(200); // ← it swallows. Document it, then decide if that is right.
```

**The rule:** mock the collaborator's **dependencies**, never the collaborator itself. The moment you mock the unit under test's neighbour *into a shape it cannot take*, the test has left the codebase and is now testing your mock.

**The tell:** ask *"can the real implementation produce the value I just mocked?"* Go read it. If the answer is no, you are asserting on fiction.

---

## Antipattern 3 — the mocked-throw fallback test

**Testing a fallback by mocking the throw, when the real engine does not throw.**

The special case of #2 that has its own name because it is *so* common: rendering engines, parsers, serialisers, image pipelines and streaming clients frequently **do not throw on bad input**. They error mid-stream, emit a broken artifact, hang, or resolve with a partial result. A `try/catch` around them is therefore dead — and the test that "proves the fallback works" is the reason nobody noticed.

```ts
// ❌ Mocks the throw. Proves the catch block's syntax, nothing else.
mockRender.mockImplementationOnce(() => {
  throw new Error('render failed');
});
const res = await GET(request);
expect(res.headers.get('x-card')).toBe('fallback'); // green against the BROKEN try/catch too
```

The `try/catch` under test could be wrapping the wrong statement, catching outside the async boundary, or sitting entirely outside the stream where the real error surfaces — and this test would still pass. It passes against the pre-fix code. **By the governing rule, it asserts nothing.**

```ts
// ✅ Drive the engine into a REAL failure with input it genuinely rejects.
//    (Here: a layout the renderer cannot satisfy — a real, reproducible reject.)
const res = await GET(requestFor({ card: 'multi-child-no-flex' }));

expect(res.status).toBe(200); // fallback served, not a raw 500
expect(res.headers.get('content-type')).toBe('image/png');
expect(await res.arrayBuffer()).not.toHaveLength(0); // a real artifact came back
expect(captureSpy).toHaveBeenCalledWith(
  expect.any(Error),
  expect.objectContaining({ tags: { domain: 'card' } }) // and it was reported
);
```

Finding the real rejecting input is the work. **It is also the whole value** — the input you find *is* the regression fixture, and half the time hunting for it is how you discover that the engine never throws at all and your entire `try/catch` was decorative.

If the engine genuinely cannot be made to fail in-process (a network partition, a provider outage), then say so **in the test name** and do not claim the branch:

```ts
// ✅ Honest. Names what is and is not proven.
it('serves the fallback when the renderer rejects [engine-level failure simulated — see «INCIDENT_REF»]', ...);
```

---

## The through-line

All three are the same error wearing three costumes:

> **The test was written to pass, and it succeeded.**

A test written to pass will always find a way. Alternate the regex. Mock the collaborator. Mock the throw. Skip the branch. The suite goes green, the coverage badge goes up, the PR merges, and the defect ships — **now protected by a test that will defend it forever.**

The only antidote is temporal, not analytical: **you must have seen the test fail, against the bug, with your own eyes.** No amount of reading it will substitute. This is why the rule is written as an action.

---

## The proof obligation

Yes — this skill has one too, and it is the same one.

**How do you know your new regression guard is not one of the three?** You do not, until you run it against the pre-fix code and watch it fail. There is no static check, no lint rule, no review heuristic that substitutes. This skill's own rule is the only test of this skill's own compliance — which is the point: **the obligation is not a section you write, it is a thing you do, once, in a terminal, before you open the PR.**

The mechanics, in order:

```bash
git stash                    # or: git revert the fix, or check out the parent commit
«TEST_CMD» path/to/new.test  # ← MUST be red. If it is green, the guard is worthless.
git stash pop
«TEST_CMD» path/to/new.test  # ← now green.
```

Then **write down that you did it** — in the PR body, one line: *"Guard confirmed red against «the pre-fix commit», green after."* That sentence is the deliverable. Without it, a reviewer has no way to distinguish a real guard from a decorative one, because **both are green by the time they look.**

For guards where stashing is impractical (a config-level fix, a deleted route), the equivalent is to **temporarily reintroduce the defect** — flip the constant back, restore the alternation, unmock the collaborator — confirm red, revert. Same obligation, same one-line receipt.

---

## Checklist

- [ ] The guard was **observed failing** against the pre-fix code, and the PR says so in one line.
- [ ] Every assertion names **one exact value**. No alternation, no `toContain`, no truthiness, where an exact value exists.
- [ ] Anything the fix **removed** is asserted **gone** (`not.toContain`, `404`, `toHaveBeenCalledTimes(0)`).
- [ ] No `test.skip()` / early `return` inside a conditional in a test body.
- [ ] No mock forces a collaborator into a failure mode **the real implementation cannot produce** — verified by reading the real implementation.
- [ ] Fallback branches are driven by **real rejecting input**, not by a mocked `throw`.
- [ ] Where a real failure genuinely cannot be produced in-process, the test **name says so** and the branch is not claimed as covered.
- [ ] Coverage is not cited as evidence for any branch reached only through a mock.

## Related

- Anatomy every skill's proof obligation follows: [[skill-template]] — `SKILL_TEMPLATE.md`
- The double-tick proof obligation in practice: [[claim-before-side-effect]] — `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`
- Why a `try/catch` is often already dead code: [[never-throws-contract]] — `SKILL_NEVER_THROWS_CONTRACT.md`
- The lock-without-a-test that regresses silently: [[framework-defaults-are-permissive]] — `SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md`
- What to test, and at which layer: `MANAGER_TESTING_STRATEGY.md` · `RUNBOOK_E2E.md`
