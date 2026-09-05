import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  LAYER_BY_ID,
  allDocs,
  docsForLayer,
  findDoc,
  linkMap,
  type LayerId,
} from '@/lib/content';
import { Markdown, CodeBlock } from '@/components/markdown';
import { layerStyle } from '@/components/ui';

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

  return (
    <div className="shell doc" data-layer={doc.layer} style={layerStyle(layer)}>
      <nav className="crumbs mono" aria-label="Breadcrumb">
        <Link href="/">index</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${doc.layer}/`}>
          {layer.icon} {doc.layer}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{doc.slug}</span>
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
              <dd>
                {layer.target === '—' ? doc.deployedAs : `${layer.target}${doc.deployedAs}`}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>You</dt>
            <dd>{layer.verb} it</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>
              {doc.words.toLocaleString('en-US')} words · {(doc.bytes / 1024).toFixed(1)} kB
            </dd>
          </div>
        </dl>
      </header>

      <div className="doc__body">
        <article>
          {doc.language ? (
            <CodeBlock code={doc.body} language={doc.language} />
          ) : (
            <Markdown content={doc.body} links={linkMap()} />
          )}
        </article>

        {toc.length > 2 ? (
          <aside className="toc" aria-label="On this page">
            <p className="eyebrow">On this page</p>
            <ol>
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>

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
