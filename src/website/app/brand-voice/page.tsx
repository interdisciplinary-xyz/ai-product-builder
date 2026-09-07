import type { Metadata } from 'next';
import { Link, PageHead } from '@/domains/ui';
import { LAYERS, LayerIcon } from '@/domains/content';
import { allDocs, libraryVersion, layerCounts } from '@/domains/content/server';
import { TOPICS } from '@/domains/topics';
import { tokenStats } from '@/domains/tokens/server';

export const metadata: Metadata = {
  title: 'Brand voice',
  description:
    'How this site writes: the six rules, the vocabulary, the typographic conventions, and the sentences it refuses to write.',
};

/**
 * Every "written" example on this page is copy that actually ships, and links
 * to where it ships. Every "not written" example is invented — a style guide
 * that quotes its own bad copy is quoting something it should have deleted.
 */
function Pair({
  written,
  instead,
  where,
  href,
  why,
}: {
  written: string;
  instead: string;
  where: string;
  href: string;
  why: string;
}) {
  return (
    <div className="pair">
      <blockquote className="pair__good">
        <p>{written}</p>
        <footer className="mono">
          <Link href={href}>{where}</Link>
        </footer>
      </blockquote>
      <blockquote className="pair__bad">
        <p>{instead}</p>
        <footer className="mono">never shipped</footer>
      </blockquote>
      <p className="pair__why">{why}</p>
    </div>
  );
}

