---
name: context-docs
description: Regenerate a project's derived, agent-facing context docs (docs/ai/context/*.md - compressed copies of MEMORY.md, NOTES.md, CHANGELOG.md) from their human-canonical sources, then stamp them; also the read protocol - read the derived copy only when gabby ctx status says current. Use when a source changed, when gabby ctx/doctor reports stale or missing, or when asked to "regenerate context docs".
invocable: true
---

# context-docs - Derived Agent-Facing Context Documents

Two versions of the same knowledge:
1. **Source** (Human-Canonical): Edited and read by humans (`MEMORY.md`, `docs/ai/NOTES.md`, `CHANGELOG.md`). The source is authoritative and is never compressed or mutated by this skill.
2. **Derived** (Agent-Facing): Read by agents (`docs/ai/context/<NAME>.md`), formatted in the ultra-terse register so sessions cost significantly fewer tokens.

Which documents: `docs/ai/SYSTEM.md` -> `context_docs` (e.g. `[MEMORY, NOTES, CHANGELOG]`).

## Read Protocol (Every Session)

1. Check status via `gabby ctx status` (or compare `source_sha256` in derived frontmatter with file checksum).
2. If `current` -> Read the derived copy instead of the source to save context budget.
3. If `stale` or `missing` -> Read the canonical **source**, and regenerate the derived copy before concluding the task.
4. When source and derived disagree, the canonical source always wins.

## Regeneration Protocol

1. Read the source file completely.
2. Write `docs/ai/context/<NAME>.md` with frontmatter:
   ```yaml
   doc: context/<NAME>
   purpose: Agent-facing compressed copy of <SOURCE>; never edited by hand
   authority: derived
   source: <RELATIVE_PATH>
   source_sha256: null
   generated_at: null
   register: terse
   ```
3. Maintain all facts, IDs (`ADR-001`, `Q-01`), dates, versions, and paths verbatim while eliminating conversational filler.
4. Run `gabby ctx stamp <NAME>` to compute and record the source sha256 checksum into the frontmatter.
5. Verify that `gabby ctx status` reports `current`.

## First-Time Initialization

Run `gabby ctx init` to scaffold initial placeholders, then regenerate each from its respective source.
