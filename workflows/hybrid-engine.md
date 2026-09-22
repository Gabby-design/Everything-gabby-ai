# Workflow: Hybrid Multi-Engine Synergy and Handoffs

Operational procedures for coordinating multiple AI coding assistants (Google Antigravity, Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Windsurf) across shared codebases.

## 0. Multi-Engine Architecture

In a universal AI system, different AI engines excel at distinct tasks:
- **Claude Code**: Terminal-first agentic coding, deep architecture reasoning, refactoring.
- **Google Antigravity / Gemini**: Multimodal comprehension, browser verification, large context windows.
- **GitHub Copilot / Cursor**: Fast in-editor autocomplete, inline edits, interactive diff reviews.
- **Codex / ChatGPT**: Quick exploratory queries, script generation, conceptual ideation.

```text
[ Developer / Repository Owner ]
         |
         +----> [ Claude Code ] --------+
         |                              |
         +----> [ Google Antigravity ] -+---> [ .agents/handoffs/handoff.md ]
         |                              |     [ Global System ~/.agents/    ]
         +----> [ Copilot / Cursor ] ---+
```

## 1. Shared Invariants Across All Engines

Regardless of which assistant is currently active:
1. **Global Constitution**: The 8 Core Principles apply universally. No engine may violate them.
2. **Project Memory**: All engines read from `docs/ai/MEMORY.md` (or repo root `MEMORY.md`) as the canonical current position.
3. **Write Scope**: `~/.agents/` remains strictly read-only. Edits occur only within the repository.
4. **Git Safety**: No assistant stages, commits, or pushes autonomously without explicit owner direction.

## 2. Preparing an Inter-Engine Handoff

When transitioning work from one engine to another:
1. Conclude the active task cleanly or record exact pausing state.
2. Ensure working code compiles or tests pass, or explicitly document failing test in `HANDOFF.md`.
3. Update the inter-engine handoff artifact:
   - Target location: `.agents/handoffs/handoff.md` (or `docs/ai/HANDOFF.md`).
   - Content:
     - Outgoing engine name and session timestamp
     - In-flight feature or defect description
     - Exact modified files and pending diffs
     - Verified test results
     - Next concrete action required from the incoming engine
4. Do not leave unrecorded assumptions in volatile chat memory.

## 3. Resuming from a Handoff in a New Engine

When opening a repository in a new AI engine:
1. **Step 0**: Read `~/.agents/GLOBAL.md` for supreme constraints.
2. **Step 1**: Inspect `.agents/handoffs/handoff.md` (or `docs/ai/HANDOFF.md`) to acquire context on in-flight work.
3. **Step 2**: Inspect `MEMORY.md` to establish project architecture and technology constraints.
4. **Step 3**: Verify tests pass:
   ```bash
   npm test
   ```
5. **Step 4**: Announce resumption in chat:
   - "Resuming task [TASK_NAME] handed off from [ENGINE_NAME]."
   - "Proceeding with next step: [NEXT_STEP]."

## 4. Resolving Conflicts Between Engines

If two engines propose differing architectural directions:
1. Defer to the repository's `ARCHITECTURE.md` and `CONSTITUTION.md`.
2. If unresolved, present the two alternatives to the human owner with pros and cons.
3. Never silently overwrite one engine's deliberate design choice without human verification.
