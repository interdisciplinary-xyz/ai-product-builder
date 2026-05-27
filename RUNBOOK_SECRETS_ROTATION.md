# Secrets Rotation

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_SECRETS_ROTATION` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/SECRETS_ROTATION.md` and localize the items below.
>
> **Reusability:** template-ready — the cadence / inventory / per-class-playbook / emergency-rotation structure is reusable; the secret names, vendors, and DRIs are «placeholders». Localize the tokens below per repo.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product whose secrets this rotates.
> - `«SECRET_REGISTRY»` — the canonical list of secrets this repo holds (name · store · scope · last-rotated date · cadence · DRI).
> - `«SECRET_STORE»` — where secrets live (e.g. a deploy-platform env-var store, a vault, a `.env*` file template).
> - `«PAYMENTS»` / `«AI_PROVIDER»` / `«EMAIL»` / `«OBSERVABILITY»` / `«DB_CMS»` / `«AUTH»` — the vendors whose keys / signing secrets get rotated.
> - `«EMERGENCY_RPO»` — the maximum tolerated window between suspected leak and full revocation (e.g. 4 hours).
> - `«ROTATION_DRI»` — the named on-call owner of secret hygiene.
> - `«DECISION_LOG»` — where rotation events are recorded (deployed name: `DECISION_LOG.md`).
> - `«SMOKE_TESTS»` — the post-rotation smoke-test inventory referenced from `SMOKE_TEST.md`.

Cadence + runbook for periodic and emergency rotation of every secret the platform holds. A secret that is never rotated is the same as a secret that was leaked on day one — the team just doesn't know it yet.

Pair with [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) (the access-control / env-validation model that consumes these secrets) and the `MANAGER_SECURITY` audit (which verifies this doc against the live store).

---

## Inventory of secrets

The single source of truth for **every secret this repo holds**. One row per secret. If a secret is in code or `«SECRET_STORE»` and not on this table, the inventory is wrong.

| Secret name              | Stored where               | Scope                              | Last rotated | Cadence            | DRI              |
| ------------------------ | -------------------------- | ---------------------------------- | ------------ | ------------------ | ---------------- |
| `«SECRET_NAME»`          | `«SECRET_STORE»`           | «which surface(s) read this»       | «DATE»       | «cadence»          | «ROTATION_DRI»   |

(one row per secret in `«SECRET_REGISTRY»` — e.g. payments API key, payments webhook signing secret, AI provider API key, email provider API key, observability ingest token, DB connection URI, auth admin SDK credentials, cookie signing keys (current + previous), cron secret, internal API secret, OAuth client secret)

**Refresh trigger:** any PR that adds a new secret MUST add a row here in the same commit. The `MANAGER_SECURITY` audit fails when an env var referenced by the code isn't on the inventory.

---

## Rotation cadences

Pick the cadence that matches the secret's blast radius — not what's convenient.

### Quarterly (every 90 days)

- High-privilege production secrets: payments API key, DB connection URI, AI provider API key, email provider API key.
- Webhook signing secrets where the provider supports zero-downtime dual-secret windows.
- Anything that, if leaked, would cost real money or expose user PII within 24 hours.

### Annually

- Lower-privilege keys: read-only analytics tokens, observability ingest tokens (where scoped to a single project), CI runner tokens scoped to a single repo.
- OAuth client secrets where the provider doesn't support dual-active credentials (rotation is a planned outage; do it on a known low-traffic window).

### Event-driven (rotate immediately on the trigger)

- **Role change** — a teammate with access to `«SECRET_STORE»` leaves, changes role, or loses a device. Rotate every secret they could read within `«EMERGENCY_RPO»`.
- **Suspected leak** — a secret appears in a commit, a log, an error report, a screenshot in a support ticket, a paste in a chat thread, or a public bug report. Treat as confirmed leak until proven otherwise.
- **Vendor breach** — the upstream provider (e.g. `«PAYMENTS»`, `«AI_PROVIDER»`, `«EMAIL»`) announces an incident affecting credentials. Rotate even if the provider says "you don't need to."
- **CI / runner compromise** — any environment that could have echoed a secret to a log under a compromised job.
- **Stale `.env*` discovered** — an old `.env.local` or `.env.backup` is found on a developer machine, in a `git stash`, or in a backup the team didn't know existed.

---

## Rotation procedure (general — 7 steps)

The shape every rotation follows. Per-class playbooks below add the vendor-specific commands; the steps themselves don't change.

