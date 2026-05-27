# Decision Log

Living record of the major architectural decisions made in this codebase. Each entry: **what was chosen**, **why**, **alternatives considered**, and **when to revisit**.

Format is informal ADR-style (single file instead of per-decision docs). Add new decisions at the bottom; supersede old ones inline rather than deleting them.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_DECISION_LOG` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/DECISION_LOG.md` and localize the items below. **Pairs with** `MANAGER_DECISION_LOG.md` (the playbook that creates & audits this log). _(Formerly named ARCHITECTURE_DECISIONS — now unified under DECISION_LOG.)_
>
> **Reusability:** template-ready — this is a true single-file ADR log; the format (Decision / Why / Alternatives / Revisit-when, append-and-supersede) is fully generic. The entries below are placeholder examples, so replace them with the target repo's own decisions.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the codebase this log belongs to.
> - `«DECISION_ENTRIES»` — replace the example ADRs (CMS, database, hosting, …) with this repo's actual decisions.
> - `«STACK_REFERENCES»` — the concrete tools named in entries (e.g. a CMS, a database, a host, env-var names) — adjust to the repo's stack.

---

> The entries below are **placeholder examples** showing the ADR format. Replace them with this repo's real decisions, keeping the Decision / Why / Alternatives / Revisit-when (+ optional Supersedes) shape.

## 1. «Decision area» (e.g. CMS / data layer)

**Decision**: «What was chosen, stated in one line.»

**Why**:

- «Reason 1 — the property that made this the right call.»
- «Reason 2.»
- «Reason 3.»

**Alternatives considered**:

- _«Alternative A»_ — «why it lost.»
- _«Alternative B»_ — «why it lost.»

**Revisit when**: «the condition that would make this decision wrong (scale, team size, a missing capability).»

---

## 2. «Decision area» (e.g. database / hosting) — with a supersede

**Decision**: «What was chosen.»

**Trade-off**: «The cost you knowingly accept with this choice.»

**Supersedes**: «the earlier decision this replaces — note it inline rather than deleting the old entry.»

**Alternatives considered**:

- _«Alternative A»_ — «why it lost.»
- _«Alternative B»_ — «why it lost.»

**Revisit when**: «condition(s) that would trigger a re-evaluation.»

---

## 3. «Decision area» — pattern borrowed from elsewhere

**Decision**: «What was chosen (e.g. specific connection/build/lint config).»

**Why** (pattern adopted from a sister project):

- «Reason 1 — what the borrowed pattern buys you.»
- «Reason 2.»

**Trade-off**: «any manual step or limitation this introduces.»

**Revisit when**: «condition that would make the borrowed pattern stop being a fit.»

---

## How to add a new entry

1. Append a numbered section here, not separate files. Reads as a single narrative.
2. Keep entries short — 50-200 words. Link out to the full plan doc in `docs/plans/` if more detail is needed.
3. Update the "Revisit when" line if conditions change — supersedes the original "why" without rewriting history.
4. Don't delete superseded decisions. Add a new entry that supersedes them and note it inline ("Replaces #N").

---

## Example ADR entries (illustrative; replace per repo)

> The entries below show the **fuller ADR shape** — Date / Status / Context / Decision / Tradeoffs / Alternatives / Consequences / Related-Files. Use this shape (or the lighter Decision/Why/Alternatives/Revisit-when shape above) consistently per repo; don't mix mid-log. These are **illustrative**, not prescriptive — replace with this repo's actual decisions.

### Example A — Single-app vs. monorepo split

- **Date:** «DATE» (e.g. 2026-05-26)
- **Status:** Accepted
- **Context:** Repo started as a multi-package monorepo (`apps/web`, `apps/worker`, `apps/core`). The cross-package import ceremony and duplicated CI/deploy pipelines added overhead that wasn't paying back at current scale (one team, one deploy target).
- **Decision:** Collapse into a **single «PROJECT» app** at `src/`, deployed to «DEPLOY» with one CI pipeline and one `.env.local`. Keep any platform-agnostic engine in a hexagonal shape inside the single app so a future split stays cheap.
- **Tradeoffs:** Background-worker scaling is coupled to the web app's scaling profile. Acceptable until traffic warrants a split.
- **Alternatives considered:**
  - _Turborepo monorepo_ — lost: cross-package import gymnastics + extra CI ceremony with no co-deploy win at this scale.
  - _Separate worker service_ — lost: doubles infra surface; can be re-extracted later because the engine kept its ports.
- **Consequences:** One `«PKG_MGR» install`, same-origin API calls (no CORS), single env file. Future re-split path documented (move the engine back to a neutral `src/lib/<engine>/`).
- **Related files:** `next.config.ts`, `«DOMAIN_PATHS»`, `src/lib/<engine>/`.

---

### Example B — Embed «DB_CMS» in the Next.js app

- **Date:** «DATE»
- **Status:** Accepted
- **Context:** The CMS is the source of truth for content + user data; running it as a second service forced CORS, dual deploys, and two env files.
- **Decision:** Run the CMS **inside the Next.js app** via its first-party plugin. Admin at `«ADMIN_PATH»`, REST API under `/api/*`.
- **Tradeoffs:** CMS upgrades are coupled to the app's release cadence; long admin requests share the app's serverless budget.
- **Alternatives considered:**
  - _Standalone CMS service_ — lost: CORS + dual deploy + duplicated env management.
  - _Headless CMS SaaS_ — lost: editorial workflow + access-control needs were tightly coupled to app users.
- **Consequences:** Same-origin admin + API, one deploy target, one `.env.local`. CMS-side hooks (e.g. `onInit` seeds) must stay idempotent because they run on every boot.
- **Related files:** `next.config.ts` (plugin wiring), `src/payload/collections/**`, `«ADMIN_PATH»`.

---

### Example C — Hexagonal architecture for the «engine» (pattern borrowed)

- **Date:** «DATE»
- **Status:** Accepted — pattern borrowed from a sister project
- **Context:** The «engine» (e.g. an AI mediation service, a search indexer, a recommendation pipeline) needs to stay platform-agnostic: today it has one consumer, but a second surface (e.g. a different chat platform, a browser extension) is plausible inside 12 months.
- **Decision:** Define **ports** (`«ReaderPort»`, `«WriterPort»`) and a `«Service»` class in `src/lib/<engine>/`. Platform-specific code lives in `src/lib/<engine>/adapters/<platform>/` and implements the ports. Swap «AI_PROVIDER» or storage by changing the service, not the adapters.
- **Tradeoffs:** Two extra files (port + adapter) per platform; unit tests are cheaper but onboarding adds one indirection.
- **Alternatives considered:**
  - _Inline platform-specific code in the service_ — lost: blocks the second-consumer path; couples observability to one platform.
  - _Full dependency-injection framework_ — lost: over-engineered for the current 1-2 consumer reality.
- **Consequences:** Unit testing the service requires no real platform connection. Failures tag `domain:<engine>` + `step:read|generate|write` so any future consumer inherits observability for free.
- **Related files:** `src/lib/<engine>/ports/*`, `src/lib/<engine>/<service>.ts`, `src/lib/<engine>/adapters/<platform>/*`.
