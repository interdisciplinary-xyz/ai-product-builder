# Claim before side effect

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_CLAIM_BEFORE_SIDE_EFFECT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`. **Additional install target:** `.claude/skills/claim-before-side-effect/SKILL.md`.
>
> **Reusability:** template-ready — the CAS inversion, the four windows, the release-on-failure rule and the double-tick proof are portable verbatim; **fill the `«placeholders»`** and rewrite the code to this repo's `«DB_CMS»` client.
>
> **Pairs with:** `SKILL_NEVER_THROWS_CONTRACT.md` (how to read the side effect's *result* so the release branch is reachable at all) and `RUNBOOK_INCIDENTS.md` — boundary: this skill owns the **order** of the marker write and the external call; the never-throws skill owns the **call shape**.
>
> **Owns / defers to:** Owns idempotency for at-least-once scheduled jobs and webhooks doing irreversible external side effects. Defers the proof standard → `SKILL_TESTS_THAT_CANNOT_FAIL.md`; auth/signature verification of the trigger → `RUNBOOK_SECURITY_MODEL.md`; payment-specific retry semantics → `RUNBOOK_PAYMENTS_LIFECYCLE.md`.
>
> **Local definitions to provide per repo:**
> - `«SCHEDULER»` — what invokes the job, and its delivery guarantee (**verify it: almost every managed scheduler is at-least-once**)
> - `«DB_CMS»` — the client the claim is written through, and whether its `update` returns the matched-document count
> - `«EXTERNAL_PROVIDER»` — the irreversible side effect (transactional mail, a charge, a push, an outbound webhook) and whether it accepts an idempotency key
> - `«MARKER_FIELD»` — the per-job idempotency marker (inline-fill: one per job, e.g. a `…SentAt` timestamp or an advancing stage)
> - `«OBSERVABILITY»` — where the transient write-conflict is captured, and at what level
> - `«INCIDENT_REF»` — how this repo cites the incident that motivated the rule

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: claim-before-side-effect
description: >-
  A marker stamped AFTER an irreversible external call is not idempotency — it is a
  re-send window, and «SCHEDULER» delivery is at-least-once («INCIDENT_REF»). Use when
  writing or reviewing any scheduled job or webhook handler; any
  find-candidates → await «EXTERNAL_PROVIDER» → update(«MARKER_FIELD») sequence; or any
  code that defends itself with "the marker makes it idempotent", "the tick is short",
  or "«SCHEDULER» fires once an hour". Especially fire when a diff adds a new scheduled
  job or a new outbound side effect at all, even when nobody says the word idempotent —
  that is the moment it is cheap to fix. Defer to `never-throws-contract` for how to
  read the call's result; this skill owns the ORDER of the write and the call.
---
```

---

## The damage

`find candidates → call the outside world → stamp «MARKER_FIELD»` is **not idempotent.** It looks idempotent, because the marker is right there. But the marker is written *after* the irreversible thing already happened, so **any** interruption between the two re-does it on the next tick. («INCIDENT_REF».)

Duplicate lifecycle mail at scale is a sender-reputation event, not an annoyance. The same shape applied to «PAYMENTS» is a double charge. The same shape on an outbound webhook is a duplicate order downstream, in someone else's system, where you cannot fix it.

## When to use

- Writing or editing anything invoked by `«SCHEDULER»` (cron routes, queue consumers, workers).
- Any `«DB_CMS»` read → `await «EXTERNAL_PROVIDER»…` → `«DB_CMS»` update-the-marker sequence.
- Any webhook handler that performs an outbound side effect (providers retry; **all** of them retry).
- Reviewing code that justifies itself with *"the marker makes it idempotent."*
- Any time someone reads *"«SCHEDULER» fires once an hour"* as *"«SCHEDULER» fires exactly once."*

## The trap

```ts
// ❌ Not idempotent. The marker is written after the irreversible act.
for (const row of candidates) {
  const result = await «EXTERNAL_PROVIDER».send({ to: row.email });
  if (!result.success) continue;

  await db.update({
    where: { id: { equals: row.id } },
    data: { «MARKER_FIELD»: nowIso },   // ← crash before this line = re-send on the next tick
  });
}
```

**Every window between the call and the stamp is a re-do window.** There are four, and they are not exotic:

1. **«SCHEDULER» retry.** Delivery is **at-least-once**. A 500, a timeout, or a platform hiccup re-invokes the handler — with the marker still unwritten.
2. **Redeploy or eviction mid-tick.** The process is killed between the two lines. The sent mail is not un-sent; the charge is not un-charged.
3. **A manual trigger racing the scheduled one.** Both handlers are almost always wired (a `POST` for ops, a `GET` for the scheduler). Nothing serialises them.
4. **The marker write itself failing** — a transient write conflict, a connection reset, a validation error — *after* «EXTERNAL_PROVIDER» already accepted the message. The side effect succeeded; the record of it did not.

### Pre-refutation: "but the tick is short and the schedule is hourly"

This is the argument that gets the shape merged, and it is **wrong on its own terms**.

That reasoning covers exactly one thing: *natural overlap* — tick N still running when tick N+1 begins. It covers **none of the four windows above**, all of which are re-entries into a tick that already did the irreversible thing. Windows 1, 2 and 4 do not care about the schedule interval at all; window 3 is not on a schedule.

The gap that matters is not "how often does the job start?" It is **"how long is the code path between the send and the stamp, and what can kill the process inside it?"** That path is measured in milliseconds and the answer is *anything at all*. Hourly scheduling does not shrink it. And note what the trigger's auth check buys you here: **it authenticates the caller — it takes no lock.**

## The fix — claim the row first, then act

Invert the order. **Compare-and-swap the marker to *claim* the candidate, and only perform the side effect if you won the claim.**

