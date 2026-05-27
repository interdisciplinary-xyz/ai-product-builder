# Scaling Audit Template

> This is a **reusable audit template**, not a finished audit — fill the «placeholders» when you run a scaling audit for your codebase.
>
> Audited: «AUDIT_DATE» (e.g. 2026-05-25)
> Scope: «REPO_SCOPE» (the codebase audited and its app/package layout, e.g. monorepo apps and packages)

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_SCALING` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `docs/SCALING.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The audit framework (overall assessment → what's good → critical/high/medium issues with Impact-Where-Fix → phased roadmap → cost projections → before/after diagrams) is generic; the example findings, infra, costs, and dates are placeholders to replace.
>
> **Local definitions to provide per repo** (replace the product content; define product facts in the repo's `.claude/CLAUDE.md` or fill them inline):
> - `«PROJECT»` / `«REPO_SCOPE»` — the codebase audited and its app/package layout
> - `«ARCHITECTURE_STRENGTHS»` — the "what's already good" list for this codebase
> - `«CRITICAL_ISSUES»` — the scaling blockers found and their status (`«STATUS»` — resolved/open)
> - `«INFRA_ASSUMPTIONS»` — hosting/runtime, caching/ISR windows, DB, and cost model
> - `«AUDIT_DATE»` — when the audit was performed

## Overall Assessment

(What to write here: one bold headline verdict, then 1–2 sentences on the codebase's maturity for scale — what's organized well vs. what's unaddressed.)

**«Headline verdict — e.g. Early-stage, not yet production-hardened for scale.»**

«1–2 sentences: what is well-organized, and which infrastructure/operational concerns remain gaps that become blockers as traffic grows.»

---

## What's Already Good

(What to write here: list `«ARCHITECTURE_STRENGTHS»` — existing patterns that will scale. One bullet each, with a short why.)

- **«Strength 1»** — «why it helps scaling»
- **«Strength 2»** — «why it helps scaling»

(One bullet per strength.)

---

## Critical Issues

> Address before scaling to production traffic.

(What to write here: the highest-severity blockers in `«CRITICAL_ISSUES»`. Use one `###` block per issue with Status / Impact / Where / Fix. Set `«STATUS»` per issue — e.g. open / in progress / ✅ resolved. Number them.)

### «N». «Issue title»

**Status:** «STATUS» (e.g. open / in progress / ✅ resolved)

**Impact:** «what breaks or what it costs at scale»

**Where:** «file(s) / module(s)»

**Fix:** «concrete remediation» (if `«STATUS»` is resolved, note what was done, where, and any residual scaling note)

(Repeat one block per critical issue.)

---

## High-Priority Issues

(What to write here: issues to address soon after the critical set. Same Impact / Where / Fix format.)

### «N». «Issue title»

**Impact:** «…»

**Where:** «…»

**Fix:** «…»

(Repeat one block per high-priority issue.)

---

## Medium-Priority Issues

(What to write here: lower-severity or later-stage issues. Same Impact / Where / Fix format.)

### «N». «Issue title»

**Impact:** «…»

**Where:** «…»

**Fix:** «…»

(Repeat one block per medium-priority issue.)

---

## Recommended Scaling Roadmap

(What to write here: group fixes into phases with rough timeboxes. Use checkboxes; mark done items `[x]`. Replace phase names/timeboxes with yours.)

### Phase 1 — «Phase name» («timebox»)

- [ ] «Action item»
- [x] «Completed action item»

### Phase 2 — «Phase name» («timebox»)

- [ ] «Action item»

(Repeat one section per phase.)

---

## Cost Projections

(What to write here: project the dominant variable cost — e.g. AI API spend — at increasing scale, showing before/after optimizations. Keep the headers; replace the placeholder row and the assumptions note.)

| Users/month | «Before — baseline cost» | «After optimization 1» | «After optimization 2» |
| ----------- | ------------------------ | ---------------------- | ---------------------- |
| «100»       | «~$X»                    | «~$Y»                  | «~$Z»                  |

(One row per scale tier.)

> «State the assumptions behind the estimates — operations per user, what's included/excluded, and any model/infra swap assumed.»

---

## Architecture Diagram (Current)

(What to write here: an ASCII sketch of today's runtime — auth, app, data store, external APIs, any worker/bot. Replace nodes with your components.)

```
«current architecture sketch — boxes for auth, app/server, database, external API(s), worker/bot, and the edges between them»
```

## Architecture Diagram (Target)

(What to write here: the same sketch after the roadmap lands — add cache layer, clustering/orchestration, pooling/indexing, timeouts/retries, load-balanced workers, etc.)

```
«target architecture sketch — same components plus the scaling additions (cache, CDN/edge, clustered app, pooled+indexed DB, rate limiting, resilient external calls, load-balanced worker)»
```
