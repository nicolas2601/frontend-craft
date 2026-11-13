// End to end: the real checker in headless Chrome against two fixture pages.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runCheck } from '../skills/frontend-craft/scripts/check.mjs';
import { findChrome } from '../skills/frontend-craft/scripts/lib/chrome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let chrome = true;
try { findChrome(); } catch { chrome = false; }
const out = () => fs.mkdtempSync(path.join(os.tmpdir(), 'craft-test-'));

test('a page built with the kit passes, with entrance and scroll story detected', { skip: !chrome, timeout: 120000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/good/index.html' }, kind: 'landing', out: out() });
  const fails = r.findings.filter((x) => x.level === 'FAIL');
  assert.deepEqual(fails, []);
  assert.ok(r.motion.entrance >= 3, `entrance ${r.motion.entrance}`);
  assert.ok(r.motion.scrollLinked >= 1 || r.motion.sticky.length >= 1);
  assert.ok(r.shots.every((s) => fs.existsSync(s)));
});

test('the generated-default page fails on the defects it has', { skip: !chrome, timeout: 120000 }, async () => {
  const r = await runCheck({ target: { root: path.join(ROOT, 'tests/fixtures/slop'), page: 'index.html' }, kind: 'landing', out: out() });
  const ids = new Set(r.findings.filter((x) => x.level === 'FAIL').map((x) => x.id));
  for (const id of ['tell-default-editorial', 'tell-italic-accent', 'overflow', 'contrast', 'img-alt', 'img-broken', 'transition-all',
    'motion-entrance', 'motion-scroll-story', 'copy-placeholder', 'copy-emoji', 'meta-lang', 'meta-viewport']) {
    assert.ok(ids.has(id), `missing ${id}; got ${[...ids].join(', ')}`);
  }
});
