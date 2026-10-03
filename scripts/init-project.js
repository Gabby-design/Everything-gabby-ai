#!/usr/bin/env node
/**
 * Project AI System Initializer
 *
 * Deterministically initializes, adopts, or upgrades the docs/ai/ system
 * and cross-assistant adapters (CLAUDE.md, GEMINI.md, AGENTS.md, etc.)
 * in a project repository according to the 8 Core Principles.
 *
 * Usage:
 *   node scripts/init-project.js [projectDir] [--mode <INIT|ADOPT|UPGRADE|AUDIT>] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const utils = require('./lib/utils');
const detect = require('./lib/detect');
const template = require('./lib/template');
const ops = require('./lib/ops');
const adapters = require('./lib/adapters');
const registry = require('./lib/registry');
const packageManager = require('./lib/package-manager');
const plan = require('./lib/plan');
const paths = require('./lib/paths');
const caveman = require('./lib/caveman');
const { setKey } = require('./lib/frontmatter');

const repoRoot = path.resolve(__dirname, '..');

/**
 * Gather project context and detection status.
 */
function inspectProject(targetDir) {
  const dir = path.resolve(targetDir || process.cwd());
  const detection = detect.detect(dir);
  const pm = packageManager.getPackageManager({ projectDir: dir });

  const testCmd = packageManager.getRunCommand('test', { projectDir: dir });
  const buildCmd = packageManager.getRunCommand('build', { projectDir: dir });
  const lintCmd = packageManager.getRunCommand('lint', { projectDir: dir });
  const typecheckCmd = packageManager.getRunCommand('typecheck', { projectDir: dir });

  return {
    dir,
    projectName: path.basename(dir),
    detection,
    packageManager: pm.name,
    commands: {
      test: testCmd,
      build: buildCmd,
      lint: lintCmd,
      typecheck: typecheckCmd
    }
  };
}

/**
 * Initialize or upgrade project AI system.
 */
function initProject(options = {}) {
  const targetDir = path.resolve(options.targetDir || process.cwd());
  const dryRun = Boolean(options.dryRun);
  const projectInfo = inspectProject(targetDir);

  const mode = (options.mode || projectInfo.detection.mode).toUpperCase();
  const dateStr = utils.getDateString();

  const vars = {
    PROJECT: projectInfo.projectName,
    DATE: dateStr,
    PACKAGE_MANAGER: projectInfo.packageManager,
    MODE: mode,
    MODE_NOTE: `${mode} performed on ${dateStr}`,
    PRD_DIR: 'docs/ai/prd',
    PRD_PATH: 'docs/ai/prd/prd.md',
    VERSION: '2.0.0',
    GABBY_VERSION: '2.0.0',
    TEST_CMD: projectInfo.commands.test,
    BUILD_CMD: projectInfo.commands.build,
    LINT_CMD: projectInfo.commands.lint,
    TYPECHECK_CMD: projectInfo.commands.typecheck
  };

  const docsAiDir = path.join(targetDir, 'docs', 'ai');
  const actionsTaken = [];
  const plannedOps = [];

  // Step 1: Ensure docs/ai templates are populated
  plannedOps.push({
    kind: 'mkdir',
    path: docsAiDir,
    agent: 'system',
    why: 'Canonical docs/ai root directory'
  });

  // Collect templates
  const templateList = template.listTemplates();
  for (const relPath of templateList) {
    const raw = template.readTemplate(relPath);
    const rendered = template.render(raw, vars);
    const destPath = path.join(docsAiDir, relPath);

    // In ADOPT or UPGRADE mode, preserve existing documents unless overwrite requested
    plannedOps.push({
      kind: 'file',
      path: destPath,
      content: rendered,
      agent: 'system',
      why: `docs/ai canonical template: ${relPath}`
    });
  }

  // Step 2: Cross-Assistant Adapter entry points & vendored components
  const config = paths.loadConfig();
  const ctx = plan.context({
    root: repoRoot,
    config,
    registry: registry.all(repoRoot)
  });

  // Write .caveman.json in project root
  const effMode = options.cavemanMode || (config.caveman && config.caveman.mode) || 'ultra';
  plannedOps.push({
    kind: 'file',
    path: path.join(targetDir, '.caveman.json'),
    content: JSON.stringify({ defaultMode: effMode }, null, 2) + '\n',
    agent: 'system',
    why: 'Enforce concise caveman communication mode'
  });

  const projectOps = plan.projectPlan(ctx, targetDir, { vendor: true });
  plannedOps.push(...projectOps);

  // Step 3: Inspect and apply operations with conflict protection
  
  // Pre-clean legacy entry points so links succeed
  const archiveDir = path.join(docsAiDir, 'archive');
  const legacyFiles = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md'];
  if (!dryRun) {
    for (const file of legacyFiles) {
      const fullPath = path.join(targetDir, file);
      if (fs.existsSync(fullPath) && !fs.lstatSync(fullPath).isSymbolicLink()) {
        const text = fs.readFileSync(fullPath, 'utf8');
        if (!text.includes('AGENT-CORE.md')) {
          if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
          const baseName = path.basename(file, path.extname(file));
          fs.writeFileSync(path.join(archiveDir, `${baseName}.legacy.md`), text, 'utf8');
          fs.unlinkSync(fullPath);
        }
      }
    }
  }

  const inspected = ops.inspect(plannedOps);
  const applied = ops.apply(plannedOps, { dryRun });

  // Post-stamp SYSTEM.md with version and all vendored skills
  if (!dryRun) {
    const sysPath = path.join(docsAiDir, 'SYSTEM.md');
    if (fs.existsSync(sysPath)) {
      let sysContent = fs.readFileSync(sysPath, 'utf8');
      const allSkillNames = (ctx.registry.skills || []).map(s => s.name);
      sysContent = setKey(setKey(sysContent, 'vendored', allSkillNames), 'gabby_version', '2.0.0');
      fs.writeFileSync(sysPath, sysContent, 'utf8');
    }
  }

  // Step 4: Generate status report
  return {
    success: applied.appliedCount >= 0,
    targetDir,
    projectName: projectInfo.projectName,
    mode,
    dryRun,
    packageManager: projectInfo.packageManager,
    commands: projectInfo.commands,
    inspected,
    applied,
    templatesCount: templateList.length,
    adapterOpsCount: projectOps.length
  };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  let modeOverride = null;
  const modeIndex = args.indexOf('--mode');
  if (modeIndex !== -1 && args[modeIndex + 1]) {
    modeOverride = args[modeIndex + 1];
  }

  const targetDir = args.find(a => !a.startsWith('--')) || process.cwd();

  try {
    const res = initProject({ targetDir, mode: modeOverride, dryRun });
    console.log('========================================');
    console.log(` Project AI System Initializer: ${res.mode}`);
    console.log('========================================');
    console.log(`Target:          ${res.targetDir}`);
    console.log(`Package Manager: ${res.packageManager}`);
    console.log(`Dry Run:         ${res.dryRun}`);
    console.log(`Templates:       ${res.templatesCount} canonical templates queued`);
    console.log(`Adapters:        ${res.adapterOpsCount} entry points configured`);
    console.log(`Ops Applied:     ${res.applied.appliedCount}`);
    console.log(`Ops Skipped:     ${res.applied.skippedCount}`);
    console.log('========================================');
    console.log(' Initialization completed successfully.');
    console.log('========================================');
    process.exit(0);
  } catch (err) {
    console.error('Error during project initialization:', err.message);
    process.exit(1);
  }
}

module.exports = {
  initProject,
  inspectProject
};
