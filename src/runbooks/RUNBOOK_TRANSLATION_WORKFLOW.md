# TRANSLATION_WORKFLOW.md — Locale matrix & translation pipeline

> **Canonical / source-of-truth copy** (lives in the `ai-product-builder` library). Adopt in a repo by
> copying to `docs/TRANSLATION_WORKFLOW.md` and filling the `«placeholders»`.
>
> **Scope:** *what locales we ship*, *how keys move from code to translator and back*,
> and *how we keep non-default locales from silently drifting*. Companion to
> [`BRAND_VOICE_GUIDELINE.md`](./BRAND_VOICE_GUIDELINE.md) (voice in each locale)
> and the SEO doc (hreflang implementation).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_TRANSLATION_WORKFLOW` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_TRANSLATION_WORKFLOW.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — the locale matrix, translation-source format, key-naming convention, audit command, pseudo-locale rollout, new-locale checklist, formatting gotchas, and known-untranslated allowlist are all reusable; the locale list, namespace list, file paths, and audit command are `«placeholders»`.
>
> **Pairs with:** `MANAGER_I18N.md` (the agent playbook that creates/verifies this doc), `BRAND_VOICE_GUIDELINE.md` (voice & tone per locale), the SEO doc (hreflang + multi-locale sitemap), `QUALITY_ASSURANCE.md` (the QA gate where the missing-key audit runs).
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + canonical domain.
> - `«LOCALES»` — the full list of supported locales (e.g. en, pl).
> - `«DEFAULT_LOCALE»` — the source locale (e.g. en).
> - `«I18N_ROOT»` — where translation files live (e.g. `i18n/`, `messages/`, `locales/`, `app/[locale]/messages/`).
> - `«I18N_NAMESPACES»` — namespace list (e.g. `common`, `auth`, `checkout`, `dashboard`, `emails`).
> - `«I18N_AUDIT_CMD»` — missing-key + orphan-key audit (e.g. `pnpm i18n:audit`).
> - `«I18N_EXTRACT_CMD»` — key extractor from source (e.g. `pnpm i18n:extract`).
> - `«PSEUDO_LOCALE_TAG»` — the pseudo-locale tag (e.g. `xx-PSEUDO`).
> - `«TRANSLATION_SLA»` — max time a non-default locale may have a missing key (e.g. 5 business days).
> - `«TRANSLATOR_HANDOFF»` — translator vendor / channel (e.g. internal native speaker, agency, Crowdin, Lokalise).

---

## 1. Locale matrix

The authoritative status of every locale this repository ships, or plans to ship. Update this table on every new-locale rollout and on every translator handoff.

| Locale | BCP-47 tag | Status | Fallback | Native-speaker reviewer | Untranslated keys | Direction | Last full review |
|---|---|---|---|---|---|---|---|
| English | `en` | shipping (default) | — | «name» | 0 (must be 0) | LTR | «date» |
| Polish | `pl` | shipping | `en` | «name» | «N» (target: 0) | LTR | «date» |
| «Locale» | `«tag»` | planned / in-progress / shipping / deprecated | `«fallback»` | «name» | «N» | LTR / RTL | «date» |

**Status legend:**
- `planned` — declared, no translation files yet;
- `in-progress` — translation files exist, untranslated allowlist seeded, not yet exposed in the locale picker;
- `shipping` — exposed in the locale picker, hreflang wired, in CI's pseudo-locale check;
- `deprecated` — being removed; new keys do NOT need translations here.

> **The default locale (`«DEFAULT_LOCALE»`) row has zero untranslated keys, always.** A missing key in `«DEFAULT_LOCALE»` is a build failure, not a translation backlog item.

---

## 2. Translation-source format

Translation files live under `«I18N_ROOT»/«locale»/«namespace».json`. One namespace per file. Keys are nested by feature; the leaf is a string.

```
«I18N_ROOT»/
  en/
    common.json
    auth.json
    checkout.json
    dashboard.json
    emails.json
  pl/
    common.json
    auth.json
    …
  «PSEUDO_LOCALE_TAG»/        # generated, do not edit by hand
    common.json
    …
