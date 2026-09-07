# COMPILE_TIME_LEGAL_GUARDS.md — legal risk encoded in the type system

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_COMPILE_TIME_LEGAL_GUARDS.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the `FORBIDDEN_TOKENS`-style static allowlist pattern that turns a legal boundary (custody of funds, retention of special-category data, cross-border data transfer, health-claim marketing copy) into a compile-time build-failing check. Companion to [`PAYMENTS_COMPLIANCE.md`](./PAYMENTS_COMPLIANCE.md) — this runbook is the *mechanism*, PAYMENTS_COMPLIANCE is the *content*.

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_COMPILE_TIME_LEGAL_GUARDS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the mechanism (forbidden-tokens list + AST scan + build gate) is generic. The specific tokens are per-domain-and-jurisdiction.
>
> **Pairs with:** `MANAGER_PAYMENTS_COMPLIANCE.md` (the SaaS-vs-PI boundary this most commonly enforces), `MANAGER_SECURITY.md` (the custody-tokens gate row), `MANAGER_DECISION_LOG.md` (allowlist additions require an ADR) — boundary: this runbook owns the *guardrail mechanism*; the compliance MANAGERs own *what to guard against*.
>
> **Local definitions to provide per repo:**
> - `«GUARD_NAME»` — the semantic name of the guard (e.g. `NO_CUSTODY`, `NO_ARTICLE_9`, `NO_CROSS_BORDER`)
> - `«GUARD_SPEC_PATH»` — the test file that runs on every PR (e.g. `src/lib/server/payments/forbidden-fields.static.spec.ts`)
> - `«ALLOWLIST_PATH»` — the small file that lists intentional exceptions with rationale (e.g. `src/lib/server/payments/forbidden-fields.allowlist.ts`)
> - `«JURISDICTION»` — the legal regime the guard enforces (e.g. `PL / EU under PSD2`)

---

## 1. The rule

> **If a legal claim can be violated by adding one identifier to the source tree, that claim gets a compile-time guard.**

The guard has three parts:

1. **A list of forbidden identifiers / patterns** — regex-matchable, curated by hand, with an inline comment on each entry citing the specific rule it prevents violating.
2. **An AST-based test** that fails the build if any forbidden identifier appears in a non-allowlisted source file.
3. **A separate small allowlist** of intentional exceptions, each carrying a `see `RUNBOOK_DECISION_LOG.md` #<n>` reference.

Prose says "the platform does not hold customer funds." Code says `platformBalance`, `settlementBatch`, `payoutSchedule`. When the prose and the code disagree, the code wins — legally and operationally. This guard makes the code unable to disagree.

---

## 2. When to use this pattern

The forbidden-tokens pattern is worth the machinery when **the legal claim is binary and the vocabulary is narrow**:

| Claim | Forbidden pattern | Jurisdictional basis |
|---|---|---|
| "Platform does not hold customer funds." | `platformBalance`, `creatorBalance`, `pendingBalance`, `payoutSchedule`, `settlementBatch`, `walletBalance`, `withdrawableAmount` | EU PSD2, US state money-transmitter, PL KNF |
| "Platform does not store Article 9 special-category data." | `biography`, `healthStatus`, `disability`, `sexualOrientation`, `politicalAffiliation`, `religion`, `unionMembership` | GDPR Art. 9 |
| "No personal data leaves the EEA." | Any code path to an S3 bucket outside `eu-*`, any `fetch('https://…')` to a non-allowlisted host | GDPR Chapter V |
| "No medical claims in marketing copy." | `cure`, `treatment`, `diagnose`, `clinically proven`, `FDA approved` | US FTC; EU MDR |
| "No API surface exposes internal admin routes to unauthenticated traffic." | Route filenames matching a `_admin_*` prefix outside a `middleware`-protected group | Repo-specific |

The pattern is **not** appropriate when:

- The rule is contextual ("depends on who the user is"). A runtime check is right, not a compile-time one.
- The rule requires judgement ("misleading"). Static analysis will over- or under-flag; the check will get disabled.
- The vocabulary is open-ended. The guard becomes an arms race with synonyms.

---

## 3. The mechanism

### 3.1 The forbidden list