export default function BrandVoicePage() {
  const docs = allDocs();
  const counts = layerCounts();
  const total = docs.filter((d) => d.layer !== 'guides').length;
  const words = docs.reduce((sum, d) => sum + d.words, 0);
  const tokens = tokenStats();

  return (
    <div className="shell">
      <PageHead
        eyebrow={`v${libraryVersion()} · the voice of ${total} documents and the site that shows them`}
        title="Brand voice"
        lede={
          <>
            One sentence: <strong>state the number, name the trade-off, and stop.</strong> This is
            a library of opinionated documents written by one person who has not yet proved they
            work anywhere. The writing earns trust by being checkable, not by being confident.
          </>
        }
      />

      <nav className="jumpbar" aria-label="On this page">
        <span className="eyebrow">Sections</span>
        <ul>
          {[
            ['rules', 'The six rules'],
            ['vocabulary', 'Vocabulary'],
            ['typography', 'Conventions'],
            ['never', 'Never written'],
            ['check', 'How to check it'],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="chip">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ------------------------------------------------------------ rules */}
      <section className="section" id="rules">
        <header className="section__head">
          <h2 className="display">The six rules</h2>
          <p>Each with what shipped, and what would have been easier to write.</p>
        </header>

        <ol className="voicerules">
          <li>
            <h3>1 · A number beats an adjective, every time.</h3>
            <p className="voicerules__lede">
              If a claim can be counted, it is counted at build time. Nothing on this site is
              &ldquo;comprehensive&rdquo;, &ldquo;robust&rdquo; or &ldquo;extensive&rdquo; — it is{' '}
              {total} files and {Math.round(words / 1000)}k words, because those are numbers that
              can be wrong.
            </p>
            <Pair
              written={`${tokens.repoUnregistered} have no row in PLACEHOLDERS.md. A doc still explains them where they are used, but /ai-init cannot prompt for what the glossary does not know.`}
              instead="Comprehensive placeholder coverage across the library, with best-in-class tooling support."
              where="/tokens"
              href="/tokens/"
              why="The first sentence tells you what is broken and what it costs you. The second tells you nothing and cannot be checked."
            />
          </li>

          <li>
            <h3>2 · Say the weakness before someone finds it.</h3>
            <p className="voicerules__lede">
              The front page carries a stat reading{' '}
              <strong>
                <span className="mono">0</span> repos proven in
              </strong>
              . It is the least flattering number available and it is in the first screen, because
              a reader who discovers it later stops believing the other numbers too.
            </p>
            <Pair
              written="Maintained, and not yet proven anywhere. Two repos adopted these docs by hand and then disowned them. It is policy in prose, not enforcement in CI. The content is good; the adoption is unproven — weigh accordingly."
              instead="A battle-tested documentation system, trusted in production."
              where="the front page"
              href="/#status"
              why="Naming the gap is what makes “the content is good” worth reading. Without it, that clause is marketing."
            />
          </li>

          <li>
            <h3>3 · Address the reader as &ldquo;you&rdquo;. Never as &ldquo;users&rdquo;.</h3>
            <p className="voicerules__lede">
              Every layer states what <em>you</em> do with it — you{' '}
              {LAYERS.filter((l) => l.id !== 'guides')
                .map((l) => l.verb)
                .filter((v, i, all) => all.indexOf(v) === i)
                .join(', you ')}
              . There is one reader, doing one thing, and the copy speaks to them directly.
            </p>
            <Pair
              written="You point it at a repository and it creates, verifies or audits a document — usually the runbook of the same name."
              instead="Users can leverage managers to generate documentation artifacts across their repositories."
              where="the Managers layer"
              href="/managers/"
              why="“Users can leverage” describes a category of person. “You point it at a repository” describes an afternoon."
            />
          </li>

          <li>
            <h3>4 · Lead with the reader&rsquo;s question, not our taxonomy.</h3>
            <p className="voicerules__lede">
              The {TOPICS.length} topics are titled with the question that brings someone to them —{' '}
              <em>{TOPICS[3].question}</em> — and only then with the job.{' '}
              &ldquo;Layer&rdquo;, &ldquo;manager&rdquo; and &ldquo;runbook&rdquo; are this
              library&rsquo;s words, and nobody arrives knowing them.
            </p>
            <Pair
              written="Where is this going to leak?"
              instead="Security & compliance documentation category"
              where="the Secure it topic"
              href="/topics/secure/"
              why="One is what the reader was already thinking. The other is where we happened to file it."
            />
          </li>

          <li>
            <h3>5 · Explain the decision, not the feature.</h3>
            <p className="voicerules__lede">
              Where something works oddly, the copy says why it was built that way — and the code
              comments hold the same standard, which is itself one of the library&rsquo;s skills.
              A sentence that only restates what you can already see gets deleted.
            </p>
            <Pair
              written="A skill exists precisely because you do not know you need it — it ambushes the diff at the moment you are about to make the mistake it knows about."
              instead="Skills are automatically triggered rules that enhance your workflow."
              where="the Skills layer"
              href="/skills/"
              why="The first explains why the layer is shaped that way. The second is the same sentence any product would write about any feature."
            />
          </li>

          <li>
            <h3>6 · One idea per sentence. Cut the intensifier.</h3>
            <p className="voicerules__lede">
              No &ldquo;very&rdquo;, &ldquo;really&rdquo;, &ldquo;simply&rdquo;,
              &ldquo;just&rdquo;, &ldquo;powerful&rdquo;, &ldquo;seamless&rdquo;. An em dash is
              allowed to hold two clauses together; a third clause starts a new sentence. If a
              sentence needs a comma to survive, it was two sentences.
            </p>
            <Pair
              written="Silence is the pass condition."
              instead="The audit commands are designed to only notify you when something has actually regressed, which helps reduce noise."
              where="the Commands layer"
              href="/commands/"
              why="Five words that state the whole design. The alternative takes twenty-four and says less."
            />
          </li>
        </ol>
      </section>

      {/* ------------------------------------------------------- vocabulary */}
      <section className="section" id="vocabulary">
        <header className="section__head">
          <h2 className="display">Vocabulary</h2>
          <p>
            These words are load-bearing. Using a synonym for one of them means something different
            here.
          </p>
        </header>

        <div className="table-wrap">
          <table className="voicetable">
            <thead>
              <tr>
                <th scope="col">Word</th>
                <th scope="col">The verb</th>
                <th scope="col">What it means here</th>
                <th scope="col" className="mono">
                  n
                </th>
              </tr>
            </thead>
            <tbody>
              {LAYERS.filter((l) => l.id !== 'guides').map((layer) => (
                <tr key={layer.id} data-layer={layer.id}>
                  <th scope="row">
                    <LayerIcon layer={layer.id} /> {layer.label}
                  </th>
                  <td className="mono">you {layer.verb} them</td>
                  <td>{layer.tagline}</td>
                  <td className="mono">{counts[layer.id]}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Topic</th>
                <td className="mono">you start from one</td>
                <td>A job that cuts across every layer. What a file is for, not what it is.</td>
                <td className="mono">{TOPICS.length}</td>
              </tr>
              <tr>
                <th scope="row">
                  <span className="token">«token»</span>
                </th>
                <td className="mono">you fill it</td>
                <td>
                  A placeholder standing where a fact about your product goes. Never called a
                  variable, a field or a parameter.
                </td>
                <td className="mono">{tokens.repo}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="notes notes--tight">
          <div>
            <h3>Words with a fixed meaning</h3>
            <ul>
              <li>
                <strong>Deployed as</strong> — the name a file takes in a consuming repo. Not
                &ldquo;installed&rdquo;, not &ldquo;published&rdquo;.
              </li>
              <li>
                <strong>Produces</strong> / <strong>Produced by</strong> — the manager↔runbook
                pairing, and only that. Nothing else on the site &ldquo;produces&rdquo; anything.
              </li>
              <li>
                <strong>Fill</strong> — what you do to a runbook. You do not
                &ldquo;complete&rdquo;, &ldquo;customise&rdquo; or &ldquo;configure&rdquo; it.
              </li>
              <li>
                <strong>Fires</strong> — what a skill does, unprompted. Commands are{' '}
                <em>invoked</em>; managers are <em>run</em>; only skills fire.
              </li>
            </ul>
          </div>
          <div>
            <h3>Words we do not use</h3>
            <ul>
              <li>
                <strong>Docs</strong> as a mass noun for the library. It is a library of documents,
                each with a name.
              </li>
              <li>
                <strong>AI-powered</strong>, <strong>agentic</strong>, <strong>workflow</strong>{' '}
                — all three describe the category, none describes the thing.
              </li>
              <li>
                <strong>Best practice</strong>. Every document here is one person&rsquo;s opinion,
                and says so.
              </li>
              <li>
                <strong>We</strong>. There is no we. The library says what it does; the status
                section says who maintains it.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- typography */}
      <section className="section" id="typography">
        <header className="section__head">
          <h2 className="display">Conventions</h2>
          <p>
            The small mechanical rules, so nobody has to decide twice. These govern the words;
            the type they are set in — three sans faces and{' '}
            <Link href="/design-system/#type">21 steps</Link> — is the{' '}
            <Link href="/design-system/">design system</Link>&rsquo;s half of the same voice.
          </p>
        </header>

        <dl className="conventions">
          <div>
            <dt>
              <span className="token">«guillemets»</span>
            </dt>
            <dd>
              Wrap a token and nothing else. An example value is written unwrapped, as (e.g. 22.15.1).
              A single regex <code>«[^»]+»</code> should cleanly enumerate every fill slot in a file.
            </dd>
          </div>
          <div>
            <dt>Em dash</dt>
            <dd>
              Spaced, and used to hold a qualification onto a claim — like this. Never a colon
              where a dash reads better, never two in one sentence.
            </dd>
          </div>
          <div>
            <dt>Sentence case</dt>
            <dd>
              Headings, buttons and labels. Title Case appears nowhere. Filenames keep their own
              casing, because that is what they are called on disk.
            </dd>
          </div>
          <div>
            <dt>Numbers</dt>
            <dd>
              Digits for anything countable, including under ten — <span className="mono">8</span>{' '}
              layers, <span className="mono">{total}</span> files. Words only where the number is
              rhetorical (&ldquo;the same forty decisions&rdquo;).
            </dd>
          </div>
          <div>
            <dt>Emoji</dt>
            <dd>
              None, anywhere on the site. The library&rsquo;s own markdown uses one per layer; the
              site draws monoline icons instead, because emoji render differently on every platform
              and an emoji in a heading silently breaks every anchor link to it.
            </dd>
          </div>
          <div>
            <dt>Filenames</dt>
            <dd>
              Always mono, always the name as it appears on disk —{' '}
              <code>RUNBOOK_SECURITY_MODEL.md</code>, never &ldquo;the security model doc&rdquo;.
              Where the site can link one, it does, automatically.
            </dd>
          </div>
        </dl>
      </section>

      {/* ------------------------------------------------------------ never */}
      <section className="section" id="never">
        <header className="section__head">
          <h2 className="display">Never written</h2>
          <p>Sentences that would be true of any product, and therefore say nothing.</p>
        </header>
        <ul className="nevers">
          {[
            'Supercharge your workflow.',
            'Everything you need to ship faster.',
            'Simply run the command and you’re done.',
            'Built by developers, for developers.',
            'The only documentation system you’ll ever need.',
            'Trusted by teams everywhere.',
            'Get started in seconds!',
            'Best-in-class, production-ready, enterprise-grade.',
          ].map((line) => (
            <li key={line}>
              <span aria-hidden="true">✕</span> {line}
            </li>
          ))}
        </ul>
        <p className="nevers__why">
          The test: could a competitor put the same sentence on their page without changing a word?
          If yes, it is not a sentence about this library. The one claim that passes — the same
          forty decisions, written once — is on the front page because nobody else is making it.
        </p>
      </section>

      {/* ------------------------------------------------------------ check */}
      <section className="section" id="check">
        <div className="panel">
          <div>
            <p className="eyebrow">How to check it</p>
            <h2 className="display panel__title">Read it out loud to someone evaluating you.</h2>
            <p>
              Every sentence has to survive a reader who has not decided to trust this yet, and who
              will check the first number they can. That is why the counts are derived, the
              weaknesses are stated first, and the copy names the trade-off rather than the
              benefit.
            </p>
          </div>
          <ul className="panel__list mono">
            <li>Can this number be wrong? Then derive it, do not type it.</li>
            <li>Could a competitor write this sentence? Then cut it.</li>
            <li>Does it say what you do, or what a category does?</li>
            <li>Is the worst fact above the fold, or below it?</li>
          </ul>
        </div>
      </section>

      <p className="sourcenote">
        Five of these six rules have a visual form, and the{' '}
        <Link href="/design-system/#rules">design system</Link> names which one each of its ground
        rules descends from — a shadow is the visual &ldquo;very&rdquo;, an unflattering number
        gets the same weight as a flattering one, and every design token carries the reason it
        exists. One voice, set twice.
      </p>
    </div>
  );
}