1. **Announce.** Post in the team channel and tag `«ROTATION_DRI»`. Name the secret, the reason (cadence / event-driven), and the planned dual-write window. Do not skip this — a silent rotation that breaks a cron at 02:00 is a self-inflicted incident.
2. **Generate new.** Mint the new secret at the provider's dashboard / CLI. Do **not** paste it anywhere except `«SECRET_STORE»`. Especially do not paste it into a chat thread, a ticket, or a "for review" PR description.
3. **Dual-write window.** Where the provider supports it (most webhook signing secrets, `«AUTH»` cookie keys), keep the **old** and **new** secrets active simultaneously. Configure consumers to accept either. Default window: `«DUAL_WRITE_WINDOW»` (e.g. 24h) — long enough to catch an in-flight retry, short enough to stay disciplined.
4. **Swap consumers.** Update `«SECRET_STORE»` with the new value. Redeploy / restart every surface that reads the secret (web app, cron workers, scheduled tasks, edge functions). Verify each one picked up the new value before moving on.
5. **Verify.** Run the post-rotation smoke tests (see VERIFY section below). Confirm the new secret is in use — not just present.
6. **Revoke old.** At the end of the dual-write window, revoke / delete the old secret at the provider. If the provider only allows one active credential, revocation happens at step 4 — accept the planned brief outage.
7. **Document.** Add an entry to [`DECISION_LOG.md`](./DECISION_LOG.md): what was rotated, why (cadence / event), the window, the DRI, and a one-line "next rotation due" stamp. Update the `Last rotated` cell in the inventory above.

The DECISION_LOG entry is the audit trail. "We rotated it" in a chat message is not the audit trail.

---

## Per-class playbooks

Each class has the same 7 steps; this section captures the **vendor-specific** quirks.

### API keys (`«PAYMENTS»` / `«AI_PROVIDER»` / `«EMAIL»` / `«OBSERVABILITY»`)

