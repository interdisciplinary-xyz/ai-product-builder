---
description: Audit design-system quality — token drift, component reuse, a11y, responsive, visual consistency — against the design-system inventory and brand tokens. Meant to run every 1–2 weeks.
allowed-tools: Bash, Read, Grep, Glob, Write
---

# Design System Audit

> **🔧 Reuse & local setup**
>
> Canonical copy — vendored at `docs/ai-product-builder/commands/audit-design-system.md` (source of truth template). To activate as a slash command: copy to `.claude/commands/audit-design-system.md` and fill the `«placeholders»`.
>
> **Reusability:** template-ready — the shape (automated signals → token drift → reuse → qualitative) is generic; the greps are parameterized by `«DOMAIN_PATHS»` and your brand-token layer.
>
> **Pairs with:** `MANAGER_DESIGN_SYSTEM.md` (the playbook whose concerns this command enforces).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - Package manager + sub-commands — `«PKG_MGR»`, `«BUILD_CMD»`, `«QUALITY_CMD:standard»` (prettier + lint with jsx-a11y or equivalent), `«QUALITY_CMD:arch-check»`, `«E2E_CMD»`.
> - Design-tokens home — `«BRAND_TOKENS_PATH»` (e.g. `src/brand/tokens.ts`) + `«BRAND_VARIANTS_PATH»` (variant configs).
> - Component inventory route — `«DESIGN_SYSTEM_PAGE»` (the living inventory route, e.g. `/design-system`) + its source path.
> - Component library location — `«DOMAIN_PATHS»/ui/components` (or your equivalent central component home).
> - Locales — `«LOCALES»` (used in a11y-related translation checks).
> - Framework Image / Font primitives — the framework component names to prefer over raw `<img>` / `<link>` (e.g. `next/image`, `next/font`).
> - Grep-exclude regexes — `«BRAND_TOKENS_EXCLUDE_RE»` (paths where raw hex is legitimate, e.g. `brand/|design-system-page|\.test\.|payload-types|/og/`), `«ARBITRARY_TW_EXCLUDE_RE»` (exclusions for the arbitrary-value scan, e.g. `design-system-page|\.test\.|(max|min)-`).
> - Per-invocation — `«DATE»` (report filename suffix). Inline-fill (per-occurrence): `«n_hex»`, `«n_px»` (record your baseline counts the first time).

Periodic (every 1–2 weeks) health check on the UI design system. This is the enforcer for the concerns in `MANAGER_DESIGN_SYSTEM.md` — the drift AI-assisted development quietly introduces: one-off components, hardcoded tokens, spacing/typography drift, a11y regressions.

**Sources of truth:**

- **Component inventory** → the `«DESIGN_SYSTEM_PAGE»` route (living page listing every reusable primitive: buttons, inputs, colors, typography, brand identity, product-specific primitives, …). Every reusable primitive should have a section here.
- **Design tokens** → `«BRAND_TOKENS_PATH»` + `«BRAND_VARIANTS_PATH»` (colors, gradient hex, fonts, breakpoints). Tailwind theme in `tailwind.config.*` (or the equivalent theme file).
- **Interaction/a11y rules** → the `web-interface-guidelines` command (`commands/web-interface-guidelines.md`); **brand voice** → `RUNBOOK_BRAND_VOICE_GUIDELINE.md`; **file/component layout** → `MANAGER_ARCHITECTURE.md`.

Do **not** auto-fix. Surface findings, rank by severity, then offer to address them.

## Steps

### 1. Automated signals (run, report PASS/FAIL + counts)

```bash
«PKG_MGR» «QUALITY_CMD:standard»    # prettier + lint (jsx-a11y or equivalent catches a11y-lint, focus, alt, labels)
«PKG_MGR» «QUALITY_CMD:arch-check»  # structure: per-component dirs, illegal cross-domain edges (count must only go down)
«PKG_MGR» «E2E_CMD:visual»          # visual-regression suite — note that baselines are usually OS-pinned; may self-skip in CI on other OSes
```

The full a11y + responsive e2e suites need a built server (`«PKG_MGR» «BUILD_CMD»` then `«PKG_MGR» «E2E_CMD» a11y responsive`) — run them only in a full pass, not every tick; note if skipped.

### 2. Token drift (the highest-signal automatable check)

