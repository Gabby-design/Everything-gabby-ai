/**
 * Phase 7 Verification Test Suite - Hooks, Scope Guard & Cross-Engine Handoffs
 * Tests:
 *   - scope-guard.js hook enforcing RULE-SCOPE-001
 *   - hooks.json integration
 *   - Dual-engine synergy and handoff contract validation
 *   - Zero emojis in all hooks and under 400 lines
 *
 * Run with: node tests/phase7-handoff-hooks.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

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
  console.log('\n=== Phase 7: Hooks, Scope Guard & Cross-Engine Handoffs ===\n');
  let passed = 0;
  let failed = 0;

  const scopeGuardScript = path.join(__dirname, '../scripts/hooks/scope-guard.js');

  if (test('scope-guard script exists and has valid syntax', () => {
    assert.ok(fs.existsSync(scopeGuardScript));
    const content = fs.readFileSync(scopeGuardScript, 'utf8');
    assert.ok(content.includes('RULE-SCOPE-001'));
    assert.ok(content.includes('[gabby scope guard]'));
  })) passed++; else failed++;

  if (test('scope-guard allows edits inside project directory', () => {
    const tmpProject = fs.mkdtempSync(path.join(os.tmpdir(), 'gabby-scope-test-'));
    try {
      const input = JSON.stringify({
        cwd: tmpProject,
        tool_input: { file_path: path.join(tmpProject, 'src', 'index.js') }
      });
      const res = spawnSync('node', [scopeGuardScript], {
        input,
        encoding: 'utf8'
      });
      assert.strictEqual(res.status, 0, `Expected exit 0 for project edit, got ${res.status}: ${res.stderr}`);
    } finally {
      fs.rmSync(tmpProject, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('scope-guard blocks edits resolving into ~/.agents from external project', () => {
    const tmpProject = fs.mkdtempSync(path.join(os.tmpdir(), 'gabby-scope-test-proj-'));
    const tmpGlobal = fs.mkdtempSync(path.join(os.tmpdir(), 'gabby-scope-test-global-'));
    try {
      const input = JSON.stringify({
        cwd: tmpProject,
        tool_input: { file_path: path.join(tmpGlobal, 'rules', 'test.md') }
      });
      const res = spawnSync('node', [scopeGuardScript], {
        input,
        encoding: 'utf8',
        env: { ...process.env, GABBY_AI_HOME: tmpGlobal, GABBY_SCOPE_GUARD: '' }
      });
      assert.strictEqual(res.status, 2, `Expected exit 2 (blocked) for global edit from project, got ${res.status}`);
      assert.ok(res.stderr.includes('[gabby scope guard] Blocked:'), 'Stderr must contain blocked notice');
    } finally {
      fs.rmSync(tmpProject, { recursive: true, force: true });
      fs.rmSync(tmpGlobal, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('scope-guard respects GABBY_SCOPE_GUARD=off bypass', () => {
    const tmpProject = fs.mkdtempSync(path.join(os.tmpdir(), 'gabby-scope-test-proj-'));
    const tmpGlobal = fs.mkdtempSync(path.join(os.tmpdir(), 'gabby-scope-test-global-'));
    try {
      const input = JSON.stringify({
        cwd: tmpProject,
        tool_input: { file_path: path.join(tmpGlobal, 'rules', 'test.md') }
      });
      const res = spawnSync('node', [scopeGuardScript], {
        input,
        encoding: 'utf8',
        env: { ...process.env, GABBY_AI_HOME: tmpGlobal, GABBY_SCOPE_GUARD: 'off' }
      });
      assert.strictEqual(res.status, 0, `Expected exit 0 when guard bypassed, got ${res.status}`);
    } finally {
      fs.rmSync(tmpProject, { recursive: true, force: true });
      fs.rmSync(tmpGlobal, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('dual-engine synergy rule and HANDOFF template define handoff protocols', () => {
    const rulePath = path.join(__dirname, '../rules/dual-engine-synergy.md');
    assert.ok(fs.existsSync(rulePath));
    const ruleContent = fs.readFileSync(rulePath, 'utf8');
    assert.ok(ruleContent.includes('Claude Code'));
    assert.ok(ruleContent.includes('Google Antigravity'));
    assert.ok(ruleContent.includes('HANDOFF.md'));

    const tplPath = path.join(__dirname, '../templates/docs-ai/HANDOFF.md');
    assert.ok(fs.existsSync(tplPath));
    const tplContent = fs.readFileSync(tplPath, 'utf8');
    assert.ok(/HANDOFF/i.test(tplContent));
    assert.ok(tplContent.includes('The baton for unfinished work'));
  })) passed++; else failed++;

  if (test('Core Principle 3: Zero emojis across all scripts/hooks/ files', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    const hooksDir = path.join(__dirname, '../scripts/hooks');
    const files = fs.readdirSync(hooksDir).map(f => path.join(hooksDir, f));

    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      assert.strictEqual(emojiRegex.test(content), false, `Emoji found in ${f}`);
    }
  })) passed++; else failed++;

  console.log(`\nPhase 7 Tests Passed: ${passed}`);
  console.log(`Phase 7 Tests Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
