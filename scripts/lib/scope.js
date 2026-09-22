/**
 * Write Scope Boundary Enforcement (RULE-SCOPE-001)
 * An agent or CLI tool writes only inside the repository it was opened in.
 * From a project repository, the global directory (~/.agents) is strictly read-only.
 *
 * Zero dependencies. Node >= 18.
 */

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

function real(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

/** True when dir (default cwd) is the global directory or inside it. */
function inGlobal(dir = process.cwd()) {
  const root = real(paths.globalRoot());
  const d = real(dir);
  return d === root || d.startsWith(root + path.sep);
}

/** True when file resolves (through symlinks or pointers) to inside the global directory. */
function resolvesToGlobal(file) {
  const root = real(paths.globalRoot());
  const f = real(file);
  return f === root || f.startsWith(root + path.sep);
}

/** Canonical refusal message when a project-level command attempts to modify global assets. */
function refusal(what) {
  return `${what} would write into the global directory (${paths.tilde(paths.globalRoot())}) from a project. ` +
    'Write scope is restricted to the current project directory (RULE-SCOPE-001): make project-scoped changes here, ' +
    `and make global changes only from the global directory itself (cd ${paths.tilde(paths.globalRoot())}).`;
}

module.exports = {
  inGlobal,
  resolvesToGlobal,
  refusal,
  real
};
