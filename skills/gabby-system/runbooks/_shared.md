# Shared steps

Referenced by every runbook. Do not skip.

## S1 — Intake (before reading anything else)

1. If you arrived through `gabby agent`, the verified project context is already in that brief; otherwise run `gabby context` and read all of it. It is `[verified]` fact: mode, git state, toolchain and scripts, existing instruction files, the `docs/ai` inventory, the manifest, vendored skills, what the global system offers.
2. Read `~/.agents/GLOBAL.md` (the owner's constitution) and the global `MEMORY.md` / `NOTES.md` (included in the `gabby agent` brief) — cross-project facts and gotchas that often answer questions you would otherwise ask.
3. Pull the specification sections the runbook cites with `gabby spec <n>` (e.g. `gabby spec 22.3`; `gabby spec --toc` lists them) and read them in full. Do not act from memory of a previous project.
4. Declare the mode in the chat before any write:

```text
Detected mode: <MODE>
Evidence:      <from gabby context, verified against the tree>
Consequence:   <what will and will not be modified>
```

## S2 — Asking the owner

- Derive first, ask second. Present derived facts as a confirmation table with `[verified]` / `[inferred]` / `[unconfirmed]` tags; the owner corrects rather than dictates.
- Ask only what the repository and the global system cannot answer. Number questions; give lettered options so the owner can answer `1A, 2C`. Group by topic. Up to 50 across the whole run, usually far fewer.
- Never resolve a product decision, a prohibition, a sanctioned-pattern choice, or a Git question yourself.
- The owner's answers are `[owner: <date>]` facts; record them where they belong (MEMORY.md, ENGINEERING.md, SYSTEM.md -> customizations), not only in chat.

## S2b — The rules decision (INIT and ADOPT; revisit in UPGRADE if never recorded)

The global layer has rules (`gabby list`, or `~/.agents/rules/*.md`; their descriptions are in the `gabby agent` brief). For each global rule ask the owner one question with three options — and ask the same for any category the owner cares about that has no global rule yet (security, testing, git, coding style, performance, patterns, naming, ...):

```text
A. Adopt as-is        -> ENGINEERING.md "Global rules in force" row: POINTER to ~/.agents/rules/<name>.md. Never copy its body.
B. Override here      -> same table row marked "overridden" + the project statement in the relevant ENGINEERING.md section;
                         RULES.md entry with canonical home = the project file, "overrides ~/.agents/rules/<name>.md".
C. Not applicable     -> table row "not applicable" with the reason (so an upgrade does not re-ask).
Project-only rule     -> its own ENGINEERING.md/CONSTITUTION.md statement + RULES.md entry, origin owner.
```

Adopted rules update themselves when the owner edits the global file (they are pointers). Overrides stay until the owner amends them in this project. Record the answers as `[owner: <date>]`.

Two more, in the same batch:

- **Caveman for this project:** A inherit the global default (`gabby caveman status` shows it) | B lite | C full | D ultra | E off -> `gabby caveman <x>` (writes `.caveman.json`; without the CLI write `{"defaultMode": "<x>"}` yourself). Record in `AGENT-CORE.md`.
- **Derived context docs:** A `MEMORY, NOTES, CHANGELOG` (default) | B `MEMORY` only | C off -> `SYSTEM.md` -> `context_docs`. When on, the derivation is a step of its own (S3b).

## S3 — Writing documents

- Start from the templates (`gabby template` lists them, `gabby template AGENT-CORE` prints one); keep the frontmatter contract; replace every `{{placeholder}}`; delete guidance comments and inapplicable headings. Never leave a placeholder in a written file.
- Content firewall: scaffolding is yours to write or improve; project knowledge (memory, handoff, notes, changelog, ADRs, plans, domains, the statements under ARCHITECTURE/ENGINEERING headings) is only ever added to or corrected with evidence — never regenerated.
- Every rule you introduce is registered in `RULES.md` in the same change. Every document is reachable from `INDEX.md`.
- No secrets, tokens, connection strings, or internal URLs in any document.
- **Write scope (RULE-SCOPE-001):** every file you create or change lives inside this repository. `~/.agents` and its symlinked views (`~/.claude/rules`, `~/.claude/skills`, `~/.gemini/config/skills`, ...) are read-only in every mode. `gabby new` inside a project scaffolds project-scoped files; never pass `--global`. Anything that belongs globally goes into the report as a proposal with the exact steps for the owner.

## S3b — Derived context docs (when `context_docs` is not empty)

After the sources exist: `gabby ctx init`, then for each configured doc run the `context-docs` skill (read the source in full -> write `docs/ai/context/<NAME>.md` in caveman-ultra register, every ID/path/version exact, nothing omitted -> self-check -> `gabby ctx stamp <NAME>`). `gabby ctx status` must be clean before S4. In ADOPT this is often the largest single token saving in the project; do it last, once the sources are final.

## S4 — Finishing

1. `gabby link` — entry points and adapters (report conflicts; migrate hand-written files, never overwrite).
2. `gabby stamp` (INIT / ADOPT / UPGRADE only) — records `gabby_version`, `global_system`, `prd_dir`, `vendored` in `SYSTEM.md`. Pass `--prd-dir` if the project keeps PRDs somewhere other than the default.
3. `gabby doctor --project` — must be clean (it includes `gabby ctx status`); paste its output into the report.
4. Report in the mode's format. End with: *No branch, stage, commit or history operation was performed. Ready for owner review and commit.* Then ask whether the owner wants a commit made — do not make one autonomously.
