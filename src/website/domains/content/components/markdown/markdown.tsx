import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { Link } from '@/domains/ui';
import {
  remarkTokens,
  remarkSectionLabels,
  remarkLinkedCode,
  textOf,
  decodeHref,
  resolveHref,
  TOKEN_HREF,
  SANITIZE_SCHEMA,
} from './markdown.constants';

export function Markdown({
  content,
  links,
  self,
}: {
  content: string;
  links: Record<string, string>;
  /** Route of the document being rendered, so it doesn't link to itself. */
  self?: string;
}) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkSectionLabels, remarkLinkedCode, remarkTokens]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, SANITIZE_SCHEMA], rehypeSlug]}
        components={{
          a({ href, children, node: _node, ...props }) {
            if (!href) return <span {...props}>{children}</span>;
            if (/^https?:/.test(href)) {
              return (
                <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
                  {children}
                </a>
              );
            }
            const resolved = resolveHref(href, links);
            if (!resolved) {
              const target = decodeHref(href);
              // Most unresolved links are «PLACEHOLDER» URLs — a link you fill
              // when you adopt the doc, not a broken one. The rest point at
              // files that only exist once the library is deployed somewhere.
              return TOKEN_HREF.test(target) ? (
                <span className="token" title={`${target} — fill this link when you adopt the doc`}>
                  {children}
                </span>
              ) : (
                <span className="link-dead" title={`${target} — not a file in this library`}>
                  {children}
                </span>
              );
            }
            return resolved.startsWith('#') ? (
              <a href={resolved} {...props}>
                {children}
              </a>
            ) : (
              <Link href={resolved} {...props}>
                {children}
              </Link>
            );
          },
          // The library names its own files in inline code — "Pairs with:
          // `RUNBOOK_SECURITY_MODEL.md`" — and never as a markdown link (0 of
          // 25 managers do). Rendered literally that is an inert pill, which
          // hides the single most central relationship in the library. So a
          // code span that names a file we have becomes a link to it.
          code({ children, className, node: _node, ...props }) {
            // Set by remarkLinkedCode on any code span already inside a link.
            // Read off the spread rather than destructured, because the JSX
            // prop types do not carry arbitrary data-* attributes — then
            // removed, because it is a marker for this branch and not
            // something the reader's DOM should carry 1,374 times.
            const insideLink = 'data-in-link' in props;
            delete (props as Record<string, unknown>)['data-in-link'];
            const text = String(children);
            const isBlock = text.includes('\n') || /^language-/.test(className ?? '');
            // Already inside an anchor: linking again would nest one <a> in
            // another, which is invalid HTML and a hydration error on the page.
            if (!isBlock && !insideLink) {
              const route = links[text.trim().toLowerCase()];
              if (route && route !== self) {
                return (
                  <Link href={route} className="code-link">
                    <code {...props}>{children}</code>
                  </Link>
                );
              }
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Almost every document opens with a "Reuse & local setup" block —
          // a median of 235 words of adoption boilerplate standing between the
          // reader and the document itself. It matters when you adopt the doc
          // and not at all when you are reading it, so it starts folded.
          blockquote({ children, node, ...props }) {
            const text = textOf(node).slice(0, 80);
            if (text.includes('Reuse & local setup')) {
              return (
                <details className="aside">
                  <summary>
                    <span className="aside__label">Reuse &amp; local setup</span>
                    <span className="aside__hint mono">placeholders, install target, boundaries</span>
                  </summary>
                  <div className="aside__body">{children}</div>
                </details>
              );
            }
            return <blockquote {...props}>{children}</blockquote>;
          },
          table({ children, node: _node, ...props }) {
            return (
              <div className="table-wrap">
                <table {...props}>{children}</table>
              </div>
            );
          },
          h2({ children, id, node: _node, ...props }) {
            return (
              <h2 id={id} {...props}>
                {children}
                {id ? (
                  <a className="anchor mono" href={`#${id}`} aria-label="Link to this section">
                    §
                  </a>
                ) : null}
              </h2>
            );
          },
          h3({ children, id, node: _node, ...props }) {
            return (
              <h3 id={id} {...props}>
                {children}
                {id ? (
                  <a className="anchor mono" href={`#${id}`} aria-label="Link to this section">
                    §
                  </a>
                ) : null}
              </h3>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
