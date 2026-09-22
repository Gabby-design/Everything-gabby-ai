#!/usr/bin/env node
/**
 * Global AI System - Sync Engine
 * Synchronizes skills, agents, rules, and workflows from this repository
 * to the user's personal global root (~/.agents) and assistant-specific config roots.
 *
 * Usage:
 *   node scripts/sync-global.js [--dry-run] [--target <dir>]
 */

const fs = require('fs');
const path = require('path');
const utils = require('./lib/utils');

const repoRoot = path.resolve(__dirname, '..');

/**
 * Generate the master GLOBAL_INDEX.md content
 */
function generateGlobalIndex(items) {
  const lines = [
    '# Global AI System - Master Index',
    '',
    'This directory (~/.agents) serves as your universal personal root for all AI coding assistants.',
    'Any assistant (Google Antigravity, Claude Code, Gemini CLI, Copilot, Cursor, Windsurf, Codex) can reference these resources.',
    '',
    '## Global Constitution',
    'See `GLOBAL.md` for the 8 Core Principles and supreme operating rules governing all agents.',
    '',
    '## Directory Structure',
    '- `GLOBAL.md`: Supreme operating rules and 8 Core Principles',
    '- `agents/`: Specialized agent personas and role definitions',
    '- `skills/`: Reusable procedural capabilities and workflows',
    '- `rules/`: Coding standards, safety rules, and core principles',
    '- `workflows/`: Multi-stage task execution lifecycles',
    '- `contexts/`: Environment and task contexts',
    '- `bin/`: CLI convenience wrappers',
    '',
    '## Available Agent Personas',
    '| Persona | Description |',
    '|---|---|'
  ];

  for (const agent of items.agents) {
    lines.push(`| \`${agent.name}\` | ${agent.desc} |`);
  }

  lines.push('', '## Available Skills', '| Skill | Description |', '|---|---|');
  for (const skill of items.skills) {
    lines.push(`| \`${skill.name}\` | ${skill.desc} |`);
  }

  lines.push('', '## Core Rules & Principles', '| Rule File | Scope |', '|---|---|');
  for (const rule of items.rules) {
    lines.push(`| \`${rule.name}\` | ${rule.desc} |`);
  }

  if (items.workflows && items.workflows.length > 0) {
    lines.push('', '## Engineering Workflows', '| Workflow | Description |', '|---|---|');
    for (const wf of items.workflows) {
      lines.push(`| \`${wf.name}\` | ${wf.desc} |`);
    }
  }

  lines.push(
    '',
    '## Usage Instructions for Any AI Assistant',
    '1. Global bridge: Inspect `~/.agents/rules/` for universal coding standards.',
    '2. Personas: When adopting a role (e.g., architect or planner), read `~/.agents/agents/<role>.md`.',
    '3. Skills: To perform complex workflows (e.g., TDD or PRD creation), read `~/.agents/skills/<skill>/SKILL.md`.',
    '4. Cross-engine handoffs: Inter-engine states are tracked in `.agents/handoffs/handoff.md` within projects.',
    ''
  );

  return lines.join('\n');
}

/**
 * Extract title or first header from markdown file
 */
function extractTitle(filePath, fallback) {
  const content = utils.readFile(filePath);
  if (!content) return fallback;
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

/**
 * Collect available assets from directory
 */
function collectItems(dirPath, isSkill = false) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    if (isSkill && entry.isDirectory()) {
      const skillMd = path.join(dirPath, entry.name, 'SKILL.md');
      const desc = extractTitle(skillMd, 'Skill module');
      items.push({ name: entry.name, desc });
    } else if (!isSkill && entry.isFile() && entry.name.endsWith('.md')) {
      const baseName = entry.name.replace(/\.md$/, '');
      const desc = extractTitle(path.join(dirPath, entry.name), 'Documentation and guidance');
      items.push({ name: baseName, desc });
    }
  }

  return items;
}

