# Private-repo README images

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_PRIVATE_REPO_README_IMAGES` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_PRIVATE_REPO_README_IMAGES.md`. **Additional install target:** `.claude/skills/private-repo-readme-images/SKILL.md`.
>
> **Reusability:** template-ready — the private-repo URL-rewrite gap, the `<p align="center">` centering rule and the `prefers-color-scheme` SVG pattern are portable verbatim; **fill the `«placeholders»`** with this repo's logo path.
>
> **Pairs with:** `RUNBOOK_README_TEMPLATE.md` (the canonical README shape the logo lives in) — boundary: this skill owns **how the image resolves and how it flips light/dark**; the runbook owns **where in the README the image sits**.
>
> **Owns / defers to:** Owns image and logo rendering in GitHub markdown across public *and* private repos. Defers the whole README skeleton → `RUNBOOK_README_TEMPLATE.md`; per-repo brand palette → `MANAGER_DESIGN_SYSTEM.md`.
>
> **Local definitions to provide per repo:**
> - `«LOGO_PATH»` — the relative repo path to the SVG or PNG (e.g. `public/logo.svg`, `assets/logo.png`)
> - `«LOGO_WIDTH»` — display width in the README (px, typically 96–200)
> - `«BRAND_FG_LIGHT»` / `«BRAND_FG_DARK»` — the fill colours for the light and dark GitHub themes
> - `«INCIDENT_REF»` — the incident/PR where a broken logo shipped and the fix landed

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: private-repo-readme-images
description: >-
  Absolute image paths starting with `/` do NOT get URL-rewritten by GitHub on PRIVATE
  repos — the browser resolves `/logo.svg` to `github.com/logo.svg` and the image 404s
  («INCIDENT_REF»; observed portfolio-wide during a 17-repo README sweep across
  respect.click, empatalk-app, fairtomorrow, boatstands.com and others). Use when writing
  or editing any README.md, when adding a logo/hero image, when centering an image with
  `align="center"`, when authoring an SVG that must adapt to GitHub's light and dark
  themes, or when someone says "the logo works locally but not on GitHub" or "the image
  looks fine in public but broke when we made the repo private". Especially fire on any
  markdown image whose src starts with `/` and any `<img align="center">` — both are the
  wrong shape even when they work. Defer to `RUNBOOK_README_TEMPLATE.md` for the section
  layout; this skill owns image rendering and theme adaptation.
---
```

---

## The damage

Two independent failures, both silent on the author's machine, both dead on GitHub:

**1. `![logo](/logo.svg)` renders in a public repo, 404s in a private one.** GitHub rewrites relative *and* leading-slash paths through its own asset proxy for public repos, so `/logo.svg` resolves to `raw.githubusercontent.com/…/logo.svg`. On **private** repos it does not — the browser is left to resolve `/logo.svg` against the origin (`github.com`), which is not where your logo lives. The image renders as a broken icon. Nobody caught it in preview because the author flipped the repo private *after* the README was drafted.

**2. `<img align="center">` centers nothing.** `align` on `<img>` was deprecated in HTML5 and stripped by GitHub's sanitiser on some pages. The one dependable centering path on GitHub-flavoured markdown is a `<p align="center">` wrapper — deprecated for `<p>` too, but the only attribute the sanitiser still respects.

**3. A single-fill SVG logo is invisible in half of GitHub.** GitHub honours both light and dark themes; a black-on-transparent logo vanishes on `dark`, and vice versa. Inline `<style>` + `prefers-color-scheme` inside the SVG is the one pattern that works, because GitHub's `<img>` embed strips external stylesheets and JS.

This was «INCIDENT_REF» — observed portfolio-wide (respect.click's `/repo.png` worked only because the repo was public and at root; fairtomorrow, empatalk-app and boatstands.com's `/logo.svg` 404'd on merge).

## When to use

- Editing any `README.md` that references an image, badge, or logo.
- Adding or replacing a hero logo — SVG, PNG, or JPG.
- Any `<img>` with `src="/…"` (leading slash) — regardless of whether it "works right now."
- Any `align="center"` attribute on `<img>` or `<div>`.
- Authoring or reviewing an inline SVG intended for a README.
- Reviewing code that justifies itself with *"the logo shows fine on my branch preview."*

## The trap

### Trap 1 — leading-slash image src on a private repo

```markdown
<!-- ❌ Works on public repos, silently 404s on private ones. -->
<p align="center">
  <img src="/logo.svg" width="120" alt="«PROJECT»">
</p>
```

The browser resolves `/logo.svg` against the current origin (`github.com`), *not* the repo tree. Public repos get a proxy rewrite that hides the bug; private repos get a 404. Same source file, different behaviour depending on repo visibility — which is exactly the shape that ships broken and stays broken.

### Trap 2 — `<img align="center">`

```html
<!-- ❌ align="center" on <img> is deprecated + inconsistently honoured. -->
<img src="logo.svg" align="center" width="120" alt="«PROJECT»">
```

The image renders left-aligned on GitHub. The author sees it center on a local markdown preview and never checks the rendered page.

### Trap 3 — a single-fill logo

```xml
<!-- ❌ Invisible on the theme it wasn't drawn for. -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path fill="#0f172a" d="…"/>
</svg>
```

Draws black in `light`, still draws black in `dark`, disappears against GitHub's `#0d1117`.

## The fix

### Fix 1 — always use a repo-relative path

