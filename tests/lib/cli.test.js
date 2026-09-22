/**
 * Tests for scripts/lib/cli.js
 *
 * Run with: node tests/lib/cli.test.js
 */

const assert = require('assert');
const cli = require('../../scripts/lib/cli');

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
  console.log('\n=== Testing cli.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('parseArgs correctly parses positional args, flags, and values', () => {
    const parsed = cli.parseArgs(['init', '--dry-run', '--mode=ADOPT', '--target', 'my-dir', '-v']);
    assert.deepStrictEqual(parsed._, ['init']);
    assert.strictEqual(parsed.flags['dry-run'], true);
    assert.strictEqual(parsed.flags.mode, 'ADOPT');
    assert.strictEqual(parsed.flags.target, 'my-dir');
    assert.strictEqual(parsed.flags.v, true);
  })) passed++; else failed++;

  if (test('color helpers produce styled strings or clean fallback', () => {
    assert.strictEqual(typeof cli.color.bold('hello'), 'string');
    assert.strictEqual(typeof cli.color.green('success'), 'string');
    assert.strictEqual(typeof cli.color.red('error'), 'string');
    assert.strictEqual(typeof cli.color.yellow('warn'), 'string');
  })) passed++; else failed++;

  if (test('styleStatus maps known statuses to colored strings', () => {
    assert.strictEqual(typeof cli.styleStatus('ok'), 'string');
    assert.strictEqual(typeof cli.styleStatus('created'), 'string');
    assert.strictEqual(typeof cli.styleStatus('conflict'), 'string');
    assert.strictEqual(typeof cli.styleStatus('stale'), 'string');
  })) passed++; else failed++;

  if (test('all cli outputs contain zero emojis', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.join(__dirname, '../../scripts/lib/cli.js'), 'utf8');
    assert.strictEqual(emojiRegex.test(content), false);
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
