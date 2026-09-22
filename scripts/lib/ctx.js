/**
 * Derived Context Documents Engine
 * Maintains agent-facing, token-optimized copies of human-canonical documents (MEMORY, NOTES, CHANGELOG).
 * Tracks integrity via sha256 checksums in frontmatter.
 *
 * Zero dependencies. Node >= 18.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parse, setKey, stringify } = require('./frontmatter');
const detect = require('./detect');

const CONTEXT_DIR = path.join('docs', 'ai', 'context');
const SOURCES = {
  MEMORY: 'MEMORY.md',
  CHANGELOG: 'CHANGELOG.md',
  NOTES: path.join('docs', 'ai', 'NOTES.md')
};

function sourcePath(dir, name) {
  return path.join(dir, SOURCES[name] || path.join('docs', 'ai', `${name}.md`));
}

function derivedPath(dir, name) {
  return path.join(dir, CONTEXT_DIR, `${name}.md`);
}

function sha(file) {
  try {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  } catch {
    return null;
  }
}

/** Names configured in SYSTEM.md -> context_docs (empty when off or unset). */
function configured(dir) {
  const sys = path.join(dir, detect.SYSTEM);
  if (!fs.existsSync(sys)) return [];
  try {
    const parsed = parse(fs.readFileSync(sys, 'utf8'));
    const v = parsed.data && parsed.data.context_docs;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * Returns status of each context doc:
 * [{ name, source, derived, state: 'current'|'stale'|'missing'|'no-source', sourceSha, recordedSha, placeholder }]
 */
function status(dir, names = configured(dir)) {
  return names.map(name => {
    const source = sourcePath(dir, name);
    const derived = derivedPath(dir, name);

    if (!fs.existsSync(source)) {
      return { name, source, derived, state: 'no-source' };
    }

    const sourceSha = sha(source);
    if (!fs.existsSync(derived)) {
      return { name, source, derived, state: 'missing', sourceSha };
    }

    try {
      const content = fs.readFileSync(derived, 'utf8');
      const data = parse(content).data || {};
      const recordedSha = data.source_sha256 || null;
      const placeholder = /<!-- REGENERATE -->/.test(content);
      const isCurrent = recordedSha === sourceSha && !placeholder;

      return {
        name,
        source,
        derived,
        state: isCurrent ? 'current' : 'stale',
        sourceSha,
        recordedSha,
        placeholder
      };
    } catch {
      return { name, source, derived, state: 'stale', sourceSha };
    }
  });
}

/** Record current source sha and timestamp into the derived file's frontmatter. */
function stamp(dir, names = configured(dir)) {
  const out = [];
  for (const row of status(dir, names)) {
    if (row.state === 'no-source' || row.state === 'missing') {
      out.push({ ...row, stamped: false });
      continue;
    }

    try {
      let text = fs.readFileSync(row.derived, 'utf8');
      if (row.placeholder) {
        out.push({ ...row, stamped: false, reason: 'placeholder body - regenerate first' });
        continue;
      }

      text = setKey(text, 'source_sha256', row.sourceSha);
      text = setKey(text, 'generated_at', new Date().toISOString().slice(0, 10));
      fs.writeFileSync(row.derived, text, 'utf8');
      out.push({ ...row, state: 'current', stamped: true });
    } catch (err) {
      out.push({ ...row, stamped: false, reason: err.message });
    }
  }
  return out;
}

/** Create the derived skeleton for a source (frontmatter + regenerate marker). */
function init(dir, names = configured(dir)) {
  const out = [];
  for (const name of names) {
    const source = sourcePath(dir, name);
    const derived = derivedPath(dir, name);

    if (fs.existsSync(derived)) {
      out.push({ name, derived, created: false });
      continue;
    }

    if (!fs.existsSync(source)) {
      out.push({ name, derived, created: false, reason: `source ${path.relative(dir, source)} missing` });
      continue;
    }

    fs.mkdirSync(path.dirname(derived), { recursive: true });
    const rel = path.relative(path.dirname(derived), source).split(path.sep).join('/');
    const body = [
      '',
      `# ${name} - agent-facing context (derived)`,
      '',
      '<!-- REGENERATE -->',
      `Derived copy of \`${rel}\`. Not generated yet: read the source instead, then regenerate this file and stamp it.`,
      ''
    ].join('\n');

    fs.writeFileSync(
      derived,
      stringify(
        {
          doc: `context/${name}`,
          purpose: `Agent-facing compressed copy of ${rel}; never edited by hand`,
          authority: 'derived',
          source: rel,
          source_sha256: null,
          generated_at: null,
          register: 'terse'
        },
        body
      ),
      'utf8'
    );
    out.push({ name, derived, created: true });
  }
  return out;
}

module.exports = {
  CONTEXT_DIR,
  SOURCES,
  sourcePath,
  derivedPath,
  configured,
  status,
  stamp,
  init,
  sha
};
