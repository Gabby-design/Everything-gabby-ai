/**
 * Test Suite: Phase 2 Skills, Rules, Runbooks, and Workflows
 * Verifies that universal skills, rules, templates, and workflows adhere to:
 * - Frontmatter contracts and structure
 * - Zero emoji mandate (Core Principle 3)
 * - Gabby identity and tooling conventions
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');

// Regex to detect emojis
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Phase 2: Skills, Rules, Runbooks, and Workflows ===\n');

  let passed = 0;
  let failed = 0;

  // 1. Verify Templates
  if (test('Skill, rule, and agent templates exist', () => {
    assert.ok(fs.existsSync(path.join(REPO_ROOT, 'skills', '_template', 'SKILL.md')), 'Skill template missing');
    assert.ok(fs.existsSync(path.join(REPO_ROOT, 'rules', '_template.md')), 'Rule template missing');
    assert.ok(fs.existsSync(path.join(REPO_ROOT, 'agents', '_template.md')), 'Agent template missing');
  })) passed++; else failed++;

  // 2. Verify Universal Skills
  if (test('New Phase 2 skills have valid frontmatter contracts', () => {
    const skillsToCheck = ['caveman', 'caveman-commit', 'caveman-review', 'context-docs', 'gabby-system'];
    for (const skillName of skillsToCheck) {
      const skillPath = path.join(REPO_ROOT, 'skills', skillName, 'SKILL.md');
      assert.ok(fs.existsSync(skillPath), `Missing skill: ${skillName}`);
      const content = fs.readFileSync(skillPath, 'utf8');
      assert.ok(content.startsWith('---'), `${skillName} must start with frontmatter ---`);
      assert.ok(content.includes(`name: ${skillName}`), `${skillName} must declare name in frontmatter`);
      assert.ok(content.includes('description:'), `${skillName} must declare description in frontmatter`);
    }
  })) passed++; else failed++;

  // 3. Verify Runbooks
  if (test('All 8 gabby-system runbooks exist and reference gabby CLI', () => {
    const runbooksDir = path.join(REPO_ROOT, 'skills', 'gabby-system', 'runbooks');
    const expectedRunbooks = [
      '_shared.md',
      'README.md',
      'INIT.md',
      'ADOPT.md',
      'UPGRADE.md',
      'AUDIT.md',
      'AMEND.md',
      'EXTEND.md'
    ];
    for (const runbook of expectedRunbooks) {
      const filePath = path.join(runbooksDir, runbook);
      assert.ok(fs.existsSync(filePath), `Missing runbook: ${runbook}`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.length > 50, `Runbook ${runbook} appears empty`);
      assert.ok(content.includes('gabby'), `Runbook ${runbook} must reference gabby CLI`);
    }
  })) passed++; else failed++;

  // 4. Verify Workflows
  if (test('All 5 universal workflows exist with complete lifecycle sections', () => {
    const workflowsDir = path.join(REPO_ROOT, 'workflows');
    const expectedWorkflows = [
      'manage-workflows.md',
      'bug-fix.md',
      'new-feature.md',
      'code-audit.md',
      'hybrid-engine.md'
    ];
    for (const wf of expectedWorkflows) {
      const filePath = path.join(workflowsDir, wf);
      assert.ok(fs.existsSync(filePath), `Missing workflow: ${wf}`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('# Workflow:'), `${wf} must start with # Workflow:`);
      assert.ok(content.length > 200, `${wf} is too short to be production-grade`);
    }
  })) passed++; else failed++;

  // 5. Verify Rules
  if (test('New Phase 2 rules exist and define standards', () => {
    const cavemanRule = path.join(REPO_ROOT, 'rules', 'caveman.md');
    const dualEngineRule = path.join(REPO_ROOT, 'rules', 'dual-engine-synergy.md');
    assert.ok(fs.existsSync(cavemanRule), 'caveman.md rule missing');
    assert.ok(fs.existsSync(dualEngineRule), 'dual-engine-synergy.md rule missing');

    const cavemanContent = fs.readFileSync(cavemanRule, 'utf8');
    assert.ok(cavemanContent.includes('lite'), 'caveman rule must specify modes');
    assert.ok(cavemanContent.includes('ultra'), 'caveman rule must specify ultra mode');

    const dualEngineContent = fs.readFileSync(dualEngineRule, 'utf8');
    assert.ok(dualEngineContent.includes('Claude Code'), 'dual-engine rule must mention Claude Code');
    assert.ok(dualEngineContent.includes('Antigravity'), 'dual-engine rule must mention Antigravity');
  })) passed++; else failed++;

  // 6. Zero Emoji Check across all Phase 2 files
  if (test('Core Principle 3: Zero emojis in any Phase 2 skill, rule, runbook, or workflow', () => {
    const checkPaths = [
      path.join(REPO_ROOT, 'rules', '_template.md'),
      path.join(REPO_ROOT, 'rules', 'caveman.md'),
      path.join(REPO_ROOT, 'rules', 'dual-engine-synergy.md'),
      path.join(REPO_ROOT, 'agents', '_template.md'),
      path.join(REPO_ROOT, 'skills', '_template', 'SKILL.md'),
      path.join(REPO_ROOT, 'skills', 'caveman', 'SKILL.md'),
      path.join(REPO_ROOT, 'skills', 'caveman-commit', 'SKILL.md'),
      path.join(REPO_ROOT, 'skills', 'caveman-review', 'SKILL.md'),
      path.join(REPO_ROOT, 'skills', 'context-docs', 'SKILL.md'),
      path.join(REPO_ROOT, 'skills', 'gabby-system', 'SKILL.md')
    ];

    // Add all runbooks
    const runbooksDir = path.join(REPO_ROOT, 'skills', 'gabby-system', 'runbooks');
    for (const rb of fs.readdirSync(runbooksDir)) {
      checkPaths.push(path.join(runbooksDir, rb));
    }

    // Add all workflows
    const workflowsDir = path.join(REPO_ROOT, 'workflows');
    for (const wf of fs.readdirSync(workflowsDir)) {
      checkPaths.push(path.join(workflowsDir, wf));
    }

    for (const filePath of checkPaths) {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(EMOJI_REGEX);
      assert.strictEqual(
        match,
        null,
        `Found emoji in ${path.relative(REPO_ROOT, filePath)}: ${match ? match[0] : ''}`
      );
    }
  })) passed++; else failed++;

  console.log(`\nPhase 2 Tests Passed: ${passed}`);
  console.log(`Phase 2 Tests Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
