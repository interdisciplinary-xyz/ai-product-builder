---
description: Audit application performance — client bundle size, PageSpeed/Core Web Vitals, unused dependencies, and backend query/index hygiene. Meant to run every 1–2 weeks.
allowed-tools: Bash, Read, Grep, Glob, Write
---

# Performance Audit

> **🔧 Reuse & local setup**
>
> Canonical copy — vendored at `docs/ai-product-builder/commands/audit-performance.md` (source of truth template). To activate as a slash command: copy to `.claude/commands/audit-performance.md` and fill the `«placeholders»`.
>
> **Reusability:** template-ready — the shape (bundle → vitals → hygiene → DB) is generic; the greps + baselines are per repo.
>
> **Pairs with:** `MANAGER_PERFORMANCE.md` (the playbook that defines CWV + bundle budgets) and `RUNBOOK_WEB_VITALS_AUDIT.md` (the audit-record template).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - Package manager + sub-commands — `«PKG_MGR»`, `«BUILD_CMD»`, `«QUALITY_CMD:analyze»` (bundle treemap), `«QUALITY_CMD:test-performance»` (Lighthouse/PSI gate).
> - Observability + trace path — `«OBSERVABILITY»` (e.g. Sentry Performance) + the runtime trace-init path (e.g. `«DOMAIN_PATHS»/../lib/sentry/init.ts`).
> - Framework Image primitive — `«FRAMEWORK_IMAGE»` (e.g. `next/image`) that should replace raw `<img>`.
> - Client / server split markers — client-boundary directive (e.g. `'use client'`), dynamic-import primitive (e.g. `next/dynamic`).
> - Domain paths — `«DOMAIN_PATHS»` for greps.
> - `«DB_CMS»`-specific patterns — `«DB_FIND_PATTERN»` (find-call signature to check for unbounded queries, e.g. `payload\.find\(\{|prisma\.\w+\.findMany\(\{|mongoose\.Model\.find\(\{`), `«HOT_COLLECTION_PATHS»` (collection config files that host hot query fields), `«HOT_FIELDS_RE»` (regex naming the hot fields to verify indexed, e.g. `members|slackWorkspaceId|email`).
> - Grep-exclude regexes — `«RAW_IMG_EXCLUDE_RE»` (paths where `<img>` is legitimate, e.g. `\.test\.|design-system-page|video-framework`), `«HEAVY_DEPS_RE»` (project-specific heavy libs to flag beyond the built-ins), `«HEAVY_DEPS_ALLOWLIST_RE»` (paths where those libs are OK, e.g. `video-framework/|demo-video|api/docs|\.test\.`).
> - PSI gate env vars, if used — `«PSI_ENV»` (e.g. `PAGE_SPEED_INSIGHTS_API_KEY`), tunnel env if the app needs external reachability.
> - Per-invocation — `«DATE»` (report filename suffix). Inline-fill (per-occurrence): `«n_kb»` (record your bundle baseline the first time).

Periodic health check on both halves of app performance: the **client** (bundle weight, Core Web Vitals) and the **backend** (DB index coverage, unbounded queries). Catches the regressions that accrue silently — a heavy dependency added to a shared chunk, a new hot query on an unindexed field.

