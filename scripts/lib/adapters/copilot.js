/**
 * GitHub Copilot assistant adapter.
 * Zero external dependencies. Node >= 18.
 */

const fs = require('fs');
const path = require('path');
const { linkEach, mdHeader } = require('./common');
const { stringify, parse } = require('../frontmatter');

const id = 'copilot';
const name = 'GitHub Copilot';

function global(ctx) {
  const home = ctx.homes.copilot;
  const reg = ctx.registry || {};
  return linkEach(reg.skills || [], path.join(home, 'skills'), { agent: id });
}

function instructionFile(rule) {
  const header = mdHeader('gabby vendor');
  const body = header + (rule.body || '');
  return stringify({
    applyTo: rule.applyTo || '**',
    description: rule.description || ''
  }, body);
}

function agentFile(agent) {
  const header = mdHeader('gabby vendor');
  const tools = Array.isArray(agent.tools)
    ? agent.tools
    : String(agent.tools || '').split(',').map(s => s.trim()).filter(Boolean);

  const fm = { name: agent.name, description: agent.description || '' };
  if (tools.length) fm.tools = tools;
  return stringify(fm, header + (agent.body || ''));
}

function promptFile(ctx, skill) {
  const root = ctx.tilde ? ctx.tilde(ctx.root) : ctx.root;
  const body = mdHeader('gabby vendor') +
    `Use the \`${skill.name}\` skill: read \`.agents/skills/${skill.name}/SKILL.md\` (or \`${root}/skills/${skill.name}/SKILL.md\`) in full and follow it exactly.\n\nTask: \${input}\n`;
  return stringify({ description: skill.description || '', agent: 'agent' }, body);
}

function withBody(item) {
  if (item.body) return item;
  if (!item.file || !fs.existsSync(item.file)) return item;
  const text = fs.readFileSync(item.file, 'utf8');
  return { ...item, body: parse(text).body.replace(/^\n+/, '') };
}

function project(ctx, dir, { vendor = false } = {}) {
  const ops = [
    {
      kind: 'symlink',
      path: path.join(dir, '.github', 'copilot-instructions.md'),
      target: '../docs/ai/AGENT-CORE.md',
      agent: id,
      why: 'Copilot entry point -> AGENT-CORE'
    }
  ];

  if (vendor && ctx.registry) {
    const config = ctx.config || {};
    const bridgesConfig = config.bridges || {};

    for (const r of ctx.registry.rules || []) {
      const item = withBody(r);
      if (r.name === 'caveman') {
        const eff = require('../caveman').effective(dir, ctx.config);
        item.body = `> Effective mode for this repository: **${eff.mode}** (${eff.source}).\n\n` + item.body;
      }
      ops.push({
        kind: 'file',
        path: path.join(dir, '.github', 'instructions', `${r.name}.instructions.md`),
        content: instructionFile(item),
        agent: id,
        why: `Copilot instruction ${r.name}`
      });
    }

    for (const a of ctx.registry.agents || []) {
      ops.push({
        kind: 'file',
        path: path.join(dir, '.github', 'agents', `${a.name}.agent.md`),
        content: agentFile(withBody(a)),
        agent: id,
        why: `Copilot agent ${a.name}`
      });
    }

    if (bridgesConfig.copilotPrompts && ctx.registry.skills) {
      for (const s of ctx.registry.skills.filter(s => s.invocable)) {
        ops.push({
          kind: 'file',
          path: path.join(dir, '.github', 'prompts', `${s.name}.prompt.md`),
          content: promptFile(ctx, s),
          agent: id,
          why: `Copilot prompt ${s.name}`
        });
      }
    }
  }

  return ops;
}

module.exports = {
  id,
  name,
  global,
  project,
  instructionFile,
  agentFile,
  promptFile
};
