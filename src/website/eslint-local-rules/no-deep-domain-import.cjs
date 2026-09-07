/**
 * `no-deep-domain-import` — RUNBOOK_DOMAIN_ARCHITECTURE §7.
 *
 * `pnpm arch:check --strict` is the gate, but it runs in CI: the developer sees
 * the error after `git push`. This rule says the same thing in the editor, on
 * the line, as the import is typed. The audit catches the DAG; the lint rule
 * catches the syntax. You need both.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'A domain may only be imported through its barrel or its /server surface.' },
    schema: [],
    messages: {
      deep: "Deep import into another domain: '{{source}}'. Import from '@/domains/{{domain}}' (the barrel) instead.",
      clientServer:
        "A 'use client' module may not import '{{source}}' — the /server surface reaches the browser bundle with it.",
    },
  },
  create(ctx) {
    const filename = ctx.filename ?? ctx.getFilename();
    const thisDomain = filename.match(/domains\/([^/]+)/)?.[1];
    // Read the directive off the program rather than the text, so a 'use client'
    // inside a comment or a string does not count.
    const body = ctx.sourceCode?.ast?.body ?? [];
    const isClient = body.some(
      (node) =>
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'Literal' &&
        node.expression.value === 'use client',
    );

    const check = (node, source) => {
      const match = /^@\/domains\/([^/]+)(?:\/(.+))?$/.exec(source);
      if (!match) return;
      const [, domain, subPath] = match;
      if (subPath === 'server' && isClient) {
        ctx.report({ node, messageId: 'clientServer', data: { source } });
        return;
      }
      if (domain === thisDomain) return;
      if (subPath && subPath !== 'server') {
        ctx.report({ node, messageId: 'deep', data: { source, domain } });
      }
    };

    return {
      ImportDeclaration: (node) => check(node, node.source.value),
      ExportNamedDeclaration: (node) => node.source && check(node, node.source.value),
      ExportAllDeclaration: (node) => node.source && check(node, node.source.value),
      ImportExpression: (node) =>
        node.source.type === 'Literal' && check(node, node.source.value),
    };
  },
};
