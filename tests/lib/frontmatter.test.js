/**
 * Tests for scripts/lib/frontmatter.js
 *
 * Run with: node tests/lib/frontmatter.test.js
 */

const assert = require('assert');
const { parse, stringify, setKey, parseScalar } = require('../../scripts/lib/frontmatter');

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
  console.log('\n=== Testing frontmatter.js ===\n');

  let passed = 0;
  let failed = 0;

  // Scalar parser
  if (test('parseScalar handles booleans, numbers, strings, and arrays', () => {
    assert.strictEqual(parseScalar('true'), true);
    assert.strictEqual(parseScalar('false'), false);
    assert.strictEqual(parseScalar('null'), null);
    assert.strictEqual(parseScalar('123'), 123);
    assert.strictEqual(parseScalar('3.14'), 3.14);
    assert.strictEqual(parseScalar('"hello world"'), 'hello world');
    assert.deepStrictEqual(parseScalar('[a, b, c]'), ['a', 'b', 'c']);
    assert.strictEqual(parseScalar('plain string'), 'plain string');
  })) passed++; else failed++;

  // Document parsing
  if (test('parse parses YAML frontmatter and extracts body', () => {
    const md = `---
name: test-skill
description: "A test description"
version: 1
enabled: true
tags: [alpha, beta]
---
# Body Title
This is the markdown body.`;

    const result = parse(md);
    assert.strictEqual(result.hasFrontmatter, true);
    assert.strictEqual(result.data.name, 'test-skill');
    assert.strictEqual(result.data.description, 'A test description');
    assert.strictEqual(result.data.version, 1);
    assert.strictEqual(result.data.enabled, true);
    assert.deepStrictEqual(result.data.tags, ['alpha', 'beta']);
    assert.ok(result.body.includes('# Body Title'));
  })) passed++; else failed++;

  if (test('parse handles markdown without frontmatter', () => {
    const md = '# Simple Title\nNo frontmatter here.';
    const result = parse(md);
    assert.strictEqual(result.hasFrontmatter, false);
    assert.deepStrictEqual(result.data, {});
    assert.strictEqual(result.body, md);
  })) passed++; else failed++;

  // Stringify
  if (test('stringify formats object and body into frontmatter document', () => {
    const data = { name: 'my-agent', version: 2, active: true };
    const body = '# My Agent Body';
    const output = stringify(data, body);

    assert.ok(output.startsWith('---\n'));
    assert.ok(output.includes('name: my-agent'));
    assert.ok(output.includes('version: 2'));
    assert.ok(output.includes('active: true'));
    assert.ok(output.includes('---\n'));
    assert.ok(output.includes('# My Agent Body'));
  })) passed++; else failed++;

  // setKey
  if (test('setKey updates single frontmatter key preserving content', () => {
    const md = `---
name: original
count: 1
---
Body content.`;

    const updated = setKey(md, 'name', 'updated');
    const result = parse(updated);
    assert.strictEqual(result.data.name, 'updated');
    assert.strictEqual(result.data.count, 1);
    assert.ok(result.body.includes('Body content.'));
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
