# AMEND — a new or changed rule, cascaded everywhere

**Use when** the owner states how agents should operate ("from now on...", "the new workflow is...", "stop doing X; do Y", "whenever you update X also update Y"). Product behaviour changes are features, not amendments; if a request contains both, the amendment lands first.

**Principle:** a rule changed in prose but not in the checklist, gate, template or report format that operationalises it has not been changed.

## Steps

1. **Intake** — `_shared.md` S1. Read `RULES.md` first.
2. **Normalize**: ACTOR | TRIGGER | OBLIGATION | EXCEPTION | PROOF. **STOP** and restate it to the owner if any part is underdetermined; default exception is "none" — never invent a carve-out. Decide the scope — ask if unclear:
   - **Every project** -> the canonical home would be `~/.agents/rules/<name>.md` or `GLOBAL.md` — **which you do not edit from here (RULE-SCOPE-001)**. Do two things: (a) apply the rule to *this* project now as an override/new rule below, so the owner's intent is in force here; (b) end the report with *"To make this global: open `~/.agents` and say: AMEND ..."* (or the exact `gabby new rule` / edit). Projects that *adopted* the rule as a pointer will follow the global change once the owner makes it there.
   - **This project only — overriding a global rule** -> the home is `ENGINEERING.md` (or `WORKFLOW.md`/`VERIFICATION.md` by class): mark the "Global rules in force" row `overridden`, write the project statement, register in `RULES.md` as `overrides ~/.agents/rules/<name>.md`, cascade.
   - **This project only — new rule** -> home per standard classification, registered with origin owner.
3. **Classify and resolve the canonical home**. Two homes = two rules; split.
4. **Build the cascade target list**: registry lookup -> vocabulary sweep of `docs/ai/` + root entry points + `.agents/` + `.github/` with the OLD rule's words -> the structural checklist (canonical statement, AGENT-CORE digest, startup protocol, state machine, per-classification gates, completion sequence, reconciliation matrix, verification, report format, plan/handoff/ADR/changelog templates, domain docs, INDEX, adapters, CI/hooks, CONSTITUTION, SYSTEM customizations). Report the swept set and the hit set.
5. **Conflicts**: against an ADR, a constitution clause, or a protected customization -> **STOP**, show the exact incompatibility, offer supersede / narrow / reject. Enter `BLOCKED — amendment conflicts with fixed decision` until resolved.
6. **STOP — present the traceability table** (file | change | why in scope) and the effective date (forward-only). Wait.
7. **Execute**: amend the canonical home (mark the old statement superseded, don't delete silently) -> update `RULES.md` in the same change (ID, statement, status, origin `AMD-nnn`, effective, supersedes, mirrors) -> update every mirror as a *reference* -> update executable artifacts -> integrate into the state machine and its failure states -> integrate the proof surface into `VERIFICATION.md` -> **orphan check** with the old vocabulary -> append `docs/ai/AMENDMENTS.md` (create on first) -> `SYSTEM.md`: `last_amended_at`, `mode_history`, customizations.
8. **Retroactive alignment** the owner wants (backfilling existing artifacts) is a separate plan in `plans/active/`, not part of this amendment.
9. **Finish** — `gabby doctor --project` -> AMEND report -> Git line.
