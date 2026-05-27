# Portless local dev (`https://«PROJECT».local` / `https://«PROJECT».localhost`)

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_DEV_PORTLESS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — lives in the `ai-product-builder` library (source of truth). To use in a repo, copy to `docs/dev-portless.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». The Portless pattern is portable; the names/ports/scripts/env are repo-local and must be created.
>
> This doc covers **two alternative modes** — pick one for your repo:
>
> - **Single-project setup** — one app, one host. Uses a `portless.json` with `name: «PROJECT»` so the host becomes `https://«PROJECT».localhost` / `https://«PROJECT».local`.
> - **Multi-brand setup** — several brands from one codebase. **No `portless.json`**; pass `--name` flags per brand, with per-brand ports (`«PORT_A»`/`«PORT_B»`) and per-brand build dirs so two brands can run concurrently.
>
> Throughout: `«brandA»` / `«brandB»` are the two example brands, and `«PORT_A»` / `«PORT_B»` are their respective pinned upstream ports.
>
> **Local definitions to provide per repo** (this is a dev-environment guide — the consuming repo must CREATE the local scripts/config below, not just fill placeholders):
>
> _Single-project mode:_
> - `portless.json` — set `name: "«PROJECT»"` (overriding the inferred package name / «DOMAIN») so the host becomes `https://«PROJECT».localhost` / `https://«PROJECT».local`. **Must be created in the consuming repo.**
> - `package.json` dev scripts — define `start:dev` (Portless-wrapped, `--app-port «PORT»`), `start:dev:raw` (plain framework dev, no Portless), and `setup:dev` + `seed` for first-run bootstrap. **Must be created in the consuming repo.**
> - `«PROJECT» / «PORT»` — Portless name and pinned upstream port
> - `«SEED_CHECK»` — the bootstrap "is the DB seeded?" probe (e.g. the default-locale homepage slug); adjust to this repo's data model
>
> _Multi-brand mode:_
> - `package.json` dev scripts — define `start:dev` (+ per-brand `start:dev:«brandA»` / `start:dev:«brandB»`) that wrap `portless run --name «brandA» --app-port «PORT_A» --lan -- node ... server.js`. **Must be created in the consuming repo.**
> - `«BRAND_NAMES» / «PORT_A» / «PORT_B»` — each brand's Portless name → pinned upstream port mapping and its named domain (`https://«brandA».local`)
> - `«BUILD_DIRS»` — per-brand build dirs that must differ for concurrent runs (e.g. `.next-«brandA»/`)
> - `«APP_BASE_URL_ENV»` — env var each brand script exports so SSR self-fetches hit the matching port (e.g. `NEXT_PUBLIC_API_BASE_URL`); wire it in the dev scripts
> - `«FRAMEWORK_CONFIG»` entries — add each `.local` host (and `*.` wildcards) to the framework's allowed image hosts and dev origins (e.g. `next.config.ts` `images.remotePatterns` + `allowedDevOrigins`). **Must be added in the consuming repo.**
> - `«AUTH»` authorized-domains — external auth provider authorized-domains list to extend per brand (e.g. the auth provider's console → Authorized domains); skip if no social login
>
> _Both modes:_
> - `.env.local` keys — `«APP_URL»` (server-emitted redirect base, e.g. «PAYMENTS» success/cancel + return URLs; set to `https://«PROJECT».localhost` or the active brand's `.local` host) and `«DB_URI»` (your «DB_CMS» connection string). **The repo must create/seed `.env.local` (e.g. via `setup:dev` copying an env example).**
> - `/etc/hosts` entry — optional `127.0.0.1 «PROJECT».local` if a `.local` host is wanted (the `.localhost` host needs none). **A local machine change the dev must apply.**
> - `«CI_PORTS»` — ports CI/e2e hit directly without Portless (e.g. e2e `:4000`, billing `:3000`)

`«PKG_MGR» start:dev` runs the framework through [vercel-labs/portless](https://github.com/vercel-labs/portless) (its site: portless.sh). Portless gives you a stable, named HTTPS URL for local development — no port numbers, no manual proxy.

## What you get

- **`https://«PROJECT».localhost`** — Portless's default. Auto-resolves to `127.0.0.1` in browsers (RFC 6761), no `/etc/hosts` change required.
- **`https://«PROJECT».local`** — also works because Portless's wildcard cert covers `*.local`. Requires a `/etc/hosts` entry (see one-time setup), or LAN/mDNS mode (see Multi-brand setup).

In **single-project mode** the URL is computed from `portless.json` `name: "«PROJECT»"` (overriding the inferred package name / «DOMAIN»). In **multi-brand mode** the name comes from `portless run --name «brandA»` instead (no `portless.json`).

## How it works

```
browser → https://«PROJECT».localhost (port 443)
          ↓ (Portless reverse proxy + local TLS)
          → http://localhost:«PORT» (framework dev, --app-port «PORT»)
```

Portless boots a daemon on port 443, generates a local CA on first run, and routes requests by Host header. The cert is valid for `localhost`, `*.localhost`, and `*.local`.

## Why HTTPS matters

Several real-feature paths only work convincingly on HTTPS:

- **`navigator.share`** — Web Share API requires a secure context. Share/invite flows light up properly only over HTTPS.
- **`navigator.clipboard.writeText`** — same rule.
- **OAuth (Google, GitHub, etc.)** — most providers refuse `http://localhost` for non-`localhost` hostnames. Portless gets you a valid origin without ngrok.
- **Service workers + push notifications** — secure-context-only.
- **Cookies with `Secure` flag** — silently dropped on `http://`. Edge-auth cookies set `Secure` in production.

If none of the above matter for your task, the raw upstream port (`http://localhost:«PORT»`, or `http://localhost:«PORT_A»` / `http://localhost:«PORT_B»` in multi-brand mode) works just fine — same dev server, same hot reload.

## One-time setup (both modes)

1. **Install Portless** — globally (recommended; the daemon stays alive across projects):
   ```sh
   npm install -g portless
   ```
   Or rely on the project-level dep (ship `portless` in `dependencies`) and invoke via `«PKG_MGR» exec portless …`.
2. **Trust the local CA**:
   ```sh
   portless trust
   ```
   First run prompts for `sudo` — Portless writes a per-user CA (in `~/.portless/`), then trusts it on the system level.

---

# Single-project setup

> One app, one host. Uses `portless.json`. _(Alternative to the Multi-brand setup below — pick one.)_

## Configure the name

Create `portless.json` with `name: "«PROJECT»"` so the host becomes `https://«PROJECT».localhost` / `https://«PROJECT».local`.

1. **(Optional) Add `«PROJECT».local` to `/etc/hosts`** if you want the `.local` host:
   ```sh
   echo "127.0.0.1 «PROJECT».local" | sudo tee -a /etc/hosts
   ```
   Skip this if `https://«PROJECT».localhost` is enough — that one needs no hosts entry.
2. **Set `«APP_URL»` in `.env.local`** so server-emitted URLs («PAYMENTS» success/cancel, return URLs) target the Portless host:
   ```
   «APP_URL»=https://«PROJECT».localhost
   ```
   Or `https://«PROJECT».local` if you prefer that one.

## First-time app bootstrap (empty homepage fix)

A fresh «DB_CMS» has no content rows — the site loads header/footer but the main area stays **blank**. Run once before (or after) starting dev:

```sh
«PKG_MGR» setup:dev
```

This creates `.env.local` from the env example when missing, then runs `«PKG_MGR» seed` **only if** the seed probe (`«SEED_CHECK»`, e.g. the default-locale homepage slug) is missing. `«DB_URI»` should point at the shared database (same as «DEPLOY») so local and production share one database.

Then hard-refresh the browser if you already had `«PKG_MGR» start:dev` running (the framework may cache an empty homepage for up to 60s).

## Daily use

```sh
«PKG_MGR» start:dev
```

Portless starts (or reuses) the proxy daemon and runs the framework dev server on an auto-assigned port behind `https://«PROJECT».local` / `https://«PROJECT».localhost`. Open either URL (see hosts note above).

To run the plain framework dev server without Portless (raw `:«PORT»`, e.g. for tests or debugging):

```sh
«PKG_MGR» start:dev:raw
```

---

# Multi-brand setup

> Several brands from one codebase. **No `portless.json`** — each brand's name is passed via `--name`. _(Alternative to the Single-project setup above — pick one.)_

`«PKG_MGR» start:dev` IS the Portless-wrapped dev command — there's no separate "regular" vs "Portless" path. Each brand gets its own Portless name + pinned upstream port:

| Script                                                | Portless name            | Upstream port        |
| ----------------------------------------------------- | ------------------------ | -------------------- |
| `«PKG_MGR» start:dev` (alias for `start:dev:«brandA»`) | `https://«brandA».local` | `localhost:«PORT_A»` |
| `«PKG_MGR» start:dev:«brandB»`                         | `https://«brandB».local` | `localhost:«PORT_B»` |

Use whichever URL your scenario needs:

- **Regular browsing** — either the `.local` URL or the `localhost:«PORT_A»` / `localhost:«PORT_B»` raw backend works.
- **Mobile QA, real-device tests, OAuth, Service Workers, `crossOriginIsolated` features** — the `https://«brandA».local` URL (HTTPS, named domain, valid secure context).
- **Backend self-fetches inside SSR** — `http://localhost:«PORT_A»` / `http://localhost:«PORT_B»`. The active brand's script sets `«APP_BASE_URL_ENV»` to match its pinned port so SSR-side self-fetches resolve correctly.

This setup wires Portless into the dev script (`portless run --name «brandA» --app-port «PORT_A» --lan -- node ... server.js`) so each brand serves its named domain and its raw port from a single `«PKG_MGR» start:dev:«brandA»`. Two brands can run concurrently because the names + ports (`«PORT_A»`/`«PORT_B»`) + `«BUILD_DIRS»` all differ.

## Brand-specific one-time setup

1. **No `portless.json` to confirm.** Each brand's name is passed via `portless run --name «brandA»` directly from the `package.json` scripts (see `start:dev:«brandA»` / `start:dev:«brandB»`). Any legacy root `portless.json` is gitignored as a build artifact.
2. **Add `«brandA».local` and `«brandB».local` to your «AUTH» authorized domains.** Auth provider console → Authentication → Settings → Authorized domains → Add. Without this, social login (Google, GitHub, etc.) refuses to fire because the redirect origin isn't allow-listed. Add a row per brand you'll dev against. (Skip if no social login.)

## Daily use

```bash
«PKG_MGR» start:dev
```

That's it. The script:

- Boots Portless in LAN mode (`--lan`) — picks up your current Wi-Fi IP and binds the proxy to the named domain.
- Spawns `server.js` on the brand's pinned upstream port (`PORT=«PORT_A»` for brandA, `PORT=«PORT_B»` for brandB). The script also exports a matching `«APP_BASE_URL_ENV»` so SSR self-fetches resolve to the same port.
- Routes `https://«brandA».local` → that upstream port via `--app-port`. Sudo prompt on first invocation per session because Portless needs to bind `:443`.

Then visit (defaults shown for `«PKG_MGR» start:dev`, which targets brandA):

- `https://«brandA».local` — the app
- `https://«brandA».local/admin` — «DB_CMS» admin panel
- `http://localhost:«PORT_A»` — same app, raw backend (no TLS, useful for `curl` or backend-internal scripts)

For brandB, swap the host to `https://«brandB».local` and the raw port to `«PORT_B»`.

## Other devices on the same Wi-Fi

LAN mode auto-publishes the domain via mDNS, so anything on your Wi-Fi resolves `«brandA».local` to your laptop. Open Safari on iPhone, paste `https://«brandA».local` — works. The CA isn't on those devices, so you'll see the "not secure" interstitial; tap through for testing, OR install the CA on the device (Portless docs cover this if you need it).

---

# Shared reference (both modes)

## Useful Portless commands

| Command | What it does |
|---|---|
| `portless list` | Show all active routes across projects |
| `portless get «PROJECT»` | Print the URL Portless would assign to this project |
| `portless proxy stop` | Stop the daemon (it auto-restarts on next `start:dev`) |
| `portless prune` | Kill orphaned dev servers from crashed sessions |
| `portless hosts sync` | Auto-add active routes to `/etc/hosts` (helps Safari) |
| `portless clean` | Reset everything (state dir, trust entry, hosts block) |

## Webhooks

Portless does NOT make your local dev server reachable from the public internet. «PAYMENTS» webhooks come from the provider's servers — they need a public URL. Keep using a local forwarder:

```bash
«PAYMENTS» listen --forward-to https://«PROJECT».localhost/api/«PAYMENTS»/webhook
```

In multi-brand mode, point it at the brand you're testing:

```bash
«PAYMENTS» listen --forward-to https://«brandA».local/api/«PAYMENTS»/webhook
```

`«PAYMENTS» listen` already speaks HTTPS, so pointing it at the named host works fine once the CA is trusted. Swap to `«brandB».local` if you're testing webhooks against the other brand.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Browser shows "Not Secure" or cert warning | `portless trust` not run (or the CA in `~/.portless/` was wiped — run it again) |
| `«PROJECT».local` doesn't resolve, `«PROJECT».localhost` does | Hosts entry missing — add it (single-project step) or use `.localhost` |
| "Cannot resolve `«brandA».local`" on another device | Make sure you're on the same Wi-Fi as the host running `«PKG_MGR» start:dev`. mDNS doesn't cross subnets / VPNs |
| `EACCES: permission denied :::443` / sudo prompt every `start:dev` | Portless auto-elevates with sudo to bind 443; on macOS expect a password prompt once per session |
| «PAYMENTS» checkout redirects to `localhost:«PORT»` | `«APP_URL»=https://«PROJECT».localhost` (or the active brand's `.local` host) not set in `.env.local` |
| «AUTH»: "This domain is not authorized" | Add `«brandA».local` / `«brandB».local` (or `«PROJECT».localhost`) in the auth provider console (see multi-brand one-time setup) |
| Image broken in dev (image component complains) | `«FRAMEWORK_CONFIG»` must list the `.local` host(s) in the allowed image hosts for dev |
| `allowedDevOrigins` warning in console | `«FRAMEWORK_CONFIG»` must whitelist the `.local` host(s) and their `*.` wildcards |
| Multiple `«PROJECT».localhost` registrations across projects | `portless prune` |
| Unexpected port in URL instead of 443 | Another local Portless project started its proxy daemon first with `--no-tls --port <N>`. Kill that daemon, then restart `«PKG_MGR» start:dev` so Portless boots on the privileged 443 port |

## Why not Caddy

A Caddy-based setup also works, but Portless does the same job with less yaml + auto-managed local CA + zero-config name inference + monorepo / worktree awareness.

## CI / Production

Unaffected. CI keeps using the framework's dev/start commands directly (e2e + any billing suite run on `«CI_PORTS»`, no Portless in the loop) — the `start:dev` script is a developer convenience and CI doesn't need TLS termination. In production, «DEPLOY» resolves `«APP_URL»` from its platform URL var (or an explicit prod env var). e2e still hits the raw port (`http://localhost:«PORT»`, or `«PORT_A»`/`«PORT_B»`) directly — Portless is dev convenience only.
