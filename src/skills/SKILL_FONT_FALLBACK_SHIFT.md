# The font you shipped is not the font they see first

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_FONT_FALLBACK_SHIFT` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_FONT_FALLBACK_SHIFT.md`. **Additional install target:** `.claude/skills/font-fallback-shift/SKILL.md`.
>
> **Reusability:** template-ready — the metric-matching rule, the classification rule and the cold-load proof are framework-agnostic; only `«FONT_LOADER»` and `«STYLESHEET_PATH»` need swapping.
>
> **Pairs with:** `TYPOGRAPHY.md` (§4 owns the loading policy this skill enforces) and `WEB_VITALS_AUDIT.md` (where the CLS this causes shows up as a number). Boundary: this skill owns the **moment a face is added**; the TYPOGRAPHY runbook owns the system it is added to.
>
> **Owns / defers to:** Owns whether a newly added face can reflow the page or change classification mid-load. Defers *which faces exist and what each is for* → `TYPOGRAPHY.md` §3; *the CLS budget* → `WEB_VITALS_AUDIT.md`; *whether the type scale is respected* → the type audit.
>
> **Local definitions to provide per repo:**
> - `«FONT_LOADER»` — how faces are loaded (e.g. `next/font/google`, `@font-face` in `«STYLESHEET_PATH»`, Fontsource)
> - `«STYLESHEET_PATH»` — the file that declares the font stacks
> - `«CLS_BUDGET»` — the Cumulative Layout Shift the repo holds itself to (e.g. 0.1)

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: font-fallback-shift
description: >-
  A webfont added without a metric-matched fallback reflows the page after first paint,
  and the author is structurally unable to see it: their font is cached from the second
  reload onwards, so every subsequent check looks perfect while every cold visitor gets
  the shift. Fire when the session adds or changes a `@font-face`, a `«FONT_LOADER»` call,
  a `font-family` stack, or a `font-display` value; when it swaps a typeface for one of a
  different classification (serif → sans, sans → mono); when it adds a `fallback:` array;
  or when it is about to "fix" a flash of unstyled text with `font-display: block`, a
  loading class toggled from JS, or `visibility: hidden` until `document.fonts.ready` —
  all three trade a visible shift for an invisible page, which is worse. The fix is a
  fallback of the same classification with `size-adjust` / `ascent-override` /
  `descent-override` derived from the real face, verified on a cold load with the cache
  disabled and the network throttled — never on a warm reload. Defer to
  `rationale-comments` for how to record why an override value is what it is.
---
```

---

## The damage

A face is added. It looks right. It looks right on every reload after the first, forever, on the machine of the person who added it — because the font is in the HTTP cache and the paint is instant.

Meanwhile, on a cold visit:

- The page paints in the fallback, then reflows when the real face arrives. Every heading changes width, every paragraph re-wraps, and anything below the fold jumps. That is Cumulative Layout Shift, and it is charged to the page whether or not anyone was looking.
- A reader who started reading mid-load loses their line.
- Someone who was about to tap a link taps whatever slid under their thumb.
- With `font-display: block` instead, the text is simply **invisible** for up to three seconds. The shift is gone from the metric and the page is now blank; the reader cannot tell the difference between that and a broken site.
- If the fallback is a different classification — a serif under a sans stack, or worse a mono — the first paint is a visibly *different design*, not a slightly different one.

**Blast radius.** Every page, every cold visitor, every time. It never appears in review, never fails a test, and never reproduces locally after the first load. Of all the defects a stylesheet can carry, this is the one with the widest reach and the lowest chance of anyone on the team ever seeing it.

## When to use

- Adding or changing a `@font-face`, a `«FONT_LOADER»` call, or any `font-family` stack.
- Swapping a typeface, especially across classification: serif → sans, sans → mono, variable → static.
- Adding or editing a `fallback:` / `adjustFontFallback:` option.
- Touching `font-display`.
- Any commit whose message mentions FOUT, FOIT, "flash of unstyled", or "font flicker".
- Reviewing a `«STYLESHEET_PATH»` diff that changes what the first paint looks like.

## The trap

The three treatments that feel like fixes and are not:

```css
/* ❌ Hides the shift by hiding the page. The reader waits, sees nothing, leaves. */
@font-face { font-family: "Face"; src: url(...); font-display: block; }

