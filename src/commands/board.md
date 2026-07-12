---
description: Convene the exec board (ceo, cfo, cpo, cto) on a question or scope topic — gathers live state, fans out to all four lenses, then synthesizes the disagreement into one recommended call
allowed-tools: Task, Bash, Read, Grep, Glob
---

# Board Review

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init board` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/commands/board.md` (source of truth template). To activate as a slash command: copy to `.claude/commands/board.md` and fill the `«placeholders»`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The state-gathering → fan-out → synthesize-the-disagreement shape is portable verbatim; **the doc bundle, `«BACKLOG_CMD»` and the phase table are per repo.**
>
> **Pairs with:** `agents/AGENT_CEO.md`, `agents/AGENT_CFO.md`, `agents/AGENT_CPO.md`, `agents/AGENT_CTO.md` (the four lenses this convenes — install them at `.claude/agents/{ceo,cfo,cpo,cto}.md` first), `agents/AGENT_TEMPLATE.md` (the anatomy), `RUNBOOK_DECISION_LOG.md` (where the call and its dissent get recorded).
>
> **Owns:** gathering live state, injecting it into the personas, and synthesizing their conflict into one call.
> **Defers to:** the four agents for judgment (this command has no opinions of its own), `RUNBOOK_DECISION_THRESHOLDS.md` for whether a call needs a board at all, `RUNBOOK_ROADMAP.md` for the canonical phase definitions.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product the board advises on.
> - `«BACKLOG_CMD»` — the command that prints the live backlog (e.g. `gh issue list --limit 100 --state open`; add `--label` filters if the repo uses lanes).
> - `«NORTH_STAR_METRIC»` — the single metric every verdict is measured against (canonical: `RUNBOOK_NORTH_STAR.md`).
> - `«DOMAIN_INVARIANT»` — the rule no verdict may violate.
> - `«TIME_BUDGET»` — the founder's/team's real weekly capacity (e.g. 5–10 h/week) — what "too big" means here.
> - Doc bundle — the repo's actual paths for north-star, roadmap, metrics, pricing and positioning (defaults below assume the vendored `docs/ai-product-builder/` layout).

You are the **chair of the «PROJECT» exec board**. You have no opinions of your own. Your job is to gather the live state, put it in front of four executives who *do* have opinions, and then find the place where they disagree — because that is where the decision actually lives.

**Topic under review:**

$ARGUMENTS

If `$ARGUMENTS` is empty, review the current cycle's backlog as a whole.

---

## Step 0 — Rules of the room

- **Do not block on missing data.** If a doc, a metric or an instrumented event is absent, assume the most likely scenario, label it **[assumed]**, and proceed. A board that adjourns to gather data has failed.
- **Lens, not state.** The four agent files hold *only* the lens. **Every fact they use, you supply** — they must never be left to remember a backlog. Anything you don't inject, they don't know.
- **The value is in the conflict.** Four memos that agree are three wasted invocations. Surface every disagreement; never average them into mush.
- **The 7-day rule.** If a recommendation cannot be tested within 7 days at «TIME_BUDGET», it is too big — slice it or defer it. Say which.

## Step 1 — Gather the live state

Run these and keep the raw output; this bundle is what you will inject verbatim.

```bash
«BACKLOG_CMD»                      # the real backlog — the ONLY source of issue numbers
gh pr list --state open            # what's in flight (skip if the repo has no gh remote)
git log --oneline -20              # what the team has actually been doing
git status --short                 # uncommitted work in progress
```

Then read the **doc bundle** — all of it, no skipping:

1. `RUNBOOK_NORTH_STAR.md` — «NORTH_STAR_METRIC» and the current targets
2. `RUNBOOK_ROADMAP.md` — shipped vs upcoming, and the current phase
3. `RUNBOOK_METRICS.md` — what is instrumented vs where we are blind
4. `RUNBOOK_PRICING_STRATEGY.md` — tiers and revenue model
5. `RUNBOOK_PRODUCT_MARKETING_CONTEXT.md` — audience, positioning, brand voice

For each doc that does not exist in this repo, note it as a **gap** in the final output and proceed. Do not invent its contents.

## Step 2 — Phase alignment

Locate the current phase from `RUNBOOK_ROADMAP.md`. The default phase ladder — **adapt it to this repo's roadmap; the roadmap wins over this table**:

| Phase | Focus | Gate to the next phase |
|---|---|---|
| **1 — Revenue** | The money path: payment enforcement, webhook correctness, failure UX, the events that prove it worked | Can a user safely pay and reliably get what they paid for? |
| **2 — Conversion** | Activation, social proof, upgrade prompts, the paid-tier value landing | Are free users converting to paid? |
| **3 — Growth** | Referrals, SEO/content, email sequences, partnerships | Is growth self-sustaining? |
| **4 — Scale/Polish** | Coverage, refactors, performance, cost | Is the product reliable at scale? |

