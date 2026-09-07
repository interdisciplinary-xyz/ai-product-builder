import type { Root, RootContent } from 'mdast';
import { defaultSchema } from 'rehype-sanitize';

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
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'id'],
  },
};