/* ❌ Same thing, hand-rolled and worse: now it also breaks with JS disabled,
      and the "loaded" class is one failed promise away from a permanently
      invisible site. */
.fonts-loading body { visibility: hidden; }
```

```js
// ❌ A fallback list of the right *vibe* is not a metric match. Arial and
//    Helvetica Neue have different x-heights and advance widths; naming both
//    changes nothing about the reflow.
fallback: ['Helvetica Neue', 'Arial', 'sans-serif']
```

The common error: treating this as a *visual* problem (which font shows) when it is a *metric* problem (how much space it takes). Two faces can look completely different and never shift, if their metrics match.

## The fix — match the metrics, keep the classification

Let the framework do it when it can. `next/font` computes the overrides from the real face and generates a local fallback automatically; the failure mode there is switching it **off**:

```ts
// ✅ adjustFontFallback defaults to true. Leave it.
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  // Same classification as the real face — a serif here is a different design
  // for the first 200ms, on the one paint the reader is most likely to notice.
  fallback: ['ui-sans-serif', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
});
```

By hand, the overrides are the whole point:

```css
/* ✅ The fallback is reshaped to occupy the real face's space. size-adjust is
      the ratio of the two x-heights; the overrides come from the real face's
      metrics, not from taste. Record where the numbers came from — see
      SKILL_RATIONALE_COMMENTS. */
@font-face {
  font-family: "Face fallback";
  src: local("Arial");
  size-adjust: 107.4%;
  ascent-override: 90.2%;
  descent-override: 22.8%;
  line-gap-override: 0%;
}
body { font-family: "Face", "Face fallback", ui-sans-serif, system-ui, sans-serif; }
```

And always:

- `font-display: swap` — the wrong text beats no text.
- Subset to the scripts actually shipped.
- Preload only the faces used in the first viewport, and no more: preloading all of them is the same total bytes competing for the same connection.

## What the naive fix still gets wrong

Adding `size-adjust` and stopping. The overrides fix the *height* of a line box; they do not fix a stack whose fallback is a different classification, and they do nothing for a face that never loads at all. Both still need the fallback to be a design you would accept shipping — because for someone on a failed request, it is the design you shipped.

Also: `font-synthesis-weight: none`. If the stack falls back to a family lacking the weights used, the browser will *synthesise* them, and a faked semibold is a smeared 400 at a different width — a shift the overrides never see.

## The proof obligation

A warm reload proves nothing. The claim is about the first visit, so the test has to be one:

1. DevTools → Network → **Disable cache**, throttle to Slow 3G (or Fast 3G).
2. Performance panel, record a reload, read **Cumulative Layout Shift**.
3. It must sit inside `«CLS_BUDGET»`, and the filmstrip must show no reflow between the first text paint and the final one.
4. Repeat with the font request **blocked** entirely (Network → block request URL). The page must still be a design, not a ransom note.

If the change cannot be shown to hold under (3) and (4), it has not been verified — it has been looked at.

## Checklist

- [ ] Every face has a fallback of the **same classification**.
- [ ] The fallback is metric-matched — framework-generated, or `size-adjust` + `ascent-override` + `descent-override` derived from the real face.
- [ ] `font-display: swap`; no `block`, no JS visibility gate.
- [ ] `font-synthesis-weight: none`, and the family ships every weight used.
- [ ] Subset to the shipped scripts; preload only first-viewport faces.
- [ ] CLS measured on a **cold** load with cache disabled and the network throttled.
- [ ] The page verified with the font request blocked outright.
- [ ] Override values carry a comment saying where they came from.

## Related

- The system a face is being added to: [`TYPOGRAPHY.md`](./TYPOGRAPHY.md) §4
- Where this shows up as a number: [`WEB_VITALS_AUDIT.md`](./WEB_VITALS_AUDIT.md)
- Why the override values need a rationale comment: [[rationale-comments]] — `SKILL_RATIONALE_COMMENTS.md`
