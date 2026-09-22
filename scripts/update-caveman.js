#!/usr/bin/env node
/**
 * Mirror MIT-licensed caveman skill files from a pinned upstream release into this system.
 *
 *   node scripts/update-caveman.js            # sync at the pinned tag (skills/caveman/UPSTREAM.json)
 *   node scripts/update-caveman.js v2.8.0     # move the pin and sync
 *   node scripts/update-caveman.js --check    # report whether a newer tag exists; write nothing
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PIN_FILE = path.join(ROOT, 'skills', 'caveman', 'UPSTREAM.json');
const REPO = 'JuliusBrussee/caveman';
const FILES = {
  'skills/caveman/SKILL.md': 'skills/caveman/SKILL.md',
  'skills/caveman-commit/SKILL.md': 'skills/caveman-commit/SKILL.md',
  'skills/caveman-review/SKILL.md': 'skills/caveman-review/SKILL.md',
  'src/rules/caveman-activate.md': 'skills/caveman/UPSTREAM-activate.md'
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'everything-gabby-ai' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`${res.statusCode} ${url}`));
      let d = ''; res.setEncoding('utf8');
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function readPin() {
  try { return JSON.parse(fs.readFileSync(PIN_FILE, 'utf8')); }
  catch { return { tag: 'v2.8.0', files: {} }; }
}

function latestTag() {
  try {
    const out = execSync(`git ls-remote --tags --refs https://github.com/${REPO}.git`, {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15000
    });
    const tags = out.split('\n')
      .map(l => l.split('refs/tags/')[1])
      .filter(t => /^v\d+\.\d+\.\d+$/.test(t || ''));
    tags.sort((a, b) => cmp(a, b));
    return tags[tags.length - 1] || null;
  } catch { return null; }
}

function cmp(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

function adapt(localPath, text, tag) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  const fm = m ? m[1] : '';
  const body = m ? text.slice(m[0].length) : text;
  const name = path.basename(path.dirname(localPath));
  const prov = `<!-- Mirrored from https://github.com/${REPO} (${tag}) - MIT · scripts/update-caveman.js -->\n`;
  let extra = '';
  if (name === 'caveman-commit') {
    extra = '\n\n## In this system\n\nDraft the message only. The owner commits (RULE-GIT-001 in GLOBAL.md); never run `git commit` yourself.\n';
  }
  if (name === 'caveman') {
    extra = '\n\n## In this system\n\nDefault level comes from `.caveman.json` or global config. Never applies to `docs/ai/**`, `MEMORY.md`, `CHANGELOG.md`, or files humans read; derived context docs under `docs/ai/context/` use ultra register by design.\n';
  }
  const fmOut = fm.includes('invocable:') ? fm : fm + '\ninvocable: true';
  return `---\n${fmOut}\n---\n${prov}${body.replace(/\s+$/, '')}${extra}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const pin = readPin();
  const tag = args.find(a => /^v\d/.test(a)) || pin.tag;
  if (check) {
    const latest = latestTag();
    if (!latest) { console.log(`caveman pin ${pin.tag}; could not query upstream tags`); return 0; }
    if (cmp(latest, pin.tag) > 0) {
      console.log(`caveman pin ${pin.tag} is behind upstream ${latest} - run: node scripts/update-caveman.js ${latest}`);
      return 1;
    }
    console.log(`caveman pin ${pin.tag} is current (upstream ${latest})`);
    return 0;
  }
  const files = {};
  for (const [remote, local] of Object.entries(FILES)) {
    const url = `https://raw.githubusercontent.com/${REPO}/${tag}/${remote}`;
    const text = await fetch(url);
    const out = local.endsWith('SKILL.md') ? adapt(local, text, tag) : text;
    const abs = path.join(ROOT, local);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, out);
    files[local] = { upstream: remote, sha256: crypto.createHash('sha256').update(text).digest('hex') };
    console.log(`updated ${local}`);
  }
  fs.writeFileSync(PIN_FILE, JSON.stringify({ repo: REPO, tag, synced_at: new Date().toISOString().slice(0, 10), license: 'MIT', files }, null, 2) + '\n');
  console.log(`pinned ${tag} -> ${path.relative(ROOT, PIN_FILE)}`);
  return 0;
}

main().then(c => process.exit(c)).catch(e => { console.error('update-caveman:', e.message); process.exit(1); });
