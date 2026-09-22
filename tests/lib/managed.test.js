/**
 * Tests for scripts/lib/managed.js
 *
 * Run with: node tests/lib/managed.test.js
 */

const assert = require('assert');
const { render, apply, status, START, END } = require('../../scripts/lib/managed');

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
  console.log('\n=== Testing managed.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('render wraps content in managed markers', () => {
    const rendered = render('test content');
    assert.ok(rendered.startsWith(START));
    assert.ok(rendered.endsWith(END));
    assert.ok(rendered.includes('test content'));
  })) passed++; else failed++;

  if (test('apply prepends block to empty or unmanaged file', () => {
    const original = '# My Readme\nSome existing notes.';
    const result = apply(original, 'managed instructions');

    assert.ok(result.startsWith(START));
    assert.ok(result.includes('managed instructions'));
    assert.ok(result.includes(END));
    assert.ok(result.includes('# My Readme'));
  })) passed++; else failed++;

  if (test('apply updates existing managed block in place without duplicating', () => {
    const initial = apply('# Title', 'version 1');
    const updated = apply(initial, 'version 2');

    assert.ok(updated.includes('version 2'));
    assert.ok(!updated.includes('version 1'));
    // Ensure only one start and one end tag
    const startCount = (updated.match(/<!-- agent:start/g) || []).length;
    const endCount = (updated.match(/<!-- agent:end/g) || []).length;
    assert.strictEqual(startCount, 1);
    assert.strictEqual(endCount, 1);
  })) passed++; else failed++;

  if (test('status accurately detects ok, stale, and missing', () => {
    assert.strictEqual(status(null, 'content'), 'missing');
    assert.strictEqual(status('no markers here', 'content'), 'missing');

    const active = render('content');
    assert.strictEqual(status(active, 'content'), 'ok');
    assert.strictEqual(status(active, 'different content'), 'stale');
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
