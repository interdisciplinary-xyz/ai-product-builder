# CI transient failure tolerance

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_CI_TRANSIENT_FAILURE_TOLERANCE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_CI_TRANSIENT_FAILURE_TOLERANCE.md`. **Additional install target:** `.claude/skills/ci-transient-failure-tolerance/SKILL.md`.
>
> **Reusability:** template-ready — the audit-retry loop, the LHCI pin, the prettier-alignment invariant and the advisory-vs-blocking distinction are portable verbatim; **fill the `«placeholders»`** with this repo's package manager, audit level, and floating dep version.
>
> **Pairs with:** `RUNBOOK_GITHUB_ACTIONS.md` (the CI implementation the retry lands in) and `RUNBOOK_RELEASE_MANAGER.md` (the cost-control policy the retry does *not* violate) — boundary: this skill owns **how to distinguish a real failure from a network flake**; the runbooks own **which jobs run and when**.
>
> **Owns / defers to:** Owns the retry, pin, and advisory patterns for network-dependent and version-drifting CI steps. Defers job scheduling and cost policy → `RUNBOOK_GITHUB_ACTIONS.md`; the audit finding itself (a real vuln) → `MANAGER_SECURITY.md`; the LHCI budgets → `MANAGER_PERFORMANCE.md`; the doctrine on tests that pass in both worlds → `SKILL_TESTS_THAT_CANNOT_FAIL.md`.
>
> **Local definitions to provide per repo:**
> - `«PKG_MGR»` — the package manager (e.g. `pnpm`, `npm`, `yarn`)
> - `«AUDIT_CMD»` — the audit command + its level flag (e.g. `pnpm audit --prod --audit-level=high`)
> - `«LHCI_VERSION»` — the last known-good pinned Lighthouse CI version (e.g. `0.13.0`)
> - `«PRETTIER_VERSION»` — the exact prettier version pinned across pre-commit and CI
> - `«INCIDENT_REF»` — how this repo cites the flaky-CI incidents that motivated the rule

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: ci-transient-failure-tolerance
description: >-
  npm registry socket timeouts, floating `@lhci/cli` patches, and drifting prettier
  versions between pre-commit and CI produce failures that are indistinguishable from
  real ones at the check-status level — turning green PRs red for reasons unrelated to
  the diff, and training the team to "just re-run it" until the next real failure gets
  re-run away too («INCIDENT_REF»; observed portfolio-wide across respect.click,
  fairtomorrow, empatalk-app during audit sweeps). Use when adding or reviewing any
  GitHub Actions step that hits the npm registry, runs `«PKG_MGR» audit`, invokes
  `@lhci/cli` / Lighthouse, or runs `prettier --check`; when a PR shows a red check
  whose logs blame `ECONNRESET`, `ETIMEDOUT`, `socket hang up`, `EAI_AGAIN`, "unable
  to fetch", or a formatting diff the local `prettier --write` produced no diff for.
  Especially fire when a diff adds an `npx @lhci/cli@0.13.x autorun` without a version
  pin, or an audit step without a retry loop. Defer to `RUNBOOK_GITHUB_ACTIONS.md` for
  branch triggers and job gating; this skill owns the RETRY/PIN/ADVISORY shape of
  network- and version-flaky steps.
---
```

---

## The damage

CI has three failure modes that look identical on the PR check card and are not the same failure:

1. **A real regression** — a vuln you added, a Lighthouse budget you broke, a formatting slip.
2. **A transient network flake** — npm registry socket hang-up, DNS blip, GitHub Actions runner cold-start.
3. **A version drift** — the CI's `prettier` disagrees with pre-commit's `prettier` about column alignment in a Markdown table, and the diff is entirely whitespace nobody edited.

All three flag as `❌ Failed`. Two of them are noise. The reflex fix — "re-run the job" — trains the team to re-run *every* red check, and the day a real failure gets re-run into green is the day a broken release ships.

