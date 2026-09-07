import { allDocs, linkMap } from './corpus';
import type { Doc, Pairing, Relations } from '../types';

/**
 * Reads Node-only: `allDocs()` is the source, so the graph is server-side too.
 */

/* ----------------------------------------------------------- the link graph */

let graph: Map<string, Relations> | null = null;

const key = (d: Doc) => `${d.layer}/${d.slug}`;

/**
 * The library's structure is not in its file names — only 3 of 25 managers share
 * a name with a runbook. It is in the cross-references the documents actually
 * make. So read those: resolve every markdown link to the doc it names, and
 * invert the result to get "what points here".
 */
function buildGraph(): Map<string, Relations> {
  if (graph) return graph;
  const docs = allDocs();
  const map = linkMap();
  const byRoute = new Map(docs.map((d) => [`/${d.layer}/${d.slug}/`, d]));

  const out = new Map<string, Doc[]>();
  const inb = new Map<string, Doc[]>();
  for (const doc of docs) {
    const seen = new Set<string>();
    const targets: Doc[] = [];
    const mention = (raw: string) => {
      if (/^(https?:|mailto:)/.test(raw)) return;
      const base = raw.split('/').pop()?.toLowerCase();
      const route = base ? map[base] : undefined;
      const target = route ? byRoute.get(route) : undefined;
      if (!target || key(target) === key(doc) || seen.has(key(target))) return;
      seen.add(key(target));
      targets.push(target);
    };
    // Markdown links…
    for (const m of doc.body.matchAll(/\]\(([^)\s#]+)/g)) mention(m[1]);
    // …and bare filenames in inline code, which is how half the library's
    // "pairs with" / "defers to" references are actually written.
    for (const m of doc.body.matchAll(/`([A-Za-z0-9_./-]+\.(?:md|json|py))`/g)) mention(m[1]);

    out.set(key(doc), targets);
    for (const target of targets) {
      // The catalog and README link to every file by definition; counting them
      // as references would drown the signal on every page.
      if (doc.layer === 'guides') continue;
      const list = inb.get(key(target)) ?? [];
      list.push(doc);
      inb.set(key(target), list);
    }
  }

  // A doc referenced by most of the library is boilerplate, not a relation:
  // every setup block says "or invoke MANAGER_INIT.md". There is a clean cliff
  // between that (86% of docs) and the next most-referenced (33%).
  const frequency = new Map<string, number>();
  for (const targets of out.values()) {
    for (const t of targets) frequency.set(key(t), (frequency.get(key(t)) ?? 0) + 1);
  }
  const boilerplate = (d: Doc) => (frequency.get(key(d)) ?? 0) > docs.length / 2;

  graph = new Map(
    docs.map((d) => [
      key(d),
      {
        outbound: (out.get(key(d)) ?? []).filter((t) => !boilerplate(t)),
        inbound: inb.get(key(d)) ?? [],
      },
    ]),
  );
  return graph;
}

export function relations(doc: Doc): Relations {
  return buildGraph().get(key(doc)) ?? { outbound: [], inbound: [] };
}

/* -------------------------------------------------------------- the pairing */

/**
 * "A manager produces the runbook of the same name" is the library's central
 * claim, but only 3 of 25 names actually match. The real pairing is declared in
 * each manager's "Pairs with:" line — all 25 have one — where the FIRST runbook
 * named is the primary artifact and the rest are secondary references. Deriving
 * it from that line keeps the claim honest: a runbook referenced in passing by
 * eight managers is not "produced by" eight managers.
 */
let pairings: { primary: Map<string, Doc>; producedBy: Map<string, Doc[]> } | null = null;

function buildPairings() {
  if (pairings) return pairings;
  const docs = allDocs();
  const byFile = new Map(docs.map((d) => [d.file.toLowerCase(), d]));
  const primary = new Map<string, Doc>();
  const producedBy = new Map<string, Doc[]>();

  for (const manager of docs.filter((d) => d.layer === 'managers')) {
    const line = manager.body.match(/Pairs with:\*{0,2}([^\n]*)/)?.[1];
    if (!line) continue;
    const first = line.match(/`(RUNBOOK_[A-Z0-9_]+\.md)`/);
    const target = first ? byFile.get(first[1].toLowerCase()) : undefined;
    if (!target) continue;
    primary.set(key(manager), target);
    const list = producedBy.get(key(target)) ?? [];
    list.push(manager);
    producedBy.set(key(target), list);
  }

  pairings = { primary, producedBy };
  return pairings;
}

export function pairing(doc: Doc): Pairing {
  const { primary, producedBy } = buildPairings();
  if (doc.layer === 'managers') {
    const target = primary.get(key(doc));
    return target ? { role: 'Produces', docs: [target] } : null;
  }
  if (doc.layer === 'runbooks') {
    const managers = producedBy.get(key(doc)) ?? [];
    return managers.length ? { role: 'Produced by', docs: managers } : null;
  }
  return null;
}
