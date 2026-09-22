/**
 * gabby template - list or print the docs/ai templates the agent writes from.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const { fail } = require('../cli');

const help = `gabby template [name]

Without a name: list every template under templates/docs-ai with its path.
With a name (e.g. AGENT-CORE, SYSTEM, decisions/ADR-TEMPLATE): print it.`;

function dir() {
  const local = path.join(paths.REPO_ROOT, 'templates', 'docs-ai');
  if (fs.existsSync(local)) return local;
  return paths.g('skills', 'gabby-system', 'templates', 'docs-ai');
}

function list() {
  const out = [];
  const base = dir();
  if (!fs.existsSync(base)) return out;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) out.push(path.relative(base, p).replace(/\\/g, '/'));
    }
  })(base);
  return out.sort();
}

async function run(args) {
  const name = args._[0];
  if (!name) {
    for (const t of list()) {
      console.log(`${t.replace(/\.md$/, '').padEnd(28)} ${paths.tilde(path.join(dir(), t))}`);
    }
    return 0;
  }
  const normalized = name.replace(/\.md$/, '') + '.md';
  const file = path.join(dir(), normalized);
  if (!fs.existsSync(file)) fail(`no template "${name}" - \`gabby template\` lists them`);
  process.stdout.write(fs.readFileSync(file, 'utf8'));
  return 0;
}

module.exports = { run, help, list, dir };
