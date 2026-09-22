/**
 * Tests for scripts/lib/ops.js
 *
 * Run with: node tests/lib/ops.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { inspect, apply, sameTree, isPointerFile, GENERATED_MARK } = require('../../scripts/lib/ops');
const utils = require('../../scripts/lib/utils');

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
  console.log('\n=== Testing ops.js ===\n');

  let passed = 0;
  let failed = 0;
  const tempDir = path.join(utils.getTempDir(), `ops-test-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // 1. mkdir op
    if (test('inspect and apply mkdir op', () => {
      const targetDir = path.join(tempDir, 'subfolder');
      const op = { kind: 'mkdir', path: targetDir };

      assert.strictEqual(inspect(op), 'missing');
      const res = apply(op);
      assert.strictEqual(res.status, 'created');
      assert.strictEqual(inspect(op), 'ok');
    })) passed++; else failed++;

    // 2. file op
    if (test('inspect and apply file op with conflict detection', () => {
      const filePath = path.join(tempDir, 'sample.txt');
      const op = { kind: 'file', path: filePath, content: `${GENERATED_MARK}\nhello world` };

      assert.strictEqual(inspect(op), 'missing');
      apply(op);
      assert.strictEqual(inspect(op), 'ok');

      // User modified without mark
      fs.writeFileSync(filePath, 'handwritten content', 'utf8');
      assert.strictEqual(inspect(op), 'conflict');
    })) passed++; else failed++;

    // 3. managed op
    if (test('inspect and apply managed block op', () => {
      const cfgPath = path.join(tempDir, 'config.md');
      fs.writeFileSync(cfgPath, '# User Notes\nKeep this.', 'utf8');
      const op = { kind: 'managed', path: cfgPath, inner: 'managed instructions' };

      assert.strictEqual(inspect(op), 'missing');
      apply(op);
      assert.strictEqual(inspect(op), 'ok');

      const content = fs.readFileSync(cfgPath, 'utf8');
      assert.ok(content.includes('managed instructions'));
      assert.ok(content.includes('# User Notes'));
    })) passed++; else failed++;

    // 4. copy op
    if (test('inspect and apply copy op with vendored marker', () => {
      const srcDir = path.join(tempDir, 'src-dir');
      const dstDir = path.join(tempDir, 'dst-dir');
      utils.writeFile(path.join(srcDir, 'file.txt'), 'data');

      const op = { kind: 'copy', source: srcDir, path: dstDir };
      assert.strictEqual(inspect(op), 'missing');
      apply(op);
      assert.strictEqual(inspect(op), 'ok');
      assert.strictEqual(fs.readFileSync(path.join(dstDir, 'file.txt'), 'utf8'), 'data');
    })) passed++; else failed++;

    // 5. json op
    if (test('inspect and apply json merge op with backup', () => {
      const jsonPath = path.join(tempDir, 'settings.json');
      fs.writeFileSync(jsonPath, JSON.stringify({ existing: true }, null, 2), 'utf8');

      const op = {
        kind: 'json',
        path: jsonPath,
        merge: (prev) => ({ ...prev, added: 'yes' })
      };

      assert.strictEqual(inspect(op), 'stale');
      apply(op);
      assert.strictEqual(inspect(op), 'ok');

      const updated = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      assert.strictEqual(updated.existing, true);
      assert.strictEqual(updated.added, 'yes');
    })) passed++; else failed++;

    // 6. symlink op with pointer fallback on Windows
    if (test('symlink op creates symlink or safe pointer fallback', () => {
      const linkPath = path.join(tempDir, 'link-target.md');
      const targetPath = 'canonical-doc.md';
      const op = { kind: 'symlink', path: linkPath, target: targetPath };

      assert.strictEqual(inspect(op), 'missing');
      const res = apply(op, { allowPointerFallback: true });
      assert.strictEqual(res.status, 'created');
      assert.strictEqual(inspect(op), 'ok');
    })) passed++; else failed++;

  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
