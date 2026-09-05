# WEBHOOK_IDEMPOTENCY_LEDGER.md — two-phase claim/process/complete + slow-path SLO

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the ledger-table pattern for cross-provider webhook idempotency — a single `webhook-events` collection that every payment/messaging/CMS provider writes claim → process → complete states through, with stale-claim reclaim and a slow-path SLO before the provider's retry cliff. Companion to [`PAYMENTS_LIFECYCLE.md`](./PAYMENTS_LIFECYCLE.md) (the transactional flow) and the sibling `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md` (the per-row claim discipline).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_WEBHOOK_IDEMPOTENCY_LEDGER` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the ledger schema, the claim CAS, and the slow-path threshold rule are portable verbatim; only the specific providers and the DB client's query shape need swapping.
>
> **Pairs with:** `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md` (per-row idempotency for scheduled jobs — this runbook is its multi-provider webhook cousin), `RUNBOOK_PAYMENTS_LIFECYCLE.md` (money-path state machine), `MANAGER_SECURITY.md` (signature verification, timing-safe compares), `MANAGER_INCIDENT_RESPONSE.md` (slow-path SLO breach = paging event) — boundary: this runbook owns the *cross-provider ledger shape*; SKILL_CLAIM owns the *per-row CAS pattern*; PAYMENTS_LIFECYCLE owns the *domain state machine*.
>
> **Local definitions to provide per repo:**
> - `«WEBHOOK_EVENTS_COLLECTION»` — the shared ledger table/collection (e.g. `webhook-events`)
> - `«PROVIDERS»` — the providers routed through the ledger (e.g. `stripe, przelewy24, resend, slack`)
> - `«SLOW_PATH_MS»` — threshold below the provider's retry cliff (default `5000`; Stripe's cliff is 10s, so 5s gives 5s of headroom)
> - `«DB_CMS»` — the DB client used for the CAS
> - `«OBSERVABILITY»` — where slow-path breaches surface

---

## 1. The rule

> **Every inbound webhook writes to a single ledger table before any side effect. The write is a compare-and-swap that claims the event; the side effect only runs if the claim succeeds.**

The ledger has one row per `(provider, event_id)` tuple. The row's `state` moves monotonically: `claimed → processing → completed | failed`. A second delivery of the same event finds an existing row, sees it's `completed`, returns 200 without doing anything.

This is the multi-provider generalisation of the per-row claim pattern in `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`. Read that first — the "why is at-least-once delivery inevitable" and "what a mock-driven test misses" arguments apply verbatim.

---

## 2. Why not just check provider event IDs?

The naive shape:

```ts
// ❌ "we already handled event evt_123, skip"
const seen = await db.find({ collection: 'events', where: { id: event.id } });
if (seen) return new Response(null, { status: 200 });
await handleEvent(event);
await db.create({ collection: 'events', data: { id: event.id } });
```

Three windows kill this:

1. **Two deliveries arrive in the same second.** The `find` returns nothing for both; both call `handleEvent`; both create the row (or one throws a duplicate-key error and the outer `try/catch` swallows it after the side effect already ran twice).
2. **The process dies between `handleEvent` and the create.** Next delivery re-runs `handleEvent`.
3. **A provider retry arrives while `handleEvent` is still running.** The `find` sees nothing (row not created yet); the second run duplicates the side effect.

The ledger closes all three by doing the write **first**, as a CAS, and treating "row already exists" not as an error but as the mechanism.

---

## 3. The ledger schema

```ts
// «WEBHOOK_EVENTS_COLLECTION» — one row per (provider, event_id)
{
  _id:            string,                  // internal id
  provider:       '«PROVIDERS:0»' | '«PROVIDERS:1»' | …,
  event_id:       string,                  // the provider's id, unique per provider
  event_type:     string,                  // e.g. 'checkout.session.completed'
  state:          'claimed' | 'processing' | 'completed' | 'failed',

  // Timing — every stage is measured for the slow-path SLO
  claimed_at:     ISODate,
  processing_at?: ISODate,
  completed_at?:  ISODate,
  failed_at?:     ISODate,
  duration_ms?:   number,                  // completed_at - claimed_at

  // Failure detail (only when state = 'failed')
  failure_class?: 'transient' | 'definitive',
  failure_note?:  string,

  // Payload (for replay + audit) — keep this bounded; do not log full bodies
  payload_head:   object,                  // first 4 KB of the event body

  // Idempotency version — increments on stale-reclaim (see §5)
  claim_generation: number,
}

// Indexes (in this order):
//   { provider, event_id } — UNIQUE
//   { provider, state, claimed_at }
```

The unique index on `(provider, event_id)` is what makes the CAS atomic. Without it, two concurrent inserts both succeed briefly.

---

## 4. The handler shape

