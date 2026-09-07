import type { Metadata } from 'next';
import { Link, PageHead, Ledger } from '@/domains/ui';
import { DocEntry, LayerIcon } from '@/domains/content';
import { TOPICS } from '@/domains/topics';
import { topicCounts, docsForTopic, unfiledDocs } from '@/domains/topics/server';

export const metadata: Metadata = {
  title: 'By topic',
  description:
    'The library arranged by the job you are doing rather than by what each file is — eleven topics, each cutting across every layer.',
};

export default function TopicsPage() {
  const counts = topicCounts();
  const unfiled = unfiledDocs();

  return (
    <div className="shell">
      <PageHead
        eyebrow={`${TOPICS.length} topics · every file placed on exactly one`}
        title="What are you trying to do?"
        lede="Layers say what a file is — a playbook you run, a doc you fill. Topics say what it is for. Doing any one of these jobs means running a manager, filling its runbooks, and letting a skill watch the diff, so each topic cuts across every layer."
      />

      <ul className="topics">
        {TOPICS.map((topic) => {
          const docs = docsForTopic(topic.id);
          const lead = docs.find((d) => d.layer === 'managers') ?? docs[0];
          return (
            <li key={topic.id}>
              <Link
                href={`/topics/${topic.id}/`}
                className="topic"
                data-topic={topic.id}
                style={{
                  ['--layer-light' as string]: topic.accent,
                  ['--layer-dark' as string]: topic.accentDark,
                }}
              >
                <p className="topic__question">{topic.question}</p>
                <h2 className="topic__title display">{topic.label}</h2>
                <p className="topic__blurb">{topic.blurb}</p>
                <p className="topic__foot mono">
                  <span>{counts[topic.id]} files</span>
                  {lead ? (
                    <span className="topic__lead">
                      <LayerIcon layer={lead.layer} /> start at {lead.name}
                    </span>
                  ) : null}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      {unfiled.length ? (
        <section className="section">
          <header className="section__head">
            <h2 className="display">Unfiled</h2>
            <p>
              In the library but not yet placed on the topic map — the map is hand-written, and
              the site does not invent a home for a file it was not told about.
            </p>
          </header>
          <Ledger>
            {unfiled.map((doc) => (
              <DocEntry key={`${doc.layer}/${doc.slug}`} doc={doc} />
            ))}
          </Ledger>
        </section>
      ) : null}
    </div>
  );
}
