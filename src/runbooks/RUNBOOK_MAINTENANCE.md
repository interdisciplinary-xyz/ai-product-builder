# Maintenance & Cost Analysis

Operational reference for monitoring costs, understanding free-tier limits, and planning for growth.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_MAINTENANCE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_MAINTENANCE.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the cost-table / free-tier-cliff / cost-per-action / monitoring-checklist structure is reusable; the services, prices, and usage projections are «placeholders». Re-cost against the repo's actual stack and localize the tokens below.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product this doc costs out.
> - `«SERVICE_LIST»` — the third-party services billed (e.g. an AI provider, a database, a payment provider, an auth provider, a host, an error monitor, CI, integrations, email, analytics) with their env vars.
> - `«AI_PROVIDER»` — model provider + env + models + per-call cost basis (e.g. OpenAI + an API key + the model names).
> - `«DB_CMS»` — database + tier limits (e.g. MongoDB Atlas free → paid tiers) + DB URI.
> - `«AUTH»` / `«PAYMENTS»` / `«EMAIL»` — auth MAU pricing, payment per-txn fee, email tiers, plus their env vars.
> - `«DEPLOY»` — hosting/build-minute billing (e.g. Vercel) + CI minutes (e.g. a CI provider + token).
> - `«USAGE_PROJECTIONS»` — the user-count phases, cost-per-action table, and storage projections (recompute per product).
> - `«QUALITY_CMD»` / build/test commands used in the pre-release checklist (e.g. format + lint + types + unit).
> - `«SMOKE_TESTS»` — the pre-release smoke-test scenarios (product-specific core flows).

---

## Third-Party Services That Generate Costs

| #   | Service       | What It Does          | Billing Model      | Env Var(s)      | Used By         |
| --- | ------------- | --------------------- | ------------------ | --------------- | --------------- |
| 1   | **`«Service»`** | «what it does»      | «per token/txn/…»  | `«ENV_VAR(s)»`  | «scope»         |
<!-- (one row per billed service — e.g. AI provider, database, payment provider, auth provider, host, error monitor, CI, integrations, email, analytics) -->

---

## Free-Tier Limits & Graduation Cliffs

### How much traffic can we handle for free?

