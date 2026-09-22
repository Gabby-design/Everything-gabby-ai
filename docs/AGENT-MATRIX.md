# Agent Matrix — Multi-Assistant Architecture and Integration

This document defines how `gabby` connects the universal AI agent system to every supported AI coding environment, both locally and in project repositories.

## 1. Cross-Assistant Integration Grid

| Assistant | Global Setup (`gabby install`) | Project Entry (`gabby link`) | Project Vendoring (`gabby vendor`) |
| :--- | :--- | :--- | :--- |
| **Claude Code** | `~/.claude/skills/<n>` symlinks · `~/.claude/agents/<n>.md` · `~/.claude/rules/<n>.md` · Managed block in `~/.claude/CLAUDE.md` importing `@~/.agents/GLOBAL.md` · Safety hooks in `settings.json` | `CLAUDE.md` -> `docs/ai/AGENT-CORE.md` | `.agents/skills/<n>` copies (cross-vendor standard) |
| **OpenAI Codex** | `~/.agents/skills/<n>` symlinks (standard Codex user skills path) · `~/.codex/prompts/<n>.md` generated for invocable skills (`/prompts:<n>`) · Managed block in `~/.codex/AGENTS.md` | `AGENTS.md` -> `docs/ai/AGENT-CORE.md` | `.agents/skills/<n>` copies |
| **Gemini CLI** | `~/.gemini/skills/<n>` symlinks · `~/.gemini/commands/<n>.toml` generated for invocable skills (`/<n>`) · Managed block in `~/.gemini/GEMINI.md` | `GEMINI.md` -> `docs/ai/AGENT-CORE.md` | `.agents/skills/`, `.agents/rules/` copies |
| **Google Antigravity** | `~/.gemini/config/skills/<n>` symlinks · Shares `~/.gemini/GEMINI.md` managed block | `.agents/rules/00-agent-core.md` pointer (Antigravity workspace rules) + `GEMINI.md` | `.agents/rules/<n>.md` copies of universal rules · `.agents/skills/` |
| **GitHub Copilot** | `~/.copilot/skills/<n>` symlinks · `~/.agents/skills/` resolution | `.github/copilot-instructions.md` -> `docs/ai/AGENT-CORE.md` | `.github/instructions/<rule>.instructions.md` (`applyTo: "**"`) · `.github/agents/<n>.agent.md` from `agents/` · `.github/prompts/` |
| **Cursor / Windsurf / Jules / Zed** | Inherits `AGENTS.md` standard | `AGENTS.md` symlink · Optional: `.cursor/rules/gabby-agent-core.mdc`, `.windsurfrules` | `.agents/skills/`, `.agents/rules/` |

## 2. Output Style: Caveman Register

- **Global Mode**: Configured in `config.json` -> `caveman.mode` and baked into each assistant's global managed block during installation.
- **Project Mode**: Configured via `.caveman.json` and declared in `AGENT-CORE.md`, `.agents/rules/01-caveman.md` (Antigravity), and `.github/instructions/caveman.instructions.md` (Copilot).
- **Session Overrides**: `/caveman ultra`, `/caveman lite`, `/caveman full`, `/caveman off`, or prompt "normal mode".
- **Boundaries**: Terse style is strictly confined to assistant chat output. It is never used in code, comments, commit messages, PR descriptions, or persistent documentation.

## 3. Slash Command Generation

Assistants handle procedural skill execution through distinct mechanisms:
- **Claude Code**: Natively discovers skills and exposes each installed skill directory as `/<skill-name>`.
- **OpenAI Codex**: Generates command prompts in `~/.codex/prompts/<name>.md` for skills marked `invocable: true` in YAML frontmatter, exposed as `/prompts:<name>`.
- **Gemini CLI**: Generates TOML command definitions in `~/.gemini/commands/<name>.toml` for invocable skills, exposed as `/<name>`.
- **Antigravity**: Discovers skills automatically via `skills/*/SKILL.md` in workspace or global config roots.
- **GitHub Copilot**: Generates prompt files in `.github/prompts/<name>.prompt.md` when prompt bridges are enabled.

## 4. Managed Block Conventions

Global assistant configuration files (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md`) are user-owned assets.
- `gabby` only manages content bounded between:
  ```markdown
  <!-- gabby:start:managed -->
  ... generated configuration ...
  <!-- gabby:end:managed -->
  ```
- Any personal notes, API keys, or custom prompts placed outside these comment markers are preserved across updates and reinstallations.

## 5. Cloud and Sandbox Agent Support

Cloud-based coding agents (e.g. Jules, GitHub Copilot Coding Agent, cloud Codex) execute in isolated containers without access to the user's local `~/.agents` directory.
- `gabby vendor [skills...]` copies required universal skills and rules directly into the project repository under `.agents/skills/` and `.agents/rules/`.
- Vendored assets are stamped with `.gabby-vendored` markers and registered in `docs/ai/SYSTEM.md` under `vendored`.
- `gabby upgrade` automatically refreshes vendored assets when universal skills or rules evolve.
