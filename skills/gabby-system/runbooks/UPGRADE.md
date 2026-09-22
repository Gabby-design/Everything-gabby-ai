# UPGRADE — an existing system, older than the current gabby version

**Use when** `gabby context` says UPGRADE: `docs/ai/AGENT-CORE.md` exists and `SYSTEM.md` has no `gabby_version` or an older one. You do both halves: the deterministic one is `gabby link` (step 1 below); the rest is yours.

**Posture:** additive; nothing in memory, handoff, notes, changelog, ADRs, plans or domains is rewritten; protected customizations are never reverted; nothing is written before approval.

## Steps

1. **Intake and links** — `_shared.md` S1. Run `gabby link` now (idempotent: repairs entry points and refreshes any vendored copies; report conflicts, never overwrite). Then read the existing system fully: `SYSTEM.md` (BASE = `gabby_version`; `modules.pruned`; `customizations`), `RULES.md`, `AGENT-CORE.md`, `INDEX.md`, `WORKFLOW.md`, `VERIFICATION.md`, `workflows/INDEX.md`. If `SYSTEM.md` is missing, BASE is reconstructed — say so.
2. **State the guarantees** in chat before anything else.
3. **Compute the delta** — `THEIRS - BASE` applied to `MINE`:
   - From a legacy system (no `gabby_version`): start from the fixed table (Global system section + startup step 0 in `AGENT-CORE.md`; `gabby_version`/`global_system`/`prd_dir`/`vendored` in `SYSTEM.md`; `RULE-CORE-004` in `RULES.md`; global workflows referenced in `workflows/INDEX.md`; Global row in `INDEX.md`; entry points via `gabby link`).
   - From an older gabby version: the deltas listed in `~/.agents/CHANGELOG.md` between that version and this one.
   - If `ENGINEERING.md` has no "Global rules in force" table, add delta and, on approval, run the rules decision (`_shared.md` S2b) — the only questions an upgrade asks.
   - If `AGENT-CORE.md` has no Output style / Derived context docs sections and `SYSTEM.md` no `context_docs`, add deltas for caveman section + `.caveman.json` and context docs: `context_docs`, `INDEX` Derived, `WORKFLOW`, `VERIFICATION` checklist line, `RULE-DOC-011`, then S3b. Default: accept; the owner may choose `context_docs: []`.
   - Then the three-way comparison against current templates for anything else: `MISSING_SECTION`, `CHANGED_DEFAULT_CLEAN`, `CHANGED_DEFAULT_CUSTOMIZED` (conflict — show both texts verbatim), `PRUNED_AND_STILL_VALID` (no action), `PRUNED_BUT_NOW_APPLICABLE`, `DEPRECATED_IN_SPEC` (keep), `PROJECT_ONLY` (keep + register as customization), `STRUCTURAL_DRIFT`, `CONTENT_STALE` (route to AUDIT, do not fix here).
   - Consult `modules.pruned` before proposing any absent module; a pruning that says "no PRD process" is replaced by the global `create-prd` reference.
4. **STOP — the dry-run table**: one row per delta — ID | class | target | change | risk | approval. Batch low-risk rows; never batch a conflict. Ask: accept all / all except ... / only ... / defer ... / reject .... Wait.
5. **Execute in the prescribed order**: new files -> additive sections in existing scaffolding -> approved default updates on clean scaffolding -> moves/renames -> **reference sweep** (INDEX, cross-links, adapters, frontmatter `hosts_rules`/`mirrors_rules`, CI paths) -> register new rules in `RULES.md` -> register preserved project-only items as customizations -> record deferrals/rejections as pruned-with-reason.
6. **Append `docs/ai/UPGRADES.md`** (create on first upgrade; newest first): base, mode, deltas proposed/applied/declined/routed, files touched, Git line.
7. **`SYSTEM.md` last**: `last_upgraded_at`, `mode_history` entry, updated module lists and customizations; `gabby_version` updated. Then `gabby stamp` (it writes `gabby_version`, `global_system`, `prd_dir`, `vendored`; pass `--prd-dir` with the project's **existing** PRD location — never move a PRD).
8. **Finish** — `gabby doctor --project` must be clean -> UPGRADE report: version transition | deltas proposed/applied/declined/deferred/routed | scaffolding changed | content touched (should be none) | customizations verified intact | conflicts and who resolved them | modules now absent | outstanding | Git line.

Idempotence check: if the owner runs `gabby upgrade` again immediately, the correct result is "system is current; no deltas".