**What already exists in most well-scaffolded repos (run/reference, don't duplicate):**

- **Lighthouse/PSI** → `«PKG_MGR» «QUALITY_CMD:test-performance»` gates Performance / SEO / Best-Practices / LCP thresholds. Usually **narrow coverage** (homepage-only, desktop-only) — flag the coverage gap every run.
- **Bundle analyzer** → `«PKG_MGR» «QUALITY_CMD:analyze»` opens the treemap.
- **Runtime truth** → `«OBSERVABILITY»` performance tracing (typical `tracesSampleRate: 0.1` in prod). p75 route latency + slow transactions live there — the ground truth this static audit can't see.

Do **not** auto-fix. Surface findings ranked by severity, then offer to address them.

## Steps

### 1. Client bundle weight (the core deterministic signal)

Run the production build and read the per-route table it prints (First Load JS per route + the shared baseline):

```bash
«PKG_MGR» «BUILD_CMD» 2>&1 | tee /tmp/perf-build.log
# shared baseline + heaviest routes
grep -nE "First Load JS shared|middleware" /tmp/perf-build.log
grep -E "^[├└┌│ ]*[ƒ○●] " /tmp/perf-build.log | sort -t' ' -k0 | tail -30   # route rows; eyeball the kB column
```

Record: **shared First Load JS** (kB), the **heaviest routes**, and any route whose First Load JS is notably above the shared baseline. Flag growth vs the previous audit. (Fill your baseline the first time you run this — e.g. `shared ≈ «n_kb» kB`.) If the tree is dirty with parallel-session WIP, note that the numbers include it — a clean-branch build is the attributable one.

### 2. Core Web Vitals / PageSpeed Insights

Run the real Lighthouse gate if the environment allows, else fall back to the last CI result:

```bash
# Needs the PSI env vars set + a running server. Locally these are usually absent →
# the script typically self-skips with a notice; that's fine, record "skipped".
«PKG_MGR» «QUALITY_CMD:test-performance»
```

Record the four scores (or "skipped — ran in CI on the last PR"; pull them from the workflow run if so). **Coverage gap to flag every run:** most PSI gates measure **only `/`, desktop-only**. High-traffic routes with zero vitals coverage — pricing, key funnel steps, profile pages, blog — and mobile (unmeasured) are the real blind spot. Recommend widening the PSI URL set + adding a mobile strategy; that's a bigger change than this audit makes, so surface it as a standing gap. See `RUNBOOK_WEB_VITALS_AUDIT.md`.

### 3. Client-surface hygiene

```bash
# raw <img> (should be «FRAMEWORK_IMAGE» for automatic sizing/lazy/format) — exclude
# design-system swatches and any framework-specific video/animation exceptions
grep -rlE "<img\b" «DOMAIN_PATHS» --include='*.tsx' | grep -viE "«RAW_IMG_EXCLUDE_RE»"
# 'use client' count — client-bundle surface; a TREND number, not a defect
grep -rlE "^'use client'" «DOMAIN_PATHS» --include='*.tsx' | wc -l
# heavy client deps pulled into shared chunks — spot-check for accidental barrel/full-lib imports
grep -rnE "from '(lodash|moment|jspdf|html2canvas|«HEAVY_DEPS_RE»)'" «DOMAIN_PATHS» --include='*.tsx' | grep -viE "«HEAVY_DEPS_ALLOWLIST_RE»"

# unused dependencies — a dep in package.json with ZERO imports anywhere is dead weight
# (install time, audit surface, and sometimes bundle). If no knip/depcheck is wired, grep it:
for d in $(node -p "Object.keys(require('./package.json').dependencies).join(' ')"); do
  grep -rqE "['\"]${d}['\"/]" «DOMAIN_PATHS» scripts *.ts *.mjs *.js 2>/dev/null || echo "unused?: $d"
done
```

Known-heavy client deps (e.g. `jspdf`, `html2canvas`, PDF/canvas rasterizers, docs UIs) should be dynamically imported (`next/dynamic` or the framework equivalent) and confined to their route, never in a shared chunk. Flag any that leak into broadly-imported code.

**Unused-dep caveat:** the grep only sees `«DOMAIN_PATHS»`/`scripts`/root-config imports, so it flags **candidates**, not confirmed-dead deps. False positives are deps used indirectly — a transitive peer (e.g. `graphql` for a GraphQL-backed CMS), a Tailwind/PostCSS plugin used only in config, a runtime loaded by string. Confirm each candidate before removing; treat a _growing_ list as the signal.

### 4. Backend query & index hygiene

```bash
# unbounded «DB_CMS» finds — a find without a `limit` can full-scan / return the whole collection
grep -rnE "«DB_FIND_PATTERN»" «DOMAIN_PATHS» --include='*.ts' | grep -viE "\.test\."
#   → for each, open the call and confirm it sets `limit` (or is a known-small collection). Report the ones lacking a bound.
# index coverage on hot query fields — list them in `.claude/CLAUDE.md` and cross-check
grep -nE "name:|index:" «HOT_COLLECTION_PATHS» | grep -A1 -E "«HOT_FIELDS_RE»"
```

Keep a list of hot-but-unindexed fields (from prior audits) in `.claude/CLAUDE.md` or a repo-local note. Report which remain unindexed + their query sites.

### 5. Qualitative / runtime

- Point at **`«OBSERVABILITY»`** for the real p75 route latencies + slowest transactions (static analysis can't see these). Note any route the team should check there.
- Spot-check recently-changed routes/pages for: AI-provider calls without a timeout, over-populated `«DB_CMS»` reads (excessive `depth` / joins), missing `next: { revalidate }` on cacheable fetches (or your framework's equivalent).

## Report

Emit a status report (Bundle → Web Vitals Coverage → Client Hygiene → Backend/DB → Risks/Gaps → Recommended Actions). For each check: value + PASS/FAIL where a gate applies.

Track these headline **counts** run-over-run: shared First Load JS (kB), heaviest-route First Load JS (kB), routes above a chosen budget (e.g. > 300 kB), the four PSI scores (or "skipped"), raw-`<img>` files, `'use client'` count, candidate-unused deps, unindexed hot fields, unbounded `find` sites.

1. **Write** the report to `docs/audits/performance-«DATE».md` (create `docs/audits/` if missing; get the date from the environment, don't hardcode).
2. **Compare** every headline count against the most recent prior `docs/audits/performance-*.md` (skip on first run).
3. **On regression only** (shared/heaviest JS up by a meaningful margin, a new over-budget route, or a new unindexed hot field / unbounded find): open a GitHub issue — `gh issue create` — titled `Performance audit: «N» regression(s) on «DATE»`, body listing each regressed metric (was → now) + the offenders + a link to the report. If nothing regressed, do **not** open an issue.

Keep the terminal summary to Risks/Gaps + Recommended Actions, and state plainly whether an issue was opened.

## Notes

- Report-only. If findings warrant fixes, offer a scoped branch — don't optimize in the audit pass.
- The build (step 1) is the slow part (~2–4 min) and is polluted by a dirty working tree — for attributable bundle numbers, run on a clean branch. Backend/hygiene greps are tree-state-independent.
- Sibling audits: `/audit-design-system`, `/audit-api-routes`. General structure/health: `/audit-structure`.
