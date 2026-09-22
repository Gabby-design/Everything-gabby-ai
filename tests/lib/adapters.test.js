/**
 * Tests for scripts/lib/adapters
 *
 * Run with: node tests/lib/adapters.test.js
 */

const assert = require('assert');
const path = require('path');
const adapters = require('../../scripts/lib/adapters');
const ops = require('../../scripts/lib/ops');

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
  console.log('\n=== Testing Cross-Assistant Adapters ===\n');

  let passed = 0;
  let failed = 0;

  const mockCtx = {
    root: '/test/global/agents',
    tilde: (p) => p.replace('/test/global', '~'),
    config: { agents: {} },
    homes: {
      claude: '/test/home/.claude',
      gemini: '/test/home/.gemini',
      antigravityConfig: '/test/home/.gemini/config',
      copilot: '/test/home/.copilot',
      codex: '/test/home/.codex',
      agents: '/test/home/.agents'
    },
    registry: {
      skills: [
        { name: 'test-skill', kind: 'skill', dir: '/test/skills/test-skill', invocable: true, description: 'Test' }
      ],
      agents: [
        { name: 'planner', kind: 'agent', file: '/test/agents/planner.md', description: 'Planner' }
      ],
      rules: [
        { name: 'git-workflow', kind: 'rule', file: '/test/rules/git-workflow.md', description: 'Git' }
      ]
    }
  };

  if (test('ALL contains all expected assistant adapters', () => {
    assert.strictEqual(adapters.ALL.length, 6);
    const ids = adapters.ALL.map(a => a.id).sort();
    assert.deepStrictEqual(ids, ['agents-md', 'antigravity', 'claude', 'codex', 'copilot', 'gemini'].sort());
  })) passed++; else failed++;

  if (test('enabled filters by config while preserving agents-md', () => {
    const defaultEnabled = adapters.enabled({});
    assert.strictEqual(defaultEnabled.length, 6);

    const filtered = adapters.enabled({ agents: { claude: false, copilot: false } });
    assert.strictEqual(filtered.length, 4);
    assert.ok(!filtered.find(a => a.id === 'claude'));
    assert.ok(!filtered.find(a => a.id === 'copilot'));
    assert.ok(filtered.find(a => a.id === 'agents-md'));

    // agents-md cannot be disabled
    const forced = adapters.enabled({ agents: { 'agents-md': false } });
    assert.ok(forced.find(a => a.id === 'agents-md'));
  })) passed++; else failed++;

  if (test('project generates ops for all entry points and pointers', () => {
    const projectOps = adapters.project(mockCtx, '/mock/project');
    assert.ok(projectOps.length >= 5);

    const paths = projectOps.map(op => path.normalize(op.path));
    assert.ok(paths.some(p => p.endsWith(path.normalize('CLAUDE.md'))));
    assert.ok(paths.some(p => p.endsWith(path.normalize('GEMINI.md'))));
    assert.ok(paths.some(p => p.endsWith(path.normalize('AGENTS.md'))));
    assert.ok(paths.some(p => p.endsWith(path.normalize('.github/copilot-instructions.md'))));
    assert.ok(paths.some(p => p.endsWith(path.normalize('.agents/rules/00-agent-core.md'))));
  })) passed++; else failed++;

  if (test('global generates valid ops across assistant homes', () => {
    const globalOps = adapters.global(mockCtx);
    assert.ok(globalOps.length > 0);

    const claudeManaged = globalOps.find(op => op.path.includes('.claude') && op.kind === 'managed');
    assert.ok(claudeManaged, 'Must generate managed block for global CLAUDE.md');
    assert.ok(claudeManaged.inner.includes('GLOBAL.md'));

    const geminiManaged = globalOps.find(op => op.path.includes('.gemini') && op.kind === 'managed');
    assert.ok(geminiManaged, 'Must generate managed block for global GEMINI.md');
    assert.ok(geminiManaged.inner.includes('GLOBAL.md'));
  })) passed++; else failed++;

  if (test('deduplication prevents duplicate ops for same target path and kind', () => {
    const projectOps = adapters.project(mockCtx, '/mock/project');
    const seen = new Set();
    for (const op of projectOps) {
      const key = `${op.kind}:${op.path}`;
      assert.strictEqual(seen.has(key), false, `Duplicate op detected: ${key}`);
      seen.add(key);
    }
  })) passed++; else failed++;

  if (test('all adapter code and generated text contain zero emojis', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

    const projectOps = adapters.project(mockCtx, '/mock/project');
    for (const op of projectOps) {
      if (op.content) {
        assert.strictEqual(emojiRegex.test(op.content), false, `Content in ${op.path} has emoji`);
      }
    }

    const globalOps = adapters.global(mockCtx);
    for (const op of globalOps) {
      if (op.inner) {
        assert.strictEqual(emojiRegex.test(op.inner), false, `Inner in ${op.path} has emoji`);
      }
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
