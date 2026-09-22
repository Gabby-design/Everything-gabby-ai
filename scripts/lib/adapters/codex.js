/**
 * OpenAI Codex assistant adapter.
 * Zero external dependencies. Node >= 18.
 */

const path = require('path');
const { linkEach, globalBlock, mdHeader } = require('./common');
const { stringify } = require('../frontmatter');

const id = 'codex';
const name = 'OpenAI Codex';

function wrapper(ctx, skill) {
  const root = ctx.tilde ? ctx.tilde(ctx.root) : ctx.root;
  const body = mdHeader('gabby install') +
    `Use the \`${skill.name}\` skill: read \`${root}/skills/${skill.name}/SKILL.md\` (also installed at \`~/.agents/skills/${skill.name}\`) in full and follow it exactly.\n\nTask: $ARGUMENTS\n`;
  return stringify({ description: skill.description || '' }, body);
}

function global(ctx) {
  const reg = ctx.registry || {};
  const config = ctx.config || {};
  const wrappersConfig = config.wrappers || {};

  const ops = [
    ...linkEach(reg.skills || [], path.join(ctx.homes.agents, 'skills'), { agent: id }),
    {
      kind: 'managed',
      path: path.join(ctx.homes.codex, 'AGENTS.md'),
      inner: globalBlock(ctx),
      agent: id,
      why: 'global AGENTS.md -> GLOBAL.md'
    }
  ];

  if (wrappersConfig.codex !== false && reg.skills) {
    for (const s of reg.skills.filter(s => s.invocable)) {
      ops.push({
        kind: 'file',
        path: path.join(ctx.homes.codex, 'prompts', `${s.name}.md`),
        content: wrapper(ctx, s),
        agent: id,
        why: `Codex prompt wrapper /prompts:${s.name}`
      });
    }
  }

  return ops;
}

function project() {
  // Project-level AGENTS.md is handled by agents-md adapter
  return [];
}

module.exports = {
  id,
  name,
  global,
  project,
  wrapper
};