```ts
// src/lib/server/«GUARD_NAME»/forbidden.ts
//
// Every entry cites the specific legal rule the field would violate.
// Adding an entry is safe (belt-and-braces). Removing one requires an ADR.

export const FORBIDDEN_«GUARD_NAME»: ReadonlyArray<{
  pattern: RegExp;
  rationale: string;
  see: string;   // ADR reference or law reference
}> = [
  { pattern: /\bplatformBalance\b/,     rationale: 'implies platform custody', see: 'PSD2 Art. 4(3)' },
  { pattern: /\bcreatorBalance\b/,      rationale: 'implies platform custody', see: 'PSD2 Art. 4(3)' },
  { pattern: /\bpendingBalance\b/,      rationale: 'implies platform-held delayed release', see: 'PSD2 Art. 4(3)' },
  { pattern: /\bpayoutSchedule\b/,      rationale: 'implies platform-controlled payout',    see: 'MANAGER_PAYMENTS_COMPLIANCE.md §Forbidden patterns' },
  { pattern: /\bsettlementBatch\b/,     rationale: 'implies platform-batched settlement',   see: 'PSD2 Art. 4(3)' },
  { pattern: /\bwithdrawableAmount\b/,  rationale: 'implies withdrawal from platform account', see: 'PSD2 Art. 4(3)' },
  { pattern: /\bwalletBalance\b/,       rationale: 'implies platform wallet',               see: 'PSD2 Art. 4(3)' },
];
```

### 3.2 The scan

