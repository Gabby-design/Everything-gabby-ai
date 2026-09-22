# Installation and Setup Guide

This guide describes how to install, configure, and maintain the universal AI agent system on Windows, macOS, and Linux.

## 1. Prerequisites

- **Node.js**: Version 18.0.0 or higher.
- **Git**: Installed and accessible on your system PATH.
- **Dependencies**: Zero external npm dependencies. The entire system executes on native Node.js standard libraries.
- **Windows Consideration**: Enable Developer Mode in Windows Settings (Settings -> For developers -> Developer Mode) to permit symlink and junction creation without administrative elevation.

## 2. Global Installation

### Clone and Initialize

1. Clone the repository into your workspace:
   ```bash
   git clone https://github.com/WorldFlowAI/everything-gabby.git
   cd everything-gabby
   ```

2. Run the global synchronization script:
   ```bash
   node scripts/sync-global.js
   ```

3. What `sync-global.js` accomplishes:
   - Initializes the global system root at `~/.agents`.
   - Synchronizes universal skills (`~/.agents/skills/`), agents (`~/.agents/agents/`), rules (`~/.agents/rules/`), and workflows (`~/.agents/workflows/`).
   - Propagates configuration to Google Antigravity & Gemini CLI (`~/.gemini/config/`).
   - Propagates configuration to Claude Code (`~/.claude/`).
   - Deploys executable CLI wrappers (`gabby`, `gabby-sync`, `gabby-init`, `agent`, `agent-sync`, `agent-init`) to `~/.agents/bin/`.
   - Generates the master catalog at `~/.agents/GLOBAL_INDEX.md`.

## 3. Configuring System PATH

To execute `gabby` or `agent` from any terminal directory:

- **Windows (PowerShell)**:
  Add `~/.agents/bin` to your User PATH:
  ```powershell
  [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$HOME\.agents\bin", "User")
  ```

- **macOS / Linux / WSL**:
  Add `~/.agents/bin` to your shell profile (`~/.bashrc` or `~/.zshrc`):
  ```bash
  export PATH="$HOME/.agents/bin:$PATH"
  ```

## 4. Verification

Verify that the system is properly installed:

```bash
# Check CLI functionality
node bin/gabby.js doctor
# or via installed wrapper
gabby doctor

# Run the master test suite
node tests/run-all.js
```

A clean audit output confirms that all skills, rules, templates, and adapters are operational.

## 5. What Gets Configured Per Assistant

| Assistant | Global Destination | Configuration Type |
| :--- | :--- | :--- |
| **Google Antigravity** | `~/.gemini/config/skills/`, `~/.gemini/config/rules/` | Directory synchronization |
| **Claude Code** | `~/.claude/skills/`, `~/.claude/rules/`, `~/.claude/agents/` | Directory synchronization & managed blocks |
| **OpenAI Codex** | `~/.agents/skills/` | Standard cross-vendor skill path |
| **Gemini CLI** | `~/.gemini/skills/` | Standard skill path |
| **GitHub Copilot** | `~/.copilot/skills/` | Extension integration |

## 6. Uninstallation

To remove global integration without affecting project repositories:

1. Remove the global wrappers and symlinks:
   ```bash
   node bin/gabby.js uninstall
   ```
2. Remove the `~/.agents` directory if desired:
   - On Windows: `Remove-Item -Recurse -Force "$HOME\.agents"`
   - On Unix: `rm -rf ~/.agents`

Existing repositories carrying `docs/ai/` remain fully self-sufficient and functional.
