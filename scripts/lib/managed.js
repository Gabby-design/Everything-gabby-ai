/**
 * Managed block utilities for configuration files.
 * Provides idempotent insertion, updates, and validation of agent-managed blocks.
 */

const START = '<!-- agent:start (managed by ~/.agents - do not edit inside this block) -->';
const END = '<!-- agent:end -->';

function render(inner) {
  return `${START}\n${inner.trim()}\n${END}`;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Return file content with the managed block applied or updated.
 */
function apply(text, inner) {
  const block = render(inner);
  const re = new RegExp(`${escapeRegex(START)}[\\s\\S]*?${escapeRegex(END)}`);

  if (text && re.test(text)) {
    return text.replace(re, block);
  }
  if (!text || !text.trim()) {
    return block + '\n';
  }
  return block + '\n\n' + text.replace(/^\n+/, '');
}

/**
 * Inspect managed block status in file content: 'ok' | 'stale' | 'missing'
 */
function status(text, inner) {
  if (!text) return 'missing';
  const re = new RegExp(`${escapeRegex(START)}[\\s\\S]*?${escapeRegex(END)}`);
  const m = text.match(re);
  if (!m) return 'missing';
  return m[0] === render(inner) ? 'ok' : 'stale';
}

module.exports = {
  START,
  END,
  render,
  apply,
  status
};
