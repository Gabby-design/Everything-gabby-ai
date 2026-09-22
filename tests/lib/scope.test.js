/**
 * Tests for scripts/lib/scope.js
 *
 * Run with: node tests/lib/scope.test.js
 */

const assert = require('assert');
const path = require('path');
const paths = require('../../scripts/lib/paths');
const scope = require('../../scripts/lib/scope');

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
  console.log('\n=== Testing scope.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('inGlobal returns true for global directory and false for random dir', () => {
    const gr = paths.globalRoot();
    assert.strictEqual(scope.inGlobal(gr), true);
    assert.strictEqual(scope.inGlobal(path.join(gr, 'skills')), true);

    const randomDir = path.resolve('C:\\some-random-project-directory');
    assert.strictEqual(scope.inGlobal(randomDir), false);
  })) passed++; else failed++;

  if (test('resolvesToGlobal identifies files inside global root', () => {
    const gr = paths.globalRoot();
    assert.strictEqual(scope.resolvesToGlobal(path.join(gr, 'skills', 'plan', 'SKILL.md')), true);
    assert.strictEqual(scope.resolvesToGlobal(path.resolve('C:\\outside\\file.txt')), false);
  })) passed++; else failed++;

  if (test('refusal formats standardized message enforcing RULE-SCOPE-001', () => {
    const msg = scope.refusal('test-op');
    assert.ok(msg.includes('RULE-SCOPE-001'));
    assert.ok(msg.includes('global directory'));
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
