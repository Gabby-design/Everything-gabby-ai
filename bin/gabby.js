#!/usr/bin/env node
/**
 * gabby - Universal AI Development System CLI
 *
 * Commands:
 *   Global:
 *     gabby sync [--dry-run]
 *     gabby install [--dry-run]
 *     gabby doctor [--global] [--project]
 *     gabby list [--json]
 *     gabby new <kind> <name>
 *     gabby caveman [status|off|lite|full|ultra|inherit] [--global]
 *     gabby uninstall [--yes]
 *   Project:
 *     gabby init [--mode MODE]
 *     gabby link [--vendor [names]]
 *     gabby vendor [names] (alias: export)
 *     gabby upgrade [--dry-run]
 *     gabby agent [MODE]
 *     gabby context [--json]
 *     gabby spec <section> | --toc | --find <text>
 *     gabby template [name]
 *     gabby stamp [--prd-dir <path>]
 *     gabby ctx [status|stamp|init]
 *     gabby check [dir]
 *     gabby help
 *
 * Zero dependencies. Node >= 18.
 */

const path = require('path');
const fs = require('fs');
const { parseArgs, color, fail } = require('../scripts/lib/cli');
const paths = require('../scripts/lib/paths');

const COMMANDS = {
  sync: () => require('../scripts/lib/commands/sync'),
  install: () => require('../scripts/lib/commands/install'),
  doctor: () => require('../scripts/lib/commands/doctor'),
  init: () => require('../scripts/lib/commands/init'),
  link: () => require('../scripts/lib/commands/link'),
  vendor: () => ({ run: (a) => require('../scripts/lib/commands/link').run(a, { vendor: true }), help: require('../scripts/lib/commands/link').help }),
  export: () => ({ run: (a) => require('../scripts/lib/commands/link').run(a, { vendor: true }), help: require('../scripts/lib/commands/link').help }),
  upgrade: () => require('../scripts/lib/commands/upgrade'),
  agent: () => require('../scripts/lib/commands/agent'),
  context: () => require('../scripts/lib/commands/context'),
  spec: () => require('../scripts/lib/commands/spec'),
  template: () => require('../scripts/lib/commands/template'),
  stamp: () => require('../scripts/lib/commands/stamp'),
  caveman: () => require('../scripts/lib/commands/caveman'),
  ctx: () => require('../scripts/lib/commands/ctx'),
  uninstall: () => require('../scripts/lib/commands/uninstall'),
  publish: () => require('../scripts/lib/commands/publish'),
  new: () => require('../scripts/lib/commands/new'),
  list: () => require('../scripts/lib/commands/list'),
  check: () => ({
    run: (args) => { handleCheck(args._); return 0; },
    help: 'gabby check [dir] - audit project docs/ai and assistant entry points'
  })
};

function printHelp() {
  console.log(color.bold('gabby') + ` - Universal AI Development System (${paths.version()})\n`);
  console.log('Global (run anywhere):');
  console.log('  sync       synchronize skills, agents, rules to ~/.agents and assistant configs');
  console.log('  install    wire ~/.agents into every agent\'s global config');
  console.log('  doctor     check links, managed blocks, frontmatter, drift (read-only)');
  console.log('  list       show every skill, agent persona, and rule');
  console.log('  new        scaffold a skill | workflow | agent | rule');
  console.log('  caveman    show or set caveman output style mode: off|lite|full|ultra');
  console.log('  uninstall  remove links and managed blocks from agent configs');
  console.log('  publish    push global system updates to remote git (asks first)\n');
  console.log('Project (inside a repo):');
  console.log('  init       detect mode and print agent brief');
  console.log('  link       create/repair AGENTS.md, CLAUDE.md, GEMINI.md, Copilot, Antigravity');
  console.log('  vendor     link + copy global skills/rules into repo (alias: export)');
  console.log('  upgrade    repair links + vendored copies, print agent UPGRADE brief');
  console.log('  agent      FOR AI AGENTS: complete brief for detected/given mode');
  console.log('  context    verified project brief (read-only)');
  console.log('  spec       print one section of the initializer specification');
  console.log('  template   print or list canonical templates');
  console.log('  stamp      record gabby_version, prd_dir, vendored in docs/ai/SYSTEM.md');
  console.log('  ctx        derived context docs: status | stamp | init');
  console.log('  check      audit project docs/ai and assistant entry points');
  console.log('  help       display this help message\n');
  console.log(`Global root: ${paths.tilde(paths.globalRoot())}`);
}

