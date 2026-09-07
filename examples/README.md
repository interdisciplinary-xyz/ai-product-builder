# examples/

One filled document, so an adopter can read the template and the result side by side.

The library ships `«placeholders»` on purpose — an unfilled doc looks unfilled. The cost is
that nobody sees what "filled" is supposed to look like until they have done it once. This
directory is the answer to that, and it is deliberately small: one worked example beats five
half-finished ones.

| Example | Template it fills | Read it with |
|---|---|---|
| [`payload-app/CLAUDE.md`](payload-app/CLAUDE.md) | [`RUNBOOK_CLAUDE_MD.md`](../src/runbooks/RUNBOOK_CLAUDE_MD.md) | [`RUNBOOK_PAYLOAD_APP_TEMPLATE.md`](../src/runbooks/RUNBOOK_PAYLOAD_APP_TEMPLATE.md) |

**What is real and what is not.** The stack rows — versions, package manager, database,
directory shape — are measured from the five sibling repos actually running Next + React +
TypeScript + Payload. The project name, the domain list and the port are illustrative: no repo
called `acme-app` exists. Everything an adopter would copy is real; everything an adopter would
replace is obviously theirs to replace.
