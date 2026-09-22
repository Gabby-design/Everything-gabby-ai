/**
 * gabby caveman - the concise output-style flag, global and per project.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const caveman = require('../caveman');
const plan = require('../plan');
const ops = require('../ops');
const detect = require('../detect');
const { color, fail } = require('../cli');

const help = `gabby caveman [status | off | lite | full | ultra | inherit] [--global]

Project (default): writes .caveman.json ({"defaultMode": "<mode>"}) in the current directory -
the same file upstream caveman reads - and regenerates project pointers. \`inherit\` removes it so
global default applies.
Global (--global): sets caveman.mode in config.json, mirrors to ~/.config/caveman/config.json.
Precedence: CAVEMAN_DEFAULT_MODE env -> project .caveman.json -> global config -> full.
--global from inside a project needs --yes (owner only; agents never pass it) - RULE-SCOPE-001.`;

async function run(args) {
  const dir = process.cwd();
  const what = (args._[0] || 'status').toLowerCase();
  const config = paths.loadConfig();

  if (what === 'status') {
    const eff = caveman.effective(dir, config);
    console.log(`${color.bold('caveman')}: ${eff.mode}  ${color.dim(`(${eff.source}${eff.file ? ' · ' + paths.tilde(eff.file) : ''})`)}`);
    console.log(color.dim(`global default: ${config.caveman.mode} · project file: ${caveman.projectFile(dir) ? paths.tilde(caveman.projectFile(dir)) : 'none'}`));
    return 0;
  }
  if (what !== 'inherit' && !caveman.MODES.includes(what)) {
    fail(`unknown mode "${what}" - off, lite, full, ultra, inherit, status`);
  }

  if (args.flags.global) {
    if (what === 'inherit') fail('`inherit` is a project setting; give --global a mode');
    const scope = require('../scope');
    if (!scope.inGlobal() && !args.flags.yes) {
      fail(scope.refusal('gabby caveman --global') + ' Use `gabby caveman <mode>` for this project, or add --yes if you (the owner) really mean the global default.');
    }
    const cfgPath = paths.g('config.json');
    const cur = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : config;
    cur.caveman = { ...(cur.caveman || {}), mode: what };
    fs.writeFileSync(cfgPath, JSON.stringify(cur, null, 2) + '\n');
    const up = caveman.userConfigPath();
    fs.mkdirSync(path.dirname(up), { recursive: true });
    let upstream = {};
    try { upstream = JSON.parse(fs.readFileSync(up, 'utf8')); } catch { /* new */ }
    fs.writeFileSync(up, JSON.stringify({ ...upstream, defaultMode: what }, null, 2) + '\n');
    console.log(color.green(`global caveman mode -> ${what}`) + color.dim(`  (${paths.tilde(cfgPath)}, mirrored to ${paths.tilde(up)})`));
    return 0;
  }

  const file = path.join(dir, caveman.PROJECT_FILE);
  if (what === 'inherit') {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(color.green(`removed ${caveman.PROJECT_FILE}`) + color.dim(' - global default applies'));
    } else {
      console.log(color.dim(`no ${caveman.PROJECT_FILE} here - already inheriting`));
    }
  } else {
    let cur = {};
    try { cur = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* new */ }
    fs.writeFileSync(file, JSON.stringify({ ...cur, defaultMode: what }, null, 2) + '\n');
    console.log(color.green(`project caveman mode -> ${what}`) + color.dim(`  (${caveman.PROJECT_FILE})`));
  }

  if (fs.existsSync(path.join(dir, detect.CORE))) {
    const ctx = plan.context({ config });
    const vendored = plan.vendoredSkills(dir);
    const { summary } = ops.run(plan.projectPlan(ctx, dir, { vendor: vendored.length > 0, skillNames: vendored.length ? vendored : null }));
    console.log(color.dim(`pointers regenerated: ${Object.entries(summary).map(([k, v]) => `${k} ${v}`).join(' · ')}`));
  }
  const eff = caveman.effective(dir, config);
  console.log(`effective now: ${color.bold(eff.mode)} ${color.dim(`(${eff.source})`)}`);
  return 0;
}

module.exports = { run, help };