This was «INCIDENT_REF» — observed portfolio-wide during the 17-repo docs-sweep: `pnpm audit` failed on `npmjs.org` socket timeouts on ~15% of runs; `@lhci/cli@0.13.x` shipped a patch that wedges on Chrome dev-server startup, killing an entire PR series for two days; and `docs/readme.md` PRs on multiple repos failed `prettier --check` for table alignment nobody had touched.

The blast radius is not the failed run. It is **the trust the team stops placing in the red X** — after which any real bug wearing the same colour ships.

## When to use

- Adding any step to a GitHub Actions workflow that touches the npm/pnpm/yarn registry.
- Reviewing a PR whose failing job logs contain `ECONNRESET`, `ETIMEDOUT`, `socket hang up`, `EAI_AGAIN`, `network timeout`, `unable to fetch` — including inside `«AUDIT_CMD»`, `«PKG_MGR» install`, or `«PKG_MGR» dlx`.
- Any Lighthouse / `@lhci/cli` invocation in CI — especially `npx @lhci/cli@X` (implicit `@latest`) or `@X.Y.x` (implicit patch bump).
- Any `prettier --check` step, when the local `prettier --write` produces no diff.
- Any diff that adds `continue-on-error: true` — verify it's advisory-by-design, not a shrug.
- Reviewing code that justifies itself with *"we just re-run it when it fails"* or *"the flake is rare."*

## The trap

### Trap 1 — a naked `«PKG_MGR» audit`

```yaml
# ❌ One socket timeout to the npm registry and the PR is red.
- name: Audit dependencies
  run: «AUDIT_CMD»
```

`«AUDIT_CMD»` reaches out to `https://registry.npmjs.org/-/npm/v1/security/audits`. That endpoint is not a nine-nines service. A single `ECONNRESET` mid-batch fails the step, fails the check, and re-running is the *only* path to green — which trains everyone that a red audit means "hit re-run."

### Trap 2 — floating `@lhci/cli` version

```yaml
# ❌ Every run picks whatever @lhci/cli@0.13.x published today.
- name: Lighthouse
  run: npx @lhci/cli@0.13.x autorun
```

`0.13.x` resolves to the latest patch — including `0.13.4`, which regressed dev-server startup and left the job hanging until the workflow's timeout killed it. The wedge is inside `@lhci/cli`; there is no repo-level fix, only a version pin.

### Trap 3 — implicit prettier version

```yaml
# ❌ CI uses `latest` prettier via corepack cache; pre-commit uses the pinned devDep.
- run: «PKG_MGR» exec prettier --check "**/*.md"
```

Combined with a pre-commit hook that runs `prettier --write` at whatever version the local devDep resolved to, the two rewrap Markdown tables differently. The diff on the failed CI run is columns of spaces nobody typed. Every PR carrying a table needs a "fix formatting" commit before it's green.

## The fix

### Fix 1 — retry `«AUDIT_CMD»` with bounded backoff

```yaml
# ✅ Five attempts, 30s apart. Real vulns still fail; the noise floor drops to zero.
- name: Audit dependencies (retry on transient network failure)
  run: |
    for attempt in 1 2 3 4 5; do
      echo "audit attempt $attempt"
      if «AUDIT_CMD»; then
        exit 0
      fi
      echo "attempt $attempt failed; sleeping 30s"
      sleep 30
    done
    echo "audit failed 5 times; treating as real"
    exit 1
```

Retry only what is legitimately transient. **A real audit finding (a CVE that matches your dependency tree) fails deterministically on every attempt** — the loop still fails and the check still goes red. What the loop absorbs is the socket-timeout class, which succeeds on attempt 2 or 3 and produces the correct result.

If you want the retry to be provably targeted at network errors (not any failure), grep the output:

```yaml
- name: Audit dependencies (network-flake-tolerant)
  run: |
    for attempt in 1 2 3 4 5; do
      out=$(«AUDIT_CMD» 2>&1) && { echo "$out"; exit 0; }
      echo "$out"
      if ! echo "$out" | grep -qE 'ECONNRESET|ETIMEDOUT|socket hang up|EAI_AGAIN|network timeout|Failed to fetch'; then
        echo "non-network failure — real"
        exit 1
      fi
      sleep 30
    done
    exit 1
```

