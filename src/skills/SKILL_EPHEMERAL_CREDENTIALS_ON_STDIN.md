# Ephemeral credentials on stdin, never on argv

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_EPHEMERAL_CREDENTIALS_ON_STDIN.md`. **Additional install target:** `.claude/skills/ephemeral-credentials-on-stdin/SKILL.md`.
>
> **Reusability:** template-ready — the argv-leak rule + the `readline` recipe are portable verbatim; only `«CREATE_USER_CMD»` and the operator-facing script naming need swapping.
>
> **Pairs with:** `MANAGER_SECURITY.md` (secrets & configuration section) and `RUNBOOK_SECRETS_ROTATION.md` — boundary: this skill owns the **channel** a one-shot credential is provided through; the SECURITY / SECRETS docs own long-lived credential storage.
>
> **Owns / defers to:** Owns the argv-vs-stdin decision for any interactive-only credential (a first-user password on the break-glass path, an initial admin bootstrap PIN, a one-shot API key printed for the operator to paste). Defers **long-lived** credential storage → `.env.local` + `MANAGER_SECURITY.md`; **rotation cadence** → `RUNBOOK_SECRETS_ROTATION.md`; **when a break-glass account is warranted at all** → `RUNBOOK_SECURITY_MODEL.md`.
>
> **Local definitions to provide per repo:**
> - `«CREATE_USER_CMD»` — the CLI command that mints the break-glass / bootstrap account (e.g. `pnpm create:user --can-push`)
> - `«RUNTIME»` — the runtime the CLI script executes under (Node, Python, Bash) — used only to pick the recipe
> - `«INCIDENT_REF»` — how this repo cites the incident that motivated the rule

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: ephemeral-credentials-on-stdin
description: >-
  A password passed as a CLI argument is world-readable via `ps auxww` to every other
  process on the machine (`/proc/<pid>/cmdline` on Linux; PID-listing APIs on macOS
  and Windows). Shell history, the terminal recording, and the Docker `docker inspect`
  output preserve it further. The `--password xxx` flag on a one-shot bootstrap
  command is therefore a credential leak even when the value never touches disk
  («INCIDENT_REF»). Use when writing or reviewing any CLI that mints an admin, a
  break-glass user, a first-run API key; any script named `create:user`, `bootstrap`,
  `seed:admin`, `rotate-secret`, `generate-token`; any invocation documented in a
  runbook with a `--password` / `--pin` / `--secret` / `--token` flag; any test setup
  that shells out to the app with a credential in argv. Especially fire when the diff
  adds a new admin-minting command, or when the runbook says "run with your desired
  password as the argument" — that phrasing is the tell. Defer to `«MANAGER_SECURITY»`
  for long-lived credential storage (`.env.local` etc.); this skill owns only the
  one-shot interactive channel.
---
```

---

## The damage

A password on the command line is not "just briefly visible." On every mainstream operating system, the full argument vector of every running process is readable by any other process running as the same user — often by any process at all.

- **Linux:** `cat /proc/<pid>/cmdline` reads the full argv while the process lives, and `ps auxww` prints every argument for every process.
- **macOS:** `ps -eww` prints the full argv; the `libproc` `proc_pidinfo` API returns it programmatically.
- **Windows:** `Get-CimInstance Win32_Process | Select CommandLine` returns argv for every process.
- **Docker:** `docker inspect <container>` preserves the full command *forever* in the container manifest, whether or not the container is still running.
- **Shell history:** `~/.bash_history`, `~/.zsh_history`, PowerShell history — all record the argv verbatim by default.
- **Terminal recordings / screen sharing:** the argv is on-screen for however long the operator types the next command.
- **Process supervisors, journald, syslog, `dmesg`:** log spawned commands including argv on many default configurations.

None of the above is a bug. All of it is by design. Argv is *not* a secret channel — it is the *most public* channel a running process has.

**Blast radius.** The scenario that motivates this skill is a **break-glass command**: `«CREATE_USER_CMD»` mints the first admin account. It runs once, and the operator moves on. A second process on the same machine — a monitoring agent, a compromised extension, a co-located CI runner, a stray `htop` snapshot — captured the argv, and now owns the admin credential *forever*, because a bootstrap password is one nobody remembers to rotate. («INCIDENT_REF».)

The pattern is small. The consequence is the class of credential that has the highest privilege in the system.

## When to use

- Writing or editing any CLI that mints an admin, a service account, an initial API key, an OAuth client secret, an SSH key, an encryption key, a break-glass user.
- Any script under `scripts/` / `bin/` named `create:user`, `bootstrap`, `seed:admin`, `rotate-secret`, `generate-token`, `mint-*`.
- Any runbook step (`RUNBOOK_INCIDENTS.md`, `RUNBOOK_SECRETS_ROTATION.md`) that instructs an operator to invoke a command with a credential value.
- Any Docker `ENTRYPOINT` / `CMD` that expects a credential.
- Any CI job that shells out to the app with a credential (a supposedly-safe env-var-driven expansion still lands in argv if the script reads `$SECRET` and passes it as a positional).
- Reviewing a PR that adds `--password` / `--pin` / `--secret` / `--token` to a script's option set.
- Reviewing a PR that removes a stdin prompt because "argv is more scriptable."

