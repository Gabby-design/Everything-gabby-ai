/**
 * Declarative filesystem operations engine.
 * Supports dry-runs, idempotency, conflict detection, and Windows pointer-file fallbacks.
 */

const fs = require('fs');
const path = require('path');
const managed = require('./managed');

const GENERATED_MARK = 'generated-by: gabby';
const VENDOR_MARK = '.gabby-vendored';
const LEGACY_VENDOR_MARKS = ['.agent-vendored', '.kiwi-vendored'];

function exists(p) {
  try {
    fs.lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function readlink(p) {
  try {
    return fs.readlinkSync(p);
  } catch {
    return null;
  }
}

function readFile(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function isPointerFile(p, target) {
  const content = readFile(p);
  if (!content) return false;
  return content.includes('canonical instruction source') && (target ? content.includes(target) : true);
}

/**
 * Inspect one op (or array of ops) against the filesystem without modifying anything.
 */
function inspect(op) {
  if (Array.isArray(op)) {
    return op.map(o => inspect(o));
  }

  switch (op.kind) {
    case 'mkdir':
      return exists(op.path) ? 'ok' : 'missing';

    case 'symlink': {
      if (!exists(op.path)) return 'missing';

      // Check if it is a native symlink
      if (isSymlink(op.path)) {
        const cur = readlink(op.path);
        const want = op.target;
        const same = cur === want ||
          path.resolve(path.dirname(op.path), cur) === path.resolve(path.dirname(op.path), want);
        if (!same) return 'stale';
        return fs.existsSync(op.path) ? 'ok' : 'broken';
      }

      // Check if it is an accepted Windows pointer file fallback
      if (isPointerFile(op.path, op.target)) {
        return 'ok';
      }

      return 'conflict';
    }

    case 'managed':
      return managed.status(readFile(op.path), op.inner);

    case 'file': {
      const cur = readFile(op.path);
      if (cur === null) return 'missing';
      if (cur === op.content) return 'ok';
      const isGenerated = cur.includes(GENERATED_MARK) ||
        cur.includes('generated-by: agent') ||
        cur.includes('generated-by: kiwi');
      return isGenerated ? 'stale' : 'conflict';
    }

    case 'copy': {
      if (!exists(op.path)) return 'missing';
      const isDir = fs.statSync(op.source).isDirectory();
      const markNames = [VENDOR_MARK, ...LEGACY_VENDOR_MARKS];
      const hasMark = markNames.some(m => exists(isDir ? path.join(op.path, m) : op.path + m));
      if (!hasMark) return 'conflict';
      return sameTree(op.source, op.path) ? 'ok' : 'stale';
    }

    case 'json': {
      const cur = readFile(op.path);
      let parsed = {};
      try {
        parsed = cur ? JSON.parse(cur) : {};
      } catch {
        return 'conflict';
      }
      const next = op.merge(parsed);
      return JSON.stringify(next) === JSON.stringify(parsed)
        ? 'ok'
        : (cur === null ? 'missing' : 'stale');
    }

    default:
      throw new Error(`unknown op kind: ${op.kind}`);
  }
}

function sameTree(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(src)) {
      const subSrc = path.join(src, e);
      const subDst = path.join(dst, e);
      if (!exists(subDst) || !sameTree(subSrc, subDst)) return false;
    }
    return true;
  }
  return readFile(src) === readFile(dst);
}

function copyTree(src, dst, top = true) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const e of fs.readdirSync(src)) {
      copyTree(path.join(src, e), path.join(dst, e), false);
    }
    if (top) {
      fs.writeFileSync(
        path.join(dst, VENDOR_MARK),
        'Vendored copy managed by agent system - do not edit directly.\n'
      );
    }
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    if (top) {
      fs.writeFileSync(
        dst + VENDOR_MARK,
        'Vendored file - do not edit directly.\n'
      );
    }
  }
}

/**
 * Apply one op (or array of ops). Returns { status, detail } or summary object if array.
 */
