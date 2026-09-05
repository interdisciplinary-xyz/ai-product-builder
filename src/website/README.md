# website

A static site that presents the library — every manager, runbook, command, skill, agent, script
and config file, browsable and cross-linked.

It is a **view**, not a copy. Nothing here restates the library's content: the pages are generated
at build time from the markdown in `../managers`, `../runbooks`, … and the one-line descriptions
come from `CATALOG.md` at the repo root. Edit a doc or the catalog, rebuild, and the site follows.
It therefore has to live inside this repository — it reads two directories up.

## Run it

```bash
pnpm install
pnpm start:dev           # https://ai-product-builder.local
```

Dev runs through [Portless](https://github.com/vercel-labs/portless), like the other apps here —
a stable HTTPS host, no port numbers. The name comes from `portless.json`. Portless adds the
`/etc/hosts` entry while it runs and removes it on exit, and `--lan` publishes the host over mDNS
so other devices on the same Wi-Fi can open it too. `https://ai-product-builder.localhost` also
works, and needs no hosts entry at all.
See [`RUNBOOK_DEV_PORTLESS`](../runbooks/RUNBOOK_DEV_PORTLESS.md) for the one-time
`npm install -g portless && portless trust` (Portless is global, not a project dep).

```bash
pnpm start:dev:raw       # http://localhost:3006 — plain next dev, no proxy
pnpm build               # static export → ./out
pnpm start               # serve the production build
pnpm cache:clean         # rm -rf node_modules .next out
```

`pnpm build` emits a fully static `out/` directory with no server component, deployable to
Vercel, Netlify, GitHub Pages or any bucket. Set `LIBRARY_ROOT` to read the library from somewhere
other than `../..`.

## What it adds to the raw markdown

- **`«PLACEHOLDER»` tokens are marked** wherever they appear, so an unfilled doc looks unfilled —
  the library's central convention, made visible.
- **Cross-references resolve.** A doc that links to `./QUALITY_ASSURANCE.md` links to that page
  here, matched on basename. Links to files that only exist in a *consuming* repo render inert
  rather than broken, and `«PLACEHOLDER»` URLs render as tokens.
- **Layer framing.** Each layer states what you do with it (run / fill / invoke / never invoke)
  and where a deployed copy lands.
- **Filterable index** at `/browse`, over names, descriptions and deploy paths. `/` focuses it.

## Layout

```
app/
├── page.tsx              the front page — layers, the three doors, status
├── browse/               the filterable index
├── [layer]/page.tsx      one layer's ledger
├── [layer]/[slug]/       one document
└── globals.css           the whole design system, ~700 lines, no framework
lib/content.ts            reads the repo: layers, docs, CATALOG descriptions, link map
components/
├── markdown.tsx          renderer + the «token» remark plugin + link rewriting
├── ui.tsx                the ledger row, used by nearly every page
└── browse-client.tsx     the only client component
```

## Design

Warm paper ground, ink type, hairline rules — a card catalog rather than a dashboard. Instrument
Serif for display, Newsreader for body, JetBrains Mono for anything a machine would read. Each
layer carries its own accent, set as `--layer` and used for rules, links and hover states. Light
and dark both ship; the palette lives entirely in CSS custom properties at the top of
`globals.css`.
