/**
 * Plan Builder
 * Builds global and project declarative operation plans across all enabled adapters.
 *
 * Zero dependencies. Node >= 18.
 */

const path = require('path');
const fs = require('fs');
const paths = require('./paths');
const registry = require('./registry');
const adapters = require('./adapters');
const { VENDOR_MARK } = require('./ops');

function context(overrides = {}) {
  const root = overrides.root || paths.globalRoot();
  const config = overrides.config || paths.loadConfig();
  return {
    root,
    homes: paths.agentHomes(),
    config,
    registry: registry.all(root),
    version: paths.version(),
    tilde: paths.tilde,
    ...overrides
  };
}

/** Remove duplicate ops (same kind + path), keeping the first. */
function dedupe(ops) {
  const seen = new Set();
  return ops.filter(op => {
    if (!op || !op.kind || !op.path) return false;
    const key = `${op.kind}:${op.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function globalPlan(ctx) {
  const ops = [];
  for (const a of adapters.enabled(ctx.config)) {
    if (typeof a.global === 'function') {
      ops.push(...a.global(ctx));
    }
  }
  return dedupe(ops);
}

/**
 * Project plan: entry-point links + pointers; with { vendor } also copies skills/rules.
 */
function projectPlan(ctx, dir, { vendor = false, skillNames = null } = {}) {
  const ops = [];
  for (const a of adapters.enabled(ctx.config)) {
    if (typeof a.project === 'function') {
      ops.push(...a.project(ctx, dir, { vendor }));
    }
  }

  if (vendor && ctx.registry) {
    const wanted = skillNames
      ? (ctx.registry.skills || []).filter(s => skillNames.includes(s.name))
      : (ctx.registry.skills || []).filter(s => s.invocable && s.name !== 'agent-system');

    for (const s of wanted) {
      ops.push({
        kind: 'copy',
        path: path.join(dir, '.agents', 'skills', s.name),
        source: s.dir,
        agent: 'vendor',
        why: `vendored skill ${s.name}`
      });
    }

    for (const r of (ctx.registry.rules || [])) {
      ops.push({
        kind: 'copy',
        path: path.join(dir, '.agents', 'rules', r.fileName),
        source: r.file,
        agent: 'vendor',
        why: `vendored rule ${r.name}`
      });
    }
  }

  return dedupe(ops);
}

/** Names of skills already vendored into a project (by marker file). */
function vendoredSkills(dir) {
  const d = path.join(dir, '.agents', 'skills');
  if (!fs.existsSync(d)) return [];
  try {
    return fs.readdirSync(d).filter(n => fs.existsSync(path.join(d, n, VENDOR_MARK)));
  } catch {
    return [];
  }
}

module.exports = {
  context,
  globalPlan,
  projectPlan,
  vendoredSkills,
  dedupe
};
