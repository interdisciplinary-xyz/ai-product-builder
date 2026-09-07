import tseslint from 'typescript-eslint';
import noDeepDomainImport from './eslint-local-rules/no-deep-domain-import.cjs';

/**
 * One rule that matters here: the domain boundary, reported in the editor as
 * you type it. See RUNBOOK_DOMAIN_ARCHITECTURE §7 — the AST audit
 * (`pnpm arch:check --strict`) is the gate; this is the fast feedback.
 */
export default tseslint.config(
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'] },
  {
    files: ['**/*.{ts,tsx,mjs,cjs}'],
    languageOptions: { parser: tseslint.parser },
    plugins: { local: { rules: { 'no-deep-domain-import': noDeepDomainImport } } },
    rules: { 'local/no-deep-domain-import': 'error' },
  },
);
