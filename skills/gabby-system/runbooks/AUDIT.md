# AUDIT — drift detection, read-only

**Use when** no change is requested, or `gabby context` says AUDIT (system current). Report; fix only trivially safe structural repairs (dead link with an unambiguous target, an `INDEX.md` entry for a file that plainly exists, a symlink repair) and only say so.

## Steps

1. **Intake** — `_shared.md` S1; declare *"AUDIT — no changes without approval"*.
2. **Mechanical checks** — run what is deterministic before reasoning: `gabby doctor --project` (links, adapters, version); resolve every internal link in `docs/ai/`; confirm every path named in `MEMORY.md` and `ARCHITECTURE.md` exists; confirm every command in `VERIFICATION.md` exists in the package scripts (`gabby context` lists them); compare `INDEX.md` and `SYSTEM.md` module lists to the real tree; grep for duplicated rule statements; compare code markers (`gabby context` count; `git grep -n -E "TODO|FIXME|HACK"`) against `NOTES.md` coverage; compare `open_confirmations` with later documents; compare the working tree with `HANDOFF.md`'s claim.
3. **Assess each drift class**: structural | rule | state | lifecycle | history | specification (`gabby_version` older -> recommend UPGRADE; pruned module whose reason no longer holds -> recommend EXTEND) | manifest.
4. **Severity**: CRITICAL (will mislead an agent) | HIGH | MEDIUM | LOW.
5. **Report** as the table `| ID | Severity | Class | Finding | Evidence | Proposed fix | Safe to auto-apply |`, highest severity first, then the one-line summary (`Audit clean. 0 critical ...` or the counts). `NEEDS OWNER INPUT` is a valid outcome — never fabricate a fix.
6. Apply only the rows marked safe, list exactly what was touched, and end with the Git line. Anything touching project knowledge waits for the owner.