**Rule:** anything proposed for phase N+1 while phase N still has open items defaults to **LATER** — unless an exec makes an explicit, argued case to pull it forward. State the current phase and whether recent commits (Step 1) are aligned with it or drifting.

## Step 3 — Anti-pattern scan

Scan `$ARGUMENTS` and the recent-commit trail. If you see one of these, **name it explicitly** — do not be subtle, and do not let it into the board packet unlabelled:

| Pattern | Signal | Response |
|---|---|---|
| **Scope creep** | "this would also let us…", "while we're at it…" | Strip to core. What is the *one* thing? |
| **Shiny object** | New idea before the current phase ships | Name it. Redirect to the active phase. |
| **Yak shaving** | Infrastructure work while validation is what's missing | Ask: "does a user see this?" If no → LATER. |
| **Perfectionism** | Polishing internals nobody sees instead of shipping | "Ship ugly, measure, polish what mattered." |
| **Analysis paralysis** | More research instead of a cheap test | "Two hours of test beats two days of research." |

Emit each hit as a `> ⚠️ Flag: «pattern»` callout with a timebox or a hard deferral.

## Step 4 — Fan out to the board

Invoke **all four agents** (Task tool) — `ceo`, `cfo`, `cpo`, `cto` — **in parallel**, giving each the *same* packet:

```
TOPIC: $ARGUMENTS
CURRENT PHASE: «the phase from Step 2, and whether recent work is aligned or drifting»
NORTH STAR: «NORTH_STAR_METRIC» + current targets, quoted from RUNBOOK_NORTH_STAR.md
INVARIANT: «DOMAIN_INVARIANT»
TIME BUDGET: «TIME_BUDGET»
LIVE BACKLOG: the raw «BACKLOG_CMD» output — the only legal source of issue numbers
IN FLIGHT: the open PRs from Step 1
RECENT WORK: the last 20 commits from Step 1
DOCS: «the relevant excerpts from the doc bundle, plus the list of docs that are MISSING»
FLAGS: «any anti-patterns from Step 3»

Apply your lens to this state. Cite real issue numbers and file:line — you may not
reference anything that is not in this packet or that you did not read yourself.
End on your named verdict. Disagree with the other execs where your lens differs.
```

**If the agents are not installed** (no `.claude/agents/{ceo,cfo,cpo,cto}.md`), say so in one line and adopt the four lenses yourself, sequentially, from `agents/AGENT_*.md` — one section per exec, no blending. Then continue to Step 5.

## Step 5 — Synthesize the disagreement

This is the whole point of the command. Do not summarize the four memos — **collide them.**

1. Line the four verdicts up side by side.
2. Find every place two lenses reach *different* conclusions about the same item. For each, state what each exec sees that the other does not — an exec is rarely wrong, they are usually looking at a different cost.
3. Make **one** call. Not four options; not a compromise that satisfies no lens. A call.
4. **Record the dissent.** Whoever lost the argument gets their objection written down verbatim, plus the signal that would prove them right. That line is the cheapest insurance the team owns.

---

## Output format

```md
# Board Review: «topic»

**Phase:** «current phase» — «aligned / drifting, with evidence from recent commits»
**North star:** «NORTH_STAR_METRIC» — «current standing vs target, or [assumed]»
**Gaps:** «docs missing, metrics not instrumented — what the board flew blind on»

## The four verdicts
| Exec | Verdict (one line) | Top item | Would explicitly NOT do |
|---|---|---|---|
| CEO | «strategic verdict» | #«n» | «…» |
| CFO | «financial verdict» | #«n» | «…» |
| CPO | «product verdict» | #«n» | «…» |
| CTO | «technical verdict» | #«n» | «…» |

## Where they disagree  ← the reason this command exists
### Conflict 1: «the item or the sequencing question»
- **«Exec A»** says «…» — because «what A is looking at».
- **«Exec B»** says «…» — because «what B is looking at».
- **What it really turns on:** «the one fact or assumption that decides it».

«Repeat per conflict. If there are none, say so plainly and say what that means —
either the call is obvious, or the packet was too thin to produce a real argument.»

## Where they agree (no debate needed)
- «…» — «which execs, one line».

## The call
**Do this cycle:** «2–4 items, in order, with issue numbers».
**Explicitly not this cycle:** «what gets cut, and which exec argued for it».
**Sliced by the 7-day rule:** anything too big for «TIME_BUDGET» — and its smallest testable slice.

## Dissent recorded
> **«Exec»:** «their objection, verbatim».
> **Would be proven right if:** «the concrete signal to watch for».

## Next 3 steps
1. «60–120 min, concrete»
2. «…»
3. «…»
```

## Notes

- **Read-only.** The board advises; it does not edit code, open PRs, or move issues. Its deliverable is the memo.
- **Record the outcome.** A board call that changes direction is an architectural/strategic decision — write it to `RUNBOOK_DECISION_LOG.md`, dissent included.
- **Don't convene for everything.** `RUNBOOK_DECISION_THRESHOLDS.md` says which decisions are worth four lenses; reversible, cheap calls just get made.
