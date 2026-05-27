# Email deliverability — DNS, inbox matrix, remediation

End-to-end workflow for landing transactional + lifecycle email in the **inbox** (not spam, not Promotions, not Junk) across the major consumer inbox vendors. Run this **once** when standing up a new sending domain, and **re-run §2 + §3** whenever the email layer is materially changed (new template, new sender identity, DKIM rotation, DMARC tightening).

Companion to [`RUNBOOK_EMAILS_WORKFLOW.md`](./RUNBOOK_EMAILS_WORKFLOW.md) (catalog + send wrappers + test entry-points).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_EMAIL_DELIVERABILITY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_EMAIL_DELIVERABILITY.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the DNS prereqs (SPF/DKIM/DMARC) and the per-vendor inbox-placement matrix are generic. The provider-specific click-path in §1 changes per `«EMAIL_PROVIDER»` and DNS-host UI; everything else is portable.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product whose email is being verified.
> - `«EMAIL_PROVIDER»` — transactional vendor (e.g. Resend, Postmark, SendGrid).
> - `«EMAIL_REGION»` — region selection if the provider asks (closest to user base).
> - `«DOMAIN»` — apex sender domain.
> - `«DNS_HOST»` — DNS registrar/host (Vercel DNS, Cloudflare, Route53, etc.).
> - `«EMAIL_API_KEY»` — env var holding the provider key.
> - `«EMAIL_SEND_ROUTE»` — internal test-send route (see EMAILS_WORKFLOW).
> - `«DELIVERABILITY_SCRIPT»` — the inbox-matrix harness (e.g. `scripts/email-deliverability-test.ts`).
> - `«TEMPLATE_LIST»` — the canonical list of `type` values in `«EMAIL_SCHEMA»` (the rows of the matrix).
> - `«INBOX_VENDORS»` — the inbox vendors you target (default: Gmail, Outlook, iCloud, Proton).

---

## §1 — DNS prerequisites (one-time per sending domain)

> **Time:** ~30 min hands-on + 5–60 min DNS propagation.
> **Until this is done:** the send route returns 200 from validation and the provider returns "domain not verified" downstream. **Every send silently fails closed** (lands in the error monitor with `domain: 'email'`). No production usefulness without this step.

### What "verified" means

Receivers need to verify three things before email lands in the inbox:

1. **DKIM** — cryptographic signature on every send. Receivers verify the signature against your DNS to confirm the message wasn't tampered with. The provider gives you 1–3 CNAMEs (or TXT, depending on vendor) to add.
2. **SPF** — DNS TXT record listing the IP ranges allowed to send "from" your domain. The provider's sending IPs.
3. **DMARC** — DNS TXT record telling receivers what to do when DKIM/SPF fail (`p=none` = monitor only, `p=quarantine` = spam folder, `p=reject` = hard bounce). Start at `p=none` until DKIM/SPF alignment is verified by 1–2 weeks of clean reports.

Without all three, Gmail punishes you; iCloud and Outlook are stricter still.

### Prerequisites

- [ ] `«EMAIL_PROVIDER»` account exists + you're logged in.
- [ ] You have access to DNS records for the apex `«DOMAIN»` via `«DNS_HOST»`.
- [ ] `«EMAIL_API_KEY»` is already populated (existing — confirmed working in dev).

### Step 1.1 — Add the domain in `«EMAIL_PROVIDER»`

1. In the provider dashboard → Domains → **Add Domain**.
2. Enter the apex `«DOMAIN»`.
3. Region: pick the one closest to your user base (`«EMAIL_REGION»`).
4. Confirm. The provider now shows a list of DNS records to add.

### Step 1.2 — Copy the records the provider shows you

Typical record set (exact values vary per provider/region/account):

