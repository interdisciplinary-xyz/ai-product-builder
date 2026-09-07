# Portfolio assignment hygiene

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_PORTFOLIO_ASSIGNMENT_HYGIENE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_PORTFOLIO_ASSIGNMENT_HYGIENE.md`. **Additional install target:** `.claude/skills/portfolio-assignment-hygiene/SKILL.md`.
>
> **Reusability:** template-ready — the sweep script, the unassigned-filter grep, and the bulk-assign command are portable verbatim; **fill the `«placeholders»`** with this owner's GitHub handle and the portfolio's repo list.
>
> **Pairs with:** `RUNBOOK_MAINTENANCE.md` (the hygiene-sweeps section this skill's script feeds) and `RUNBOOK_RELEASE_MANAGER.md` (the assignee is who the release PR is *addressed to*) — boundary: this skill owns **who owns each open thread**; the runbooks own the release and cost work the ownership routes.
>
> **Owns / defers to:** Owns unassigned PRs and issues across a multi-repo portfolio owned by one human. Defers per-issue triage / labels → `MANAGER_PROJECT.md`; team-scale round-robin assignment → the repo's own CODEOWNERS (this skill assumes **one owner**, portfolio-wide); the release-line PR title convention → `RUNBOOK_RELEASE_MANAGER.md` §1.
>
> **Local definitions to provide per repo (or once in the org):**
> - `«OWNER_HANDLE»` — the GitHub handle every unassigned thread should default to (e.g. `mdopieralski`)
> - `«PORTFOLIO_REPOS»` — the org/repo list the sweep runs against (typically an org's `gh repo list <org>` filtered to the owned set)
> - `«INCIDENT_REF»` — how this owner cites the miss that motivated the rule (e.g. "sweep 2026-09 moved 4 PRs + 81 issues")

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: portfolio-assignment-hygiene
description: >-
  A PR with no assignee is a PR with no owner — GitHub's default (unassigned + open)
  is the failure mode, not the neutral state. Over a 17-repo solo portfolio this
  compounds silently: notifications never route through the assignee filter, the
  weekly "what's on my plate" view is empty, and merged PRs' Co-Authored-By credit
  is missing («INCIDENT_REF»; one sweep moved 4 PRs + 81 issues to their real owner).
  Use when opening any new PR or issue on a repo you own; when doing any weekly or
  monthly portfolio triage; when reviewing a batch of `gh pr list` / `gh issue list`
  output that omits the `--assignee` filter; or when someone says "I forgot I had
  that open" or "why didn't I get notified". Especially fire after a `gh pr create`
  invocation that did not pass `--assignee «OWNER_HANDLE»`. Defer to CODEOWNERS for
  team round-robin; this skill owns SOLO portfolio ownership hygiene.
---
```

---

## The damage

`gh pr create` and `gh issue create` default to **no assignee**. On a repo with a team, CODEOWNERS or GitHub's auto-assignment fills the gap. On a **solo-owned portfolio** (17 repos, one human), nothing does — and the failure mode of an unassigned open thread is invisible:

- The owner's `Assigned to you` view is empty, so the weekly "what am I working on" pass misses it.
- The `is:open assignee:@me` GitHub search does not return it, so the *"nothing on my plate today"* signal is a lie.
- Notification filters keyed on `assignee` never fire.
- Merged commits' `Co-Authored-By` metadata drops the assignee's linkage to the credit graph.
- The next person to look at the repo (future-you, in six months) sees an open PR from three months ago and cannot tell whether *anyone* is looking at it.

This was «INCIDENT_REF» — one portfolio-wide sweep across `«PORTFOLIO_REPOS»` (respect.click, empatalk-app, savei, fairtomorrow, and 13 others) moved **4 PRs and 81 issues** to their real owner. The blast radius was not the four PRs. It was the **three months during which the owner did not know they existed**.

## When to use

- Immediately after `gh pr create` or `gh issue create` on any repo in the portfolio, if the command did not pass `--assignee`.
- Any `gh pr list` / `gh issue list` invocation that produces suspiciously few results (`assignee:@me` filter hiding the unassigned backlog).
- The weekly / monthly portfolio triage pass (see `RUNBOOK_MAINTENANCE.md`).
- Reviewing a portfolio-wide script that walks repos — verify every open thread has an assignee before deciding *"nothing to do."*
- Reviewing code that justifies itself with *"I'll assign it when I get to it"* — you get to it via the assigned view, so it never happens.

