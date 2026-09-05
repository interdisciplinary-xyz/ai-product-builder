# SCHEMA_FIRST_GDPR_AVOIDANCE.md — the safest data is data you never had

> **Canonical / source-of-truth copy** — vendored at `docs/ai-product-builder/RUNBOOK_SCHEMA_FIRST_GDPR_AVOIDANCE.md`. Fill the `«placeholders»` in place via `/ai-init`.
>
> **Scope:** the schema-design pattern that makes a class of GDPR problems structurally impossible — no column for free-form user prose, no column for Article 9 special-category data, no unbounded relationships that would carry personal data further than intended. Companion to [`GDPR_PRE_LAUNCH_CHECKLIST.md`](./GDPR_PRE_LAUNCH_CHECKLIST.md) (the policy).

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_SCHEMA_FIRST_GDPR_AVOIDANCE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Reusability:** template-ready — the "no free-prose column, only link-shaped fragments" pattern and the AST scan are generic; only the specific field names of concern are per-domain.
>
> **Pairs with:** `RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md` (policy), `RUNBOOK_PRIVACY_CONTRACT_TEST.md` (proof), `RUNBOOK_COMPILE_TIME_LEGAL_GUARDS.md` (mechanism — the AST-scan version of the same guard, generalised) — boundary: this runbook owns *avoiding the data class at schema time*; the compile-time-guards runbook owns *the mechanism of the AST scan*; PRIVACY_CONTRACT_TEST owns *proving what does surface is what you claim*.
>
> **Local definitions to provide per repo:**
> - `«DB_CMS»` — the schema tool (Payload collections, Prisma schema, Mongoose model, Drizzle schema)
> - `«SCHEMA_PATH»` — where the schema is defined (e.g. `src/payload/collections/*.ts`, `prisma/schema.prisma`)

---

## 1. The rule

> **The safest data is data you never had.** Design the schema so that the classes of data you promise not to collect cannot fit into it.

Three concrete applications:

- **No column for free-form user prose** where you promised not to collect free prose. If the field type doesn't accept it, no user submission — accidental or malicious — can put it there.
- **No column named after an Article 9 special category** (religion, health, sexual orientation, ethnicity, political affiliation, trade-union membership, philosophical belief). If the column doesn't exist, no code path writes to it.
- **No unbounded string field with `≥256` characters** unless the field's purpose demands it. A bio field with `max: 4096` becomes a place users park diary entries; a `max: 80` field named `tagline` stays a tagline.

The pattern's power is prevention over remediation — you don't need to redact what was never stored. Its cost is design discipline: some features you'd like to build (a bio, a personal profile page) either don't happen, or happen with a scoped schema that constrains their surface.

---

## 2. The reference implementation (Instagram tip-scraper)

The library-external audit surfaced this pattern in `scrapper` (a.k.a. `igtip`), a crawler that builds a dataset of Polish creator profiles linking to tip platforms. The schema decision:

```ts
// ✅ profiles table — no `biography` column, on purpose.
{
  username:        string,          // the public handle
  tip_platform:    'buycoffee' | 'tipply' | 'cuplink',   // enum, not free text
  tip_link:        string,          // just the URL, extracted by regex
  discovered_via:  string,          // 'catalog:buycoffee:kiproo' — provenance token
  extracted_at:    ISODate,
}
```

There is no `biography` field. The Instagram bio is fetched, a regex extracts *only* the tip-link fragment, and the fragment is stored. The rest of the bio — which is often health-adjacent, orientation-adjacent, or otherwise Article-9 special-category — never touches the database.

That schema decision is what puts the crawler on the right side of GDPR without a redaction pipeline, a retention policy, or a manual review. If a court asked for the special-category data on file, the answer is: none. Not "none intentionally" — none structurally.

Compare to the naive shape:

```ts
// ❌ profiles table — biography field.
{
  username:        string,
  biography:       string,          // ← the trap
  tip_platform:    string,
  tip_link:        string,
  extracted_at:    ISODate,
}
```

Now the schema stores every Polish creator's bio in full. Half of them mention a health condition, a partner's gender, a faith community. That's an Article 9 processing operation without a lawful basis, without consent, without a DPIA, without deletion guarantees on the hosted DB. Add a `biography` column and you've built a compliance problem.

---

## 3. How to apply it

Before adding a schema field, ask three questions:

1. **What is the field for?** Answer must be one sentence, in operational terms ("we display it on the profile card"). "Might be useful" fails.
2. **What is the widest thing a user could put in it that would still satisfy the purpose?** For a display name, 80 characters. For a tip link, a URL. For a subscription tier, an enum.
3. **What can they NOT put in it once the type is that narrow?** If the answer is "special-category prose, unbounded diary entries, other users' PII, or PDF-worth of dangerous data" — you've made the good design choice.