### Fix 2 — pin `@lhci/cli` to `«LHCI_VERSION»`

```yaml
# ✅ Pinned to the last known-good patch. Explicit renovation only.
- name: Lighthouse
  run: npx @lhci/cli@«LHCI_VERSION» autorun
```

Or install into devDeps: `"@lhci/cli": "«LHCI_VERSION»"` — same effect, one file to bump.

**Do this even if the floating patch works today.** The reason to pin is that the *next* patch is one `npm publish` away, and the failure mode is a hang, not a message. A hang consumes the runner's full timeout budget before failing, which is more expensive than a clean crash — and it fails after the paid quality gate already ran, so the whole PR series eats minutes for nothing.

If pinning is not enough because the wedge is architectural (dev server startup, Chrome launch), wrap the whole Lighthouse job as **advisory** so it never blocks a merge:

```yaml
- name: Lighthouse (advisory — never blocks merge)
  timeout-minutes: 10
  continue-on-error: true          # <-- advisory
  run: |
    timeout 600 npx @lhci/cli@«LHCI_VERSION» autorun || {
      echo "::warning::Lighthouse advisory job did not finish — see run logs"
      exit 0
    }
```

`continue-on-error: true` is not a shrug when the job is **advisory by design** (§`MANAGER_PERFORMANCE.md` — perf gates ratchet in a separate workflow, not the PR path). It is the honest way to say *"this signal is worth having, but the root wedge is not fixed and blocking a merge on it is worse than shipping without it."*

### Fix 3 — align prettier explicitly across pre-commit and CI

Two independent fixes; do both:

```json
// package.json — pin the exact version, top-level devDep.
"devDependencies": {
  "prettier": "«PRETTIER_VERSION»"
}
```

```yaml
# ✅ CI uses the repo's pinned devDep, not a corepack-cached global.
- run: «PKG_MGR» install --frozen-lockfile
- run: «PKG_MGR» exec prettier --check "**/*.md" "**/*.{ts,tsx,json,yml,yaml}"
```

Then in the pre-commit hook (`.husky/pre-commit`, `.lintstagedrc`, or the equivalent) call the same binary:

```bash
# .husky/pre-commit — the same «PKG_MGR» exec binary, no bare `prettier`.
«PKG_MGR» exec prettier --write --list-different "**/*.md"
```

**Never invoke `prettier` bare** in either place — it resolves to whatever is on the PATH first, which is `npm-global`, corepack cache, or a Homebrew install, and drift is guaranteed. The `«PKG_MGR» exec` (or `pnpm exec` / `npx --no-install`) form pins to the repo's own devDep.

## What the naive fix still gets wrong

**1. Unbounded retries hide real failures.** A retry loop with 10+ attempts and long backoff turns a real audit failure into a 30-minute red check. Keep the ceiling low (five attempts, 30-second backoff, cap at ~3 min total). If you need longer, the underlying service is not just flaky — it is down, and blocking merges is the correct behaviour.

**2. `continue-on-error: true` on a *blocking* gate is a lie.** If the job is meant to gate merges (auth tests, e2e, secrets scan), `continue-on-error` turns the red X green with no signal to anyone. Use it *only* on jobs whose failure is advisory — Lighthouse, bundle-size trending, coverage delta — and document the choice in the job's `name` (`"Lighthouse (advisory)"`) so nobody clicking through the check-runs UI is fooled.

**3. Pinning to `@X` without a bump plan is the *previous* trap in slower motion.** A pinned `@lhci/cli@0.13.0` sitting in the repo for 18 months eventually breaks on a Node upgrade the CI matrix runs. Add a monthly renovate/dependabot bump PR for the pinned tool, gated on the same Lighthouse run — that is the cheap check that keeps the pin honest.

