# UX Principles

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_UX_PRINCIPLES` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_UX_PRINCIPLES.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The generic UX principles (copy, accessibility, responsive, notification patterns) carry over as-is; the stack-specific slots (framework, fonts, icons, animation, colors, thresholds, folder convention) are «placeholders». Reuse the section framework (design system → visual identity → copy guidelines → component conventions → bot voice → celebration → notifications → accessibility → responsive); fill the specifics.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«CSS_FRAMEWORK»` / `«COMPONENT_LIB»` — styling framework + version and component primitives (e.g. utility-CSS framework, headless component lib)
> - `«FONT»` / `«ICON_SET»` — primary typeface and icon library
> - `«ANIMATION_APPROACH»` — animation tooling + named keyframes, plus reduced-motion stance
> - `«VISUAL_IDENTITY»` (concept group) — contrast/density rules; expands to the body tokens `«EMOJI_POLICY»` (emoji-in-UI policy), `«ACCENT_PALETTE»` (accent/semantic colors), `«SIGNATURE_LAYOUT»` (signature layout behaviors)
> - Copy Guidelines — the copy-rules table is generic: keep the rules as-is. The only fill slot is `«COPY_EXAMPLE»` (a domain-specific illustration). The "No moralization" row is conditional — keep only if your product surfaces scores/judgments.
> - `«COMPONENT_DIR_CONVENTION»` — the file/folder layout for components in this repo
> - `«BOT_OR_INTEGRATION_VOICE»` (concept group) — chat-bot/integration tone; expands to the body tokens `«BOT_BEHAVIOR_RULES»` (e.g. opt-in only, off in DMs) and `«SCORE_THRESHOLDS»` (e.g. red/yellow/green bands when surfacing scores) — omit the group if N/A
> - `«CELEBRATION_PATTERNS»` (concept group) — success/reward UX; expands to the body token `«CELEBRATION_CLEANUP»` (post-event cleanup / timeout) — omit if N/A
> - `«NOTIFICATION_STYLE»` (concept group) — toast/notification styling; expands to the body token `«ERROR_NOTIFICATION_STYLE»` (error-variant override)
> - `«A11Y_TARGET»` — accessibility baseline (e.g. WCAG AA) and required practices
> - `«RESPONSIVE_RULES»` — breakpoint strategy and per-section responsive behavior

## Design System

- **Framework:** «CSS_FRAMEWORK» (what to write here: the styling framework + version, e.g. a utility-CSS framework and its animation plugin)
- **Components:** «COMPONENT_LIB» (what to write here: the component primitives/headless lib and how they're styled)
- **Font:** «FONT» (what to write here: primary typeface + fallback stack)
- **Icons:** «ICON_SET» (what to write here: the icon library)
- **Animations:** «ANIMATION_APPROACH» (what to write here: animation tooling, the named keyframes/effects used, and where each applies; all must respect `prefers-reduced-motion`)

## Visual Identity

- «VISUAL_IDENTITY» (what to write here: the contrast/density stance — e.g. high-contrast, data-dense, minimal noise)
- «EMOJI_POLICY» (what to write here: emoji-in-UI policy, e.g. none in product UI to stay professional)
- «ACCENT_PALETTE» (what to write here: accent/semantic colors — e.g. accent color for success/positive states)
- «SIGNATURE_LAYOUT» (what to write here: any signature layout behaviors, e.g. snap scrolling on the landing page)

## Copy Guidelines

(Generic copy-rules table — keep these rules as-is. The only fill slot is `«COPY_EXAMPLE»`; the rules themselves are not tokens.)

| Rule                        | Example                                                              |
| --------------------------- | ------------------------------------------------------------------- |
| No moralization (if your product surfaces scores/judgments) | Show a measured value, not a judgment («COPY_EXAMPLE») |
| Data over opinion           | Show scores/facts, not opinions                                     |
| Second person in guidelines | Address the reader directly ("When working with you…")              |
| Minimal labels              | Short headers, bullet points, no paragraphs                         |
| No filler                   | Remove "please note that", "it's important to", etc.               |

(keep the generic rules as written; the "No moralization" row applies only if your product surfaces scores/judgments — drop it otherwise. Swap `«COPY_EXAMPLE»` for a domain-specific illustration.)

## Component Conventions

```
«COMPONENT_DIR_CONVENTION»
```

(what to write here: the per-component file/folder layout for this repo — e.g. a component folder containing the component file, constants/types, tests, and a barrel export)

## Bot / Integration Voice

(Omit this section if the product has no chat-bot or external integration surface.)

- «BOT_OR_INTEGRATION_VOICE» (what to write here: tone for any bot/integration messages — e.g. casual-professional, brief, scannable)
- Score/threshold visualization: «SCORE_THRESHOLDS» (what to write here: the value→color mapping, e.g. green / yellow / red bands and their numeric cutoffs)
- «BOT_BEHAVIOR_RULES» (what to write here: behavior rules, e.g. no unsolicited advice; respond only to explicit commands)

## Celebration & Reward

(Omit this section if the product has no success/reward moments. Otherwise describe the product's specific reward UX.)

- «CELEBRATION_PATTERNS» (what to write here: the success/reward animations and where they trigger — e.g. completion confetti, bounce-in confirmation icon, staggered fade-in)
- «CELEBRATION_CLEANUP» (what to write here: lifecycle/cleanup rules, e.g. animations auto-remove from the DOM after N seconds)

## Notification Style

- «NOTIFICATION_STYLE» (what to write here: toast styling conventions — accent color, shape, font)
- No modal interruptions for success states
- Error notifications: «ERROR_NOTIFICATION_STYLE» (what to write here: error toast styling + the requirement that messages be actionable)

## Accessibility

(Generic accessibility baseline — keep these; set the target level in `«A11Y_TARGET»`.)

- ARIA labels on all interactive elements
- Semantic HTML (`<article>`, `<nav>`, `<main>`)
- Keyboard navigation support
- Focus management in modals and forms
- Color contrast ratios meeting «A11Y_TARGET» (what to write here: target conformance level, e.g. WCAG AA)

## Responsive Behavior

- Mobile-first breakpoints
- «RESPONSIVE_RULES» (what to write here: per-section responsive behavior — e.g. sidebar collapses to a sheet on mobile, sections stack vertically, full-width forms on small screens)
