# CMS_PROBE_SCHEDULED.md — the fail-open fallback needs a fail-loud probe

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_CMS_PROBE_SCHEDULED.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the scheduled GitHub Actions probe that pings the CMS on a schedule, so a silent outage the app's fail-open fallback masks does not go undetected for days. Companion to [`LANDING_SITE_TEMPLATE.md`](./LANDING_SITE_TEMPLATE.md) (where the fail-open fallback lives).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_CMS_PROBE_SCHEDULED` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the schedule + probe + issue-on-fail pattern is generic; only the CMS host and the query shape are per-repo.
>
> **Pairs with:** `RUNBOOK_LANDING_SITE_TEMPLATE.md` (the fallback this probes), `MANAGER_INCIDENT_RESPONSE.md` (where a probe failure escalates), `RUNBOOK_OBSERVABILITY.md` — boundary: this runbook owns *the probe*; the fallback that hides the outage is defined in the template runbook; incident-response takes over on failure.
>
> **Local definitions to provide per repo:**
> - `«CMS»` — the CMS being probed (`storyblok`, `sanity`, `payload`)
> - `«CMS_HOST»` — the API host (e.g. `api.storyblok.com`, `<project>.api.sanity.io`)
> - `«CMS_HEALTH_QUERY»` — a small, cheap query that exercises the actual read path (not just a ping)
> - `«PROBE_SCHEDULE»` — cron expression (default: `0 7 * * *` — daily at 07:00 UTC)

---

## 1. Why

A landing site with a Sanity/Storyblok/Payload backend typically ships with a **fail-open fallback**: if the CMS fetch fails, render the last successful copy (bundled JSON) rather than a 500. This is the right choice for uptime — the site stays up during a CMS outage.

But it means a CMS outage never surfaces at request time. Users see the page. Logs show 200s. The dashboard is green. And meanwhile, editors' new content is not landing, because the site is happily rendering the six-month-old fallback.

The probe is the fix: a scheduled GitHub Actions job that hits the CMS with a real read query, once a day, and opens an issue if the CMS is down. The probe is loud precisely because the app is quiet.

---

## 2. The workflow

```yaml
# .github/workflows/cms-probe.yml
#
# The site renders a bundled fallback when «CMS_HOST» is unreachable —
# see `docs/RUNBOOK_LANDING_SITE_TEMPLATE.md` §Fail-safe content layer.
# Because the fallback is invisible to users, a CMS outage doesn't page
# through normal monitoring. This job runs a real read against «CMS_HOST»
# on a schedule so we hear about the outage independently of the app's
# request path.
#
# On failure: opens a `cms-outage` issue and re-uses the same one across
# consecutive failures (no issue-storm). On recovery: closes the issue.

name: cms-probe

on:
  schedule:
    - cron: '«PROBE_SCHEDULE»'   # daily at 07:00 UTC
  workflow_dispatch:              # manual trigger for a quick verify

concurrency:
  group: cms-probe
  cancel-in-progress: false

permissions:
  issues: write
  contents: read

jobs:
  probe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Query «CMS»
        id: probe
        env:
          «CMS_ACCESS_TOKEN_ENV»: ${{ secrets.«CMS_ACCESS_TOKEN_ENV» }}
        run: |
          set +e
          RESP=$(curl -sS -o /tmp/body -w '%{http_code}' -H "Authorization: Bearer $«CMS_ACCESS_TOKEN_ENV»" \
            "«CMS_HEALTH_QUERY»")
          BODY=$(head -c 512 /tmp/body)
          echo "http_code=$RESP" >> "$GITHUB_OUTPUT"
          echo "body_head<<EOF" >> "$GITHUB_OUTPUT"; echo "$BODY" >> "$GITHUB_OUTPUT"; echo EOF >> "$GITHUB_OUTPUT"
          [[ "$RESP" =~ ^2 ]] || exit 1

      - name: Open / update issue on failure
        if: failure()
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          TITLE="cms-outage: «CMS_HOST» — ${{ github.run_id }}"
          BODY=$'CMS probe failed at $(date -u).\n\nHTTP: ${{ steps.probe.outputs.http_code }}\nBody head:\n```\n${{ steps.probe.outputs.body_head }}\n```\nRun: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}'
          EXISTING=$(gh issue list --label cms-outage --state open --json number --jq '.[0].number // empty')
          if [ -n "$EXISTING" ]; then
            gh issue comment "$EXISTING" --body "$BODY"
          else
            gh issue create --title "$TITLE" --body "$BODY" --label cms-outage
          fi

      - name: Close outage issue on recovery
        if: success()
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          for N in $(gh issue list --label cms-outage --state open --json number --jq '.[].number'); do
            gh issue comment "$N" --body "cms-probe green at $(date -u); closing."
            gh issue close "$N"
          done
```

