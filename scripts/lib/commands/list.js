/**
 * gabby list - list all skills, agents, and rules.
 * Zero dependencies. Node >= 18.
 */
const paths = require('../paths');
const registry = require('../registry');
const { color } = require('../cli');

const help = `gabby list [--json]

Lists every skill, agent and rule in the global folder. [invocable] = gets a slash-command wrapper.`;

async function run(args) {
  const root = paths.globalRoot();
  const reg = registry.all(root);
  if (args.flags.json) {
    console.log(JSON.stringify(reg, null, 2));
    return 0;
  }
  const row = (n, d, mark = '           ') => `  ${mark} ${n.padEnd(26)} ${color.dim(d.length > 80 ? d.slice(0, 77) + '...' : d)}`;
  console.log(color.bold(`Universal Skills (${reg.skills.length})`));
  for (const s of reg.skills) console.log(row(s.name, s.description || '', s.invocable ? '[invocable]' : '           '));
  console.log(color.bold(`\nAgent Personas (${reg.agents.length})`));
  for (const a of reg.agents) console.log(row(a.name, a.description || '', '           '));
  console.log(color.bold(`\nRules & Principles (${reg.rules.length})`));
  for (const r of reg.rules) console.log(row(r.name, r.description || '', '           '));
  return 0;
}

module.exports = { run, help };
