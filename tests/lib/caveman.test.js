/**
 * Tests for scripts/lib/caveman.js
 *
 * Run with: node tests/lib/caveman.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const caveman = require('../../scripts/lib/caveman');

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
  console.log('\n=== Testing caveman.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('MODES constant contains off, lite, full, ultra', () => {
    assert.deepStrictEqual(caveman.MODES, ['off', 'lite', 'full', 'ultra']);
  })) passed++; else failed++;

  if (test('effective defaults to full or global config', () => {
    const eff = caveman.effective(os.tmpdir());
    assert.ok(caveman.MODES.includes(eff.mode));
    assert.ok(eff.source);
  })) passed++; else failed++;

  if (test('effective detects project .caveman.json', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'caveman-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '.caveman.json'), JSON.stringify({ defaultMode: 'lite' }));
      const eff = caveman.effective(tmpDir);
      assert.strictEqual(eff.mode, 'lite');
      assert.strictEqual(eff.source, 'project');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('statement generates clear instructions without emojis', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    for (const m of caveman.MODES) {
      const stmt = caveman.statement(m);
      assert.strictEqual(typeof stmt, 'string');
      assert.ok(stmt.length > 0);
      assert.strictEqual(emojiRegex.test(stmt), false, `Statement for mode ${m} contains emoji`);
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