## The trap — a `gh pr create` that leaves the assignee blank

```bash
# ❌ Merges cleanly, sits open forever, invisible to `is:open assignee:@me`.
gh pr create \
  --repo interdisciplinary-xyz/«REPO» \
  --base main \
  --head scope/v0.4.0 \
  --title "«PROJECT» - scope/v0.4.0" \
  --body "…"
```

No `--assignee`. GitHub's default is *no assignee*. The PR exists, the PR CI runs, and the PR is not on any of the owner's "open work" views.

Repeat this 4 times a month across 17 repos and the queue silently grows into the tens.

## The fix — every open thread has an assignee, and one sweep re-attaches the ones that already leaked

### Fix 1 — bake `--assignee «OWNER_HANDLE»` into every `gh pr create`

```bash
# ✅ Assigned at birth. Shows up in `is:open assignee:@me` from the first minute.
gh pr create \
  --repo interdisciplinary-xyz/«REPO» \
  --base main \
  --head scope/v0.4.0 \
  --assignee «OWNER_HANDLE» \
  --title "«PROJECT» - scope/v0.4.0" \
  --body "…"
```

Same rule for `gh issue create`:

```bash
gh issue create --repo interdisciplinary-xyz/«REPO» --assignee «OWNER_HANDLE» --title "…" --body "…"
```

If the portfolio uses a template runbook for opening PRs (see `RUNBOOK_RELEASE_MANAGER.md`), fold `--assignee «OWNER_HANDLE»` into the copy-paste block there so the default flow is safe.

### Fix 2 — the portfolio-wide sweep

Run this on a weekly cadence (or after any period of intense solo work — a scope cycle, a launch, a docs sweep):

```bash
#!/usr/bin/env bash
# portfolio-assignment-sweep.sh
# For each repo, assign every unassigned open PR and issue to «OWNER_HANDLE».
set -euo pipefail

OWNER=«OWNER_HANDLE»                                        # e.g. mdopieralski
REPOS=(«PORTFOLIO_REPOS»)                                   # e.g. respect.click empatalk-app savei …

prs_assigned=0
issues_assigned=0

for repo in "${REPOS[@]}"; do
  echo "== $repo =="

  # PRs: `--json assignees` returns [{login:…}] per PR; filter for zero-length.
  prs=$(gh pr list --repo "$repo" --state open --json number,assignees \
        --jq '.[] | select(.assignees | length == 0) | .number')

  for n in $prs; do
    echo "  PR  #$n → $OWNER"
    gh pr edit "$n" --repo "$repo" --add-assignee "$OWNER"
    prs_assigned=$((prs_assigned + 1))
  done

  # Same shape for issues.
  issues=$(gh issue list --repo "$repo" --state open --json number,assignees \
           --jq '.[] | select(.assignees | length == 0) | .number')

  for n in $issues; do
    echo "  issue #$n → $OWNER"
    gh issue edit "$n" --repo "$repo" --add-assignee "$OWNER"
    issues_assigned=$((issues_assigned + 1))
  done
done

echo
echo "assigned $prs_assigned PRs, $issues_assigned issues"
```

