# Backup & Recovery

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_BACKUP_RECOVERY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_BACKUP_RECOVERY.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the inventory / RPO-RTO / verification / drill-cadence / restore-runbook structure is reusable; the vendors, retention periods, and data classes are «placeholders». Localize the tokens below per repo.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product whose data this protects.
> - `«DB_CMS»` — primary database / CMS being backed up (e.g. a managed database + CMS layer).
> - `«BACKUP_DESTINATION»` — where backups land (e.g. the provider's snapshot store, an object-storage bucket, a cross-region replica).
> - `«BACKUP_VENDOR»` — the service performing the backup (often the DB vendor itself; sometimes a third-party backup-as-a-service).
> - `«RPO»` — Recovery Point Objective: the maximum acceptable data loss, per data class (e.g. 1 hour for payments, 24 hours for content).
> - `«RTO»` — Recovery Time Objective: the maximum acceptable downtime to restore, per data class (e.g. 4 hours for payments, 24 hours for content).
> - `«RETENTION»` — how long backups are kept (e.g. 7 days rolling + 30 days monthly).
> - `«SCRATCH_ENV»` — the throwaway environment used for live-restore drills (e.g. a parallel staging cluster).
> - `«BACKUP_DRI»` — the named on-call owner of backup hygiene.

Operational reference for backups, restore drills, and the "the database is gone, restore it" runbook. A backup that has never been restored is **not** a backup — it's a hopeful filename.

Pair with [`RUNBOOK.md`](./RUNBOOK.md) (the incident runbook — backups are invoked from there), [`MAINTENANCE.md`](./MAINTENANCE.md) (cost / cadence checklist), and [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) (encryption-at-rest and access control on `«BACKUP_DESTINATION»`).

---

## Backup inventory

The single source of truth for **every data store that has business value**. One row per store. If a store holds user data, content, or financial records and isn't on this table, it isn't backed up — find out why before the next merge.

| Data store     | Vendor          | Cadence      | Retention      | Destination          | Last verified |
| -------------- | --------------- | ------------ | -------------- | -------------------- | ------------- |
| `«DB_CMS»`     | `«BACKUP_VENDOR»` | «cadence»   | `«RETENTION»`  | `«BACKUP_DESTINATION»` | «DATE»       |

(one row per backed-up data store — e.g. primary application database, CMS-managed media, transactional email-receipt archive, auth user record export, secondary read-replica if independently snapshot, file-upload object storage)

**Refresh trigger:** any PR that introduces a new data store (collection, table, bucket, queue with durability claims) MUST add a row here in the same commit. A new store that holds user data without a backup row is a launch-blocker.

`Last verified` is the date the most recent **restore drill** succeeded — not the date the most recent backup ran. A "successful" backup that has never been restored is not verified.

---

## RPO / RTO targets per data class

Different data classes tolerate different amounts of loss and downtime. Picking one RPO/RTO for everything either over-pays for low-value data or under-protects payments data — both wrong.

| Data class       | What's in it                                      | `«RPO»` (max data loss)  | `«RTO»` (max downtime)  | Why                                                                |
| ---------------- | ------------------------------------------------- | ------------------------ | ----------------------- | ------------------------------------------------------------------ |
| **Auth**         | User records, session-relevant flags              | «e.g. 1 hour»            | «e.g. 1 hour»           | Users locked out is a 5-star support ticket within minutes         |
| **Payments**     | Subscriptions, customer / subscription IDs, plan state | «e.g. 1 hour»       | «e.g. 4 hours»          | Lost plan state = double-charge or unfulfilled service             |
| **Content**      | CMS pages, user-generated content, media          | «e.g. 24 hours»          | «e.g. 24 hours»         | Re-authorable in worst case; some loss tolerable                   |
| **Analytics**    | Aggregated metrics, funnel events                 | «e.g. 7 days»            | «e.g. 7 days»           | Reconstructable from raw events; loss is annoying not fatal        |

(one row per data class — replace target values with what the business actually needs, not what the vendor offers)

**Hard rule.** `«RPO»` and `«RTO»` are **decisions**, not vendor defaults. If the vendor's free tier offers daily backups and the business needs 1-hour RPO, the answer is to upgrade the tier, not to relax the target. Document the gap and the trigger to close it.

If a vendor's actual recovery time exceeds your `«RTO»`, this is a known gap that belongs in [`DECISION_LOG.md`](./DECISION_LOG.md) with the trigger to fix it (e.g. "first paying customer" or "first 100 users").

---

## Backup verification (did the backup actually work?)

The check that almost every team skips. "Did we configure backups?" is a different question from "did the backup work?" and the second one is the only one that matters when the DB is gone.

For each row in the inventory, on the configured cadence:

- [ ] The backup job **completed** (not just "started"). Verify in `«BACKUP_VENDOR»`'s dashboard / logs.
- [ ] The backup artifact **exists** in `«BACKUP_DESTINATION»` with the expected timestamp and a non-zero size. An empty backup is the most common silent failure.
- [ ] The backup artifact is **readable** — the file isn't corrupted, the snapshot isn't marked failed, the object isn't in glacier-pending state.
- [ ] The backup's encryption is **valid** — the encryption-at-rest key for `«BACKUP_DESTINATION»` hasn't been rotated out from under the backup (cross-ref [`SECRETS_ROTATION.md`](./SECRETS_ROTATION.md)).
- [ ] The retention policy is **enforcing** — the oldest backup is younger than `«RETENTION»` (proves the lifecycle policy is alive); the newest backup is on-cadence (proves backups are still running).

This list is a **read-only** check — it does not restore. The actual "did the data come back?" verification lives in restore drills below. Both checks are required; neither replaces the other.

**Automate where possible.** A weekly cron that posts a one-line "backup OK / FAIL" summary to the team channel turns "did anyone check the backups?" into a default-visible signal. A silent backup pipeline is the second-most-common path to data loss (after no pipeline at all).

---

## Restore drill cadence

Restoring under pressure for the first time, at 03:00, with no documentation, is the failure mode. Drills move the first failed restore from production into the calendar.

### Quarterly — tabletop drill

A paper exercise. No real restore. Goal: prove the team knows where the runbook lives and what the first 5 commands are.

- The `«BACKUP_DRI»` reads the restore runbook below out loud.
- Two non-DRIs identify the steps they could execute without help.
- Any "wait, where do I find X?" gets fixed in the runbook the same day.
- The tabletop counts as **passed** when a non-DRI can describe the first-hour actions from memory.

### Annually — live restore drill

The real thing. A full restore of `«DB_CMS»` from `«BACKUP_DESTINATION»` into `«SCRATCH_ENV»`. Goal: prove the runbook works end-to-end and measure the actual recovery time against `«RTO»`.

- Pick a recent backup (not the newest — verify "yesterday's backup" can restore, since that's the realistic scenario).
- Restore into `«SCRATCH_ENV»` — **never** into production.
- Run the per-data-class smoke (a representative read + write) to prove the restored data is queryable.
- Measure: total restore time, time to first usable read, time to first usable write.
- Update `Last verified` in the inventory above with today's date.
- If actual recovery time **exceeded** `«RTO»`, this is a known gap — write the ADR in [`DECISION_LOG.md`](./DECISION_LOG.md) with the proposed mitigation (faster cadence, smaller backups, parallel restore, vendor upgrade).

A failed drill is a successful drill — it surfaces the bug **before** the real incident. The only failed drill is the one you didn't run.

---

## Restore runbook

The 3 am paste-and-run version. Terse on purpose.

### General — step-by-step

1. **Decide.** Is restoring the right action? Sometimes the data isn't actually lost — it's hidden by a bug, a deleted record, a stale cache. Restoring on top of "I think the data is gone" can destroy real recent writes. Verify the data is truly gone before reaching for backups.
2. **Pick the point in time.** What is the latest backup that's **before** the bad state? Newer is better; but not so new that the corruption is included. For accidental-delete events, pick the backup from immediately before the bad write.
3. **Restore into `«SCRATCH_ENV»` first.** Never restore directly into production unless the production data is fully gone (e.g. the cluster is destroyed). A scratch restore takes minutes; an incorrect production restore takes weeks of trust to rebuild.
4. **Verify the restored data.** Per data class, run the smoke: a representative read, a representative write, a representative join across collections. Confirm record counts roughly match the expected production state.
5. **Cut over.** Either promote `«SCRATCH_ENV»` to production (if the vendor supports it), or export the specific records and re-import into production. The cut-over choice is per-vendor — document yours below.
6. **Resume writes.** Any writes that happened during the outage may now need to be replayed (e.g. queued webhook events, queued payment processor events). Cross-ref [`RUNBOOK.md`](./RUNBOOK.md) for replay procedures per provider.
7. **Document.** Write the incident in [`DECISION_LOG.md`](./DECISION_LOG.md): what was lost, what was restored, total RTO, gap vs. `«RTO»` target, and one concrete improvement to this runbook.

### Per data class — `«DB_CMS»`

(One section per backed-up data store. Each names the exact restore command / dashboard path and the per-class smoke.)

- **Restore method.** «e.g. the vendor's point-in-time-restore via dashboard / CLI command / API call.»
- **Smoke after restore.** «e.g. count users; fetch a known user; count active subscriptions; run a read against the most recently-written collection.»
- **Known quirks.** «e.g. the vendor's restore creates a new cluster — connection URI changes; the app needs the new `«DB_URI»` before it can read the restored data.»

### Per data class — file uploads / object storage

- **Restore method.** «e.g. object-storage bucket versioning rollback or cross-region replica promotion.»
- **Smoke after restore.** «e.g. fetch a known file by URL; verify the file's content hash matches the pre-incident hash.»
- **Known quirks.** «e.g. CDN cache may still serve the pre-restore version — purge the CDN before declaring the restore complete.»

(repeat per data store on the inventory)

---

## Out-of-scope

What this runbook does **not** cover, and why each is acceptable to lose:

- **Source code.** Lives in git. Restored by `git clone`. If git is gone, you have a much bigger problem than this runbook addresses.
- **CDN assets / built artifacts.** Re-buildable from source. The build pipeline is the backup.
- **Session state / in-memory caches.** Users re-login; caches re-warm. Acceptable loss; not worth the backup cost.
- **CI logs / observability data older than the retention window.** Re-runnable; new events arrive constantly.
- **Locally-generated dev data.** Each developer's local DB is their problem; production backups don't restore dev data.

If a future feature changes one of these from "acceptable to lose" to "must be preserved," the answer is to add it to the inventory above — not to expand this section.

---

## Cross-references

- [`RUNBOOK.md`](./RUNBOOK.md) — the incident runbook. When a `«DB_CMS»` timeout or data-corruption incident fires, this backup runbook is the recovery path.
- [`MAINTENANCE.md`](./MAINTENANCE.md) — the cost / cadence monitoring checklist. Backup verification and the next drill date belong in the monitoring cadence.
- [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) — encryption-at-rest and access-control rules for `«BACKUP_DESTINATION»`. A backup that's readable by anyone with a leaked credential is a fresh attack surface.
- [`SECRETS_ROTATION.md`](./SECRETS_ROTATION.md) — rotating the encryption key or the storage access credential for `«BACKUP_DESTINATION»` requires special care; a rotated key that locks the team out of old backups is a self-inflicted incident.
- [`DECISION_LOG.md`](./DECISION_LOG.md) — restore drill outcomes, `«RTO»` gaps, and vendor-tier upgrade decisions land here.

---

## Anti-patterns

- **"We have backups."** Without a verified drill, this sentence is a hope, not a claim. The drill is what makes it true.
- **Restoring straight into production.** Almost never the right move. `«SCRATCH_ENV»` is the cheap insurance.
- **One-RPO-fits-all.** Treating analytics data and payment data the same way over-pays or under-protects — likely both.
- **Backing up everything to one destination.** A `«BACKUP_DESTINATION»` in the same region as the primary DB protects against record-level loss, not against region-level loss. Cross-region or cross-vendor for the data classes whose `«RTO»` requires it.
- **Skipping the drill because "we're too small."** The smaller the team, the more critical the runbook — there's no specialist to call.
- **Treating the drill as "done" when the restore completes.** The drill is done when a non-DRI could repeat it. If the runbook still needs "the DRI's tribal knowledge" to follow, it's not a runbook yet.
- **Letting `Last verified` go stale.** A 2-year-old verification date means the team is operating on the assumption that nothing has changed in 2 years. It has.
