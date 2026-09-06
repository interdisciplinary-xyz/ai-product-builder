import type { Metadata } from 'next';
import { Link } from '@/components/link';
import { PageHead, Ledger, Entry, layerStyle } from '@/components/ui';
import { LayerIcon, DoorIcon } from '@/components/icons';
import { LAYERS, layerCounts } from '@/lib/content';
import { TOPICS, topicCounts } from '@/lib/topics';
import { tokenGroups, isColour, stylesheetFacts } from '@/lib/design';

export const metadata: Metadata = {
  title: 'Design system',
  description:
    'The tokens, type scale and components this site is built from — read out of globals.css at build time, so the swatches cannot drift from the stylesheet.',
};

/** One specimen: what it is called, the live thing, and the class to reach it. */
function Spec({
  name,
  note,
  children,
}: {
  name: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="spec">
      <div className="spec__meta">
        <code className="mono spec__name">{name}</code>
        {note ? <p className="spec__note">{note}</p> : null}
      </div>
      <div className="spec__demo">{children}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  const groups = tokenGroups();
  const facts = stylesheetFacts();
  const layerTotals = layerCounts();
  const topicTotals = topicCounts();
  const wide = facts.breakpoints.filter((b) => b.kind === 'min');
  const narrow = facts.breakpoints.filter((b) => b.kind === 'max');

  return (
    <div className="shell">
      <PageHead
        eyebrow={`${facts.properties} custom properties · ${facts.classes} classes · one stylesheet`}
        title="Design system"
        lede={
          <>
            An archive, not a dashboard. Everything below is read out of{' '}
            <code>app/globals.css</code> when the site builds, so a swatch here cannot disagree
            with the stylesheet it documents — the same rule the library applies to itself.
          </>
        }
      />

      <nav className="jumpbar" aria-label="On this page">
        <span className="eyebrow">Sections</span>
        <ul>
          {[
            ['rules', 'Ground rules'],
            ['colour', 'Colour'],
            ['hues', 'Layer & topic hues'],
            ['type', 'Typography'],
            ['layout', 'Layout'],
            ['components', 'Components'],
            ['icons', 'Icons'],
            ['motion', 'Motion & access'],
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
          <h2 className="display">Ground rules</h2>
          <p>Six decisions the rest of the system follows from.</p>
        </header>
        <ol className="rules">
          {[
            {
              rule: 'A card catalogue, not a dashboard.',
              why: 'The content is 205,000 words of policy. The interface’s job is to get out of the way of reading, so: a white ground, ink type, hairline rules, and no panel, card shadow or coloured banner that is not carrying information.',
            },
            {
              rule: 'Hairlines divide; nothing else does.',
              why: 'One border colour separates rows and sections. Elevation runs downward from a white page — a raised surface is a shade off the ground, never a shadow floating above it.',
            },
            {
              rule: 'Mono is for anything a machine would read.',
              why: 'Filenames, paths, tokens, counts, keyboard hints, slugs. Prose is set in a serif. If you cannot tell which one a string is, it belongs in mono.',
            },
            {
              rule: 'One accent, plus a hue per layer and per topic.',
              why: 'Vermilion carries interaction and emphasis. Everything else takes its colour from the layer or topic it belongs to, set as --layer-light / --layer-dark on an element marked data-layer or data-topic.',
            },
            {
              rule: 'The frame is full width; the measure is not.',
              why: 'The shell runs edge to edge and only the reading column is capped, at 68ch. A rail or a ledger may use the width; a paragraph never does.',
            },
            {
              rule: 'State the number, not the adjective.',
              why: 'Every count on this site is derived at build time — files, words, tokens, broken links. A design that has to be told its own numbers will be told the wrong ones.',
            },
          ].map((item, i) => (
            <li key={i}>
              <h3>{item.rule}</h3>
              <p>{item.why}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ----------------------------------------------------------- colour */}
      <section className="section" id="colour">
        <header className="section__head">
          <h2 className="display">Colour</h2>
          <p>
            Both schemes ship. The dark column is the literal value from the{' '}
            <code>prefers-color-scheme</code> block, painted here whatever scheme you are reading
            in.
          </p>
        </header>

        {groups.map((group) => (
          <section key={group.id} className="tokengroup" aria-labelledby={`tokens-${group.id}`}>
            <h3 className="ledger__group" id={`tokens-${group.id}`}>
              <span>{group.label}</span>
              <span className="ledger__group-note">{group.blurb}</span>
              <span className="ledger__count mono">{group.tokens.length}</span>
            </h3>
            <dl className="swatches">
              {group.tokens.map((token) => (
                <div className="swatch" key={token.name}>
                  <dt>
                    <code className="mono">{token.name}</code>
                  </dt>
                  <dd>
                    {isColour(token.light) ? (
                      <span className="swatch__chips" aria-hidden="true">
                        <span className="swatch__chip" style={{ background: token.light }} />
                        <span
                          className="swatch__chip swatch__chip--dark"
                          style={{ background: token.dark ?? token.light }}
                        />
                      </span>
                    ) : null}
                    <span className="swatch__values mono">
                      <span>{token.light}</span>
                      {token.dark ? <span className="swatch__dark">{token.dark}</span> : null}
                    </span>
                    {token.note ? <span className="swatch__note">{token.note}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </section>

      {/* ------------------------------------------------------------- hues */}
      <section className="section" id="hues">
        <header className="section__head">
          <h2 className="display">Layer &amp; topic hues</h2>
          <p>
            Nineteen hues, each owned by one layer or one topic. They are set inline and resolved
            in one place; an element that sets the pair without <code>data-layer</code> or{' '}
            <code>data-topic</code> falls back to the house accent.
          </p>
        </header>

        <div className="hues">
          <div>
            <p className="eyebrow">Eight layers — what a file is</p>
            <ul className="huelist">
              {LAYERS.filter((l) => l.id !== 'guides').map((layer) => (
                <li key={layer.id} data-layer={layer.id} style={layerStyle(layer)}>
                  <Link href={`/${layer.id}/`}>
                    <span className="huelist__dot" aria-hidden="true" />
                    <LayerIcon layer={layer.id} />
                    <span className="huelist__name">{layer.label}</span>
                    <span className="huelist__hex mono">{layer.accent}</span>
                    <span className="huelist__hex mono huelist__hex--dark">{layer.accentDark}</span>
                    <span className="huelist__count mono">{layerTotals[layer.id]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Eleven topics — what a file is for</p>
            <ul className="huelist">
              {TOPICS.map((topic) => (
                <li
                  key={topic.id}
                  data-topic={topic.id}
                  style={{
                    ['--layer-light' as string]: topic.accent,
                    ['--layer-dark' as string]: topic.accentDark,
                  }}
                >
                  <Link href={`/topics/${topic.id}/`}>
                    <span className="huelist__dot" aria-hidden="true" />
                    <span className="huelist__name">{topic.label}</span>
                    <span className="huelist__hex mono">{topic.accent}</span>
                    <span className="huelist__hex mono huelist__hex--dark">{topic.accentDark}</span>
                    <span className="huelist__count mono">{topicTotals[topic.id]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- typography */}
      <section className="section" id="type">
        <header className="section__head">
          <h2 className="display">Typography</h2>
          <p>Three families, each with one job. Nothing is bold that could be a different family.</p>
        </header>

        <div className="typespec">
          <div className="typespec__row">
            <div className="typespec__meta">
              <p className="eyebrow">Display</p>
              <p className="mono">Instrument Serif · 400</p>
              <p className="typespec__note">
                Page and section titles only. <code>clamp(2.4rem, 5.6vw, 4.15rem)</code> in the
                hero, <code>clamp(1.75rem, 3.5vw, 2.5rem)</code> for a section.
              </p>
            </div>
            <p className="display typespec__sample">Every repo re-litigates the same forty decisions.</p>
          </div>

          <div className="typespec__row">
            <div className="typespec__meta">
              <p className="eyebrow">Body</p>
              <p className="mono">Newsreader · 1.0625rem / 1.65</p>
              <p className="typespec__note">
                Every sentence on the site. Capped at <code>68ch</code>; ledes run to{' '}
                <code>56ch</code> at <code>1.15rem</code>.
              </p>
            </div>
            <p className="typespec__sample typespec__sample--body">
              A manager is executable prose. You point it at a repository and it creates, verifies
              or audits a document — usually the runbook of the same name. It is the only layer
              that produces another layer.
            </p>
          </div>

          <div className="typespec__row">
            <div className="typespec__meta">
              <p className="eyebrow">Mono</p>
              <p className="mono">JetBrains Mono</p>
              <p className="typespec__note">
                Anything a machine would read, plus the <span className="eyebrow">eyebrow</span>{' '}
                style: <code>0.6875rem</code>, <code>0.16em</code> tracking, uppercase.
              </p>
            </div>
            <p className="typespec__sample mono typespec__sample--mono">
              src/runbooks/RUNBOOK_SECURITY_MODEL.md → docs/SECURITY_MODEL.md · 2,598 words
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- layout */}
      <section className="section" id="layout">
        <header className="section__head">
          <h2 className="display">Layout</h2>
          <p>
            {facts.breakpoints.length} breakpoints, all of them in <code>rem</code> so they move
            with the reader&rsquo;s text size.
          </p>
        </header>
        <div className="breakpoints">
          <div>
            <p className="eyebrow">Widens at</p>
            <ul className="mono">
              {wide.map((b) => (
                <li key={`min-${b.rem}`}>
                  min-width: {b.rem}rem
                  <span>
                    {b.rem === 62 ? 'the document rail appears' : ''}
                    {b.rem === 90 ? 'the sibling rail becomes a sticky column' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Narrows at</p>
            <ul className="mono">
              {narrow.map((b) => (
                <li key={`max-${b.rem}`}>
                  max-width: {b.rem}rem
                  <span>
                    {b.rem === 62 ? 'contents rail moves above the prose' : ''}
                    {b.rem === 40 ? '«tokens» wrap instead of overflowing' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- components */}
      <section className="section" id="components">
        <header className="section__head">
          <h2 className="display">Components</h2>
          <p>
            Live, not pictured — every specimen below is the real markup with the real class, so it
            breaks here first.
          </p>
        </header>

        <Spec name=".button / .button--ghost" note="One primary per view. Ghost for the alternative.">
          <span className="specrow">
            <Link href="/topics/" className="button">
              Start with what you&rsquo;re doing
            </Link>
            <Link href="/browse/" className="button button--ghost">
              Browse all files
            </Link>
          </span>
        </Spec>

        <Spec name=".chip" note="A link to a filtered or grouped view. Takes the hue of what it points at.">
          <span className="specrow">
            {TOPICS.slice(0, 4).map((topic) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.id}/`}
                className="chip"
                data-topic={topic.id}
                style={{
                  ['--layer-light' as string]: topic.accent,
                  ['--layer-dark' as string]: topic.accentDark,
                }}
              >
                {topic.label}
              </Link>
            ))}
          </span>
        </Spec>

        <Spec name=".pill" note="A filter that toggles in place. aria-pressed carries the state, not a colour alone.">
          <span className="specrow">
            <button type="button" className="pill" aria-pressed="true">
              All <span className="mono">129</span>
            </button>
            <button type="button" className="pill" aria-pressed="false">
              Shared <span className="mono">173</span>
            </button>
          </span>
        </Spec>

        <Spec
          name=".token"
          note="The library's signature. A placeholder you are meant to replace, marked wherever it appears so an unfilled document looks unfilled."
        >
          <span className="specrow">
            <span className="token">«PROJECT»</span>
            <span className="token">«QUALITY_CMD:lint»</span>
            <span className="token">«what goes here»</span>
          </span>
        </Spec>

        <Spec name=".entry (in .ledger)" note="One card-catalogue row. Nearly every index on the site is a list of these.">
          <Ledger>
            <Entry
              href="/runbooks/release-manager/"
              name="RELEASE_MANAGER"
              description="Branch flow from implementation to production, plus the CI cost-control policy."
              meta={['→ RELEASE_MANAGER.md', '11 min read']}
              layerId="runbooks"
            />
            <Entry
              href="/skills/tests-that-cannot-fail/"
              name="TESTS_THAT_CANNOT_FAIL"
              description="A guard never observed failing against the pre-fix code asserts nothing."
              meta={['→ tests-that-cannot-fail/']}
              layerId="skills"
            />
          </Ledger>
        </Spec>

        <Spec name=".ledger__group" note="The heading over a run of rows: name, the one line that frames it, the count.">
          <h3 className="ledger__group">
            <LayerIcon layer="runbooks" />
            <span>Runbooks</span>
            <span className="ledger__group-note">Documents you fill.</span>
            <span className="ledger__count mono">74</span>
          </h3>
        </Spec>

        <Spec name=".topic" note="A job, not a file type. Question first, because that is what the reader arrives with.">
          <ul className="topics topics--compact spec__topics">
            {TOPICS.slice(3, 5).map((topic) => (
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
                  <h4 className="topic__title display">{topic.label}</h4>
                  <p className="topic__foot mono">
                    <span>{topicTotals[topic.id]} files</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Spec>

        <Spec name=".door" note="Used once, on the front page. Three doors by what the reader came for.">
          <ul className="doors spec__doors">
            <li>
              <Link
                href="/runbooks/release-manager/"
                className="door"
                data-layer="runbooks"
                style={layerStyle(LAYERS.find((l) => l.id === 'runbooks'))}
              >
                <span className="door__icon">
                  <DoorIcon name="evaluate" />
                </span>
                <h4>Evaluating?</h4>
                <p>Read the most opinionated document here.</p>
                <span className="door__doc mono">RELEASE_MANAGER →</span>
              </Link>
            </li>
          </ul>
        </Spec>

        <Spec name=".search" note="A filter scoped to the page it sits on. Site-wide search is the palette, on ⌘K.">
          <div className="search spec__search">
            <span className="search__icon mono" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              placeholder="Filter these rows by name, description or deployed path…"
              aria-label="Specimen filter"
              readOnly
            />
          </div>
        </Spec>

        <Spec name=".eyebrow" note="A label above a thing. Never a sentence, never punctuation.">
          <span className="specrow">
            <span className="eyebrow">On this page</span>
            <span className="eyebrow">129 files · eight layers</span>
          </span>
        </Spec>

        <Spec name=".prose blockquote / .aside" note="The Reuse block every document opens with, folded by default. Scoped to .prose, so the specimen is wrapped in one.">
          <div className="prose">
            <details className="aside">
              <summary>
                <span className="aside__label">Reuse &amp; local setup</span>
                <span className="aside__hint mono">placeholders, install target, boundaries</span>
              </summary>
              <div className="aside__body">
                <p>
                  A median of 235 words of adoption boilerplate stands between the reader and the
                  document. It matters when you adopt the doc and not at all when you are reading
                  it.
                </p>
              </div>
            </details>
          </div>
        </Spec>
      </section>

      {/* ------------------------------------------------------------ icons */}
      <section className="section" id="icons">
        <header className="section__head">
          <h2 className="display">Icons</h2>
          <p>
            One spec: 24×24 box, 1.5 stroke, round caps, no fill, <code>currentColor</code>. The
            library&rsquo;s README uses emoji per layer; emoji render differently on every platform
            and drag full-colour cartoons into a two-ink page, so the site draws its own.
          </p>
        </header>
        <ul className="iconset">
          {LAYERS.map((layer) => (
            <li key={layer.id} data-layer={layer.id} style={layerStyle(layer)}>
              <LayerIcon layer={layer.id} />
              <span className="mono">{layer.id}</span>
            </li>
          ))}
          {(['evaluate', 'adopt', 'best'] as const).map((name) => (
            <li key={name}>
              <DoorIcon name={name} />
              <span className="mono">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------- motion */}
      <section className="section" id="motion">
        <header className="section__head">
          <h2 className="display">Motion &amp; access</h2>
          <p>Motion is confirmation, never decoration.</p>
        </header>
        <div className="notes">
          <div>
            <h3>Motion</h3>
            <p>
              One entrance — <code>.rise</code>, a 6px lift over 380ms, staggered 22ms per row and
              capped at fourteen rows so a 74-item ledger does not take two seconds to arrive.
              Interaction transitions run 130–150ms. Nothing loops, nothing bounces, nothing moves
              that the reader did not ask to move.
            </p>
            <p>
              Every one of them is switched off under{' '}
              <code>prefers-reduced-motion: reduce</code>, along with smooth scrolling.
            </p>
          </div>
          <div>
            <h3>Access</h3>
            <ul>
              <li>
                Focus is always visible: a 2px accent outline at 3px offset, never removed.
              </li>
              <li>
                Colour never carries state alone — a pressed filter sets <code>aria-pressed</code>,
                a current page sets <code>aria-current</code>.
              </li>
              <li>
                The palette is a real <code>combobox</code>/<code>listbox</code>, arrow-navigable,
                and returns focus to whatever opened it.
              </li>
              <li>
                Every page starts with a skip link, and the sticky offsets key off{' '}
                <code>--masthead-h</code> so an anchor never lands under the header.
              </li>
              <li>
                Both schemes are authored; neither is an inversion of the other.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <p className="sourcenote">
        Parsed from <code>app/globals.css</code> — {facts.lines.toLocaleString('en-US')} lines,{' '}
        {facts.classes} classes, no framework and no preprocessor. The voice these components carry
        is on the <Link href="/brand-voice/">brand voice</Link> page.
      </p>
    </div>
  );
}