**4. A retry on the AUDIT is not a retry on `«PKG_MGR» install`.** The install step also hits the registry, and it *also* transiently fails. Retry install the same way — most Actions runners already retry package fetches internally, but `«PKG_MGR» install --frozen-lockfile` inside a workflow step is naked. If it flakes, wrap it in the same five-attempt loop.

**5. Prettier drift can also come from `.editorconfig` and `.prettierrc` disagreeing between the CI checkout and a local uncommitted config.** Verify with `«PKG_MGR» exec prettier --write --list-different` locally on the CI-checked-out ref — if it produces a diff, your local config is out of sync with the committed one, and the fix is to commit yours (or `git checkout HEAD -- .prettierrc`).

## The proof obligation — the failure must survive the retry loop

A retry loop is only a retry loop if the following test fails against it and passes against the naked version:

```bash
# ✅ Real vuln → retry loop still fails.
# Add a package with a known high-severity advisory and run the workflow.
# The audit fails on every attempt; the loop exits 1; the check goes red.

# ✅ Transient flake → retry loop passes; naked audit fails.
# Simulate the flake by wrapping `«AUDIT_CMD»` in a script that fails the first
# two attempts, succeeds the third:
attempt_file=$(mktemp)
echo 0 > "$attempt_file"
audit_wrapper() {
  n=$(cat "$attempt_file"); echo $((n+1)) > "$attempt_file"
  if [ "$n" -lt 2 ]; then
    echo "npm error network Socket timeout ECONNRESET" >&2
    return 1
  fi
  «AUDIT_CMD»
}
# The loop absorbs attempts 1–2 and passes on 3; the naked version fails on attempt 1.
```

If the transient case passes on the naked version, your test is not driving a flake — it is driving nothing. See [[tests-that-cannot-fail]].

Similarly, an LHCI pin's proof obligation is that the workflow points at an exact `x.y.z` — grep it:

```bash
grep -rE '@lhci/cli@\d+\.\d+\.(x|\d+)' .github/workflows/ package.json
# should print zero matches with `.x` — every occurrence is `@X.Y.Z`.
```

And prettier alignment: run the CI's `prettier --check` command locally, with the CI's binary resolution path:

```bash
«PKG_MGR» install --frozen-lockfile
«PKG_MGR» exec prettier --check "**/*.md"    # zero diffs = versions aligned
```

## Checklist

- [ ] Every `«AUDIT_CMD»` step in `.github/workflows/` is wrapped in a bounded (≤5) retry loop with 30s backoff.
- [ ] Every `@lhci/cli` invocation is pinned to an exact `x.y.z` — never `@X.Y.x`, `@latest`, or naked `npx @lhci/cli`.
- [ ] Lighthouse is marked `continue-on-error: true` **only** if the job is advisory by design; the name says so (`"Lighthouse (advisory)"`).
- [ ] `prettier` is pinned in `devDependencies` to `«PRETTIER_VERSION»`; pre-commit and CI both invoke it via `«PKG_MGR» exec prettier`, never bare.
- [ ] Retry loops on other network-dependent steps (`«PKG_MGR» install --frozen-lockfile`, `npm publish`) exist where the step has failed even once in the last quarter.
- [ ] No `continue-on-error: true` sits on a gate marked "required" in branch protection.
- [ ] Any pinned tool has a monthly bump PR scheduled (renovate / dependabot) to keep the pin honest.

## Related

- Incident / plan: «INCIDENT_REF» (17-repo portfolio sweep — audit flakes, LHCI wedge, prettier drift observed across ~10 repos)
- CI job scheduling and gating: `RUNBOOK_GITHUB_ACTIONS.md`
- Cost policy the retry loop lives under: `RUNBOOK_RELEASE_MANAGER.md` §3
- Perf budgets Lighthouse is measuring against: `MANAGER_PERFORMANCE.md`
- Real vuln resolution (the case a retry does NOT paper over): `MANAGER_SECURITY.md`
- The doctrine every proof obligation is judged by: [[tests-that-cannot-fail]] — `SKILL_TESTS_THAT_CANNOT_FAIL.md`