## The trap

```ts
// ❌ Argv leak. Every other process on the box sees the password.
// scripts/create-user.ts — invoked as: pnpm create:user --email a@b --password hunter2
import { Command } from 'commander';
const program = new Command()
  .requiredOption('--email <email>')
  .requiredOption('--password <password>')     // ← the leaked field
  .parse();

const { email, password } = program.opts();
await mintUser({ email, password });
```

```bash
# ❌ Runbook line — the tell.
# RUNBOOK.md — "Mint the first admin account:"
«CREATE_USER_CMD» --email admin@«PROJECT».app --password 'ChooseSomethingLong'
#                                              ↑ now in shell history, ps, journald,
#                                                and the terminal recording forever
```

```yaml
# ❌ CI leak — argv still applies even when the value comes from an env var.
# .github/workflows/bootstrap.yml
- run: «CREATE_USER_CMD» --email admin@«PROJECT».app --password "$BOOTSTRAP_PW"
#                                                    ↑ the shell expands $BOOTSTRAP_PW
#                                                      into argv; the log line masks
#                                                      it but every co-tenant on the
#                                                      runner sees it via /proc.
```

The Docker variant:

```dockerfile
# ❌ Baked into the image manifest forever.
CMD ["«CREATE_USER_CMD»", "--email", "admin@example.com", "--password", "hunter2"]
```

## The fix — stdin, and only stdin

The credential arrives on stdin. Argv carries only the *intent*.

```ts
// ✅ Password read from stdin. Argv contains no secret.
// scripts/create-user.ts — invoked as: printf '%s\n' "$PW" | pnpm create:user --email a@b
import { Command } from 'commander';
import { createInterface } from 'node:readline';

const program = new Command()
  .requiredOption('--email <email>')
  .option('--can-push')                      // ← the intent flags stay on argv; those are fine
  .parse();

const { email, canPush } = program.opts();

async function readSecretFromStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    // Interactive: prompt with echo off. `readline` will not mask on its own —
    // use `process.stdin.setRawMode(true)` and consume bytes manually, or an
    // established prompt library that supports masked input.
    return await promptMasked('Password: ');
  }
  // Piped: read the whole stdin, strip a single trailing newline.
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '');
}

const password = await readSecretFromStdin();
if (!password || password.length < 12) {
  console.error('password must be at least 12 characters');
  process.exit(2);
}
await mintUser({ email, password, canPush });
```

```bash
# ✅ Runbook line — the credential never lands in shell history under this shape.
# RUNBOOK.md — "Mint the first admin account:"
printf '%s\n' 'ChooseSomethingLong' | «CREATE_USER_CMD» --email admin@«PROJECT».app --can-push
#                                                                                    ↑ intent
# Better: read from a file the operator deletes.
«CREATE_USER_CMD» --email admin@«PROJECT».app --can-push < /path/to/one-shot-pw.txt
# Better still: type it interactively when stdin is a TTY, no file involved at all.
«CREATE_USER_CMD» --email admin@«PROJECT».app --can-push
Password: •••••••••••••
```

```yaml
# ✅ CI variant — env var stays in the runner's env; argv stays clean.
- run: printf '%s' "$BOOTSTRAP_PW" | «CREATE_USER_CMD» --email admin@«PROJECT».app
  env:
    BOOTSTRAP_PW: ${{ secrets.BOOTSTRAP_PW }}
```

The rule is not "avoid `--password`." The rule is: **argv is for intent (which command, which target, which flags), stdin is for content (the value of the secret).** Intent is public. Content is not.

## What the naive fix still gets wrong

**1. `printf` vs `echo`.** `printf '%s\n' "$PW"` behaves consistently across shells. `echo "$PW"` will interpret backslash escapes in some shells (`dash -c`), silently corrupting a password that contains `\n` or `\t`. Prefer `printf`.

**2. Env-var reads still leak — through `/proc/<pid>/environ`.** A common "fix" is `--password "$PW"` → `PW="$PW" «CREATE_USER_CMD»` and reading `process.env.PW` inside the script. This is *better* — argv is clean — but the process's env is also readable at `/proc/<pid>/environ` on Linux while the process lives. For a **one-shot** credential this is fine (the process exits within milliseconds); for a long-lived process, prefer stdin. And never `export` the variable — a scoped `VAR=value command` invocation limits the leak window; an exported var lives for the shell session.

