/**
 * Tests for scripts/lib/registry.js
 *
 * Run with: node tests/lib/registry.test.js
 */

const assert = require('assert');
const path = require('path');
const { skills, agents, rules, all, validate } = require('../../scripts/lib/registry');

const repoRoot = path.resolve(__dirname, '../..');

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
  console.log('\n=== Testing registry.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('skills discovers skills in the repository', () => {
    const skillList = skills(repoRoot);
    assert.ok(Array.isArray(skillList));
    assert.ok(skillList.length > 0, 'Should find at least 1 skill');

    const tdd = skillList.find(s => s.name === 'tdd-workflow');
    assert.ok(tdd, 'Should find tdd-workflow skill');
    assert.strictEqual(tdd.kind, 'skill');
    assert.ok(tdd.file.endsWith('SKILL.md'));
  })) passed++; else failed++;

  if (test('agents discovers agent personas in the repository', () => {
    const agentList = agents(repoRoot);
    assert.ok(Array.isArray(agentList));
    assert.ok(agentList.length >= 9, 'Should find at least 9 agent personas');

    const architect = agentList.find(a => a.name === 'architect');
    assert.ok(architect, 'Should find architect agent');
    assert.strictEqual(architect.kind, 'agent');
  })) passed++; else failed++;

  if (test('rules discovers rules in the repository', () => {
    const ruleList = rules(repoRoot);
    assert.ok(Array.isArray(ruleList));
    assert.ok(ruleList.length >= 8, 'Should find at least 8 rules');

    const gitRule = ruleList.find(r => r.name === 'git-workflow');
    assert.ok(gitRule, 'Should find git-workflow rule');
  })) passed++; else failed++;

  if (test('all aggregates all asset types', () => {
    const aggregated = all(repoRoot);
    assert.ok(aggregated.skills.length > 0);
    assert.ok(aggregated.agents.length > 0);
    assert.ok(aggregated.rules.length > 0);
  })) passed++; else failed++;

  if (test('validate checks frontmatter contracts and detects missing frontmatter', () => {
    // Current repo should have 0 problems
    const problems = validate(repoRoot);
    assert.strictEqual(problems.length, 0, 'Clean repository should have 0 validation problems');

    // Test detection with fixture directory containing an invalid skill
    const os = require('os');
    const fs = require('fs');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reg-test-'));
    try {
      const badSkillDir = path.join(tmp, 'skills', 'bad-skill');
      fs.mkdirSync(badSkillDir, { recursive: true });
      fs.writeFileSync(path.join(badSkillDir, 'SKILL.md'), '# Bad Skill without frontmatter\nNo metadata.');

      const fixtureProblems = validate(tmp);
      assert.ok(fixtureProblems.length > 0, 'Should detect fixture skill without frontmatter');
      const missingName = fixtureProblems.find(p => p.problem.includes('missing name'));
      assert.ok(missingName, 'Should identify missing name problem');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
