/**
 * Tests for scripts/lib/detect.js
 *
 * Run with: node tests/lib/detect.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { detect, compareSemver } = require('../../scripts/lib/detect');
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
  console.log('\n=== Testing detect.js ===\n');

  let passed = 0;
  let failed = 0;
  const tempDir = path.join(utils.getTempDir(), `detect-test-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // 1. compareSemver
    if (test('compareSemver compares versions accurately', () => {
      assert.ok(compareSemver('1.0.0', '1.0.0') === 0);
      assert.ok(compareSemver('1.0.0', '1.1.0') < 0);
      assert.ok(compareSemver('2.0.0', '1.9.9') > 0);
      assert.ok(compareSemver('1.0.1', '1.0.0') > 0);
    })) passed++; else failed++;

    // 2. Greenfield repo -> INIT
    if (test('detect returns INIT for empty greenfield repository', () => {
      const greenfield = path.join(tempDir, 'greenfield');
      fs.mkdirSync(greenfield, { recursive: true });

      const res = detect(greenfield, '1.0.0');
      assert.strictEqual(res.mode, 'INIT');
      assert.strictEqual(res.legacy.length, 0);
    })) passed++; else failed++;

    // 3. Existing codebase with package.json -> ADOPT
    if (test('detect returns ADOPT for repository with code or manifests', () => {
      const existing = path.join(tempDir, 'existing-code');
      fs.mkdirSync(existing, { recursive: true });
      fs.writeFileSync(path.join(existing, 'package.json'), JSON.stringify({ name: 'my-app' }), 'utf8');

      const res = detect(existing, '1.0.0');
      assert.strictEqual(res.mode, 'ADOPT');
      assert.ok(res.evidence.some(e => e.includes('package.json')));
    })) passed++; else failed++;

    // 4. Codebase with legacy instructions -> ADOPT with legacy populated
    if (test('detect flags existing instruction files for migration in ADOPT mode', () => {
      const withLegacy = path.join(tempDir, 'with-legacy');
      fs.mkdirSync(withLegacy, { recursive: true });
      fs.writeFileSync(path.join(withLegacy, 'CLAUDE.md'), '# Original Claude rules', 'utf8');

      const res = detect(withLegacy, '1.0.0');
      assert.strictEqual(res.mode, 'ADOPT');
      assert.ok(res.legacy.includes('CLAUDE.md'));
    })) passed++; else failed++;

    // 5. System present but older version -> UPGRADE
    if (test('detect returns UPGRADE when docs/ai system is present with older version', () => {
      const olderSys = path.join(tempDir, 'older-sys');
      const docsAi = path.join(olderSys, 'docs', 'ai');
      fs.mkdirSync(docsAi, { recursive: true });
      fs.writeFileSync(path.join(docsAi, 'AGENT-CORE.md'), '# Canonical Core', 'utf8');
      fs.writeFileSync(path.join(docsAi, 'SYSTEM.md'), '---\nsystem_version: 0.8.0\n---\n# System Manifest', 'utf8');

      const res = detect(olderSys, '1.0.0');
      assert.strictEqual(res.mode, 'UPGRADE');
      assert.strictEqual(res.systemVersion, '0.8.0');
    })) passed++; else failed++;

    // 6. System present and current version -> AUDIT
    if (test('detect returns AUDIT when docs/ai system is current', () => {
      const currentSys = path.join(tempDir, 'current-sys');
      const docsAi = path.join(currentSys, 'docs', 'ai');
      fs.mkdirSync(docsAi, { recursive: true });
      fs.writeFileSync(path.join(docsAi, 'AGENT-CORE.md'), '# Canonical Core', 'utf8');
      fs.writeFileSync(path.join(docsAi, 'SYSTEM.md'), '---\nsystem_version: 1.0.0\n---\n# System Manifest', 'utf8');

      const res = detect(currentSys, '1.0.0');
      assert.strictEqual(res.mode, 'AUDIT');
      assert.strictEqual(res.systemVersion, '1.0.0');
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
