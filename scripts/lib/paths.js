/**
 * Universal Paths and Configuration Manager
 * Resolves repository root, global roots (~/.agents), assistant homes, and configuration.
 *
 * Zero dependencies. Node >= 18.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function home() {
  return process.env.AGENT_TEST_HOME || process.env.KIWI_TEST_HOME || os.homedir();
}

/** The global root: $GABBY_AI_HOME, $GABBY_HOME, or $AGENTS_HOME, else ~/.gabby (or ~/.agents fallback) */
function globalRoot() {
  if (process.env.GABBY_AI_HOME) return process.env.GABBY_AI_HOME;
  if (process.env.GABBY_HOME) return process.env.GABBY_HOME;
  if (process.env.AGENTS_HOME) return process.env.AGENTS_HOME;
  const gabbyDir = path.join(home(), '.gabby');
  const agentsDir = path.join(home(), '.agents');
  return fs.existsSync(gabbyDir) ? gabbyDir : (fs.existsSync(agentsDir) ? agentsDir : gabbyDir);
}

/** True when the global root resolves to this repository. */
function globalRootIsRepo() {
  try {
    return fs.realpathSync(globalRoot()) === fs.realpathSync(REPO_ROOT);
  } catch {
    return false;
  }
}

/** Absolute paths inside the global root. */
function g(...parts) {
  return path.join(globalRoot(), ...parts);
}

/** Per-agent global homes. */
function agentHomes() {
  const h = home();
  return {
    claude: path.join(h, '.claude'),
    codex: path.join(h, '.codex'),
    agents: path.join(h, '.agents'),
    gabby: path.join(h, '.gabby'),
    gemini: path.join(h, '.gemini'),
    antigravityConfig: path.join(h, '.gemini', 'config'),
    antigravityCli: path.join(h, '.gemini', 'antigravity-cli'),
    copilot: path.join(h, '.copilot')
  };
}

const DEFAULT_CONFIG = {
  agents: {
    claude: true,
    antigravity: true,
    gemini: true,
    copilot: true,
    codex: true,
    agentsMd: true
  },
  hooks: { install: false, tmux: false },
  wrappers: { codex: true, gemini: true },
  bridges: { cursor: false, windsurf: false, copilotPrompts: false },
  prdDir: 'docs/ai/prd',
  caveman: { mode: 'full' },
  contextDocs: ['MEMORY', 'NOTES', 'CHANGELOG']
};

function deepMerge(base, over) {
  const out = { ...base };
  for (const k of Object.keys(over || {})) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && typeof base[k] === 'object') {
      out[k] = deepMerge(base[k], over[k]);
    } else {
      out[k] = over[k];
    }
  }
  return out;
}

/** Loads config.json from global root or repository root, falling back to defaults. */
function loadConfig() {
  const candidates = [g('config.json'), path.join(REPO_ROOT, 'config.json')];
  for (const c of candidates) {
    try {
      return deepMerge(DEFAULT_CONFIG, JSON.parse(fs.readFileSync(c, 'utf8')));
    } catch {
      // try next
    }
  }
  return { ...DEFAULT_CONFIG };
}

function version() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    return pkg.version || '2.0.0';
  } catch {
    return '2.0.0';
  }
}

/** Display path with ~ shorthand for user home directory. */
function tilde(p) {
  if (!p) return '';
  const h = home();
  return p.startsWith(h) ? '~' + p.slice(h.length) : p;
}

module.exports = {
  REPO_ROOT,
  home,
  globalRoot,
  globalRootIsRepo,
  g,
  agentHomes,
  DEFAULT_CONFIG,
  deepMerge,
  loadConfig,
  version,
  tilde
};
