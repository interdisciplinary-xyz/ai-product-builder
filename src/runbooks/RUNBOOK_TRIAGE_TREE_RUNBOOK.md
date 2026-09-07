# TRIAGE_TREE_RUNBOOK.md — write the ops runbook as a decision tree

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_TRIAGE_TREE_RUNBOOK.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the format an operational RUNBOOK.md takes when its readers are triaging a live system. Not "one section per subsystem" — a **triage tree** whose leaves are actions. Companion to [`MANAGER_INCIDENT_RESPONSE.md`](./MANAGER_INCIDENT_RESPONSE.md) and the ops-specific runbook the repo maintains (`docs/RUNBOOK.md`).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_TRIAGE_TREE_RUNBOOK` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the tree structure is generic; only the branches are per-repo.
>
> **Pairs with:** `MANAGER_INCIDENT_RESPONSE.md` (severity + comms + post-mortem), `RUNBOOK_INCIDENTS.md` (the incident record template) — boundary: this runbook owns the *format of the ops runbook*; the incident-response MANAGER owns *the process of running an incident*.
>
> **Local definitions to provide per repo:**
> - `«OPS_RUNBOOK_PATH»` — where the ops runbook lives (usually `docs/RUNBOOK.md`)
> - `«HEALTH_ENDPOINT»` — inherited from core tokens
> - `«ADMIN_PATH»` — inherited from core tokens

---

## 1. The rule

> **An ops runbook is opened under stress. Structure it as *"first check: can the user reach `/`?* — if yes, ask …; if no, go to …" not *"§3.4 Database recovery."***

A section-per-subsystem runbook forces the reader — who is on-call, at 3am, in a language that isn't their strongest — to know which subsystem is broken before they can find the section that helps. The triage-tree flips it: the reader answers a question they can actually answer, and each answer routes them one step deeper.

The pattern was invented in `youtube-manager`'s `docs/RUNBOOK.md`. Every well-executed ops runbook in the portfolio has been converted to this shape post-hoc.

---

## 2. The shape

```md
# Ops RUNBOOK — «PROJECT»

> Read this top-to-bottom during an incident. Each question routes to a section.
> No section is longer than one screen; if it needs more, it's a sub-runbook.

## Start here — can you reach `«DOMAIN»/`?

- **Yes, and it renders.** → Go to §2 (something more specific is broken).
- **Yes, but it renders a fallback / error page.** → §3 CMS unreachable.
- **No — connection refused / DNS fail.** → §4 Site down.
- **No — 503.** → §5 Origin health.
- **No — 429.** → §6 Rate-limited.

## §2 — Site up, feature broken

- **Which feature?**
  - Sign-in → §2.1
  - Purchase / checkout → §2.2
  - Email delivery → §2.3
  - Search → §2.4

### §2.1 Sign-in broken

- Can you sign in as an unrelated test user? …
- (…branches…)

## §3 — CMS unreachable

- Run the CMS probe: `curl -sf «HEALTH_ENDPOINT»/cms | jq .`
- If `.ok === false`: …
- (…branches…)

## §4 — Site down (connection refused / DNS fail)

- …

## Reference

- Escalation contacts: `«ESCALATION_ROSTER»`
- Related: `MANAGER_INCIDENT_RESPONSE.md`, `RUNBOOK_INCIDENTS.md`
```

Rules:

- **Every section opens with a question.** Not a heading like "Sign-in broken" — a heading like "Sign-in broken: check A first, then B".
- **Every leaf is an action.** A command to run, a link to a dashboard, an escalation to a person. Not "investigate the auth logs" — a specific `gh run list` or `kubectl logs` or dashboard URL.
- **Every section fits on one screen.** Longer means it needs a sub-runbook or a decision-tree split.
- **The tree has a well-defined start.** "Start here" is the entry point every reader takes; there is exactly one, and it opens the file.

---

## 3. What NOT to put in the triage-tree runbook

The triage tree is for **incident response**, not for background knowledge. Put elsewhere:

- Architecture explanations → `MANAGER_ARCHITECTURE.md`.
- Release procedure → `RUNBOOK_RELEASE_MANAGER.md`.
- Post-mortems → `docs/incidents/YYYY-MM-DD-name.md` (per `RUNBOOK_INCIDENTS.md`).
- Onboarding → `MANAGER_DEV_ONBOARDING.md`.

The runbook links to those; it does not contain them. A runbook that starts with "Overview" is not a runbook.

---

## 4. Anti-patterns

- **A section-per-subsystem TOC.** The reader who doesn't know which subsystem is broken cannot use it.
- **A section that ends in "investigate further."** Every leaf is an action; if the next step is investigation, it's a decision-tree branch, not a leaf.
- **Instructions that assume calm.** "First, review the RELEASE_MANAGER.md § 4.2 policy for domain-scoped E2E …" — no. Give the command; link the policy.
- **A `TL;DR` at the top that duplicates the tree.** Delete either the TL;DR or the tree; keeping both drifts.
- **Runbook that says "check the logs" without saying which log, in which environment, filtered by what.** The specific `gh run list --workflow=ci.yml --status=failure --limit=5` is the runbook line; "check the logs" is prose.

---

## 5. Verification checklist

- [ ] `«OPS_RUNBOOK_PATH»` opens with a "Start here" question, not an overview.
- [ ] Every leaf is a specific command or URL, not a topic.
- [ ] Every section fits on one screen.
- [ ] The runbook links out to `MANAGER_INCIDENT_RESPONSE.md`, `RUNBOOK_INCIDENTS.md`, and the observability dashboard.
- [ ] A stranger reading the file at 3am can reach an action within 30 seconds of opening it.
- [ ] No section is titled "Overview" or "Introduction."

## 6. Related

- Incident-response process: [`MANAGER_INCIDENT_RESPONSE.md`](./MANAGER_INCIDENT_RESPONSE.md)
- Incident record template: [`INCIDENTS.md`](./INCIDENTS.md)
- Post-mortem doc format: `RUNBOOK_INCIDENTS.md` §Post-mortem

**Last reviewed:** «DATE»
