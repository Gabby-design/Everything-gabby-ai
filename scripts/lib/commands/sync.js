/**
 * gabby sync - synchronizes skills, agents, rules, and global configurations.
 * Zero dependencies. Node >= 18.
 */
const { syncGlobal } = require('../../sync-global');

const help = `gabby sync [--dry-run] [--target <dir>]

Synchronizes skills, agents, rules, and workflows from this repository to the
user's personal global root (~/.agents) and assistant-specific config roots.`;

async function run(args) {
  const dryRun = !!args.flags['dry-run'];
  const targetDir = args.flags.target || null;
  const res = syncGlobal({ dryRun, targetDir });
  return res && res.success ? 0 : 1;
}

module.exports = { run, help };
