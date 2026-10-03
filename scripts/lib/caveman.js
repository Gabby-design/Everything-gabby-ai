/**
 * Concise Communication Register (Caveman Mode) Resolution
 * Strictly enforces Core Principle 7: Be concise, direct, and factual.
 * Strictly enforces Core Principle 3: Zero emojis anywhere.
 *
 * Precedence:
 *   CAVEMAN_DEFAULT_MODE env -> project .caveman.json -> global config.json -> 'full'
 *
 * Zero dependencies. Node >= 18.
 */

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

const MODES = ['off', 'lite', 'full', 'ultra'];
const PROJECT_FILE = '.caveman.json';

function readMode(file) {
  try {
    if (!fs.lstatSync(file).isFile()) return null;
    const m = JSON.parse(fs.readFileSync(file, 'utf8')).defaultMode;
    return typeof m === 'string' && MODES.includes(m.toLowerCase()) ? m.toLowerCase() : null;
  } catch {
    return null;
  }
}

/** Project-level file that sets mode, searched upward from dir. */
function projectFile(dir) {
  let d = path.resolve(dir);
  for (let i = 0; i < 64; i++) {
    for (const rel of ['.caveman/config.json', PROJECT_FILE]) {
      const f = path.join(d, rel);
      if (readMode(f)) return f;
    }
    const parent = path.dirname(d);
    if (parent === d) break;
    d = parent;
  }
  return null;
}

/** User configuration path for global defaults. */
function userConfigPath() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'caveman', 'config.json');
  }
  return path.join(paths.home(), '.config', 'caveman', 'config.json');
}

/** Effective mode resolution. */
function effective(dir, config = paths.loadConfig()) {
  const env = process.env.CAVEMAN_DEFAULT_MODE;
  if (env && MODES.includes(env.toLowerCase())) {
    return { mode: env.toLowerCase(), source: 'env', file: null };
  }

  const pf = dir ? projectFile(dir) : null;
  if (pf) {
    return { mode: readMode(pf), source: 'project', file: pf };
  }

  const g = config.caveman && MODES.includes(config.caveman.mode) ? config.caveman.mode : null;
  if (g) {
    return { mode: g, source: 'global', file: paths.g('config.json') };
  }

  return { mode: 'full', source: 'default', file: null };
}

/** One-line statement agents act on, used in managed blocks and briefs. */
function statement(mode, { scope = 'global' } = {}) {
  const root = paths.tilde(paths.globalRoot());
  if (mode === 'off') {
    return `Communication mode: standard prose${scope === 'global' ? ' by default' : ' for this project'}.`;
  }

  const level = {
    lite: 'lite: no filler, hedging, or pleasantries; keep full sentences; stay direct.',
    full: 'full: drop articles (a/an/the), filler, hedging, and pleasantries; fragments allowed; no preamble; zero emojis.',
    ultra: 'ultra: as full, plus drop conjunctions; one word when one word suffices; each fact reported once.'
  }[mode] || 'direct and factual; zero emojis.';

  return [
    `Communication mode: **${mode}**${scope === 'global' ? ' by default' : ' for this project'}:`,
    `- ${level}`,
    '- Pattern: [component] [action] [reason]. [next step]. No conversational preamble, postamble, or fluff.',
    '- Output brevity: Keep responses minimal (under 3-5 lines) unless the user explicitly requests an in-depth breakdown.',
    '- Action focus: Prioritize tool execution over chat explanation. State what was done and stop.',
    '- Technical terms, code, commands, paths, numbers, and exact error strings stay verbatim.',
    '- Safety exception: use full clear sentences for security warnings, irreversible actions, or ambiguity.',
    '- Zero emojis anywhere in code, markdown, comments, or output (Core Principle 3).'
  ].join('\n');
}

module.exports = {
  MODES,
  PROJECT_FILE,
  effective,
  projectFile,
  userConfigPath,
  statement,
  readMode
};
