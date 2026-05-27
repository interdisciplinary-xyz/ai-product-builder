# AI Prompt Registry

All «AI_PROVIDER» prompts used in the «PROJECT» platform, their cost profile, and optimization opportunities.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_AI_PROMPT_REGISTRY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/AI_PROMPT_REGISTRY.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Keep the per-prompt table format (File / Model / Max tokens / Temperature / Calls / Cost tier / Frequency) and the Cost Summary / Optimization / Safety sections, but **fill the inventory with the target product's own prompts**.
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - `«PROJECT»` — the product this registry covers.
> - `«AI_PROVIDER»` — provider + env var (e.g. OpenAI, `«AI_API_KEY»`) and the models in use (e.g. a cheap and a hot-path model).
> - `«PROMPT_INVENTORY»` — the actual list of prompts/generators for this product.
> - `«SERVICE_PATHS»` — where each prompt lives (e.g. `apps/web/src/.../services/*`, `src/app/api/*`); adjust to the repo's layout.
> - `«MONOREPO_LAYOUT»` — apps/packages structure referenced by file paths (if any).
> - `«DOMAIN»` concepts — product nouns the prompts produce.
> - `«LOCALES»` — locales generated per prompt (e.g. lazy single-locale, others on demand).
> - `«CACHING_RULES»` — per-prompt cache/invalidation behavior (e.g. hash-based cache).

---

## Prompt Inventory

_(One block per prompt/generator. Keep the two-column metadata table; fill File, Model, token/temperature limits, call count, cost tier, and frequency, then add a short paragraph describing input → output. The two examples below intentionally contrast a **cached** generation with an **uncached, per-request** call — delete them and add your real prompts.)_

### 1. «Prompt name» — cached generation (e.g. Guideline Generator)

|                    |                                                        |
| ------------------ | ------------------------------------------------------ |
| **File**           | `«SERVICE_PATHS»/«prompt-file»`                         |
| **Model**          | «model» (e.g. cheap default model)                     |
| **Max tokens**     | «N» (or `Dynamic: «formula»`)                          |
| **Temperature**    | «0.0–1.0»                                              |
| **Calls per «unit»** | «N» («LOCALES» note, e.g. current locale only)       |
| **Cost tier**      | «Low / Medium / High»                                 |
| **Frequency**      | «when it runs» (e.g. once per user, then cached)       |

«One- or two-sentence description: what it consumes, what it produces.» Result is **cached** per `«CACHING_RULES»` (e.g. keyed by a content hash), so repeat inputs are served from cache and cost ~0 — the «AI_PROVIDER» call only fires on a cache miss.

### 2. «Prompt name» — per-request / hot-path call (e.g. Inline Suggestion)

|                    |                                                        |
| ------------------ | ------------------------------------------------------ |
| **File**           | `«SERVICE_PATHS»/«prompt-file»`                         |
| **Model**          | «model» (e.g. hot-path model)                          |
| **Max tokens**     | «N» (or `Dynamic: «formula»`)                          |
| **Temperature**    | «0.0–1.0»                                              |
| **Calls per «unit»** | «N» (e.g. one per user request, no batching)         |
| **Cost tier**      | «Low / Medium / High»                                 |
| **Frequency**      | «when it runs» (e.g. on every request, **uncached**)   |

«One- or two-sentence description: what it consumes, what it produces.» This call is **not cacheable** (inputs are unique per request, so `«CACHING_RULES»` does not apply) — every invocation hits «AI_PROVIDER», making it the dominant cost driver; right-size the model and `max_tokens` accordingly.

---

## Cost Summary

_(One row per prompt. Keep the headers; fill in real estimates and notes.)_

| Prompt              | Model   | Est. tokens/call | Cacheable          | Notes                       |
| ------------------- | ------- | ---------------- | ------------------ | --------------------------- |
| «prompt name» (cached)     | «model» | «~N»      | Yes («how», e.g. content hash) | «served from cache on repeat input»  |
| «prompt name» (per-request)| «model» | «~N»      | No                 | «unique input per call; dominant cost» |

## Optimization Opportunities

_(List concrete, repo-specific levers. Generic candidates to consider:)_

1. **Lazy / single-locale generation** — generate only the requested «LOCALES» variant; produce others on demand instead of N parallel calls.
2. **Cache aggressively** — cache expensive generations by a content hash; monitor cache hit rate.
3. **Right-size the model** — use the cheapest model that meets quality for each prompt; keep model IDs in one constants file.
4. **Add token budgets** — set per-user daily/monthly limits on AI calls to prevent cost spikes.
5. **Right-size token limits** — compute `max_tokens` per request where output size varies, instead of a large static cap.

## Safety

_(Document the prompt-injection / input-sanitization posture. Generic checklist:)_

- All user inputs are sanitized (e.g. via a `sanitizeForPrompt()` helper) before inclusion in prompts.
- Sanitization strips code fences, normalizes line endings, and neuters fake role labels.
- Applied at every call site that mixes user input into a prompt.