| Record | Name                            | Value (example)                                 | TTL  |
| ------ | ------------------------------- | ----------------------------------------------- | ---- |
| MX     | `send.«DOMAIN»`                 | `feedback-smtp.«REGION».«provider».com`         | Auto |
| TXT    | `send.«DOMAIN»`                 | `v=spf1 include:«provider-spf».com ~all`        | Auto |
| TXT    | `«key-selector»._domainkey.«DOMAIN»` | `p=...` (long DKIM key)                    | Auto |

> **Copy values from the dashboard, NOT from a runbook.** Don't trust copy-paste from documentation for cryptographic material.

### Step 1.3 — Add records to `«DNS_HOST»`

For each provider-shown record:

1. Open `«DNS_HOST»` → DNS panel for `«DOMAIN»`.
2. Add record: pick the type (MX / TXT / CNAME), paste the name (the panel typically strips the apex automatically), paste the value.
3. Save.

> **If `«DNS_HOST»` is Cloudflare:** disable the orange-cloud proxy for the DKIM record. The proxy breaks DKIM.

### Step 1.4 — Verify in `«EMAIL_PROVIDER»`

1. Back in the provider dashboard → Domains → click `«DOMAIN»` → **Verify**.
2. The provider checks DNS — usually resolves in seconds-to-minutes once records propagate.
3. Each record turns green when valid: ✅ MX, ✅ SPF, ✅ DKIM.
4. Domain status flips to **Verified**.

If verification fails:

- Wait 5–15 min for DNS propagation, click **Verify** again.
- `dig TXT «key-selector»._domainkey.«DOMAIN»` from terminal — should return the DKIM key. If empty, DNS hasn't propagated.
- Cloudflare proxy on for the DKIM record? Disable it.
- Wrong region? If the provider account uses a different region than the records you added, the DKIM key won't match.

### Step 1.5 — Add DMARC (recommended)

Once DKIM + SPF are green, add a DMARC record. Start permissive:

- Type: `TXT`
- Name: `_dmarc.«DOMAIN»`
- Value: `v=DMARC1; p=none; rua=mailto:«dmarc-reports@«DOMAIN»»;`

This makes receivers send you weekly aggregate reports — use them to confirm alignment before tightening. After 1–2 weeks of clean reports, raise to `p=quarantine` (failures → spam folder), then `p=reject` (hard fail).

### Step 1.6 — Sanity-check the pipeline

Fire one real email:

```bash
curl -s -X POST "$BASE«EMAIL_SEND_ROUTE»" \
  -H "content-type: application/json" \
  -H "«auth header»" \
  -d '{"type":"«welcome-template»","to":"<your-real-inbox>","«other required fields»":"..."}' \
  | jq
```

Expected:

```json
{ "success": true, "id": "«provider-message-uuid»" }
```

Then:

1. Open the inbox within 30s — email visible in **Inbox** (not Promotions, not Spam).
2. Cross-check the provider's Logs panel — send recorded.
3. Open the email — brand mark, link, footer all render.
4. Click a CTA — confirm destination + any UTM tags.

---

## §2 — Inbox-placement matrix

Once §1 shows ✅ Verified, run the matrix: every template × every target inbox vendor.

### Pre-create test inboxes (one-time)

Pre-create one test address per vendor in `«INBOX_VENDORS»` (typical defaults: Gmail / Outlook / iCloud / Proton). Names don't matter — `«PROJECT»-test@gmail.com` works.

### Run the deliverability script

```bash
«PKG_MGR» tsx «DELIVERABILITY_SCRIPT» \
  --emails a@gmail.com,b@outlook.com,c@icloud.com,d@proton.me \
  --base-url «BASE_URL»
```

The script loops every `type` in `«EMAIL_SCHEMA»` × every inbox. Total sends = `|«TEMPLATE_LIST»| × |«INBOX_VENDORS»|`.

### Walk each inbox manually within ~30 minutes

(Faster the better — spam triggers escalate as time passes without engagement.)

### Matrix template — repeat per inbox vendor

