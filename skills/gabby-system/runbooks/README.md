# Runbooks

`gabby agent [MODE]` prints the shared steps, the mode's runbook, the verified project context, the global memory/notes and the template list as one brief — that is the normal way to start. The files here are what it assembles.

One executable checklist per mode. Follow the runbook top to bottom; do not skip a numbered step; stop at every **STOP** for the owner.

| Runbook | Mode | Starts from |
| --- | --- | --- |
| [INIT.md](./INIT.md) | greenfield | `gabby init` |
| [ADOPT.md](./ADOPT.md) | existing code, no coherent system | `gabby init` |
| [UPGRADE.md](./UPGRADE.md) | existing system, older `gabby_version` | `gabby upgrade` |
| [AUDIT.md](./AUDIT.md) | check drift, change nothing | `gabby init` (detected) or "run an AUDIT" |
| [AMEND.md](./AMEND.md) | owner states a new/changed rule | "AMEND: ..." |
| [EXTEND.md](./EXTEND.md) | add a pruned module | "EXTEND: ..." |

Shared conventions: `gabby` is on the owner's PATH; if not, use `~/.agents/bin/gabby`. All `gabby` commands are safe to run (read-only or idempotent; none touches Git). Every runbook ends with `gabby stamp` (INIT/ADOPT/UPGRADE) or a report (AUDIT/AMEND/EXTEND), then `gabby doctor --project`.
