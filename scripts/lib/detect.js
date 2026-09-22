/**
 * Project mode detection engine.
 * Deterministically classifies repositories into:
 *   - INIT: Greenfield repository with no code, history, or instructions
 *   - ADOPT: Existing codebase with code/manifests/history or legacy instructions
 *   - UPGRADE: docs/ai/AGENT-CORE.md present but system version is older or missing
 *   - AUDIT: docs/ai/AGENT-CORE.md present and system version is current
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parse } = require('./frontmatter');

const CORE = path.join('docs', 'ai', 'AGENT-CORE.md');
const SYSTEM = path.join('docs', 'ai', 'SYSTEM.md');

const MANIFESTS = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'Gemfile',
  'composer.json',
  'pubspec.yaml',
  'Package.swift',
  'mix.exs'
];

const LEGACY_INSTRUCTIONS = [
  'AGENT.md',
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.cursorrules',
  '.windsurfrules',
  '.clinerules',
  '.github/copilot-instructions.md',
  '.cursor/rules',
  '.agents/rules'
];

const ENTRY_POINTS = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md'
];

function exists(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

function compareSemver(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) {
      return (pa[i] || 0) - (pb[i] || 0);
    }
  }
  return 0;
}

function gitCommitCount(dir) {
  try {
    const out = execSync('git rev-list --count HEAD', {
      cwd: dir,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8'
    });
    return Number(out.trim()) || 0;
  } catch {
    return 0;
  }
}

function hasSourceCode(dir) {
  const codeDirs = ['src', 'app', 'apps', 'packages', 'lib', 'cmd', 'internal', 'pkg', 'server', 'client'];
  return codeDirs.some(d => exists(path.join(dir, d)) && fs.statSync(path.join(dir, d)).isDirectory());
}

/**
 * Detect project mode and gather structural evidence.
 */
function detect(dir, currentVersion = '1.0.0') {
  const evidence = [];
  const corePath = path.join(dir, CORE);
  const coreExists = exists(corePath);

  // Identify existing hand-written instruction files
  const legacy = LEGACY_INSTRUCTIONS.filter(f => {
    const p = path.join(dir, f);
    if (!exists(p)) return false;
    const st = fs.lstatSync(p);
    if (st.isSymbolicLink()) {
      const target = fs.readlinkSync(p) || '';
      return !target.includes('AGENT-CORE.md');
    }
    if (st.isDirectory()) {
      const names = fs.readdirSync(p);
      return names.length > 0;
    }
    // Check if it is an agent pointer
    const content = fs.readFileSync(p, 'utf8');
    return !content.includes('AGENT-CORE.md') && !content.includes('canonical instruction source');
  });

  const entryPoints = {};
  for (const e of ENTRY_POINTS) {
    const p = path.join(dir, e);
    if (!exists(p)) {
      entryPoints[e] = 'absent';
    } else if (fs.lstatSync(p).isSymbolicLink()) {
      entryPoints[e] = fs.existsSync(p) ? `symlink -> ${fs.readlinkSync(p)}` : 'broken symlink';
    } else {
      entryPoints[e] = 'file';
    }
  }

  let mode;
  let systemVersion = null;
  let system = null;

  if (coreExists) {
    evidence.push(`${CORE} exists: project AI system is present`);
    const sysPath = path.join(dir, SYSTEM);
    if (exists(sysPath)) {
      try {
        system = parse(fs.readFileSync(sysPath, 'utf8')).data;
        systemVersion = system.gabby_version || system.system_version || system.kiwi_version || null;
      } catch {
        system = {};
      }
    }

    if (!systemVersion || compareSemver(systemVersion, currentVersion) < 0) {
      mode = 'UPGRADE';
      evidence.push(`version ${systemVersion || 'unspecified'} is older than current ${currentVersion}`);
    } else {
      mode = 'AUDIT';
      evidence.push(`system is current with version ${currentVersion}`);
    }
  } else {
    evidence.push(`${CORE} absent: no docs/ai system yet`);
    const manifests = MANIFESTS.filter(m => exists(path.join(dir, m)));
    const commits = gitCommitCount(dir);
    const code = hasSourceCode(dir);

    if (manifests.length) evidence.push(`manifests: ${manifests.join(', ')}`);
    if (code) evidence.push('source directories present');
    if (commits > 0) evidence.push(`git history: ${commits} commit(s)`);
    if (legacy.length) evidence.push(`legacy instruction files: ${legacy.join(', ')} (must be migrated)`);

    mode = (manifests.length || code || commits > 3 || legacy.length) ? 'ADOPT' : 'INIT';
    if (mode === 'INIT') {
      evidence.push('greenfield repository with no previous code or instructions');
    }
  }

  return {
    mode,
    evidence,
    legacy,
    entryPoints,
    systemVersion,
    gabbyVersion: systemVersion,
    currentVersion,
    system
  };
}


/**
 * The exact prompt to hand to an agent.
 */
function prompt(det, opts = {}) {
  const globalRoot = opts.globalRoot || '~/.agents';
  const modeVerbs = {
    INIT: 'Set up',
    ADOPT: 'Set up',
    UPGRADE: 'Upgrade',
    AUDIT: 'Audit',
    AMEND: 'Amend a rule in',
    EXTEND: 'Extend'
  };
  const verb = modeVerbs[det.mode] || 'Run the gabby-system skill on';
  const lines = [
    `${verb} this project's AI system: run \`gabby agent ${det.mode}\` (or \`~/.agents/bin/gabby agent ${det.mode}\`) yourself and follow its output top to bottom.`,
    '',
    `Detected mode: ${det.mode}`,
    'Evidence:',
    ...(det.evidence || []).map(e => `  - ${e}`),
    '',
    `Global system: ${globalRoot} (GLOBAL.md, skills/, agents/, rules/). Project rules win on conflict; global principles fill gaps.`,
    'Follow the initializer exactly: inspect first, ask only what the repository cannot answer, never guess project facts, never perform Git operations.'
  ];
  if (det.mode === 'UPGRADE') lines.push('Produce the dry-run delta table and stop for approval before writing anything.');
  if (det.mode === 'AUDIT') lines.push('Read-only: report drift, propose fixes, apply only trivially safe structural repairs.');
  if (det.mode === 'ADOPT') lines.push('Run the reverse-engineering sweep and present the derived-facts confirmation table before asking questions.');
  return lines.join('\n');
}

module.exports = {
  prompt,
  detect,
  compareSemver,
  CORE,
  SYSTEM,
  MANIFESTS,
  LEGACY_INSTRUCTIONS
};