| Template          | Arrived | In **INBOX** (not Promotions / Spam) | Renders correctly | Links work |
| ----------------- | ------- | ------------------------------------ | ----------------- | ---------- |
| `«template-1»`    | [ ]     | [ ]                                  | [ ]               | [ ]        |
| `«template-2»`    | [ ]     | [ ]                                  | [ ]               | [ ]        |
| `«template-N»`    | [ ]     | [ ]                                  | [ ]               | [ ]        |

(one row per template in `«TEMPLATE_LIST»»; repeat the whole table per vendor in `«INBOX_VENDORS»»)

Total cells per pass: `|«TEMPLATE_LIST»| × |«INBOX_VENDORS»| × 4 columns`.

> **For Outlook:** check **both** Outlook on the web AND the Outlook desktop client — rendering can diverge. Same for Gmail iOS vs Android if mobile is a key surface.

After all cells are checked:

- [ ] If any cell failed: file an issue + fix BEFORE the next launch milestone. Don't open the doors with a broken email path.
- [ ] Record the pass in the release/launch doc.

---

## §3 — Common-failure remediation

| Symptom                                       | Likely cause                                                                          | Fix                                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gmail **Promotions** tab                      | Content-triggered (too many CTAs, image-heavy, "buy / sale / pricing" words in subject) | Audit subject lines; reduce link density; add a plain-text fallback; reduce image-to-text ratio.                                                     |
| Outlook **Junk**                              | Sender-reputation low (new domain)                                                    | Wait — domain warm-up takes 2–3 weeks of consistent low-volume legitimate sending. Or use the provider's sandbox sender during warm-up.              |
| iCloud rejects with bounce                    | DKIM mismatch                                                                         | Re-check provider DKIM records; iCloud is the strictest of the major vendors.                                                                        |
| Proton accepts but flags as "Suspicious"      | DMARC policy too loose, or new sender                                                 | Tighten DMARC to `p=quarantine`; add to Proton's allowed-sender list manually if testing.                                                            |
| Email arrives but renders as raw HTML         | Template rendering failure                                                            | Check the local email-preview tool (e.g. `«PKG_MGR» preview-emails` if configured) or the provider dashboard's preview.                              |
| Provider 5xx on every send                    | Domain not verified, or API key expired/rotated                                       | Re-walk §1.4; check `«EMAIL_API_KEY»` validity in the provider dashboard.                                                                            |
| `dig TXT` shows empty DKIM record             | DNS not propagated, or wrong subdomain entered at `«DNS_HOST»`                        | Wait 15 min; re-check the subdomain name (the provider expects the subdomain part **only**, not the apex).                                           |
| Verified domain shows "DKIM failed" on send   | Cloudflare orange-cloud proxy on the DKIM record                                      | Disable proxy for that record; wait 5 min; re-verify.                                                                                                |

### Ongoing maintenance

- **Provider Logs** — daily check during launch. Watch bounces, complaints, suppression list growth.
- **Provider Suppressions** — addresses that bounced or complained. Wire the bounce/complaint webhook to flag the corresponding user record so cron jobs skip them.
- **DKIM rotation** — if the provider rotates DKIM keys (rare), they typically email 30 days ahead with new records. Update DNS, wait propagation, remove the old record.

## What this workflow does NOT cover

- HTML / plain-text rendering parity (useful but adds many more cells — defer unless deliverability fails systematically).
- Locale-specific rendering across language variants of the same template (defer unless locales diverge in template logic).
- Mobile email-client differences beyond Gmail/Outlook web (Gmail iOS vs Apple Mail vs Outlook Android) — defer until users complain.

## Cross-references

- [`RUNBOOK_EMAILS_WORKFLOW.md`](./RUNBOOK_EMAILS_WORKFLOW.md) — catalog, send wrappers, fail-closed pattern.
- [`MAINTENANCE.md`](./MAINTENANCE.md) — pre-release smoke (deliverability is a smoke-blocker).