```ts
// ✅ Claim, then act. A loser matches 0 documents and skips.
const claim = await db.update({
  where: {
    and: [
      { id: { equals: row.id } },
      { or: [{ «MARKER_FIELD»: { exists: false } }, { «MARKER_FIELD»: { equals: null } }] },
    ],
  },
  data: { «MARKER_FIELD»: nowIso },
  overrideAccess: true,          // the claim is app-internal — see [[framework-defaults-are-permissive]]
});

if (claim.docs?.length !== 1) continue;   // 0 rows = someone else claimed it. Not an error.

const result = await «EXTERNAL_PROVIDER».send({ to: row.email });

if (!result.success) {
  // ❗ Release the claim, or this row is skipped forever.
  await db.update({
    where: { id: { equals: row.id } },
    data: { «MARKER_FIELD»: null },
    overrideAccess: true,
  });
}
```

The claim must be a **conditional write whose filter only the winner can match**, and you must be able to observe **how many documents it matched**. If your `«DB_CMS»` client does not return a matched count, that is not a detail to work around — it is the whole mechanism, and you need a different call.

## What the naive fix still gets wrong

**1. Release the claim on failure.** Without the release you have traded *"might do it twice"* for *"might do it zero times"* — a worse bug, and a **silent** one: the marker says done, nothing was sent, and no alert fires. If you would rather self-heal than release explicitly, make the marker a **claim timestamp** and treat a claim older than a grace window, with no corresponding delivery record, as void. Pick one. Do not pick neither.

**2. Write-conflict is expected, not exceptional.** This CAS deliberately races every other writer on the same document (a `lastActiveAt` bump, a profile edit, a second worker), and `«DB_CMS»` will transiently abort those transactions. **That is the mechanism working.** It is retryable and non-fatal — the row simply is not claimed this tick, and the next tick gets it. Classify it; do not alert on it:

```ts
const isTransientWriteConflict =
  err.codeName === 'WriteConflict' ||
  /transaction.*(aborted|write.?conflict)/i.test(err.message);

«OBSERVABILITY».capture(err, { level: isTransientWriteConflict ? 'warning' : 'error' });
```

A page at 3am for a working optimistic-concurrency guard is how teams talk themselves back into the unsafe shape.

**3. An advancing marker is not an exists-check.** A null-or-set timestamp claims with `{ or: [{ exists: false }, { equals: null }] }`. A marker that **advances** (`stage: 1 → 2 → 3`) must compare-and-swap **on the value you read** — `{ stage: { equals: stageYouRead } }` — or every concurrent writer reads `1`, all compute `2`, all pass a range filter, and all write the same literal. Same failure, same fix, different field: see the read-modify-write case below.

**4. Provider idempotency keys are belt-and-braces, not the belt.** Where «EXTERNAL_PROVIDER» supports one, pass a **deterministic** key derived from the claim (`${job}:${rowId}:${markerValue}`). One line, real protection. But it stops the *provider* from acting twice; **it does not stop you from deciding to act twice**, it does nothing for providers that offer no such key, and it does nothing for the side effects that are not provider calls at all.

## The proof obligation — the double-tick test

A claim without a double-tick test does not demonstrate idempotency. Run the tick **twice** against the same seeded candidate:

```ts
await runTick();
await runTick();                          // the second tick must find nothing to claim
expect(sendSpy).toHaveBeenCalledTimes(1);
```

Then assert the three things the happy-path test cannot see:

```ts
// Ordering — the claim resolves BEFORE the side effect is invoked.
expect(updateSpy.mock.invocationCallOrder[0]).toBeLessThan(sendSpy.mock.invocationCallOrder[0]);

// Release — a failed send leaves the marker null, and the next tick re-attempts.
sendSpy.mockResolvedValueOnce({ success: false });
await runTick();
expect((await reload(row.id)).«MARKER_FIELD»).toBeNull();
await runTick();
expect(sendSpy).toHaveBeenCalledTimes(2);   // re-attempted, not skipped forever

// Concurrency — two interleaved ticks still yield exactly one side effect.
await Promise.all([runTick(), runTick()]);
expect(sendSpy).toHaveBeenCalledTimes(1);
```

Run this against the **pre-fix** code first and watch the first assertion come back `2`. If it does not, your test is not driving the tick twice and you have written one of the shapes in [[tests-that-cannot-fail]]. Use an in-memory `«DB_CMS»` harness so it runs in the CI unit lane — a concurrency guard that only runs on someone's laptop is not a guard.

## Checklist

- [ ] The marker is written **before** the irreversible call, guarded by a filter only the winner can match.
- [ ] Matched-count `!== 1` → **skip**. Zero rows means someone else claimed it; that is normal, not an error.
- [ ] The claim is **released** on failure — or self-heals via an explicit grace window. One or the other, never neither.
- [ ] Transient write-conflict is captured at `warning`, skips the row, and does not page.
- [ ] Advancing markers CAS **on the value read**, not on `exists`.
- [ ] A deterministic idempotency key is passed to «EXTERNAL_PROVIDER» wherever one is supported.
- [ ] The manual trigger and the scheduled trigger share the same claim path — no unlocked back door.
- [ ] A **double-tick test** asserts exactly one side effect, plus ordering, release and concurrency.

## Related

- Incident / plan: «INCIDENT_REF»
- Reading the side effect's result (the release branch depends on it): [[never-throws-contract]] — `SKILL_NEVER_THROWS_CONTRACT.md`
- Why the claim uses an access override: [[framework-defaults-are-permissive]] — `SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md`
- Whether your double-tick test can actually fail: [[tests-that-cannot-fail]] — `SKILL_TESTS_THAT_CANNOT_FAIL.md`
- Incident write-up shape: `RUNBOOK_INCIDENTS.md`
