/**
 * Tests for scripts/lib/template.js and docs/ai templates.
 *
 * Run with: node tests/lib/template.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const template = require('../../scripts/lib/template');

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
  console.log('\n=== Testing Template Engine and docs/ai Templates ===\n');

  let passed = 0;
  let failed = 0;

  if (test('listTemplates finds all canonical docs/ai templates', () => {
    const list = template.listTemplates();
    assert.ok(list.length >= 18, `Expected at least 18 templates, found ${list.length}`);

    const expected = [
      'AGENT-CORE.md',
      'ARCHITECTURE.md',
      'CONSTITUTION.md',
      'ENGINEERING.md',
      'HANDOFF.md',
      'INDEX.md',
      'MEMORY.md',
      'NOTES.md',
      'RULES.md',
      'SYSTEM.md',
      'VERIFICATION.md',
      'WORKFLOW.md',
      'decisions/ADR-TEMPLATE.md',
      'decisions/INDEX.md',
      'domains/INDEX.md',
      'plans/INDEX.md',
      'plans/PLAN-TEMPLATE.md',
      'workflows/INDEX.md'
    ];

    for (const item of expected) {
      assert.ok(list.includes(item), `Missing template: ${item}`);
    }
  })) passed++; else failed++;

  if (test('readTemplate loads raw template and errors on missing template', () => {
    const core = template.readTemplate('AGENT-CORE');
    assert.ok(core.includes('doc: AGENT-CORE'));
    assert.ok(core.includes('{{PROJECT}}'));

    assert.throws(() => {
      template.readTemplate('non-existent-template-xyz');
    }, /Template not found/);
  })) passed++; else failed++;

  if (test('render substitutes variables cleanly', () => {
    const raw = '# Hello {{PROJECT}} on {{DATE}}\nManager: {{PACKAGE_MANAGER}}';
    const rendered = template.render(raw, {
      PROJECT: 'AlphaProject',
      DATE: '2026-09-22',
      PACKAGE_MANAGER: 'pnpm'
    });

    assert.strictEqual(rendered, '# Hello AlphaProject on 2026-09-22\nManager: pnpm');
  })) passed++; else failed++;

  if (test('instantiate generates full docs/ai structure in target directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-inst-'));

    try {
      const vars = {
        PROJECT: 'DemoApp',
        DATE: '2026-09-22',
        PACKAGE_MANAGER: 'npm',
        MODE: 'INIT',
        MODE_NOTE: 'Fresh project initialization',
        PRD_DIR: 'docs/ai/prd',
        PRD_PATH: 'docs/ai/prd/prd.md',
        VERSION: '1.0.0'
      };

      const result = template.instantiate(tmpDir, vars);
      assert.strictEqual(result.success, true);
      assert.ok(result.files.length >= 18);

      // Verify AGENT-CORE rendered
      const corePath = path.join(tmpDir, 'AGENT-CORE.md');
      assert.ok(fs.existsSync(corePath));
      const coreContent = fs.readFileSync(corePath, 'utf8');
      assert.ok(coreContent.includes('AGENT-CORE -- DemoApp') || coreContent.includes('AGENT-CORE — DemoApp'));
      assert.ok(!coreContent.includes('{{PROJECT}}'));

      // Verify subdirectories created
      assert.ok(fs.existsSync(path.join(tmpDir, 'decisions', 'ADR-TEMPLATE.md')));
      assert.ok(fs.existsSync(path.join(tmpDir, 'plans', 'PLAN-TEMPLATE.md')));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('all template files contain zero emojis and stay under 400 lines', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    const root = template.getTemplatesDir();
    const list = template.listTemplates();

    for (const relPath of list) {
      const fullPath = path.join(root, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length;

      assert.strictEqual(emojiRegex.test(content), false, `Template ${relPath} contains emojis`);
      assert.ok(lines < 400, `Template ${relPath} line count (${lines}) exceeds 400 lines`);
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
