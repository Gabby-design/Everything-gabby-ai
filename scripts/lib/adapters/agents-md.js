/**
 * Universal AGENTS.md adapter (Codex, Jules, Cursor, Windsurf, Cline, Zed).
 */

const path = require('path');
const { mdHeader } = require('./common');
const { stringify } = require('../frontmatter');

const id = 'agents-md';
const name = 'Universal AGENTS.md';

function global() {
  return [];
}

function project(ctx, dir) {
  const ops = [
    {
      kind: 'symlink',
      path: path.join(dir, 'AGENTS.md'),
      target: 'docs/ai/AGENT-CORE.md',
      agent: id,
      why: 'Universal AGENTS.md entry point -> AGENT-CORE'
    }
  ];

  const pointer = 'Read `docs/ai/AGENT-CORE.md` before acting -- it is the canonical instruction source for every agent in this repository.\n';

  if (ctx.config && ctx.config.bridges && ctx.config.bridges.cursor) {
    ops.push({
      kind: 'file',
      path: path.join(dir, '.cursor', 'rules', 'agent-core.mdc'),
      content: stringify({ description: 'Canonical agent instructions', alwaysApply: true }, mdHeader() + pointer),
      agent: id,
      why: 'Cursor rule -> AGENT-CORE'
    });
  }

  if (ctx.config && ctx.config.bridges && ctx.config.bridges.windsurf) {
    ops.push({
      kind: 'file',
      path: path.join(dir, '.windsurfrules'),
      content: mdHeader() + pointer,
      agent: id,
      why: 'Windsurf rules -> AGENT-CORE'
    });
  }

  return ops;
}

module.exports = {
  id,
  name,
  global,
  project
};
