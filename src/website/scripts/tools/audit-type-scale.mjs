/**
 * The type-scale audit — RUNBOOK_TYPOGRAPHY §6.
 *
 * A type scale that lives only in a comment is not a scale. Before this ran,
 * app/globals.css carried 46 distinct font-size values across 132 declarations
 * — 0.66, 0.68, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85 — each one a decision
 * nobody could remember making, and each one invisible in review because a
 * diff showing `font-size: 0.82rem` looks exactly as reasonable as one showing
 * `font-size: 0.8125rem`.
 *
 * So: the steps are declared once on :root, and every other declaration must
 * name one. The check is a parse of the stylesheet, not a lint rule, because
 * the thing being checked is a *set* — "is this value one of the eight" is not
 * a question about a single line.
 *
 * Usage:  node scripts/tools/audit-type-scale.mjs [--strict]
 *         --strict exits 1 on any violation. Without it, counts only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const STYLESHEET = path.join(ROOT, 'app', 'globals.css');

/**
 * Properties that must name a token, and the token prefix each one accepts.
 * `font-family` is checked separately: it names a family variable, not a step.
 */
const GOVERNED = {
  'font-size': ['--text-', '--display-'],
  'line-height': ['--leading-'],
  'letter-spacing': ['--tracking-'],
};

/**
 * Values that are legitimately not scale steps.
 *
 * `em` is the deliberate exception: inline code inside prose is sized relative
 * to the text around it, so it tracks whatever step its parent landed on. A
 * step would freeze it at one size and break that relationship — the rule is
 * "a step, or explicitly relative to the parent", never a bare rem literal.
 */
const ALLOWED_LITERAL = /^(inherit|initial|unset|revert|normal|0|1|[\d.]+em)$/;

const raw_source = fs.readFileSync(STYLESHEET, 'utf8');

/**
 * Comments out, newlines kept, so reported line numbers still point at the
 * real line. Without this the audit's first run flagged a *comment* reading
 * "line-height: inheriting the body's 1.65 made a 21px wordmark" — a check
 * that reads prose as code will eventually fail on the sentence explaining
 * why it exists.
 */
const source = raw_source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

/** The `:root` block declares the scale; everything after it must use it. */
const rootEnd = source.indexOf('\n}', source.indexOf(':root {'));
const declarations = source.slice(rootEnd);

const scale = new Map();
for (const m of source.slice(0, rootEnd).matchAll(/(--(?:text|display|leading|tracking)-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  scale.set(m[1], m[2].trim());
}

const violations = [];
const used = new Set();
const counts = { governed: 0, relative: 0 };

const lineOf = (index) => declarations.slice(0, index).split('\n').length;
// Line numbers are reported against the whole file, not the sliced tail.
const offset = source.slice(0, rootEnd).split('\n').length - 1;

for (const [property, prefixes] of Object.entries(GOVERNED)) {
  const pattern = new RegExp(`${property}:\\s*([^;\\n]+)`, 'g');
  for (const m of declarations.matchAll(pattern)) {
    const raw = m[1].trim();
    counts.governed += 1;

    const token = raw.match(/^var\((--[a-z0-9-]+)\)$/);
    if (token) {
      if (!prefixes.some((p) => token[1].startsWith(p))) {
        violations.push(
          `app/globals.css:${offset + lineOf(m.index)}  ${property}: ${raw} — not a ${prefixes.join(' / ')} token`,
        );
      } else if (!scale.has(token[1])) {
        violations.push(
          `app/globals.css:${offset + lineOf(m.index)}  ${property}: ${raw} — no such step on :root`,
        );
      } else {
        used.add(token[1]);
      }
      continue;
    }

    if (ALLOWED_LITERAL.test(raw)) {
      counts.relative += 1;
      continue;
    }

    violations.push(
      `app/globals.css:${offset + lineOf(m.index)}  ${property}: ${raw} — name a step, not a literal`,
    );
  }
}

/* --------------------------------------------------- families and weights */

/**
 * §3 — three roles, three variables. A raw family name in a rule means a
 * fourth face has appeared without anyone deciding it should.
 */
const FAMILY_VARS = ['--font-display', '--font-body', '--font-mono'];
for (const m of declarations.matchAll(/font-family:\s*([^;\n]+)/g)) {
  const raw = m[1].trim();
  if (!FAMILY_VARS.some((v) => raw.startsWith(`var(${v})`))) {
    violations.push(
      `app/globals.css:${offset + lineOf(m.index)}  font-family: ${raw} — start from one of ${FAMILY_VARS.join(', ')}`,
    );
  }
  // A serif fallback under a sans face is a different typeface on a slow
  // connection, which is the one moment a reader is most likely to notice.
  if (/(^|[\s,])serif\s*;?$/.test(raw) || /Georgia|Times New Roman/.test(raw)) {
    violations.push(
      `app/globals.css:${offset + lineOf(m.index)}  font-family: ${raw} — serif fallback under a sans stack`,
    );
  }
}

const weights = new Set(
  [...declarations.matchAll(/font-weight:\s*(\d+)/g)].map((m) => m[1]),
);

/* ------------------------------------------------------------- unused steps */

for (const step of scale.keys()) {
  if (!used.has(step) && !step.startsWith('--tracking-')) {
    violations.push(`:root ${step} is declared but nothing uses it — a scale step nobody needs is drift waiting to happen`);
  }
}

/* --------------------------------------------------------------------- run */

const strict = process.argv.includes('--strict');

if (violations.length) {
  console.error(`\n${violations.length} type-scale violation(s):\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error('');
}

const steps = [...scale.keys()];
const bucket = (p) => steps.filter((s) => s.startsWith(p)).length;
console.log(
  `steps ${bucket('--text-')} text · ${bucket('--display-')} display · ` +
    `${bucket('--leading-')} leading · ${bucket('--tracking-')} tracking · ` +
    `governed declarations ${counts.governed} (${counts.relative} deliberately relative) · ` +
    `weights ${[...weights].sort().join('/') || 'none'} · violations ${violations.length}`,
);

process.exit(strict && violations.length ? 1 : 0);
