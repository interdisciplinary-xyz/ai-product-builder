# Outreach templates — first «FIRST_COHORT_SIZE» users

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_OUTREACH_TEMPLATES` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/OUTREACH_TEMPLATES.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (channel taxonomy → per-template "why this works" → anti-pattern pairs → cadence rules), then replace every «placeholder» with your product's facts. The personalisation slots (`[name]`, `[ONE reason]`, `[SPECIFIC thing]`) are non-negotiable — copy-paste with placeholders intact converts at < 5%.
>
> **Pairs with:** `RUNBOOK_LAUNCH_TARGET_LIST.md` (who you're sending to), `RUNBOOK_LAUNCH_SOCIAL.md` (the channels these templates live on), `RUNBOOK_LAUNCH_NARRATIVE.md` (the founder-voice these templates inherit), `RUNBOOK_BRAND_VOICE_GUIDELINE.md` (voice rules), `MANAGER_LAUNCH_GTM.md` (per-channel cadence + kill criteria). If the user's Claude session has the `launch-storyteller` skill installed, defer drafting + voice critique to that skill; if the `creator-economy-growth-lead` skill is present, defer outreach copy review to it.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + canonical URL
> - `«ONE_LINER»` — the one-liner from `PRODUCT_POSITIONING.md` (audience repeats this back)
> - `«FIRST_COHORT_SIZE»` — the cohort size (e.g. 15, 25, 50)
> - `«UTM_CAMPAIGN»` — the campaign tag (per `RUNBOOK_LAUNCH_SOCIAL.md`)
> - `«PRIMARY_CTA»` — the single ask (e.g. "take the 5-min survey", "try the free demo")
> - `«FOUNDER_NAME»` — the sender; founder-voice means a named human signs it
> - `«COMMUNITIES»` — the Slack / Discord / forum communities the founder is a member of

---

> **Tone rule for everything below:** founder-to-human, not marketer-to-segment. The recipient should be able to tell you spent 10 seconds personalising the message — not zero, not a minute. **The templates are the SCAFFOLDING; the personalisation is the conversion.**
>
> **Tracking:** every outbound link carries a UTM. Format: `?utm_source=<channel>&utm_medium=<dm|email|reply>&utm_campaign=«UTM_CAMPAIGN»`. Defers to `LAUNCH_SOCIAL.md` for the full UTM convention.
>
> **Volume target for the first `«FIRST_COHORT_SIZE»` users:** ~30–40 outreach attempts (50% acceptance is generous; expect closer to 35% at this quality bar). Plan 5–7 / day for 7 days. Defers to the LAUNCH_GTM manager for cadence enforcement.

---

## Channel taxonomy

Five outreach channels at the first-cohort gate. Each has a different message shape, length, and `[personalisation slot]` count.

| Channel              | Length         | Personalisation slots | Best for                                | Per-day volume |
| -------------------- | -------------- | ---------------------- | --------------------------------------- | -------------- |
| **DM (warm)**        | 2 sentences    | `[name]` + `[ONE reason]` | First-degree network                  | 3–5            |
| **DM (cold-ish)**    | 3 sentences    | `[name]` + `[SPECIFIC post they wrote]` | People found via a signal you saw | 2–3            |
| **DM (community)**   | 3 paragraphs   | One reference to the community         | `«COMMUNITIES»` you're an active member of | 1 / community |
| **Email (warm)**     | ~150 words     | `[name]` + `[SPECIFIC: shared context]` + a specific ask | Warmer than DM-warm; people you've worked with | 3–5 |
| **Reply (Twitter / Reddit)** | < 200 chars | One reference to what OP said | Threads where someone described the friction your product names | 2–3 |

The "per-day volume" totals across channels should sum to ~5–7 attempts / day. Above that, personalisation quality drops; below that, the cohort math doesn't work in 7 days.

---

## 1. DM templates (LinkedIn / Slack / Telegram / Twitter DM)

### v1 — to someone in your existing network (warm)

> Hey [name], built a thing called `«PROJECT»` — `«ONE_LINER»`. Wanted to put it in front of you specifically because [ONE reason: "you've talked about [the friction the product names]" / "you manage a [team in the ICP]" / "you've shipped [adjacent thing] before"]. 30s look? [`«DOMAIN»?utm_source=<channel>&utm_medium=dm&utm_campaign=«UTM_CAMPAIGN»`]

**Why this works:**

- 2 sentences, 1 link. Below the "I'll read this later" threshold.
- The `[ONE reason]` slot is non-skippable — if you can't fill it in, don't send it. Outreach without that filled converts at < 5%.
- "30s look" gives the recipient an explicit small ask. They can deliver on 30 seconds without flinching.

**Anti-pattern (paired):** "Hope you're doing well! Wanted to ask if I could grab 15 minutes of your time to walk you through a thing I'm building…" — drop the throat-clearing, drop the meeting ask. Get to the point + the small ask.

### v2 — to someone you don't know but found via a relevant signal

> [name] — saw your [post / comment / talk] about [SPECIFIC thing they said]. Built `«PROJECT»` for exactly that pattern: `«ONE_LINER»`. Free tier covers `«PRIMARY_CTA»`. [`«DOMAIN»?utm_source=<channel>&utm_medium=dm&utm_campaign=«UTM_CAMPAIGN»`]
>
> If it's irrelevant to your week, just ignore — no follow-up.

**Why this works:**

- The "ignore — no follow-up" line is counter-intuitive and converts. Removes the social-debt anxiety that kills cold-outreach response rates.
- Specificity in the post-reference proves you actually read their content. Vague reference ("loved your recent posts") reads as a bot.

**Anti-pattern (paired):** "I noticed you're interested in [BROAD TOPIC] and thought you might like to know about [PROJECT]" — vague + generic + lead-gen-shaped. Drop.

### v3 — community member (Slack / Discord / forum where you're already active)

> Just shipped `«PROJECT»` — `«ONE_LINER»`. Built for people who [recognisable trait from `LAUNCH_NARRATIVE.md` Beat 5].
>
> Posting here because this community is the closest match for the people we built it for. [`«DOMAIN»?utm_source=slack-community&utm_medium=post&utm_campaign=«UTM_CAMPAIGN»`] — free tier, no card needed. Feedback welcome (especially the "this missed the point" kind).

**Why this works:**

- "Posting here because" is the explicit acknowledgement that this is community-aware promotion, not drive-by spam. Most communities tolerate this if it's once and the value prop matches.
- "Especially the 'this missed the point' kind" signals you're after honest feedback, not high-fives. Counter-signal that converts.

**Anti-pattern (paired):** posting the same body in three communities in a row, or following up the post with a DM to specific community members. Both burn the community.

---

## 2. Email — warm, longer

> Subject: A weird ask
>
> Hey [name],
>
> I built something and I want it in front of someone whose feedback I'd actually act on. You're on a short list of those people because [SPECIFIC: "we worked together at X" / "your post on Y stuck with me" / "the way you described Z is exactly the friction"].
>
> The thing: **`«PROJECT»`**. `«ONE_LINER»`. The hypothesis: [the one-sentence hypothesis from `LAUNCH_NARRATIVE.md` beat 2].
>
> What I want from you: [a specific 5-minute ask that's also exactly the data you need — e.g. "5 minutes to take the survey, then 30 seconds to email me back saying which sentence in the generated output is most accurate and which is the most off"].
>
> If you're slammed, just delete this. I won't follow up. If you're curious — [`«DOMAIN»?utm_source=email&utm_medium=warm&utm_campaign=«UTM_CAMPAIGN»`].
>
> — `«FOUNDER_NAME»`

**Why this works:**

- "A weird ask" subject line opens at 50%+ in personal email. Doesn't trip the "this is marketing" filter; piques curiosity.
- The ask is specific (not "any feedback would be great") — gives the recipient a clear, achievable response that's also exactly the data you need.
- Founder voice. Don't sanitise. Em-dashes in. Lower-case where you'd lower-case to a friend.

**Anti-pattern (paired):** "Subject: Quick question" + 400-word body + 3 CTAs + a calendar link. Every element fails: subject line is generic, body is too long, the CTAs compete, the calendar link is presumptuous. Kill all four.

---

## 3. Twitter / X / Reddit reply

Use these as **replies** to existing threads where someone described the friction your product names. **Don't tweet them as standalone posts** — they perform 10× better as replies in a thread the OP cares about.

### Pattern A — short, contextual:

> This is exactly the pattern `«PROJECT»` is built for. `«ONE_LINER»`. Free tier; takes longer to read this tweet than to start. [`«DOMAIN»?utm_source=x&utm_medium=reply&utm_campaign=«UTM_CAMPAIGN»`]

### Pattern B — empathy first, link second:

> The "[OP's specific phrase from the thread]" thing is the exact problem. Built `«PROJECT»` for it — [one personal-experience detail that proves dogfooding]. [`«DOMAIN»?utm_source=x&utm_medium=reply&utm_campaign=«UTM_CAMPAIGN»`]

**Why this works:**

- < 200 chars so it reads in the thread without click-to-expand.
- "I dogfooded" beats "you should try" — moves the social pressure from them to you.
- Replying inside an existing thread inherits the OP's audience for free.

**Anti-pattern (paired):** quoting the OP's tweet into your own post + "Check out [PROJECT]!" — looks parasocial, performs worse than a reply, annoys the OP.

---

## 4. Reddit — by subreddit

> Subreddit selection lives in `RUNBOOK_LAUNCH_SOCIAL.md` §Reddit. Per-sub title + body framings live here. **Never post the same body to multiple subs — rewrite for each one, every time.** Reddit auto-detection flags duplicate cross-posts and the karma damage is unrecoverable.

For each target sub, the post body follows this shape:

- **Title:** specific, personal-experience-led, NOT product-led. ("I built X" → low engagement. "I tried X for three months and here's what surprised me" → high engagement.)
- **Body:** **80% personal experience / 20% link.** Lead with: which specific thing surprised you? what changed when you used it? Then the link as a "if anyone else is curious" line, never as a CTA.
- **Tone match the sub:** read 10 recent top posts in the sub. Match their cadence, their vocabulary, their humour level. Don't import voice from another channel.

### Per-sub adaptation rules

| Sub type                       | Lead with                                                       | Avoid                                              |
| ------------------------------ | --------------------------------------------------------------- | -------------------------------------------------- |
| Primary ICP sub                | The personal-experience hook from `LAUNCH_NARRATIVE.md` beat 1  | Feature list; price; CTA-shaped language           |
| Technical-credibility sub      | One empirical thing the product got right; stack disclosure     | Marketing claims; superlatives                     |
| Identity / audience sub        | Insider language; the disclosure that you're one of them (if true) | Outsider framing; "I built this for you" energy |
| Founder-community sub          | The build story; the surprise data point; the metric you'd cut  | Pretending it's not a launch                       |
| Cross-functional / adjacent    | The bridge between their world and your product                  | Forcing-fit; spammy cross-post energy              |

**Cross-Reddit anti-pattern:** never post the same body to multiple subs. Reddit auto-detection flags duplicate cross-posts within minutes and the karma damage is unrecoverable for the product's lifetime.

---

## 5. Slack / Discord community templates

Almost identical to the DM v3 above — different communities have different volume tolerance, so adapt to each one.

| Community type                  | Tolerance                          | Best channel                                     |
| ------------------------------- | ---------------------------------- | ------------------------------------------------ |
| Curated invite-only (paid)      | Once, in `#show-and-tell` equiv.    | Single post; engage with replies for 48h         |
| Curated open-application        | Once, in `#show-your-work`         | Same                                             |
| Open-signup founder community   | Higher tolerance                   | Cross-post: forum thread + community channel     |
| Identity-defined community      | Read rules first; often forbidden  | Often: contribute first; mention product only if asked |

