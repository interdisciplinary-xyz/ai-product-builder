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

- **A second axis.** Layers say what a file *is*; [topics](lib/topics.ts) say what it is **for**.
  Eleven jobs — secure it, launch it, keep the docs true — each cutting across every layer, with
  all 129 files placed on exactly one. `/topics`, and the grouping inside any layer index past a
  dozen files.
- **Search from anywhere.** <kbd>⌘K</kbd> (or `/`) opens a palette over documents, the library's
  1,223 **section headings**, and its tokens. A section is the unit that actually answers a
  question, and it was previously unreachable except by scrolling.
- **The `«token»` index** at `/tokens`: one token, and every document that wants it, joined to
  its glossary meaning. It also states the uncomfortable number — how many tokens have no row in
  `PLACEHOLDERS.md`, and so cannot be prompted for by `/ai-init`.
- **`«PLACEHOLDER»` tokens are marked** wherever they appear, so an unfilled doc looks unfilled —
  the library's central convention, made visible.
- **Cross-references resolve.** A doc that links to `./QUALITY_ASSURANCE.md` links to that page
  here, matched on basename. Links to files that only exist in a *consuming* repo render inert
  rather than broken, and `«PLACEHOLDER»` URLs render as tokens.
- **Layer framing.** Each layer states what you do with it (run / fill / invoke / never invoke)
  and where a deployed copy lands.
- **A sibling rail** on every document page, grouped by topic, with the current file marked —
  because the document you want is usually one along from the one you opened.
- **Filterable index** at `/browse`, over names, descriptions and deploy paths.

## Layout

```
app/
├── page.tsx              the front page — doors, topics, layers, contents, status
├── topics/               the topic index, and one page per topic
├── tokens/               every «token» and the documents that want it
├── design-system/        the tokens, type and components, read out of globals.css
├── brand-voice/          how the site writes, with the copy that shipped
├── browse/               the filterable index
├── [layer]/page.tsx      one layer's ledger, grouped by topic past a dozen files
├── [layer]/[slug]/       one document
├── search-index.json/    a static route handler — the palette's index, ~195 kB
└── globals.css           the whole design system, no framework
lib/
├── content.ts            reads the repo: layers, docs, CATALOG descriptions, link map
├── topics.ts             the topic axis — hand-written, one topic per document
└── tokens.ts             «token» extraction, joined to the PLACEHOLDERS.md glossary
components/
├── markdown.tsx          renderer + the «token» remark plugin + link rewriting
├── ui.tsx                the ledger row, used by nearly every page
├── command-palette.tsx   ⌘K over documents, sections and tokens
├── doc-nav.tsx           the sibling rail on a document page
├── dev-bar.tsx           the sticky workbench strip along the bottom
├── browse-client.tsx     the /browse filter
└── tokens-client.tsx     the /tokens filter
```

### The search index

The palette searches section headings, which is 150 kB of index — far too much to inline into
each of 159 pages. `app/search-index.json/route.ts` is a `force-static` route handler, the only
way to emit a plain JSON file under `output: 'export'`; the palette fetches it on first open and
the browser caches it from there. Adding a document to the library regenerates it; nothing needs
to be kept in step by hand.

### The two reference pages

`/design-system` and `/brand-voice` document the site itself, and are reachable from the dev bar
pinned to the bottom of every page (and from the footer, since the bar can be hidden — it
remembers). The bar also carries the three facts worth having while styling: the current route,
the viewport in px and rem against the stylesheet's own breakpoints, and the resolved colour
scheme. To make it a local-only tool, gate the mount effect in `components/dev-bar.tsx` on
`process.env.NODE_ENV === 'development'`.

The design system holds to the same rule as the rest of the site: it is a **view**. Swatches,
values, breakpoints and counts are parsed out of `app/globals.css` at build time by
`lib/design.ts`, and every component specimen is the real markup with the real class — so a
component breaks on that page before it breaks anywhere else. A token added to `:root` tomorrow
appears there with no edit; if it matches no group it shows under "Everything else".

### Adding a document

The site follows the library — with one exception. `lib/topics.ts` maps every file to a topic and
is written by hand, because deriving it from keywords filed `EMAIL_DELIVERABILITY` under security
(SPF, DKIM) and `PRIVACY_CONTRACT_TEST` under testing. A new file that nobody has placed shows up
in an **Unfiled** group on `/topics` and at the bottom of its layer index; it does not break the
build.

## Design

White ground, ink type, hairline rules — a card catalog rather than a dashboard. Instrument
Serif for display, Newsreader for body, JetBrains Mono for anything a machine would read. Each
layer — and each topic — carries its own accent, set as `--layer-light`/`--layer-dark` on an
element marked `data-layer` or `data-topic`, and resolved to `--layer` in one place. Setting the
pair without one of those attributes silently falls back to the house accent, which is how eleven
topics first shipped in a single colour. Light
and dark both ship; the palette lives entirely in CSS custom properties at the top of
`globals.css`.
