/**
 * gabby publish - safe git push helper for the global system folder.
 * Never commits autonomously - checks for uncommitted changes first and asks.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const paths = require('../paths');
const { color, confirm, fail } = require('../cli');

const help = `gabby publish [--yes]

Push the global folder's current branch (git push in ~/.agents).
Never commits - commit yourself first. Confirms before pushing.`;

async function run(args) {
  const root = fs.realpathSync(paths.globalRoot());
  const dirty = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  if (dirty) {
    console.log(color.yellow('Uncommitted changes in global system folder - gabby never commits for you:'));
    console.log(dirty);
    fail('commit your changes first, then run `gabby publish`');
  }

  console.log(`git push in ${paths.tilde(root)}`);
  if (!args.flags.yes && !(await confirm('Proceed with push?'))) return 0;

  const res = spawnSync('git', ['push'], { cwd: root, stdio: 'inherit' });
  return res.status || 0;
}

module.exports = { run, help };
