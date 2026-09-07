# Rationale over restatement

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_RATIONALE_COMMENTS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_RATIONALE_COMMENTS.md`. **Additional install target:** `.claude/skills/rationale-comments/SKILL.md`.
>
> **Reusability:** template-ready — the rule ("delete the code, not the reason") is portable verbatim; only `«INCIDENT_REF»` and one or two repo-specific idioms need swapping.
>
> **Pairs with:** `SKILL_TESTS_THAT_CANNOT_FAIL.md` (the sibling rule that a regression guard is worth writing only after you have seen it fail) and `MANAGER_ENGINEERING_STANDARDS.md` (the code-conventions doc that names *what* to write; this skill names *why*-comments as its own category) — boundary: this skill owns the **rationale block** above load-bearing operational code; the standards doc owns everything else.
>
> **Owns / defers to:** Owns the deletion test for a rationale-as-comment block above conditional CI logic, cron schedules, security constants, deny-lists, framework-defaults overrides, and any config whose default is wrong for a specific reason. Defers **what code to write** → `MANAGER_ENGINEERING_STANDARDS.md`; **how much to test** → `MANAGER_TESTING_STRATEGY.md`; **whether the guard itself asserts anything** → `SKILL_TESTS_THAT_CANNOT_FAIL.md`.
>
> **Local definitions to provide per repo:**
> - `«INCIDENT_REF»` — how this repo names the incident/issue that motivated the rule (never a bare number that rots)
> - `«CI_FILE»` — the workflow file whose branch-trigger / concurrency block is the canonical example (e.g. `.github/workflows/ci.yml`)
> - `«DENY_LIST_FILE»` — the file that holds the `NEVER_CACHE` / forbidden-tokens / any allow-or-deny list

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: rationale-comments
description: >-
  A comment that RESTATES the code is noise the next session will delete. A comment
  that STATES WHY the code is here (the incident, the constraint, the alternative
  that was tried) is the load-bearing prose that stops the guard from being deleted
  as "redundant" («INCIDENT_REF»). Use when writing or editing anything under
  `«CI_FILE»`; any cron schedule, feature flag, security constant, deny-list, or
  framework-defaults override; any block that opens with a `// NOTE` / `# NOTE`; any
  file where the diff removes a comment adjacent to conditional or scheduled code;
  or reviewing a PR whose message is "clean up dead comments". Especially fire when
  the agent is about to delete a comment because it "restates the code" — that is
  the exact moment nobody will check what the code was there to prevent. Defer to
  `tests-that-cannot-fail` for whether the guard the comment protects can actually
  fail; this skill owns whether the comment survives to explain WHY the guard was
  written at all.
---
```

---

## The damage

A restatement comment (`// increment the counter`, `// return the result`) is noise; the next session deletes it and nothing is lost. A rationale comment (`// the counter runs the merge-window SLA — do not swap for a set, order matters, «INCIDENT_REF»`) reads exactly the same to a scanner — and gets deleted by the same reflex. What is lost is the *reason* the code is not the obvious shape, and the guard reverts to the obvious shape on the very next refactor.

The three shapes that eat rationale first, every time:

1. **A conditional CI trigger** without a rationale block. Six months later, "why does this workflow skip `scope/**`?" is a question no one can answer, and the next PR reviewer adds the trigger back "for completeness."
2. **A framework-defaults override** — `overrideAccess: true` on a Payload query, `--legacy-peer-deps` in a `postinstall`, `dangerouslyAllowSVG: true` on an `<Image>`. The override is *always* a scar. Without a comment, it is indistinguishable from a lazy default.
3. **A `NEVER_CACHE` / forbidden-tokens / deny-list** that still names paths the app no longer serves. The docblock is the invariant — the list is the mechanism. Delete the docblock, and the next contributor "cleans up" the mechanism because it "guards nothing."

**Blast radius.** The library's own reference implementation (`«CI_FILE»`) has a `!startsWith(github.head_ref, 'scope/')` guard on every job. Without the rationale block above it explaining that this is a cost-tier for `scope/*` branches (see `RUNBOOK_RELEASE_MANAGER.md` §branch-topology), the *very first* CI-cost review PR flips it back to `always`, doubles the CI bill, and the incident that motivated it happens again — this time with no record of the original decision.

## When to use

