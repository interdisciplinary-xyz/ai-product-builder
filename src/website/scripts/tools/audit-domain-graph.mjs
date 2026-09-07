/**
 * The domain-boundary audit — RUNBOOK_DOMAIN_ARCHITECTURE §6.
 *
 * The DAG is data (ALLOWED, below), not prose. Add a domain, add a row; the
 * audit fails on any edge the map does not sanction, on any deep import past a
 * barrel, on any component folder that does not follow the 4-file convention,
 * and on any client component that can reach a `/server` surface.
 *
 * Two deviations from the runbook's own sketch, both deliberate:
 *
 *   - It parses with the `typescript` compiler API rather than ts-morph. The
 *     runbook's requirement is that the audit be AST-based and not a grep (§10);
 *     `typescript` is already a devDependency here, and ts-morph is 6 MB of new
 *     tree to gate a 7-domain graph.
 *   - It is .mjs rather than .ts, so `node scripts/tools/audit-domain-graph.mjs`
 *     runs with no loader, no build step and no chance of the gate itself being
 *     the thing that breaks CI.
 *
 * Usage:  node scripts/tools/audit-domain-graph.mjs [--strict]
 *         --strict exits 1 on any violation. Without it, counts only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOMAINS_DIR = path.join(ROOT, 'domains');

/* ------------------------------------------------------------------ the DAG */

/**
 * Which domains each domain may import. `ui` is the base leaf: it depends on
 * nothing, so it can be depended on by everything without ever creating a cycle.
 */
export const ALLOWED = {
  //   domain      may import:
  ui: [],
  content: ['ui'],
  topics: ['ui', 'content'],
  tokens: ['ui', 'content'],
  search: ['ui', 'content', 'favorites'],
  favorites: ['ui', 'content'],
  navigation: ['ui', 'content', 'topics', 'search', 'favorites'],
  design: ['ui'],
};

/**
 * Node-only surfaces that may reach another domain's Node-only surface. A
 * client-reachable import of a `/server` surface is always a violation (§5),
 * which is checked separately against the 'use client' directive.
 */
export const SERVER_DEPS_ALLOWED = {
  'topics/server': ['content/server'],
  'tokens/server': ['content/server'],
};

/** Deep imports past a barrel, each with a reason. Keep this under five (§9). */
export const ALLOWED_DEEP = [];

/** Cycles permanently accepted. Empty = zero-cycle policy. */
export const ACCEPTED_CYCLES = [];

/**
 * Directories outside `domains/` that compose them. They may import any barrel
 * and any `/server` surface — `app/` is the composition root, and a route file
 * in the App Router is a server component by construction. What they may NOT do
 * is reach past a barrel, which is checked for every file regardless of where
 * it lives.
 */
const COMPOSITION_ROOTS = ['app'];

/* ----------------------------------------------------------------- the walk */

const SOURCE = /\.tsx?$/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/**
 * Every module specifier this file really imports — `import`, `export … from`,
 * and dynamic `import()`. Read off the AST, so a path named in a comment or a
 * string literal is not an edge (§10).
 */
function edgesOf(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2022,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const specifiers = [];
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push({ text: node.moduleSpecifier.text, node });
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push({ text: node.arguments[0].text, node });
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(source, visit);

  // `'use client'` is the compiled bundle's client/server line, so the check
  // that a client component cannot reach a server surface reads it here.
  const isClient = source.statements.some(
    (s) =>
      ts.isExpressionStatement(s) &&
      ts.isStringLiteral(s.expression) &&
      s.expression.text === 'use client',
  );

  return { specifiers, isClient, source };
}

const rel = (file) => path.relative(ROOT, file);
const DOMAIN_IMPORT = /^@\/domains\/([^/]+)(?:\/(.+))?$/;

/* ------------------------------------------------------------ the violations */

const violations = [];
const flag = (file, node, source, message) => {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
  violations.push(`${rel(file)}:${line + 1}  ${message}`);
};

const deepAllowed = (from, to) =>
  ALLOWED_DEEP.some((e) => rel(from).startsWith(e.from.replace('/**', '')) && to.startsWith(e.to.replace('/**', '')));

