/**
 * Test Suite: Phase 5 Project System and docs/ai Templates
 * Verifies that:
 * - Templates exist in templates/docs-ai and skills/gabby-system/templates/docs-ai
 * - Gabby branding and version tags are used throughout
 * - Variable interpolation creates valid docs/ai hierarchy
 * - Zero emojis in any template
 * - All templates are under 400 lines
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const template = require('../scripts/lib/template');

const REPO_ROOT = path.resolve(__dirname, '..');
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

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
  console.log('\n=== Phase 5: Project System & docs/ai Templates ===\n');

  let passed = 0;
  let failed = 0;

  // 1. Verify template counts and presence in root templates and gabby-system skill
  if (test('All 18 canonical templates exist in templates/docs-ai and skills/gabby-system', () => {
    const rootTemplates = template.listTemplates();
    assert.ok(rootTemplates.length >= 18, `Expected >= 18 root templates, got ${rootTemplates.length}`);

    const skillTemplatesDir = path.join(REPO_ROOT, 'skills', 'gabby-system', 'templates', 'docs-ai');
    assert.ok(fs.existsSync(skillTemplatesDir), 'skills/gabby-system/templates/docs-ai must exist');
    const skillTemplates = template.listTemplates(skillTemplatesDir);
    assert.ok(skillTemplates.length >= 18, `Expected >= 18 skill templates, got ${skillTemplates.length}`);
  })) passed++; else failed++;

  // 2. Verify Gabby branding in SYSTEM.md, AGENT-CORE.md, and WORKFLOW.md
  if (test('Templates use gabby identity and CLI command references', () => {
    const systemTmpl = template.readTemplate('SYSTEM');
    assert.ok(systemTmpl.includes('gabby_version:'), 'SYSTEM.md must use gabby_version');
    assert.ok(systemTmpl.includes('v3 (gabby {{GABBY_VERSION}})'), 'SYSTEM.md must reference gabby version');
    assert.ok(systemTmpl.includes('gabby caveman'), 'SYSTEM.md must reference gabby caveman');
    assert.ok(!systemTmpl.includes('kiwi_version'), 'SYSTEM.md must not reference kiwi_version');

    const coreTmpl = template.readTemplate('AGENT-CORE');
    assert.ok(coreTmpl.includes('gabby-system'), 'AGENT-CORE.md must reference gabby-system');
    assert.ok(coreTmpl.includes('gabby link'), 'AGENT-CORE.md must reference gabby link');
    assert.ok(coreTmpl.includes('gabby ctx status'), 'AGENT-CORE.md must reference gabby ctx status');
    assert.ok(!coreTmpl.includes('kiwi_version'), 'AGENT-CORE.md must not reference kiwi_version');

    const workflowTmpl = template.readTemplate('WORKFLOW');
    assert.ok(workflowTmpl.includes('gabby ctx stamp'), 'WORKFLOW.md must reference gabby ctx stamp');
    assert.ok(!workflowTmpl.includes('kiwi ctx'), 'WORKFLOW.md must not reference kiwi ctx');
  })) passed++; else failed++;

  // 3. Test instantiation into a clean temporary project
  if (test('Instantiation generates complete docs/ai structure with populated metadata', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gabby-proj-test-'));

    try {
      const vars = {
        PROJECT: 'AlphaService',
        DATE: '2026-09-22',
        PACKAGE_MANAGER: 'pnpm',
        MODE: 'INIT',
        MODE_NOTE: 'Greenfield setup',
        PRD_DIR: 'docs/ai/prd',
        PRD_PATH: 'docs/ai/prd/prd.md',
        GABBY_VERSION: '1.0.0',
        VERSION: '1.0.0'
      };

      const result = template.instantiate(tmpDir, vars);
      assert.strictEqual(result.success, true);

      const generatedSystem = fs.readFileSync(path.join(tmpDir, 'SYSTEM.md'), 'utf8');
      assert.ok(generatedSystem.includes('gabby_version: "1.0.0"'));
      assert.ok(generatedSystem.includes('package_manager: "pnpm"'));

      const generatedCore = fs.readFileSync(path.join(tmpDir, 'AGENT-CORE.md'), 'utf8');
      assert.ok(generatedCore.includes('# AGENT-CORE — AlphaService'));
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  })) passed++; else failed++;

  // 4. Zero Emojis and Max Line Limits across all templates
  if (test('Core Principle 3: Zero emojis and under 400 lines across all templates', () => {
    const list = template.listTemplates();
    const root = path.join(REPO_ROOT, 'templates', 'docs-ai');

    for (const relPath of list) {
      const fullPath = path.join(root, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length;

      assert.ok(
        lines <= 400,
        `Template ${relPath} exceeds 400 lines (${lines} lines)`
      );

      const match = content.match(EMOJI_REGEX);
      assert.strictEqual(
        match,
        null,
        `Emoji found in template ${relPath}: ${match ? match[0] : ''}`
      );
    }
  })) passed++; else failed++;

  console.log(`\nPhase 5 Tests Passed: ${passed}`);
  console.log(`Phase 5 Tests Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
