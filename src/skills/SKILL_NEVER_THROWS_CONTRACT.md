# The never-throws contract

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_NEVER_THROWS_CONTRACT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_NEVER_THROWS_CONTRACT.md`. **Additional install target:** `.claude/skills/never-throws-contract/SKILL.md`.
>
> **Reusability:** template-ready — the contract, the 2 legal shapes, the 3 illegal shapes and the linter argument are portable verbatim; **fill the `«placeholders»`** with this repo's actual never-throwing client and its fire-and-forget wrapper.
>
> **Pairs with:** `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md` (whose release-on-failure branch is only reachable if you read the result correctly) and `RUNBOOK_OBSERVABILITY.md` — boundary: this skill owns the **call shape**; the claim skill owns the **write order**.
>
> **Owns / defers to:** Owns call-site discipline for any client that resolves a failure instead of throwing it. Defers error taxonomy and capture levels → `RUNBOOK_OBSERVABILITY.md`; the lint-lane cost of enabling type-aware rules → `RUNBOOK_QUALITY_ASSURANCE.md`; the proof standard → `SKILL_TESTS_THAT_CANNOT_FAIL.md`.
>
> **Local definitions to provide per repo:**
> - `«CLIENT_FN»` — the never-throwing client and its wrappers (**name them all**; the contract is invisible at the call site otherwise)
> - `«VOID_HELPER»` — the repo's attributed fire-and-forget wrapper. If it does not exist yet, **writing it is the first task this skill hands you.**
> - `«OBSERVABILITY»` — where a swallowed failure is captured, and by whom (the client, or the caller — **exactly one of them**)
> - `«INCIDENT_REF»` — how this repo cites the incident that motivated the rule

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: never-throws-contract
description: >-
  «CLIENT_FN» NEVER throws — it resolves `{ success: false, error }`, including from its
  own outer catch. So a try/catch around it is dead code that cannot fire, and a bare
  `await «CLIENT_FN»(...)` compiles, typechecks, looks handled, and silently drops every
  failure on the floor («INCIDENT_REF»). Use when adding, moving or reviewing any
  «CLIENT_FN» call site; any try/catch wrapped around a client call; any promise-returning
  side effect that is neither awaited-and-branched nor «VOID_HELPER»'d. Especially fire
  when a diff adds a call site by copying the one above it — that is how all of them got
  this way. Defer to `claim-before-side-effect` for the ORDER of the write and the call;
  this skill owns what you do with the result.
---
```

---

## The damage

**`«CLIENT_FN»` never throws.** It resolves `{ success: false, error }` — including from inside its own outer `catch`. That single design choice, which is a good one, produces two consequences that catch **everyone**, every time, forever:

1. **A `try/catch` around it is dead code.** It cannot fire on a failure. Code that *looks* defensive is not defensive — it is decorative, and it is the most confident-looking thing in the file.
2. **A bare `await «CLIENT_FN»(...)` discards the result.** It compiles. It typechecks. It reads as handled. It silently drops **every** provider outage on the floor, and returns `200 OK` to the user while doing so.

At «INCIDENT_REF» the call sites split four ways — correct-via-«VOID_HELPER», correct-via-await-and-check, await-and-drop, and floating — and **nothing in the type system or the linter distinguished them.** They all looked the same in review. They still do.

## When to use

- Adding, moving, or copy-pasting any `«CLIENT_FN»` call site.
- Reviewing any `try { await «CLIENT_FN»(…) } catch { … }`.
- Any promise-returning side effect that is neither `await`ed-and-branched nor passed to `«VOID_HELPER»`.
- Any function that returns `{ success: boolean }`, `Result<T, E>`, `[err, val]`, or an `ok` flag — **the contract is the shape, not the domain.** If it resolves failures, this skill applies.
- Reviewing a handler that returns `{ ok: true }` immediately after an un-inspected side effect.

## The two legal call shapes

There are exactly two. Choose by asking one question:

> **Does the user notice — or does the law care — if this never happens?**

### 1. Load-bearing → `await` and branch

The caller must be able to tell the user, roll back what it already committed, or return a retryable error.

```ts
// ✅ A deletion-confirmation link: no delivery means no link means no deletion.
//    A statutory obligation is now hanging on this call's return value.
const result = await «CLIENT_FN»({ to, confirmLink });

if (!result.success) {
  await db.delete({ collection: 'deletion-tokens', id: token.id });   // ← roll back what you committed
  return apiError('send-failed', 502, { error: 'Could not send confirmation' });
}

return json({ ok: true });
```

**The rollback is the part people skip.** If you wrote a row, minted a token, decremented a quota, or claimed a marker *before* the call, the failure branch owes you a compensating write. Otherwise the failure branch leaves the system in a state the happy path never produces — and nothing tests it.

Anything touching **compliance, billing, or a token the user must click** is in this class. If you are unsure, it is in this class.

### 2. Best-effort → `«VOID_HELPER»`

A nudge, a notification, a courtesy. **Losing the side effect is acceptable; losing *knowledge* of it is not.**

```ts
// ✅ Fire-and-forget — but the failure is attributed, and the rejection is contained.
«VOID_HELPER»(
  «CLIENT_FN»({ to: user.email, name: safeDisplayName(user) }),
  { template: 'invite-accepted', extra: { userId } }
);
```

