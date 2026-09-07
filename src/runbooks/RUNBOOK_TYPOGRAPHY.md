# TYPOGRAPHY.md — the type scale, the faces, and the audit that holds them

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_TYPOGRAPHY.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the *system* behind the type: how many sizes exist and why, which face does which job, how a webfont loads without moving the page, and the audit that fails the build when a new size appears. Everything a stylesheet needs to stop accumulating font sizes nobody remembers choosing.
>
> Extracted from `ai-product-builder`'s own site, where the first audit found **46 distinct `font-size` values across 132 declarations** in a single hand-written stylesheet — no framework, no preprocessor, one careful author, and still 46 sizes.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_TYPOGRAPHY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the scale shape, the three roles, the fallback-metric rule and the audit are portable verbatim; only the face names, the step values and the stylesheet path differ per repo.
>
> **Pairs with:** `MANAGER_DESIGN_SYSTEM.md` (owns the design system this is one section of), `BRAND_VOICE_GUIDELINE.md` §7 Visual Tone (the voice these faces have to sound like), `commands/audit-design-system.md` (invokes the audit). Boundary: this runbook owns **type** — steps, faces, loading, metrics; the DESIGN SYSTEM MANAGER owns colour, spacing, components and everything else.
>
> **Local definitions to provide per repo:**
> - `«STYLESHEET_PATH»` — the file that declares the scale (e.g. `app/globals.css`)
> - `«DISPLAY_FACE»` / `«BODY_FACE»` / `«MONO_FACE»` — the three faces and the role each one holds
> - `«TYPE_AUDIT_SCRIPT»` — the audit binary + its alias (e.g. `scripts/tools/audit-type-scale.mjs` invoked as `«PKG_MGR» type:check --strict`)
> - `«SCALE_STEPS»` — the step names and values (§2)
> - `«READING_MEASURE»` — the line length prose is capped at (e.g. `68ch`)

**Last reviewed:** «DATE»

---

## 1. The rule (three sentences)

> **Every size, leading and tracking in the stylesheet names a step declared once on `:root`. A literal is a violation, caught by `«TYPE_AUDIT_SCRIPT»`. Three faces exist — display, body, mono — and a fourth is a decision, not an import.**

Everything below is the mechanism.

---

## 2. The scale

A scale is not a ratio. A ratio is how you *generate* candidate sizes; a scale is the much smaller set you agree to live with. Ship the second, not the first.

```css
:root {
  /* Steps tighten as they shrink: at 11px a 1px difference is a different
     size, at 40px it is not. */
  --text-3xs:  0.6875rem;  /* 11px — eyebrows, smallest legible mono */
  --text-2xs:  0.75rem;    /* 12px — badges, dense chrome */
  --text-xs:   0.8125rem;  /* 13px — meta rows, captions */
  --text-sm:   0.875rem;   /* 14px — secondary body, list rows */
  --text-md:   0.9375rem;  /* 15px — dense body, table cells */
  --text-base: 1.0625rem;  /* 17px — reading body */
  --text-lg:   1.25rem;    /* 20px — ledes, h3 */
  --text-xl:   1.5rem;     /* 24px — h2 */

  /* Display is fluid. A 4rem headline on a 390px phone is not a headline. */
  --display-sm: clamp(1.6rem, 3.2vw, 2.2rem);
  --display-md: clamp(1.75rem, 3.5vw, 2.5rem);
  --display-lg: clamp(2.4rem, 5.6vw, 4.15rem);
}
```

Rules for the scale:

- **Name by role, not by number.** `--text-sm` survives a change of ratio; `--text-7` does not, and renaming it touches every call site.
- **Eight text steps is enough.** If a design needs a ninth, it usually needs one fewer component.
- **Leading and tracking are steps too.** They drift exactly as fast as size — this repo's first audit found 12 line-heights and 15 letter-spacings alongside the 46 sizes.
- **`em` is the one legitimate literal.** Inline code inside prose is sized relative to the text around it, so it tracks whatever step its parent landed on. A step would freeze it and break that relationship. The rule is "a step, or explicitly relative to the parent" — never a bare `rem`.
- **A fluid step that is not display is allowed, and must say why.** Monospace diagrams have a fixed column count: they shrink with the viewport or they overflow, because ASCII art cannot reflow the way a sentence can.

---

## 3. Three faces, three jobs

| Role | Job | Chosen for |
|---|---|---|
| `«DISPLAY_FACE»` | Headlines, the wordmark, section heads | Presence at 40px+; a weight axis, so headings are not stuck at one weight |
| `«BODY_FACE»` | Everything a person reads in sentences | Legibility at 15–17px over thousands of words; real 400/500/600 |
| `«MONO_FACE»` | Anything a machine would read: paths, identifiers, counts | Unambiguous `0`/`O`, `1`/`l`; stable column widths |

- **A fourth face is a decision.** Three roles cover every job on a documentation site. If a fourth appears, something is being solved with type that should be solved with hierarchy.
- **Display and body must be visibly different.** Two faces from the same classification — two high-contrast serifs, two neo-grotesques — read as one face rendered badly. Contrast the classification, not just the size.
- **Body carries the weight range.** Emphasis inside prose is a weight, not a colour and not italics-only. Set `font-synthesis-weight: none` so the browser never fakes a weight the family lacks: a synthesised semibold is a smeared 400.
- **Mono is a semantic, not a decoration.** If mono means "a machine would read this", then every path and identifier is mono and nothing else is.