**Universal rule:** post once, then respond to every reply for 48h, then move on. Don't bump. Don't cross-channel within the same community.

---

## How to use these templates

1. **Pull the target list** from `docs/LAUNCH_TARGET_LIST.md`.
2. **Pick 5–7 names per day for 7 days** (sustained-pace; founder can read every reply same-day). 35 attempts → ~12–15 sign-ups expected → ~5–8 activated → matches the `«FIRST_COHORT_SIZE»` cohort bar.
3. **Personalise the `[name]` and `[ONE reason]` slots manually** — copy-paste templates with placeholders intact converts at < 5%.
4. **Track sends in `docs/OUTREACH_LOG.md`** within 60s of sending (the 60s rule keeps the discipline; otherwise the log becomes Friday-evening guesswork). Columns: name · channel · date sent · response received Y/N · signed up Y/N · plan tier · notes.
5. **No follow-ups** for the first `«FIRST_COHORT_SIZE»`. The "no follow-up" promise is part of why people respond at all; breaking it kills the model. Once the cohort gate is passed (per the LAUNCH_GTM manager), revisit.

---

## Cadence rules

- **One touch per name** at this gate. Period. Re-touching is a post-PMF motion.
- **5–7 attempts / day, 7 days.** Higher volume → personalisation drops → conversion drops. Lower volume → the cohort doesn't fill in time → momentum dies.
- **60-second log discipline.** Logging within 60s of send keeps the data clean; batching kills the data.
- **Reply within 24h** to every response. Slower than 24h reads as "this is automated"; even "got it, will reply tomorrow" beats silence.
- **Kill criterion (per channel, from the LAUNCH_GTM manager):**
  - DM-warm: < 30% acceptance after 30 sends → rewrite `[ONE reason]`, resend 10, re-check
  - DM-cold-ish: < 15% acceptance after 20 sends → channel isn't fit; reallocate hours
  - Email-warm: < 30% reply rate after 20 sends → rewrite subject + ask, resend 5, re-check
  - Community: 0 signups after 3 communities → community network isn't the fit

