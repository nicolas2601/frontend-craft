#!/usr/bin/env node
// Bundle third-party skills from vendor.json into skills/, unchanged, at their pinned upstream commits.
//   node scripts/vendor.mjs            restore every bundled skill at its pinned ref, record hashes
//   node scripts/vendor.mjs --update   move every repo to its upstream HEAD first
//   node scripts/vendor.mjs --check    fail when a bundled skill differs from its recorded hash
//   node scripts/vendor.mjs --notices  rewrite THIRD_PARTY_NOTICES.md from vendor.json
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'vendor.json');
const SKILLS = path.join(ROOT, 'skills');
const CACHE = path.join(os.homedir(), '.cache', 'frontend-craft', 'vendor');
const SKIP = new Set(['node_modules', '.DS_Store', '__pycache__']);
const LICENSE_FILES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'NOTICE', 'NOTICE.md'];

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 30 });

export function readManifest(file = MANIFEST) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => !SKIP.has(e.name))
    .flatMap((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join('/')];
    })
    .sort();
}

/** sha256 over every file's path and bytes (symlinks hash their target text). */
export function hashSkill(dir) {
  const h = crypto.createHash('sha256');
  const files = listFiles(dir);
  for (const rel of files) {
    const full = path.join(dir, rel);
    const st = fs.lstatSync(full);
    h.update(`${rel}\0`);
    h.update(st.isSymbolicLink() ? `link:${fs.readlinkSync(full)}` : fs.readFileSync(full));
    h.update('\0');
  }
  return { hash: h.digest('hex'), files: files.length };
}

const fetched = new Set();

function repoCache(repo, ref) {
  const dir = path.join(CACHE, repo.replace('/', '__'));
  if (fetched.has(`${repo}@${ref}`)) return dir;
  if (!fs.existsSync(path.join(dir, '.git'))) {
    fs.mkdirSync(dir, { recursive: true });
    git(dir, 'init', '-q');
    git(dir, 'remote', 'add', 'origin', `https://github.com/${repo}.git`);
  }
  try { git(dir, 'cat-file', '-e', `${ref}^{commit}`); } catch { git(dir, 'fetch', '-q', '--depth', '1', 'origin', ref); }
  fetched.add(`${repo}@${ref}`);
  return dir;
}

function extract(cache, ref, srcPath, dest) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-vendor-'));
  try {
    const tar = execFileSync('git', ['archive', '--format=tar', ref, srcPath], { cwd: cache, maxBuffer: 1 << 30 });
    execFileSync('tar', ['-x', '-C', tmp], { input: tar });
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(path.join(tmp, srcPath), dest, { recursive: true, verbatimSymlinks: true });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function addLicenses(cache, ref, dest) {
  for (const name of LICENSE_FILES) {
    if (fs.existsSync(path.join(dest, name))) continue;
    try { fs.writeFileSync(path.join(dest, name), git(cache, 'show', `${ref}:${name}`)); } catch { /* not in the repo root */ }
  }
}

function headOf(repo) {
  return git(ROOT, 'ls-remote', `https://github.com/${repo}.git`, 'HEAD').split('\t')[0].trim();
}

function vendorAll(manifest, update) {
  if (update) for (const [repo, info] of Object.entries(manifest.repos)) info.ref = headOf(repo);
  for (const skill of manifest.skills) {
    const { ref } = manifest.repos[skill.repo];
    const cache = repoCache(skill.repo, ref);
    const dest = path.join(SKILLS, skill.name);
    extract(cache, ref, skill.path, dest);
    addLicenses(cache, ref, dest);
    Object.assign(skill, hashSkill(dest));
    console.log(`${skill.name.padEnd(30)} ${String(skill.files).padStart(5)} files  ${skill.repo}@${ref.slice(0, 10)}`);
  }
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(ROOT, 'THIRD_PARTY_NOTICES.md'), notices(manifest));
}

/** The notices file, generated from vendor.json so it never drifts from what is bundled. */
export function notices(manifest) {
  const rows = Object.entries(manifest.repos).map(([repo, info]) => {
    const names = manifest.skills.filter((s) => s.repo === repo).map((s) => `\`${s.name}\``).join(', ');
    return `| [${repo}](https://github.com/${repo}) | ${info.license} | \`${info.ref.slice(0, 12)}\` | ${names} |`;
  });
  return [
    '# Third-party notices',
    '',
    'These skills are bundled unchanged from their upstream repositories at the commit shown. Each skill folder',
    'carries the upstream licence file (and NOTICE where the upstream has one). Generated by `scripts/vendor.mjs`.',
    '',
    '| Upstream | Licence | Commit | Skills |',
    '|---|---|---|---|',
    ...rows,
    '',
    '`svg-craft` (own) vendors MIT packs whose notices are in `skills/svg-craft/packs/*/LICENSE-*`.',
    '',
  ].join('\n');
}

export function checkAll(manifest = readManifest()) {
  return manifest.skills.flatMap((skill) => {
    const dest = path.join(SKILLS, skill.name);
    if (!fs.existsSync(path.join(dest, 'SKILL.md'))) return [`${skill.name}: missing (run node scripts/vendor.mjs)`];
    const now = hashSkill(dest);
    return now.hash === skill.hash ? [] : [`${skill.name}: differs from ${skill.repo}@${manifest.repos[skill.repo].ref.slice(0, 10)} (bundled skills are never edited here)`];
  });
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  const manifest = readManifest();
  if (args.has('--notices')) {
    fs.writeFileSync(path.join(ROOT, 'THIRD_PARTY_NOTICES.md'), notices(manifest));
    process.exit(0);
  }
  if (args.has('--check')) {
    const problems = checkAll(manifest);
    console.log(problems.length ? problems.join('\n') : `vendor: ${manifest.skills.length} bundled skills match their pinned upstream`);
    process.exit(problems.length ? 1 : 0);
  }
  vendorAll(manifest, args.has('--update'));
}
