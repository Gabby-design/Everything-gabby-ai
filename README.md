# Everything Gabby AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 177 Passing](https://img.shields.io/badge/Tests-177%20passing-brightgreen.svg)](tests/run-all.js)
[![Node: >=18](https://img.shields.io/badge/Node-%3E%3D18-green.svg)](package.json)
[![Zero Emojis](https://img.shields.io/badge/Emojis-Zero-lightgrey.svg)](GLOBAL.md)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-orange.svg)](setup.js)

Universal multi-agent operating system for AI coding assistants. Standardized architecture, durable memory, formal rules, specialized agents, workflows, and automated verification across Google Antigravity, Claude Code, Google Gemini CLI, GitHub Copilot, OpenAI Codex, Cursor, and Windsurf.

---

## Highlights

- **Universal Multi-Agent Compatibility**: Single repository configuration powers Google Antigravity, Claude Code, Gemini CLI, Copilot, Codex, Cursor, and Windsurf without duplication.
- **Zero External Runtime Dependencies**: Pure Node.js (>= 18) core. Zero npm runtime dependencies.
- **Durable Memory and Operating Rules**: Supreme constitution (`GLOBAL.md`), project-level operating manual (`docs/ai/`), and repository memory (`MEMORY.md`, `NOTES.md`).
- **Comprehensive Quality Invariants**: Zero emojis in code, comments, or documentation; all source files strictly under 400 lines; functions under 50 lines; immutable patterns.
- **Owner-Controlled Git**: Agents never stage, commit, branch, or push autonomously (`RULE-GIT-001`).
- **1-Step Project Adoption**: Instant adoption wizard scaffolds any project into the system in seconds.

---

## 1-Line Quick Install

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/Gabby-design/Everything-gabby-ai/main/setup.ps1 | iex
```

### macOS / Linux / WSL (Bash)

```bash
curl -fsSL https://raw.githubusercontent.com/Gabby-design/Everything-gabby-ai/main/setup.sh | bash
```

### Manual Clone and Setup

```bash
git clone https://github.com/Gabby-design/Everything-gabby-ai.git
cd Everything-gabby-ai
node bin/setup.js
```

Non-interactive automated installation:

```bash
node bin/setup.js --yes
```

To link the `gabby` CLI globally:

```bash
npm link
```

---

## System Architecture

```text
Everything-gabby-ai/
|-- GLOBAL.md             # Supreme constitution loaded across all assistants
|-- MEMORY.md             # Durable cross-project knowledge and facts
|-- NOTES.md              # Research observations, patterns, and decisions
|-- setup.ps1             # 1-line remote installer for Windows
|-- setup.sh              # 1-line remote installer for macOS/Linux/WSL
|-- bin/
|   |-- gabby.js          # Master CLI executable (gabby init, doctor, sync, etc.)
|   |-- setup.js          # First-time interactive setup wizard
|-- agents/               # 10 specialized agent personas (planner, architect, tdd-guide, etc.)
|-- skills/               # 35+ workflow playbooks and domain skills
|-- rules/                # 11 modular rules with YAML frontmatter (RULE-GIT-001, etc.)
|-- contexts/             # Dynamic system prompt injection contexts (dev, review, research)
|-- templates/            # Canonical docs/ai/ scaffolding templates for project adoption
|-- hooks/                # Lifecycle hooks (session-start, session-end, compaction)
|-- scripts/              # Automation tools (sync, caveman upstream, publish)
`-- tests/                # 25 test suites, 177 unit and integration tests
```

---

## CLI Reference

The `gabby` CLI provides complete management for your AI engineering workflows.

### Project Management

| Command | Description |
|---|---|
| `gabby init --apply` | Adopt current repository: scaffolds `docs/ai/`, migrates legacy rules, stamps version |
| `gabby doctor` | Inspect global configuration and assistant hooks |
| `gabby doctor --project` | Validate active project `docs/ai/` integrity and version stamp |
| `gabby sync` | Synchronize skills, rules, agents, and constitution to `~/.agents`, `~/.gemini/config`, and `~/.claude` |
| `gabby stamp` | Display or verify installed system version stamp |
| `gabby list` | List all available agents, skills, rules, and workflows |

### Communication Modes (Caveman Register)

Configure token-efficient, high-density communication:

```bash
gabby caveman full     # Terse, high-density, drop filler, maximum technical precision (default)
gabby caveman lite     # Moderate compression with standard structure
gabby caveman ultra    # Extreme token minimization for machine intake
gabby caveman off      # Conversational output
```

### Git and Releases

```bash
gabby publish patch    # Run verification suite, bump version, update changelog
gabby publish minor    # Release minor update with new capabilities
```

---

## Adopting a Project

To onboard any new or existing repository to the Gabby AI system:

```bash
cd /path/to/your/project
gabby init --apply
```

This instantly:
1. Detects project stack and language (Next.js, React, Node.js, Python, Flutter, etc.).
2. Scaffolds `docs/ai/` with standard structure:
   - `docs/ai/AGENT-CORE.md`: Project operating manual.
   - `docs/ai/RULES.md`: Project-specific rules registry.
   - `docs/ai/MEMORY.md`: Durable project memory.
   - `docs/ai/NOTES.md`: Active decisions and technical notes.
   - `docs/ai/CHANGELOG.md`: Human-readable record of changes.
3. Configures entry points: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`.
4. Stamps repository with current system version.

Verify adoption:

```bash
gabby doctor --project
```

---

## The 8 Supreme Invariants

Every agent and human engineer adheres to these immutable principles:

1. **Scope and Autonomy**: Execute strictly what was requested. Present plans for changes spanning more than 3 files.
2. **Read Before Writing**: Inspect existing patterns, naming, and boundaries before generating code.
3. **Code Quality**: Immutable updates, files strictly under 400 lines, functions under 50 lines, zero emojis.
4. **Safety**: Never touch credentials or secrets. Run background servers only when explicitly requested.
5. **Testing and Verification**: Write failing tests first (Red-Green-Refactor). Continuous verification before reporting completion.
6. **Owner Controls Git**: Never stage, commit, or push code without explicit authorization.
7. **Terse Communication**: High information density, concrete evidence, direct technical facts.
8. **Universal Handoff**: Cross-agent state persistence across sessions and tools.

---

## Specialized Agent Personas

| Agent | Responsibility |
|---|---|
| `planner` | Feature requirements breakdown, milestone planning, dependency analysis |
| `architect` | System boundaries, interface design, data flow modeling |
| `tdd-guide` | Red-Green-Refactor test-driven development guidance |
| `code-reviewer` | Quality, maintainability, architectural compliance audit |
| `security-reviewer` | OWASP vulnerabilities, input sanitization, auth validation |
| `build-error-resolver`| Mechanical and type error diagnostics without regressions |
| `e2e-runner` | End-to-end integration and Playwright test validation |
| `refactor-cleaner` | Dead code pruning and complexity reduction |
| `doc-updater` | Continuous synchronization of `MEMORY.md`, `CHANGELOG.md`, and specifications |

---

## Automated Test Suite

Run full verification suite (177 tests across 25 suites):

```bash
node tests/run-all.js
```

All tests run in pure Node.js with zero external dependencies.

---

## Contributing

Contributions adhering to 8 Supreme Principles are welcome. Review [CONTRIBUTING.md](CONTRIBUTING.md) for contribution workflows and testing gates.

---

## License

MIT License. Open and freely usable across commercial and open-source projects.