**3. Interactive prompts must not echo.** A "fix" that prompts `Enter password:` but echoes the keystrokes leaves the password on the terminal (visible to screen sharing, shoulder-surfing, terminal recording). Use `setRawMode(true)` and consume bytes without echo, or a library that supports masked input (`enquirer`, `inquirer.js` with `type: 'password'`, `prompt_toolkit` in Python).

**4. Never log the credential — including in "debug" mode.** `console.log({ email, password })` in a `--verbose` branch, `debug('creating user %o', opts)` in an npm-debug shim, an exception thrown with the credential in its message — every one of these turns the terminal, the log aggregator, and the CI artifact into a leak. Redact at the log boundary, not at the reader.

**5. Docker: `RUN --mount=type=secret` at build time; `--env-file` at runtime.** A Docker `CMD` or `ENTRYPOINT` with a credential is a permanent leak baked into the image manifest. For build-time secrets use BuildKit's `--mount=type=secret`; for runtime, mount the credential as a file (`--env-file` or a tmpfs mount) and read it inside the container. Do not pass credentials via `-e` on the Docker CLI either — the docker CLI's argv is itself visible to co-tenants of the docker daemon's host.

**6. The right test is not "the credential does not appear in the source" — it is "the credential does not appear in argv while the process runs."** See the proof obligation.

## The proof obligation

Run the command and capture `ps` from another shell **while** it runs:

```bash
# In shell 1
printf '%s\n' 'TestPassword123456' | «CREATE_USER_CMD» --email test@example.com &
CMDPID=$!

# In shell 2 (or the same shell, backgrounded)
ps -o pid,command -p $CMDPID
# On Linux, additionally:
cat /proc/$CMDPID/cmdline | tr '\0' ' '
# On macOS, additionally:
ps -eww -o command | grep «CREATE_USER_CMD»

wait $CMDPID
```

The output MUST contain the command name and its intent flags (`--email test@example.com`), and MUST NOT contain the string `TestPassword123456` in any form. If it does, the fix is incomplete — the credential is still being routed through argv somewhere in the chain (a wrapper script, a `sudo` invocation, a `nice`/`ionice` prefix, a `bun`/`node` shim).

Then run the same command via a runbook-shaped invocation and check shell history:

```bash
# Fresh terminal, so the history reset is clean
export HISTFILE=/tmp/skill-proof-history
export HISTFILESIZE=1000
export HISTSIZE=1000
# ...run the command as the runbook instructs...
history | tail -n 20 | grep -i 'password' && echo "LEAK" || echo "clean"
```

If the shell history contains the credential — even in an env-var assignment — the runbook needs a different invocation shape.

For a CI proof: run the CI job with a known test credential and grep the GitHub Actions log output for it. The masking that GHA applies to `${{ secrets.X }}` is best-effort; if the credential is routed through argv, `strace`-style logs can leak it past the mask.

Run each of these tests against the pre-fix code first and watch them fail (per `SKILL_TESTS_THAT_CANNOT_FAIL.md`). If they pass against the broken code, the test is not driving the argv leak — most commonly because the test is grep'ing the *script source* instead of the *running process*.

## Checklist

- [ ] No CLI option in the diff accepts a raw credential value (`--password X`, `--pin X`, `--secret X`, `--token X`, `--api-key X`).
- [ ] The credential is read from **stdin** (piped, redirected, or interactive) — never from argv, never from an `export`ed env var.
- [ ] Interactive prompts use masked input (`setRawMode`, `type: 'password'`, `prompt_toolkit.prompt(is_password=True)`).
- [ ] Runbook instructions use the `printf … | cmd`, `cmd < file`, or interactive-TTY form — never `cmd --password 'value'`.
- [ ] CI invocations pass the credential through scoped env vars, and the script reads it via `readSecretFromStdin` or an equivalent, not via `--password "$SECRET"`.
- [ ] Docker images do not bake credentials into `CMD` / `ENTRYPOINT`; runtime credentials come from `--env-file`, a tmpfs mount, or BuildKit secrets.
- [ ] The `ps` / `/proc/<pid>/cmdline` proof was run against the pre-fix code and produced the credential; then run against the fixed code and produced only the intent flags.
- [ ] `debug()` / `console.log()` / exception messages never carry the credential — redacted at the log boundary.
- [ ] Bootstrap credentials are rotated after the first use, and the rotation step is in the same runbook as the mint.

## Related

- Incident / plan: «INCIDENT_REF»
- The MANAGER that audits secret handling repo-wide: `MANAGER_SECURITY.md`
- Long-lived credential storage + rotation cadence: `RUNBOOK_SECRETS_ROTATION.md`
- The permission contract the agent operates under (the `denials` list) — this rule is the corollary for the operator when they are the human touching secrets: `RUNBOOK_PERMISSIONS_AND_AUTONOMY.md`
- Whether the argv-leak test above can actually fail: [[tests-that-cannot-fail]] — `SKILL_TESTS_THAT_CANNOT_FAIL.md`