The scan must be **AST-based**, not text-based. A comment mentioning `walletBalance` in a rationale block for the guard itself is not a violation. A string literal in a translation file might be (a UI copy leak) or might not be (a comment about the field's absence). AST + node-type filtering separates them.

```ts
// «GUARD_SPEC_PATH» — src/lib/server/«GUARD_NAME»/forbidden.static.spec.ts
import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';   // Node 22+
import { Project, SyntaxKind } from 'ts-morph';
import { describe, it, expect } from 'vitest';

import { FORBIDDEN_«GUARD_NAME» } from './forbidden';
import { ALLOWLIST_«GUARD_NAME» } from './allowlist';

const SOURCE_GLOB = 'src/**/*.{ts,tsx}';

describe('«GUARD_NAME» — forbidden tokens do not appear in source', () => {
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
  const files = project.getSourceFiles(SOURCE_GLOB)
    .filter((f) => !ALLOWLIST_«GUARD_NAME».files.some((p) => p.test(f.getFilePath())));

  for (const rule of FORBIDDEN_«GUARD_NAME») {
    it(`nothing matches ${rule.pattern} (${rule.rationale})`, () => {
      const hits: string[] = [];
      for (const file of files) {
        file.forEachDescendant((node) => {
          // Names are what we care about: identifiers, property names, string
          // literals in specific positions. NOT comments; NOT jsdoc.
          if (
            node.getKind() === SyntaxKind.Identifier ||
            node.getKind() === SyntaxKind.PropertyAssignment ||
            node.getKind() === SyntaxKind.PropertySignature
          ) {
            const text = node.getText();
            if (rule.pattern.test(text)) {
              hits.push(`${file.getFilePath()}:${node.getStartLineNumber()}  ${text}`);
            }
          }
        });
      }
      expect(hits, `${rule.rationale} — see ${rule.see}`).toEqual([]);
    });
  }
});
```

Wire into `ci:quality` and mark it a **required** check in branch protection. This is the whole mechanism.

### 3.3 The allowlist — the escape hatch that costs

```ts
// «ALLOWLIST_PATH» — src/lib/server/«GUARD_NAME»/allowlist.ts
//
// Every entry MUST cite an ADR. The presence of an entry means the
// architecture team explicitly reviewed and accepted the exception.
// Additions require an ADR PR against `docs/DECISION_LOG.md`.

export const ALLOWLIST_«GUARD_NAME» = {
  // File paths where forbidden tokens legitimately appear (e.g. the guard
  // itself, migration scripts named after old-shape fields, generated types
  // that mirror an upstream schema we don't control).
  files: [
    /\/forbidden\.ts$/,           // the list itself
    /\/forbidden\.static\.spec/,  // the test
    /\/allowlist\.ts$/,           // this file
    /\/migrations\/2026-04-.*\.ts$/, // ADR-2026-04-12: migration off pendingBalance
  ] as RegExp[],
  // Per-identifier exceptions (rare — file-level is preferred)
  identifiers: [
    // { pattern: /\bplatformBalance\b/, in: /some\/legit\/context/, see: 'ADR-2026-05-01' },
  ],
};
```

The allowlist is **small on purpose**. A large allowlist is the guard failing quietly.

---

## 4. Deployment

### 4.1 Add the guard on day one, not on incident day

The pattern is cheapest to add before there are any offenders. On day one you have zero list entries, zero allowlist entries, zero drift — the guard is green and the discipline is set.

Adding the guard after an incident means you also have to fix every existing violation, argue about which allowlist exceptions are OK, and slog through the review. That's not the moment to introduce architectural discipline.

### 4.2 The runtime companion

A compile-time guard cannot catch:

- Data arriving from a third-party SDK with a custody-implying field name (`stripeAccount.balance` — an object you didn't define but that flows through your code).
- Admin form submissions that write a field name the schema didn't declare.

For these, pair the compile-time guard with a runtime `assertNoCustody(obj)` at input boundaries:

```ts
// src/lib/server/«GUARD_NAME»/assertions.ts
export function assertNo«GUARD_NAME»(obj: unknown, at: string): void {
  const keys = collectKeys(obj);
  for (const rule of FORBIDDEN_«GUARD_NAME») {
    const hit = keys.find((k) => rule.pattern.test(k));
    if (hit) {
      throw new Error(`«GUARD_NAME» violation: field "${hit}" arrived at ${at} — ${rule.rationale} (see ${rule.see})`);
    }
  }
}

// used at every payload boundary:
export async function POST(req: Request) {
  const body = await req.json();
  assertNoNoCustody(body, 'POST /api/admin/creator');   // fails loud before persistence
  // …
}
```

The pair — compile-time for source, runtime for input boundaries — closes both halves.

---

## 5. Anti-patterns

- **Text-based grep instead of AST scan.** A rationale block in the guard itself will match; suppressing it with `// prettier-ignore`-style comments creates a second layer of noise.
- **A large allowlist.** Every entry is a documented exception; more than ~10 entries means the guard is aspirational.
- **Removing an entry from the forbidden list to "unblock" a feature.** The removal is the compliance change; either the ADR justifies it (rare) or the feature needs a different design.
- **A guard without a jurisdictional citation.** Rules that don't name the specific law they enforce become disputable ("do we still need this?"); rules that do become auditable.
- **A guard that only runs on merges.** The developer discovers the violation after the review is done. Run it in `ci:quality` and locally in `standard`.
- **No runtime companion.** Third-party SDKs and admin forms can flow custody-implying fields in bypassing the source-level check.

---

## 6. Verification checklist

- [ ] `«GUARD_SPEC_PATH»` exists and is AST-based (uses `ts-morph`, `typescript`, or an equivalent — not `grep`).
- [ ] The forbidden list carries a `rationale:` and a `see:` field on every entry.
- [ ] The allowlist has fewer than 10 entries; each cites an ADR.
- [ ] The test is a **required** check in branch protection, not merely present.
- [ ] A runtime `assertNo«GUARD_NAME»(obj, at)` is called at every input boundary that persists data with keys derived from the payload.
- [ ] `MANAGER_PAYMENTS_COMPLIANCE.md` (or the equivalent domain MANAGER) references `«GUARD_SPEC_PATH»` in its OUTPUT FORMAT.
- [ ] Adding a token to the allowlist requires an ADR (verified by a pre-merge hook that flags PRs which touch `«ALLOWLIST_PATH»` without also touching `docs/DECISION_LOG.md`).

## 7. Related

- The compliance MANAGER this runbook most commonly serves: [`MANAGER_PAYMENTS_COMPLIANCE.md`](./MANAGER_PAYMENTS_COMPLIANCE.md)
- The security MANAGER's REQUIRED row on the custody gate: [`MANAGER_SECURITY.md`](./MANAGER_SECURITY.md)
- Any allowlist change is an ADR-worthy decision: [`MANAGER_DECISION_LOG.md`](./MANAGER_DECISION_LOG.md)
- The schema-first sibling for Article 9 avoidance: [`SCHEMA_FIRST_GDPR_AVOIDANCE.md`](./SCHEMA_FIRST_GDPR_AVOIDANCE.md)
- Whether the static test can actually fail: `SKILL_TESTS_THAT_CANNOT_FAIL.md`

**Last reviewed:** «DATE»
