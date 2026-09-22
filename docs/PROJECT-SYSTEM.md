# Project System — Repository-Native AI Architecture

Every project managed by this system carries a repository-native AI operating system (`docs/ai/`). This structure ensures that any coding assistant can open the project, read the entry points, and immediately operate with complete contextual awareness without relying on volatile conversation history.

## 1. Directory Layout

```text
<repository-root>/
├── AGENTS.md · CLAUDE.md · GEMINI.md · .github/copilot-instructions.md -> symlinks to docs/ai/AGENT-CORE.md
├── .agents/rules/00-agent-core.md                                      -> Antigravity workspace rules pointer
├── .agents/skills/, .agents/rules/                                     -> vendored assets (via gabby vendor)
├── MEMORY.md                                                           -> project current state (never a diary)
├── CHANGELOG.md                                                        -> project history
└── docs/ai/
    ├── AGENT-CORE.md                                                   -> canonical instruction file
    ├── INDEX.md                                                        -> repository documentation map
    ├── SYSTEM.md                                                       -> system manifest & metadata
    ├── RULES.md                                                        -> rules registry: canonical homes & mirrors
    ├── CONSTITUTION.md                                                 -> project invariants & non-negotiables
    ├── WORKFLOW.md                                                     -> task state machine & execution gates
    ├── VERIFICATION.md                                                 -> real test, lint, and build commands
    ├── ARCHITECTURE.md                                                 -> system architecture and boundaries
    ├── ENGINEERING.md                                                  -> patterns, standards, and rule overrides
    ├── HANDOFF.md                                                      -> active task baton & in-flight state
    ├── NOTES.md                                                        -> project gotchas (N-###) and non-fixes
    ├── prd/                                                            -> product requirement documents
    ├── decisions/                                                      -> architectural decision records (ADRs)
    ├── plans/                                                          -> active and completed implementation plans
    ├── domains/                                                        -> deep-dive technical domain guides
    ├── workflows/                                                      -> project-specific reusable workflows
    ├── context/                                                        -> derived token-efficient context copies
    └── archive/                                                        -> superseded documents (never deleted)
```

## 2. Project Lifecycle Modes

The system operates in six distinct lifecycle modes:

| Mode | Trigger Condition | Objective |
| :--- | :--- | :--- |
| **INIT** | Greenfield project (empty repository, no existing code) | Scaffolds initial Tier 0 and Tier 1 documents from owner intake. |
| **ADOPT** | Existing codebase without coherent AI system | Mines existing instruction files, reverse engineers code, creates confirmation tables. |
| **UPGRADE** | Existing system on older `gabby_version` | Computes delta table, requests owner approval, updates scaffolding additively. |
| **AUDIT** | Established system requiring health check | Detects drift across links, rules, verification commands, and state documents. |
| **AMEND** | Owner specifies new or altered engineering rule | Normalizes rule, updates canonical home, cascades to mirrors and gates. |
| **EXTEND** | Owner requests previously pruned module | Verifies need, scaffolds module from template, registers in index. |

## 3. Collaboration Between CLI and Agent

The CLI and the AI agent divide responsibilities according to their strengths:
- **CLI (`gabby`)**: Handles deterministic, mechanical operations (symlink verification, path detection, dependency analysis, integrity stamping).
- **Agent**: Handles cognitive, analytical tasks (reverse-engineering source code, interviewing the owner, drafting PRDs and architecture specifications).

When an agent is asked to *"set up / upgrade / audit this project's AI system"*:
1. The agent invokes `gabby agent [MODE]`.
2. The command outputs a complete execution brief containing project context, intake rules, the mode runbook, and available templates.
3. The agent executes the runbook steps, halting at required owner confirmation gates.
4. After writing documents, the agent runs `gabby link` and `gabby stamp`.
5. The agent verifies health via `gabby doctor --project` and reports completion without touching Git.

## 4. Source-of-Truth Precedence

When an agent resolves instructions, the hierarchy is strictly ordered:
1. Active plan in `docs/ai/plans/active/`
2. Active PRD in `docs/ai/prd/`
3. Durable Architectural Decision Records in `docs/ai/decisions/`
4. Project current state in `MEMORY.md`
5. Project rules in `docs/ai/ENGINEERING.md` and `docs/ai/CONSTITUTION.md`
6. Global Constitution and rules in `~/.agents/GLOBAL.md` and `~/.agents/rules/`
7. Historical context in `CHANGELOG.md` and `docs/ai/NOTES.md`

Project definitions strictly override global rules on the same subject. Where the project is silent, global rules govern.
