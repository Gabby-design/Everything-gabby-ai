/**
 * Claude Code assistant adapter.
 * Zero external dependencies. Node >= 18.
 */

const fs = require('fs');
const path = require('path');
const { linkEach, globalBlock } = require('./common');

const id = 'claude';
const name = 'Claude Code';

/**
 * Merge hooks/hooks.json into ~/.claude/settings.json, tagging every entry
 * so re-runs replace rather than duplicate.
 */
function hooksOp(ctx, home, { onlyGuard = false } = {}) {
  const hooksFile = path.join(ctx.root, 'hooks', 'hooks.json');
  let src = {};
  if (fs.existsSync(hooksFile)) {
    try {
      src = JSON.parse(fs.readFileSync(hooksFile, 'utf8')).hooks || {};
    } catch {
      src = {};
    }
  }

  const tag = '[gabby]';
  const config = ctx.config || {};
  const hooksConfig = config.hooks || {};

  return {
    kind: 'json',
    path: path.join(home, 'settings.json'),
    agent: id,
    why: onlyGuard
      ? 'scope guard hook in settings.json (tagged [gabby]; backup written)'
      : 'merge gabby hooks into settings.json (tagged [gabby]; backup written)',
    merge(existing) {
      const out = { ...existing, hooks: { ...(existing.hooks || {}) } };
      for (const event of Object.keys(src)) {
        const kept = (out.hooks[event] || []).filter(e => !(e.description || '').startsWith(tag) && !(e.description || '').startsWith('[kiwi]'));
        const mine = (src[event] || [])
          .filter(e => !onlyGuard || /Scope guard/i.test(e.description || ''))
          .filter(e => hooksConfig.tmux || !/tmux/i.test(e.description || ''))
          .map(e => ({
            ...e,
            description: `${tag} ${e.description || ''}`.trim(),
            hooks: (e.hooks || []).map(h => ({
              ...h,
              command: (h.command || '').replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, ctx.root)
            }))
          }));
        out.hooks[event] = [...kept, ...mine];
        if (!out.hooks[event].length) delete out.hooks[event];
      }
      return out;
    }
  };
}

function global(ctx) {
  const home = ctx.homes.claude;
  const reg = ctx.registry || {};
  const config = ctx.config || {};
  const hooksConfig = config.hooks || {};

  const ops = [
    ...linkEach(reg.skills || [], path.join(home, 'skills'), { agent: id }),
    ...linkEach(reg.agents || [], path.join(home, 'agents'), { agent: id, ext: '.md' }),
    ...linkEach(reg.rules || [], path.join(home, 'rules'), { agent: id, ext: '.md' }),
    {
      kind: 'managed',
      path: path.join(home, 'CLAUDE.md'),
      inner: globalBlock(ctx, { importSyntax: true }),
      agent: id,
      why: 'global CLAUDE.md -> GLOBAL.md'
    }
  ];

  if (fs.existsSync(path.join(ctx.root, 'hooks', 'hooks.json'))) {
    ops.push(hooksOp(ctx, home, { onlyGuard: !hooksConfig.install }));
  }

  return ops;
}

function project(ctx, dir) {
  return [
    {
      kind: 'symlink',
      path: path.join(dir, 'CLAUDE.md'),
      target: 'docs/ai/AGENT-CORE.md',
      agent: id,
      why: 'Claude Code entry point -> AGENT-CORE'
    }
  ];
}

module.exports = {
  id,
  name,
  global,
  project,
  hooksOp
};
