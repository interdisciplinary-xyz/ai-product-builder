# User research scripts

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_USER_OBSERVATION` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/USER_RESEARCH.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (set-up + moderator mindset → observation script (5 tasks) → PMF Sean Ellis interview (4-question core + scoring + Ulysses-pact bands) → anti-patterns → post-session capture), then replace every «placeholder» with your product's facts.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product being researched
> - `«CORE_FLOW»` — the end-to-end user journey the observation covers (e.g. landing → core action → result → upgrade prompt)
> - `«VALUE_ARTEFACT»` — the thing the product produces that the user takes away (the artefact of value)
> - `«ICP_PERSONAS»` — who you're trying to recruit
> - `«ACTIVATION_DEF»` — the activation event that gates PMF interview recruiting
> - `«PMF_COHORT_SIZE»` — how many activated users you survey (e.g. 15–40)
> - `«PMF_STRONG» / «PMF_MID_LO» / «PMF_MID_HI» / «PMF_WEAK»` — Sean Ellis decision-band thresholds

Two distinct research modes live in this doc. Pick the right one for what you're trying to learn:

| Mode | What it answers | When to run |
| ---- | --------------- | ----------- |
| **Observation / usability** | Where do users get stuck in the flow? Is the interface legible? | Before public launch; after every major flow change. |
| **PMF (Sean Ellis) interview** | Is the value prop indispensable to the people who already get it? | After `«PMF_COHORT_SIZE»` users have hit `«ACTIVATION_DEF»`. |

Don't conflate them. Observation tests *the interface*; PMF interviews test *the value prop*. Mixing them produces a 60-minute session that does neither well.

---

## Observation script — 30 minutes

A 30-minute session with one user, watching them go end-to-end through `«CORE_FLOW»` — out loud. Goal: catch the 5 things no checklist will.

### Set-up checklist

- [ ] Production-like preview URL ready (not local dev)
- [ ] One real user — ideally someone in `«ICP_PERSONAS»`, not an engineer
- [ ] Recording consent obtained (Zoom recording or Loom is fine)
- [ ] Notebook open with this script and a blank "findings" doc
- [ ] Notification noise muted on your machine — no helping nudges
- [ ] User on their own laptop, not yours — they should drive

### Mindset for the moderator

You are a fly on the wall. The temptation is to explain, to nudge, to defend, to ask leading questions. Resist all of it. Three rules:

1. **Past tense, never future** — "tell me about a time" beats "would you" or "could you imagine." Compliments are predictions; specifics are data.
2. **Their problems, not your idea** — if they don't bring up the problem `«PROJECT»` solves without prompting, that's a signal worth more than any feature reaction.
3. **Silence is data** — if they pause for 15 seconds on a screen, do not fill the silence. Wait. Then ask "what are you thinking right now?" — never "are you stuck?"

### Opening (3 min)

> "Thanks for doing this. I'm going to ask you to use a website I'm working on, while talking out loud about what you're seeing and thinking. There are no wrong answers — anything that feels confusing or weird is exactly what I need to hear. I won't help unless you're truly stuck. Sound good?"

Then:

> "Before we start — tell me about the last time you struggled with «PROBLEM_DOMAIN». What happened?"

→ Note: do they spontaneously describe a problem `«PROJECT»` could solve? If not, the landing page has a much harder selling job than you assumed.

### Task 1 — Landing page (5 min)

URL: `/`

Prompt:

> "Open this URL. Don't click anything yet. Just tell me — what does this site do, and who is it for?"

Listen for:

- [ ] Do they say the product's core concept without you prompting?
- [ ] Do they understand the product category (vs. a blog, a course, an assessment)?
- [ ] Do they notice the integrations / partner logos?
- [ ] What do they think the brand mark / hero visual means?
- [ ] Do they read the headline or skim past it?

Then: **"Now do whatever you'd normally do."** Watch where their cursor goes. Don't speak.

### Task 2 — Core action (10 min)

Prompt: _(only if they don't get there on their own within 2 minutes)_

> "I want you to try the thing the site is actually offering. See if you can find it."

Listen for:

- [ ] Where on the page do they click to start?
- [ ] Do they expect to sign up first, or take the core action first?
- [ ] At which step do they pause longest? Why?
- [ ] Do they ever get confused about what something is asking?
- [ ] Do they re-read instructions, or skip them?
- [ ] If they have to sign up mid-flow, do they bail mentally? (eyes glaze, "uh, do I have to…")
- [ ] Do they finish? If not, where exactly did they stop and why?

Tally: **how many clarifying questions did they ask?** That's a strong proxy for in-flow copy quality.

### Task 3 — The artefact / result (5 min)

Prompt:

> "OK, you finished. What do you do next?"

Listen for:

- [ ] Do they understand what `«VALUE_ARTEFACT»` _is_?
- [ ] Is the output understandable to them?
- [ ] Would they share it? With whom? Where? (this is the marketing flywheel question — if they answer "I wouldn't," dig)
- [ ] Do they spot the share / export / next-step actions?
- [ ] Do they want to edit the output? Why?

### Task 4 — Pricing (3 min)

Prompt:

> "Pretend I asked you to buy this. Walk me through what you'd do."

Listen for:

- [ ] Can they explain the differences between tiers without reading the fine print twice?
- [ ] Which tier do they pick and why?
- [ ] Does anything make them hesitate to click "upgrade"?
- [ ] If they don't understand pricing, that's not their fault.

### Closing (4 min)

Three open questions, in order:

1. **"What was the most confusing part of all this?"** — Do not defend. Write down their answer verbatim.
2. **"If you had to describe this product to a colleague in one sentence, what would you say?"** — Compare against your own homepage headline. Different = your headline is wrong.
3. **"What's the one thing that would have to be true for you to actually use this every week?"** — That's your retention bet, straight from the user.

---

## PMF (Sean Ellis) interview

Run **after** users have hit `«ACTIVATION_DEF»`. Pairs with the Sean Ellis survey trigger (fires `«SURVEY_DELAY»` after activation; see `docs/ACTIVATION_EVENT.md`).

### Sean Ellis survey — the 4-question core

Send to every user `«SURVEY_DELAY»` after they hit `«ACTIVATION_DEF»`:

1. **How would you feel if you could no longer use `«PROJECT»`?**
   - A — Very disappointed
   - B — Somewhat disappointed
   - C — Not disappointed (it isn't really that useful)
   - D — N/A — I no longer use it
2. **What type of people do you think would most benefit from `«PROJECT»`?**
3. **What is the main benefit you receive from `«PROJECT»`?**
4. **How can we improve `«PROJECT»` for you?**

The Sean Ellis percentage = share of respondents who chose **A (very disappointed)** out of all who chose A/B/C (excludes D — they're churned and answer a different question).

### Decision rules — Ulysses-pact bands

The bands below are committed to writing **before** the responses are read. Once responses land, the band's pre-committed action executes regardless of which result the team was hoping for. This prevents post-hoc rationalization.

| Sean Ellis % | Band | Pre-committed action |
| ------------ | ---- | -------------------- |
| `≥ «PMF_STRONG»` (e.g. 40%) | Strong PMF | Pour fuel — prioritize monetization, raise prices, scale acquisition. |
| `«PMF_MID_LO»–«PMF_MID_HI»` (e.g. 25–40%) | Borderline | Segment by journey/persona; fix top friction in the worst-performing segment before scaling acquisition. |
| `< «PMF_WEAK»` (e.g. 25%) | No PMF yet | Pause paid acquisition. Run 5 more interviews. Do not redesign the homepage yet — the problem is upstream of copy. |

### Qualitative follow-up — whom to interview (5–8 users)

- **Answered A (very disappointed)** — deepen what they'd miss; harvest homepage-grade verbatim quotes.
- **Answered B but activated** — understand the gap to A; this is where the product is *almost* indispensable.
- **Activated but no Sean Ellis reply** — distinguish survey friction from value gap.

### 30-minute interview structure

1. **Context (5 min)** — How they found `«PROJECT»`, what they expected.
2. **Last use (10 min)** — Walk through last session; where they got stuck; what they actually did with `«VALUE_ARTEFACT»`.
3. **Alternative (5 min)** — What they'd use if `«PROJECT»` disappeared tomorrow. (This is the key disappointment-deepener question.)
4. **Willingness to pay (5 min)** — Price reaction (do not pitch; listen).
5. **Close (5 min)** — One thing to fix in the next two weeks; permission to follow up.

### Capture template

| User | Journey | Sean Ellis | Main job-to-be-done | Blocker | Quote for homepage |
| ---- | ------- | ---------- | ------------------- | ------- | ------------------ |
|      |         | A/B/C/D    |                     |         |                    |

Route quotes back into `docs/ICP.md` under the relevant persona — that's how ICP actually evolves. If quotes only live in a separate `pmf-quotes.md` or a Slack channel, ICP ossifies.

### Qualitative quote scoring (each interview, by the moderator, within 1h)

| Score | Meaning |
| ----- | ------- |
| `★★★` | Verbatim, specific, surprising, unprompted. Goes on homepage candidate list. |
| `★★`  | Verbatim, specific, expected. Goes in ICP doc. |
| `★`   | Polite affirmation, vague, or paraphrased by moderator. Discard from quote bank; useful only as friction signal. |

A `★` quote is **not** evidence of PMF. If the quote bank is 90% `★`, the cohort is being too polite — change the recruiter, change the interviewer, or change the questions.

---

## Anti-patterns to avoid

For BOTH script types:

- "Was the X easy?" — leading; they will say yes to be polite
- "Did you like the design?" — likes ≠ behavior
- "What features would you want?" — users can't design features
- Explaining _why_ something works the way it does — defending
- Letting them off the hook when they say "it's fine" — ask "what would make it more than fine?"

PMF-specific anti-patterns:

- Surveying users who haven't hit `«ACTIVATION_DEF»` — garbage data
- Surveying `<` `«PMF_COHORT_SIZE»` users — the percentage is noise
- Verdict-shopping by re-running on a different cohort
- Skipping the Ulysses pact and deciding band actions *after* seeing the results

---

## After the session — write within 1 hour

Five things to capture while it's fresh. Cap each at 2 sentences:

1. **One verbatim quote you can't unhear.**
2. **The single most surprising moment.**
3. **The biggest friction point.**
4. **The thing they got faster than expected.**
5. **One change you'd make tomorrow.**

Then: pick exactly **one** finding to act on this week. Not three. Not five. One. Doing one thing fully beats half-doing five.

---

## Reading list / inspiration

- _The Mom Test_, Rob Fitzpatrick — 90 minutes, the only book that matters here. Re-read the customer-questions chapter before each session.
- _Don't Make Me Think_, Steve Krug — for the screen-by-screen mindset.
- Sean Ellis & Hiten Shah, _Hacking Growth_ — the survey methodology this doc encodes.

---

Adapt this script for each session. Throw away the parts that don't serve. Keep observation sessions under 30 minutes — past that, both of you fade. Keep PMF interviews under 30 minutes, period — the verbatim quotes you need land in the first 25.
