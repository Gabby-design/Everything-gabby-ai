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
| `architect` | Software architecture specialist for system design, scalability, and technical decision-making. Use PROACTIVELY when planning new features, refactoring large systems, or making architectural decisions. |
| `build-error-resolver` | Build and TypeScript error resolution specialist. Use PROACTIVELY when build fails or type errors occur. Fixes build/type errors only with minimal diffs, no architectural edits. Focuses on getting the build green quickly. |
| `code-reviewer` | Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code. MUST BE USED for all code changes. |
| `doc-updater` | Documentation and codemap specialist. Use PROACTIVELY for updating codemaps and documentation. Runs /update-codemaps and /update-docs, generates docs/CODEMAPS/*, updates READMEs and guides. |
| `e2e-runner` | End-to-end testing specialist using Playwright. Use PROACTIVELY for generating, maintaining, and running E2E tests. Manages test journeys, quarantines flaky tests, uploads artifacts (screenshots, videos, traces), and ensures critical user flows work. |
| `planner` | Expert planning specialist for complex features and refactoring. Use PROACTIVELY when users request feature implementation, architectural changes, or complex refactoring. Automatically activated for planning tasks. |
| `refactor-cleaner` | Dead code cleanup and consolidation specialist. Use PROACTIVELY for removing unused code, duplicates, and refactoring. Runs analysis tools (knip, depcheck, ts-prune) to identify dead code and safely removes it. |
| `security-reviewer` | Security vulnerability detection and remediation specialist. Use PROACTIVELY after writing code that handles user input, authentication, API endpoints, or sensitive data. Flags secrets, SSRF, injection, unsafe crypto, and OWASP Top 10 vulnerabilities. |
| `tdd-guide` | Test-Driven Development specialist enforcing write-tests-first methodology. Use PROACTIVELY when writing new features, fixing bugs, or refactoring code. Ensures 80%+ test coverage. |
| `_template` | What this specialist agent focuses on and when to delegate to it. Use PROACTIVELY when triggered. |

## Available Skills
| Skill | Description |
|---|---|
| `backend-patterns` | Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes. |
| `bugfix-workflow` | Workflow for a bug, defect or regression — establish expected behaviour from the authoritative source, reproduce, find the root cause before changing code, write the failing regression test, apply the smallest correct fix, verify adjacent behaviour, and record symptom/cause/fix in the changelog. Use whenever existing intended behaviour is broken. |
| `build-fix` | Incrementally fix TypeScript/build errors one at a time using the project's real build command; stops when a fix introduces new errors or the same error persists after three attempts. |
| `caveman` | Ultra-compressed communication mode that cuts output tokens while maintaining technical precision. Levels include lite, full, and ultra. Use for /caveman, "caveman mode", "be brief", or "less tokens". |
| `caveman-commit` | Write a Conventional Commits message compressed to intent only. Use for "write a commit", "commit message", /commit or /caveman-commit. |
| `caveman-review` | Compressed code review - one line per finding with location, problem and fix. Use for /caveman-review, "review this PR", or "review the diff". |
| `checkpoint` | Create, verify or list workflow checkpoints (named snapshots of test/coverage/build state) so long tasks can be compared against a known-good point. Never commits or stashes for you. |
| `clickhouse-io` | ClickHouse database patterns, query optimization, analytics, and data engineering best practices for high-performance analytical workloads. |
| `code-review` | Security and quality review of uncommitted changes with severity-ranked findings (CRITICAL/HIGH/MEDIUM/LOW), file:line locations and concrete fixes; never approves code with security issues. |
| `coding-standards` | Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React, and Node.js development. |
| `context-docs` | Regenerate a project's derived, agent-facing context docs (docs/ai/context/*.md - compressed copies of MEMORY.md, NOTES.md, CHANGELOG.md) from their human-canonical sources, then stamp them; also the read protocol - read the derived copy only when gabby ctx status says current. Use when a source changed, when gabby ctx/doctor reports stale or missing, or when asked to "regenerate context docs". |
| `continuous-learning` | Automatically extract reusable patterns from Claude Code sessions and save them as learned skills for future use. |
| `create-prd` | Create a detailed Product Requirements Document (PRD) in Markdown from a feature idea — asks 3–10 essential clarifying questions with lettered options, then writes a PRD with goals, user stories, prefixed trackable tasks, non-goals, success metrics and open questions. Use for any new feature or product capability before planning or implementation. |
| `e2e` | Generate and run end-to-end tests with Playwright: creates user-journey tests, runs them, captures screenshots/videos/traces, and reports failures with artifacts. |
| `eval` | Manage eval-driven development: define capability and regression evals for a feature, check them, and produce a pass@k report with a SHIP / NEEDS WORK / BLOCKED recommendation. |
| `eval-harness` | A formal evaluation framework for agent sessions implementing eval-driven development (capability evals, regression evals, graders, pass@k metrics). |
| `feature-workflow` | End-to-end workflow for a NEW product capability or feature — classify, product definition (create-prd) and owner PRD approval, implementation plan and owner plan approval, implement with tests, verify gates, documentation impact review, report ready for owner commit. Use whenever a request introduces new product behaviour. |
| `frontend-patterns` | Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices. |
| `gabby-system` | Set up, adopt, upgrade, audit, amend or extend a repository's AI operating system (docs/ai/ + AGENTS.md/CLAUDE.md/GEMINI.md/Copilot entry points) that any coding agent follows. Trigger on "set up / initialize / bootstrap this project's AI system", "run the initializer / gabby", "gabby init / upgrade / audit", "upgrade or audit the docs/ai system", "amend a rule and cascade it", or a pasted gabby prompt. |
| `learn` | Extract reusable patterns from the current session (error resolutions, debugging techniques, workarounds, project conventions) into a learned skill, after confirming with the owner. |
| `orchestrate` | Run a sequential multi-agent workflow (feature, bugfix, refactor, security) passing a structured handoff document between planner, tdd-guide, code-reviewer, security-reviewer and architect. |
| `plan` | Restate requirements, assess risks, and produce a phased implementation plan with dependencies and complexity; WAITS for the owner's explicit confirmation before any code is touched. |
| `project-guidelines-example` | Example project-specific guidelines template demonstrating architecture, patterns, testing, and deployment rules for a project. |
| `refactor-clean` | Safely identify and remove dead code (unused exports, files, dependencies) with test verification after each batch; reports what was removed and leaves commits to the owner. |
| `security-review` | Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns. |
| `setup-pm` | Detect or set the preferred package manager (npm, pnpm, yarn, bun) for this project or globally, using the lockfile, package.json packageManager field and config. |
| `strategic-compact` | Suggests manual context compaction at logical intervals to preserve context through task phases rather than arbitrary auto-compaction. |
| `tdd` | Enforce test-driven development for a task: scaffold interfaces, write failing tests first, implement the minimum to pass, refactor, and verify coverage against the project's gate. |
| `tdd-workflow` | Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests. |
| `test-coverage` | Run the project's coverage report, find untested critical paths, and add the missing tests, prioritising business logic and error paths. |
| `update-codemaps` | Regenerate or refresh the repository's code maps (module/dependency overview) so agents can orient without reading the whole tree. |
| `update-docs` | Synchronise project documentation with the code after a change: docs/ai current-state files, README, API docs and codemaps; reports which layers were updated. |
| `verification-loop` | Continuous verification loop (build, typecheck, lint, tests, security, diff review) run after any significant change and before reporting ready for commit. |
| `verify` | Run the project's full verification loop (build, typecheck, lint, tests, security scan, diff review) and report a pass/fail summary; the definition of done before reporting ready for commit. |
| `_template` | One sentence - what this skill does and WHEN an agent should reach for it. |

## Core Rules & Principles
| Rule File | Scope |
|---|---|
| `agents` | Agent Orchestration - personas, specialization, handoffs, and verification workflows. |
| `caveman` | Output-style rule - respond terse (caveman register) when caveman mode is active; levels lite, full, ultra; auto-clarity for security and irreversible actions; never applies to persisted code, commits, docs, memory, or notes. |
| `coding-style` | Coding Style - pure Node >= 18, zero external runtime dependencies, zero emojis, file length limits (< 400 lines). |
| `communication` | Communication Standards - address the project owner as Master across all interactions and responses. |
| `dual-engine-synergy` | Task division and handoff contract between Claude Code and Google Antigravity / Gemini CLI. |
| `git-workflow` | The owner controls Git (RULE-GIT-001). Conventional Commits and PR workflows for when authorized. |
| `hooks` | Hooks System - lifecycle hooks, event triggers, deterministic execution, and timeout safety. |
| `patterns` | Common Patterns - zero-dependency architectures, state machines, and idempotent file operations. |
| `performance` | Performance Optimization - fast CLI startup (< 200ms), streaming output, and sub-second execution. |
| `security` | Security Guidelines - write scope firewall (RULE-SCOPE-001), secret hygiene, and input sanitization. |
| `testing` | Testing Requirements - test-driven development, regression tests first, and contract verification. |
| `_template` | One sentence - what this rule enforces and when it applies. |

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