Then constrain the field to the narrowest shape that satisfies (1):

- **Enums** over free strings whenever the domain is finite.
- **Regex-validated strings** over free strings whenever the domain is machine-parseable (URLs, phone numbers, ISO country codes).
- **Explicit `max` lengths** on every string that isn't already type-narrowed.
- **Boolean or small integer** over an "explanation" field. A `hasCompletedOnboarding` beats a `whatDidTheyDoLast`.

---

## 4. What if you MUST take free prose?

Sometimes the product genuinely needs a free-text field (a review, a report body, a support ticket). The mitigation is not the schema — the schema has already lost — but the schema can still limit the blast radius:

- **Scope the field to a purpose** in its name — `supportTicketBody`, not `notes`.
- **Give it a hard `max`** even if you think you want unlimited (2000 characters covers a support ticket; nobody writes a novel to a form).
- **Tag it in the schema** as `sensitive: true` (or your ORM's equivalent), which lets your PII-scanner (see `RUNBOOK_PRIVACY_CONTRACT_TEST.md` §non-derivability) know to include it in the export/delete pass.
- **Store the entry the user typed, not a "cleaned up" or "AI-normalised" version.** The cleaned version has been through your servers and can no longer be described as the user's untouched text — you now share responsibility for what it says.

---

## 5. The scan

An AST-based scan on the schema files, run in `ci:quality`, catches the field additions this runbook exists to prevent.

```ts
// scripts/audit/schema-fields.static.spec.ts
import { Project, SyntaxKind } from 'ts-morph';

const FORBIDDEN_FIELDS = [
  /^bio(graphy)?$/i,
  /^religion$/i,
  /^health(Status)?$/i,
  /^sexualOrientation$/i,
  /^ethnicity$/i,
  /^politicalAffiliation$/i,
  /^unionMembership$/i,
  /^diary$/i,
  /^story$/i,       // "user's story" is almost always Art. 9
];

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
for (const f of project.getSourceFiles('«SCHEMA_PATH»')) {
  f.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.PropertyAssignment) return;
    const name = node.getFirstChildByKind(SyntaxKind.Identifier)?.getText();
    if (!name) return;
    if (FORBIDDEN_FIELDS.some((r) => r.test(name))) {
      throw new Error(`schema field "${name}" in ${f.getFilePath()} — Article 9 risk`);
    }
  });
}
```

The scan lives with — and reuses the shape of — `RUNBOOK_COMPILE_TIME_LEGAL_GUARDS.md`. Fields you legitimately need (the schema tool's own `biography` for an author record, migration scripts) go in a small allowlist with an ADR reference.

---

## 6. Anti-patterns

- **A "just in case" free-text field.** No such thing — every one becomes a place users store what you promised not to collect.
- **A `metadata: JSON` catch-all field.** Structurally infinite, structurally uninspectable, structurally impossible to promise anything about.
- **Article 9 special-category fields "for research."** GDPR Art. 9(2) requires an explicit lawful basis; "we thought it would be interesting" is not one.
- **A schema field named cutely to evade the scan** (`b1ography`, `story_but_short`). If the intent is to store the class of data the scan forbids, the ADR-and-argue path is the right one — not the rename-and-hope path.
- **Storing the AI-normalised version of user prose.** You've now added your processing to it; you share responsibility. Store the raw or don't store it.

---

## 7. Verification checklist

- [ ] Every schema field in `«SCHEMA_PATH»` passes the "one-sentence purpose" test.
- [ ] Every string field carries an explicit `max`.
- [ ] The forbidden-field scan runs in `ci:quality`.
- [ ] Any legitimate free-prose field carries a `sensitive: true` tag (or equivalent) so the privacy-contract test picks it up.
- [ ] The Article 30 record (data-processing register) lists every free-prose field explicitly, with its lawful basis and retention.
- [ ] `RUNBOOK_GDPR_PRE_LAUNCH_CHECKLIST.md` references this file in its "before adding a schema field" section.

## 8. Related

- Policy checklist: [`GDPR_PRE_LAUNCH_CHECKLIST.md`](./GDPR_PRE_LAUNCH_CHECKLIST.md)
- Prove what does surface: [`PRIVACY_CONTRACT_TEST.md`](./PRIVACY_CONTRACT_TEST.md)
- The AST-scan mechanism reused here: [`COMPILE_TIME_LEGAL_GUARDS.md`](./COMPILE_TIME_LEGAL_GUARDS.md)
- Legal-risk register the ADR sits alongside: [`LEGAL_RISK.md`](./LEGAL_RISK.md)

**Last reviewed:** «DATE»