```

**Per-file shape** (`«I18N_ROOT»/en/checkout.json`):

```json
{
  "checkout": {
    "title": "Complete your purchase",
    "submit": "Pay {{amount, currency}}",
    "errors": {
      "card_declined": "Your card was declined.",
      "insufficient_funds": "Insufficient funds."
    },
    "items": {
      "one": "{{count}} item",
      "other": "{{count}} items"
    }
  }
}
```

**Rules:**

- One namespace per file. Splitting `checkout` into `checkout/` is a smell — flatten or rename.
- Plurals use ICU MessageFormat or your stack's CLDR-aware equivalent (`one`/`other` for English; `one`/`few`/`many`/`other` for Polish; Intl.PluralRules decides at runtime).
- Interpolation uses `{{name}}` (or your stack's equivalent), never string concat in code.
- Currency / date / number formatting is a *format hint* in the message (e.g. `{{amount, currency}}`), not a pre-formatted string baked into the translation.
- HTML inside translations is allowed ONLY for inline elements (`<strong>`, `<em>`, `<a>`); block-level structure stays in JSX/templates.
- No empty-string values. A missing key is recorded in the allowlist (§9) — never as `""`.

---

## 3. Key-naming convention

Keys are `namespace.feature.element.variant`, lowercase, dot-separated, stable across copy revisions.

**Good:**
- `checkout.submit_button.default`
- `checkout.submit_button.processing`
- `auth.errors.invalid_credentials`
- `dashboard.empty_state.title`

**Bad:**
- `t('Click here')` — key is the English copy. Breaks on every edit.
- `checkout.button1` — opaque. Use the *role*, not a counter.
- `Checkout.SubmitButton.Default` — case drift hardens to a maintenance bug.
- `checkout-submit-button-default` — dash separators conflict with locale tags (`en-GB`).

**Rule:** a key names *what the string is*, not *what it says*. If you can re-word the copy without re-naming the key, the key is right.

---

## 4. Missing-key detection

The audit command is **`«I18N_AUDIT_CMD»`** (e.g. `pnpm i18n:audit`). It checks:

1. Every `t(…)` / message lookup in source has a key in `«DEFAULT_LOCALE»` — missing = exit 1.
2. Every key in `«DEFAULT_LOCALE»` is referenced somewhere in source — orphan keys go on the deprecation list.
3. Every non-default locale either has the key or has it allowlisted in §9 — un-allowlisted miss = exit 1.
4. Every key with `{{interpolation}}` has the *same* interpolation in every locale (e.g. `{{name}}` in `en` and `{{nazwa}}` in `pl` is a bug — `pl` translator changed the placeholder name).
5. Every plural key has the right CLDR forms for its locale (`one`/`other` for English; `one`/`few`/`many`/`other` for Polish).
6. No duplicate keys across namespaces (deterministic resolution).

**Wiring:**
- Local: `«I18N_AUDIT_CMD»` is part of `«QUALITY_CMD»`.
- CI: required check on every PR. A missing default-locale key BLOCKS merge.
- Pre-commit (optional): a Husky hook runs the audit on changed files only.

---

## 5. Pseudo-locale rollout

The pseudo-locale `«PSEUDO_LOCALE_TAG»` is **generated**, never hand-edited. It transforms every `«DEFAULT_LOCALE»` string by:

1. Wrapping with `[!! … !!]` (catches concatenation — anything outside the brackets in the rendered UI is a hard-coded string);
2. Replacing ASCII letters with diacritic equivalents (`a` → `à`, `e` → `é`, `o` → `öö` — also expands length ~30%);
3. Preserving `{{interpolations}}` and HTML tags untouched (so interpolated values still flow).

Example: `Hello, {{name}}` → `[!! Ḣéĺĺöö, {{name}} !!]`

**Generation:**

```bash
«I18N_EXTRACT_CMD» --pseudo > «I18N_ROOT»/«PSEUDO_LOCALE_TAG»/...
```

Run on every PR (the file is `.gitignore`d; CI regenerates).

**CI checks against pseudo-locale:**
- visual regression (truncation in buttons, nav, tooltips);
- a11y (does the screen-reader read the pseudo string, or does it leak the un-pseudo'd English?);
- e2e smoke (does the app boot in `«PSEUDO_LOCALE_TAG»` at all?).

**Three bugs the pseudo-locale catches:**

1. **Hard-coded English** — visible as un-bracketed text amid the `[!! … !!]` markers.
2. **Truncation** — `Save` → `[!! Ṡàvé !!]` is 12 chars vs 4; if the button clips, German/Polish/Russian will clip too.
3. **String concatenation** — `'Hello, ' + name` renders as `[!! Ḣéĺĺöö, !!] Bob`, with `Bob` un-pseudo'd outside the brackets. Use interpolation.

---

## 6. New-locale checklist

When adding a new locale `«new-locale»`:

1. **Decide the fallback** — usually `«new-locale» → «DEFAULT_LOCALE»`. A more-specific locale (e.g. `pt-BR`) may fall back to a less-specific one (`pt`) before defaulting.
2. **Add to `«LOCALES»`** in the repo's `.claude/CLAUDE.md` and in any framework config (`next.config.js`, `i18n.config.ts`, etc.).
3. **Create the namespace files** — empty `{}` for now, one per namespace in `«I18N_NAMESPACES»`.
4. **Seed the untranslated allowlist (§9)** — run the audit; every missing key is allowlisted at this commit. **This is the baseline — it can only shrink.**
5. **Wire the locale into the URL strategy** — sub-path / sub-domain / etc.; verify routing works in dev.
6. **Add to the locale picker** — but keep it behind a feature flag or `status: in-progress` filter until §9-§11 are done.
7. **Verify `Intl.*` accepts the BCP-47 tag** — `new Intl.DateTimeFormat('«new-locale»')` shouldn't throw; if it does, the tag is malformed.
8. **Identify a native-speaker reviewer** — name them in §1's table. No locale ships without one.
9. **Run the translator handoff** (§7) for the seeded keys.
10. **Confirm hreflang** is wired by `MANAGER_SEO` — `<link rel="alternate" hreflang="«new-locale»">` on every page that has the locale; sitemap includes the locale's URLs.
11. **Smoke-test in pseudo-locale first**, then in the real locale with the native-speaker reviewer.
12. **Promote** from `in-progress` to `shipping` in §1's table; expose in the locale picker; remove the feature flag.

---

## 7. Translator handoff

Translators receive a batch, not a stream. On a documented cadence (`«TRANSLATOR_HANDOFF»`, e.g. weekly):

1. Run `«I18N_EXTRACT_CMD» --diff` — exports the new/changed `«DEFAULT_LOCALE»` keys since the last handoff.
2. Send the export to the translator(s) for each non-default locale, with context (where the string appears, character constraints, tone notes — reference `BRAND_VOICE_GUIDELINE.md`).
3. Translator returns a batch.
4. Translations land as a **PR**, not a CMS edit — reviewer checks for interpolation drift, HTML safety, plural-form completeness.
5. Merging the PR shrinks the §9 allowlist for that locale.

**Context to include in every handoff:**

| Field | Why |
|---|---|
| Key path | e.g. `checkout.submit_button.processing` — so translator can search the file |
| Source string | the `«DEFAULT_LOCALE»` value |
| Where it appears | URL + screenshot if it's UI; "transactional email subject line" if it's an email |
| Character constraints | button max-length, SMS 160-char cap, push-notification truncation |
| Tone hints | reference `BRAND_VOICE_GUIDELINE.md` §3 (tone pillars) |
| Interpolations | list of `{{vars}}` and what they expand to (name, count, amount) |
| Plural? | "yes — please provide CLDR forms for this locale" |

---

## 8. Formatting gotchas

Locale-aware formatting is `Intl.*` always. **Never** hand-roll, never `toLocaleX()` without a locale arg.

| Concern | Wrong | Right | Why |
|---|---|---|---|
| Date | `date.toLocaleDateString()` | `new Intl.DateTimeFormat(locale, opts).format(date)` | Locale-less call uses the host locale, non-deterministic in tests |
| Date format | `${mm}/${dd}/${yyyy}` | `Intl.DateTimeFormat(locale, { dateStyle: 'medium' })` | US format is unreadable in Europe |
| Number | `n.toFixed(2)` for currency | `Intl.NumberFormat(locale, { style: 'currency', currency })` | Decimal separator + symbol placement vary |
| Decimal separator | `'1,234.56'` hard-coded | `Intl.NumberFormat(locale).format(1234.56)` | Polish uses `1 234,56`; comma vs dot varies |
| Plural | `count === 1 ? 'item' : 'items'` | `t('items', { count })` + ICU `one`/`few`/`many`/`other` | Polish has 4 forms; Arabic has 6 |
| Relative time | "2 hours ago" hand-rolled | `Intl.RelativeTimeFormat(locale).format(-2, 'hour')` | Locale-aware "ago"/"in" + plural form |
| List | `arr.join(', ')` | `Intl.ListFormat(locale).format(arr)` | "A, B, and C" is English; "A, B i C" in Polish |
| Direction | `margin-left: 8px` | `margin-inline-start: 8px` | Logical property mirrors in RTL automatically |
| Icons | Static `<ChevronRight>` for "next" | Mirror in RTL: `<ChevronRight class="rtl:rotate-180">` | Direction-aware affordances mirror; non-directional don't |
| User content in mixed-direction context | bare interpolation | `<bdi>{{userName}}</bdi>` | Bidi-isolate prevents user strings from re-flowing surrounding layout |

**Currency edge cases:**
- The currency symbol's *position* (prefix `$5.00` vs suffix `5,00 €`) is locale-driven — never hard-code it.
- The currency *code* (USD / EUR / PLN) is per-transaction data, not per-locale.
- A US user viewing a PLN-priced item should see `PLN 50.00` (or `50,00 zł`), not `$50`. Locale formats the *display*; currency is the *value*.

---

## 9. Known-untranslated allowlist

Same shrink-not-grow mold as the a11y `KNOWN_VIOLATIONS` allowlist (see `QUALITY_ASSURANCE.md` §4).

**File:** `«I18N_ROOT»/.allowlist.json` (committed; one entry per missing key per locale).

```json
{
  "pl": [
    { "key": "checkout.gift_card.apply_button", "added": "«date»", "owner": "@«github-handle»" },
    { "key": "dashboard.empty_state.cta", "added": "«date»", "owner": "@translator-handle" }
  ],
  "«new-locale»": [
    { "key": "common.brand.tagline", "added": "«date»", "owner": "@translator-handle" }
  ]
}
```

**Rules:**

1. **It must shrink, not grow.** The audit fails if the count for any locale increases between commits.
2. **Every entry has an owner.** No anonymous backlog.
3. **Every entry has a date.** Entries older than «TRANSLATION_SLA» fire a stale-allowlist warning (and a tracking issue).
4. **The default locale has no allowlist.** A miss there is a build failure, never an allowlisted backlog item.
5. **Seeding only happens at new-locale rollout.** After §6 step 4, the allowlist is the baseline for that locale and only goes down.
6. **A new key landing in `«DEFAULT_LOCALE»` is NOT auto-allowlisted in other locales.** It enters the next translator handoff (§7); within `«TRANSLATION_SLA»` it must either be translated or explicitly allowlisted by the owner.

**Reading the trend:** the audit prints per-locale allowlist counts. If `pl` was 12 last week and is 14 today, the build fails — somebody added two un-translated keys without going through the handoff or owner-allowlist path.

---

## 10. AI workflow integration

AI systems (Claude Code / Cursor) generating UI MUST:

- read `«I18N_ROOT»/«DEFAULT_LOCALE»/*.json` and *reuse* an existing key before creating a new one;
- never inline a user-facing string in JSX/HTML;
- name new keys per §3 (`namespace.feature.element.variant`);
- add the new key to `«DEFAULT_LOCALE»` in the same diff that introduces the `t(…)` call (the audit catches it otherwise);
- NOT speculate translations in non-default locales — those go through the translator handoff (§7);
- preserve interpolation placeholders across locales (`{{name}}` stays `{{name}}`, not `{{imię}}`);
- not edit the §9 allowlist to silence the audit — that's an owner decision, not a model decision.

---

## 11. Cross-references

- `BRAND_VOICE_GUIDELINE.md` — voice & tone per locale; translator context for §7 handoffs;
- `QUALITY_ASSURANCE.md` §4 — the QA gate where `«I18N_AUDIT_CMD»` runs;
- the SEO doc — hreflang implementation + multi-locale sitemap (`MANAGER_SEO` owns this; do not restate);
- `DESIGN_SYSTEM.md` — component rendering in different scripts (line-height per script, truncation rules).

---

End of TRANSLATION_WORKFLOW.
