# `«PROJECT»` — Onboarding Pack (`docs/ONBOARDING.md`)

> **Last verified:** «DATE» · **Owner:** @«handle» (CODEOWNERS)
> Re-verify on a quarterly cadence + on every Node / `«PKG_MGR»` / CI bump (see `MANAGER_DEV_ONBOARDING`).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_ONBOARDING_PACK` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/RUNBOOK_ONBOARDING_PACK.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (prerequisites → get the code → first green build → reading order → 30-min smoke → first-day gotchas → who to ping → "you're done when…"), then run each step against the target repo and fill in real commands, real env keys, real DRIs.
>
> **Pairs with:** `MANAGER_DEV_ONBOARDING.md` (the playbook that creates / verifies / maintains this doc) — boundary: this RUNBOOK owns *content shape*; `MANAGER_DEV_ONBOARDING` owns *process*. Also pairs with `RUNBOOK_CLAUDE_MD.md`, `RUNBOOK_DEV_PORTLESS.md`, and the doc-walk targets named in the reading-order section.
>
> **Local definitions to provide per repo** (fill the placeholders, or define common ones once in `.claude/CLAUDE.md`):
> - `«PROJECT»` / `«DOMAIN»` — product name + canonical URL
> - `«REPO_URL»` — canonical repo URL used by the `git clone` step (typically defined once in `.claude/CLAUDE.md`; see `PLACEHOLDERS.md`)
> - `«NODE_VERSION»` — from `.nvmrc` (e.g. 22.15.1)
> - `«PKG_MGR»` — package manager (e.g. pnpm)
> - `«QUALITY_CMD»` / `«BUILD_CMD»` / `«TEST_CMD»` / `«E2E_CMD»` — aggregate gates
> - `«ANY_DOMAIN»` — the domain picked for the 30-min smoke (one under `«DOMAIN_PATHS»`)
> - `«E2E_DOMAIN_FILTER»` — the path or tag filter that scopes E2E to that domain
> - `«DB_CMS»` / `«AUTH»` / `«PAYMENTS»` / `«OBSERVABILITY»` / `«DEPLOY»` — external accounts a day-one dev needs
> - `«SEED_CHECK»` — the bootstrap "is the DB seeded?" probe (e.g. the default-locale homepage slug)

---

Welcome to `«PROJECT»`. This doc gets you from a fresh laptop to a **green build + one domain end-to-end** in under 30 minutes. If anything below fails or feels stale, **that's a bug in this doc** — file a follow-up issue (label `onboarding`) and ping the owner above.

---

## 0 · Prerequisites

Before you run anything:

- **Node** — install [nvm](https://github.com/nvm-sh/nvm) (or [fnm](https://github.com/Schniz/fnm)) and Node `«NODE_VERSION»`:
  ```bash
  nvm install «NODE_VERSION»
  nvm use
  ```
  The repo's `.nvmrc` pins the exact version; `nvm use` reads it.

- **Package manager** — `«PKG_MGR»` (e.g. via Corepack or a global install). Do **not** mix runners; the lockfile assumes one.
  ```bash
  «PKG_MGR» --version
  ```

- **Editor** — any modern editor. The repo ships `.editorconfig` + ESLint + Prettier configs; install your editor's ESLint + Prettier plugins so format-on-save matches CI.

- **Accounts / secrets** — your onboarding buddy hands these over day one:
  - GitHub access to the org + this repo
  - `«AUTH»` account (e.g. an invited Google Workspace / Firebase Auth user)
  - `«DEPLOY»` account (e.g. read access to the project on the hosting platform)
  - `«OBSERVABILITY»` account (e.g. read access to the error-monitoring project)
  - `«PAYMENTS»` sandbox / test-mode access (drop if not applicable)
  - `«DB_CMS»` connection string for the shared / local instance

- **`/etc/hosts` entry (optional)** — only if you want the `.local` host (see `dev-portless.md` for the Portless setup).

---

## 1 · Get the code

```bash
git clone «REPO_URL» «PROJECT»
cd «PROJECT»
nvm use
«PKG_MGR» install
```

Then bootstrap your `.env.local` from the committed template:

```bash
«PKG_MGR» setup:dev
```

This copies `.env.example` → `.env.local` if missing, then runs `«PKG_MGR» seed` only when the seed probe (`«SEED_CHECK»`) is missing. Fill the placeholders in `.env.local` with the values from your handover (`«DB_URI»`, `«APP_URL»`, auth keys, etc.).

> Never commit `.env.local`. If you add a new required env key, update `.env.example` and ping the DRI for env governance.

---

## 2 · First green build

These three commands are the day-one contract:

```bash
«PKG_MGR» install      # already done in §1, but re-runnable
«QUALITY_CMD»  # aggregate: format + lint + types + unit + (i18n + build, depending on repo)
«BUILD_CMD»    # production build — catches server-only / barrel-leak issues
```

If `«QUALITY_CMD»` is green and `«BUILD_CMD»` is green, **you are on the happy path**. Move on to §3.

If either fails on a clean clone, **stop**:
- Re-read this doc to make sure you didn't skip a step.
- Check the [common gotchas](#5--common-first-day-gotchas) below.
- File an `onboarding` bug — this doc is wrong somewhere.

---

## 3 · Reading order (the canonical doc walk)

Read these in order. Each is short enough to skim in 10–15 minutes; the whole walk finishes in ~90 minutes.

1. **`.claude/CLAUDE.md`** — project memory. Every Claude Code / Cursor / Copilot session loads this first. Lists the tech stack, top-level layout, daily commands, and the few rules agents get wrong by default.
2. **`docs/ARCHITECTURE.md`** — the shape of the codebase. Domain boundaries, server-vs-client split, what `«DOMAIN_PATHS»` and `«SHARED_PATHS»` mean for testing / CI scope.
3. **`docs/CONTRIBUTING.md`** — how to contribute. Branching (`scope/*` → `release/*` → `«TRUNK»`), PR flow, CODEOWNERS, when AI-assisted iteration is encouraged.
4. **`docs/RELEASE_MANAGER.md`** — staging → trunk + CI cost discipline. Skim — you'll come back to this on your first release.
5. **`docs/QUALITY_ASSURANCE.md`** — the merge gate. You must clear this before your first PR merges; read it now so the expectations aren't a surprise.
6. **`docs/AI_WORKFLOW.md`** — Claude Code / Cursor / Copilot responsibilities + the autonomy matrix. Read the matrix carefully; it's the boundary between what agents do on their own and what they must ask for.

That's the doc walk. Anything else (`docs/DECISION_LOG.md`, `docs/RUNBOOK.md`, per-domain docs) is day-2+ reading.

---

## 4 · 30-min smoke (one domain, end-to-end)

Now prove the green build extends from `«QUALITY_CMD»` into a real flow.

We picked **`«ANY_DOMAIN»`** as the day-one smoke domain — it's small enough to walk in one sitting and exercises the integration points (auth, DB, one external integration) most likely to surface env-setup issues.

1. **Start the dev server.** If the repo uses Portless (HTTPS local-host), follow `docs/dev-portless.md`:
   ```bash
   «PKG_MGR» start:dev
   ```
   Open `https://«PROJECT».localhost` (or the active brand's `.local` host). You should see content.

2. **Run the domain's E2E subset:**
   ```bash
   «E2E_CMD» «E2E_DOMAIN_FILTER»
   ```
   (e.g. `«PKG_MGR» test:e2e --grep "@«ANY_DOMAIN»"` or a path-based filter — match the repo's domain-mapping convention.) Expect green.

3. **Walk the same flow manually** in the browser. Touch the UI, trigger the happy path, confirm the result you saw in the E2E.

4. **Trigger one deliberate error** (e.g. open a URL with intentionally invalid params) and confirm it lands in `«OBSERVABILITY»` (your handover account should have read access).

If all four pass, your environment is real.

---

## 5 · Common first-day gotchas

| Symptom | Likely cause | Fix |
|---|---|---|
| `«QUALITY_CMD»` fails on `tsc --noEmit` for a file you didn't touch | Wrong Node version | `nvm use` (reads `.nvmrc` — `«NODE_VERSION»`) |
| `«PKG_MGR» install` warns about engine mismatch | Mixed package manager runners | Delete `node_modules` + the foreign lockfile, re-install with the canonical `«PKG_MGR»` |
| Dev server starts but homepage is blank | DB has no seed rows | Re-run `«PKG_MGR» setup:dev` (or `«PKG_MGR» seed` directly); hard-refresh the browser |
| OAuth / social login redirects to a "domain not authorized" page | The `.local` / `.localhost` host isn't on the `«AUTH»` authorized-domains list | Add the host in the auth provider console — see `docs/dev-portless.md` |
| `«PAYMENTS»` checkout redirects to `localhost:«PORT»` instead of the Portless host | `«APP_URL»` not set in `.env.local` | Set `«APP_URL»=https://«PROJECT».localhost` (or the active brand's `.local`) |
| Port `«PORT»` already in use | Another dev server / Portless daemon | `portless prune` (if Portless) or kill the orphan process |
| Image `<Image>` component complains about an unconfigured host in dev | `«FRAMEWORK_CONFIG»` doesn't list the `.local` host | Add it to the framework's allowed image hosts — see `docs/dev-portless.md` |
| `.env.local` missing a key the app needs | The handover packet missed it | Update `.env.example` (if it's a new required key) + file an `onboarding` bug |

For deeper local-dev troubleshooting (HTTPS certs, mDNS, multi-brand setups) see **`docs/dev-portless.md`**.

---

## 6 · Who to ping for what

Wherever possible the answer is "open a PR and let CODEOWNERS auto-request review" — but for blocked day-one questions:

| Area | DRI | Where it's documented |
|---|---|---|
| Architecture / domain boundaries | @«handle» (`docs/ARCHITECTURE.md` CODEOWNERS) | `docs/ARCHITECTURE.md` |
| Release flow / `release/*` merges | @«handle» (`docs/RELEASE_MANAGER.md` CODEOWNERS) | `docs/RELEASE_MANAGER.md` |
| Env keys / secrets handover | @«handle» (security CODEOWNERS) | `docs/SECURITY.md` |
| `«PAYMENTS»` sandbox / test mode | @«handle» (payments CODEOWNERS) | `docs/PAYMENTS_*.md` |
| `«OBSERVABILITY»` access | @«handle» | `docs/OBSERVABILITY.md` |
| This onboarding doc itself | @«handle» (the most recent re-verifier) | This file's header |

If your question doesn't have a DRI here, that's a gap — file an `onboarding` bug and add the row.

---

## 7 · You're done when…

Tick this on your first day:

- [ ] `nvm use` reports Node `«NODE_VERSION»`.
- [ ] `«PKG_MGR» install` runs clean.
- [ ] `«QUALITY_CMD»` exits 0.
- [ ] `«BUILD_CMD»` exits 0.
- [ ] Dev server starts and the home page renders.
- [ ] Reading-order docs (1–6 in §3) skimmed.
- [ ] `«E2E_CMD» «E2E_DOMAIN_FILTER»` passes for `«ANY_DOMAIN»`.
- [ ] Manual walk of `«ANY_DOMAIN»` in the browser passes.
- [ ] One deliberate test error is visible in `«OBSERVABILITY»`.
- [ ] You know who to ping for the four most likely day-2 questions (see §6).

You are now ready for `docs/CONTRIBUTING.md` and your first PR.

---

_Defers AI-tooling specifics to `docs/AI_WORKFLOW.md`; defers contribution flow to `docs/CONTRIBUTING.md`; defers HTTPS local-host setup to `docs/dev-portless.md`; defers release flow to `docs/RELEASE_MANAGER.md`; defers QA gate detail to `docs/QUALITY_ASSURANCE.md`. This doc is the day-one entry point; everything else is one link away._
