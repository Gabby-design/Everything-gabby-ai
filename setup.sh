#!/usr/bin/env bash
# everything-gabby-ai - one-line bootstrap for macOS / Linux / WSL / Git Bash
#   curl -fsSL https://raw.githubusercontent.com/Gabby-design/everything-gabby-ai/main/setup.sh | bash

set -euo pipefail

# 1. Check Node >= 18
if ! command -v node >/dev/null 2>&1; then
  echo "setup: Node.js 18+ required but not found on PATH. Install from https://nodejs.org" >&2
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "setup: Node.js 18+ required (found $(node --version))" >&2
  exit 1
fi

# 2. Check Git
if ! command -v git >/dev/null 2>&1; then
  echo "setup: Git required but not found on PATH." >&2
  exit 1
fi

DEST="$HOME/.agents"
REPO_URL="https://github.com/Gabby-design/everything-gabby-ai.git"

if [ ! -d "$DEST" ]; then
  echo "[+] Cloning everything-gabby-ai into $DEST..."
  git clone "$REPO_URL" "$DEST"
else
  echo "[ok] $DEST already exists."
fi

# 3. Run bin/setup.js
node "$DEST/bin/setup.js" "$@"
