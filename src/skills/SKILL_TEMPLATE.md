# SKILL template — the canonical anatomy

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_TEMPLATE` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_TEMPLATE.md`. **Additional install target:** a skill only fires once it is copied to `.claude/skills/«skill-name»/SKILL.md` in the consumer repo (one directory per skill, the file always named `SKILL.md`). Unlike a RUNBOOK — which a human opens on purpose — a SKILL is loaded by the agent *without being asked*, on the strength of its frontmatter `description` alone.
>
> **Reusability:** template-ready — this file is the fill-in anatomy for every new skill; fill the `«placeholders»`. The frontmatter schema, the trigger formula, the body skeleton and the *Skill or doc?* rule are portable verbatim; **the incident, the trap code and the proof obligation are yours to write.**
>
> **Pairs with:** [`SKILL_TESTS_THAT_CANNOT_FAIL.md`](./SKILL_TESTS_THAT_CANNOT_FAIL.md) (every skill's *proof obligation* section is judged by it) and [`RUNBOOK_QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md) (the merge gate a skill is trying to make smarter) — boundary: this template owns the **shape** of a skill; the sibling skills own **content**.
>
> **Owns / defers to:** Owns skill anatomy, the trigger-writing formula, and the skill-vs-doc decision rule. Defers testing doctrine → [`SKILL_TESTS_THAT_CANNOT_FAIL.md`](./SKILL_TESTS_THAT_CANNOT_FAIL.md); testing *strategy* → [`MANAGER_TESTING_STRATEGY.md`](./MANAGER_TESTING_STRATEGY.md); the human-readable, read-on-demand doc → the `RUNBOOK_*` layer; the agent playbook you *run* → the `MANAGER_*` layer.
>
> **Local definitions to provide per repo:**
> - `«skill-name»` — kebab-case; **must equal the directory name** under `.claude/skills/`
> - `«INCIDENT_REF»` — how this repo names the incident/issue that motivated the rule (e.g. an issue number, an incident ID). Never hardcode a number that will rot — cite the tracker.
> - `«PROJECT»` — used only where a rule is genuinely product-specific (prefer not to need it)
> - `«QUALITY_CMD»` / `«TEST_CMD»` — the commands a skill's proof obligation runs in
> - `«REGEN_CMD»` — only if the skill is stateful: the one command that regenerates its list (see §5)

**Last reviewed:** «DATE»

A skill is not documentation that happens to live in `.claude/`. It is a **trigger + a refusal**, and optionally a script. It exists to ambush a diff that was about to be wrong, in a session where nobody thought to look it up.

Everything below is the anatomy. Copy this file to `.claude/skills/«skill-name»/SKILL.md`, fill it, delete the commentary.

---

## 1. The frontmatter IS the skill

```yaml
---
name: «skill-name» # kebab-case, == the directory name
description: >-
  «one paragraph — see §2. This is the ONLY thing the agent sees when deciding
  whether to load the body. It is not a summary. It is a matcher.»
allowed-tools: Read, Grep, Glob, Bash # optional; omit unless you need to restrict
---
```

| Field | Required | What it does |
|---|:--:|---|
| `name` | ✅ | Identity + wikilink target (`[[«skill-name»]]`). Must equal the directory name. |
| `description` | ✅ | **The trigger.** The agent matches the task against this text and nothing else. |
| `allowed-tools` | — | Restricts the tools available while the skill is active. Omit unless a restriction is the point. |

> **A skill with no `description` can never auto-fire.** It is not a weak skill — it is a doc that has been filed in the wrong folder. The body can be brilliant and it will never be read.

Corollary: **the `description` deserves more editing time than the body.** A perfect body behind a vague trigger fires never; a blunt body behind a sharp trigger fires every time it is needed. Budget accordingly.

---

## 2. The trigger-writing formula

Write the `description` to this shape, in this order:

```text
[counterintuitive claim, stated as fact]
  + [«INCIDENT_REF» — the thing that already went wrong]
  + ["Use when <file-path glob>
      OR <code shape>
      OR <the sentence a confused user would actually type>"]
```

Each clause is doing a different job:

- **The counterintuitive claim** is what the agent does not already know. "«CLIENT_FN» never throws." "Unspecified access defaults to permissive." "The marker is written after the irreversible act." A description that merely names a topic ("guidance on emails") matches everything and therefore nothing.
- **The incident ref** is the licence to interrupt. It converts an opinion into a scar. Cite the tracker (`«INCIDENT_REF»`), never a bare number that will be meaningless in a year.
- **The "Use when" triple** is the matcher. Give the agent three *independent* hooks — a path, a code shape, and a phrasing — because you cannot predict which one the session will present.

### The three hooks, concretely

| Hook | Bad (topic) | Good (matchable) |
|---|---|---|
| **file-path glob** | "cron work" | `Use when editing anything under «API_ROUTES» that a scheduler invokes` |
| **code shape** | "database safety" | `Use when you see read → external call → update(marker), or any read-modify-write on a shared field` |
| **the sentence a confused user types** | "email best practices" | `Use when someone writes "the try/catch handles it" or "the marker makes it idempotent"` |

### Advanced move 1 — fire on state, not on keywords

```text
Especially fire when «situational state, no keyword needed» —
e.g. "the diff adds a new field to a create-open collection",
     "the user is about to mark a regression guard as done",
     "the session is writing its first test for a fallback branch".
```

The best skills fire when nobody said the magic word. If your trigger only matches when the user already names the concept, it fires exactly when it is least needed — the user already knew.

### Advanced move 2 — declare the boundary in the trigger

```text
Defer to `«other-skill»` for X; this skill owns Y.
```

Two skills with overlapping triggers both fire, both dump context, and the agent averages them. Say the boundary *in the description* so the loser never loads. This is the same **Owns / defers to** discipline the MANAGER and RUNBOOK layers use — enforced one layer earlier.

### Worked example

```yaml
description: >-
  «MARKER_FIELD» stamped after the side effect is not idempotency — it is a re-send
  window («INCIDENT_REF»). Use when editing any scheduled job under «API_ROUTES»;
  any find → await «EXTERNAL_PROVIDER» call → update(marker) sequence; or any code that
  justifies itself with "the marker makes it idempotent" or "«SCHEDULER» fires once an hour."
  Especially fire when a diff adds a new scheduled job at all, even if nobody mentions
  idempotency. Defer to `«never-throws-contract»` for how to handle the call's *result*;
  this skill owns the *order* of the write and the call.
```

---

## 3. The body skeleton (in this order)

Deviate only with a reason. The order is load-bearing: an agent that stops reading after 30 lines must still have read the damage and the rule.

### 3.1 Cold open — the damage report

No preamble. No "This skill helps you…". First sentence names the broken shape; second names what it cost.

```markdown
# «Skill Title»

«The wrong shape, stated flatly.» It looks correct because «the reason it fools reviewers».
«What it actually does.» This was «INCIDENT_REF».

«One sentence of blast radius — the thing that makes an engineer stop scrolling.»
```

The blast-radius sentence is not drama. It is the difference between a rule the agent applies and a rule the agent mentions. *"Duplicate lifecycle mail at scale is a sender-reputation event, not an annoyance. The same shape applied to «PAYMENTS» would be a double charge."*

### 3.2 `## When to use`

Paths and code shapes — **never topics**.

```markdown
## When to use

- Writing or editing anything under `«path/glob»`.
- Any `«code shape A»` → `«code shape B»` sequence.
- Reviewing code that justifies itself with "«the sentence that means the author missed it»".
```

### 3.3 `## The trap`

Real code, marked `❌`, with the fatal line called out inline. Not pseudo-code — the reader must recognise their own diff.

````markdown
## The trap

```ts
// ❌ «why this is wrong in six words»
«real code»
«the fatal line»  // ← «what happens here»
```

«The enumeration of windows/cases where it breaks — bulleted, each one concrete.»
````

### 3.4 `## The fix`

`✅` code. The **minimal** correct version, not the ideal architecture.

### 3.5 `## What the naive fix still gets wrong`

This section is what separates a skill from a blog post. The reader has now seen the fix and believes they are done. They are not.

```markdown
## What the naive fix still gets wrong

**1. «The correction the first-attempt fix always misses».** «Why the fix, applied
   literally, trades one bug for a quieter one.»
**2. «The thing that is expected, not exceptional».** «The error that will now start
   appearing and must not be alerted on.»
**3. «The neighbouring case the same fix does not cover».** «Point at the sibling
   skill: that is [[«other-skill»]] — same failure, same fix.»
```

### 3.6 `## The proof obligation`

**Every skill states what would demonstrate the fix works — and the standard is falsification, not coverage.**

````markdown
## The proof obligation

«The specific test that would have failed before the fix and passes after.»

```ts
«the test»
```

Run it against the pre-fix code and watch it fail. If it passes, it asserts nothing —
see [[tests-that-cannot-fail]].
````

A skill without a proof obligation is advice. A skill with one is a gate.

### 3.7 `## Checklist`

Six to eight `- [ ]` items, each one **mechanically checkable in a diff**. If an item requires judgement, it belongs in the prose above, not here.

### 3.8 `## Related`

`[[wikilinks]]` to sibling skills, plus the in-repo precedent (a real path + line range — the file the reader should copy from) and the plan/incident.

```markdown
## Related

- Incident / plan: «INCIDENT_REF»
- In-repo precedent: `«path/to/the/one/that/does/it/right.ts»`
- Counterpart for «the adjacent failure»: [[«other-skill»]]
```

---

## 4. Skill or doc?

> **A skill is a trigger + a refusal + (optionally) a script. A doc is everything else.**
>
> **If you delete the `description` and the artifact loses nothing, it was always a doc.**

Apply the rule by asking who initiates:

| | → |
|---|---|
| The human **always knows** they need it (onboarding, architecture map, release process, the E2E inventory) | **doc** — a `RUNBOOK_*`. They will open it. It does not need to ambush anyone. |
| The human **does not know** they need it, and it must **ambush the diff** (a counterintuitive contract, a permissive default, an assertion that cannot fail) | **skill** — it only works if it fires unbidden. |

Two more tests, when the first is close:

- **The refusal test.** Can you state the skill as a *refusal* — "no, not like that, and here is why the obvious fix is also wrong"? If it has no refusal in it, it is reference material.
- **The surprise test.** Would a competent engineer, reading the body, say *"huh — I'd have got that wrong"*? If they'd say *"yes, obviously"*, the model already knows it and you have spent context on nothing.

A doc that a skill points at is a healthy pairing: keep the trigger and the refusal in the skill, and defer the 400-line inventory to the `RUNBOOK_*` it links to.

---

## 5. Anti-pattern — the skill that rots

> **Never build a skill whose body is a list of current facts.**

A bug list. A status snapshot. "The 19 call sites split 7/6/4/2." "These 3 collections are still unlocked." Every one of those is true on the day it is written and a lie within a sprint — and unlike a stale doc, a **stale skill fires by itself and argues with the diff.** It is worse than nothing, because the agent will trust it.

### The sibling anti-pattern — skill sprawl

The portfolio audit surfaced a second failure mode: a repo with 34 skills, several overlapping in scope, none carrying a "last reviewed" date. The result: it is impossible to tell which skills are load-bearing, which have been superseded, and which have quietly stopped firing because their trigger words no longer match how the codebase talks about the concept.

**Two mechanical guards a skill layer needs:**

1. **Every skill carries `**Last reviewed:** «DATE»` at the top** (the anatomy already declares it — enforce it in `bin/build --check`). A skill whose review date is more than 6 months old is a candidate for re-verification or retirement, per `MANAGER_DOC_FRESHNESS.md`.
2. **The skill count itself is a `<!-- probe:skill-count -->` (per `RUNBOOK_DOC_FRESHNESS_PROBES.md`)** and shows up in the doc-freshness sweep output. A repo growing past ~15 skills without a governance review is drifting toward the empatalk-app pattern (34 skills, 19 without frontmatter, none fire).

If your skill layer has more than 15 entries, half of them are docs in a costume. Retire, don't accumulate.

The distinction is **shape vs. inventory**:

- ✅ *"An assertion that accepts the broken value is not an assertion."* — a shape. True forever.
- ❌ *"`«path/to/route»` is currently orphaned."* — an inventory. False as soon as someone fixes it.

Counts and inventories may appear as **evidence for a shape** ("at «INCIDENT_REF» the call sites split 7/6/4/2 — nothing in the type system distinguished them"), past-tense, anchored to an incident. They may never be the *body*.

If you genuinely must ship a stateful skill, it carries both of these, at the top, non-negotiably:

```markdown
> ⚠️ **STALENESS BANNER** — this list is a snapshot of «DATE» and rots.
> Regenerate before trusting it: `«REGEN_CMD»` — the one command that reproduces the list.
> If its output disagrees with the list below, **the list is wrong.**
```

No regeneration command → no stateful skill. Write the shape instead.

---

## 6. Pre-flight checklist for a new skill

- [ ] `name` is kebab-case and **equals the directory name** under `.claude/skills/`.
- [ ] `description` carries all three: counterintuitive claim, `«INCIDENT_REF»`, and a "Use when" triple (path glob **OR** code shape **OR** the sentence a confused user types).
- [ ] The description would fire **without the user naming the concept** ("Especially fire when…").
- [ ] Overlapping siblings are disowned in the description ("Defer to `«other-skill»` for X; this skill owns Y").
- [ ] The body cold-opens on damage — no preamble, no "this skill helps you".
- [ ] `## The trap` shows real `❌` code; `## The fix` shows the minimal `✅`.
- [ ] `## What the naive fix still gets wrong` exists and is not padding.
- [ ] `## The proof obligation` names a test **confirmed to fail against the pre-fix code**.
- [ ] The checklist items are mechanically checkable in a diff.
- [ ] The body contains **no inventory that will rot** — or carries a staleness banner + regeneration command.
- [ ] Passes the delete-the-`description` test: without it, the artifact would lose something.

## Related

- Testing doctrine every proof obligation is judged by: [[tests-that-cannot-fail]] — [`SKILL_TESTS_THAT_CANNOT_FAIL.md`](./SKILL_TESTS_THAT_CANNOT_FAIL.md)
- Worked examples of this anatomy: [[claim-before-side-effect]] — [`SKILL_CLAIM_BEFORE_SIDE_EFFECT.md`](./SKILL_CLAIM_BEFORE_SIDE_EFFECT.md) · [[never-throws-contract]] — [`SKILL_NEVER_THROWS_CONTRACT.md`](./SKILL_NEVER_THROWS_CONTRACT.md) · [[framework-defaults-are-permissive]] — [`SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md`](./SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md)
- Token glossary: [`PLACEHOLDERS.md`](./PLACEHOLDERS.md)
- The merge gate a skill is trying to make smarter: [`RUNBOOK_QUALITY_ASSURANCE.md`](./QUALITY_ASSURANCE.md)