```ts
// «API_ROUTES»/webhooks/«PROVIDER»/route.ts
export async function POST(req: Request) {
  const rawBody = await req.text();

  // 1. Timing-safe signature verification BEFORE anything else touches the body.
  //    A wrong sig is 400, and it is 400 quickly — do not enter the ledger.
  const sig = req.headers.get('«PROVIDER»-signature');
  if (!verifySignature(rawBody, sig, env.«PROVIDER»_WEBHOOK_SECRET)) {
    return new Response('bad signature', { status: 400 });
  }

  const event = JSON.parse(rawBody);

  // 2. Claim the event. Insert with state='claimed'; the unique index on
  //    (provider, event_id) makes this the CAS.
  const claim = await «DB_CMS».insertOne('«WEBHOOK_EVENTS_COLLECTION»', {
    provider:         '«PROVIDER»',
    event_id:         event.id,
    event_type:       event.type,
    state:            'claimed',
    claimed_at:       new Date(),
    payload_head:     truncate(event, 4096),
    claim_generation: 1,
  }).catch(err => (isDuplicateKey(err) ? null : Promise.reject(err)));

  if (!claim) {
    // Someone else claimed it. Return 200 so the provider stops retrying.
    return new Response('already claimed', { status: 200 });
  }

  const started = performance.now();

  try {
    // 3. Move to processing (so a crash between claim and completion is visible).
    await «DB_CMS».updateOne(
      { _id: claim.insertedId, state: 'claimed' },
      { $set: { state: 'processing', processing_at: new Date() } }
    );

    // 4. Do the actual work.
    await routeToHandler(event);

    const duration_ms = Math.round(performance.now() - started);

    // 5. Complete. Record duration for the slow-path SLO.
    await «DB_CMS».updateOne(
      { _id: claim.insertedId },
      { $set: { state: 'completed', completed_at: new Date(), duration_ms } }
    );

    // 6. Slow-path SLO: capture a warning if we crossed «SLOW_PATH_MS» ms
    //    (below the provider's retry cliff). This is NOT a fail — the event
    //    completed. It is an early-warning signal for the operator.
    if (duration_ms > «SLOW_PATH_MS») {
      «OBSERVABILITY».capture(new Error('webhook slow-path breach'), {
        level: 'warning',
        tags: { domain: 'webhook', provider: '«PROVIDER»', event_type: event.type },
        extra: { duration_ms, threshold: «SLOW_PATH_MS» },
      });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    const failure_class = classifyFailure(err);   // 'transient' | 'definitive'

    await «DB_CMS».updateOne(
      { _id: claim.insertedId },
      { $set: {
          state:         'failed',
          failed_at:     new Date(),
          duration_ms:   Math.round(performance.now() - started),
          failure_class,
          failure_note:  String(err.message).slice(0, 512),
      } }
    );

    // Transient failure → return 5xx so the provider retries.
    // Definitive failure → return 200 so the provider stops (the ledger row
    // holds the failure detail; retrying will not help).
    return failure_class === 'transient'
      ? new Response('transient failure', { status: 503 })
      : new Response('permanent failure', { status: 200 });
  }
}
```

Notes:

- The signature check is **outside** the ledger. A wrong signature never gets a ledger row — the endpoint answers 400 in milliseconds.
- The `state=claimed` → `state=processing` transition is separate so a crash mid-work leaves a `processing` row (which `RUNBOOK_INCIDENTS.md` reads as "look here first").
- **Definitive vs transient failure classification is load-bearing.** A definitive failure (bad payload shape, missing user) returns 200 so the provider stops retrying — the ledger row is the record. A transient failure (DB down, upstream 500) returns 5xx so the provider retries; the stale-claim reclaim (§5) will pick it up.

---

## 5. Stale-claim reclaim

A crash between `claim` and any of `completed | failed` leaves an orphan `claimed` or `processing` row. Without reclaim, the same event never completes.

