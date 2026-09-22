/**
 * Tests for scripts/lib/ctx.js
 *
 * Run with: node tests/lib/ctx.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const ctx = require('../../scripts/lib/ctx');

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
  console.log('\n=== Testing ctx.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('sha generates consistent sha256 checksum for file', () => {
    const tmpFile = path.join(os.tmpdir(), `ctx-test-sha-${Date.now()}.txt`);
    try {
      fs.writeFileSync(tmpFile, 'hello world\n', 'utf8');
      const hash = ctx.sha(tmpFile);
      assert.strictEqual(typeof hash, 'string');
      assert.strictEqual(hash.length, 64);
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  })) passed++; else failed++;

  if (test('init creates placeholder derived file for configured document', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctx-test-dir-'));
    try {
      // Create source MEMORY.md
      fs.writeFileSync(path.join(tmpDir, 'MEMORY.md'), '# Memory\nInitial knowledge.\n', 'utf8');

      const results = ctx.init(tmpDir, ['MEMORY']);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].created, true);

      const derivedPath = path.join(tmpDir, 'docs', 'ai', 'context', 'MEMORY.md');
      assert.ok(fs.existsSync(derivedPath));

      const status = ctx.status(tmpDir, ['MEMORY']);
      assert.strictEqual(status[0].state, 'stale'); // Because placeholder is present
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('stamp updates frontmatter sha256 and marks status current', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctx-test-stamp-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'MEMORY.md'), '# Memory\nReal knowledge.\n', 'utf8');
      ctx.init(tmpDir, ['MEMORY']);

      const derivedPath = path.join(tmpDir, 'docs', 'ai', 'context', 'MEMORY.md');
      // Replace placeholder with actual body
      fs.writeFileSync(
        derivedPath,
        '---\ndoc: context/MEMORY\nsource: MEMORY.md\nsource_sha256: null\n---\n# Memory\nCompressed facts.\n',
        'utf8'
      );

      const stampResults = ctx.stamp(tmpDir, ['MEMORY']);
      assert.strictEqual(stampResults[0].stamped, true);

      const status = ctx.status(tmpDir, ['MEMORY']);
      assert.strictEqual(status[0].state, 'current');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