(One row per service — its free tier, what you get, the cliff that breaks it, and where paid pricing starts. Fill with the repo's actual services and current prices.)

| Service       | Free Tier   | What You Get        | Cliff (What Breaks)   | Paid Tier Starts At  |
| ------------- | ----------- | ------------------- | --------------------- | -------------------- |
| **`«Service»`** | «free tier» | «limits»          | «what breaks at limit» | «paid pricing»      |
<!-- (one row per service) -->

### Graduation Scenarios

(Define growth phases by user count; for each, list the expected monthly cost and which services change. Keep the phase structure; replace the figures.)

#### Phase 1: «0-N Users» (Current)

**Expected monthly cost: «$range»**

| Service       | Status     | Notes              |
| ------------- | ---------- | ------------------ |
| `«Service»`   | «status»   | «note»             |
<!-- (one row per service) -->

#### Phase 2: «N-M Users»

**Expected monthly cost: «$range»**

| Service       | Change     | Action Required    |
| ------------- | ---------- | ------------------ |
| `«Service»`   | «change»   | «action»           |
<!-- (one row per service that changes; repeat the phase block for each growth phase) -->

---

## Cost Per User Action

Breakdown of what each user action costs in external API calls (one column per cost-driving service):

| User Action     | `«AI_PROVIDER»` | `«DB_CMS»`     | `«AUTH»` | Total Est.   |
| --------------- | --------------- | -------------- | -------------- | ------------ |
| **«action»**    | «calls/tokens»  | «reads/writes» | «auth ops»     | «~$est»      |
<!-- (one row per user-facing action; mark the cache-miss vs cache-hit variants of expensive AI actions separately) -->

### Key Insight

(Call out the most expensive action(s) and why — e.g. one-time-per-user AI generation that is cached on subsequent loads. Replace with this product's cost drivers.)

---

## `«AI_PROVIDER»` Usage Details

Typically the largest cost driver. List each distinct AI usage pattern:

| Consumer        | Model     | Max Tokens   | Trigger          | Calls Per Trigger   |
| --------------- | --------- | ------------ | ---------------- | ------------------- |
| `«Consumer»`    | `«MODEL»` | «N»          | «what triggers»  | «N (cached?)»       |
<!-- (one row per AI call site — note which are cached and which run per-request) -->

**Any dynamic token sizing:** Document the formula used to size token budgets for variable-size inputs (with min/max clamps), and which failures are never cached.

**Any lazy/on-demand generation:** Document any optimization where content is generated for one variant (e.g. locale) at a time and the rest on demand, plus the cost reduction vs. generating everything upfront.

**Monthly projection at «N users» («segment breakdown»):**

| Usage         | Calculation         | Est. Cost    |
| ------------- | ------------------- | ------------ |
| «usage type»  | «N × calls × $rate» | «~$est»      |
| **Total**     |                     | **«~$/mo»**  |
<!-- (one row per AI usage type) -->

**Note:** Flag which costs are one-time-and-cached vs. recurring, so the projection is honest.

---

## `«DB_CMS»` Storage Projection

(One row per data type stored; estimate size-per-record and records-per-user to project storage at scale.)

| Data Type      | Size Per Record | Records Per User | Per 1K Users   |
| -------------- | --------------- | ---------------- | -------------- |
| `«record»`     | «~KB»           | «N»              | «MB»           |
| **Total**      |                 |                  | **«~MB/1K»**   |
<!-- (one row per data type) -->

**The free tier («storage limit»)** supports approximately **«N users»** before the storage limit.

Note any earlier bottleneck (e.g. the free-tier max-connections cap) that bites before storage does.

---

## Monitoring Checklist

(Keep the weekly / monthly / before-release cadence; swap the service-specific checks for this repo's services.)

### Weekly

- [ ] Check `«DB_CMS»` storage usage
- [ ] Review `«AI_PROVIDER»` API usage and billing
- [ ] Review `«OBSERVABILITY»` error volume and unresolved issues
- [ ] Check `«PAYMENTS»` dashboard for failed payments and disputes
<!-- (one item per service to watch weekly) -->

### Monthly

- [ ] `«AUTH»` MAU count
- [ ] Hosting/CDN bandwidth
- [ ] CI minutes consumed
- [ ] Revenue + subscription metrics
- [ ] Email volume + bounce rate
<!-- (one item per service to watch monthly) -->

### Before Each Release

- [ ] Run full CI suite (`«QUALITY_CMD»` — format + lint + types + unit)
- [ ] Verify no new external service dependencies were added without documenting here
- [ ] Check that no secrets/API keys are committed in code

---

## Cost Optimization Opportunities

(One row per known lever. Strike through and mark ✅ Done once applied. Replace with this product's optimizations — common patterns: lazy/on-demand generation, caching expensive results, moving to a cheaper model, Redis-backed rate limiting, read caching.)

| Optimization     | Impact       | Effort      | When to Apply   |
| ---------------- | ------------ | ----------- | --------------- |
| `«optimization»` | «-X% / unlocks Y» | «Low/Med/High» | «phase/trigger» |
<!-- (one row per optimization opportunity) -->

---

## Smoke Test Checklist (Pre-Release)

Manual verification before code freeze. One row per core flow. Keep the generic scenarios that apply to any web app (homepage, registration, login, public/auth pages, payment checkout + webhook, billing portal, health endpoint, cookie consent, unauthenticated-API rejection) and add this product's feature-specific flows.

| #   | Scenario                  | Steps                  | Expected Result        |
| --- | ------------------------- | ---------------------- | ---------------------- |
| 1   | **`«scenario»`**          | «steps»                | «expected result»      |
<!-- (one row per smoke-test scenario — e.g. homepage loads, registration, social login, default plan, public page, payment checkout, payment webhook, billing portal, health endpoint (GET «HEALTH_ENDPOINT»), cookie consent, unauthenticated API returns 401) -->

---

## Portfolio-wide hygiene sweeps

For a solo owner of multiple repos (a portfolio of `«PORTFOLIO_REPOS»`), several failure
modes only surface when swept across the whole fleet — no single repo shows a problem, but
the aggregate rots. Run these sweeps on a **monthly** cadence (or after any period of intense
solo work — a scope cycle, a launch, a docs sweep).

### 1. Unassigned open PRs and issues

**The failure mode:** GitHub's default (unassigned + open) is not the neutral state — the
owner's `is:open assignee:@me` view is empty, notification filters don't fire, and merged
PRs' Co-Authored-By credit is missing. Over a 17-repo portfolio this compounds silently; one
sweep moved **4 PRs + 81 issues** to their real owner.

Full doctrine + script + proof obligation:
[`SKILL_PORTFOLIO_ASSIGNMENT_HYGIENE.md`](./SKILL_PORTFOLIO_ASSIGNMENT_HYGIENE.md).

Sweep loop (one-liner form; the skill has the full script):

```bash
for repo in «PORTFOLIO_REPOS»; do
  gh pr list --repo "$repo" --state open --json number,assignees \
    --jq '.[] | select(.assignees | length == 0) | .number' \
    | xargs -I{} gh pr edit {} --repo "$repo" --add-assignee «OWNER_HANDLE»
  gh issue list --repo "$repo" --state open --json number,assignees \
    --jq '.[] | select(.assignees | length == 0) | .number' \
    | xargs -I{} gh issue edit {} --repo "$repo" --add-assignee «OWNER_HANDLE»
done
```

Verify with the leak query:

```bash
gh search prs    --owner «ORG» --state=open --no-assignee | wc -l    # 0
gh search issues --owner «ORG» --state=open --no-assignee | wc -l    # 0
```

### 2. Stale local remote URLs

**The failure mode:** repos moved between orgs (`mdopieralski/hannajuszczak.pl` →
`interdisciplinary-xyz/hannajuszczak.pl`; `budget-receipts-app` → `savei`;
`mdopieralski/wearedope` → `interdisciplinary-xyz/interdisciplinary.xyz`;
`mdopieralski/neatual.com` → `interdisciplinary-xyz/neatual.com`) still push via GitHub's
redirect, so nothing breaks — but every `git push` prints a redirect notice, and scripts
that grep for the "canonical" remote URL misfire.

Fix per repo:

```bash
cd «REPO»
git remote -v
git remote set-url origin git@github.com:«ORG»/«REPO».git
```

Sweep across the portfolio (run from the parent directory holding all repos):

```bash
for repo in «PORTFOLIO_REPOS»; do
  cd "$repo" 2>/dev/null || continue
  current=$(git remote get-url origin 2>/dev/null || echo "")
  expected="git@github.com:«ORG»/$repo.git"
  if [ "$current" != "$expected" ]; then
    echo "$repo: $current → $expected"
    # Uncomment to auto-fix:
    # git remote set-url origin "$expected"
  fi
  cd - >/dev/null
done
```

### 3. Dependabot alerts on the default branch that block PRs

**The failure mode:** repos that gate PRs via a `check-audit-baseline.mjs`-style script
(observed on neatual.com) fail every new PR when a Dependabot alert appears on `main`, even
when the PR does not touch dependencies. The fix is either a `pnpm.overrides` patch on the
transitive dep (cheap) or a baseline regeneration (louder).

The `pnpm.overrides` pattern (observed on multiple repos — e.g. clearing GHSA-c83g-rgw3-j3cx
via `@sentry/nextjs > @sentry/bundler-plugin-core > @babel/core > @babel/helper-compilation-targets > browserslist`):

```json
{
  "pnpm": {
    "overrides": {
      "browserslist": ">=4.28.7"
    }
  }
}
```

Sweep for open Dependabot alerts across the portfolio:

```bash
for repo in «PORTFOLIO_REPOS»; do
  count=$(gh api "repos/«ORG»/$repo/dependabot/alerts?state=open" --jq 'length' 2>/dev/null || echo 0)
  [ "$count" -gt 0 ] && echo "$repo: $count open alert(s)"
done
```

Then for each hit: `gh api repos/«ORG»/«REPO»/dependabot/alerts?state=open --jq '.[].security_advisory.ghsa_id'`
and resolve via `pnpm.overrides` or a real dependency bump.

### 4. Case-duplicated files on case-insensitive filesystems

**The failure mode:** macOS and Windows can hold both `README.md` and `readme.md` as the same
inode; committing both produces a case-only diff that breaks on case-sensitive filesystems
(Linux CI). **Observed:** warszawskaakademiamalucha.pl had both.

Detect:

```bash
for repo in «PORTFOLIO_REPOS»; do
  cd "$repo" 2>/dev/null || continue
  dupes=$(git ls-tree -r HEAD --name-only | sort -f | uniq -di)
  [ -n "$dupes" ] && echo "$repo: case-duplicate: $dupes"
  cd - >/dev/null
done
```

Fix — canonicalise to a single case (README.md is the convention):

```bash
git mv readme.md README.md.tmp
git mv README.md.tmp README.md
git commit -m "chore: canonicalise README.md case"
```

### 5. Missing CI configuration

**The failure mode:** repos with no `.github/workflows/` show `no-checks` on every PR — no
gate, no signal, no confidence that anything ran. **Observed:** musinet, ai-product-builder
(before this scope). Not a bug per se, but worth flagging in the portfolio hygiene report
so the missing coverage is a *decision*, not an oversight.

Sweep:

```bash
for repo in «PORTFOLIO_REPOS»; do
  cd "$repo" 2>/dev/null || continue
  count=$(find .github/workflows -name '*.yml' -o -name '*.yaml' 2>/dev/null | wc -l | tr -d ' ')
  [ "$count" = "0" ] && echo "$repo: no CI workflows"
  cd - >/dev/null
done
```

### 6. Diverged docs branches

**The failure mode:** an aux docs branch (e.g. `docs/readme-template-fixes`) advances while
the canonical `docs/readme.md` sits stale — the merged PR ships the stale one, and the real
work is lost. **Observed:** craftwave.pl had `docs/readme.md` 14 commits behind
`docs/readme-template-fixes` at sweep time.

Fix — realign the canonical branch to whichever branch has the real work:

```bash
git fetch origin
git push --force-with-lease origin origin/docs/readme-template-fixes:docs/readme.md
git push origin --delete docs/readme-template-fixes
```

See [`RUNBOOK_RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) §1.1 for the docs-branch convention.

### Cadence

| Sweep                            | Cadence     | Time     |
|----------------------------------|-------------|----------|
| Unassigned PRs and issues        | Monthly     | ~5 min   |
| Stale remote URLs                | Quarterly   | ~5 min   |
| Dependabot alerts on `main`      | Weekly      | ~10 min  |
| Case-duplicated files            | Quarterly   | ~2 min   |
| Missing CI configuration         | Quarterly   | ~2 min   |
| Diverged docs branches           | Monthly     | ~5 min   |

Commit the sweep output (or a summary) to a `docs/hygiene-sweeps/YYYY-MM.md` log as evidence
the sweeps happened — the log is the artifact, the empty leak-query is the proof.