- Writing or editing anything under `«CI_FILE»`.
- Any `cron:` schedule, any `if:` on a workflow job, any `concurrency:` block.
- Any framework-defaults override — `overrideAccess`, `dangerouslyAllowSVG`, `ignoreBuildErrors`, `--legacy-peer-deps`, `--no-verify`, `disableCache`.
- Any `NEVER_CACHE` / forbidden-tokens / allow-list / deny-list.
- Any security constant that ISN'T obviously safe — a specific `sha256`, a hard-coded UID, a pinned lockfile hash, a `Content-Security-Policy` value.
- Any file where the diff *removes* a comment adjacent to conditional or scheduled code.
- Reviewing a PR whose message is "clean up dead comments" or "remove obsolete notes".
- Any code that would look like a mistake without context — a "wrong" default, a redundant check, a smaller-than-obvious constant.

## The trap

```yaml
# ❌ Restatement — deleted on the next housekeeping pass.
# Run CI on push and PR.
on:
  push:
    branches: [main, 'release/**']
  pull_request:

jobs:
  quality:
    if: ${{ !startsWith(github.head_ref, 'scope/') }}   # ← lonely; no rationale
    runs-on: ubuntu-latest
    steps:
      - run: pnpm ci:quality
```

```ts
// ❌ Restatement — deleted the same day.
// Update the row.
await db.update({ where: { id }, data: { «MARKER_FIELD»: now }, overrideAccess: true });
//                                                                ↑ every override is a scar
//                                                                  and this one has none
```

```ts
// ❌ The docblock was here; it "restated the list", so it was removed.
// Now the list itself looks like it guards nothing.
const NEVER_CACHE = ['/admin', '/settings/*', '/legacy/beat-manager', '/legacy/catalogs/*'];
//                                             ↑ the paths no longer exist. What is this DOING?
```

Every one of the three above passes a "does the code work?" review. Every one of the three above **loses** on the very next refactor by an agent or a human doing housekeeping, because the deletion cost is zero and the retention benefit is invisible.

The tell is temporal, not local. A rationale-less guard breaks not on the day it's merged — it breaks on the day someone reads it fresh and cannot see why it is there.

## The fix — the rationale block

A rationale block goes **above** the code it protects (not inline, not at the bottom), and answers three questions in order:

1. **What is this?** — one sentence naming the invariant, not the mechanism.
2. **Why not the obvious shape?** — the alternative that was tried, considered, or defaulted to, and what it cost.
3. **What would break if you deleted this?** — the concrete failure, ideally citing `«INCIDENT_REF»`.

