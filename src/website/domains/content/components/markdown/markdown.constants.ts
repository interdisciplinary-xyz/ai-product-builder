import type { Root, RootContent } from 'mdast';
import { defaultSchema } from 'rehype-sanitize';
import { SECTION_LABEL } from '../../constants';

/* ---------------------------------------------------------------------------
   remark plugin: «PLACEHOLDER» tokens
   The library's whole convention is that an unfilled document looks unfilled.
   Marking the tokens visually is the single highest-value thing this site can
   add to the raw markdown, so it gets a plugin rather than a stylesheet hack.
   ------------------------------------------------------------------------- */

const TOKEN = /«[^»\n]{1,80}»/g;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);
}

export function remarkTokens() {
  return (tree: Root) => {
    const walk = (node: RootContent | Root) => {
      if (!('children' in node) || !node.children) return;
      // Code and inline code keep their literal «» — they are examples, not fills.
      const next: RootContent[] = [];
      for (const child of node.children as RootContent[]) {
        if (child.type === 'text' && TOKEN.test(child.value)) {
          TOKEN.lastIndex = 0;
          let last = 0;
          let match: RegExpExecArray | null;
          while ((match = TOKEN.exec(child.value))) {
            if (match.index > last) {
              next.push({ type: 'text', value: child.value.slice(last, match.index) });
            }
            next.push({
              type: 'html',
              value: `<span class="token">${escapeHtml(match[0])}</span>`,
            });
            last = match.index + match[0].length;
          }
          if (last < child.value.length) {
            next.push({ type: 'text', value: child.value.slice(last) });
          }
        } else {
          if (child.type !== 'code' && child.type !== 'inlineCode') walk(child);
          next.push(child);
        }
      }
      (node as Root).children = next;
    };
    walk(tree);
  };
}

/**
 * A MANAGER marks its sections with a bare uppercase line — `INITIALIZATION`,
 * `WCAG TARGET & SCOPE` — rather than with `##`. That is the library's house
 * style and worth keeping; the cost was that all 25 managers parsed to zero
 * headings, so they had no contents rail, no reading position, and no section
 * rows in the search palette. They are the longest documents here, which made
 * them exactly the ones that needed it.
 *
 * This promotes such a paragraph to a depth-2 heading, after which rehype-slug
 * gives it an id like any other. 247 blocks across the corpus match, all of
 * them in managers, and none of them longer than six words.
 *
 * The rule is deliberately narrow: a paragraph at the ROOT of the document
 * whose single child is a text node that is entirely uppercase. Anything
 * nested — a list item, a table cell, a blockquote — is left alone, and a
 * paragraph with two children (a token span, a link, emphasis) is not a
 * section label. `corpus.ts` mirrors this rule line by line to build the
 * contents; the two must agree or the rail links to anchors that do not exist.
 */
export function remarkSectionLabels() {
  return (tree: Root) => {
    tree.children = tree.children.map((node) => {
      if (node.type !== 'paragraph' || node.children.length !== 1) return node;
      const [only] = node.children;
      if (only.type !== 'text' || !SECTION_LABEL.test(only.value.trim())) return node;
      return { type: 'heading', depth: 2, children: [{ type: 'text', value: only.value.trim() }] };
    });
  };
}

/** Flattens a hast node to its text, to identify a block by what it says. */
export function textOf(node: unknown): string {
  const n = node as { value?: string; children?: unknown[] } | undefined;
  if (!n) return '';
  if (typeof n.value === 'string') return n.value;
  return (n.children ?? []).map(textOf).join('');
}

/* ------------------------------------------------------------ link rewriting */

export const TOKEN_HREF = /«[^»]*»/;

export function decodeHref(href: string): string {
  try {
    return decodeURI(href);
  } catch {
    return href;
  }
}

/** `./QUALITY_ASSURANCE.md#gate` → `/runbooks/quality-assurance/#gate`, by basename. */
export function resolveHref(href: string, map: Record<string, string>): string | null {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [target, hash] = href.split('#');
  if (!target) return href;
  const base = target.split('/').pop()?.toLowerCase();
  if (!base) return null;
  const route = map[base];
  return route ? `${route}${hash ? `#${hash}` : ''}` : null;
}

/* --------------------------------------------------------------- sanitize */

/**
 * `rehypeRaw` turns raw HTML in a document into real elements. The corpus is
 * repo-controlled and contains nothing script-capable today — verified — but
 * "the content is ours" is a claim about the past. One merged doc carrying
 * `<img src=x onerror=…>` would become XSS on every reader's browser, and
 * nothing in the pipeline would have objected.
 *
 * So sanitize after raw and before slug: slug has to see the final headings.
 * The schema is rehype's default plus the one element this site injects
 * itself — the «PLACEHOLDER» marker from remarkTokens — and the `id` that
 * rehype-slug adds to headings.
 */
export const SANITIZE_SCHEMA = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), ['className', 'token'], 'title'],
    // `remarkLinkedCode` marks a code span that is already inside a link, and
    // the sanitizer runs between that plugin and the renderer — an attribute
    // it does not know about is dropped without a word, which is exactly how
    // the first version of this failed silently.
    code: [...(defaultSchema.attributes?.code ?? []), 'dataInLink'],
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'id'],
  },
};

/**
 * Marks every code span that already sits inside a link.
 *
 * The `code` renderer turns a code span naming a library file into a link,
 * which is right for "Pairs with: `RELEASE_MANAGER.md`" and wrong the moment
 * the document already wrote it as one: ``[`RELEASE_MANAGER.md`](./FILE.md)``
 * produced `<a><a>`. Nested anchors are invalid HTML and React reports them as
 * a hydration error — 635 of them across the built site.
 *
 * Done on the mdast tree rather than with a React context, because `Markdown`
 * renders inside server components and `createContext` is client-only. The
 * ancestor relationship is a fact about the tree anyway, so this is the more
 * honest place to read it.
 */
export function remarkLinkedCode() {
  return (tree: Root) => {
    const mark = (node: RootContent) => {
      if (node.type === 'inlineCode') {
        const data = (node.data ??= {});
        data.hProperties = { ...(data.hProperties ?? {}), 'data-in-link': '' };
      }
      if ('children' in node && node.children) (node.children as RootContent[]).forEach(mark);
    };
    const walk = (node: Root | RootContent) => {
      if (!('children' in node) || !node.children) return;
      for (const child of node.children as RootContent[]) {
        if (child.type === 'link' || child.type === 'linkReference') child.children.forEach(mark);
        else walk(child);
      }
    };
    walk(tree);
  };
}
