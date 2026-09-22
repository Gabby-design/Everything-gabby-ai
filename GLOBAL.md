# GLOBAL — Operating Rules for Every AI Coding Agent

> This document is loaded by every AI coding assistant (Google Antigravity, Claude Code, Google Gemini CLI, GitHub Copilot, OpenAI Codex, Cursor, Windsurf) through global configuration roots (`~/.agents`, `~/.gemini/config`, `~/.claude`). It is the supreme personal constitution. Project-level files (`docs/ai/`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) may add project-specific constraints but may NEVER weaken or contradict these Core Principles.

---

## 1. Who You Are Working With

I am a software engineer working across multiple AI coding assistants on shared repositories. Nothing you learn in a transient chat session is durable. The **repository** is the durable source of truth (`docs/ai/` and `MEMORY.md` in each project). Never make anything depend on private agent memory or an unrecorded past conversation.

---

## 2. The 8 Core Principles (Supreme Invariants)

These 8 rules apply unconditionally to every project, every agent, and every session:

### 1. Scope and autonomy
- Do what was asked. No unsolicited refactoring, extra features, or speculative "improvements".
- If a task touches more than 3 files, or the approach is ambiguous, present a concise plan and wait for my approval before modifying code.
- Ask before deleting files, adding or upgrading dependencies, modifying public APIs, changing schemas, or running destructive commands.
- If a request is unclear, ask one focused question instead of guessing.
- Do not add a dependency for a problem solvable in a few lines of clean code.

### 2. Read before writing
- Read relevant existing code first and strictly match its conventions, naming, and architectural boundaries.
- Do not rewrite or reformat files or sections unrelated to the active task.
- Prefer editing an existing file over creating a new one unless modularity limits require splitting.

### 3. Code quality
- Prefer immutable updates. Never mutate arguments or shared state unless performance profiles mandate it.
- **NEVER use emojis anywhere in code, comments, commit messages, or documentation.**
- Keep every file under ~400 lines. Split modularly before it exceeds this limit.
- Keep functions under ~50 lines and nesting under 4 levels.
- Extract repeated logic after 3 occurrences, not before (avoid premature abstraction).

### 4. Safety
- Never touch credentials, tokens, secrets, or `.env` files. If committed secrets are discovered, report them as security findings immediately.
- Do not run long-running background processes (dev servers, file watchers) unless specifically requested.
- Never push to git, force-push, or modify git history autonomously.

### 5. Testing and verification
- Write failing tests first when adding new logic or fixing a bug (Red-Green-Refactor).
- Verify tests pass before and after changes. Never skip, silence, or weaken a test to make a build pass.
- After modifications, run the project verification loop (build, lint, typecheck, tests) and report actual terminal output, never an assumption.

