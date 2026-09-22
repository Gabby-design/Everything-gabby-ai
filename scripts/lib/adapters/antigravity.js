/**
 * Google Antigravity assistant adapter.
 * Zero external dependencies. Node >= 18.
 */

const fs = require('fs');
const path = require('path');
const { linkEach, globalBlock, corePointer, cavemanPointer } = require('./common');

const id = 'antigravity';
const name = 'Google Antigravity';

function global(ctx) {
  const configHome = ctx.homes.antigravityConfig;
  const reg = ctx.registry || {};

  const ops = [
    ...linkEach(reg.skills || [], path.join(configHome, 'skills'), { agent: id }),
    ...linkEach(reg.rules || [], path.join(configHome, 'rules'), { agent: id, ext: '.md' }),
    // GEMINI.md is shared with Gemini CLI; deduped when both are enabled
    {
      kind: 'managed',
      path: path.join(ctx.homes.gemini, 'GEMINI.md'),
      inner: globalBlock(ctx),
      agent: id,
      why: 'global GEMINI.md -> GLOBAL.md (shared with Gemini CLI)'
    }
  ];

  if (ctx.homes.antigravityCli && fs.existsSync(ctx.homes.antigravityCli)) {
    ops.push(...linkEach(reg.skills || [], path.join(ctx.homes.antigravityCli, 'skills'), {
      agent: id,
      why: 'Antigravity CLI skill'
    }));
  }

  return ops;
}

/**
 * Antigravity reads workspace rules from .agents/rules/.
 * Drop pointers to canonical AGENT-CORE and effective caveman register.
 */
function project(ctx, dir) {
  return [
    {
      kind: 'file',
      path: path.join(dir, '.agents', 'rules', '00-agent-core.md'),
      content: corePointer(ctx),
      agent: id,
      why: 'workspace rule -> AGENT-CORE'
    },
    {
      kind: 'file',
      path: path.join(dir, '.agents', 'rules', '01-caveman.md'),
      content: cavemanPointer(ctx, dir),
      agent: id,
      why: 'workspace rule -> caveman mode'
    }
  ];
}

module.exports = {
  id,
  name,
  global,
  project
};
