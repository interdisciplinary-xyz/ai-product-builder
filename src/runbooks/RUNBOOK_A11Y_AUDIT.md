# A11Y_AUDIT.md — WCAG 2.1 AA audit record

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_A11Y_AUDIT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_A11Y_AUDIT.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the audit structure (scope → axe → allowlist → keyboard → screen reader → contrast → motion → findings) is generic across WCAG 2.1 AA programs; the stack-specific bits (axe runner, allowlist file path, e2e command) are `«placeholders»`.
>
> **Pairs with:** `MANAGER_A11Y_AUDIT.md` (the agent playbook that produces this file), `UX_PRINCIPLES.md` (accessibility baseline + responsive rules), `QUALITY_ASSURANCE.md` (frontend quality gate, §4 + the visual-regression + a11y note in §4), `RELEASE_MANAGER.md` §4.2 (domain-scoped a11y at the release merge), `DESIGN_SYSTEM.md` (component-level a11y primitives), `OBSERVABILITY.md` (runtime error capture).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product being audited.
> - `«DOMAIN»` — the primary user-facing domain.
> - `«LOCALES»` — locales in scope (e.g. en, pl).
> - `«ADMIN_PATH»` — admin route excluded from the strict audit (or included with a separate scope note).
> - `«DOMAIN_PATHS»` — where feature domains live, for the domain-scoped audit.
> - `«SHARED_PATHS»` — cross-cutting paths that force a full audit when changed.
> - `«E2E_CMD»` — the e2e command that runs the axe + keyboard specs (e.g. `pnpm test:e2e --project=chromium`).
> - `«KNOWN_VIOLATIONS_FILE»` — the committed allowlist path (e.g. `e2e/a11y/known-violations.json`).
> - `«AXE_VERSION»` — the axe-core version used (record on every audit).
> - `«SCREEN_READER»` — the screen reader used in the smoke pass (e.g. VoiceOver 14 / NVDA 2024.1 / TalkBack).
> - `«CONTRAST_TOOL»` — the tool used for contrast measurement (e.g. browser DevTools contrast picker, design-tool plugin).

> **Verdict (top of doc — must be dated within current release cycle):**
>
> | Field | Value |
> |---|---|
> | Audited build | «commit SHA» |
> | Audit date | «DATE» |
> | Auditor | «name / role» |
> | Verdict | «Pass / Pass with allowlist / Fail» |
> | Allowlist trend vs last audit | «-N / flat / +N» |

---

## 1. Scope

| Field | Value |
|---|---|
| Target conformance | WCAG 2.1 **Level AA** |
| Routes in scope | «list — e.g. `/`, `/«core-flow»`, `/pricing`, `/checkout`, `/account`» |
| Routes out of scope | «list — e.g. `«ADMIN_PATH»/**`, third-party iframe at `/embed/...`» |
| Locales covered | `«LOCALES»` |
| RTL surfaces | «yes / no — if yes, list» |
| Devices | desktop + mobile (≥ 320px wide); touch + keyboard |
| Browsers | «list — at minimum the supported matrix» |

**Cadence:** updated at every `release/* → «TRUNK»` merge for the **changed domains** (`«DOMAIN_PATHS»` — see `RELEASE_MANAGER.md` §4.2). Full audit on any `«SHARED_PATHS»` change or quarterly, whichever comes first.

---

## 2. Automated axe results

- Axe version: `«AXE_VERSION»`
- Runner: `«E2E_CMD»` (a11y project / tag)
- Pages traversed: «N»
- Rules enabled: «WCAG 2.1 AA ruleset + best-practice subset» (record the configured tag set)

| Severity | Count this audit | Count last audit | Delta |
|---|---|---|---|
| Critical | «N» | «N» | «±N» |
| Serious | «N» | «N» | «±N» |
| Moderate | «N» | «N» | «±N» |
| Minor | «N» | «N» | «±N» |

> Net delta MUST be ≤ 0. A positive delta blocks the release until either fixed or the allowlist entry has an explicit owner + `must-fix-by` date.

---

## 3. KNOWN_VIOLATIONS allowlist (shrink-not-grow)

Source of truth: `«KNOWN_VIOLATIONS_FILE»` (committed).

The allowlist is the **explicit ratchet** — every entry has a rule, a selector, a route, a reason, an owner, and a `must-fix-by` date.

| Rule ID | Selector | Route | Reason | Owner | Must-fix-by |
|---|---|---|---|---|---|
| «color-contrast» | `.legacy-nav a` | `/` | Legacy nav awaiting redesign | «owner» | «DATE» |
| ... | ... | ... | ... | ... | ... |

- Count: «N»
- Previous-audit count: «N»
- Trend: «shrunk / flat / grew» — **must be shrunk or flat** to pass.
- Expired entries (`must-fix-by` < today): «list — each becomes a Critical finding below».

---

## 4. Keyboard-path matrix

