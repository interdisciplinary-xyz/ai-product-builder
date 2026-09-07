# `domains/` — the DAG

This app implements `RUNBOOK_DOMAIN_ARCHITECTURE.md`. The three-sentence rule:

> Every feature is a directory under `domains/`. Its public surface is one
> barrel file. Cross-domain imports go through the barrel; deep imports do not
> exist.

## The local definitions

The runbook ships «placeholders» for the things that differ per repo. This app's
values, in one place:

| Token | Value here |
| --- | --- |
| `«DOMAIN_PATHS»` | `domains/<name>/**`, imported as `@/domains/<name>` |
| `«BASE_LEAF»` | `ui` — depends on nothing, ever |
| `«AUDIT_DOMAIN_SCRIPT»` | `scripts/tools/audit-domain-graph.mjs`, run as `pnpm arch:check --strict` |
| `«LOCAL_ESLINT_DIR»` | `eslint-local-rules/`, wired in `eslint.config.mjs` |
| `«SERVER_SUBENTRY»` | `server`, so `@/domains/<name>/server` |

## The graph

```
ui            → —                                    ← base leaf
favorites     → ui
design        → ui
content       → ui, favorites
topics        → ui, content
tokens        → ui, content
review        → ui, content
search        → ui, content, favorites
navigation    → ui, content, topics, search, favorites
```

`content → favorites`, and not the other way round, is the one edge worth
explaining. A document row carries a star, so `DocEntry` needs the button —
and `favorites` needs to know nothing about documents, because a key is
`<group>/<id>` and that is also the route. Pointing the edge the other way
would have made the graph cyclic for no gain.

`review` reaches `content` only from its `/server` surface, to build the queue
from the corpus; the client-safe barrel takes the queue as plain data.

The map itself lives in `scripts/tools/audit-domain-graph.mjs` as `ALLOWED`,
because a graph in prose is a graph nothing checks. Add a domain, add a row.

## The client / server line

This site is a build-time *view* of the library's markdown: the corpus, the
token index and the stylesheet are all read off disk. Every one of those lives
behind a `/server` sub-entrypoint and is imported by its full path
(`@/domains/content/server`), never re-exported from the domain barrel. A single
line of convenience there would put `node:fs` — and the whole repository — into
the browser bundle.

`app/` is the composition root. It may import any barrel and any `/server`
surface, because a route file in the App Router is a server component by
construction. What it may not do is reach past a barrel, and the audit checks
that for every file regardless of where it lives.

## One barrel per directory

Each directory re-exports the directories beneath it, one level at a time:

```
domains/ui/
├─ components/
│  ├─ entry/
│  │  ├─ entry.tsx
│  │  ├─ entry.constants.ts
│  │  └─ index.ts          ← re-exports Entry
│  ├─ link/  …
│  └─ index.ts             ← `export { Entry } from './entry'`, one line per folder
├─ constants.ts
├─ types.ts
└─ index.ts                ← `export * from './components'`, plus the domain's own files
```

A domain barrel that reached straight into `./components/entry` would have to be
edited every time a component moved, which is the coupling the convention exists
to remove. The audit holds all three links of the chain: a `components/` with no
`index.ts`, a component folder missing from it, or a domain barrel reaching past
`./components` are each a violation.

`./server` is the deliberate exception — it is a child directory that the
client-safe barrel must **not** re-export, for the reason above.

## What the audit checks

`pnpm arch:check` — AST-based, never a grep:

1. Deep imports past a barrel, from anywhere.
2. Cross-domain edges absent from `ALLOWED`.
3. `<domain>/server` → `<domain>/server` edges absent from `SERVER_DEPS_ALLOWED`.
4. A `'use client'` module importing a `/server` surface, or a `node:` builtin.
5. A client barrel re-exporting its own `/server` surface.
6. The component-folder shape: `name/name.tsx` + `name/index.ts`, kebab-case.
7. The re-export chain: `components/index.ts` exists, carries every folder beside
   it, and the domain barrel re-exports `./components` rather than reaching past it.
8. A domain directory with no row in `ALLOWED` — its edges would go unaudited.
9. Cycles, by DFS over `ALLOWED`. `ACCEPTED_CYCLES` is empty and should stay so.

`--strict` exits non-zero on any violation, and `ci:quality` runs it that way.

## The component convention

Every component is a folder whose file matches its name:

```
entry/
├─ entry.tsx            ← the component
├─ entry.constants.ts   ← constants used only by entry
└─ index.ts             ← re-exports; no logic
```

**Every directory in this tree is kebab-case, and the file matches its folder.**
The runbook's §4 writes the folder as `Button/Button.tsx`; this repo writes
`button/button.tsx` instead, because the routes under `app/` were already
kebab (`design-system/`, `search-index.json/`) and one tree with two casing
rules is a tree you have to guess at. The rule the runbook actually cares about
— filename equals directory name, so a stack trace names the component rather
than a wall of `index.tsx` — is unchanged. Exported identifiers stay
PascalCase: that is a JavaScript convention, not a filesystem one.

The audit enforces both halves: a folder that is not kebab-case is a violation,
and so is a folder whose main file does not match its name.

`name.spec.tsx` is the fourth file in the runbook's convention and there are
none here yet: this app has no test runner. The audit reports spec coverage on
every run so the number cannot quietly stay at zero.
