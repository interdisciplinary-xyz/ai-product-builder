import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Link, Ledger, PageHead } from '@/domains/ui';
import { DocEntry, LayerIcon } from '@/domains/content';
import { TOPICS, TOPIC_BY_ID, type TopicId } from '@/domains/topics';
import { docsForTopicByLayer, docsForTopic } from '@/domains/topics/server';

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ topic: topic.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const topic = TOPIC_BY_ID.get((await params).topic as TopicId);
  if (!topic) return {};
  return { title: topic.label, description: topic.blurb };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const id = (await params).topic as TopicId;
  const topic = TOPIC_BY_ID.get(id);
  if (!topic) notFound();

  const groups = docsForTopicByLayer(id);
  const all = docsForTopic(id);
  // The manager is the thing you *run*; everything else in the topic is either
  // what it produces or what watches while you do it. So it goes first, named.
  const lead = all.find((d) => d.layer === 'managers');
  const style = {
    ['--layer-light' as string]: topic.accent,
    ['--layer-dark' as string]: topic.accentDark,
  };

  return (
    <div className="shell" data-topic={id} style={style}>
      <nav className="crumbs mono" aria-label="Breadcrumb">
        <Link href="/">index</Link>
        <span aria-hidden="true">/</span>
        <Link href="/topics/">topics</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{id}</span>
      </nav>

      <PageHead
        eyebrow={`${all.length} files across ${groups.length} ${groups.length === 1 ? 'layer' : 'layers'}`}
        title={topic.label}
        lede={topic.blurb}
      >
        {lead ? (
          <p className="topichead__lead">
            <Link href={`/${lead.layer}/${lead.slug}/`} className="button">
              Start by running {lead.name}
            </Link>
            <span className="topichead__note">
              A manager is the only layer that runs. It produces and then audits the documents
              below.
            </span>
          </p>
        ) : null}
      </PageHead>

      {groups.map(({ layer, docs }) => (
        <section key={layer.id} aria-labelledby={`group-${layer.id}`}>
          <h2 className="ledger__group" id={`group-${layer.id}`}>
            <LayerIcon layer={layer.id} />
            <Link href={`/${layer.id}/`}>{layer.label}</Link>
            <span className="ledger__group-note">you {layer.verb} them</span>
            <span className="ledger__count mono">{docs.length}</span>
          </h2>
          <Ledger>
            {docs.map((doc, i) => (
              <DocEntry key={doc.slug} doc={doc} index={i} />
            ))}
          </Ledger>
        </section>
      ))}

      <nav className="topicpager" aria-label="Other topics">
        <p className="eyebrow">Other topics</p>
        <ul>
          {TOPICS.filter((t) => t.id !== id).map((t) => (
            <li key={t.id}>
              <Link
                href={`/topics/${t.id}/`}
                className="chip"
                data-topic={t.id}
                style={{
                  ['--layer-light' as string]: t.accent,
                  ['--layer-dark' as string]: t.accentDark,
                }}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export const dynamicParams = false;
