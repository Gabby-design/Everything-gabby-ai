/**
 * gabby uninstall - remove everything gabby install / sync put into agents' global configs.
 * Leaves the checkout and every project untouched.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const plan = require('../plan');
const ops = require('../ops');
const managed = require('../managed');
const { color, confirm } = require('../cli');

const help = `gabby uninstall [--yes] [--dry-run]

Removes symlinks, generated wrappers, managed blocks and [gabby] hooks created
in ~/.claude, ~/.codex, ~/.agents, ~/.gemini and ~/.copilot. Projects and checkout are untouched.`;

async function run(args) {
  const dry = !!args.flags['dry-run'];
  const ctx = plan.context();
  const gplan = plan.globalPlan(ctx);
  console.log(color.bold(`gabby uninstall${dry ? ' (dry run)' : ''}`) + color.dim(`  ${gplan.length} items`));
  if (!dry && !args.flags.yes && !(await confirm('Remove all gabby links, wrappers, managed blocks and hooks from agents global config?'))) {
    return 0;
  }
  let n = 0;
  for (const op of gplan) {
    const state = ops.inspect(op);
    if (state === 'missing') continue;
    if (op.kind === 'symlink' && ops.isSymlink(op.path)) {
      if (!dry) fs.unlinkSync(op.path);
      n++;
    } else if (op.kind === 'file' && (ops.read(op.path) || '').includes(ops.GENERATED_MARK)) {
      if (!dry) fs.unlinkSync(op.path);
      n++;
    } else if (op.kind === 'managed') {
      const text = ops.read(op.path) || '';
      const re = new RegExp(`${managed.START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${managed.END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n*`);
      if (re.test(text)) {
        if (!dry) fs.writeFileSync(op.path, text.replace(re, ''));
        n++;
      }
    } else if (op.kind === 'json') {
      try {
        const s = JSON.parse(ops.read(op.path));
        if (s.hooks) {
          for (const ev of Object.keys(s.hooks)) {
            s.hooks[ev] = s.hooks[ev].filter(e => !(e.description || '').startsWith('[gabby]'));
            if (!s.hooks[ev].length) delete s.hooks[ev];
          }
          if (!Object.keys(s.hooks).length) delete s.hooks;
          if (!dry) fs.writeFileSync(op.path, JSON.stringify(s, null, 2) + '\n');
          n++;
        }
      } catch {
        /* leave unchanged */
      }
    }
  }
  console.log(color.green(`${dry ? 'would remove' : 'removed'} ${n} item(s)`));
  console.log(color.dim(`checkout and ${paths.tilde(paths.globalRoot())} left in place.`));
  return 0;
}

module.exports = { run, help };