function auditImports() {
  const files = [...walk(DOMAINS_DIR), ...COMPOSITION_ROOTS.flatMap((d) => walk(path.join(ROOT, d)))];

  for (const file of files) {
    const relative = rel(file);
    const inDomain = relative.startsWith('domains/') ? relative.split('/')[1] : null;
    const inServer = inDomain && relative.startsWith(`domains/${inDomain}/server/`);
    const { specifiers, isClient, source } = edgesOf(file);

    // §5 — a client component that imports node: builtins leaks the server into
    // the browser bundle just as surely as one that imports a /server barrel.
    for (const { text, node } of specifiers) {
      if (isClient && text.startsWith('node:')) {
        flag(file, node, source, `'use client' file imports ${text} — that reaches the browser bundle`);
      }

      const match = DOMAIN_IMPORT.exec(text);
      if (!match) continue;
      const [, target, subPath] = match;

      if (!(target in ALLOWED)) {
        flag(file, node, source, `imports @/domains/${target}, which has no row in the ALLOWED map`);
        continue;
      }

      // Same-domain imports are the domain's own business.
      if (target === inDomain) continue;

      if (subPath && subPath !== 'server' && !deepAllowed(file, `domains/${target}/${subPath}`)) {
        flag(file, node, source, `deep import → @/domains/${target}/${subPath}. Import the barrel, @/domains/${target}.`);
        continue;
      }

      if (subPath === 'server') {
        if (isClient) {
          flag(file, node, source, `'use client' file imports @/domains/${target}/server — bundler leak (§5)`);
          continue;
        }
        if (inServer) {
          const allowed = SERVER_DEPS_ALLOWED[`${inDomain}/server`] ?? [];
          if (!allowed.includes(`${target}/server`)) {
            flag(file, node, source, `server edge ${inDomain}/server → ${target}/server not in SERVER_DEPS_ALLOWED`);
          }
          continue;
        }
      }

      if (inDomain && !(ALLOWED[inDomain] ?? []).includes(target)) {
        flag(file, node, source, `cross-domain edge ${inDomain} → ${target} not in ALLOWED`);
      }
    }
  }
}

/**
 * §5's central rule: a client-imported barrel must stay free of server-only
 * code. If `domains/x/index.ts` re-exports anything under `./server`, every
 * client that imports the barrel gets the server surface with it.
 */