function apply(op, options = {}) {
  if (Array.isArray(op)) {
    return applyMany(op, options);
  }

  const dryRun = Boolean(options.dryRun);
  const allowPointerFallback = options.allowPointerFallback !== false;
  const state = inspect(op);

  if (state === 'ok') return { status: 'ok' };
  if (state === 'conflict') {
    return { status: 'conflict', detail: `Existing file at ${op.path} is user-managed and has not been modified` };
  }

  const would = state === 'missing' ? 'created' : 'updated';
  if (dryRun) return { status: `would-be-${would}` };

  fs.mkdirSync(path.dirname(op.path), { recursive: true });

  switch (op.kind) {
    case 'mkdir':
      fs.mkdirSync(op.path, { recursive: true });
      break;

    case 'symlink': {
      if (exists(op.path)) fs.unlinkSync(op.path);
      let type;
      if (process.platform === 'win32') {
        try {
          const targetResolved = path.resolve(path.dirname(op.path), op.target);
          type = fs.statSync(targetResolved).isDirectory() ? 'junction' : 'file';
        } catch {
          type = 'file';
        }
      }

      let createdSymlink = false;
      try {
        fs.symlinkSync(op.target, op.path, type);
        createdSymlink = true;
      } catch (err) {
        // Safe Windows fallback when Developer Mode or Admin is not enabled
        if ((err.code === 'EPERM' || err.code === 'EXDEV') && allowPointerFallback) {
          const pointerContent = `# Reference to Canonical Source\nRead \`${op.target}\` before acting — it is the canonical instruction source for this repository.\n`;
          fs.writeFileSync(op.path, pointerContent, 'utf8');
        } else {
          throw err;
        }
      }
      break;
    }

    case 'managed':
      fs.writeFileSync(op.path, managed.apply(readFile(op.path), op.inner));
      break;

    case 'file':
      fs.writeFileSync(op.path, op.content);
      break;

    case 'copy':
      if (exists(op.path)) fs.rmSync(op.path, { recursive: true, force: true });
      copyTree(op.source, op.path);
      break;

    case 'json': {
      const cur = readFile(op.path);
      if (cur !== null && !dryRun) {
        fs.writeFileSync(`${op.path}.bak-${Date.now()}`, cur, 'utf8');
      }
      const next = op.merge(cur ? JSON.parse(cur) : {});
      fs.writeFileSync(op.path, JSON.stringify(next, null, 2) + '\n');
      break;
    }
  }

  return { status: would };
}

function applyMany(ops, options = {}) {
  let appliedCount = 0;
  let skippedCount = 0;
  let conflictCount = 0;
  const results = [];

  for (const o of ops) {
    const res = apply(o, options);
    results.push({ op: o, ...res });
    if (res.status === 'ok') {
      skippedCount++;
    } else if (res.status === 'conflict') {
      conflictCount++;
    } else {
      appliedCount++;
    }
  }

  return {
    appliedCount,
    skippedCount,
    conflictCount,
    results
  };
}

function check(plan) {
  return plan.map(op => ({ op, state: inspect(op) }));
}

function run(plan, options = {}) {
  const results = plan.map(op => ({ op, ...apply(op, options) }));
  const summary = {};
  for (const r of results) {
    summary[r.status] = (summary[r.status] || 0) + 1;
  }
  return { results, summary };
}

function brokenLinksInto(dir, root) {
  if (!exists(dir)) return [];
  const out = [];
  try {
    for (const e of fs.readdirSync(dir)) {
      const p = path.join(dir, e);
      if (isSymlink(p)) {
        const target = path.resolve(path.dirname(p), readlink(p));
        if (target.startsWith(root) && !fs.existsSync(p)) {
          out.push({ path: p, target });
        }
      }
    }
  } catch {
    // Ignore read errors
  }
  return out;
}

module.exports = {
  GENERATED_MARK,
  VENDOR_MARK,
  inspect,
  apply,
  applyMany,
  check,
  run,
  brokenLinksInto,
  sameTree,
  copyTree,
  isPointerFile
};
