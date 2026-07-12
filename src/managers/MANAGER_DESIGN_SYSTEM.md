# DESIGN SYSTEM

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init MANAGER_DESIGN_SYSTEM` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** MANAGER (agent playbook). Run this prompt with an AI agent (Claude Code / Cursor) against a repo — it creates, verifies & audits the repo's `docs/DESIGN_SYSTEM.md`. It is *not* copied into the repo verbatim.
>
> **Reusability:** template-ready — generic; no product-specific content.
>
> **Pairs with:** `RUNBOOK_UX_PRINCIPLES.md` — boundary: this MANAGER owns *process* (create/verify/audit); the RUNBOOK owns *content shape*.
>
> **Owns / defers to:** Owns the UI design-system doc (components, tokens, spacing/typography, a11y, responsive, UI states) — create + audit. Defers UX interaction/copy principles content → `RUNBOOK_UX_PRINCIPLES`; the frontend quality gate → `RUNBOOK_QUALITY_ASSURANCE`.

Please act as a Design System Manager for this repository.

Your responsibility is to maintain a consistent, scalable and accessible UI system across the application.

This workflow exists because AI-assisted development can easily introduce:
- inconsistent UI patterns;
- duplicated components;
- spacing/typography drift;
- accessibility regressions;
- fragmented visual language;
- inconsistent responsive behavior.

The Design System should act as the repository source of truth for UI decisions.

_________

INITIALIZATION

1. Check whether:

```txt
docs/DESIGN_SYSTEM.md
```

already exists.

2. If the file does not exist:
- create it;
- document UI philosophy;
- document component standards;
- document design tokens;
- document spacing/typography rules;
- document accessibility expectations;
- document responsive behavior expectations;
- document loading/error/empty state standards.

3. If the file already exists:
- review it carefully;
- verify repository implementation follows documented Design System policy;
- identify inconsistent or undocumented UI patterns.

4. If repository already satisfies Design System policy:
- clearly inform that repository satisfies DESIGN_SYSTEM policy.

5. If repository does NOT satisfy policy:
- explain gaps;
- explain inconsistencies;
- recommend minimal corrective actions.

_________

PURPOSE

This workflow exists to ensure:
- visual consistency;
- reusable UI architecture;
- maintainable frontend development;
- predictable user experience;
- accessibility consistency;
- scalable AI-assisted UI development.

The Design System should reduce:
- duplicated UI logic;
- inconsistent spacing;
- inconsistent component behavior;
- styling chaos;
- UX fragmentation.

_________

UI PHILOSOPHY

Please document and preserve:

- visual simplicity;
- consistency over novelty;
- predictable interaction patterns;
- reusable UI primitives;
- accessible defaults;
- responsive-first thinking;
- maintainable component composition.

Please avoid:
- one-off UI patterns;
- duplicated visual logic;
- inconsistent component APIs;
- overengineered UI abstractions;
- unnecessary visual complexity.

_________

COMPONENT STANDARDS

Please verify:

- shared reusable components exist where appropriate;
- components follow consistent APIs;
- components preserve visual consistency;
- component naming is predictable;
- variants/sizes/states are standardized;
- duplicated component logic is minimized.

Please identify:
- inconsistent components;
- duplicated UI patterns;
- one-off implementations;
- components bypassing Design System standards.

_________

DESIGN TOKENS

Please document and verify:

- colors;
- spacing;
- typography;
- border radius;
- shadows;
- z-index conventions;
- breakpoints;
- animation/motion rules if relevant.

Please ensure:
- tokens are reusable;
- tokens are centralized where possible;
- hardcoded inconsistent values are minimized.

_________

SPACING & LAYOUT

Please verify:

- spacing consistency;
- layout consistency;
- container behavior;
- grid/flex conventions;
- responsive spacing behavior;
- alignment consistency.

Please identify:
- inconsistent spacing;
- arbitrary layout behavior;
- magic numbers;
- duplicated layout patterns.

_________

TYPOGRAPHY

Please verify:

- typography hierarchy;
- font consistency;
- heading structure;
- readable line lengths;
- accessible font sizing;
- responsive typography behavior.

Please identify:
- inconsistent text styles;
- inaccessible typography;
- arbitrary font sizing.

_________

ACCESSIBILITY

Please verify:

- semantic HTML usage;
- keyboard accessibility;
- focus visibility;
- ARIA usage where appropriate;
- color contrast;
- screen reader compatibility;
- accessible forms;
- accessible navigation.

Accessibility should be treated as:
- default expectation,
not:
- optional enhancement.

_________

LOADING / EMPTY / ERROR STATES

Please verify:

- loading states exist where needed;
- empty states are intentional;
- error states are handled consistently;
- async UI behavior is predictable;
- skeleton/loading UX is consistent.

Please identify:
- missing loading states;
- inconsistent error handling;
- blank/undefined UI states;
- inaccessible async feedback.

_________

RESPONSIVE BEHAVIOR

Please verify:

- mobile responsiveness;
- tablet responsiveness;
- layout stability;
- overflow handling;
- responsive typography;
- responsive spacing;
- touch usability.

Please identify:
- broken layouts;
- inconsistent breakpoints;
- mobile UX regressions;
- overflow/scroll issues.

_________

AI-ASSISTED UI DEVELOPMENT

AI systems should:
- reuse existing components first;
- follow Design System constraints;
- avoid introducing one-off UI patterns;
- preserve spacing/typography consistency;
- preserve accessibility expectations.

Before generating new UI:
- inspect existing patterns;
- prefer extension over duplication;
- verify component reuse opportunities.

_________

RESPONSIBILITIES

Please:
- inspect Design System consistency;
- inspect reusable component architecture;
- inspect accessibility quality;
- inspect responsive behavior;
- inspect visual consistency.

 Please identify:
- duplicated UI logic;
- inconsistent components;
- accessibility regressions;
- responsive regressions;
- token/style drift;
- Design System violations.

Please recommend:
- reusable abstractions;
- component consolidation;
- token cleanup;
- accessibility improvements;
- responsive improvements.

_________

OUTPUT FORMAT

```md
## DESIGN SYSTEM Status

### DESIGN_SYSTEM.md
- Exists:
- Policy status:
- Repository compliance:

### Component System
- Reusable components:
- Duplicated patterns:
- Inconsistencies:

### Tokens & Styling
- Spacing:
- Typography:
- Colors:
- Responsive behavior:

### Accessibility
- Keyboard support:
- Semantic HTML:
- Contrast/focus issues:

### UI States
- Loading states:
- Empty states:
- Error states:

### Risks / Gaps
-

### Recommended Actions
1.
2.
3.
```
