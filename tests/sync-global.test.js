/**
 * Tests for scripts/sync-global.js
 *
 * Run with: node tests/sync-global.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { syncGlobal, generateGlobalIndex, collectItems } = require('../scripts/sync-global');
const utils = require('../scripts/lib/utils');

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
  console.log('\n=== Testing Global Sync Engine ===\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Dry-run execution
  if (test('Global sync dry-run executes cleanly without writing files', () => {
    const tempTarget = path.join(utils.getTempDir(), `sync-dryrun-${Date.now()}`);
    try {
      const result = syncGlobal({ dryRun: true, targetDir: tempTarget, silent: true });
      assert.strictEqual(result.success, true);
      assert.strictEqual(fs.existsSync(tempTarget), false, 'Target directory should not be created on dry-run');
    } finally {
      if (fs.existsSync(tempTarget)) {
        fs.rmSync(tempTarget, { recursive: true });
      }
    }
  })) passed++; else failed++;

  // Test 2: Actual sync to temporary target
  if (test('Global sync installs skills, personas, rules, and bin wrappers to target', () => {
    const tempTarget = path.join(utils.getTempDir(), `sync-real-${Date.now()}`);
    try {
      const result = syncGlobal({ dryRun: false, targetDir: tempTarget, silent: true });
      assert.strictEqual(result.success, true);
      assert.ok(fs.existsSync(path.join(tempTarget, 'agents')), 'Agents directory should exist');
      assert.ok(fs.existsSync(path.join(tempTarget, 'skills')), 'Skills directory should exist');
      assert.ok(fs.existsSync(path.join(tempTarget, 'rules')), 'Rules directory should exist');
      assert.ok(fs.existsSync(path.join(tempTarget, 'bin')), 'Bin directory should exist');
      assert.ok(fs.existsSync(path.join(tempTarget, 'GLOBAL_INDEX.md')), 'GLOBAL_INDEX.md should exist');

      // Verify wrapper files
      assert.ok(fs.existsSync(path.join(tempTarget, 'bin', 'agent-sync.cmd')), 'agent-sync.cmd should exist');
      assert.ok(fs.existsSync(path.join(tempTarget, 'bin', 'agent-sync.ps1')), 'agent-sync.ps1 should exist');
      assert.ok(fs.existsSync(path.join(tempTarget, 'bin', 'agent-sync')), 'agent-sync shell wrapper should exist');
    } finally {
      if (fs.existsSync(tempTarget)) {
        fs.rmSync(tempTarget, { recursive: true });
      }
    }
  })) passed++; else failed++;

  // Test 3: Master index generator content
  if (test('GLOBAL_INDEX.md contains agent personas, skills, and usage guide', () => {
    const sampleItems = {
      agents: [{ name: 'architect', desc: 'System architecture' }],
      skills: [{ name: 'tdd-workflow', desc: 'Test-driven development' }],
      rules: [{ name: 'coding-style', desc: 'Code formatting' }],
      workflows: [{ name: 'new-feature', desc: 'Feature workflow' }]
    };

    const indexMd = generateGlobalIndex(sampleItems);
    assert.ok(indexMd.includes('# Global AI System - Master Index'));
    assert.ok(indexMd.includes('`architect`'));
    assert.ok(indexMd.includes('`tdd-workflow`'));
    assert.ok(indexMd.includes('`coding-style`'));
    assert.ok(indexMd.includes('`new-feature`'));
    assert.ok(indexMd.includes('Usage Instructions for Any AI Assistant'));
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
