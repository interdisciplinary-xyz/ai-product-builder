import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Link, Ledger, PageHead } from '@/domains/ui';
import { LAYERS, LAYER_BY_ID, DocEntry, LayerIcon, layerStyle, type LayerId } from '@/domains/content';
import { docsForLayer } from '@/domains/content/server';
import { groupByTopic } from '@/domains/topics';

export function generateStaticParams() {
  return LAYERS.map((layer) => ({ layer: layer.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ layer: string }>;
}): Promise<Metadata> {
  const layer = LAYER_BY_ID.get((await params).layer as LayerId);
  if (!layer) return {};
  return { title: layer.label, description: layer.blurb };
}

export default async function LayerPage({ params }: { params: Promise<{ layer: string }> }) {
  const id = (await params).layer as LayerId;
  const layer = LAYER_BY_ID.get(id);
  if (!layer) notFound();

  const docs = docsForLayer(id);
  // Seventy-four runbooks in one alphabetical column is a wall, not an index:
  // the only way through it is to already know the filename. Past a dozen, the
  // topic map earns its keep and the list is grouped by the job each doc serves.
  const groups = groupByTopic(docs);
  const grouped = docs.length > 12 && groups.length > 1;

  return (
    <div className="shell" data-layer={id} style={layerStyle(layer)}>
      <PageHead
        eyebrow={`${docs.length} files · deployed to ${layer.target}`}
        title={
          <>
            <LayerIcon layer={id} className="pagehead__icon" /> {layer.label}
          </>
        }
        lede={layer.blurb}
      />

      {grouped ? (
        <>
          <nav className="jumpbar" aria-label="Jump to a topic">
            <span className="eyebrow">By topic</span>
            <ul>
              {groups.map(({ topic, docs: rows }) => (
                <li key={topic?.id ?? 'unfiled'}>
                  <a
                    href={`#topic-${topic?.id ?? 'unfiled'}`}
                    className="chip"
                    data-topic={topic?.id}
                    style={
                      topic
                        ? {
                            ['--layer-light' as string]: topic.accent,
                            ['--layer-dark' as string]: topic.accentDark,
                          }
                        : undefined
                    }
                  >
                    {topic?.label ?? 'Unfiled'} <span className="mono">{rows.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {groups.map(({ topic, docs: rows }) => {
            const key = topic?.id ?? 'unfiled';
            return (
            <section
              key={key}
              id={`topic-${key}`}
              aria-labelledby={`topic-${key}-heading`}
              data-topic={topic?.id}
              style={
                topic
                  ? {
                      ['--layer-light' as string]: topic.accent,
                      ['--layer-dark' as string]: topic.accentDark,
                    }
                  : undefined
              }
            >
              <h2 className="ledger__group" id={`topic-${key}-heading`}>
                {topic ? (
                  <Link href={`/topics/${topic.id}/`}>{topic.label}</Link>
                ) : (
                  <span>Unfiled</span>
                )}
                <span className="ledger__group-note">
                  {topic?.question ?? 'Not yet placed on the topic map.'}
                </span>
                <span className="ledger__count mono">{rows.length}</span>
              </h2>
              <Ledger>
                {rows.map((doc, i) => (
                  <DocEntry key={doc.slug} doc={doc} index={i} />
                ))}
              </Ledger>
            </section>
            );
          })}
        </>
      ) : (
        <Ledger>
          {docs.map((doc, i) => (
            <DocEntry key={doc.slug} doc={doc} index={i} />
          ))}
        </Ledger>
      )}
    </div>
  );
}

export const dynamicParams = false;
