/**
 * Test Suite: Phase 3 Global Constitution & System Architecture
 * Verifies that GLOBAL.md and docs/*.md adhere to:
 * - Complete 8 Core Principles and non-negotiables
 * - Structural integrity and completeness
 * - Max file size limits (< 400 lines)
 * - Zero emoji mandate (Core Principle 3)
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

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
  console.log('\n=== Phase 3: Global Constitution & System Architecture ===\n');

  let passed = 0;
  let failed = 0;

  // 1. Verify GLOBAL.md structure and 8 Core Principles
  if (test('GLOBAL.md contains all 8 Core Principles and constitutional sections', () => {
    const globalPath = path.join(REPO_ROOT, 'GLOBAL.md');
    assert.ok(fs.existsSync(globalPath), 'GLOBAL.md does not exist');
    const content = fs.readFileSync(globalPath, 'utf8');

    // Verify 8 Core Principles
    assert.ok(content.includes('Scope and autonomy'), 'Missing Principle 1');
    assert.ok(content.includes('Read before writing'), 'Missing Principle 2');
    assert.ok(content.includes('Code quality'), 'Missing Principle 3');
    assert.ok(content.includes('Safety'), 'Missing Principle 4');
    assert.ok(content.includes('Testing and verification'), 'Missing Principle 5');
    assert.ok(content.includes('Git'), 'Missing Principle 6');
    assert.ok(content.includes('Communication'), 'Missing Principle 7');
    assert.ok(content.includes('Switching between agents'), 'Missing Principle 8');

    // Verify key sections
    assert.ok(content.includes('Non-Negotiables'), 'Missing Non-Negotiables');
    assert.ok(content.includes('The Engineering Lifecycle'), 'Missing Lifecycle');
    assert.ok(content.includes('Output Style: Caveman Register'), 'Missing Caveman section');
    assert.ok(content.includes('The Global System'), 'Missing Global System section');
    assert.ok(content.includes('Two Layers: Global vs Project'), 'Missing Two Layers section');
  })) passed++; else failed++;

  // 2. Verify docs/*.md files exist
  if (test('All 5 core architectural documentation files exist in docs/', () => {
    const expectedDocs = [
      'AGENT-MATRIX.md',
      'PROJECT-SYSTEM.md',
      'INSTALL.md',
      'EXTENDING.md',
      'HANDBOOK.md'
    ];
    for (const doc of expectedDocs) {
      const docPath = path.join(REPO_ROOT, 'docs', doc);
      assert.ok(fs.existsSync(docPath), `Missing documentation file: docs/${doc}`);
      const content = fs.readFileSync(docPath, 'utf8');
      assert.ok(content.length > 200, `docs/${doc} is unexpectedly short`);
    }
  })) passed++; else failed++;

  // 3. File line limit check (< 400 lines)
  if (test('Core Principle 3: Every documentation file is under 400 lines', () => {
    const docFiles = [
      path.join(REPO_ROOT, 'GLOBAL.md'),
      path.join(REPO_ROOT, 'docs', 'AGENT-MATRIX.md'),
      path.join(REPO_ROOT, 'docs', 'PROJECT-SYSTEM.md'),
      path.join(REPO_ROOT, 'docs', 'INSTALL.md'),
      path.join(REPO_ROOT, 'docs', 'EXTENDING.md'),
      path.join(REPO_ROOT, 'docs', 'HANDBOOK.md')
    ];

    for (const filePath of docFiles) {
      const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
      assert.ok(
        lines <= 400,
        `File ${path.relative(REPO_ROOT, filePath)} exceeds 400 lines (${lines} lines)`
      );
    }
  })) passed++; else failed++;

  // 4. Zero Emoji Check across all constitution & doc files
  if (test('Core Principle 3: Zero emojis in GLOBAL.md or any docs/*.md file', () => {
    const docFiles = [
      path.join(REPO_ROOT, 'GLOBAL.md'),
      path.join(REPO_ROOT, 'docs', 'AGENT-MATRIX.md'),
      path.join(REPO_ROOT, 'docs', 'PROJECT-SYSTEM.md'),
      path.join(REPO_ROOT, 'docs', 'INSTALL.md'),
      path.join(REPO_ROOT, 'docs', 'EXTENDING.md'),
      path.join(REPO_ROOT, 'docs', 'HANDBOOK.md')
    ];

    for (const filePath of docFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(EMOJI_REGEX);
      assert.strictEqual(
        match,
        null,
        `Found emoji in ${path.relative(REPO_ROOT, filePath)}: ${match ? match[0] : ''}`
      );
    }
  })) passed++; else failed++;

  console.log(`\nPhase 3 Tests Passed: ${passed}`);
  console.log(`Phase 3 Tests Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
