# Global AI System - Master Index

This directory (~/.agents) serves as your universal personal root for all AI coding assistants.
Any assistant (Google Antigravity, Claude Code, Gemini CLI, Copilot, Cursor, Windsurf, Codex) can reference these resources.

## Global Constitution
See `GLOBAL.md` for the 8 Core Principles and supreme operating rules governing all agents.

## Directory Structure
- `GLOBAL.md`: Supreme operating rules and 8 Core Principles
- `agents/`: Specialized agent personas and role definitions
- `skills/`: Reusable procedural capabilities and workflows
- `rules/`: Coding standards, safety rules, and core principles
- `workflows/`: Multi-stage task execution lifecycles
- `contexts/`: Environment and task contexts
- `bin/`: CLI convenience wrappers

## Available Agent Personas
| Persona | Description |
|---|---|
| `architect` | ADR-001: Use Redis for Semantic Search Vector Storage |
| `build-error-resolver` | Build Error Resolver |
| `code-reviewer` | Documentation and guidance |
| `doc-updater` | Documentation & Codemap Specialist |
| `e2e-runner` | E2E Test Runner |
| `planner` | Implementation Plan: [Feature Name] |
| `refactor-cleaner` | Refactor & Dead Code Cleaner |
| `security-reviewer` | Security Reviewer |
| `tdd-guide` | Test should fail - we haven't implemented yet |
| `_template` | {{name}} Specialist |

## Available Skills
| Skill | Description |
|---|---|
| `backend-patterns` | Backend Development Patterns |
| `bugfix-workflow` | Bug-fix workflow |
| `build-fix` | Build and Fix |
| `caveman` | Caveman Communication Mode |
| `caveman-commit` | Terse Conventional Commit Generator |
| `caveman-review` | Terse Code Review Output |
| `checkpoint` | Checkpoint Command |
| `clickhouse-io` | ClickHouse Analytics Patterns |
| `code-review` | Code Review |
| `coding-standards` | Coding Standards & Best Practices |
| `context-docs` | context-docs - Derived Agent-Facing Context Documents |
| `continuous-learning` | Continuous Learning Skill |
| `create-prd` | Generating a Product Requirements Document (PRD) |
| `e2e` | E2E Command |
| `eval` | Eval Command |
| `eval-harness` | Eval Harness Skill |
| `feature-workflow` | Feature workflow |
| `frontend-patterns` | Frontend Development Patterns |
| `gabby-system` | gabby-system - Project AI System Initializer |
| `learn` | /learn - Extract Reusable Patterns |
| `orchestrate` | Orchestrate Command |
| `plan` | Plan Command |
| `project-guidelines-example` | Project Guidelines Skill (Example) |
| `refactor-clean` | Refactor Clean |
| `security-review` | Security Review Skill |
| `setup-pm` | Package Manager Setup |
| `strategic-compact` | Strategic Compact Skill |
| `tdd` | TDD Command |
| `tdd-workflow` | Test-Driven Development Workflow |
| `test-coverage` | Test Coverage |
| `update-codemaps` | Update Codemaps |
| `update-docs` | Update Documentation |
| `verification-loop` | Verification Loop Skill |
| `verify` | Verification Command |
| `_template` | {{name}} |

## Core Rules & Principles
| Rule File | Scope |
|---|---|
| `agents` | Agent Orchestration |
| `caveman` | Caveman Output Style |
| `coding-style` | Coding Style |
| `dual-engine-synergy` | Dual-Engine Synergy: Claude Code + Google Antigravity |
| `git-workflow` | Git Workflow |
| `hooks` | Hooks System |
| `patterns` | Common Patterns |
| `performance` | Performance Optimization |
| `security` | Security Guidelines |
| `testing` | Testing Requirements |
| `_template` | {{name}} |

## Engineering Workflows
| Workflow | Description |
|---|---|
| `bug-fix` | Workflow: Bug Fix and Defect Resolution |
| `code-audit` | Workflow: Comprehensive Code Audit |
| `hybrid-engine` | Workflow: Hybrid Multi-Engine Synergy and Handoffs |
| `manage-workflows` | Workflow: Workflow Management and Evolution |
| `new-feature` | Workflow: New Feature Implementation |

## Usage Instructions for Any AI Assistant
1. Global bridge: Inspect `~/.agents/rules/` for universal coding standards.
2. Personas: When adopting a role (e.g., architect or planner), read `~/.agents/agents/<role>.md`.
3. Skills: To perform complex workflows (e.g., TDD or PRD creation), read `~/.agents/skills/<skill>/SKILL.md`.
4. Cross-engine handoffs: Inter-engine states are tracked in `.agents/handoffs/handoff.md` within projects.
