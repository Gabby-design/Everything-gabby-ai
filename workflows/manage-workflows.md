# Workflow: Workflow Management and Evolution

Procedures for creating, updating, evaluating, and synchronizing workflows across the universal AI agent system.

## 0. Architecture and Hierarchy

Workflows provide standardized, reproducible paths for complex engineering procedures.
- **Global Workflows**: Stored at `~/.agents/workflows/`. Accessible across all repositories and AI coding engines.
- **Repository Workflows**: Maintained in `everything-gabby/workflows/` (or project root `workflows/`).
- **Project-Specific Overrides**: Stored in a project's `.agents/workflows/` or `docs/ai/workflows/`.

```text
[ Global System: ~/.agents/workflows/ ]
       |
       |  (sync / inherit)
       v
[ Project Root: docs/ai/workflows/ or workflows/ ]
       |
       |  (task execution)
       v
[ Agent Execution Engine ]
```

## 1. Creating a New Workflow

When defining a new workflow:
1. Identify the trigger condition and inputs required before execution begins.
2. Structure the workflow into explicit stages:
   - **Stage 1: Preparation & Scope** (Intake, verification, boundary confirmation)
   - **Stage 2: Plan & Approval** (Human gate before code modifications)
   - **Stage 3: Implementation** (Test-driven, incremental, scoped)
   - **Stage 4: Verification** (All gates in `VERIFICATION.md` must pass)
   - **Stage 5: Documentation & Reconciliation** (Updating memory, handoff, docs)
   - **Stage 6: Hand Back** (Ready for owner review and commit; never autonomous commit)
3. Save the workflow as `workflows/<name>.md` with clear section headers and step numbers.
4. Ensure zero emojis are used in the workflow file.

## 2. Updating an Existing Workflow

When improving a workflow based on real project experience:
1. Check what step caused friction or omission in previous executions.
2. Update the workflow file in the repository or local project.
3. Propagate changes globally using the sync tool:
   ```bash
   node scripts/sync-global.js
   # or
   gabby-sync
   ```
4. Record the reason for modification in the changelog.

## 3. Instructing Agents to Execute Workflows

In any AI assistant prompt, trigger a workflow explicitly:
- "Execute the `new-feature` workflow for user session timeouts."
- "Follow the `bug-fix` workflow to investigate the null pointer in payment webhook."
- "Run the `code-audit` workflow across the API module."
- "Use the `hybrid-engine` workflow to prepare handoff from Claude to Antigravity."

Agents will read the workflow definition, declare the active stage, and pause at all designated human gates.
