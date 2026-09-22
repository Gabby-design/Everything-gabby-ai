/**
 * gabby agent - the one command an AI agent runs. Its output is the complete brief for the
 * detected (or given) mode: tools, verified project context, the shared steps, the mode
 * runbook, the global memory/notes, templates, and how to finish. The agent follows it.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const context = require('./context');
const template = require('./template');
const { fail } = require('../cli');

const MODES = ['INIT', 'ADOPT', 'UPGRADE', 'AUDIT', 'AMEND', 'EXTEND'];

const help = `gabby agent [MODE] [--brief]

For AI agents. Run it inside a project and follow the output top to bottom. It contains:
the mode (detected, or the one you pass - AMEND / EXTEND must be passed), the tools you may
run, the verified project context, the shared steps, the runbook for the mode, the owner's
global memory and notes, the templates, and the finishing checklist. Read-only.
  --brief   omit the project context (you already ran \`gabby context\`)`;

function read(p) { return fs.readFileSync(p, 'utf8'); }

function runbook(name) {
  const local = path.join(paths.REPO_ROOT, 'skills', 'gabby-system', 'runbooks', name);
  if (fs.existsSync(local)) return read(local);
  return read(paths.g('skills', 'gabby-system', 'runbooks', name));
}

function stripTitle(md) { return md.replace(/^# .*\n+/, ''); }
function demote(md) { return md.replace(/^(#{1,5})\s/gm, '#$1 '); }

async function run(args) {
  const dir = process.cwd();
  const det = detect.detect(dir, paths.version());
  const mode = args._[0] ? String(args._[0]).toUpperCase() : det.mode;
  if (!MODES.includes(mode)) fail(`unknown mode "${mode}" - one of ${MODES.join(', ')}`);
  const root = paths.tilde(paths.globalRoot());
  const gabby = 'gabby';
  const L = [];

  L.push(`# gabby agent - ${mode} on ${path.basename(dir)}`, '');
  L.push(`You are the **AI Project System Initializer** (the \`gabby-system\` skill, v${paths.version()}). This document is your complete brief. Follow it **top to bottom**; stop at every **STOP** and wait for the owner; never perform an autonomous Git commit/push; never guess a project fact; never overwrite existing knowledge. When you need more depth than this brief gives, pull it with the tools below rather than reading the whole specification.`, '');
  if (mode !== det.mode) L.push(`> Mode **${mode}** was requested explicitly; the filesystem alone would say ${det.mode}. ${mode === 'AMEND' || mode === 'EXTEND' ? 'That is expected - this mode comes from the owner intent.' : 'Confirm with the owner that the override is intended before writing anything.'}`, '');

  L.push('## 1. Your tools', '', 'All safe: read-only or idempotent, none touches Git. If `gabby` is not on PATH use `~/.agents/bin/gabby`.', '');
  L.push('| Command | Use it for |', '| --- | --- |');
  L.push(`| \`${gabby} context\` | re-read the verified project brief (already included below) |`);
  L.push(`| \`${gabby} spec <n>\` · \`${gabby} spec --toc\` · \`${gabby} spec --find <text>\` | print one section of the initializer specification (e.g. \`${gabby} spec 22.3\`) - depth on demand |`);
  L.push(`| \`${gabby} template\` · \`${gabby} template <NAME>\` | list / print a docs/ai template to write from |`);
  L.push(`| \`${gabby} list\` | every global skill, agent persona, and rule |`);
  L.push(`| \`${gabby} link\` | after docs/ai/AGENT-CORE.md exists: entry-point symlinks + adapters (reports hand-written files as conflicts, never overwrites) |`);
  L.push(`| \`${gabby} vendor <a,b>\` | only if the owner wants cloud agents / teammates covered: copy global skills + rules into .agents/ |`);
  L.push(`| \`${gabby} stamp [--prd-dir P]\` | **last step of INIT / ADOPT / UPGRADE** - records gabby_version in SYSTEM.md; until it runs, \`gabby doctor\` reports project as behind |`);
  L.push(`| \`${gabby} doctor --project\` | end of every mode; paste its output into your report |`);
  L.push('');

  const eff = require('../caveman').effective(dir);
  L.push('## 2. The owner global layer - READ-ONLY from this project (RULE-SCOPE-001)', '');
  L.push('Nothing in this section, and nothing under `~/.agents` or the agent skills/rules directories that link to it, is edited from this repository. Cross-project facts you discover go into your report as proposals; project facts go into this project files.', '');
  L.push(`Output style right now: ${require('../caveman').statement(eff.mode, { scope: eff.source === 'project' ? 'project' : 'global' })}`, '');
  L.push(`Constitution: \`${root}/GLOBAL.md\` (already in your global instructions; re-read Section 2 non-negotiables and Section 7 two layers if unsure). Global skills/agents/rules: \`${root}/{skills,agents,rules}/\`. Project documents win on conflict; the global layer fills gaps. Project facts never go into global files - propose them in your report instead.`, '');
  const reg = require('../registry').all(paths.globalRoot());
  L.push('### Global rules (for the rules decision - adopt / override / not applicable, per project)', '');
  for (const r of reg.rules) L.push(`- \`${r.name}\` - ${r.description}`);
  L.push('');
  for (const f of ['MEMORY.md', 'NOTES.md']) {
    const p = paths.g(f);
    if (fs.existsSync(p)) L.push(`### Global ${f}`, '', demote(demote(stripTitle(read(p)))).trim(), '');
  }

  if (!args.flags.brief) {
    L.push('## 3. Verified project context', '');
    L.push(demote(stripTitle(context.render(context.gather(dir))).replace(/\n---\nNext:.*\n?$/s, '')).trim(), '');
  } else {
    L.push('## 3. Verified project context', '', `(omitted - run \`${gabby} context\`)`, '');
  }

  L.push('## 4. Shared steps (every mode)', '', demote(stripTitle(runbook('_shared.md'))).trim(), '');
  L.push(`## 5. Runbook - ${mode}`, '', demote(stripTitle(runbook(`${mode}.md`))).trim(), '');

  L.push('## 6. Templates', '', `Write every document from its template (\`${gabby} template <NAME>\`); keep frontmatter contract; replace every \`{{placeholder}}\`; delete guidance comments.`, '');
  for (const t of template.list()) L.push(`- \`${t.replace(/\.md$/, '')}\``);
  L.push('');

  L.push('## 7. Finish', '');
  L.push(`1. \`${gabby} link\` - resolve any conflict by migrating the hand-written file, never by overwriting.`);
  if (['INIT', 'ADOPT', 'UPGRADE'].includes(mode)) L.push(`2. \`${gabby} stamp\` (add \`--prd-dir <path>\` if PRDs live elsewhere than \`docs/ai/prd/\`).`);
  L.push(`${['INIT', 'ADOPT', 'UPGRADE'].includes(mode) ? 3 : 2}. \`${gabby} doctor --project\` - must be clean; include its output.`);
  L.push(`${['INIT', 'ADOPT', 'UPGRADE'].includes(mode) ? 4 : 3}. Report in the mode's format, list any global MEMORY/NOTES entries you propose, and end with: **No branch, stage, commit or history operation was performed. Ready for owner review and commit.** Then ask whether the owner wants a commit made.`);
  L.push('');
  console.log(L.join('\n'));
  return 0;
}

module.exports = { run, help, MODES };
