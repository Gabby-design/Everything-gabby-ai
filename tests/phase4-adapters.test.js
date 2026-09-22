/**
 * Test Suite: Phase 4 Cross-Assistant Adapters
 * Verifies that all assistant adapters produce valid ops:
 * - Claude hooks integration with [gabby] tagging
 * - Codex prompt wrapper generation (/prompts:<name>)
 * - Gemini TOML command wrapper generation (/<name>)
 * - Antigravity 00-agent-core and 01-caveman pointers
 * - Copilot instructions and prompt generation
 * - Cursor and Windsurf bridge generation
 * - Zero emojis in all generated op content
 */

const assert = require('assert');
const path = require('path');
const adapters = require('../scripts/lib/adapters');

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
  console.log('\n=== Phase 4: Cross-Assistant Adapters ===\n');

  let passed = 0;
  let failed = 0;

  const mockCtx = {
    root: path.resolve(__dirname, '..'),
    tilde: (p) => p.replace(/\\/g, '/'),
    config: {
      caveman: { mode: 'full' },
      wrappers: { codex: true, gemini: true },
      bridges: { cursor: true, windsurf: true, copilotPrompts: true },
      hooks: { install: true, tmux: false }
    },
    homes: {
      claude: '/mock/home/.claude',
      gemini: '/mock/home/.gemini',
      antigravityConfig: '/mock/home/.gemini/config',
      antigravityCli: '/mock/home/.gemini/antigravity-cli',
      copilot: '/mock/home/.copilot',
      codex: '/mock/home/.codex',
      agents: '/mock/home/.agents'
    },
    registry: {
      skills: [
        { name: 'create-prd', kind: 'skill', dir: '/mock/skills/create-prd', invocable: true, description: 'Create PRD' },
        { name: 'backend-patterns', kind: 'skill', dir: '/mock/skills/backend-patterns', invocable: false, description: 'Backend' }
      ],
      agents: [
        { name: 'architect', kind: 'agent', file: path.join(__dirname, '../agents/architect.md'), description: 'Architect' }
      ],
      rules: [
        { name: 'caveman', kind: 'rule', file: path.join(__dirname, '../rules/caveman.md'), description: 'Caveman' },
        { name: 'security', kind: 'rule', file: path.join(__dirname, '../rules/security.md'), description: 'Security', applyTo: '**' }
      ]
    }
  };

  // 1. Claude Adapter Hooks and Managed Block
  if (test('Claude adapter produces managed block and tagged hooks', () => {
    const claudeAdapter = adapters.ALL.find(a => a.id === 'claude');
    assert.ok(claudeAdapter, 'Claude adapter missing');

    const ops = claudeAdapter.global(mockCtx);
    const managedOp = ops.find(o => o.kind === 'managed' && o.path.endsWith('CLAUDE.md'));
    assert.ok(managedOp, 'Missing managed CLAUDE.md op');
    assert.ok(managedOp.inner.includes('@'));

    const jsonOp = ops.find(o => o.kind === 'json' && o.path.endsWith('settings.json'));
    assert.ok(jsonOp, 'Missing json settings.json hook op');

    const merged = jsonOp.merge({});
    assert.ok(merged.hooks, 'Hooks must be merged into settings.json');
  })) passed++; else failed++;

  // 2. Codex Adapter Prompt Wrappers
  if (test('Codex adapter produces /prompts:<name> wrappers for invocable skills', () => {
    const codexAdapter = adapters.ALL.find(a => a.id === 'codex');
    assert.ok(codexAdapter, 'Codex adapter missing');

    const ops = codexAdapter.global(mockCtx);
    const promptOp = ops.find(o => o.path.includes('create-prd.md'));
    assert.ok(promptOp, 'Missing prompt wrapper for create-prd');
    assert.ok(promptOp.content.includes('Task: $ARGUMENTS'));

    // Non-invocable should not generate prompt
    const nonInvocable = ops.find(o => o.path.includes('backend-patterns.md'));
    assert.strictEqual(nonInvocable, undefined, 'Non-invocable skill should not have prompt wrapper');
  })) passed++; else failed++;

  // 3. Gemini Adapter TOML Commands
  if (test('Gemini adapter produces TOML command files for invocable skills', () => {
    const geminiAdapter = adapters.ALL.find(a => a.id === 'gemini');
    assert.ok(geminiAdapter, 'Gemini adapter missing');

    const ops = geminiAdapter.global(mockCtx);
    const tomlOp = ops.find(o => o.path.endsWith('create-prd.toml'));
    assert.ok(tomlOp, 'Missing TOML command for create-prd');
    assert.ok(tomlOp.content.includes('description = "Create PRD"'));
    assert.ok(tomlOp.content.includes('Task: {{args}}'));
  })) passed++; else failed++;

  // 4. Antigravity Adapter Pointers
  if (test('Antigravity adapter produces 00-agent-core.md and 01-caveman.md workspace rules', () => {
    const antigravityAdapter = adapters.ALL.find(a => a.id === 'antigravity');
    assert.ok(antigravityAdapter, 'Antigravity adapter missing');

    const projectOps = antigravityAdapter.project(mockCtx, '/mock/project');
    const coreOp = projectOps.find(o => o.path.endsWith('00-agent-core.md'));
    const cavemanOp = projectOps.find(o => o.path.endsWith('01-caveman.md'));

    assert.ok(coreOp, 'Missing 00-agent-core.md pointer');
    assert.ok(cavemanOp, 'Missing 01-caveman.md pointer');
    assert.ok(cavemanOp.content.includes('Effective mode for this project'));
  })) passed++; else failed++;

  // 5. Copilot Adapter Vendoring and Prompt Bridges
  if (test('Copilot adapter produces instructions, agent files, and prompt bridges when vendoring', () => {
    const copilotAdapter = adapters.ALL.find(a => a.id === 'copilot');
    assert.ok(copilotAdapter, 'Copilot adapter missing');

    const vendoredOps = copilotAdapter.project(mockCtx, '/mock/project', { vendor: true });
    assert.ok(vendoredOps.some(o => o.path.endsWith('security.instructions.md')), 'Missing instruction file');
    assert.ok(vendoredOps.some(o => o.path.endsWith('architect.agent.md')), 'Missing agent file');
    assert.ok(vendoredOps.some(o => o.path.endsWith('create-prd.prompt.md')), 'Missing Copilot prompt bridge');
  })) passed++; else failed++;

  // 6. Universal AGENTS.md, Cursor, and Windsurf Bridges
  if (test('agents-md adapter generates AGENTS.md, Cursor rules, and Windsurf rules', () => {
    const agentsMdAdapter = adapters.ALL.find(a => a.id === 'agents-md');
    assert.ok(agentsMdAdapter, 'agents-md adapter missing');

    const projectOps = agentsMdAdapter.project(mockCtx, '/mock/project');
    assert.ok(projectOps.some(o => o.path.endsWith('AGENTS.md')), 'Missing AGENTS.md symlink');
    assert.ok(projectOps.some(o => o.path.includes('.cursor')), 'Missing Cursor rule');
    assert.ok(projectOps.some(o => o.path.endsWith('.windsurfrules')), 'Missing Windsurf rules');
  })) passed++; else failed++;

  // 7. Zero Emojis across all generated adapter contents
  if (test('Core Principle 3: Zero emojis in any adapter-generated file content or managed block', () => {
    const allGlobal = adapters.global(mockCtx);
    const allProject = adapters.project(mockCtx, '/mock/project', { vendor: true });

    for (const op of [...allGlobal, ...allProject]) {
      if (op.content) {
        assert.strictEqual(
          EMOJI_REGEX.test(op.content),
          false,
          `Emoji found in op content for ${op.path}`
        );
      }
      if (op.inner) {
        assert.strictEqual(
          EMOJI_REGEX.test(op.inner),
          false,
          `Emoji found in op inner for ${op.path}`
        );
      }
    }
  })) passed++; else failed++;

  console.log(`\nPhase 4 Tests Passed: ${passed}`);
  console.log(`Phase 4 Tests Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