/**
 * Create executable wrapper scripts in ~/.agents/bin
 */
function installBinWrappers(binDir, dryRun = false) {
  if (dryRun) return;
  utils.ensureDir(binDir);

  const commands = [
    { name: 'gabby', script: path.join(repoRoot, 'bin', 'gabby.js') },
    { name: 'gabby-sync', script: path.join(repoRoot, 'scripts', 'sync-global.js') },
    { name: 'gabby-init', script: path.join(repoRoot, 'scripts', 'init-project.js') },
    { name: 'agent', script: path.join(repoRoot, 'bin', 'gabby.js') },
    { name: 'agent-sync', script: path.join(repoRoot, 'scripts', 'sync-global.js') },
    { name: 'agent-init', script: path.join(repoRoot, 'scripts', 'init-project.js') }
  ];

  for (const cmd of commands) {
    // Windows CMD wrapper
    const cmdContent = `@echo off\r\nnode "${cmd.script}" %*\r\n`;
    fs.writeFileSync(path.join(binDir, `${cmd.name}.cmd`), cmdContent, 'utf8');

    // Windows PowerShell wrapper
    const ps1Content = `& node "${cmd.script}" $args\r\n`;
    fs.writeFileSync(path.join(binDir, `${cmd.name}.ps1`), ps1Content, 'utf8');

    // Unix shell wrapper
    const shContent = `#!/usr/bin/env sh\nnode "${cmd.script}" "$@"\n`;
    const shPath = path.join(binDir, cmd.name);
    fs.writeFileSync(shPath, shContent, 'utf8');
    try {
      fs.chmodSync(shPath, 0o755);
    } catch {
      // Ignore chmod error on platforms that do not support it
    }
  }
}

/**
 * Main synchronization execution function
 */
