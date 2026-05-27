# Launch social posts — channel matrix

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_LAUNCH_SOCIAL` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/LAUNCH_SOCIAL.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (channel matrix → per-channel anti-patterns → order-of-operations → UTM convention → one-shot-channel gating), then replace every «placeholder» with your product's facts and write the per-channel copy in `BRAND_VOICE_GUIDELINE.md`'s voice.
>
> **Pairs with:** `RUNBOOK_LAUNCH_NARRATIVE.md` (the source post that feeds every channel framing), `RUNBOOK_OUTREACH_TEMPLATES.md` (the 1:1 DM / email scaffolding), `RUNBOOK_LAUNCH_TARGET_LIST.md` (who you're posting to reach), `RUNBOOK_BRAND_VOICE_GUIDELINE.md` (voice rules per channel), `MANAGER_LAUNCH_GTM.md` (the order-of-ops + per-channel kill criteria). If the user's Claude session has the `community-distribution-strategist` skill installed, defer channel-selection + per-community voice adaptation to that skill.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + canonical URL
> - `«ONE_LINER»` — the one-liner from `PRODUCT_POSITIONING.md`
> - `«UTM_CAMPAIGN»` — the campaign tag used across every link (e.g. `cohort-15`, `launch-q3`)
> - `«FIRST_COHORT_SIZE»` — the cohort size beat-7 of the narrative references
> - `«PRICE_POINT»` — the headline price (only mentioned where the audience asks; see HN section)
> - `«REDDIT_SUBS»` — the per-ICP shortlist of subreddits (filled per launch)
> - `«SLACK_COMMUNITIES»` — the founder-network Slack communities the founder is already a member of
> - `«PLATFORM_DIRECTORY»` — any platform-specific app directory listing (e.g. Slack App Directory, Chrome Web Store, Notion integrations) — leave empty if not applicable

---

> **Tone rule for every channel:** founder voice. No hype. Read each post out loud before posting — if a sentence sounds like marketing, kill it. Cross-reference `BRAND_VOICE_GUIDELINE.md`.
>
> **All links carry** `?utm_source=<channel>&utm_medium=<post-type>&utm_campaign=«UTM_CAMPAIGN»` so analytics attribute traffic by channel without extra wiring.
>
> **Order of operations** (non-negotiable, per `MANAGER_LAUNCH_GTM`): Twitter thread first (drives the link), LinkedIn second (drives inbound DMs), Reddit third (drives long-tail SEO + niche audiences). HN / ProductHunt only if cohort gating criteria fire.

---

## Channel matrix

| Channel                    | When to post                                    | What lands                                              | Length / format               | Kill criterion (14d)                   |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| **Twitter / X**            | Day 1 — first                                   | Founder narrative thread (5 tweets)                     | 5-tweet thread + 1 link tweet | < 200 link clicks                      |
| **LinkedIn**               | Day 2                                           | Long-form founder post + counter-intuitive insight       | ~1500 chars, 1 link           | < 50 link clicks + 0 inbound DMs       |
| **Reddit (per sub)**       | Day 3+ — 1 sub / day max                        | Rewritten body per sub; lead with personal experience    | 80% experience / 20% link     | < 50 upvotes + 0 signups in 2 subs     |
| **Slack-community**        | Days 3–5                                        | Single post in `#show-and-tell` (or community equivalent)| ~3 paragraphs + link          | 0 signups after 3 communities          |
| **Hacker News (Show HN)**  | **Only if** Twitter + LinkedIn produced ≥ 200 visits in 24h AND signup conversion ≥ 5% AND product stable (no P1 errors last 24h) | Tech-honest "Show HN" with stack disclosure + price | ~150-word body                | < 10 upvotes in first hour             |
| **ProductHunt**            | **Only if** ≥ `«FIRST_COHORT_SIZE»` organic activated users AND clean PMF read started | The launch URL with maker comment | Standard PH launch shape   | < 50 upvotes in first 4 hours          |
| **`«PLATFORM_DIRECTORY»`** | Submit in pre-launch window (1–2 week review)   | Listing copy: short (~150 chars) + long (~600 chars)     | per-directory                 | n/a (one-shot)                          |

The kill rule is **per-channel**, not per-launch. A weak Twitter thread does not kill LinkedIn.

---

## Per-channel framings (derived from `LAUNCH_NARRATIVE.md`)

### Twitter / X — main post + thread

Five-tweet thread. Each tweet does one job; cut anything else.

