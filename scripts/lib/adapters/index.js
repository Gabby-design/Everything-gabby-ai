/**
 * Adapter dispatcher and registry.
 * Dispatches declarative operations across all supported AI coding assistants.
 */

const claude = require('./claude');
const antigravity = require('./antigravity');
const gemini = require('./gemini');
const copilot = require('./copilot');
const codex = require('./codex');
const agentsMd = require('./agents-md');

const ALL = [claude, antigravity, gemini, copilot, codex, agentsMd];

/**
 * Filter adapters enabled by configuration.
 * agents-md is always enabled as the universal standard entry point.
 */
function enabled(config = {}) {
  const agentsConfig = config.agents || {};
  return ALL.filter(a => a.id === 'agents-md' || agentsConfig[a.id] !== false);
}

/**
 * Deduplicate operations by target path.
 */
function dedupeOps(ops) {
  const seen = new Set();
  const deduped = [];

  for (const op of ops) {
    if (!op || !op.path) continue;
    const key = `${op.kind}:${op.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(op);
    }
  }

  return deduped;
}

/**
 * Generate project-level operations across all enabled adapters.
 */
function project(ctx, dir, options = {}) {
  const activeAdapters = enabled(ctx.config);
  const ops = [];

  for (const adapter of activeAdapters) {
    if (typeof adapter.project === 'function') {
      const adapterOps = adapter.project(ctx, dir, options) || [];
      ops.push(...adapterOps);
    }
  }

  return dedupeOps(ops);
}

/**
 * Generate global-level operations across all enabled adapters.
 */
function global(ctx, options = {}) {
  const activeAdapters = enabled(ctx.config);
  const ops = [];

  for (const adapter of activeAdapters) {
    if (typeof adapter.global === 'function') {
      const adapterOps = adapter.global(ctx, options) || [];
      ops.push(...adapterOps);
    }
  }

  return dedupeOps(ops);
}

module.exports = {
  ALL,
  enabled,
  project,
  global,
  claude,
  antigravity,
  gemini,
  copilot,
  codex,
  agentsMd
};