function auditBarrels() {
  // §10 — "a new domain without an ALLOWED map row" is the anti-pattern that
  // left empatalk-app's src/domains/journey/ unaudited. A domain that no one
  // imports yet is still a domain: catch it on the directory, not on the edge.
  for (const entry of fs.readdirSync(DOMAINS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!KEBAB.test(entry.name)) violations.push(`domains/${entry.name}: folder names are kebab-case`);
    if (entry.name in ALLOWED) continue;
    violations.push(`domains/${entry.name}: no row in the ALLOWED map — its edges are unaudited (§10)`);
  }

  for (const domain of Object.keys(ALLOWED)) {
    const barrel = path.join(DOMAINS_DIR, domain, 'index.ts');
    if (!fs.existsSync(barrel)) {
      violations.push(`domains/${domain}: no index.ts barrel (§3)`);
      continue;
    }
    const { specifiers, source } = edgesOf(barrel);
    for (const { text, node } of specifiers) {
      if (/^\.\/server(\/|$)/.test(text) || /\/server(\/|$)/.test(text)) {
        flag(barrel, node, source, `the client barrel re-exports '${text}' — the /server surface must stay out of it (§5)`);
      }
    }
    const serverDir = path.join(DOMAINS_DIR, domain, 'server');
    if (fs.existsSync(serverDir) && !fs.existsSync(path.join(serverDir, 'index.ts'))) {
      violations.push(`domains/${domain}/server: no index.ts barrel (§5)`);
    }

    /**
     * Every directory re-exports its children, one level at a time: component
     * folder → components/index.ts → the domain barrel. A barrel that reached
     * past `components/` into each folder would have to be edited every time a
     * component moved, which is the coupling the convention exists to remove.
     */
    const componentsDir = path.join(DOMAINS_DIR, domain, 'components');
    if (!fs.existsSync(componentsDir)) continue;

    const componentsBarrel = path.join(componentsDir, 'index.ts');
    if (!fs.existsSync(componentsBarrel)) {
      violations.push(`domains/${domain}/components: no index.ts re-exporting the folders beside it`);
      continue;
    }

    const carried = new Set(
      edgesOf(componentsBarrel).specifiers.map(({ text: t }) => t.replace(/^\.\//, '')),
    );
    for (const entry of fs.readdirSync(componentsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !carried.has(entry.name)) {
        violations.push(
          `domains/${domain}/components/index.ts: does not re-export ./${entry.name} — the component is unreachable from the barrel`,
        );
      }
    }

    const reaches = edgesOf(barrel).specifiers.map(({ text: t }) => t);
    if (!reaches.includes('./components')) {
      violations.push(`domains/${domain}/index.ts: does not re-export './components'`);
    }
    for (const spec of reaches) {
      if (spec.startsWith('./components/')) {
        violations.push(
          `domains/${domain}/index.ts: reaches past './components' into '${spec}' — re-export the child directory, not a folder inside it`,
        );
      }
    }
  }
}

/* ---------------------------------------------------- §8 component shape */

const shape = { folders: 0, withConstants: 0, withSpec: 0 };

/**
 * Every directory in the tree is kebab-case, and a component's file matches its
 * folder. The runbook's §4 writes that pair as `Button/Button.tsx`; here it is
 * `button/button.tsx`, because `app/` was already kebab (`design-system/`,
 * `search-index.json/`) and one tree with two casing rules is a tree you have
 * to guess at. Exported identifiers are still PascalCase — that is a JavaScript
 * convention, not a filesystem one.
 */
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function auditComponentShape() {
  for (const domain of Object.keys(ALLOWED)) {
    const componentsDir = path.join(DOMAINS_DIR, domain, 'components');
    if (!fs.existsSync(componentsDir)) continue;

    for (const entry of fs.readdirSync(componentsDir, { withFileTypes: true })) {
      const where = `domains/${domain}/components/${entry.name}`;
      if (entry.name === 'index.ts') continue;   // the barrel over the folders beside it
      if (!entry.isDirectory()) {
        violations.push(`${where}: a component is a folder, not a bare file (§4)`);
        continue;
      }
      if (!KEBAB.test(entry.name)) {
        violations.push(`${where}: folder names are kebab-case`);
      }
      shape.folders += 1;
      const dir = path.join(componentsDir, entry.name);
      const has = (suffix) =>
        ['.ts', '.tsx'].some((ext) => fs.existsSync(path.join(dir, `${entry.name}${suffix}${ext}`)));

      if (!fs.existsSync(path.join(dir, `${entry.name}.tsx`))) {
        violations.push(`${where}: missing ${entry.name}.tsx — the file must match the folder (§4)`);
      }
      if (!fs.existsSync(path.join(dir, 'index.ts'))) {
        violations.push(`${where}: missing index.ts — the per-component barrel (§4)`);
      }
      if (has('.constants')) shape.withConstants += 1;
      if (has('.spec')) shape.withSpec += 1;
    }
  }
}

/* ------------------------------------------------------- cycles in the DAG */

function auditCycles() {
  const accepted = new Set(ACCEPTED_CYCLES.map(([a, b]) => `${a}→${b}`));
  const state = new Map();

  const visit = (node, stack) => {
    if (state.get(node) === 'done') return;
    if (state.get(node) === 'open') {
      const cycle = [...stack.slice(stack.indexOf(node)), node];
      const edge = `${cycle[0]}→${cycle[1] ?? cycle[0]}`;
      if (!accepted.has(edge)) violations.push(`cycle in ALLOWED: ${cycle.join(' → ')}`);
      return;
    }
    state.set(node, 'open');
    for (const next of ALLOWED[node] ?? []) visit(next, [...stack, node]);
    state.set(node, 'done');
  };

  for (const domain of Object.keys(ALLOWED)) visit(domain, []);
}

/* --------------------------------------------------------------------- run */

auditImports();
auditBarrels();
auditComponentShape();
auditCycles();

const strict = process.argv.includes('--strict');
const domains = Object.keys(ALLOWED).length;
const edges = Object.values(ALLOWED).reduce((n, list) => n + list.length, 0);

if (violations.length) {
  console.error(`\n${violations.length} domain-boundary violation(s):\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error('');
}

console.log(
  `domains ${domains} · edges ${edges} · component folders ${shape.folders} ` +
    `(${shape.withConstants} with constants, ${shape.withSpec} with specs) · ` +
    `deep-import exceptions ${ALLOWED_DEEP.length} · accepted cycles ${ACCEPTED_CYCLES.length} · ` +
    `violations ${violations.length}`,
);

if (ALLOWED_DEEP.length > 5) {
  console.log('ALLOWED_DEEP is past five entries — the DAG is wrong; refactor the domains (§9).');
}

process.exit(strict && violations.length ? 1 : 0);