Key properties:

- **`«CMS_HEALTH_QUERY»` exercises the real read path** — a query for a real slug that must return content. A liveness ping on the API root proves nothing; the CMS's project could be paused while the API host is up.
- **Concurrency `cancel-in-progress: false`** — a probe run doesn't cancel a previous still-running probe (unusual but correct: probe runs are non-idempotent).
- **One issue per outage**, not per run. The comment thread accumulates the failure history until recovery.
- **The probe closes its own issue on success** — the incident is self-clearing when the CMS comes back.
- **Rationale block at the top** (per `SKILL_RATIONALE_COMMENTS.md`) — the future PR that thinks "why do we have this if the site is fine?" reads the answer.

---

## 3. When to add this workflow

Add it to any repo where the app fetches from a CMS **and** falls back to bundled content on failure. Rule of thumb: if `grep -rn 'catch.*fallback\|catch.*inlineCopy' src/lib/` returns a hit, the probe is warranted.

Do NOT add it to a repo where the app hard-fails on CMS unavailability — the app itself is the probe there, and adding a scheduled job is redundant.

---

## 4. Extending

The pattern generalises to any read path with a fail-open fallback:

- **Analytics ingestion endpoint** — a scheduled `curl` verifies the endpoint accepts events.
- **Search index** — a scheduled query verifies the index still returns results.
- **Payment provider status** — a scheduled query of the provider's status page (or their API).

The workflow shape is the same; only the query and the failure-issue label change.

---

## 5. Anti-patterns

- **Probe against a liveness endpoint that doesn't hit the same read path as the app.** A `GET /` on the CMS host doesn't prove the project's content collection is readable.
- **Probe schedule under 30 minutes.** Diminishing returns; you're mostly measuring GitHub Actions availability.
- **Probe failure = a `notice`-level Slack ping.** The probe fails when nobody is looking; put the issue in `gh` so the next `gh issue list` catches it, and let notifications route from there.
- **A probe that doesn't close its own issue on recovery.** The issue stays open, the operator ignores it, the *next* probe failure looks like an existing incident.
- **A probe workflow with no rationale block.** See `SKILL_RATIONALE_COMMENTS.md`. This is the workflow that most looks deletable until you understand what it protects.

---

## 6. Verification checklist

- [ ] `.github/workflows/cms-probe.yml` exists with the shape above.
- [ ] `«CMS_HEALTH_QUERY»` returns real content, not a liveness ping.
- [ ] The workflow opens exactly one issue per outage (not one per run).
- [ ] The workflow closes the outage issue on recovery.
- [ ] A rationale block at the top of the file explains why the probe exists.
- [ ] The `cms-outage` label exists in the repo's label set.

## 7. Related

- The fallback this probes: [`LANDING_SITE_TEMPLATE.md`](./LANDING_SITE_TEMPLATE.md) §Fail-safe content layer
- Incident response on probe failure: [`MANAGER_INCIDENT_RESPONSE.md`](./MANAGER_INCIDENT_RESPONSE.md)
- Observability + alerting: [`OBSERVABILITY.md`](./OBSERVABILITY.md)
- Why the workflow's opening comment must survive housekeeping: `SKILL_RATIONALE_COMMENTS.md`

**Last reviewed:** «DATE»
