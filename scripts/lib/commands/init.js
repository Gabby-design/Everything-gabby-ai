/**
 * gabby init - detect project mode and print briefing / instructions for agent,
 * or immediately scaffold with --apply.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const { color, fail } = require('../cli');

const help = `gabby init [--apply|-y] [--mode MODE]

Run inside a project. Detects the mode (INIT / ADOPT / UPGRADE / AUDIT) from the filesystem.

Options:
  --apply, -y  immediately scaffold canonical docs/ai/, link adapters, and stamp
  --mode X     override the detected mode (INIT, ADOPT, UPGRADE, AMEND, AUDIT, EXTEND)

Without --apply, prints the project evidence and the instructions for your AI agent (Antigravity,
Claude Code, Gemini CLI, Copilot) to inspect and adopt the project.`;

async function run(args) {
  const dir = process.cwd();
  if (fs.existsSync(paths.REPO_ROOT) && fs.realpathSync(dir) === fs.realpathSync(paths.REPO_ROOT)) {
    fail('run gabby init inside a project, not inside the AI system root repository');
  }

  const det = detect.detect(dir, paths.version());
  if (args.flags.mode) det.mode = String(args.flags.mode).toUpperCase();

  if (args.flags.apply || args.flags.y || args.flags.yes) {
    const { initProject } = require('../../init-project');
    console.log(color.bold(`Scaffolding docs/ai system (${det.mode} mode)...`));
    initProject({ targetDir: dir, mode: det.mode, dryRun: false });
    console.log(color.green(`Initialized docs/ai system (gabby v${paths.version() || '2.0.0'}).`));
    console.log(color.dim('Run `gabby doctor --project` to audit the project.'));
    return 0;
  }

  const prompt = detect.prompt(det, { globalRoot: paths.tilde(paths.globalRoot()) });

  console.log(color.bold(`Detected mode: ${det.mode}`));
  for (const e of det.evidence) console.log(color.dim(`  - ${e}`));
  const hand = Object.entries(det.entryPoints).filter(([, v]) => v === 'hand-written file').map(([k]) => k);
  if (hand.length) {
    console.log(color.yellow(`  hand-written entry points (${hand.join(', ')}) will be migrated by the skill, not overwritten`));
  }

  console.log('\n' + color.bold('Automated Setup:') + ' run ' + color.cyan('gabby init --apply') + ' to scaffold docs/ai/ instantly.\n');
  console.log(color.bold('Or tell your AI agent (Antigravity, Claude Code, Gemini CLI, Copilot):') + '\n');
  console.log(`  "Set up this project's AI system"   *   "/gabby-system"   *   "run gabby agent and follow it"`);
  console.log(color.dim(`\nIt runs \`gabby agent ${det.mode}\` itself and follows the brief. Or paste this:`) + '\n');
  console.log(prompt);
  console.log(color.dim('\nThe agent writes docs/ai/, and finishes with `gabby stamp` so `gabby doctor` clears.'));
  return 0;
}

module.exports = { run, help };
