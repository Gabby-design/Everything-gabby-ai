/**
 * Tests for universal skill elevation and frontmatter contracts.
 *
 * Run with: node tests/skills.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const registry = require('../scripts/lib/registry');

const ROOT = path.resolve(__dirname, '..');

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
  console.log('\n=== Testing Universal Skills ===\n');

  let passed = 0;
  let failed = 0;

  if (test('registry discovers all skills and validates contracts', () => {
    const allSkills = registry.skills(ROOT);
    assert.ok(allSkills.length >= 29, `Expected at least 29 skills, found ${allSkills.length}`);

    const problems = registry.validate(ROOT);
    assert.strictEqual(problems.length, 0, `Expected 0 validation problems, got: ${JSON.stringify(problems)}`);
  })) passed++; else failed++;

  if (test('elevated skills from commands are present and invocable', () => {
    const expectedElevated = [
      'build-fix',
      'checkpoint',
      'code-review',
      'e2e',
      'eval',
      'learn',
      'orchestrate',
      'plan',
      'refactor-clean',
      'setup-pm',
      'tdd',
      'test-coverage',
      'update-codemaps',
      'update-docs',
      'verify'
    ];

    const allSkills = registry.skills(ROOT);
    const skillMap = new Map(allSkills.map(s => [s.name, s]));

    for (const name of expectedElevated) {
      const s = skillMap.get(name);
      assert.ok(s, `Missing elevated skill: ${name}`);
      assert.strictEqual(s.invocable, true, `Skill ${name} should be invocable`);
      assert.ok(s.description, `Skill ${name} should have a description`);
      assert.ok(fs.existsSync(s.file), `Skill file should exist: ${s.file}`);
    }
  })) passed++; else failed++;

  if (test('core workflow skills are present and invocable', () => {
    const expectedWorkflows = [
      'create-prd',
      'feature-workflow',
      'bugfix-workflow'
    ];

    const allSkills = registry.skills(ROOT);
    const skillMap = new Map(allSkills.map(s => [s.name, s]));

    for (const name of expectedWorkflows) {
      const s = skillMap.get(name);
      assert.ok(s, `Missing workflow skill: ${name}`);
      assert.strictEqual(s.invocable, true, `Workflow skill ${name} should be invocable`);
      assert.ok(s.description, `Workflow skill ${name} should have a description`);
    }
  })) passed++; else failed++;

  if (test('original commands directory is preserved for Claude backwards compatibility', () => {
    const commandsDir = path.join(ROOT, 'commands');
    assert.ok(fs.existsSync(commandsDir), 'commands directory must still exist');

    const expectedCommands = [
      'build-fix.md',
      'checkpoint.md',
      'code-review.md',
      'e2e.md',
      'eval.md',
      'learn.md',
      'orchestrate.md',
      'plan.md',
      'refactor-clean.md',
      'setup-pm.md',
      'tdd.md',
      'test-coverage.md',
      'update-codemaps.md',
      'update-docs.md',
      'verify.md'
    ];

    for (const cmd of expectedCommands) {
      const cmdPath = path.join(commandsDir, cmd);
      assert.ok(fs.existsSync(cmdPath), `Original command file must exist: ${cmd}`);
    }
  })) passed++; else failed++;

  if (test('newly elevated and workflow skills contain zero emojis', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

    const skillsToCheck = [
      'build-fix',
      'checkpoint',
      'code-review',
      'e2e',
      'eval',
      'learn',
      'orchestrate',
      'plan',
      'refactor-clean',
      'setup-pm',
      'tdd',
      'test-coverage',
      'update-codemaps',
      'update-docs',
      'verify',
      'create-prd',
      'feature-workflow',
      'bugfix-workflow'
    ];

    for (const name of skillsToCheck) {
      const filePath = path.join(ROOT, 'skills', name, 'SKILL.md');
      const content = fs.readFileSync(filePath, 'utf8');
      assert.strictEqual(
        emojiRegex.test(content),
        false,
        `Skill ${name} contains emojis violating the zero-emoji rule`
      );
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