---

## Outreach-log template (`docs/OUTREACH_LOG.md`)

```markdown
# Outreach log

| Date | Name | Channel | Template variant | Response? | Signed up? | Plan | Notes |
| ---- | ---- | ------- | ---------------- | --------- | ---------- | ---- | ----- |
|      |      |         |                  |           |            |      |       |
```

Fill in within 60s of sending each one.

---

## Out of scope for these templates

- **Cold-email sequences with follow-ups** — defer to post-PMF.
- **Paid social ad copy** — defer per the LAUNCH_GTM manager (unit economics pressure-test required first).
- **LinkedIn DM automation tools** — explicit kill. Manual outreach for the first `«FIRST_COHORT_SIZE»`; the personalisation is the conversion.
- **Re-engagement of a "no response" target** — one-touch only at this gate. Re-touching is a post-PMF motion that requires fresh consent signal.

---

_Defers persona definitions to `ICP.md`; defers target list to `LAUNCH_TARGET_LIST.md`; defers UTM convention to `LAUNCH_SOCIAL.md`; defers voice rules to `BRAND_VOICE_GUIDELINE.md`; defers per-channel cadence + kill criteria enforcement to the LAUNCH_GTM manager. This doc is the source-of-truth for the per-template scaffolding and the "why this works" annotations._
