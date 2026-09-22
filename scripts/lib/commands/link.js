/**
 * gabby link - create/repair a project's agent entry points and adapters.
 * gabby vendor - link + copy referenced global skills/rules into the repo (for cloud agents / teammates).
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const plan = require('../plan');
const ops = require('../ops');
const detect = require('../detect');
const { setKey } = require('../frontmatter');
const { color, printResults, printSummary, fail } = require('../cli');

const help = `gabby link [--vendor [name,name]] [--dry-run] [--verbose]
gabby vendor [name,name] [--dry-run]     (alias: export)

Requires docs/ai/AGENT-CORE.md (the gabby-system skill writes it). Creates or repairs:
  AGENTS.md, CLAUDE.md, GEMINI.md, .github/copilot-instructions.md -> symlinks to docs/ai/AGENT-CORE.md
  .agents/rules/00-agent-core.md                                   -> pointer for Antigravity
  .cursor/rules / .windsurfrules                                    -> when enabled in config.json
With --vendor (or \`gabby vendor\`): also copies the named global skills (default: every invocable skill)
and all global rules into .agents/skills and .agents/rules, and generates .github/instructions
and .github/agents so cloud agents and teammates without ~/.agents get the same rules.
Hand-written files in the way are reported as conflicts and never overwritten.`;

async function run(args, { vendor = false } = {}) {
  const dir = process.cwd();
  const dryRun = !!args.flags['dry-run'];
  if (!fs.existsSync(path.join(dir, detect.CORE))) {
    fail(`${detect.CORE} not found. Run \`gabby init\` and let the gabby-system skill write the canonical core first.`);
  }
  const names = vendor && (args._[0] || (typeof args.flags.vendor === 'string' && args.flags.vendor))
    ? String(args._[0] || args.flags.vendor).split(',').map(s => s.trim()).filter(Boolean)
    : null;
  const ctx = plan.context();
  if (names) {
    const known = ctx.registry.skills.map(s => s.name);
    const unknown = names.filter(n => !known.includes(n));
    if (unknown.length) fail(`unknown skill(s): ${unknown.join(', ')} - see \`gabby list\``);
  }
  const previously = plan.vendoredSkills(dir);
  const skillNames = names || (previously.length ? previously : null);
  const p = plan.projectPlan(ctx, dir, { vendor: vendor || previously.length > 0, skillNames });

  console.log(color.bold(`gabby ${vendor ? 'vendor' : 'link'}${dryRun ? ' (dry run)' : ''}`) + color.dim(`  ${dir}`));
  const { results, summary } = ops.run(p, { dryRun });
  printResults(results, { verbose: !!args.flags.verbose, tilde: p => path.relative(dir, p) });
  printSummary(summary);

  if (!dryRun && (vendor || previously.length)) recordVendored(dir, plan.vendoredSkills(dir));
  if (summary.conflict) {
    console.log(color.red('\nConflicts: hand-written files were left untouched. Migrate them manually or move them aside and re-run.'));
  }
  return summary.conflict ? 2 : 0;
}

/** Keep docs/ai/SYSTEM.md's `vendored:` field in sync (only touches that one frontmatter key). */
function recordVendored(dir, names) {
  const sys = path.join(dir, detect.SYSTEM);
  if (!fs.existsSync(sys)) return;
  const text = fs.readFileSync(sys, 'utf8');
  const next = setKey(setKey(text, 'vendored', names), 'gabby_version', paths.version());
  if (next !== text) {
    fs.writeFileSync(sys, next);
    console.log(color.dim(`updated ${detect.SYSTEM}: vendored = [${names.join(', ')}]`));
  }
}

module.exports = { run, help, recordVendored };