---

## 4. Loading, and the shift nobody sees

A webfont that swaps to a fallback with different metrics reflows the page after first paint. The author never sees it — their font is cached from the first reload onwards — and the reader sees it every single time on a cold visit.

- **Every face declares a metric-matched fallback.** Modern frameworks generate one (`next/font` does it by default via `adjustFontFallback`); by hand it is `size-adjust`, `ascent-override` and `descent-override` on an `@font-face` pointing at a local system face.
- **The fallback stack matches the classification.** A serif fallback under a sans face is a *different typeface* for the first 200ms — the one moment the reader is most likely to be looking at an empty page.
- **`display: swap`, not `block`.** Invisible text is worse than the wrong text.
- **Subset to the scripts you ship.** Latin-only is usually a two-thirds saving per face.

See `SKILL_FONT_FALLBACK_SHIFT.md`, which fires on the diff that adds a face without a matched fallback.

---

## 5. Reading

- **Cap the measure, not the container.** `«READING_MEASURE»` (65–75ch) is the line length; the container can be any width.
- **Leading scales with measure, not with size.** A wide column needs more leading at the same size.
- **`text-wrap: balance` on headings, `pretty` on prose.** Both are one line and both remove an orphan class of bug that used to need a JS widow-buster.
- **Tabular figures wherever numbers align.** `font-variant-numeric: tabular-nums lining-nums` on any column of counts, or the column stops being a column.

---

## 6. The audit

Text greps do not work here: the thing being checked is a *set* — "is this value one of the eight" is not a question about a single line, which is why this is a stylesheet parse and not a lint rule.

```js
// «TYPE_AUDIT_SCRIPT» (extract)
const GOVERNED = {
  'font-size':      ['--text-', '--display-'],
  'line-height':    ['--leading-'],
  'letter-spacing': ['--tracking-'],
};
// A step, or explicitly relative to the parent. Never a bare rem.
const ALLOWED_LITERAL = /^(inherit|initial|unset|revert|normal|0|1|[\d.]+em)$/;
```

It must cover:

1. Every governed declaration names a step of the right family.
2. Every named step exists on `:root`.
3. Every declared step is used — a step nobody needs is drift waiting to happen.
4. `font-family` starts from one of the three role variables, never a raw name.
5. No fallback stack crosses classification (no serif under a sans).

**Strip comments before parsing.** This audit's own first run flagged a *comment* reading `line-height: inheriting the body's 1.65 made a 21px wordmark`. A check that reads prose as code will eventually fail on the sentence explaining why it exists.

Wire `«PKG_MGR» type:check --strict` into `ci:quality` as a **required** check, on day one, with the scale you have rather than the scale you want. Report-only mode is another sprint of drift.

---

## 7. Anti-patterns

- **A scale in a comment.** If the eight steps live in a doc and the stylesheet has 46 values, there is no scale — there is a doc.
- **Generating the scale from a ratio at build time.** 1.25^n produces 0.512rem and 1.953rem; nobody wants those, so people round, and the rounding is the actual scale. Declare the actual scale.
- **`clamp()` everywhere.** Fluid type is for display and for fixed-column diagrams. A fluid 14px body size is 13.2px on one screen and 14.6px on another for no reason a reader benefits from.
- **A serif fallback under a sans face** (and the reverse). See §4.
- **Emphasis by colour alone.** It is not emphasis for a reader with low vision, and it is nothing at all in print.
- **A ninth, tenth, eleventh step added "just for this one component."** That is how 46 happens. It never arrives as 46; it arrives as one more.

---

## 8. Verification checklist

- [ ] Every step is declared once on `:root` in `«STYLESHEET_PATH»`.
- [ ] No `font-size`, `line-height` or `letter-spacing` literal outside `:root` except `em` and the keywords.
- [ ] Exactly three face variables; no raw family name in any rule.
- [ ] Every face has a metric-matched fallback of the same classification.
- [ ] `font-synthesis-weight: none`, and the body family actually ships the weights used.
- [ ] Prose is capped at `«READING_MEASURE»`.
- [ ] Tabular figures wherever numbers stack.
- [ ] `«PKG_MGR» type:check --strict` runs in `ci:quality` as a required check.
- [ ] The audit strips comments before parsing.
- [ ] Every declared step is used by something.

## 9. Related

- The design system this is one section of: [`MANAGER_DESIGN_SYSTEM.md`](./MANAGER_DESIGN_SYSTEM.md)
- The voice these faces have to sound like: [`BRAND_VOICE_GUIDELINE.md`](./BRAND_VOICE_GUIDELINE.md) §7
- The invisible cost of a mismatched fallback: [[font-fallback-shift]] — `SKILL_FONT_FALLBACK_SHIFT.md`
- Why every override needs a rationale comment: [[rationale-comments]] — `SKILL_RATIONALE_COMMENTS.md`
- The audit fires here: `commands/audit-design-system.md`
