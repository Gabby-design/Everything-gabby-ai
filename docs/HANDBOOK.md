# Universal AI Agent System — Comprehensive Handbook

This handbook provides the complete architectural reference for the universal multi-agent engineering system.

---

## 1. The Two-Layer Architecture

The system divides operational knowledge into two distinct layers:

```text
GLOBAL LAYER   (~/.agents)              Developer defaults across all projects and assistants
PROJECT LAYER  (<repo>/docs/ai)          Repository-specific architecture, memory, and rules
```

### Precedence and Resolution Hierarchy
When a rule, convention, or instruction conflicts:
1. **The project layer strictly wins**. The global layer fills gaps where the project is silent.
2. In a project's source-of-truth hierarchy, global rules sit at level 6a:
   - Level 1: Active task plan (`docs/ai/plans/active/`)
   - Level 2: Product Requirements Document (`docs/ai/prd/`)
   - Level 3: Durable Architecture Decision Records (`docs/ai/decisions/`)
   - Level 4: Current project state (`MEMORY.md`)
   - Level 5: Project engineering rules (`docs/ai/ENGINEERING.md`)
   - Level 6: Global Constitution and universal rules (`~/.agents/GLOBAL.md`)
   - Level 7: Observations and history (`docs/ai/NOTES.md`, `CHANGELOG.md`)

---

## 2. Core Components and Invariants

### 2.1 Global Constitution (`GLOBAL.md`)
- Enforces the 8 Core Principles and non-negotiables.
- Read by every assistant at session initialization.
- Changes made here propagate instantly across all assistants reading the path.

### 2.2 Reusable Skills and Workflows
- Procedures and domain knowledge stored in `skills/<name>/SKILL.md`.
- Shared standard across Claude Code, Gemini CLI, Google Antigravity, Copilot, and Codex.
- Multi-step engineering procedures reside in `workflows/<name>.md`.

### 2.3 Specialist Agent Personas
- Role definitions in `agents/<name>.md` (`architect`, `planner`, `code-reviewer`, `security-reviewer`, `tdd-guide`, etc.).
- Defines specific capabilities, tool authorizations, and prompting focus.

### 2.4 Universal Rules and Scopes
- Always-on constraints in `rules/<name>.md`.
- Project overrides are registered in `docs/ai/RULES.md` and declared in `docs/ai/ENGINEERING.md`.
- **Scope Rule (RULE-SCOPE-001)**: An assistant operates only within the workspace repository it was opened in. The global `~/.agents` directory is strictly read-only during project sessions.

### 2.5 State and Knowledge Separation
- **`MEMORY.md`**: Captures *current state* only (position, architecture, config). Never used as a chronological diary.
- **`HANDOFF.md`**: Captures *work in flight* across sessions or assistant transitions. Cleared when work completes.
- **`NOTES.md`**: Captures *gotchas, investigation observations, and deliberate non-fixes*. Prefixed with `N-###` (project) or `G-###` (global).
- **`CHANGELOG.md`**: Captures *historical record of changes*.

---

## 3. Output Style: Caveman Register

The system supports high-density, concise communication using the caveman register:
- **Philosophy**: Strips conversational filler, hedging, and pleasantries while keeping code identifiers, error logs, and technical facts completely exact.
- **Levels**:
  - `off`: Standard conversational sentences.
  - `lite`: Removes conversational fluff; maintains standard grammar.
  - `full`: Conversational fragments; eliminates articles, filler, and hedging.
  - `ultra`: Extreme compression; telegram style, keywords and facts only.
- **Strict Boundaries**:
  - NEVER use caveman style in source code, comments, commit messages, PR descriptions, or persistent documentation.
  - Full, complete sentences are mandatory for security warnings and destructive action confirmations.

---

## 4. Derived Context Docs Engine

Large projects can consume excessive tokens repeatedly loading full memory and changelog files.
- **Engine**: The system generates compressed, agent-facing copies in `docs/ai/context/<NAME>.md` using the ultra register.
- **Integrity**: Each derived file records the SHA-256 hash of its source document in its YAML frontmatter.
- **Validation**: `gabby ctx status` verifies whether derived files are `current`, `stale`, or `missing`.
- **Rule**: If a source document changes, the derived copy is stamped and updated. A stale derived file blocks session completion.

---

## 5. The Project Lifecycle and Execution Flow

```text
New or Existing Repo
  |
  +---> Agent Prompt: "Set up this project's AI system"
  |        |
  |        +---> gabby agent (generates brief: context + runbook + templates)
  |        +---> Reverse engineering / Owner intake
  |        +---> Writes docs/ai/ scaffolding
  |        +---> gabby link -> gabby stamp -> gabby doctor --project
  |        +---> Ready for owner review (no autonomous git commit)
  |
  +---> Daily Engineering Task
  |        |
  |        +---> Reads AGENT-CORE.md -> MEMORY.md -> HANDOFF.md
  |        +---> Executes feature-workflow, bugfix-workflow, or code-audit
  |        +---> Verifies all gates in VERIFICATION.md pass
  |        +---> Reconciles docs & clears HANDOFF.md
  |
  +---> Rule Amendment: "AMEND: [new rule]"
  |        |
  |        +---> Updates canonical home, registers in RULES.md, cascades to mirrors
  |
  +---> Health Check: gabby doctor --project
```

---

## 6. Action Cookbook

| Goal | Location | Procedure |
| :--- | :--- | :--- |
| **Override global rule in one project** | Project repo | Prompt agent: *"AMEND: In this project, [override rule]"*. Agent marks `ENGINEERING.md` row as overridden and registers in `RULES.md`. |
| **Add project-only rule** | Project repo | Add statement to `docs/ai/ENGINEERING.md` and register in `docs/ai/RULES.md`. |
| **Update global rule** | `~/.agents/rules/` | Open `everything-gabby`, update markdown rule, run `node scripts/sync-global.js`. |
| **Add a new skill or workflow** | `skills/` or `workflows/` | Create directory with `SKILL.md` or workflow file, verify tests pass, run `sync-global.js`. |
| **Check project health** | Any project repo | Run `gabby doctor --project` from terminal. |
| **Switch caveman register** | Any project repo | Run `gabby caveman <mode>` or set in `.caveman.json`. |
