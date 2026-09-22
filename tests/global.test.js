/**
 * Tests for GLOBAL.md Universal Constitution and 8 Core Principles.
 *
 * Run with: node tests/global.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { syncGlobal } = require('../scripts/sync-global');

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
  console.log('\n=== Testing GLOBAL.md Constitution ===\n');

  let passed = 0;
  let failed = 0;

  const globalPath = path.join(ROOT, 'GLOBAL.md');

  if (test('GLOBAL.md exists at project root', () => {
    assert.ok(fs.existsSync(globalPath), 'GLOBAL.md must exist in root');
  })) passed++; else failed++;

  if (test('GLOBAL.md contains all 8 Core Principles', () => {
    const content = fs.readFileSync(globalPath, 'utf8');

    const expectedPrinciples = [
      'Scope and autonomy',
      'Read before writing',
      'Code quality',
      'Safety',
      'Testing and verification',
      'Git',
      'Communication',
      'Switching between agents'
    ];

    for (const p of expectedPrinciples) {
      assert.ok(content.includes(p), `GLOBAL.md must include principle: ${p}`);
    }
  })) passed++; else failed++;

  if (test('GLOBAL.md enforces zero emojis, length limits, and write scope', () => {
    const content = fs.readFileSync(globalPath, 'utf8');

    // Emoji check
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    assert.strictEqual(emojiRegex.test(content), false, 'GLOBAL.md must contain zero emojis');

    // Length check (< 400 lines)
    const lineCount = content.split('\n').length;
    assert.ok(lineCount < 400, `GLOBAL.md line count (${lineCount}) should be < 400`);

    // Write scope rule check
    assert.ok(content.includes('RULE-SCOPE-001'), 'GLOBAL.md must define write scope rule');
  })) passed++; else failed++;

  if (test('syncGlobal copies GLOBAL.md to target root and updates index', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-global-const-'));

    try {
      const result = syncGlobal({ targetDir: tmpDir, silent: true });
      assert.strictEqual(result.success, true);

      // Verify GLOBAL.md was copied to target
      const targetGlobal = path.join(tmpDir, 'GLOBAL.md');
      assert.ok(fs.existsSync(targetGlobal), 'Target directory must receive GLOBAL.md');
      const targetContent = fs.readFileSync(targetGlobal, 'utf8');
      assert.ok(targetContent.includes('Core Principles'));

      // Verify GLOBAL_INDEX.md mentions GLOBAL.md
      const targetIndex = path.join(tmpDir, 'GLOBAL_INDEX.md');
      assert.ok(fs.existsSync(targetIndex), 'Target directory must receive GLOBAL_INDEX.md');
      const indexContent = fs.readFileSync(targetIndex, 'utf8');
      assert.ok(indexContent.includes('GLOBAL.md'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