function syncGlobal(options = {}) {
  const dryRun = Boolean(options.dryRun);
  const targetRoot = options.targetDir || utils.getGlobalAgentsDir();

  const syncLog = [];
  const logAction = (msg) => {
    syncLog.push(msg);
    if (!options.silent) {
      console.log(msg);
    }
  };

  logAction('========================================');
  logAction(' Universal AI System - Global Sync Engine');
  logAction('========================================');
  logAction(`Global Root Target: ${targetRoot}`);
  if (dryRun) {
    logAction('[DRY-RUN] No files will be modified.');
  }

  const assetDirs = ['skills', 'agents', 'rules', 'workflows', 'contexts'];
  const summary = { skills: 0, agents: 0, rules: 0, workflows: 0, contexts: 0 };

  for (const dirName of assetDirs) {
    const srcDir = path.join(repoRoot, dirName);
    const destDir = path.join(targetRoot, dirName);

    if (fs.existsSync(srcDir)) {
      const entries = fs.readdirSync(srcDir);
      summary[dirName] = entries.length;
      logAction(`- Syncing ${dirName.padEnd(10)} (${entries.length} items) -> ${destDir}`);
      if (!dryRun) {
        utils.copyDirRecursive(srcDir, destDir, { overwrite: true });
      }
    }
  }

  // Cross-Assistant Propagation: Google Antigravity & Gemini CLI (~/.gemini/config)
  const geminiConfigDir = utils.getGeminiConfigDir();
  const geminiExists = fs.existsSync(path.dirname(geminiConfigDir)) || fs.existsSync(geminiConfigDir);
  if (geminiExists) {
    logAction(`- Syncing with Gemini / Antigravity config: ${geminiConfigDir}`);
    if (!dryRun) {
      utils.ensureDir(geminiConfigDir);
      const skillsSrc = path.join(repoRoot, 'skills');
      const rulesSrc = path.join(repoRoot, 'rules');
      if (fs.existsSync(skillsSrc)) {
        utils.copyDirRecursive(skillsSrc, path.join(geminiConfigDir, 'skills'), { overwrite: true });
      }
      if (fs.existsSync(rulesSrc)) {
        utils.copyDirRecursive(rulesSrc, path.join(geminiConfigDir, 'rules'), { overwrite: true });
      }
      const globalMdSrc = path.join(repoRoot, 'GLOBAL.md');
      if (fs.existsSync(globalMdSrc)) {
        utils.ensureDir(path.join(geminiConfigDir, 'rules'));
        fs.copyFileSync(globalMdSrc, path.join(geminiConfigDir, 'rules', 'GLOBAL.md'));
      }
    }
  }

  // Cross-Assistant Propagation: Claude Code (~/.claude)
  const claudeDir = utils.getClaudeDir();
  if (fs.existsSync(claudeDir)) {
    logAction(`- Syncing with Claude Code config: ${claudeDir}`);
    if (!dryRun) {
      const rulesSrc = path.join(repoRoot, 'rules');
      const skillsSrc = path.join(repoRoot, 'skills');
      const commandsSrc = path.join(repoRoot, 'commands');

      if (fs.existsSync(rulesSrc)) {
        utils.copyDirRecursive(rulesSrc, path.join(claudeDir, 'rules'), { overwrite: true });
      }
      if (fs.existsSync(skillsSrc)) {
        utils.copyDirRecursive(skillsSrc, path.join(claudeDir, 'skills'), { overwrite: true });
      }
      if (fs.existsSync(commandsSrc)) {
        utils.copyDirRecursive(commandsSrc, path.join(claudeDir, 'commands'), { overwrite: true });
      }
      const globalMdSrc = path.join(repoRoot, 'GLOBAL.md');
      if (fs.existsSync(globalMdSrc)) {
        utils.ensureDir(path.join(claudeDir, 'rules'));
        fs.copyFileSync(globalMdSrc, path.join(claudeDir, 'rules', 'GLOBAL.md'));
      }
    }
  }

  // Sync GLOBAL.md to target root (~/.agents/GLOBAL.md)
  const globalMdSrc = path.join(repoRoot, 'GLOBAL.md');
  if (fs.existsSync(globalMdSrc)) {
    logAction(`- Syncing GLOBAL.md constitution -> ${path.join(targetRoot, 'GLOBAL.md')}`);
    if (!dryRun) {
      fs.copyFileSync(globalMdSrc, path.join(targetRoot, 'GLOBAL.md'));
    }
  }

  // Generate GLOBAL_INDEX.md
  const collected = {
    agents: collectItems(path.join(repoRoot, 'agents'), false),
    skills: collectItems(path.join(repoRoot, 'skills'), true),
    rules: collectItems(path.join(repoRoot, 'rules'), false),
    workflows: collectItems(path.join(repoRoot, 'workflows'), false)
  };

  const indexContent = generateGlobalIndex(collected);
  const indexPath = path.join(targetRoot, 'GLOBAL_INDEX.md');
  if (!dryRun) {
    utils.writeFile(indexPath, indexContent);
    logAction(`- Generated Master Index: ${indexPath}`);
  }

  // Install bin wrappers
  const binDir = path.join(targetRoot, 'bin');
  installBinWrappers(binDir, dryRun);
  if (!dryRun) {
    logAction(`- Installed CLI wrappers to: ${binDir}`);
  }

  logAction('========================================');
  logAction(' Global Sync Completed Successfully');
  logAction('========================================');

  return {
    success: true,
    targetRoot,
    summary,
    log: syncLog
  };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetIndex = args.indexOf('--target');
  const targetDir = targetIndex !== -1 && args[targetIndex + 1] ? args[targetIndex + 1] : null;

  try {
    syncGlobal({ dryRun, targetDir });
    process.exit(0);
  } catch (err) {
    console.error('Error during global sync:', err.message);
    process.exit(1);
  }
}

module.exports = {
  syncGlobal,
  generateGlobalIndex,
  collectItems
};
