import { Link } from '@/domains/ui';
import { LAYER_BY_ID, layerStyle, docHref, type Doc } from '@/domains/content';
import { groupByTopic, topicOf } from '@/domains/topics';

/**
 * A reader who has opened one runbook is, nine times out of ten, one document
 * away from the one they wanted. Until now the only way sideways was back to
 * the layer index — so this rail carries the whole layer, grouped by topic,
 * with the current document marked.
 *
 * It is a plain <nav> and not a <details>: a wide screen shows it as a sticky
 * rail, and forcing a closed <details> open in CSS is a fight with the UA
 * stylesheet that Chrome now wins (it hides the content on ::details-content,
 * which an author rule on the child cannot reach). Narrow screens get the same
 * markup capped to a short scroll box. The per-topic groups below ARE details,
 * because their open state is decided here rather than by a media query.
 */
export function DocNav({ doc, siblings }: { doc: Doc; siblings: Doc[] }) {
  const layer = LAYER_BY_ID.get(doc.layer);
  const groups = groupByTopic(siblings);
  const current = topicOf(doc);
  // Small layers have nothing to gain from topic headings — five agents under
  // four topic labels is filing for its own sake.
  const grouped = groups.length > 1 && siblings.length > 8;

  const row = (sibling: Doc) => (
    <li key={sibling.slug}>
      <Link
        href={docHref(sibling)}
        className="docnav__link"
        aria-current={sibling.slug === doc.slug ? 'page' : undefined}
      >
        {sibling.name}
      </Link>
    </li>
  );

  return (
    <nav className="docnav" aria-label={`Other ${layer?.label.toLowerCase() ?? doc.layer}`}>
      <div className="docnav__body">
        <p className="eyebrow docnav__head">
          <Link href={`/${doc.layer}/`}>All {layer?.label ?? doc.layer}</Link>
          <span className="mono">{siblings.length}</span>
        </p>

        {grouped ? (
          groups.map(({ topic, docs }) => (
            <details
              key={topic?.id ?? 'unfiled'}
              className="docnav__group"
              data-topic={topic?.id}
              open={topic ? topic.id === current?.id : true}
              style={
                topic
                  ? {
                      ['--layer-light' as string]: topic.accent,
                      ['--layer-dark' as string]: topic.accentDark,
                    }
                  : undefined
              }
            >
              <summary className="docnav__grouphead">
                <span>{topic?.label ?? 'Unfiled'}</span>
                <span className="mono">{docs.length}</span>
              </summary>
              <ul className="docnav__list">{docs.map(row)}</ul>
            </details>
          ))
        ) : (
          <ul className="docnav__list" data-layer={doc.layer} style={layerStyle(layer)}>
            {siblings.map(row)}
          </ul>
        )}
      </div>
    </nav>
  );
}