| Tweet | Job                                                            |
| ----- | -------------------------------------------------------------- |
| 1 — The open      | One-line `«ONE_LINER»` + the "why I built it" hook in ≤ 240 chars + 🧵 |
| 2 — What it does  | The user-facing flow in plain language; no feature list                |
| 3 — The moat      | The single feature that turns this from a quiz into a tool             |
| 4 — The demo      | Zero-commitment surface (free demo / no-signup tool) + UTM-tagged link  |
| 5 — The close     | The product link + "what I want from the first «FIRST_COHORT_SIZE»" beat from `LAUNCH_NARRATIVE.md` beat 7 |

**Why this works:**
- The thread mirrors the narrative beats. The reader gets a 30-second version of the post.
- Tweet 4 (the zero-commitment surface) converts the on-the-fence reader without forcing signup.
- Tweet 5 borrows the "I'm reading every reply" beat — it converts followers into named participants.

**Anti-pattern:** an 11-tweet "everything I learned" thread. The launch thread is for the launch; growth threads come later.

### LinkedIn — long-form post

~1500 characters, founder narrative. The shape mirrors the narrative post but at one-sixth the length: anecdote → pattern → product → counter-intuitive insight → CTA + "no follow-up" line.

**Why this works:**
- "A friend asked me…" opens with a specific person, not "I noticed that…" — algorithm + human reader both reward specificity.
- A counter-intuitive insight ("the messages I didn't send" / "the feature I cut") is the single highest-converting line. Anchors the post.
- A "no follow-up DMs" line cuts the lead-gen suspicion that kills LinkedIn launch posts. People share more when they trust they won't be re-targeted.

**Anti-pattern:** a LinkedIn post that ends with "DM me to learn more." Reads as sales. Kill.

### Reddit — by subreddit

> Per-sub Reddit guidance lives in `OUTREACH_TEMPLATES.md` §4. Subreddit-specific titles + body framings live there. **Don't post a single body across multiple subs — each one gets a rewrite, every time.**

Subreddits in launch order (fill `«REDDIT_SUBS»` per launch):