`«VOID_HELPER»` earns its existence three ways: it handles the not-configured case, it **defers capture to whoever already captures** (so the failure is reported exactly once, not twice), and — decisively — it makes the fire-and-forget **intentional and greppable.** `grep «VOID_HELPER»` enumerates every place the codebase has consciously agreed to lose a side effect. A bare floating call enumerates nothing.

If `«VOID_HELPER»` does not exist in this repo, **write it before the second best-effort call site**, not after the incident.

## The three illegal call shapes

```ts
// ❌ 1. await + drop. The most common by far. Reads as handled. Isn't.
await «CLIENT_FN»({ … });
return json({ ok: true });          // ok:true on top of a failed side effect

// ❌ 2. Floating. No await, no void, no wrapper.
//       An unhandled rejection waiting to happen — and the call site the next person copies.
«CLIENT_FN»({ … });

// ❌ 3. Floating with a .catch() that can NEVER fire, because «CLIENT_FN» never rejects.
//       Maximum reassurance, zero effect.
«CLIENT_FN»({ … }).catch(() => {});
```

And the dead defensive wrapper, which deserves its own headstone:

```ts
// ❌ This catch is unreachable on a failure. It is not a safety net; it is a drawing of one.
try {
  await «CLIENT_FN»({ … });
} catch (err) {
  «OBSERVABILITY».capture(err);     // never runs
}
```

`await + drop` is the one to hunt in review. Shapes 2 and 3 at least *look* odd. Shape 1 looks like every correct line of async code you have ever written — the only difference is invisible, and it lives in another file.

## What the naive fix still gets wrong

**1. Handling `success: false` is not the same as *reporting* it.** Decide, once, per repo: does `«CLIENT_FN»` capture its own failures, or does the caller? If **both** do, every outage is double-reported and your alert thresholds are wrong by 2×. If **neither** does, the branch is handled and invisible. Pick one — the client is usually the right owner — and make `«VOID_HELPER»` defer to it.

**2. A compiling wrapper is not a correct wrapper.** The params that get silently dropped are the ones with a sane-looking default: the recipient's identifier (without it, no unsubscribe link is emitted and the delivery log has a blank owner — a **compliance** defect, not a cosmetic one) and the locale (without it, everything renders in the default language, and it must be the **recipient's** locale — the classic bug is taking the *requester's* locale off the query string and mailing it to the *owner*: right words, wrong language).

**3. The type system can express this, and yours currently doesn't.** `Promise<{ success: boolean }>` is a return type that can be legally ignored. Making the result a **branded type the caller must consume** (or having `«CLIENT_FN»` accept an explicit `{ mode: 'await' | 'void' }`) turns a review-time rule into a compile-time one. That is a real refactor with a real cost — but the rule below is what you are choosing to live with if you skip it.

## Why the linter can't catch this

A floating-promise rule (`no-floating-promises` and its cousins) catches illegal shapes **2 and 3**. It does not catch shape **1** — the common one — because `await`ing a promise and ignoring its resolved value is **not a floating promise**. It is idiomatic, correct-by-the-rules async code. The rule has nothing to complain about.

And even that partial win is not a flag flip: the rule is **type-aware**, so enabling it means wiring full type information into the lint lane and paying a typecheck's runtime on every lint run. Worth doing. Not free. Budget it, do not assume it.

Meanwhile there is **no lint rule at all** for "you awaited a `{ success: boolean }` and never read `success`" — because in every other context, discarding a return value is legal. Which is precisely why this is a **review-time rule that must be written down**, and precisely why it is a skill: the linter cannot ambush the diff, so something else has to.

## The proof obligation

A call site is not proven by a green test — the illegal shapes are all *green*. Prove it by **making the client resolve a failure and asserting the caller noticed:**

```ts
// The client resolves failure — it does NOT reject. Stubbing a rejection tests fiction.
clientSpy.mockResolvedValueOnce({ success: false, error: 'provider unavailable' });

const res = await POST(request);

expect(res.status).toBe(502);                     // ← await-and-drop returns 200 here
expect(await db.find({ collection: 'deletion-tokens' })).toHaveLength(0);   // rolled back
```

Run it against the pre-fix call site and watch it return `200`. If your test still passes, you have written the mocked-throw antipattern from [[tests-that-cannot-fail]] — you stubbed a `throw` the real client cannot produce, and you proved nothing.

## Checklist

- [ ] Every `«CLIENT_FN»` call is either **`await`ed-and-branched** or passed to **`«VOID_HELPER»`**. Never a bare `await`. Never floating.
- [ ] No `try/catch` is relied on to detect a failure from `«CLIENT_FN»`.
- [ ] No `.catch()` is attached to a promise that never rejects.
- [ ] Compliance / billing / clickable-token side effects `await` and branch — **and roll back** whatever was committed before the call.
- [ ] Failure is reported **exactly once**: by the client or by the caller, never both, never neither.
- [ ] The recipient identifier and the **recipient's** locale are passed (not the requester's).
- [ ] A test drives `{ success: false }` — **resolved, not thrown** — and asserts the caller's branch.

## Related

- Incident / plan: «INCIDENT_REF»
- Fire-and-forget inside a scheduled job (where the release branch depends on this): [[claim-before-side-effect]] — `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`
- Why "I mocked the throw" proves nothing here: [[tests-that-cannot-fail]] — `SKILL_TESTS_THAT_CANNOT_FAIL.md`
- Capture levels and the double-report rule: `RUNBOOK_OBSERVABILITY.md`
- The cost of turning this into a lint gate: `RUNBOOK_QUALITY_ASSURANCE.md`
