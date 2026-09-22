#!/usr/bin/env node
/**
 * First-time setup for a new person or a new machine. Cross-platform (macOS, Linux, Windows; Node >= 18).
 *
 *   node bin/setup.js                       interactive
 *   node bin/setup.js --owner gabby --yes   non-interactive
 *
 * What it does, in order:
 *   1. Checks Node >= 18 and that this is a checkout of the system
 *   2. Asks owner handle + global folder name (default: .agents)
 *   3. Writes fresh personal MEMORY.md / NOTES.md if not present
 *   4. Links ~/.agents to this checkout (via junction on Windows, symlink on Unix)
 *   5. Runs gabby install to wire all assistant configs
 * Never runs Git operations.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flag = (n) => {
  const i = args.indexOf(`--${n}`);
  if (i === -1) return undefined;
  return args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
};
const YES = !!flag('yes');

function die(msg) {
  console.error('setup: ' + msg);
  process.exit(1);
}

function ask(q, def) {
  if (YES) return Promise.resolve(def);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => {
    rl.question(`${q}${def !== undefined ? ` [${def}]` : ''}: `, a => {
      rl.close();
      res(a.trim() || def);
    });
  });
}

function gabby(...a) {
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'bin', 'gabby.js'), ...a], { stdio: 'inherit' });
  } catch (e) {
    if (e.status !== 2) throw e;
  }
}

function freshMemory(owner, folder) {
  return `# MEMORY - global (cross-project) current state

> What is true about me and my environment across every project. Project facts live in that project's MEMORY.md. Rewritten when reality changes; never a diary; no secrets. Agents: read at session start (via GLOBAL.md); propose an addition only for a durable, cross-project fact, and never write here from a project session (RULE-SCOPE-001).

## Who I am

- \`${owner}\`. The global AI system is \`~/${folder}\`; the \`gabby\` CLI is on my PATH.

## Environment defaults

- OS: ${os.platform()}
- Shell: ${process.env.SHELL || process.env.COMSPEC || 'default'}

## Projects with a docs/ai/ system

- <!-- One line per project: path - gabby_version - description -->

## Preferences agents keep getting wrong

- <!-- Durable, cross-project corrections only -->
`;
}

function freshNotes() {
  return `# NOTES - global (cross-project) observations

> Gotchas, workarounds and lessons that apply across projects or to the tools themselves. Each note: ID (G-###, never reused), date, status (open, deferred, deliberate, resolved), context.
`;
}

async function main() {
  const [major] = process.versions.node.split('.').map(Number);
  if (major < 18) die(`Node 18+ required (found ${process.versions.node})`);
  if (!fs.existsSync(path.join(ROOT, 'GLOBAL.md')) || !fs.existsSync(path.join(ROOT, 'bin', 'gabby.js'))) {
    die('run this from a checkout of the AI system (bin/setup.js)');
  }

  console.log(`\neverything-gabby-ai - setup (${os.platform()}, node ${process.versions.node})\n`);

  const owner = String(flag('owner') || await ask(
    'Your handle (used in memory / config; letters, digits, dashes)',
    os.userInfo().username.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'gabby'
  ));
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(owner)) die('handle must be letters, digits, dashes');

  const folderInput = String(flag('home') || await ask('Global folder name in your home directory', '.agents'));
  const folder = folderInput.replace(/^\./, '');
  const home = path.join(os.homedir(), `.${folder}`);

  const memPath = path.join(ROOT, 'MEMORY.md');
  const notesPath = path.join(ROOT, 'NOTES.md');
  if (!fs.existsSync(memPath)) fs.writeFileSync(memPath, freshMemory(owner, `.${folder}`), 'utf8');
  if (!fs.existsSync(notesPath)) fs.writeFileSync(notesPath, freshNotes(), 'utf8');

  // Configure caveman mode
  const cavemanMode = String(flag('caveman') || await ask(
    'Caveman output style by default (off | lite | full | ultra)',
    'full'
  )).toLowerCase();
  if (!['off', 'lite', 'full', 'ultra'].includes(cavemanMode)) die('caveman mode must be off, lite, full or ultra');

  const cfgPath = path.join(ROOT, 'config.json');
  if (fs.existsSync(cfgPath)) {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    cfg.caveman = { ...(cfg.caveman || {}), mode: cavemanMode };
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  }

  // Link global home folder
  if (fs.existsSync(home)) {
    let real = null;
    try { real = fs.realpathSync(home); } catch {}
    if (real && real !== fs.realpathSync(ROOT)) {
      console.log(`Note: ${home} points to ${real}. Updating to ${ROOT}...`);
      try { fs.rmSync(home, { recursive: true, force: true }); } catch {}
      fs.symlinkSync(ROOT, home, process.platform === 'win32' ? 'junction' : undefined);
    } else {
      console.log(`[ok] ${home} already points here`);
    }
  } else {
    console.log(`[+] linking ${home} -> ${ROOT}`);
    fs.symlinkSync(ROOT, home, process.platform === 'win32' ? 'junction' : undefined);
  }

  console.log('\n[+] gabby install\n');
  gabby('install');

  console.log(`
Done. Next steps:
  1. Verify gabby on your PATH (run \`gabby --version\`).
  2. In any project, run \`gabby init --apply\` to adopt it in 2 seconds.
  3. Run \`gabby doctor\` anytime to audit system health.
Docs: ~/.\${folder}/docs/HANDBOOK.md | gabby --help
`);
}

main().catch(e => die(e.message));
