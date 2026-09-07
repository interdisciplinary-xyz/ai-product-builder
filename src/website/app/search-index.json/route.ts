import { allDocs } from '@/domains/content/server';
import { topicOf } from '@/domains/topics';
import { tokenIndex } from '@/domains/tokens/server';

/**
 * The palette searches sections, not just titles: 1,468 of them across the
 * library, which is where the answer to a real question ("what is the axe
 * gate?") actually lives. That index is ~150 kB, so it must NOT be inlined into
 * every page — it is fetched once, on the first keystroke, and cached.
 *
 * A static route handler is the only way to emit a plain JSON file under
 * `output: 'export'`; it lands at /search-index.json in the exported bundle.
 */
export const dynamic = 'force-static';

export function GET() {
  const docs = allDocs();

  return Response.json({
    docs: docs.map((d) => ({
      l: d.layer,
      s: d.slug,
      n: d.name,
      d: d.description ?? d.heading ?? '',
      t: topicOf(d)?.id ?? null,
      p: d.deployedAs,
    })),
    // [layer, slug, headingId, headingText] — a tuple, because 2,000 objects
    // with four keys each is a third of the payload spent on key names.
    headings: docs.flatMap((d) =>
      d.headings
        .filter((h) => h.depth === 2 || h.depth === 3)
        .map((h) => [d.layer, d.slug, h.id, h.text, d.name] as const),
    ),
    // Repo-wide tokens only: those are the ones /tokens lists and can be linked
    // to by anchor. An «inline» token is a prose slot with no row to land on.
    tokens: tokenIndex()
      .filter((t) => t.kind === 'repo')
      .map((t) => ({
        n: t.name,
        k: t.kind,
        c: t.docs.length,
        m: t.meaning,
      })),
  });
}