Every critical flow MUST be completable by keyboard alone.

| Flow | Route | Steps | Expected focus order | Actual focus order | Verdict |
|---|---|---|---|---|---|
| Sign up (email) | `/signup` | Tab to email → Tab to password → Tab to submit → Enter | email → password → submit | email → password → submit | Pass |
| Open modal X | `/«route»` | Focus trigger → Enter → Tab cycles within modal → Esc → focus returns to trigger | trigger → modal-content → close → trigger | «record» | «Pass / Fail» |
| ... | ... | ... | ... | ... | ... |

Verify per flow:
- skip-to-content link is the first focusable element;
- focus is visible against every background (incl. hover/active states);
- no positive `tabindex` skews the order;
- modals trap focus + return on close;
- forms submit on Enter; error focus moves to the first invalid field.

---

## 5. Screen-reader smoke notes

- Tool: `«SCREEN_READER»`
- OS / version: «record»
- Date: «DATE»
- Flows covered: «list — at minimum the core flow + one secondary»

| Flow | Surface | Output observed | Issue? | Fix recommendation |
|---|---|---|---|---|
| Sign up | `/signup` | "Email, edit text, required. Password, edit text, required. Sign up, button." | None | — |
| «flow» | `«route»` | «what the SR actually said» | «yes / no» | «recommendation» |

Verify:
- every interactive element has a meaningful accessible name (not "Button");
- one `<h1>`/page; landmarks unique;
- live regions announce dynamic status without flooding;
- decorative icons are `aria-hidden`; informational images have real `alt`.

---

## 6. Color-contrast scan

- Tool: `«CONTRAST_TOOL»`
- Palette source: «design tokens file — e.g. `src/styles/tokens.css`»
- Dark mode covered: «yes / no»
- Locale palettes covered: «list per `«LOCALES»`»

| Token | Use | On background | Ratio | Required | Pass? |
|---|---|---|---|---|---|
| `--color-text-primary` | body text | `--color-surface-100` | 7.1:1 | 4.5:1 | Pass |
| `--color-text-muted` | secondary text | `--color-surface-200` | 3.8:1 | 4.5:1 | **Fail** |
| `--color-focus-ring` | focus indicator | `--color-surface-100` | 3.4:1 | 3:1 | Pass |
| ... | ... | ... | ... | ... | ... |

Notes:
- measure against the **real rendered surface** (incl. hover/active/focus states);
- disabled controls are exempt — but verify they don't look interactive.

---

## 7. Motion / prefers-reduced-motion

| Surface | Animation | Reduced-motion behavior | Verdict |
|---|---|---|---|
| Hero | parallax scroll | disabled | Pass |
| Loading | spinner | retained (essential) | Pass |
| Toast notifications | slide-in | crossfade ≤ 100ms | Pass |
| ... | ... | ... | ... |

Verified by toggling DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" on every animated route.

---

## 8. Findings + remediation roadmap

Grade by **actual exposure**, not the textbook label (see `QUALITY_ASSURANCE.md` §7). Re-grade upward if the audience or surface changes.

### Critical (must fix before release)

| # | Finding | Route | Owner | Due |
|---|---|---|---|---|
| 1 | «axe rule + brief» | «route» | «owner» | «DATE» |
| ... | ... | ... | ... | ... |

### High (must fix in current release cycle)

| # | Finding | Route | Owner | Due |
|---|---|---|---|---|

### Medium (next release)

| # | Finding | Route | Owner | Due |
|---|---|---|---|---|

### Low (backlog)

| # | Finding | Route | Owner |
|---|---|---|---|

Each Critical/High finding MUST have a tracked issue (`audit` + `a11y` + `priority:` labels) — file before promoting to `release/*`.

---

## 9. Cross-references

- [`MANAGER_A11Y_AUDIT.md`](./MANAGER_A11Y_AUDIT.md) — the agent playbook that produces / verifies / audits this file.
- [`UX_PRINCIPLES.md`](./UX_PRINCIPLES.md) — accessibility baseline + responsive rules.
- [`QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md) — frontend quality gate (§4) — the visual-regression + a11y note in §4 makes a11y **domain-scoped at the release merge** (same mechanism as E2E).
- [`RELEASE_MANAGER.md`](./RELEASE_MANAGER.md) §4.2 — domain-scoped a11y at the `release/* → «TRUNK»` merge (path-scoped via `«DOMAIN_PATHS»`, full suite on `«SHARED_PATHS»` changes).
- [`MANAGER_DESIGN_SYSTEM.md`](./MANAGER_DESIGN_SYSTEM.md) — component-level a11y primitives (focus-visible ring, accessible name patterns, ARIA defaults, contrast tokens).
- [`OBSERVABILITY.md`](./OBSERVABILITY.md) — runtime error capture (a11y-violating crashes surface via the standard error pipeline).
- `«KNOWN_VIOLATIONS_FILE»` — the committed allowlist.
