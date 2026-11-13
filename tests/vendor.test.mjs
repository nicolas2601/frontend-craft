// Bundled third-party skills stay exactly as their pinned upstream commit shipped them.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { checkAll, hashSkill, readManifest } from '../scripts/vendor.mjs';

test('every bundled skill matches its recorded hash and pinned ref', () => {
  const manifest = readManifest();
  assert.ok(manifest.skills.length > 0);
  for (const s of manifest.skills) assert.match(manifest.repos[s.repo].ref, /^[0-9a-f]{40}$/, s.name);
  assert.deepEqual(checkAll(manifest), []);
});

test('the hash changes when a file changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-hash-'));
  fs.writeFileSync(path.join(dir, 'SKILL.md'), 'a');
  const before = hashSkill(dir);
  fs.writeFileSync(path.join(dir, 'SKILL.md'), 'b');
  assert.notEqual(hashSkill(dir).hash, before.hash);
  fs.rmSync(dir, { recursive: true, force: true });
});