(What to write here: per vendor — where the key is minted, whether the provider supports multiple active keys, and the exact env-var name. Replace with this repo's actual vendors.)

| Vendor             | Mint location              | Dual-active support? | Env var(s)             |
| ------------------ | -------------------------- | -------------------- | ---------------------- |
| `«PAYMENTS»`       | «provider dashboard»       | «yes / no»           | `«PAYMENTS_API_KEY»`   |
| `«AI_PROVIDER»`    | «provider dashboard»       | «yes / no»           | `«AI_API_KEY»`         |
| `«EMAIL»`          | «provider dashboard»       | «yes / no»           | `«EMAIL_API_KEY»`      |
| `«OBSERVABILITY»`  | «provider dashboard»       | «yes / no»           | `«OBSERVABILITY_TOKEN»` |

(one row per API-key-bearing vendor)

**Anti-pattern:** rotating a key and pasting the new value into a "rotation done" message in chat. The new value belongs in `«SECRET_STORE»` and nowhere else.

### Database credentials (`«DB_CMS»`)

- If the provider supports per-app users, mint a **new user** before rotating — the old user stays alive during the dual-write window, the new user takes over, then the old user is dropped.
- If only one credential is supported, expect a short connection storm at swap time. Schedule for low traffic; warn the team.
- After rotation, run a `«HEALTH_ENDPOINT»` check from each region the app deploys to — connection-pool warmup can mask a stale credential for 60 seconds.
- Update `«DB_URI»` in `«SECRET_STORE»` and **only** in `«SECRET_STORE»`. A `.env.production` checked in locally is the failure mode here.

### OAuth client secrets

- Most OAuth providers (e.g. social login providers) issue a **single** client secret. Rotation is a planned outage of social-login flows during the swap window.
- Notify users via a banner if the swap window is > 60 seconds.
- Verify the redirect URI configuration still matches `https://«DOMAIN»«OAUTH_HANDLER_PATH»` after the rotation — providers sometimes reset URI allowlists on credential changes.
- Pair every OAuth secret rotation with a check of the social-login `SMOKE_TEST.md` row.

### Webhook signing secrets

- The single highest-value rotation class: a compromised webhook signing secret lets an attacker forge events (e.g. fake `«PAYMENTS»` payment-success events) and silently grant entitlements.
- Most providers (e.g. `«PAYMENTS»`) support a **rolling secret** — both old and new are valid for the dual-write window. Use it; never accept a brief window where neither is valid.
- After rotation, confirm at least one **real** event arrives and is verified with the new secret (e.g. trigger a test payment, watch the webhook log show `signature: valid (new)`).
- Cross-ref the webhook section of [`RUNBOOK.md`](./RUNBOOK.md) — a rotated signing secret that the consumer doesn't know about is the #1 webhook incident.

### Env-file rotation (`.env*`)

The `.env`, `.env.local`, `.env.production`, and `.env.example` files on every developer machine and in every deploy environment.

- `.env.example` is **public** — it must contain only env-var **names**, never values. Treat any `.env.example` with a value as a leak.
- `.env.local` lives on developer machines. After any role change, the DRI should remind departing teammates to delete every `.env*` file from their machine, including `git stash` entries.
- `.env.production` should not exist as a file — production secrets live in `«SECRET_STORE»`, not on disk.
- After any rotation, every developer pulls the new value from `«SECRET_STORE»` into their local `.env.local` — this is the friction point that catches "I'm still using the old key."

---

## Emergency rotation (suspected leak / known breach)

The compressed runbook. Goal: full revocation of every potentially-affected secret within `«EMERGENCY_RPO»` (e.g. 4 hours) of the trigger.

1. **Triage (first 15 min).** Identify the scope: which secret, which surfaces read it, when it was last known-good.
2. **Revoke first, dual-write later.** Skip the polite dual-write window. Revoke the old secret at the provider **before** the new one is fully rolled out — accept the brief outage. A leaked secret in the wild is worse than a 5-minute outage.
3. **Mint new, deploy.** Push the new value to `«SECRET_STORE»` and redeploy every surface in parallel (not sequentially). Verify each surface picks up the new value within the first 30 minutes.
4. **Sweep.** Search every channel the old secret could have leaked through: git history (`git log -p --all -S "«SECRET_PREFIX»"`), CI logs, error-monitor events, support tickets, chat threads, screenshots. The leak surface is almost always wider than the first report.
5. **Notify.** If user data was reachable through the leaked secret, file an incident per [`RUNBOOK.md`](./RUNBOOK.md). If the leak window exceeds the GDPR-notifiable threshold, escalate per the privacy review process.
6. **Post-mortem.** Within 48h of recovery, write the incident up in [`DECISION_LOG.md`](./DECISION_LOG.md): root cause, scope, time-to-revoke, what would have made it faster. Update this runbook's per-class playbook with any vendor-specific learning.

**Hard rule.** Emergency rotation does **not** wait for a planned change window. The cost of a 5-minute outage is bounded; the cost of an unrotated leaked secret is not.

---

## Verify (post-rotation smoke tests)

A rotation is not complete until the new secret is **observed** in use. Run these checks **after** step 5 of the general procedure:

- [ ] The relevant `SMOKE_TEST.md` rows pass — payment checkout completes (proves `«PAYMENTS_API_KEY»`); a webhook event is received and verified (proves `«PAYMENTS_WEBHOOK_SECRET»`); an AI-backed feature returns a response (proves `«AI_API_KEY»`); a transactional email sends (proves `«EMAIL_API_KEY»`).
- [ ] `curl -fsS https://«DOMAIN»«HEALTH_ENDPOINT»` returns 200 (proves `«DB_URI»` if the health check probes the DB).
- [ ] The old secret, used directly against the provider, returns 401 / "credential revoked" (proves the old credential is truly revoked, not just unused).
- [ ] `«OBSERVABILITY»` shows no spike in 401 / signature-error events after the swap.
- [ ] The `Last rotated` cell in the inventory above is updated with today's `«DATE»`.

Cross-ref: [`SMOKE_TEST.md`](./SMOKE_TEST.md) — the per-page scenario inventory. The rotation checklist names the smoke rows that **prove** the new credential is live; the smoke doc owns the steps.

---

## Cross-references

- [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) — the access-control / env-validation model that defines which surfaces read which secrets. A rotation that updates `«SECRET_STORE»` but not the schema in `SECURITY_MODEL.md` will fail validation at boot.
- [`RUNBOOK.md`](./RUNBOOK.md) — the incident runbook. Webhook signature errors, auth 401 storms, and DB connection failures often surface here first.
- [`DECISION_LOG.md`](./DECISION_LOG.md) — the audit trail. Every rotation event lands here.
- [`SMOKE_TEST.md`](./SMOKE_TEST.md) — the post-rotation verification scenarios.
- `MANAGER_SECURITY` (in the AI library) — the audit playbook that verifies this doc against the live `«SECRET_STORE»` and flags secrets in code that aren't on the inventory.

---

## Anti-patterns

- **Rotating only the surface you remembered.** A payments key read by both the web app and a cron worker. Rotating one surface and not the other means the cron silently fails until the next paid invoice.
- **Skipping the announcement.** A silent 02:00 rotation that kills a scheduled report is an outage you caused yourself.
- **Pasting the new value into chat.** The provider's dashboard is the source; `«SECRET_STORE»` is the destination. No middlemen.
- **"It's just dev, don't rotate."** Dev credentials with read access to production data are production credentials.
- **Letting an emergency rotation skip the post-mortem.** The 48h write-up is what stops the next leak.
- **`.env.example` with real values.** Treat as a leak; rotate every value the file ever contained.