```markdown
<!-- ✅ Resolves through GitHub's own asset proxy on both public and private repos. -->
<p align="center">
  <img src="«LOGO_PATH»" width="«LOGO_WIDTH»" alt="«PROJECT»">
</p>
```

`«LOGO_PATH»` is repo-relative — `public/logo.svg`, `assets/logo.png`, `.github/logo.svg`. No leading slash. GitHub's markdown renderer resolves it against the README's own directory in the repo tree, and the proxy rewrite happens for both public and private repos.

### Fix 2 — center with `<p align="center">`

```markdown
<!-- ✅ The one centering path GitHub's sanitiser still honours. -->
<p align="center">
  <img src="«LOGO_PATH»" width="«LOGO_WIDTH»" alt="«PROJECT»">
</p>
```

The `<p align="center">` wrapper is deprecated HTML, and it is the only reliable centering method on GitHub markdown. Do not use `<div align="center">`, `<center>`, or `align="center"` on the `<img>` itself. Combine with `<img width="…">` — never `style="…"`, which the sanitiser strips.

### Fix 3 — theme-adaptive inline SVG

```xml
<!-- ✅ Flips fill on GitHub's light/dark themes; no external CSS needed. -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <style>
    path, text { fill: «BRAND_FG_LIGHT»; }
    @media (prefers-color-scheme: dark) {
      path, text { fill: «BRAND_FG_DARK»; }
    }
  </style>
  <path d="…"/>
</svg>
```

Or the `currentColor` variant, when the SVG is drawn from one colour:

```xml
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
     style="color: «BRAND_FG_LIGHT»">
  <style>
    @media (prefers-color-scheme: dark) { svg { color: «BRAND_FG_DARK»; } }
  </style>
  <path fill="currentColor" d="…"/>
</svg>
```

Both patterns embed the theme rule *inside* the SVG so the `<img>` embed carries its own styling. GitHub's inline-SVG-inside-`<img>` rendering respects `prefers-color-scheme`; external stylesheets and JS do not survive the embed.

## What the naive fix still gets wrong

**1. `<picture>` with two `<source>` tags is *also* an option — and has the exact same private-repo trap on the source URLs.** GitHub honours the `<picture>` fallback and the `media="(prefers-color-scheme: dark)"` selector, so a two-file logo (`logo-light.svg` + `logo-dark.svg`) works. But if either `srcset` starts with `/`, it 404s on private repos. Same rule: repo-relative paths, always.

**2. Absolute HTTPS URLs to `raw.githubusercontent.com` require a token on private repos.** A "clever" fix that hardcodes `https://raw.githubusercontent.com/org/repo/main/logo.svg` renders on the author's machine (they are logged in) and 404s in an incognito window for every other viewer. Do not link into the raw content host.

**3. `alt=""` is not optional.** An image with no `alt` is a screen-reader miss AND it is the only text a viewer sees when the image *does* 404 — including your own preview when you push the wrong path. Always name the logo (`alt="«PROJECT»"`); the empty alt fails silently at exactly the moment you need the fallback most.

**4. PNGs cannot be theme-adaptive.** `prefers-color-scheme` requires SVG. If the brand logo is only available as PNG, ship two files and use `<picture>` — or accept a single choice that reads on both themes (a mid-value grey works surprisingly often).

## The proof obligation — visit the rendered README on GitHub, in both themes, from an incognito window

A README image that "works" is one that renders **on github.com, on the actual repo, in both light and dark, while logged out**. Any subset of that check is a test that cannot fail.

```bash
# Push the branch.
git push origin docs/readme.md

# Open the branch's README on github.com.
gh pr view --web    # or: open "https://github.com/<org>/<repo>/blob/docs/readme.md/README.md"

# Toggle GitHub's theme (top-right avatar → Appearance → Light / Dark) and reload.
# Then open the same URL in an incognito window — this is the private-repo test.
```

Assert three things:

1. The logo renders (not a broken icon, not the `alt` text).
2. It renders in **both** light and dark (the SVG's `@media` rule fired).
3. It renders **from an incognito window** — the private-repo path resolution test.

If any of the three fails, the author's local preview lied. Fix and repeat.

## Checklist

- [ ] Every `<img src="…">` in `README.md` uses a **repo-relative** path (no leading `/`, no `https://raw.githubusercontent.com/…`).
- [ ] Centering is done with `<p align="center">` — never `<div align="center">`, `<center>`, or `align="center"` on the `<img>`.
- [ ] Image width is set via the `width` attribute — never inline `style="…"`.
- [ ] Every image has a meaningful `alt="«PROJECT»"` (or better).
- [ ] Any hero SVG carries an inline `<style>` with a `@media (prefers-color-scheme: dark)` rule.
- [ ] The rendered README was viewed on github.com, in both light and dark, from an incognito window.
- [ ] If the repo is currently public, the check assumes it may go private tomorrow — the paths would still resolve.

## Related

- Incident / plan: «INCIDENT_REF» (portfolio README sweep — 17 repos)
- Canonical README skeleton the logo lives in: `RUNBOOK_README_TEMPLATE.md`
- Real-world precedent (theme-adaptive SVG shipped): `respect.click` `docs/readme.md` branch
- Portfolio evidence — fairtomorrow, empatalk-app, boatstands.com all shipped `/logo.svg` broken and fixed via the relative-path rule
- Testing doctrine: [[tests-that-cannot-fail]] — a preview that renders on your laptop is not the test
