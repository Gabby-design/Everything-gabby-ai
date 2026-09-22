/**
 * gabby upgrade - bring a project's system up to the current gabby version.
 * Deterministic part: repair links, refresh vendored copies. Intelligent part: the AI's UPGRADE mode.
 * Zero dependencies. Node >= 18.
 */
const fs = require('fs');
const path = require('path');
const paths = require('../paths');
const detect = require('../detect');
const link = require('./link');
const { color, fail } = require('../cli');

const help = `gabby upgrade [--dry-run]

Two steps:
Step 1 (deterministic): repair entry points and refresh any vendored skills/rules from global folder.
Step 2 (an agent): the gabby-system skill in UPGRADE mode computes the scaffolding delta, asks for
approval, applies it, and runs \`gabby stamp\`.`;

async function run(args) {
  const dir = process.cwd();
  if (!fs.existsSync(path.join(dir, detect.CORE))) {
    fail('no docs/ai/AGENT-CORE.md here - use `gabby init` for a project without an AI system');
  }
  const det = detect.detect(dir, paths.version());
  console.log(color.bold(`Project system: ${det.gabbyVersion || det.kiwiVersion ? 'version ' + (det.gabbyVersion || det.kiwiVersion) : 'pre-gabby'} -> gabby ${det.currentVersion}`));

  const code = await link.run(args, { vendor: false });
  if (args.flags['dry-run']) return code;

  det.mode = 'UPGRADE';
  const prompt = detect.prompt(det, { globalRoot: paths.tilde(paths.globalRoot()) });
  console.log('\n' + color.bold('Step 1 of 2 done (links). Step 2 is the agent\'s - tell it: "upgrade this project\'s AI system"') + '\n');
  console.log(color.dim('It runs `gabby agent UPGRADE` itself and follows the brief. Or paste this:') + '\n');
  console.log(prompt);
  console.log(color.dim('\nThe agent shows you the delta table, waits for approval, applies it, and finishes with `gabby stamp`.'));
  return code;
}

module.exports = { run, help };
