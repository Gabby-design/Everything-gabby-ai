/**
 * Phase 6 Verification Test Suite - CLI Engine & Commands
 * Tests all modular gabby CLI subcommands:
 *   - spec, template, stamp, caveman, ctx, context, agent, link, vendor, doctor, init, upgrade, new, list, uninstall
 *   - Core Principle 3: Zero emojis, under 400 lines per file
 *
 * Run with: node tests/phase6-cli-engine.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const gabby = require('../bin/gabby.js');
const spec = require('../scripts/lib/commands/spec');
const template = require('../scripts/lib/commands/template');
const context = require('../scripts/lib/commands/context');
const agent = require('../scripts/lib/commands/agent');
const cavemanCmd = require('../scripts/lib/commands/caveman');
const stamp = require('../scripts/lib/commands/stamp');
const ctxCmd = require('../scripts/lib/commands/ctx');
const link = require('../scripts/lib/commands/link');
const doctor = require('../scripts/lib/commands/doctor');
const initCmd = require('../scripts/lib/commands/init');
const upgrade = require('../scripts/lib/commands/upgrade');
const newCmd = require('../scripts/lib/commands/new');
const listCmd = require('../scripts/lib/commands/list');
const uninstall = require('../scripts/lib/commands/uninstall');

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
  console.log('\n=== Phase 6: CLI Engine & Commands ===\n');
  let passed = 0;
  let failed = 0;

  if (test('gabby binary exports all expected commands and backwards-compatible handlers', () => {
    assert.strictEqual(typeof gabby.main, 'function');
    assert.strictEqual(typeof gabby.handleSync, 'function');
    assert.strictEqual(typeof gabby.handleInit, 'function');
    assert.strictEqual(typeof gabby.handleList, 'function');
    assert.strictEqual(typeof gabby.handleCheck, 'function');
    assert.strictEqual(typeof gabby.handleDoctor, 'function');
    assert.ok(gabby.COMMANDS);

    const expectedCommands = [
      'sync', 'install', 'doctor', 'init', 'link', 'vendor', 'export',
      'upgrade', 'agent', 'context', 'spec', 'template', 'stamp',
      'caveman', 'ctx', 'uninstall', 'new', 'list', 'check'
    ];
    for (const cmd of expectedCommands) {
      assert.ok(gabby.COMMANDS[cmd], `Command ${cmd} must be registered in gabby.COMMANDS`);
      const loaded = gabby.COMMANDS[cmd]();
      assert.strictEqual(typeof loaded.run, 'function', `${cmd} must have a run function`);
    }
  })) passed++; else failed++;

  if (test('gabby spec parses headings and sections from INITIALIZER.md', () => {
    const sPath = spec.specPath();
    assert.ok(fs.existsSync(sPath), `Specification file must exist at ${sPath}`);
    const text = fs.readFileSync(sPath, 'utf8');
    const { heads } = spec.sections(text);
    assert.ok(heads.length > 50, `Must parse many headings, got ${heads.length}`);

    // Test specific section extraction
    const sweep = spec.section(text, '22.3');
    assert.ok(sweep, 'Must extract section 22.3');
    assert.ok(sweep.includes('Reverse-engineering sweep'), 'Section 22.3 must contain title');
    assert.ok(sweep.includes('package manager'), 'Section 22.3 must describe toolchain');

    const globalHierarchy = spec.section(text, '0.0.1');
    assert.ok(globalHierarchy, 'Must extract section 0.0.1');
    assert.ok(globalHierarchy.includes('Where the global system sits'), 'Section 0.0.1 title must match');
  })) passed++; else failed++;

  if (test('gabby template lists and locates all 18 canonical templates', () => {
    const list = template.list();
    assert.strictEqual(list.length, 18, `Expected 18 canonical templates, got ${list.length}`);
    assert.ok(list.includes('AGENT-CORE.md'));
    assert.ok(list.includes('SYSTEM.md'));
    assert.ok(list.includes('CONSTITUTION.md'));
    assert.ok(list.includes('WORKFLOW.md'));
    assert.ok(list.includes('ENGINEERING.md'));
    assert.ok(list.includes('VERIFICATION.md'));
    assert.ok(list.includes('decisions/ADR-TEMPLATE.md'));
    assert.ok(list.includes('plans/PLAN-TEMPLATE.md'));
  })) passed++; else failed++;

  if (test('gabby context gathers verified project facts and renders markdown', () => {
    const gathered = context.gather(process.cwd());
    assert.ok(gathered.project);
    assert.ok(gathered.mode);
    assert.ok(gathered.git);
    assert.ok(gathered.toolchain);
    assert.ok(gathered.instructions);
    assert.ok(gathered.docsAi);
    assert.ok(gathered.global);
    assert.strictEqual(typeof gathered.global.version, 'string');

    const rendered = context.render(gathered);
    assert.ok(rendered.includes('# gabby context'));
    assert.ok(rendered.includes('## Mode'));
    assert.ok(rendered.includes('## Git (read-only)'));
    assert.ok(rendered.includes('## Toolchain'));
    assert.ok(rendered.includes('## Global system'));
  })) passed++; else failed++;

  if (test('gabby agent brief supports all 6 canonical modes', () => {
    const supported = agent.MODES;
    assert.deepStrictEqual(supported, ['INIT', 'ADOPT', 'UPGRADE', 'AUDIT', 'AMEND', 'EXTEND']);
  })) passed++; else failed++;

  if (test('gabby doctor, link, upgrade, stamp, ctx, and caveman command modules have valid contracts', () => {
    for (const mod of [doctor, link, upgrade, stamp, ctxCmd, cavemanCmd, initCmd, newCmd, listCmd, uninstall]) {
      assert.strictEqual(typeof mod.run, 'function');
      assert.strictEqual(typeof mod.help, 'string');
    }
  })) passed++; else failed++;

  if (test('Core Principle 3: Zero emojis across all command modules and bin/gabby.js', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    const cmdDir = path.join(__dirname, '../scripts/lib/commands');
    const files = fs.readdirSync(cmdDir).map(f => path.join(cmdDir, f));
    files.push(path.join(__dirname, '../bin/gabby.js'));

    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      assert.strictEqual(emojiRegex.test(content), false, `Emoji found in ${f}`);
    }
  })) passed++; else failed++;

  if (test('Core Principle 3: Every command file is under 400 lines', () => {
    const cmdDir = path.join(__dirname, '../scripts/lib/commands');
    const files = fs.readdirSync(cmdDir).map(f => path.join(cmdDir, f));
    files.push(path.join(__dirname, '../bin/gabby.js'));

    for (const f of files) {
      const lineCount = fs.readFileSync(f, 'utf8').split('\n').length;
      assert.ok(lineCount <= 400, `File ${path.basename(f)} exceeds 400 lines: ${lineCount}`);
    }
  })) passed++; else failed++;

  console.log(`\nPhase 6 Tests Passed: ${passed}`);
  console.log(`Phase 6 Tests Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