function handleSync(args = []) {
  const dryRun = args.includes('--dry-run');
  const targetIndex = args.indexOf('--target');
  const targetDir = targetIndex !== -1 && args[targetIndex + 1] ? args[targetIndex + 1] : null;
  const { syncGlobal } = require('../scripts/sync-global');
  return syncGlobal({ dryRun, targetDir });
}

function handleInit(args = []) {
  const dryRun = args.includes('--dry-run');
  let modeOverride = null;
  const modeIndex = args.indexOf('--mode');
  if (modeIndex !== -1 && args[modeIndex + 1]) {
    modeOverride = args[modeIndex + 1];
  }
  const targetDir = args.find(a => !a.startsWith('--')) || process.cwd();
  const { initProject } = require('../scripts/init-project');
  return initProject({ targetDir, mode: modeOverride, dryRun });
}

function handleList() {
  const listCmd = require('../scripts/lib/commands/list');
  return listCmd.run({ _: [], flags: {} });
}

function handleCheck(args = []) {
  const targetDir = path.resolve(args.find(a => !a.startsWith('--')) || process.cwd());
  const { inspectProject } = require('../scripts/init-project');
  const info = inspectProject(targetDir);

  console.log('=== Project AI System Audit ===');
  console.log(`Directory:       ${info.dir}`);
  console.log(`Project Name:    ${info.projectName}`);
  console.log(`Detected State:  ${info.detection.mode}`);
  console.log(`Evidence:        ${(info.detection.evidence || []).join('; ')}`);
  console.log(`Package Manager: ${info.packageManager}`);
  console.log(`Test Command:    ${info.commands.test}`);
  console.log(`Build Command:   ${info.commands.build}`);

  const corePath = path.join(targetDir, 'docs', 'ai', 'AGENT-CORE.md');
  const coreExists = fs.existsSync(corePath);
  console.log(`AGENT-CORE.md:   ${coreExists ? 'Present' : 'Missing (run gabby init)'}`);

  const entryPoints = [
    { name: 'CLAUDE.md', path: path.join(targetDir, 'CLAUDE.md') },
    { name: 'GEMINI.md', path: path.join(targetDir, 'GEMINI.md') },
    { name: 'AGENTS.md', path: path.join(targetDir, 'AGENTS.md') },
    { name: '.github/copilot-instructions.md', path: path.join(targetDir, '.github', 'copilot-instructions.md') },
    { name: '.agents/rules/00-agent-core.md', path: path.join(targetDir, '.agents', 'rules', '00-agent-core.md') }
  ];

  console.log('\nEntry Points:');
  for (const ep of entryPoints) {
    const exists = fs.existsSync(ep.path);
    console.log(`  - ${ep.name.padEnd(36)} ${exists ? 'Configured' : 'Missing'}`);
  }
}

function handleDoctor(args = []) {
  const doctorCmd = require('../scripts/lib/commands/doctor');
  const flags = {};
  if (args.includes('--global')) flags.global = true;
  if (args.includes('--project')) flags.project = true;
  if (args.includes('--verbose') || args.includes('-v')) flags.verbose = true;
  return doctorCmd.run({ _: [], flags });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args._.shift();
  if (!name || name === 'help' || (args.flags.help && !name)) {
    printHelp();
    return 0;
  }
  const load = COMMANDS[name.toLowerCase()];
  if (!load) {
    fail(`unknown command "${name}"\n\nRun "gabby help" for available commands.`);
  }
  const cmd = load();
  if (args.flags.help || args.flags.h) {
    console.log(cmd.help || `Help for gabby ${name}`);
    return 0;
  }
  return cmd.run(args);
}

if (require.main === module) {
  main().then(code => {
    if (typeof code === 'number' && code !== 0) process.exit(code);
  }).catch(err => {
    console.error(color.red('error: ') + (err.stack || err.message));
    process.exit(1);
  });
}

module.exports = {
  main,
  handleSync,
  handleInit,
  handleList,
  handleCheck,
  handleDoctor,
  COMMANDS
};
