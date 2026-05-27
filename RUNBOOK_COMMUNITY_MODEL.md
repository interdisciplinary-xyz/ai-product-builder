# Community Model

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_COMMUNITY_MODEL` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/COMMUNITY_MODEL.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The framework (growth strategy → viral loop → distribution channel → segments → content → anti-patterns) is generic; the example loop steps, surfaces, and channels are placeholders to replace with your product's specifics.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` — the product whose growth model this is
> - `«GROWTH_LOOP_STEPS»` — the ordered steps of the core acquisition loop
> - `«VIRAL_SURFACE»` — the shareable artifact that drives the loop (e.g. a public profile/result page) and its share mechanics
> - `«DISTRIBUTION_CHANNEL»` — the channel that extends the loop (e.g. a chat-app bot) and its commands/actions
> - `«VIRAL_INSIGHT»` — the key insight about why non-users still get value

## Growth Strategy

(What to write here: describe the high-level acquisition engine — what powers growth and what it deliberately avoids. State whether growth is organic, paid, sales-led, etc.)

«PROJECT»'s growth is designed around «GROWTH_ENGINE» (e.g. organic sharing, not marketing spend). The core loop:

(List the ordered `«GROWTH_LOOP_STEPS»` — the repeatable sequence a user goes through that pulls in the next user. One slot per step; replace each.)

1. «loop step» (e.g. user takes the core action — completes the onboarding flow)
2. «loop step» (e.g. user receives a valuable, shareable artifact)
3. «loop step» (e.g. user shares the artifact via «VIRAL_SURFACE» with peers)
4. «loop step» (e.g. recipients sign up to create/get their own)
5. «loop step» (e.g. adoption spreads to the recipient's wider group/org)

## Viral Loop

(What to write here: name the single artifact that drives sharing — the `«VIRAL_SURFACE»` — and describe the on-page mechanics that turn a viewer into a sharer or signup.)

The «VIRAL_SURFACE» (e.g. public result page) is the growth engine. Each instance includes:

- «share mechanic» (e.g. a shareable URL with one-tap share + clipboard fallback)
- «conversion CTA» (e.g. a CTA aimed at logged-in or anonymous visitors)
- «gated element» (e.g. an element that prompts signup or upgrade)

**Key insight:** «VIRAL_INSIGHT» (e.g. explain why the artifact is valuable even to people who don't use the product, so recipients get value without signing up, which creates pull to make their own).

## «DISTRIBUTION_CHANNEL» Distribution

(What to write here: describe a secondary channel that extends the loop into a new surface — e.g. a chat-app bot, a browser extension, an embed. List the user-facing commands/actions and how results link back to the core product.)

The «DISTRIBUTION_CHANNEL» (e.g. chat-app bot) extends the viral loop into «context» (e.g. teams/workspaces):

- `«command/action 1»` — «what it does»
- `«command/action 2»` — «what it does»
- «how results link back to the core web app»

(Repeat per command/action.)

«note on how adoption in one group creates visibility for adjacent groups in the same context» (one line).

## Community Segments

(What to write here: one row per audience segment — who they are, what they do on the platform, and why they matter to the business. Keep the headers; replace the placeholder row.)

| Segment        | Description                  | Value to platform                |
| -------------- | ---------------------------- | -------------------------------- |
| «Segment name» | «Who they are / what tier»   | «Why they matter (revenue, content, network effects, distribution)» |

(One row per «segment».)

## Content Strategy

(What to write here: describe how content is produced — user-generated artifacts, CMS-authored posts, etc. — and how it feeds marketing/SEO. Name the system and where content lives.)

«Describe the content production model — e.g. user profiles/results plus a CMS-backed blog — and how it underpins content marketing and SEO. Note where content is authored and served (e.g. `/blog`).»

## Anti-Patterns to Avoid

(What to write here: list the growth tactics this product deliberately refuses, with a one-line reason each. Replace the placeholder examples with your own boundaries.)

- «anti-pattern» (e.g. don't gamify — no badges/streaks/leaderboards)
- «anti-pattern» (e.g. don't spam — no email drip campaigns)
- «anti-pattern» (e.g. don't nag — no pestering notifications)
- «anti-pattern» (e.g. don't moralize)
