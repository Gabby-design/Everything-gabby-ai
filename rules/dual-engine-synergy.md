---
name: dual-engine-synergy
description: Task division and handoff contract between Claude Code and Google Antigravity / Gemini CLI.
applyTo: "**"
---

# Dual-Engine Synergy: Claude Code + Google Antigravity

This rule defines how Claude Code and Google Antigravity collaborate as specialized engines under the 8 Core Principles.

## Engine Specialization

### Google Antigravity Lead
- Large-context codebase scans (1M+ tokens) and dependency tree mappings.
- Multi-step architectural planning and PRD decomposition.
- Long-running background processes, development servers, and daemons.
- Browser automation, visual testing, and accessibility audits via browser subagents.

### Claude Code Lead
- Idiomatic, surgical code synthesis and localized refactoring.
- High-precision bug diagnosis and regression test construction.
- Editorial code reviews, documentation sync, and changelog updates.
- Human-like code aesthetics, clean error handling, and type definitions.

## Handoff Contract

When switching between engines during a feature or bugfix lifecycle:
1. **Always Check State on Start**: Before beginning execution, check `docs/ai/HANDOFF.md` or git status for in-flight context from the preceding agent.
2. **Update Handoff on Finish**: When handing off, write a structured entry to `docs/ai/HANDOFF.md` detailing:
   - What was accomplished.
   - What was verified (tests, logs).
   - What decisions were made and why.
   - Exact remaining tasks and next steps for the receiving engine.
3. **Preserve Shared Context**: Both engines read from and write to canonical documents under `docs/ai/`.
