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

- **A second axis.** Layers say what a file *is*; [topics](domains/topics/constants.ts) say what it is **for**.
  Eleven jobs — secure it, launch it, keep the docs true — each cutting across every layer, with
  all 129 files placed on exactly one. `/topics`, and the grouping inside any layer index past a
  dozen files.
- **Search from anywhere.** <kbd>⌘K</kbd> (or `/`) opens a palette over documents, the library's
  1,607 **section headings**, and its tokens. A section is the unit that actually answers a
  question, and it was previously unreachable except by scrolling.
- **MANAGER sections are headings.** A manager marks its sections with a bare uppercase line
  rather than `##`, so all 25 of them parsed to zero headings — no contents rail, no reading
  position, no section rows in the palette, on the longest documents in the library. The
  renderer promotes those lines and the corpus counts them: 110 pages had a contents rail
  before, 265 do now.
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
app/                      the routes — the composition root, and nothing else
├── page.tsx              the front page — doors, topics, layers, contents, status
├── topics/               the topic index, and one page per topic
├── tokens/               every «token» and the documents that want it
├── design-system/        the tokens, type and components, read out of globals.css
├── brand-voice/          how the site writes, with the copy that shipped
├── browse/               the filterable index
├── review/               the triage pass — /review, then /review/<layer>/<slug>
├── [layer]/page.tsx      one layer's ledger, grouped by topic past a dozen files
├── [layer]/[slug]/       one document
├── search-index.json/    a static route handler — the palette's index, ~234 kB
└── globals.css           the whole design system, no framework
domains/                  one directory per feature, one barrel each — see domains/README.md
├── ui/                   the base leaf: Link, Entry, Ledger, PageHead, the icon spec
│   ├── components/       each component a kebab folder; index.ts re-exports them all
│   └── index.ts          the domain barrel — `export * from './components'`
├── content/              the library itself — taxonomy, corpus, Markdown renderer
│   └── server/           reads the repo off disk; never re-exported from the barrel
├── topics/               the topic axis, hand-written, one topic per document
├── tokens/               «token» extraction, joined to the PLACEHOLDERS.md glossary
├── search/               ⌘K over documents, sections and tokens, plus /browse
├── favorites/            the star, and the list in data/favorites.json
│   └── server/           the committed list; the barrel stays client-safe
├── review/               the triage pass — verdicts in data/reviews.json
│   └── server/           the verdict file, and the queue built from the corpus
├── navigation/           masthead, the sibling rail, the in-page contents
└── design/               the dev bar, and globals.css parsed at build time
scripts/tools/
└── audit-domain-graph.mjs  the boundary gate — `pnpm arch:check --strict`
```

### Domain boundaries

The app implements [`RUNBOOK_DOMAIN_ARCHITECTURE`](../runbooks/RUNBOOK_DOMAIN_ARCHITECTURE.md):
every feature is a directory under `domains/`, its public surface is one barrel, and deep imports
do not exist. Every directory is kebab-case and re-exports the directories beneath it one level at
a time — component folder → `components/index.ts` → the domain barrel — so a component can move
without any consumer noticing. Anything filesystem-backed lives behind a `/server` sub-entrypoint
that the client-safe barrel never re-exports — one line of convenience there would put `node:fs`
and the whole repository into the browser bundle.

The graph is data, not prose: `ALLOWED` in `scripts/tools/audit-domain-graph.mjs`. The audit
parses the TypeScript AST rather than grepping for paths, and `pnpm arch:check --strict` runs in
`ci:quality` alongside `tsc` and the local ESLint rule that reports the same violations as you
type them. `domains/README.md` has the whole DAG and the list of checks.

```bash
pnpm arch:check          # domain boundaries — counts, for trending
pnpm arch:check --strict # exits non-zero on any violation
pnpm type:check --strict # the type scale — every size names a step
pnpm ci:quality          # types → lint → arch:check → type:check → build
```

### Favorites

Marked from the star on any document page or any row in `/browse`, and written to
`data/favorites.json` — committed with the rest of the repository, so the list is in git rather
than in one browser and its history says when each document was marked.

That needs a server to write the file, and `output: 'export'` removes route handlers *everywhere*,
including from `next dev` — a POST there falls through to the `[layer]/[slug]` catch-all and 500s.
So the export is production-only (`next.config.mjs`), dev runs as an ordinary Node server, and
`pnpm build` drops `app/api/favorites/` from `out/` again. A built copy is therefore **read-only**:
it ships whatever was committed, and every star is disabled with a title saying why, rather than
flipping and saving nothing.

There is deliberately no `localStorage` here — two stores means two answers to the same question,
and the browser copy is the one that gets lost. The consequence is that this is **one list, not one
per reader**, which is right while the site has one reader and is the thing to replace on the day
it does not.

### Review

`/review` runs a triage pass over the library: one question per document — does
this earn its place, **keep** / **rework** / **cut**, and why. `/review/<layer>/<slug>`
renders the document with a verdict console pinned to the bottom of the page, so the
call is made against the text rather than against a description of it. <kbd>k</kbd>,
<kbd>r</kbd> and <kbd>c</kbd> record a verdict and jump to the next undecided file;
<kbd>n</kbd> and <kbd>p</kbd> move without deciding.

The route is a catch-all rather than `/review/<slug>` because slugs are not unique:
`MANAGER_A11Y_AUDIT` and `RUNBOOK_A11Y_AUDIT` both slugify to `a11y-audit`, as do
`decision-log` and `payments-compliance`. Six files, three collisions.

Verdicts are written to `data/reviews.json` on the same terms as the favorites list —
committed to the repository, PUT-only endpoint, gone from a static build. That
matters more here: reading 138 documents is hours of judgment, and the verdicts are
the cheap, losable part. In a file the pass diffs, survives a closed tab, and
`git log data/reviews.json` says when each call was made.

When the pass is done the filter on `/review` is the deliverable: **Cut** is the list
of files to delete, **Rework** is the next milestone.

### Typography

The site implements [`RUNBOOK_TYPOGRAPHY`](../runbooks/RUNBOOK_TYPOGRAPHY.md). Three sans faces —
Archivo, IBM Plex Sans, JetBrains Mono — and 21 steps for every size, leading and tracking on the
site. The first audit of this stylesheet found **46 distinct font sizes across 132 declarations**;
`scripts/tools/audit-type-scale.mjs` now fails the build on any literal that is not a step, and on
a serif fallback creeping back under a sans stack.

`/design-system` reads those steps out of `globals.css` at build time, so the specimen page cannot
show a size the stylesheet does not have.

### The search index

The palette searches section headings, which is 234 kB of index — far too much to inline into
each of 159 pages. `app/search-index.json/route.ts` is a `force-static` route handler, the only
way to emit a plain JSON file under `output: 'export'`; the palette fetches it on first open and
the browser caches it from there. Adding a document to the library regenerates it; nothing needs
to be kept in step by hand.

### The two reference pages

`/design-system` and `/brand-voice` document the site itself, and are reachable from the dev bar
pinned to the bottom of every page (and from the footer, since the bar can be hidden — it
remembers). The bar also carries the three facts worth having while styling: the current route,
the viewport in px and rem against the stylesheet's own breakpoints, and the resolved colour
scheme. To make it a local-only tool, gate the mount effect in `domains/design/components/dev-bar/dev-bar.tsx` on
`process.env.NODE_ENV === 'development'`.

The design system holds to the same rule as the rest of the site: it is a **view**. Swatches,
values, breakpoints and counts are parsed out of `app/globals.css` at build time by
`domains/design/server/stylesheet.ts`, and every component specimen is the real markup with the real class — so a
component breaks on that page before it breaks anywhere else. A token added to `:root` tomorrow
appears there with no edit; if it matches no group it shows under "Everything else".

### Adding a document

The site follows the library — with one exception. `domains/topics/constants.ts` maps every file to a topic and
is written by hand, because deriving it from keywords filed `EMAIL_DELIVERABILITY` under security
(SPF, DKIM) and `PRIVACY_CONTRACT_TEST` under testing. A new file that nobody has placed shows up
in an **Unfiled** group on `/topics` and at the bottom of its layer index; it does not break the
build.

## Design

White ground, ink type, hairline rules — a card catalog rather than a dashboard. Three sans
faces, one job each: Archivo for display, IBM Plex Sans for body, JetBrains Mono for anything a
machine would read — see [`RUNBOOK_TYPOGRAPHY`](../runbooks/RUNBOOK_TYPOGRAPHY.md) for why those
and how the scale is enforced. Every size, leading and tracking names one of 21 steps declared on
`:root`; `pnpm type:check --strict` fails the build on a literal. Each
layer — and each topic — carries its own accent, set as `--layer-light`/`--layer-dark` on an
element marked `data-layer` or `data-topic`, and resolved to `--layer` in one place. Setting the
pair without one of those attributes silently falls back to the house accent, which is how eleven
topics first shipped in a single colour. Light
and dark both ship; the palette lives entirely in CSS custom properties at the top of
`globals.css`.