Hardcoded values that bypass `«BRAND_TOKENS_PATH»` / Tailwind theme are the top source of visual drift. Scan app + component code (exclude the brand-token home, the design-system page swatches, tests, generated types):

```bash
# raw hex colors outside the brand token layer (quote the globs — zsh expands them otherwise)
grep -rnE "#[0-9a-fA-F]{6}\b" «DOMAIN_PATHS» --include='*.tsx' --include='*.ts' | grep -viE "«BRAND_TOKENS_EXCLUDE_RE»"
# arbitrary Tailwind values — px-only, EXCLUDING max-/min- (those are legitimate
# responsive constraints; `65ch`/`%`/`vh` too). Report as a TREND count, not a defect
# list — most codebases have many arbitrary px sizes; the signal is whether the
# number is GROWING.
grep -rnE "(^|[^a-z-])(w|h|top|left|right|bottom|p[xytrbl]?|m[xytrbl]?|gap|inset)-\[[0-9.]+px\]" «DOMAIN_PATHS» --include='*.tsx' | grep -viE "«ARBITRARY_TW_EXCLUDE_RE»"
```

Expected legitimate homes for raw hex: the brand-token layer, edge routes that can't read CSS vars (e.g. `«DOMAIN_PATHS»/../app/api/og/**` — satori-style renderers), and design-system color swatches. Anything else is a candidate finding. Report both counts + top offenders; flag growth vs the previous audit. (Fill in your baseline the first time you run this — e.g. `raw-hex ≈ «n_hex» app-UI files; px-arbitrary ≈ «n_px»`.)

### 3. Component reuse / one-off drift

- New interactive UI (button/input/modal/card/badge/tabs/tooltip/select) that does **not** route through `«DOMAIN_PATHS»/ui/components` or lack a `«DESIGN_SYSTEM_PAGE»` section → a one-off. Grep recent-ish additions and cross-check against the section list in step-0's inventory.
- Duplicated primitives: if you keep a duplication-audit doc (e.g. `docs/utils-helpers-duplication.md`), check whether the count regressed.

### 4. Qualitative review (the judgment layer — `MANAGER_DESIGN_SYSTEM.md`)

Sample a handful of recently-changed frontend files (`git log --since=... --name-only -- '«DOMAIN_PATHS»/**/*.tsx'`) and assess against the checklist: component API consistency, spacing/typography hierarchy, semantic HTML + keyboard/focus, loading/empty/error states, responsive/overflow behavior. Depth = spot-check, not exhaustive — the point is to catch drift trends, not review every file.

## Report

Emit the `MANAGER_DESIGN_SYSTEM.md` **OUTPUT FORMAT** (DESIGN SYSTEM Status → Component System → Tokens & Styling → Accessibility → UI States → Risks/Gaps → Recommended Actions). For each automated check: PASS/FAIL + violation count.

Track these headline **counts** run-over-run so regressions are detectable: `arch:check` violations, `standard` errors, candidate raw-hex sites (step 2), arbitrary-value sites (step 2), one-off components (step 3). Record them in a small table at the top of the report.

1. **Write** the report to `docs/audits/design-system-«DATE».md` (create `docs/audits/` if missing). Get the date from the environment / today's date — don't hardcode.
2. **Compare** every headline count against the most recent prior `docs/audits/design-system-*.md` (skip on the first-ever run).
3. **On regression only** (any tracked count higher than last report): open a GitHub issue — `gh issue create` — titled `Design-system audit: «N» regression(s) on «DATE»`, body listing each regressed count (was → now) + top new offenders + a link to the report. If nothing regressed, do **not** open an issue.

Keep the terminal summary to the Risks/Gaps + Recommended Actions sections, and state plainly whether an issue was opened.

## Notes

- This is report-only. If findings warrant fixes, offer to open a scoped branch — do not edit UI in the same pass as the audit.
- Gap worth flagging on the first run: check whether a written token/spec doc exists (`docs/DESIGN_SYSTEM.md` or equivalent). The `«DESIGN_SYSTEM_PAGE»` route may be the de-facto living inventory; the `MANAGER_DESIGN_SYSTEM.md` playbook audits against a written doc.
- Sibling audits: `/audit-api-routes`, `/audit-performance`. General structure/health: `/audit-structure`.
- To run on a cadence, wire a `/schedule` routine (or a calendar reminder) every 1–2 weeks — see `RUNBOOK_DAILY_RITUAL.md` for the operating cadence.