Save under `.claude/scripts/portfolio-assignment-sweep.sh` (see `MANAGER_MAINTENANCE`'s script inventory). Run it monthly; commit its output as evidence that the sweep happened.

### Fix 3 — verify from the assignee side

The sweep works only if the owner's view is empty *after* it runs:

```bash
# The "what's actually on my plate" query. Should equal your real WIP.
gh search prs --owner interdisciplinary-xyz --state=open --assignee=«OWNER_HANDLE»
gh search issues --owner interdisciplinary-xyz --state=open --assignee=«OWNER_HANDLE»
```

And the inverse — the "did anything leak" query. Should return nothing:

```bash
# Any open PR/issue on an owned repo, without an assignee.
gh search prs --owner interdisciplinary-xyz --state=open --no-assignee
gh search issues --owner interdisciplinary-xyz --state=open --no-assignee
```

If the second pair returns rows, the sweep script missed a repo — usually because `«PORTFOLIO_REPOS»` is out of date. Regenerate it:

```bash
gh repo list interdisciplinary-xyz --limit 200 --json name --jq '.[].name'
```

## What the naive fix still gets wrong

**1. Auto-assign on PR creation is only half.** A PR opened by another human (a contributor, a bot, a dependabot upgrade) does not carry your `--assignee`. The weekly sweep is what catches those; do not skip it because "I always pass `--assignee` now."

**2. Assigning-yourself does not fix issues opened by others.** GitHub issues opened by outsiders (users, GitHub's dependabot, `gh issue create` from another machine you forgot to configure) default unassigned. The sweep catches them; individual discipline does not.

**3. `--assignee @me` uses the token's user — verify it is the owner's, not a bot's.** In CI, `gh` runs as `github-actions[bot]` unless the token is the owner's own PAT. `--assignee @me` in a workflow assigns to a bot account nobody watches. Use `--assignee «OWNER_HANDLE»` explicitly — even from `@me` contexts.

**4. Sweeping every issue to the owner erases legitimate other-assignees.** The `select(.assignees | length == 0)` filter is the safeguard — it only touches threads with **zero** assignees. Do not "improve" the script to overwrite an existing assignee; that is the shape that would erase a co-maintainer's ownership silently.

**5. The sweep is not a substitute for triage.** Assigning yourself to 81 issues does not mean you will do 81 issues. The sweep's purpose is *visibility* — after which real triage (close, defer, label, prioritise) happens in `MANAGER_PROJECT.md` or the equivalent. An assigned-but-untriaged pile is still a problem, just a *seen* one.

## The proof obligation — the "did anything leak" query returns zero rows

Run the sweep, then run the leak query:

```bash
gh search prs --owner interdisciplinary-xyz --state=open --no-assignee | wc -l    # 0
gh search issues --owner interdisciplinary-xyz --state=open --no-assignee | wc -l # 0
```

If either is non-zero, the sweep did not cover the repo. Either `«PORTFOLIO_REPOS»` is stale, or the repo lives in a different org — regenerate the list and re-run.

Then verify the *positive* signal: the owner's `is:open assignee:@me` view now matches the sweep's output count.

```bash
gh search prs --owner interdisciplinary-xyz --state=open --assignee=«OWNER_HANDLE» | wc -l
# Should be ≥ the number the sweep just assigned; the deficit is the pre-existing baseline.
```

A sweep that runs and leaves the leak query non-zero is a sweep that did nothing — the shape [[tests-that-cannot-fail]] warns about.

## Checklist

- [ ] Every `gh pr create` and `gh issue create` in the portfolio's documented flows passes `--assignee «OWNER_HANDLE»` explicitly (not `@me`).
- [ ] `«PORTFOLIO_REPOS»` is regenerated at least once per quarter from `gh repo list <org>`.
- [ ] A portfolio sweep script exists at `.claude/scripts/portfolio-assignment-sweep.sh` (or repo-appropriate location) and is run at least monthly.
- [ ] The leak query (`gh search … --no-assignee`) returns zero after each sweep.
- [ ] The sweep never overwrites an existing assignee — it only touches `assignees.length == 0`.
- [ ] The `--assignee` in workflow-triggered PR creation is the owner's handle, not `github-actions[bot]`.
- [ ] After the sweep, the owner's `is:open assignee:@me` view is used as the *primary* work queue (not `is:open` unfiltered).

## Related

- Incident / plan: «INCIDENT_REF» (portfolio sweep — 4 PRs + 81 issues re-assigned)
- Portfolio-wide hygiene sweeps (this is one; the runbook lists the others): `RUNBOOK_MAINTENANCE.md` — "Portfolio-wide hygiene sweeps"
- Release PR title convention (assigned PRs still need the right title): `RUNBOOK_RELEASE_MANAGER.md` §1
- Team-scale ownership (out of scope for this skill): CODEOWNERS + the repo's own review policy in `MANAGER_CONTRIBUTING.md`
- Testing doctrine: [[tests-that-cannot-fail]] — a sweep that leaves the leak query red is not a sweep
