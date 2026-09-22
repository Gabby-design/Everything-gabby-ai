/**
 * gabby doctor - read-only health check of the global install and/or the current project.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const plan = require('../plan');
const ops = require('../ops');
const registry = require('../registry');
const detect = require('../detect');
const { color, styleStatus } = require('../cli');

const help = `gabby doctor [--global] [--project] [--verbose]

Read-only. Checks the global install (links, managed blocks, generated wrappers, frontmatter)
and, when run inside a project, the project's entry points and system version. Reports drift;
never fixes anything - run \`gabby sync\` / \`gabby link\` to repair.`;

function section(title) {
  console.log('\n' + color.bold(title));
}

function checkGlobal(verbose) {
  let issues = 0;
  const root = paths.globalRoot();
  section(`Global system  ${color.dim(paths.tilde(root))}`);
  if (!fs.existsSync(root)) {
    console.log(color.red('  missing - run `gabby sync` from your checkout'));
    return 1;
  }
  const problems = registry.validate(root);
  for (const p of problems) {
    console.log(`  ${styleStatus('conflict')} ${paths.tilde(p.file)}: ${p.problem}`);
    issues++;
  }
  if (!problems.length) console.log(color.dim('  frontmatter: ok'));

  const ctx = plan.context();
  const checks = ops.check(plan.globalPlan(ctx));
  const byAgent = {};
  for (const c of checks) (byAgent[c.op.agent] = byAgent[c.op.agent] || []).push(c);
  for (const [agent, rows] of Object.entries(byAgent)) {
    const bad = rows.filter(r => r.state !== 'ok');
    issues += bad.length;
    console.log(`  ${agent.padEnd(12)} ${bad.length ? color.yellow(`${bad.length} issue(s)`) : color.dim('ok')} ${color.dim(`(${rows.length} items)`)}`);
    for (const r of (verbose ? rows : bad)) console.log(`     ${styleStatus(r.state).padEnd(18)} ${paths.tilde(r.op.path)}`);
  }
  return issues;
}

function checkProject(dir, verbose) {
  let issues = 0;
  section(`Project  ${color.dim(dir)}`);
  const det = detect.detect(dir, paths.version());
  console.log(`  mode: ${color.bold(det.mode)}`);
  for (const e of det.evidence) console.log(color.dim(`    - ${e}`));
  if (!fs.existsSync(path.join(dir, detect.CORE))) {
    console.log(color.yellow('  no docs/ai/AGENT-CORE.md - run `gabby init` to start the initializer'));
    return issues + 1;
  }
  const ctx = plan.context();
  const vendored = plan.vendoredSkills(dir);
  const checks = ops.check(plan.projectPlan(ctx, dir, { vendor: vendored.length > 0, skillNames: vendored.length ? vendored : null }));
  for (const c of checks) {
    if (c.state !== 'ok') issues++;
    if (verbose || c.state !== 'ok') {
      console.log(`  ${styleStatus(c.state).padEnd(18)} ${path.relative(dir, c.op.path)}${c.state === 'conflict' ? color.dim('  (hand-written file - migrate or move aside)') : ''}`);
    }
  }
  const cavemanFile = path.join(dir, '.caveman.json');
  if (fs.existsSync(cavemanFile)) {
    const mode = require('../caveman').readMode(cavemanFile);
    if (!mode) { console.log(`  ${styleStatus('conflict')} .caveman.json is not valid ({"defaultMode": "off|lite|full|ultra"})`); issues++; }
    else console.log(color.dim(`  caveman: ${mode} (project)`));
  } else {
    console.log(color.dim(`  caveman: ${require('../caveman').effective(dir).mode} (inherited)`));
  }
  const ctxlib = require('../ctx');
  const conf = ctxlib.configured(dir);
  if (conf.length) {
    for (const r of ctxlib.status(dir)) {
      if (r.state === 'current') {
        if (verbose) console.log(color.dim(`  context/${r.name}: current`));
        continue;
      }
      issues++;
      console.log(`  ${styleStatus(r.state === 'stale' ? 'stale' : r.state === 'missing' ? 'missing' : 'conflict').padEnd(18)} context/${r.name} - ${r.state === 'no-source' ? 'source missing' : 'agent must regenerate from ' + path.relative(dir, r.source) + ' then `gabby ctx stamp ' + r.name + '`'}`);
    }
  }
  if (!issues) console.log(color.dim('  entry points and adapters: ok'));
  if (vendored.length) console.log(color.dim(`  vendored skills: ${vendored.join(', ')}`));
  if (det.mode === 'UPGRADE') {
    issues++;
    console.log(color.yellow(`  system is behind gabby v${det.currentVersion} (${det.gabbyVersion || det.kiwiVersion ? 'version ' + (det.gabbyVersion || det.kiwiVersion) : 'no version'} in SYSTEM.md)`));
    console.log(color.dim('    run `gabby upgrade` or tell your agent "upgrade this project AI system"'));
  }
  return issues;
}

async function run(args) {
  const inProject = fs.existsSync(path.join(process.cwd(), 'docs', 'ai')) || fs.existsSync(path.join(process.cwd(), '.git'));
  const doGlobal = args.flags.global || !args.flags.project;
  const doProject = args.flags.project || (!args.flags.global && inProject && fs.realpathSync(process.cwd()) !== fs.realpathSync(paths.REPO_ROOT));
  let issues = 0;
  if (doGlobal) issues += checkGlobal(!!args.flags.verbose);
  if (doProject) issues += checkProject(process.cwd(), !!args.flags.verbose);
  console.log(issues ? color.yellow(`\n${issues} issue(s) found`) : color.green('\nAll clear'));
  return issues ? 1 : 0;
}

module.exports = { run, help, checkGlobal, checkProject };
