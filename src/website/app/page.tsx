import { Link, Entry, Ledger, DoorIcon } from '@/domains/ui';
import { LAYERS, LAYER_BY_ID, DocEntry, LayerIcon, layerStyle } from '@/domains/content';
import { allDocs, docsForLayer, layerCounts, libraryVersion, findDoc } from '@/domains/content/server';
import { FavoriteButton, favoriteKey } from '@/domains/favorites';
import { TOPICS } from '@/domains/topics';
import { topicCounts, docsForTopic } from '@/domains/topics/server';

export default function HomePage() {
  const counts = layerCounts();
  const topics = topicCounts();
  const docs = allDocs();
  const total = docs.filter((d) => d.layer !== 'guides').length;
  const version = libraryVersion();
  const words = docs.reduce((sum, d) => sum + d.words, 0);

  const doors = [
    {
      key: 'evaluating',
      icon: 'evaluate' as const,
      title: 'Evaluating?',
      body: 'Read the most opinionated document here. If you can live with it, the rest will fit.',
      doc: findDoc('runbooks', 'release-manager'),
    },
    {
      key: 'adopting',
      icon: 'adopt' as const,
      title: 'Adopting?',
      body: 'The one that earns its keep on day one — the pre-merge gate, with the commands and budgets spelled out.',
      doc: findDoc('runbooks', 'quality-assurance'),
    },
    {
      key: 'best',
      icon: 'best' as const,
      title: 'Just the best thing?',
      body: 'Three assertion shapes that pass identically against broken and fixed code. It fires without being asked.',
      doc: findDoc('skills', 'tests-that-cannot-fail'),
    },
  ];

  return (
    <div className="shell">
      <section className="hero">
        <div className="hero__text rise">
          <p className="eyebrow">A documentation library for Claude Code · v{version}</p>
          <h1 className="display hero__title">
            Every repo re-litigates the same forty decisions.
            <em> This is those decisions, written once.</em>
          </h1>
          <p className="hero__lede">
            Playbooks, runbook templates and agent skills for solo founders shipping products with
            Claude Code — written as documents an agent can <strong>execute</strong>, not just read.
            You run a playbook; it produces and then audits the doc your team lives with.
          </p>
          <p className="hero__actions">
            <Link href="/topics/" className="button">
              Start with what you&rsquo;re doing
            </Link>
            <Link href="/browse/" className="button button--ghost">
              Browse all {total} files
            </Link>
          </p>
        </div>

        <aside className="specimen rise" style={{ animationDelay: '140ms' }} aria-label="What a deployed copy looks like">
          <p className="specimen__cap eyebrow">After npm run deploy ../my-app/docs</p>
          <pre className="mono">
            <code>{`my-app/
├── docs/
│   ├── 📘 RELEASE_MANAGER.md   ← a doc you fill
│   ├── 🎛️ MANAGER_SECURITY.md  ← a playbook you run
│   └──    … 93 more
└── .claude/
    ├── ⌨️ commands/   /review /board /test
    ├── ⚡ skills/     fire unprompted
    ├── 🎩 agents/     ceo cfo cpo cto
    └── 🔒 settings.json`}</code>
          </pre>
          <p className="specimen__note">
            Runbooks ship with <span className="token">«PLACEHOLDERS»</span> instead of invented
            facts, so an unfilled doc is visibly unfilled. <code>/ai-init</code> asks once and
            remembers.
          </p>
        </aside>
      </section>

      <section className="stats" aria-label="At a glance">
        <div>
          <strong className="mono">{total}</strong>
          <span>files</span>
        </div>
        <div>
          <strong className="mono">8</strong>
          <span>layers</span>
        </div>
        <div>
          <strong className="mono">{Math.round(words / 1000)}k</strong>
          <span>words of policy</span>
        </div>
        <div>
          <strong className="mono">0</strong>
          <span>repos proven in</span>
        </div>
      </section>

      <section className="section" id="start">
        <header className="section__head">
          <h2 className="display">Start here</h2>
          <p>Three doors, by what you came for.</p>
        </header>
        <ul className="doors">
          {doors.map(
            (door) =>
              door.doc && (
                <li key={door.key}>
                <Link
                  href={`/${door.doc.layer}/${door.doc.slug}/`}
                  className="door"
                  data-layer={door.doc.layer}
                  style={layerStyle(LAYERS.find((l) => l.id === door.doc!.layer))}
                >
                  <span className="door__icon">
                    <DoorIcon name={door.icon} />
                  </span>
                  <h3>{door.title}</h3>
                  <p>{door.body}</p>
                  <span className="door__doc mono">{door.doc.name} →</span>
                </Link>
                </li>
              ),
          )}
        </ul>
      </section>

      <section className="section" id="topics">
        <header className="section__head">
          <h2 className="display">What are you trying to do?</h2>
          <p>
            The layers below say what each file <em>is</em>. These say what it is <em>for</em> —
            and doing any one of these jobs pulls a playbook, its runbooks and a skill or two out
            of four different layers at once.
          </p>
        </header>
        <ul className="topics topics--compact">
          {TOPICS.map((topic) => {
            const lead = docsForTopic(topic.id).find((d) => d.layer === 'managers');
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
                  <h3 className="topic__title display">{topic.label}</h3>
                  <p className="topic__foot mono">
                    <span>{topics[topic.id]} files</span>
                    {lead ? (
                      <span className="topic__lead">
                        <LayerIcon layer="managers" /> {lead.name}
                      </span>
                    ) : null}
                  </p>
                </Link>
                <FavoriteButton
                  item={{ key: favoriteKey('topics', topic.id), name: topic.label }}
                  label={false}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section" id="layers">
        <header className="section__head">
          <h2 className="display">What&rsquo;s inside</h2>
          <p>
            Eight layers. Only one of them <em>runs</em>; only one of them fires without being
            asked.
          </p>
        </header>
        <Ledger>
          {LAYERS.filter((l) => l.id !== 'guides').map((layer, i) => (
            <Entry
              key={layer.id}
              href={`#contents-${layer.id}`}
              name={`${layer.label.toLowerCase()}/`}
              description={layer.tagline}
              meta={[`${counts[layer.id]} files`, `→ ${layer.target}`, `you ${layer.verb} them`]}
              tone={layer.id}
              accent={layer}
              icon={<LayerIcon layer={layer.id} />}
              index={i}
            />
          ))}
        </Ledger>
      </section>

      <section className="section" id="contents">
        <header className="section__head">
          <h2 className="display">Contents</h2>
          <p>
            Every file in the library, by layer — the same descriptions{' '}
            <code>CATALOG.md</code> carries.
          </p>
        </header>
        {LAYERS.filter((l) => l.id !== 'guides').map((layer) => (
          <section
            key={layer.id}
            id={`contents-${layer.id}`}
            aria-labelledby={`contents-${layer.id}-heading`}
            data-layer={layer.id}
            style={layerStyle(layer)}
          >
            <h3 className="ledger__group" id={`contents-${layer.id}-heading`}>
              <LayerIcon layer={layer.id} />
              <Link href={`/${layer.id}/`}>{layer.label}</Link>
              <span className="ledger__group-note">{layer.tagline}</span>
              <span className="ledger__count mono">{counts[layer.id]}</span>
            </h3>
            <Ledger>
              {docsForLayer(layer.id).map((doc) => (
                <DocEntry key={doc.slug} doc={doc} />
              ))}
            </Ledger>
          </section>
        ))}
      </section>

      <section className="section" id="status">
        <div className="panel">
          <div>
            <p className="eyebrow">Status</p>
            <h2 className="display panel__title">
              Maintained, and not yet proven anywhere.
            </h2>
            <p>
              Two repos adopted these docs by hand and then disowned them. It is policy in prose,
              not enforcement in CI. The content is good; the adoption is unproven — weigh
              accordingly.
            </p>
          </div>
          <ul className="panel__list mono">
            <li>Never deployed end to end. You&rsquo;d be first.</li>
            <li>41 unregistered tokens — <code>/ai-init</code> can&rsquo;t prompt for them.</li>
            <li>No sync. Re-running deploy overwrites; your copy drifts.</li>
            <li>A dozen unexercised docs describing a process nobody has run.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
