/**
 * gabby install - wire the global root into every enabled agent's global config.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const plan = require('../plan');
const ops = require('../ops');
const registry = require('../registry');
const { color, printResults, printSummary, fail } = require('../cli');

const help = `gabby install [--dry-run] [--hooks] [--no-hooks] [--verbose]

Wires ~/.agents (or $GABBY_AI_HOME) into the global config of every enabled agent:
symlinks for skills/agents/rules, generated slash-command wrappers, and a managed block in
each agent's global instruction file pointing at GLOBAL.md. Idempotent.

  --dry-run   show what would change, write nothing
  --hooks     also merge hooks/hooks.json into ~/.claude/settings.json
  --verbose   list unchanged items too`;

async function ensureGlobalRoot(dryRun) {
  const root = paths.globalRoot();
  if (fs.existsSync(root)) {
    return root;
  }
  if (!dryRun) fs.mkdirSync(root, { recursive: true });
  return root;
}

async function run(args) {
  const dryRun = !!args.flags['dry-run'];
  await ensureGlobalRoot(dryRun);
  const scanRoot = paths.REPO_ROOT;

  const problems = registry.validate(scanRoot);
  if (problems.length) {
    console.log(color.yellow(`${problems.length} frontmatter problem(s) - fix these first.`));
    for (const p of problems.slice(0, 10)) console.log(`  ${paths.tilde(p.file)}: ${p.problem}`);
    fail('refusing to install components with invalid frontmatter');
  }

  const config = paths.loadConfig();
  if (args.flags.hooks) config.hooks.install = true;
  if (args.flags['no-hooks']) config.hooks.install = false;
  const ctx = plan.context({ config, registry: registry.all(scanRoot) });
  const gplan = plan.globalPlan(ctx);

  console.log(color.bold(`gabby install${dryRun ? ' (dry run)' : ''}`) + color.dim(`  root ${paths.tilde(ctx.root)} * v${ctx.version} * ${ctx.registry.skills.length} skills, ${ctx.registry.agents.length} agents, ${ctx.registry.rules.length} rules`));
  const { results, summary } = ops.run(gplan, { dryRun });
  printResults(results, { verbose: !!args.flags.verbose, tilde: paths.tilde });
  printSummary(summary);

  return summary.conflict ? 2 : 0;
}

module.exports = { run, help };
