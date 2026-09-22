/**
 * Tests for scripts/init-project.js and bin/agent.js CLI
 *
 * Run with: node tests/init-project.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { initProject, inspectProject } = require('../scripts/init-project');
const { handleCheck, handleList } = require('../bin/agent.js');

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
  console.log('\n=== Testing Project Initializer & CLI ===\n');

  let passed = 0;
  let failed = 0;

  if (test('inspectProject returns detected mode, project name, and commands', () => {
    const info = inspectProject(process.cwd());
    assert.strictEqual(typeof info.projectName, 'string');
    assert.ok(info.detection);
    assert.ok(info.packageManager);
    assert.ok(info.commands.test);
    assert.ok(info.commands.build);
  })) passed++; else failed++;

  if (test('initProject dry-run reports planned ops without touching disk', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-init-dry-'));

    try {
      const res = initProject({ targetDir: tmpDir, dryRun: true });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.dryRun, true);
      assert.ok(res.templatesCount >= 18);
      assert.ok(res.adapterOpsCount >= 5);

      // Verify no docs/ai was written
      assert.strictEqual(fs.existsSync(path.join(tmpDir, 'docs', 'ai')), false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('initProject initializes full docs/ai system and assistant entry points', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-init-full-'));

    try {
      const res = initProject({ targetDir: tmpDir, dryRun: false });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.dryRun, false);

      // Verify docs/ai files
      const docsAiDir = path.join(tmpDir, 'docs', 'ai');
      assert.ok(fs.existsSync(docsAiDir), 'docs/ai must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'AGENT-CORE.md')), 'AGENT-CORE.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'SYSTEM.md')), 'SYSTEM.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'WORKFLOW.md')), 'WORKFLOW.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'CONSTITUTION.md')), 'CONSTITUTION.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'ENGINEERING.md')), 'ENGINEERING.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'VERIFICATION.md')), 'VERIFICATION.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'MEMORY.md')), 'MEMORY.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'HANDOFF.md')), 'HANDOFF.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'NOTES.md')), 'NOTES.md must exist');
      assert.ok(fs.existsSync(path.join(docsAiDir, 'INDEX.md')), 'INDEX.md must exist');

      // Verify entry points
      assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')), 'CLAUDE.md must exist');
      assert.ok(fs.existsSync(path.join(tmpDir, 'GEMINI.md')), 'GEMINI.md must exist');
      assert.ok(fs.existsSync(path.join(tmpDir, 'AGENTS.md')), 'AGENTS.md must exist');
      assert.ok(fs.existsSync(path.join(tmpDir, '.github', 'copilot-instructions.md')), 'Copilot instructions must exist');
      assert.ok(fs.existsSync(path.join(tmpDir, '.agents', 'rules', '00-agent-core.md')), 'Antigravity workspace rule must exist');

      // Verify zero emojis
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
      const coreContent = fs.readFileSync(path.join(docsAiDir, 'AGENT-CORE.md'), 'utf8');
      assert.strictEqual(emojiRegex.test(coreContent), false, 'AGENT-CORE.md contains emojis');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('initProject is idempotent on subsequent runs without overwriting', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-init-idemp-'));

    try {
      // First run
      const first = initProject({ targetDir: tmpDir, dryRun: false });
      assert.strictEqual(first.success, true);
      const firstApplied = first.applied.appliedCount;
      assert.ok(firstApplied > 0);

      // Second run
      const second = initProject({ targetDir: tmpDir, dryRun: false });
      assert.strictEqual(second.success, true);
      // On second run, existing files should be skipped
      assert.ok(second.applied.skippedCount > 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('CLI handlers execute without errors', () => {
    // Test handleList
    assert.doesNotThrow(() => {
      handleList();
    });

    // Test handleCheck
    assert.doesNotThrow(() => {
      handleCheck([process.cwd()]);
    });
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
