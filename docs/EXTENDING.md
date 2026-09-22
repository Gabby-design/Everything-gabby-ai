# Extending the Universal AI System

This document outlines standard recipes for adding new capabilities, agent personas, rules, workflows, and assistant adapters to the system.

## 1. Development Loop

Whenever modifying or extending universal resources:
```text
1. AUTHOR / EDIT  -> Create module in skills/, agents/, rules/, or workflows/
2. VALIDATE       -> Verify frontmatter contracts, size limits, and zero emojis
3. TEST           -> Run node tests/run-all.js (100% passing required)
4. SYNC           -> Run node scripts/sync-global.js to deploy to ~/.agents/
5. STAMP          -> Re-verify health via gabby doctor
```

## 2. Adding a Skill or Workflow

Workflows and skills share the universal `SKILL.md` format. A workflow is simply a multi-step engineering procedure.

1. Create directory `skills/<name>/` or `workflows/<name>.md`.
2. Author `skills/<name>/SKILL.md` adhering to the required YAML frontmatter:
   ```markdown
   ---
   name: my-skill-name
   description: Brief description stating purpose and exact trigger keywords.
   invocable: true
   ---

   # Skill: My Skill Name

   ## Overview
   Detailed procedural instructions...
   ```
3. Frontmatter rules:
   - `name`: Must match the directory name in kebab-case.
   - `description`: Evaluated by AI engines to determine when to load the skill. Include explicit action verbs.
   - `invocable`: Set to `true` if the skill should be exposed as a slash command in supported runtimes.
4. Keep core skill instructions focused. Supplementary reference material belongs in subdirectories (`references/`, `examples/`).

## 3. Adding an Agent Persona

Agent personas define specialist sub-agent perspectives (e.g. `architect`, `planner`, `security-reviewer`):

1. Create `agents/<persona-name>.md`.
2. Adhere to frontmatter structure:
   ```markdown
   ---
   name: persona-name
   description: "Use PROACTIVELY when [condition occurs]. Specializes in [focus area]."
   tools: [run_command, read_file, write_file]
   model: inherit
   ---

   # Persona Name

   Role definition and operational constraints...
   ```
3. Claude Code loads personas natively from `~/.claude/agents/`. Other assistants adopt the persona when instructed in the prompt.

## 4. Adding or Amending Rules

Rules define non-negotiable operational invariants:

- **Adding a Universal Rule**: Create `rules/<rule-name>.md`. State the actor, trigger, obligation, exception, and proof.
- **Rule Scope**:
  - Global rules live in `~/.agents/rules/` and apply to all projects by default.
  - Project rules live in `docs/ai/ENGINEERING.md` and override global rules on the same subject.
- **Cascading Amendments**: When modifying a rule that existing projects mirror, do not change project files silently. Open the project and instruct the agent: *"AMEND: [rule statement]"*. The agent cascades changes to checklists, gates, and verification definitions.

## 5. Adding a Cross-Assistant Adapter

To support an emerging AI coding runtime:

1. Create an adapter module in `lib/adapters/<assistant-id>.js`.
2. Export the required adapter interface:
   ```javascript
   module.exports = {
     id: 'my-assistant',
     name: 'My Assistant Runtime',
     global(ctx) {
       // Returns array of operations (symlink, managed, file, copy) for ~/.<assistant>
       return [];
     },
     project(ctx, projectDir, options) {
       // Returns operations to configure repository entry points
       return [];
     }
   };
   ```
3. Register the adapter in `lib/adapters/index.js` and `config.json`.
4. Add verification tests in `tests/lib/adapters.test.js`.

## 6. Global Memory and Notes Discipline

- **Global Memory (`~/.agents/MEMORY.md`)**: Records personal developer preferences, environment configurations, and active system inventories. Never contains project-specific code facts or secrets.
- **Global Notes (`~/.agents/NOTES.md`)**: Records cross-project gotchas and tool issues prefixed with `G-###` tags.
- Agents propose global entries in session completion reports; human approval is required before updating global memory.