Run a periodic reclaim job (per `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`'s pattern):

```ts
// scripts/webhook-reclaim.ts — invoked from a cron every «RECLAIM_INTERVAL_MIN» minutes
const stale = await «DB_CMS».find('«WEBHOOK_EVENTS_COLLECTION»', {
  state: { $in: ['claimed', 'processing'] },
  claimed_at: { $lt: new Date(Date.now() - «STALE_THRESHOLD_MS») },  // e.g. 5 minutes
});

for (const row of stale) {
  const reclaimed = await «DB_CMS».findOneAndUpdate(
    { _id: row._id, claim_generation: row.claim_generation },  // CAS on generation
    { $set: { state: 'claimed', claimed_at: new Date() }, $inc: { claim_generation: 1 } }
  );
  if (!reclaimed) continue;                                     // someone else reclaimed
  await replayEvent(row.provider, row.event_id, row.payload_head);
}
```

Two rules for reclaim:

1. **CAS on `claim_generation`, not on `state`.** Two reclaimers racing must not both succeed; `claim_generation` gives them a value that only one can match.
2. **`«STALE_THRESHOLD_MS»` is longer than the longest legitimate processing time by a comfortable margin.** For a webhook that talks to slow downstreams, 30 minutes is safer than 5.

---

## 6. Slow-path SLO — the pre-warning

The slow-path capture at §4 step 6 is the load-bearing observability signal. Providers have hard retry cliffs (Stripe: 10 seconds; Shopify: 5 seconds; most inbound webhooks: 30 seconds). Once you cross that, the provider retries — and your ledger correctly deduplicates, but the *user-visible* effect (a payment appearing, an email sending) is delayed.

The threshold `«SLOW_PATH_MS»` is set **below** the earliest cliff you care about, so you page **before** the retry starts. For Stripe, `5000` gives 5 seconds of headroom. For a downstream that's a `POST` to a slow internal service, you may need a much lower threshold.

The capture is a `warning`, not an `error` — the event *completed*. But the trendline of warnings tells you which handlers are approaching the cliff so you decompose them before the incident.

**Corollary:** any webhook handler over ~250 lines is a review-flag. The Stripe / Przelewy24 handlers in the reference implementation (`respect.click`) are 463 and 660 lines each — the audit surface a solo founder can review is a fraction of that. Split by event type; the ledger claims independently per event, so the split is safe.

---

## 7. Signature verification — the timing-safe rule

Every provider signs webhooks. Verification is a **byte-level timing-safe compare** — never a string `===`.

```ts
import { timingSafeEqual } from 'node:crypto';

function verifySignature(rawBody: string, sig: string, secret: string): boolean {
  const expected = hmac(secret, rawBody);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
```

A string compare short-circuits on the first mismatched byte, leaking the correct prefix through a timing side-channel. A timing-safe compare doesn't. This is not paranoia — it's cheap belt-and-braces.

---

## 8. Anti-patterns

- **Verifying the signature after parsing the body.** The parse is arbitrary code on untrusted input. Verify signature against the *raw* body first.
- **Using the provider's event ID as a database primary key without the provider prefix.** Two providers may collide; `(provider, event_id)` is the unique key.
- **A `try/catch` around the whole handler that returns 200 on any error.** The provider stops retrying; the ledger has no failure record; the event is lost.
- **Returning 200 on a transient failure.** The provider stops retrying and the event won't re-run — reclaim can't help because the ledger says `failed` definitively.
- **Returning 5xx on a definitive failure (bad payload, user not found).** The provider retries forever; the ledger row is `failed` on every attempt; storage grows without bound.
- **A slow-path SLO capture at `error` level.** Pages fire when nothing is broken; the operator learns to ignore them.
- **Reclaim without CAS on generation.** Two workers pick up the same stale row and both re-run.
- **Single-file webhook handler over ~250 lines** carrying every provider's every event type. Split by provider AND by event type; the ledger makes the split safe.

---

## 9. Verification checklist

- [ ] `«WEBHOOK_EVENTS_COLLECTION»` exists with the unique index on `(provider, event_id)`.
- [ ] Every webhook handler in `«API_ROUTES»/webhooks/*` writes a claim row before any side effect.
- [ ] Signature verification is byte-level timing-safe, on the raw body, before JSON parse.
- [ ] The `claim → processing → completed` state transitions are separate writes (visibility on crash).
- [ ] Slow-path SLO capture at `warning`, at `«SLOW_PATH_MS»` below every relevant provider's retry cliff.
- [ ] A reclaim cron runs at least every `«RECLAIM_INTERVAL_MIN»` minutes with CAS on `claim_generation`.
- [ ] Transient-vs-definitive failure classification is explicit in every handler (a helper `classifyFailure(err)`).
- [ ] No handler over ~250 lines.
- [ ] A test asserts that two POSTs of the same signed event body run the side effect exactly once — the double-tick test from `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`, applied at the handler boundary.

## 10. Related

- Per-row claim pattern (the CAS discipline this runbook builds on): `SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`
- Money-path state machine: [`PAYMENTS_LIFECYCLE.md`](./PAYMENTS_LIFECYCLE.md)
- Auth + signature discipline: [`MANAGER_SECURITY.md`](./MANAGER_SECURITY.md)
- Incident triage when a slow-path breach becomes a page: [`MANAGER_INCIDENT_RESPONSE.md`](./MANAGER_INCIDENT_RESPONSE.md)
- Whether the double-tick test can actually fail: `SKILL_TESTS_THAT_CANNOT_FAIL.md`
- The route-hygiene audit that flags oversize handlers: `commands/audit-api-routes.md`

**Last reviewed:** «DATE»