1. The **highest ICP-fit sub** (per `LAUNCH_TARGET_LIST.md` ICP rubric)
2. A **technical-credibility sub** (matters if any of your audience is engineering-adjacent)
3. **Identity / audience-defining subs** (read the rules first — most ban product promotion outright; genuine personal experience posts pass the smell test, brochure posts don't)
4. **Founder-community subs** (r/SaaS, r/startups, Indie Hackers' subs) — fewer conversions, useful feedback
5. **Cross-functional / adjacent subs** — long-tail discovery

**Rule:** post to ONE sub per day, max. Reddit's auto-detection flags simultaneous cross-posts and karma damage is unrecoverable.

**Anti-pattern:** posting the same body across multiple subs. Auto-detected within minutes; channel lost for the product's lifetime.

### Hacker News — Show HN

**Only post when** ALL of:

- Twitter thread + LinkedIn long-form together produced ≥ 200 visits in 24h
- Signup conversion from those visits is ≥ 5%
- The product is verifiably stable (no `OBSERVABILITY` P1s in the last 24h)
- The narrative one-liner is tight (audience repeats it back in Twitter replies)

If those conditions hold:

> **Show HN: `«PROJECT»` — `«ONE_LINER»`**
>
> Hi HN,
>
> [Founder-anecdote opener — 2-3 sentences, direct from `LAUNCH_NARRATIVE` beat 1.]
>
> [What it does — plain English; mirror beat 3 of the narrative. 2-3 sentences.]
>
> **Tech:** [stack disclosure — frameworks, key libraries, infra. HN expects this.]
>
> **Pricing:** Free tier, no card. Pro is `«PRICE_POINT»` for [what Pro unlocks]. I'm reading every email reply to the day-`«N»` follow-up myself for the first `«FIRST_COHORT_SIZE»` people; that's the data that tells me what to build next.
>
> Live: [link with `?utm_source=hn&utm_medium=show-hn&utm_campaign=«UTM_CAMPAIGN»`]
>
> Reading the comments. Tell me what you'd cut.

**Why this works for HN specifically:**
- Tech stack disclosure earns the audience's attention. They want to know what's under the hood.
- "Tell me what you'd cut" is the prompt for the kind of feedback HN gives well; it's also a forcing function for honest signal.
- The price disclosure preempts the inevitable "what's the pricing?" comment.

**Anti-pattern:** posting Show HN to "test the waters". HN is a one-shot per product. A weak first post burns the channel; you don't get a second.

### Slack App Directory / equivalent platform listing

> If `«PLATFORM_DIRECTORY»` is non-empty, submit in the pre-launch window (most directories have a 1–2 week review). Listing should be live for the first wave of organic discovery after launch.

Listing copy (~150 chars short + ~600 chars long):

**Short (~150 chars):**

> One-sentence what-it-does, in the directory's own framing language.

**Long (~600 chars):**

> Paragraph that mirrors `LAUNCH_NARRATIVE` beat 3 (what it does) + beat 4 (moat feature, in the directory's surface).
>
> Three command / feature bullets, formatted as the directory expects (`/command name → does X`).
>
> One sentence on who it's built for. Free tier disclosure. Price disclosure.

**Submission checklist:**

- [ ] Brand icon / logo (use the canonical OG image source)
- [ ] OAuth scopes documented (if applicable)
- [ ] Privacy policy + terms links live (per `GDPR_PRE_LAUNCH_CHECKLIST.md`)
- [ ] Test workspace / account ready for reviewers to walk through end-to-end
- [ ] Direct install / activation link prepared

---

## Per-channel anti-patterns

| Channel    | Anti-pattern                                                                  | Why it fails                                                  |
| ---------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Twitter    | 11-tweet "everything I learned" thread                                        | The launch thread is for the launch; reader bounces at tweet 5 |
| Twitter    | Quote-tweeting your own thread on day 3 to "boost it"                         | Reads as desperation; metric is link clicks, not threads      |
| LinkedIn   | Ending with "DM me to learn more"                                             | Reads as sales; "no follow-up DMs" line converts better       |
| LinkedIn   | Posting a screenshot of the Twitter thread                                    | Cross-platform copy-paste reads as low-effort                 |
| Reddit     | Same body across multiple subs                                                | Auto-detected; karma damage unrecoverable                     |
| Reddit     | Posting on day 1 without lurking the sub first                                | Sub rules vary wildly; mods ban on sight                      |
| Reddit     | Posting in the "promotion" subs ONLY                                          | Audience is other founders, not your ICP                      |
| Slack      | Posting in `#general` of a community                                          | Use `#show-and-tell` (or equivalent); `#general` is for the community |
| Slack      | Posting + bumping the post next day                                           | Universal rule: post once, then respond to replies for 48h, move on |
| HN         | Posting before the narrative is tight                                         | Comments dissect the one-liner; if it's loose, the post collapses |
| HN         | Posting to "test the waters"                                                  | One shot per product. Wait for the gate.                       |
| PH         | Launching at < 50 activated users                                             | One shot per product. Wait for organic momentum to compound.   |
| Any        | Forgetting the UTM tag                                                        | Channel attribution becomes guesswork; you can't kill what you can't measure |

---

## UTM convention

Every outbound link from a launch surface carries:

```
?utm_source=<channel>&utm_medium=<post-type>&utm_campaign=«UTM_CAMPAIGN»
```

- `utm_source` — the channel (`x`, `linkedin`, `reddit`, `hn`, `slack-community`, `«PLATFORM_DIRECTORY»`, `email`)
- `utm_medium` — the post type (`thread`, `long-form`, `post`, `reply`, `dm`, `show-hn`, `listing`)
- `utm_campaign` — the single campaign tag for this launch (`«UTM_CAMPAIGN»` — e.g. `cohort-15`, `launch-q3`); change per launch wave so analytics segments cleanly

Optional:
- `utm_content` — when the same channel has sub-targets (e.g. `utm_content=r-<sub-name>` on Reddit) so per-sub conversion is visible

Without this, channel attribution is "I think most signups came from Twitter" — that's not data. Per the LAUNCH_GTM manager, missing-UTMs is a launch-blocker.

---

## Out of scope for this launch

> Fill per launch. Defer one-shot channels behind explicit cohort gates.

- **ProductHunt** — defer until ≥ `«FIRST_COHORT_SIZE»` organic activated users + clean PMF read. PH burns one shot per product.
- **AppSumo / lifetime deals** — defer to post-PMF. Lifetime-deal cohorts are not your PMF cohort.
- **Paid social** — defer until `unit-economics-pressure-test` skill verifies break-even conversion is achievable. Until then, every paid złoty is bet without odds.
- **Cold-email sequences (Apollo / Hunter)** — defer to post-PMF. Cold scaling is a different motion from the first-cohort warm outreach in `OUTREACH_TEMPLATES.md`.

---

_Defers narrative source to `LAUNCH_NARRATIVE.md`; defers 1:1 outreach to `OUTREACH_TEMPLATES.md`; defers voice rules to `BRAND_VOICE_GUIDELINE.md`; defers cohort gates + kill criteria enforcement to `MANAGER_LAUNCH_GTM.md`. This doc is the source-of-truth for the channel matrix and the UTM convention._
