/**
 * Tests for scripts/lib/plan.js
 *
 * Run with: node tests/lib/plan.test.js
 */

const assert = require('assert');
const path = require('path');
const plan = require('../../scripts/lib/plan');

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
  console.log('\n=== Testing plan.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('context builds complete context object with root, homes, and registry', () => {
    const ctx = plan.context();
    assert.ok(ctx.root);
    assert.ok(ctx.homes);
    assert.ok(ctx.config);
    assert.ok(ctx.registry);
    assert.strictEqual(typeof ctx.tilde, 'function');
  })) passed++; else failed++;

  if (test('dedupe removes duplicate operations by kind and path', () => {
    const raw = [
      { kind: 'file', path: 'CLAUDE.md', agent: 'claude' },
      { kind: 'file', path: 'CLAUDE.md', agent: 'other' },
      { kind: 'file', path: 'GEMINI.md', agent: 'gemini' }
    ];
    const deduped = plan.dedupe(raw);
    assert.strictEqual(deduped.length, 2);
    assert.strictEqual(deduped[0].agent, 'claude');
    assert.strictEqual(deduped[1].agent, 'gemini');
  })) passed++; else failed++;

  if (test('globalPlan produces valid operation plan across enabled adapters', () => {
    const ctx = plan.context();
    const gplan = plan.globalPlan(ctx);
    assert.ok(Array.isArray(gplan));
    assert.ok(gplan.length > 0);
    assert.ok(gplan.every(op => op.kind && op.path && op.agent));
  })) passed++; else failed++;

  if (test('projectPlan produces project operations and supports vendor flag', () => {
    const ctx = plan.context();
    const dummyDir = path.resolve('C:\\dummy-test-project');
    const pplan = plan.projectPlan(ctx, dummyDir, { vendor: false });
    assert.ok(Array.isArray(pplan));
    assert.ok(pplan.length > 0);

    const vplan = plan.projectPlan(ctx, dummyDir, { vendor: true });
    assert.ok(vplan.length > pplan.length);
    assert.ok(vplan.some(op => op.agent === 'vendor'));
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
