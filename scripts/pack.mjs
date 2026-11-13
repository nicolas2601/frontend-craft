#!/usr/bin/env node
// Zip each skill in skills/ into dist/<name>.skill (a plain zip with the skill folder at its root).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SKILLS = fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const EXCLUDE = ['*/node_modules/*', '*/__pycache__/*', '*.pyc', '*/.DS_Store'];

fs.mkdirSync(DIST, { recursive: true });
for (const name of SKILLS) {
  const out = path.join(DIST, `${name}.skill`);
  fs.rmSync(out, { force: true });
  execFileSync('zip', ['-qr', out, name, '-x', ...EXCLUDE], { cwd: path.join(ROOT, 'skills') });
  console.log(`${path.relative(ROOT, out)}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}
