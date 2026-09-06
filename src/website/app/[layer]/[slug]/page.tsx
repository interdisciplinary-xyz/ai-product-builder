import { Link } from '@/components/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  LAYER_BY_ID,
  allDocs,
  docsForLayer,
  findDoc,
  linkMap,
  relations,
  pairing,
  deployedPath,
  type LayerId,
} from '@/lib/content';
import { Markdown, CodeBlock } from '@/components/markdown';
import { layerStyle } from '@/components/ui';
import { LayerIcon } from '@/components/icons';
import { DocToc } from '@/components/doc-toc';
import { DocNav } from '@/components/doc-nav';
import { topicOf } from '@/lib/topics';
import { tokensIn } from '@/lib/tokens';

const GITHUB = 'https://github.com/interdisciplinary-xyz/ai-product-builder/blob/main';

export function generateStaticParams() {
  return allDocs().map((doc) => ({ layer: doc.layer, slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ layer: string; slug: string }>;
}): Promise<Metadata> {
  const { layer, slug } = await params;
  const doc = findDoc(layer, slug);
  if (!doc) return {};
  return {
    title: doc.name,
    description: doc.description ?? doc.heading ?? undefined,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ layer: string; slug: string }>;
}) {
  const { layer: layerId, slug } = await params;
  const doc = findDoc(layerId, slug);
  const layer = LAYER_BY_ID.get(layerId as LayerId);
  if (!doc || !layer) notFound();

  const siblings = docsForLayer(doc.layer);
  const at = siblings.findIndex((d) => d.slug === doc.slug);
  const previous = siblings[at - 1];
  const next = siblings[at + 1];
  const toc = doc.headings.filter((h) => h.depth === 2);
  const { outbound, inbound } = relations(doc);
  const pair = pairing(doc);
  const topic = topicOf(doc);
  const tokens = tokensIn(doc);

  return (
    <div className="shell doc" data-layer={doc.layer} style={layerStyle(layer)}>
      <nav className="crumbs mono" aria-label="Breadcrumb">
        <Link href="/">index</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${doc.layer}/`} className="crumbs__layer">
          <LayerIcon layer={doc.layer} /> {doc.layer}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{doc.slug}</span>
        {topic ? (
          <Link href={`/topics/${topic.id}/`} className="crumbs__topic">
            {topic.label}
          </Link>
        ) : null}
      </nav>

      <header className="doc__head rise">
        <h1 className="doc__title mono">{doc.name}</h1>
        {doc.description ?? doc.heading ? (
          <p className="doc__desc">{doc.description ?? doc.heading}</p>
        ) : null}
        <dl className="doc__meta mono">
          <div>
            <dt>Source</dt>
            <dd>
              <a href={`${GITHUB}/${doc.repoPath}`} target="_blank" rel="noreferrer noopener">
                {doc.repoPath}
              </a>
            </dd>
          </div>
          {doc.deployedAs ? (
            <div>
              <dt>Deployed as</dt>
              <dd>{deployedPath(doc, layer)}</dd>
            </div>
          ) : null}
          <div>
            <dt>You</dt>
            <dd>{layer.verb} it</dd>
          </div>
          {pair ? (
            <div className="doc__meta--pair">
              <dt>{pair.role}</dt>
              <dd>
                {pair.docs.map((d, i) => (
                  <span key={`${d.layer}/${d.slug}`}>
                    {i > 0 ? ', ' : ''}
                    <Link href={`/${d.layer}/${d.slug}/`}>{d.name}</Link>
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>Length</dt>
            <dd>
              {doc.words.toLocaleString('en-US')} words · {(doc.bytes / 1024).toFixed(1)} kB
            </dd>
          </div>
          {tokens.length ? (
            <div>
              <dt>To fill</dt>
              <dd>
                <Link href="/tokens/">
                  {tokens.length} «{tokens.length === 1 ? 'token' : 'tokens'}»
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      <div className="doc__body">
        <DocNav doc={doc} siblings={siblings} />

        <article>
          {doc.language ? (
            <CodeBlock code={doc.body} language={doc.language} />
          ) : (
            <Markdown
              content={doc.body}
              links={linkMap()}
              self={`/${doc.layer}/${doc.slug}/`}
            />
          )}
        </article>

        {toc.length > 2 ? (
          <DocToc headings={toc.map(({ id, text }) => ({ id, text }))} />
        ) : null}
      </div>

      {outbound.length || inbound.length ? (
        <section className="relations" aria-labelledby="relations-heading">
          <h2 id="relations-heading" className="eyebrow">
            How this connects
          </h2>
          <div className="relations__grid">
            {outbound.length ? (
              <div>
                <h3>This document points at</h3>
                <ul>
                  {outbound.map((d) => (
                    <li key={`${d.layer}/${d.slug}`}>
                      <Link href={`/${d.layer}/${d.slug}/`} data-layer={d.layer} style={layerStyle(LAYER_BY_ID.get(d.layer))}>
                        <LayerIcon layer={d.layer} />
                        <span className="mono">{d.name}</span>
                        <span className="relations__layer">{d.layer}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {inbound.length ? (
              <div>
                <h3>Referenced by {inbound.length} other {inbound.length === 1 ? 'document' : 'documents'}</h3>
                <ul>
                  {inbound.map((d) => (
                    <li key={`${d.layer}/${d.slug}`}>
                      <Link href={`/${d.layer}/${d.slug}/`} data-layer={d.layer} style={layerStyle(LAYER_BY_ID.get(d.layer))}>
                        <LayerIcon layer={d.layer} />
                        <span className="mono">{d.name}</span>
                        <span className="relations__layer">{d.layer}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <nav className="pager" aria-label="Nearby documents">
        {previous ? (
          <Link href={`/${previous.layer}/${previous.slug}/`} className="pager__link">
            <span className="eyebrow">← Previous</span>
            <span className="mono">{previous.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/${next.layer}/${next.slug}/`} className="pager__link pager__link--next">
            <span className="eyebrow">Next →</span>
            <span className="mono">{next.name}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

export const dynamicParams = false;
