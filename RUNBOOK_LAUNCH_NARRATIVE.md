# Launch narrative — founder-voice post

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_LAUNCH_NARRATIVE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/LAUNCH_NARRATIVE.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (founder-anecdote opener → what-it-does → moat feature → who-it's-for → CTA → "what I want from the first «FIRST_COHORT_SIZE»"), then replace every «placeholder» with your product's facts.
>
> **Pairs with:** `RUNBOOK_BRAND_VOICE_GUIDELINE.md` (voice rules — read aloud, kill brochure-sounding sentences), `RUNBOOK_LAUNCH_SOCIAL.md` (per-channel framings derived from this post), `RUNBOOK_PRODUCT_POSITIONING.md` (the underlying positioning this post dramatises), `MANAGER_LAUNCH_GTM.md` (the order-of-ops this is step 1 of). If the user's Claude session has the `launch-storyteller` skill installed, defer live drafting + voice critique to that skill.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` — product name
> - `«DOMAIN»` — primary domain
> - `«ONE_LINER»` — the single sentence the audience repeats back (positioning's load-bearing output)
> - `«FOUNDER_ANECDOTE»` — the specific, named, dated moment that prompted the build
> - `«MOAT_FEATURE»` — the feature that makes this a tool, not a quiz / report / one-shot
> - `«ICP_SENTENCES»` — 3–5 first-person sentences the target reader recognises themselves in
> - `«NOT_FOR_SENTENCES»` — 2–3 cases where the product is explicitly NOT for someone (trust signal)
> - `«CTA_PRIMARY»` — the single primary action (e.g. "Take the 5-minute survey")
> - `«CTA_SECONDARY»` — optional zero-commitment alternative (e.g. a free demo / no-signup tool)
> - `«FIRST_COHORT_SIZE»` — the first manually-reviewable cohort (e.g. 15, 25, 50)
> - `«FOUNDER_NAME»` — the byline; founder-voice means a named human signs it

---

> **Status:** DRAFT — founder review needed before publishing.
> **Target slug:** `/blog/introducing-«PROJECT»` (or `/blog/launch-«PROJECT»`)
> **Author voice:** founder-first, no marketing-speak. Read it aloud — if a sentence sounds like a brochure, kill it. Cross-reference `BRAND_VOICE_GUIDELINE.md`.
> **Pre-publish gate:** narrative lands **before** any channel post (see `MANAGER_LAUNCH_GTM` order of operations). Channels without a tight one-liner force the audience to do the positioning work — they don't.

---

## Structural beats

The shape below is what makes a launch post work as the audience-facing one-liner. Each beat earns the next; drop any beat and the post collapses into either a brochure (no anecdote) or a manifesto (no CTA).

### Beat 1 — Founder anecdote opener

Open with **one specific, named, dated moment** that prompted the build. Not "I noticed that…", not "Teams often struggle with…". A real conversation, a real friction, a real day.

> `«FOUNDER_ANECDOTE»` — e.g. "A friend asked me last month why I was spending my evenings on a side project nobody asked me to build. The honest answer was uncomfortable: …"

**Why this beat:** specificity is the trust signal. The reader recognises the shape of the friction; they stop reading marketing and start reading a person.

### Beat 2 — Name the pattern

In 1–2 paragraphs, describe the **recurring friction** the anecdote points at. Same shape every time. Compounds. Nothing gets named. End with the load-bearing sentence:

> **`«PROJECT»` is the smallest thing I could build that names it.**

**Why this beat:** the reader's "oh, this happens to me too" reaction is the conversion. Without it, the rest of the post is decoration.

### Beat 3 — What it actually does

Plain-English description of the core flow. Avoid feature lists; describe what the user experiences. Two artefacts max.

> 1. **The first artefact** — what gets generated; what makes it specific (not generic, not a horoscope).
> 2. **The second artefact** — the durable output the user can share / act on / send to a colleague.

If sharing is the distribution loop, name the friction it removes. "A shareable URL is a 10× difference in adoption" beats "frictionless sharing".

**Why this beat:** the reader needs to be able to picture the flow in 30 seconds. If they can't, they won't sign up.

### Beat 4 — The moat feature

The single feature that turns this from a quiz / one-shot / curiosity into a **tool**. The thing that keeps the user coming back. The thing competitors can't trivially replicate.

> `«MOAT_FEATURE»` — describe how it works in 2–3 bullet points; name the surface where it lives.

Personal proof beats marketing copy: "I dogfooded this for two months before opening it to anyone else. The most surprising thing wasn't X — it was Y."

**Why this beat:** the moat is the answer to "why does this exist as a separate product instead of a feature in [bigger thing]." If you can't write it, you don't have one.

### Beat 5 — Who it's for

3–5 first-person sentences the target reader **recognises themselves in**:

> `«ICP_SENTENCES»`
> - "I keep having the same misunderstanding with the same person and I can't figure out what I'm doing wrong."
> - "I've shipped X with five different companies and the same friction shows up in every team."
> - …

Then 2–3 cases where the product is **explicitly NOT for someone** — trust signal, anti-mass-appeal:

> `«NOT_FOR_SENTENCES»`
> - "If your team is two people, you don't need this."
> - "If you're already in a mature team with quarterly retros, this is a nice-to-have at best."

**Why this beat:** the "not for you" lines convert better than the "for you" lines. They prove the founder has thought hard enough about the audience to know the boundary.

### Beat 6 — CTA

One **primary** CTA, one **zero-commitment alternative**.

> [**`«CTA_PRIMARY»` →**](/«CTA_PRIMARY_PATH»)
>
> If the primary commitment is too much, [`«CTA_SECONDARY»`](/«CTA_SECONDARY_PATH») requires no signup and demonstrates the engine.

**Why this beat:** two CTAs cover the two reader types — ready-to-try and not-yet-ready. Three CTAs is too many; one is too few.

### Beat 7 — What I want from the first «FIRST_COHORT_SIZE»

The closing beat. Sets the expectation that this is **early**, that the founder is **reading every reply**, and that **specific feedback shapes what gets built next**.

> "I'm reading every email reply to the day-«N» follow-up myself. The single question is: _what's the main benefit you got from `«PROJECT»`?_ Five sentences max. If the answer converges on something I didn't expect, that's the signal that tells me what to build next."

**Why this beat:** it converts the reader from "another user" into "named participant in the first «FIRST_COHORT_SIZE»". Both the conversion rate and the feedback quality jump when this beat lands.

### Sign-off

> — `«FOUNDER_NAME»` (founder)

The byline is non-negotiable. Founder-voice means a named human signs it.

---

## Editor checklist before publishing

- [ ] Read the whole post aloud — kill anything that sounds like a brochure
- [ ] Verify the `«ONE_LINER»` from `PRODUCT_POSITIONING.md` is recognisable somewhere in beats 1–3
- [ ] Replace the `/blog/launch-«PROJECT»` slug placeholder if changed
- [ ] Verify all internal links resolve (primary CTA, secondary CTA, any inline feature links)
- [ ] Add OG image; canonical URL; meta description
- [ ] Cross-link from homepage hero secondary CTA + footer
- [ ] Add `?utm_source=blog&utm_medium=launch-post&utm_campaign=«UTM_CAMPAIGN»` to any outbound CTA so traffic is attributable (see `LAUNCH_SOCIAL.md` UTM convention)
- [ ] If multilingual: founder-written translations only (auto-translation kills the voice)
- [ ] Mobile preview sanity-check before going live

---

## Anti-patterns

- **Opening with the market or the stat.** "Teams lose X hours a week to miscommunication" — no. Open with the friend who asked you the uncomfortable question.
- **Listing every feature.** The post is the one-liner; the feature page is the feature page.
- **No "not for" section.** Trying to convert everyone converts no-one. The disqualifier IS the conversion.
- **Three CTAs.** Two is the maximum; three reads as desperate.
- **Forgetting the byline.** A launch post without a named human signing it is a press release.
- **Skipping beat 7.** Without "what I want from the first «FIRST_COHORT_SIZE»", the post reads as broadcast, not invitation.
- **Auto-translating for non-English locales.** Voice collapses into machine-cadence; the trust signal evaporates.

---

_Defers voice rules to `BRAND_VOICE_GUIDELINE.md`; defers per-channel framings to `LAUNCH_SOCIAL.md`; defers the underlying positioning to `PRODUCT_POSITIONING.md`. This doc is the source-of-truth for the founder-voice launch post itself._
