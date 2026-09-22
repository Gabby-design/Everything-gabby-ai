/**
 * Tests for scripts/lib/paths.js
 *
 * Run with: node tests/lib/paths.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const paths = require('../../scripts/lib/paths');

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
  console.log('\n=== Testing paths.js ===\n');
  let passed = 0;
  let failed = 0;

  if (test('REPO_ROOT exists and contains package.json or GLOBAL.md', () => {
    assert.ok(fs.existsSync(paths.REPO_ROOT));
    assert.ok(fs.existsSync(path.join(paths.REPO_ROOT, 'GLOBAL.md')));
  })) passed++; else failed++;

  if (test('home and globalRoot return valid path strings', () => {
    const h = paths.home();
    assert.strictEqual(typeof h, 'string');
    assert.ok(h.length > 0);

    const gr = paths.globalRoot();
    assert.strictEqual(typeof gr, 'string');
    assert.ok(gr.length > 0);
  })) passed++; else failed++;

  if (test('agentHomes returns object with all expected assistant directories', () => {
    const homes = paths.agentHomes();
    assert.ok(homes.claude);
    assert.ok(homes.agents);
    assert.ok(homes.gemini);
    assert.ok(homes.antigravityConfig);
    assert.ok(homes.copilot);
    assert.ok(homes.codex);
  })) passed++; else failed++;

  if (test('loadConfig returns configuration with expected defaults', () => {
    const config = paths.loadConfig();
    assert.strictEqual(typeof config.agents, 'object');
    assert.strictEqual(config.agents.claude, true);
    assert.strictEqual(config.agents.antigravity, true);
    assert.strictEqual(typeof config.prdDir, 'string');
    assert.ok(Array.isArray(config.contextDocs));
  })) passed++; else failed++;

  if (test('version and tilde helpers operate cleanly', () => {
    const v = paths.version();
    assert.strictEqual(typeof v, 'string');
    assert.ok(/^\d+\.\d+\.\d+/.test(v));

    const p = path.join(paths.home(), 'test-path');
    assert.ok(paths.tilde(p).startsWith('~'));
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
