/**
 * gabby stamp - record in docs/ai/SYSTEM.md that this project's system is current with the global
 * system: gabby_version, global_system, prd_dir, vendored. The agent runs it as the last step of
 * INIT / ADOPT / UPGRADE, after the documents have actually landed. Touches only those four keys.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const plan = require('../plan');
const { setKey, parse } = require('../frontmatter');
const { color, fail } = require('../cli');

const help = `gabby stamp [--prd-dir <path>]

Writes gabby_version, global_system, prd_dir and vendored into docs/ai/SYSTEM.md's frontmatter.
Run it LAST, after the AI half of INIT / ADOPT / UPGRADE has landed - it is what makes
\`gabby doctor\` report the project as current. Refuses to run without docs/ai/SYSTEM.md.`;

async function run(args) {
  const dir = process.cwd();
  const sys = path.join(dir, detect.SYSTEM);
  if (!fs.existsSync(path.join(dir, detect.CORE))) fail('docs/ai/AGENT-CORE.md is missing - nothing to stamp');
  if (!fs.existsSync(sys)) fail('docs/ai/SYSTEM.md is missing - create it from templates/docs-ai/SYSTEM.md first, then stamp');
  const before = fs.readFileSync(sys, 'utf8');
  const data = parse(before).data;
  const cfg = paths.loadConfig();
  const prdDir = args.flags['prd-dir'] || data.prd_dir || cfg.prdDir || 'docs/ai/prd';
  let text = before;
  text = setKey(text, 'gabby_version', paths.version());
  text = setKey(text, 'global_system', process.env.GABBY_AI_HOME || '~/.agents');
  text = setKey(text, 'prd_dir', prdDir);
  text = setKey(text, 'vendored', plan.vendoredSkills(dir));
  if (text === before) {
    console.log(color.dim(`${detect.SYSTEM} already stamped at gabby ${paths.version()}`));
    return 0;
  }
  fs.writeFileSync(sys, text);
  console.log(color.green('stamped ') + `${detect.SYSTEM}: gabby_version ${paths.version()}, prd_dir ${prdDir}, vendored [${plan.vendoredSkills(dir).join(', ')}]`);
  console.log(color.dim('Now run `gabby doctor --project` - it should be clear.'));
  return 0;
}

module.exports = { run, help };
