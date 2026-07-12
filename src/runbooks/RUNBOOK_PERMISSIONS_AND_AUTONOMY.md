# Permissions & autonomy — the contract behind `settings.json`

> **Last updated:** «DATE»

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init RUNBOOK_PERMISSIONS_AND_AUTONOMY` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> Canonical copy — vendored at `docs/ai-product-builder/config/RUNBOOK_PERMISSIONS_AND_AUTONOMY.md` in every deployed repo (source of truth). Fill the `«placeholders»` below in place via `/ai-init`.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders». Reuse the STRUCTURE (governing policy → autonomy table → the deny-list and why each line is there → the `settings.local.json` prune ritual), then replace every «placeholder» with your repo's facts.
>
> **Pairs with:** [`SETTINGS_TEMPLATE.json`](./SETTINGS_TEMPLATE.json) — this doc is the *why*; that file is the *what*. JSON cannot carry comments, so **every rule in the deny-list is explained here, and nowhere else.** Change one, change the other, in the same commit.
>
> **Owns:** what the agent may do unattended in this repo, and the mechanism that enforces it.
> **Defers to:** [`../SECURITY_MODEL.md`](./SECURITY_MODEL.md) for the *product's* security posture (auth tiers, IDOR, webhook signing) and [`../SECRETS_ROTATION.md`](./SECRETS_ROTATION.md) for what to do once a secret has actually leaked. This doc is about the **agent's** blast radius, not the app's.
>
> **Local definitions to provide per repo:**
> - `«PKG_MGR»` — package-manager binary the agent may run freely (pnpm / npm / yarn)
> - `«RUNTIME_CLI»` — language runtime binary (node / python3 / go)
> - `«DB_CLI»` — database / CMS CLI, if the agent is allowed to touch a **local** DB (mongosh / psql / redis-cli)
> - `«DEPLOY_CLI»` — the deploy platform's CLI binary — the one whose `env` and `deploy` subcommands are **denied**
> - `«DOCS_DOMAIN»` — doc sites the agent may `WebFetch` without asking (one line per domain)
> - `«TRUNK»` — the protected branch the agent may never merge into

## The governing policy

**The agent may do everything local and everything draft-shaped. The human merges, deploys, and touches secrets.**

That single sentence generates the entire deny-list. It is not a statement about trust or capability — a competent agent can run `git merge` perfectly well. It is a statement about **reversibility**:

| The agent's side of the line | The human's side of the line |
|---|---|
| Anything a `git checkout` undoes | Anything with an audience |
| Anything confined to the working tree | Anything that reaches production |
| Anything a reviewer will see before it counts | Anything that touches a credential |
| Drafts: branches, commits, PRs, comments | The act of **merging** the draft |

Everything on the left is a mistake you can throw away. Everything on the right is a mistake you have to *announce*. The permission system exists to make the second category impossible to enter by accident — not to make the agent weaker, but to make its failures cheap.

The corollary is the part people skip: **because failure is cheap on the left, the agent should be given real freedom there.** A deny-list that is precise about the right-hand column earns the ability to be generous about the left. An agent that must ask permission to run the test suite is an agent whose permission prompts you will stop reading — and that is how the *dangerous* prompt gets approved on autopilot.

## Autonomy contract

Per area: what the agent does unattended, what it must ask about, and what is refused outright.

The last column is the honest one and it is the reason this table is worth writing. **This table records intent, not tested permission.** Most of it has never been exercised. A rule nobody has hit is a hypothesis about your own behaviour, and hypotheses are wrong at a rate that should worry you. Keep the column; fill it in as reality arrives.

| Area | Autonomous | Ask first | Refused (deny-list) | Never actually done ⚠️ |
|---|---|---|---|---|
| **Local edits** | Edit / write any source, test, doc under the repo | Deleting a whole directory; a rename touching more than «file-count threshold» files | — | — |
| **Version control** | branch, commit, `push` to a `«scope/*»` branch, open a PR, comment on a PR | `push` to `«TRUNK»`; rewriting a pushed branch's history | `git merge`, `git rebase`, `gh pr merge`, all three `--force` push spellings | Has the agent ever *hit* the `git merge` denial? If not, the rule is untested — you don't know it's spelled right |
| **Dependencies** | read the lockfile; run `«PKG_MGR» install` | adding **any** new dependency (→ an ADR, see `../DECISION_LOG.md`) | — | — |
| **Tests / build** | run tests, typecheck, lint, build — **freely, without asking** | — | — | — |
| **Local DB** | `«DB_CLI»` against a **local** instance; seed, reset, inspect | any command against a **remote** instance | — | Most repos never grant this; if `«DB_CLI»` is in your allow-list, say plainly whether it has ever run |
| **Secrets / env** | read + edit **`.env.example`** (the committed contract) | — | `Edit`/`Write` on every `.env*` variant that holds real values; `«DEPLOY_CLI» env add`/`rm`/`pull` | — |
| **Deploy** | read build logs; run the pre-deploy check | — | `«DEPLOY_CLI» deploy` / `promote` / `rollback` | — |
| **External calls** | `WebFetch` the allow-listed `«DOCS_DOMAIN»` list | any other domain | — | — |

*(One row per area. Delete rows that don't apply; do **not** delete the last column — an empty honesty column and an absent one look identical in a diff, and only one of them is a lie.)*

## The deny-list, line by line

JSON cannot carry comments, so this is where [`SETTINGS_TEMPLATE.json`](./SETTINGS_TEMPLATE.json) is explained. **A deny rule whose reason isn't written down gets deleted by the next person who finds it inconvenient.**

### Merge is a human act

```
Bash(git merge:*)      Bash(git rebase:*)      Bash(gh pr merge:*)
```

Not because the agent would merge *badly* — because merging is where a change stops being a proposal and starts being the truth. The whole value of the agent's output is that a human looked at it. An agent that can merge its own PR has removed the only step that made its work reviewable, and it will do so at 3am with a green CI run and a broken assumption.

`git rebase` is here for a different reason: it rewrites history that another machine may already have. Denying it costs the agent nothing (it can always branch and cherry-pick) and removes a whole class of "where did my commit go" incidents.

### Force-push has three spellings and you need all three

```
Bash(git push --force:*)   Bash(git push -f:*)   Bash(git push --force-with-lease:*)
```

Deny-lists are string matches. `--force` and `-f` are the same act with different letters, and a rule that catches only the first is decoration. `--force-with-lease` is the interesting one: it is *the safe force-push*, and it is denied anyway — because "safe" here means "won't clobber a fetch you've seen", which is a guarantee about the **agent's** view of the remote, not about whether you wanted that history gone.

> **This is the general lesson.** Every deny rule is a string, and every dangerous command has synonyms. Write down the synonyms. When you add a rule, spend thirty seconds asking *"what else spells this?"* — that question is most of what separates a real control plane from a comforting one.

### Secrets: the agent never reads what it cannot un-read

```
Edit(**/.env)  Edit(**/.env.local)  Edit(**/.env.production)  …  (and Write on each)
«DEPLOY_CLI» env add / rm / pull
```

Every `.env*` variant that holds real values, on both `Edit` and `Write` — an agent that can write a file can also *truncate* one, and a helpfully-rewritten `.env.local` is a founder's afternoon.

`«DEPLOY_CLI» env pull` is the rule people forget, and it's the one that matters most: it isn't a *write*, it's a **read** — it materialises production secrets onto local disk, inside the working tree, where the next `git add -A` finds them. A pulled secret is a leaked secret with a delay.

**`.env.example` is deliberately NOT denied.** It is the committed contract — frozen keys, safe defaults, no values — and the agent *should* be updating it whenever it adds a required variable. If you deny it, the env contract goes stale, which is a worse security outcome than the one you were guarding against.

**Optional tightening:** add `Read(**/.env*)` to deny. This stops a secret from ever entering the model's context — genuinely stronger. It also breaks every "why is this failing locally?" debugging loop, because the agent can no longer see that `«ENV_VAR»` is unset. Take the trade deliberately, and if you take it, write here that you took it and why. It is not the default in this template because a rule that gets removed in frustration next Tuesday is not a control.

### Deploy is a human act, for the same reason merge is

```
«DEPLOY_CLI» deploy / promote / rollback
```

Deploying is publishing. `rollback` is denied too, which surprises people — but a rollback is a deploy, it has an audience, and the moment you're rolling back is exactly the moment you want a human in the loop rather than an agent optimising for a green health check.

### `deny` beats `allow` — that's what makes `Bash(git:*)` safe

The allow-list contains `Bash(git:*)` — *all* of git — and the deny-list carves `merge` / `rebase` / force-push out of it. **This only works because deny is evaluated first.** It is the pattern that makes the whole file readable: allow the tool broadly, then subtract the handful of verbs that are irreversible. Invert it (enumerate every safe git subcommand) and you get a list nobody maintains, which fails open the first time someone needs `git stash`.

## `settings.local.json` is a landfill, and it is silently re-opening your deny-list

`settings.json` is **curated** and committed. `settings.local.json` is **auto-accreted** and gitignored: every time you click "yes, and don't ask again" on a permission prompt, a line lands in it. Nobody writes that file. Nobody reads it. It just grows.

Here is what a real one looks like after a few months of ordinary work — this is the actual failure mode, not a hypothetical:

```jsonc
"Bash(grep *)",                       // ← a WILDCARD. Not `grep:*` — `grep *`.
"Bash(rm /path/to/some/file.tsx …)",  // a one-off delete, frozen forever
"Bash(sed -i '' 's/3 minutes/5 minutes/g' src/messages/en.json)",
"Bash(perl -0pi -e \"s/…//g\" src/…/section-faq.spec.tsx)",
"Read(//Users/«you»/**)",             // ← your ENTIRE HOME DIRECTORY
"Bash(tee /tmp/e2e-final6.log)",      // …and final5, final4, final3, final2
```

Three things are wrong here, and they get worse in order:

1. **The one-offs are dead weight.** `tee /tmp/e2e-final6.log` was true for ninety seconds in April. It is now permanent, and it is the reason the file is 200 lines nobody will ever audit. Volume is not harmless: **an unreadable allow-list is an unreviewable one.**

2. **In-place editors got granted.** `sed -i`, `perl -pi`, `rm` — each approved once, for one file, in one context. The grant does not remember the context. These are the tools that modify files *without* going through `Edit`, which means they are also the tools that route **around** every `Edit(**/.env*)` rule in your deny-list. You spent a careful afternoon denying `Edit` on `.env.local` and then approved `sed -i` in a hurry.

3. **The wildcards re-open everything.** `Bash(grep *)` and `Read(//Users/«you»/**)` are not commands, they are *categories*. That `Read` grant covers every repo on the machine, every SSH key, every other project's `.env.local` — a scope no one would ever approve if it were phrased as a question. But it wasn't phrased as a question. It was phrased as *"allow this?"* about one specific `grep`, at the end of a long debugging session, and the harness generalised.

**The curated deny-list is closing a door that the accreted allow-list is quietly propping open.** These two files are in an argument with each other, and only one of them is being read by a human.

### The prune ritual

Do this **monthly**, or after any long debugging session — it takes five minutes:

```bash
# 1. Look at it. That is 90% of the ritual; nobody has ever looked.
cat .claude/settings.local.json

# 2. Nuke it. It is gitignored, it is regenerable, it is not precious.
rm .claude/settings.local.json

# 3. Anything you find yourself re-approving three times is a real workflow.
#    Promote it — deliberately, with a reason — into the committed settings.json.
```

**The rule: `settings.json` is curated and grows slowly. `settings.local.json` is disposable and gets deleted.** If deleting it hurts, something in there was load-bearing and belongs in the committed file, where a reviewer can see it.

Two things to grep for before you delete it, because they are the ones you actually need to know about:

```bash
# wildcards that re-open a category
grep -E '\*\)|\*\*' .claude/settings.local.json

# tools that write to files without going through Edit/Write
grep -E 'sed -i|perl -.*i|\brm\b|tee|>' .claude/settings.local.json
```

If either returns a hit, **that hit is your deny-list's actual state** — not what `settings.json` says.

## Honest limits of this control plane

State these plainly; a security doc that oversells is worse than none.

- **This is the only enforcement layer here.** There are no hooks, no wrapper scripts, no CI check on the agent's behaviour. If a command isn't in `deny`, nothing stops it. Do not describe this as "sandboxed".
- **It is a string match, not a semantic one.** `Bash(git merge:*)` does not stop `Bash(git-merge)`, a shell alias, a `Makefile` target that merges, or `bash -c 'git merge'` — and `bash -c:*` is in the allow-list. Sit with that one for a second, then decide whether you want it there.
- **It constrains the agent, not an attacker.** Prompt injection through fetched content aims at exactly these boundaries. The allow-list is a productivity tool with a safety edge; it is not a threat model. `../SECURITY_MODEL.md` is the threat model.
- **Denials are untested until they fire.** Every rule in the deny-list is a claim about a string you have probably never typed. Once — deliberately — try to make the agent run a denied command, and confirm it is actually stopped. A control plane nobody has ever seen *work* is a belief, not a control.