```yaml
# ✅ Rationale. Survives.
# Cost tier: `scope/**` PRs skip every paid job by design — see
# `docs/RUNBOOK_RELEASE_MANAGER.md` §branch-topology. Removing this `if:`
# doubles the CI minutes bill and re-runs e2e on every draft push
# («INCIDENT_REF» — the week we spent $340 in Actions minutes before noticing).
on:
  push:
    branches: [main, 'release/**']
  pull_request:

jobs:
  quality:
    if: ${{ !startsWith(github.head_ref, 'scope/') }}
    runs-on: ubuntu-latest
    steps:
      - run: pnpm ci:quality
```

```ts
// ✅ Every override is a scar; the comment says why THIS one exists.
// The claim runs inside the scheduled cron; Payload's default access forbids
// the service-account update because the row's owner is a real user. See
// `SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md` — this is the OPPOSITE case: a
// restrictive default that the job legitimately needs to bypass, and the
// `overrideAccess` is the only mechanism the ORM offers («INCIDENT_REF»).
await db.update({ where: { id }, data: { «MARKER_FIELD»: now }, overrideAccess: true });
```

```ts
// ✅ The paths ARE dead. The list is not.
// Shrink-only invariant: this deny-list intentionally still names paths the
// app no longer serves. Removing a path from the list would let a previously-
// refused URL become cacheable if the app ever re-serves it under the same
// name (a real risk in a rewrite/rename). Only additions are safe; removals
// need an explicit review. Grew out of «INCIDENT_REF» — a `/legacy/*` route
// that came back with different auth after a route reorg.
const NEVER_CACHE = ['/admin', '/settings/*', '/legacy/beat-manager', '/legacy/catalogs/*'];
```

Each of these blocks reads exactly as long as it is because the deletion cost is now measurable — the reader has to look at what the comment says, see the incident reference, and decide whether the incident no longer applies. That's the whole mechanism.

## What the naive fix still gets wrong

**1. The rationale block is not a summary of the code.** A comment that *restates* the code in prose form is worse than no comment — it lulls the reader into thinking they've read the reasoning. If you can turn the comment off and the code still teaches the reader *why*, delete the comment. If you can't, don't paraphrase — cite `«INCIDENT_REF»`.

**2. Rationale rots too — but slower, and audibly.** A rationale block that says "we do this because of the Q2 2025 incident" survives longer than a restatement, but at some point the code moves to a different framework where the constraint no longer applies, and now the comment is a lie. The rule is: **when you touch the guarded code, re-read the rationale block; if the incident no longer applies, delete the block and the guard together in one commit** — not just the block, and not just the guard. Silent removal of either is what this skill exists to prevent.

**3. Not every comment is rationale.** A jsdoc block on a public function, a TODO with a linked issue, a `@ts-expect-error` with an inline reason — these are their own patterns. The rationale block is specifically for **operational code where the shape is not obvious**: CI conditions, cron schedules, security constants, deny-lists, framework overrides. If the code is obvious, the comment is noise; if the code is non-obvious, the comment is load-bearing. Don't split the difference with a jsdoc-style hedge on regular business logic.

**4. Rationale in commit messages does not count.** A commit message is scoped to a diff and disappears from the reader's field of vision the moment the file scrolls; a comment stays adjacent to the code forever. If the "why" is only in the commit, the next agent that reads the file has no path to it — and they *will* delete the guard.

## The proof obligation

**The deletion test:** for any comment you are considering deleting from a rationale-suspect location (CI file, cron, override, deny-list, security constant), open the file's git blame and answer three questions before pressing delete:

```bash
git log --all --source -S "<the comment's most distinctive phrase>" -- "$FILE"
# ↑ Was this comment ever removed and re-added? If yes, it earned its place.

git blame -L "<line>,<line>" "$FILE"
# ↑ When was the comment last touched? A comment older than the surrounding
#   code has usually survived at least one refactor for a reason.

grep -rn "<the constant / path / flag the comment protects>" src/
# ↑ Does the code the comment references still exist? If yes, the comment
#   still applies. If no, you may be deleting a scar whose wound has healed —
#   delete the CODE too, not just the comment.
```

If any of the three answers is "I don't know," the comment stays. This is a **falsification test** in the sense of `SKILL_TESTS_THAT_CANNOT_FAIL.md`: the delete is safe only when you have *actively demonstrated* the rationale no longer applies, not merely failed to notice a reason it does.

For a comment you are considering *writing*: apply the "delete the code, keep the comment" test — if the comment would tell a reader who has never seen this code what it *does*, it is a restatement and belongs in the identifier's name, not in prose. A rationale comment is one you could paste above a *different* implementation of the same invariant and it would still make sense.

## Checklist

- [ ] Any conditional in `«CI_FILE»` (`if:`, `on:`, `concurrency:`) has a rationale block above it naming the invariant + the alternative + `«INCIDENT_REF»`.
- [ ] Every framework-defaults override in the diff carries an inline comment naming the incident that requires it.
- [ ] Every deny-list / allow-list / forbidden-tokens list carries a docblock explaining the shrink-only rule (or the growth-only rule) and what a removal would break.
- [ ] No comment in the diff is a paraphrase of the code it sits above.
- [ ] No comment removed by the diff was adjacent to a conditional, a cron, an override, or a deny-list without the deletion test above being run and recorded.
- [ ] If the code the comment protects was also deleted, they were deleted **in the same commit** — not the comment first and the code "later".
- [ ] Rationale that only lives in the commit message is copied into a code comment before merge.

## Related

- Incident / plan: «INCIDENT_REF»
- The sibling rule that a guard can actually fail: [[tests-that-cannot-fail]] — `SKILL_TESTS_THAT_CANNOT_FAIL.md`
- Why every framework-default override is a scar: [[framework-defaults-are-permissive]] — `SKILL_FRAMEWORK_DEFAULTS_ARE_PERMISSIVE.md`
- The release-topology invariant most `«CI_FILE»` guards implement: `RUNBOOK_RELEASE_MANAGER.md`
- The standards doc this skill sits alongside: `MANAGER_ENGINEERING_STANDARDS.md`
