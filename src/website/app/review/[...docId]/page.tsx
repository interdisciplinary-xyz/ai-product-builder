import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Link } from '@/domains/ui';
import { LAYER_BY_ID, Markdown, CodeBlock, LayerIcon, layerStyle, type LayerId } from '@/domains/content';
import { findDoc, linkMap } from '@/domains/content/server';
import { DocToc } from '@/domains/navigation';
import { ReviewConsole } from '@/domains/review';
import { reviewQueue } from '@/domains/review/server';

/**
 * `docId` is `<layer>/<slug>` — one id, spelled across two segments, which is
 * why this is a catch-all rather than `[docId]`.
 *
 * A single segment cannot address the library: MANAGER_A11Y_AUDIT and
 * RUNBOOK_A11Y_AUDIT both slugify to `a11y-audit`, and so do decision-log and
 * payments-compliance. Six files, three collisions — `/review/a11y-audit` would
 * silently review whichever one the corpus happened to yield first.
 */
export function generateStaticParams() {
  return reviewQueue().map((item) => ({ docId: item.key.split('/') }));
}

function docFor(docId: string[]) {
  if (docId.length !== 2) return null;
  const [layer, slug] = docId;
  return findDoc(layer, slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ docId: string[] }>;
}): Promise<Metadata> {
  const { docId } = await params;
  const doc = docFor(docId);
  return doc ? { title: `Review ${doc.name}` } : {};
}

export default async function ReviewDocPage({
  params,
}: {
  params: Promise<{ docId: string[] }>;
}) {
  const { docId } = await params;
  const doc = docFor(docId);
  const layer = doc ? LAYER_BY_ID.get(doc.layer as LayerId) : undefined;
  if (!doc || !layer) notFound();

  const toc = doc.headings.filter((h) => h.depth === 2);
  const queue = reviewQueue();
  const at = queue.findIndex((item) => item.key === `${doc.layer}/${doc.slug}`);
  if (at < 0) notFound();
  const item = queue[at];

  return (
    <div className="shell doc doc--review" data-layer={doc.layer} style={layerStyle(layer)}>
      <nav className="crumbs mono" aria-label="Breadcrumb">
        <Link href="/review/">review</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${doc.layer}/`} className="crumbs__layer">
          <LayerIcon layer={doc.layer} /> {doc.layer}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{doc.slug}</span>
      </nav>

      {/* Compact on purpose. The document page can afford a full masthead of
          metadata; this one is read 138 times in a row, and every row of chrome
          is a row of the document you cannot see. Source and length stay —
          length is part of the judgment — and the rest goes. */}
      <header className="doc__head doc__head--review rise">
        <h1 className="doc__title mono">{doc.name}</h1>
        {doc.description ?? doc.heading ? (
          <p className="doc__desc">{doc.description ?? doc.heading}</p>
        ) : null}
        <p className="doc__meta--review mono">
          <span>{doc.repoPath}</span>
          <span>{layer.verb} it</span>
          <span>
            {doc.words.toLocaleString('en-US')} words · {(doc.bytes / 1024).toFixed(1)} kB
          </span>
        </p>
      </header>

      <div className="doc__body doc__body--review">
        {/* The document itself, so the judgment is made against the text rather
            than against a description of it. Same renderer as the document
            page; the sibling rail and the relations panel are left off — they
            are for navigating the library, and this page is for leaving it. */}
        <article>
          {doc.language ? (
            <CodeBlock code={doc.body} language={doc.language} />
          ) : (
            <Markdown content={doc.body} links={linkMap()} self={`/${doc.layer}/${doc.slug}/`} />
          )}
        </article>

        {/* The contents rail earns its place here more than anywhere: it is the
            only map of a 2,500-word manager, and it carries the reading
            progress that says how much of the judgment is still ahead. */}
        {toc.length > 2 ? <DocToc headings={toc.map(({ id, text }) => ({ id, text }))} /> : null}
      </div>

      <ReviewConsole
        item={item}
        previous={queue[at - 1]}
        next={queue[at + 1]}
        // Keys only. The console works out the next UNDECIDED document from the
        // live store; a server-computed answer would be stale the moment the
        // session's first verdict lands.
        queueKeys={queue.map((q) => q.key)}
        position={at + 1}
        total={queue.length}
      />
    </div>
  );
}

export const dynamicParams = false;
