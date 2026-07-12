# Launch target list — first «FIRST_COHORT_SIZE» users

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_LAUNCH_TARGET_LIST` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_LAUNCH_TARGET_LIST.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`. Consider **gitignoring the localized copy** once real names are in — the list is sensitive.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (ICP fit-scoring rubric (1–5) → table columns → source-mining checklist → out-of-scope), then replace every «placeholder» with your product's facts. The rubric levels stay the same; the **definitions** of each level come from your `ICP.md`.
>
> **Pairs with:** `RUNBOOK_ICP.md` (source of truth for who counts as a 5/5 vs. 4/5 — pull the persona definitions from there, don't reinvent them here), `RUNBOOK_OUTREACH_TEMPLATES.md` (the copy you'll send each row), `RUNBOOK_LAUNCH_SOCIAL.md` (the channels these names live on), `MANAGER_LAUNCH_GTM.md` (the cohort gates this list is sized for). The outreach log (`docs/OUTREACH_LOG.md`) is the per-send tracking companion.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` — product name
> - `«FIRST_COHORT_SIZE»` — the activated-user cohort this list is sized to fill (e.g. 15, 25, 50)
> - `«ACCEPTANCE_RATE_ESTIMATE»` — expected acceptance rate for warm/warm-ish outreach (e.g. 35–50%; under 50% for cold-ish, over 50% for personal-network)
> - `«ATTEMPT_TARGET»` — derived: `«FIRST_COHORT_SIZE» × 2 / «ACCEPTANCE_RATE_ESTIMATE»` (e.g. 15 × 2 / 0.35 ≈ 80 names)
> - `«ICP_PERSONA_A/B/C»` — the personas from `ICP.md`, mapped onto the rubric below
> - `«SOURCES»` — the source channels you'll mine names from (LinkedIn, Slack communities, Reddit, founder network, etc.)

---

> **Purpose:** the named humans you'll DM / email / @-mention during the launch's outreach phase. **Source-of-truth list — fill this in BEFORE the first outreach goes out**, then work it sequentially.
>
> **Volume math:** target `«FIRST_COHORT_SIZE»` activated users → roughly `«FIRST_COHORT_SIZE» × 2` signups (activation buffer) → roughly `«ATTEMPT_TARGET»` named outreach attempts at `«ACCEPTANCE_RATE_ESTIMATE»` acceptance rate. Add a buffer for the inevitable churn before activation: target **≥`«ATTEMPT_TARGET»` names with ICP fit ≥ 4**.
>
> **Privacy:** consider gitignoring this file once names are in. The committed template should be empty.
>
> **Pair with:** `docs/OUTREACH_TEMPLATES.md` (the copy you'll send) + `docs/OUTREACH_LOG.md` (the per-send tracking).

---

## ICP fit-scoring rubric

The rubric levels are universal; the **definitions** of each level come from `ICP.md` (don't reinvent personas here — pull them from there).

| Fit  | Definition (fill from `ICP.md`)                                                          | Action       |
| ---- | ------------------------------------------------------------------------------------------------ | ------------ |
| 5/5  | Perfect ICP match — `«ICP_PERSONA_A»` with a visible recent signal (post, talk, public friction) | Send first   |
| 4/5  | Strong ICP match — `«ICP_PERSONA_B»` (the next-closest persona) OR `«ICP_PERSONA_A»` without recent signal | Send second  |
| 3/5  | Adjacent — `«ICP_PERSONA_C»` (individual contributor / adjacent role in the right context)        | Send if room |
| 2/5  | Out of ICP but high downstream leverage (newsletter writer, podcast host, founder-of-adjacent)    | Send last; expect zero direct conversion |
| 1/5  | Not ICP, no leverage angle                                                                       | **Drop. Don't send.** |

**Aim for:** ≥ 75% of the `«ATTEMPT_TARGET»` names at fit ≥ 4. Below that, the conversion math doesn't work — you're sending into noise, and the founder's outreach hours are gone.

---

## The list

| #   | Name | How you know them | Channel | ICP fit (1-5) | Status |
| --- | ---- | ----------------- | ------- | ------------- | ------ |
| 1   |      |                   |         |               |        |
| 2   |      |                   |         |               |        |
| 3   |      |                   |         |               |        |
| …   |      |                   |         |               |        |

> **Add rows up to** `«ATTEMPT_TARGET»`. Don't pre-allocate empty rows beyond that — empty rows in version control are noise.

**Status values:** `not-sent`, `sent`, `responded`, `signed-up`, `paid`, `passed` (polite no), `bounced` (no response after the only allowed touch).

---

## Source-mining checklist

Strategies for filling the rows above. Work each systematically; track which source actually produces names that convert (the source mix changes per launch).

- [ ] **LinkedIn — your first-degree connections** filtered by the job titles `ICP.md` flags as primary persona. ~20% of `«ATTEMPT_TARGET»` should come from here.
- [ ] **LinkedIn — second-degree** to your strongest mutuals; ask each mutual for 1 intro. ~5 strong mutuals → ~10% of `«ATTEMPT_TARGET»`.
- [ ] **Slack / Discord communities you're active in** — DM the founder + 2–3 people you've engaged with substantively. ~15% of `«ATTEMPT_TARGET»`.
- [ ] **Founder-network advantage** — past colleagues, past clients, anyone you've worked with at companies in your ICP. ~15–20% of `«ATTEMPT_TARGET»`.
- [ ] **Recent posts on relevant topics** — search LinkedIn / X / Reddit for the friction your product names, in the last 30 days. Each engaged poster is a target. ~15% of `«ATTEMPT_TARGET»`.
- [ ] **Newsletter writers / podcast hosts** in adjacent spaces — 2/5 ICP fit but high downstream-leverage if they cover the product. ~5–10% of `«ATTEMPT_TARGET»`.
- [ ] **Geographic / linguistic advantage** — if the founder has a network in a region or language an international competitor doesn't, over-index here. ~10–15% of `«ATTEMPT_TARGET»`.

Total target: `«ATTEMPT_TARGET»` names. Adjust per row if your lists run thin in one channel — over-index on what works; don't grind a channel that's producing fit-2s.

---

## Working the list

Cadence and pacing (defers to the LAUNCH_GTM manager's per-channel cadence):

- **Per-day volume:** 5–7 manual outreach attempts / day for ~7 days. Founder can read every reply same-day at this pace.
- **Personalisation budget:** ~10 seconds per row to fill the `[ONE reason]` slot in `OUTREACH_TEMPLATES.md`. Not zero, not a minute.
- **One touch only** at this gate. The "no follow-up" promise is part of why people respond at all — breaking it kills the model.
- **Sequence:** fit 5 first, then fit 4. Don't dilute the warmer attempts with fit-3s until you've worked the higher fits.

---

## Out of scope for this list

- **Cold-list scraping tools** (Apollo, Hunter, Lemlist) — defer to post-PMF. The first cohort is warm-ish only; cold scaling is a different motion (per the LAUNCH_GTM manager).
- **Automated DM sequences** — explicit kill per the LAUNCH_GTM manager's anti-patterns. The personalisation IS the conversion at this cohort size.
- **Anyone whose only signal is "looks like a SaaS founder"** — wrong audience for most products. Drop. Founder communities are channels, not target lists.
- **Anyone you'd be embarrassed to follow up with in 90 days** — if the outreach feels icky now, it'll feel worse later. Drop.

---

_Defers persona definitions to `ICP.md`; defers outreach copy to `OUTREACH_TEMPLATES.md`; defers per-channel cadence + kill criteria to the LAUNCH_GTM manager. This doc is the source-of-truth for the named-target list and the fit-scoring rubric._
