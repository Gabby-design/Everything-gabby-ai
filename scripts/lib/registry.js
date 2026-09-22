/**
 * Scans root directory for skills, agents, rules, and workflows.
 * Extracts frontmatter metadata and provides validation helpers.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('./frontmatter');

function isHidden(name) {
  return name.startsWith('.') || name.startsWith('_');
}

function readMarkdown(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const { data, body } = parse(text);
    return { data, body, text };
  } catch {
    return { data: {}, body: '', text: '' };
  }
}

function extractHeadingTitle(body, fallback) {
  const match = (body || '').match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

/**
 * Discover skills in skills/<name>/SKILL.md
 */
function skills(root) {
  const dir = path.join(root, 'skills');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !isHidden(e.name) && fs.existsSync(path.join(dir, e.name, 'SKILL.md')))
    .map(e => {
      const file = path.join(dir, e.name, 'SKILL.md');
      const { data, body } = readMarkdown(file);
      const desc = data.description || extractHeadingTitle(body, 'Skill definition');

      return {
        kind: 'skill',
        name: data.name || e.name,
        dirName: e.name,
        dir: path.join(dir, e.name),
        file,
        description: desc,
        invocable: data.invocable === true,
        data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Discover personas in agents/<name>.md
 */
function agents(root) {
  const dir = path.join(root, 'agents');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !isHidden(f))
    .map(f => {
      const file = path.join(dir, f);
      const { data, body } = readMarkdown(file);
      const name = data.name || f.replace(/\.md$/, '');
      const desc = data.description || extractHeadingTitle(body, 'Specialist agent persona');

      return {
        kind: 'agent',
        name,
        fileName: f,
        file,
        description: desc,
        tools: data.tools || '',
        model: data.model || '',
        data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Discover rules in rules/<name>.md
 */
function rules(root) {
  const dir = path.join(root, 'rules');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !isHidden(f))
    .map(f => {
      const file = path.join(dir, f);
      const { data, body } = readMarkdown(file);
      const name = data.name || f.replace(/\.md$/, '');
      const desc = data.description || extractHeadingTitle(body, 'Engineering rule');

      return {
        kind: 'rule',
        name,
        fileName: f,
        file,
        description: desc,
        applyTo: data.applyTo || '**',
        data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Discover workflows in workflows/<name>.md
 */
function workflows(root) {
  const dir = path.join(root, 'workflows');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !isHidden(f))
    .map(f => {
      const file = path.join(dir, f);
      const { data, body } = readMarkdown(file);
      const name = data.name || f.replace(/\.md$/, '');
      const desc = data.description || extractHeadingTitle(body, 'Lifecycle workflow');

      return {
        kind: 'workflow',
        name,
        fileName: f,
        file,
        description: desc,
        data
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function all(root) {
  return {
    skills: skills(root),
    agents: agents(root),
    rules: rules(root),
    workflows: workflows(root)
  };
}

/**
 * Validate frontmatter contracts
 */
function validate(root) {
  const problems = [];
  const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  for (const s of skills(root)) {
    if (!s.data.name) {
      problems.push({ file: s.file, problem: 'missing name in frontmatter' });
    } else if (s.data.name !== s.dirName) {
      problems.push({ file: s.file, problem: `name "${s.data.name}" does not match folder "${s.dirName}"` });
    } else if (!kebab.test(s.data.name)) {
      problems.push({ file: s.file, problem: 'name must be kebab-case' });
    }
  }

  return problems;
}

module.exports = {
  skills,
  agents,
  rules,
  workflows,
  all,
  validate
};