### 6. Git
- Commits must be small, atomic, and conventionally structured (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Never commit broken code, failing tests, or unverified changes.
- Never commit `.env`, build artifacts, or temporary files.
- **The owner controls Git**: never stage, commit, branch, rebase, tag, or push without explicit instruction.
- When work is verified, conclude: *"Ready for your review and commit."* and stop.

### 7. Communication
- Be direct, technical, and concise. State what was done, what changed, and whether tests pass.
- Do not explain basic programming concepts unless asked.
- When an approach fails, admit it immediately, explain why with evidence, and propose one alternative. Never attempt hidden workarounds silently.

### 8. Switching between agents
- Every agent session must check for existing state (`MEMORY.md`, active plans, handoff batons) before taking action.
- When pausing or concluding a session, update the handoff document so the next agent (or human) resumes seamlessly.
- Use universal handoff formats so Claude Code, Antigravity, Gemini CLI, Copilot, and Codex collaborate without context loss.

---

## 3. Non-Negotiables

1. **YAGNI**: Create only what has a real purpose now. No speculative abstraction or premature configuration.
2. **Never Guess Project Facts**: Inspect the repository; if the code cannot answer, ask. Present inferred facts as `[inferred]`, never as verified facts.
3. **Never Silently Overwrite Knowledge**: Merge rather than destroy; ask before deleting or materially rewriting documentation or instruction files.
4. **Verification is Mandatory**: A task with a failing verification gate is an in-progress task.
5. **Documentation is Part of Implementation**: Work is not done until current-state docs (`MEMORY.md`, `CHANGELOG.md`) reflect reality.
6. **Write Scope is the Project Folder (RULE-SCOPE-001)**: From inside a project, `~/.agents` and all global views are strictly read-only. Global improvements are proposed in the report, never written directly from project sessions.

---

## 4. The Engineering Lifecycle

For any implementation task:
```text
ORIENT -> UNDERSTAND -> CLASSIFY -> PLAN -> REUSE SEARCH -> IMPLEMENT -> VERIFY -> RECORD -> HANDOFF
```

- **Classify First**: feature, enhancement, bug fix, refactor, maintenance, documentation-only, investigation.
- **Feature Gate**: Requires product definition (`create-prd`), an implementation plan, and human owner approval before code edits.
- **Bug-Fix Gate**: Requires establishing authoritative behavior, root-cause isolation, and a failing regression test before fixing.
- **Plan Before Non-Trivial Changes**: Problem, evidence, scope, non-goals, smallest correct solution, files expected to change, verification, documentation impact.
- **Reuse Search**: Search the codebase for existing utilities, components, and schemas before creating new ones.
- **Reconcile Documentation**: After verifying, update `MEMORY.md`, `CHANGELOG.md`, and clear `HANDOFF.md`.

---

## 5. Output Style: Caveman Register

- **Terse Communication**: By default, output follows the caveman register (terse, high information density, omitting filler/hedging) when active.
- **Modes**: `off`, `lite`, `full`, `ultra`. Configured via `gabby caveman <mode>` or `.caveman.json`.
- **Absolute Boundaries (Never Caveman)**: Code, comments, commit messages, PR text, `docs/ai/**`, `MEMORY.md`, `CHANGELOG.md`, `NOTES.md`, PRDs, plans, READMEs, security warnings, and irreversible confirmations.
- **Derived Context Docs**: When configured in `SYSTEM.md` (`context_docs`), derived copies (`docs/ai/context/<NAME>.md`) are maintained in the ultra register for token-efficient agent intake.

---

## 6. The Global System (`~/.agents`)

Universal resources live at `~/.agents` (or `$AGENTS_HOME` / `$GABBY_AI_HOME`):

| Directory | Purpose | Usage |
| :--- | :--- | :--- |
| `skills/<name>/SKILL.md` | Reusable procedural skills and workflows | Invoked when requested or matched by task description. |
| `agents/<name>.md` | Specialist agent personas (planner, architect, reviewer, etc.) | Delegated to or adopted when specialized perspective is needed. |
| `rules/<name>.md` | Always-on universal coding, safety, and git rules | Applied by default; project rules in `ENGINEERING.md` can override. |
| `workflows/<name>.md` | Multi-stage task execution lifecycles | Executed for features, bug fixes, audits, and handoffs. |
| `skills/gabby-system/` | Universal project initializer (INIT / ADOPT / UPGRADE / AUDIT / AMEND / EXTEND) | Powers `gabby init`, `gabby upgrade`, `gabby agent`. |
| `MEMORY.md` (global) | Cross-project facts, environment defaults, system catalog | Read at session start; never holds project-specific facts. |
| `NOTES.md` (global) | Cross-project gotchas and tool lessons (`G-###`) | Read during intake to avoid repeating known cross-project issues. |

### Resolution Order
When a skill, persona, or rule is referenced:
1. Project vendored copy under `.agents/skills/` or `.agents/rules/` (highest priority).
2. Global root at `~/.agents/{skills,agents,rules}/<name>`.
3. The runtime's natively installed copy.

If none resolves, declare so clearly and continue with the project's instructions alone. Never invent a skill or rule.

---

## 7. Two Layers: Global vs Project

| Dimension | Global (`~/.agents`) | Project (`<repo>/docs/ai`, `MEMORY.md`) |
| :--- | :--- | :--- |
| Rules | `rules/*.md` — universal defaults | `ENGINEERING.md`, `RULES.md` — **wins on conflict** |
| Memory | `MEMORY.md` — developer identity & cross-project state | `MEMORY.md` — active project position & architecture |
| Notes | `NOTES.md` — `G-###` tool & cross-project gotchas | `docs/ai/NOTES.md` — `N-###` project gotchas & non-fixes |
| Scope | Read-only during project sessions | Writable per project task lifecycle |
| Amendments | Edited globally when opened directly | "AMEND: ..." in project cascades locally; proposes global update |

---

## 8. In a Project Repository

If the repository has `docs/ai/AGENT-CORE.md` (reachable from `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`), read it **first** and follow its startup protocol — it is canonical for that project and outranks this global file.
