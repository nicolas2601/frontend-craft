// End to end: the real checker in headless Chrome against two fixture pages.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runCheck } from '../skills/frontend-craft/scripts/check.mjs';
import { findChrome } from '../skills/frontend-craft/scripts/lib/chrome.mjs';
import { loadLibrary } from '../skills/frontend-craft/scripts/lib/deal.mjs';

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

test('a persuasion page built without a deal fails no-direction', { skip: !chrome, timeout: 120000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/good/index.html' }, kind: 'landing', out: out(), quick: true, requireDeal: true });
  assert.deepEqual(r.findings.filter((x) => x.level === 'FAIL').map((x) => x.id), ['no-direction']);
});

const directionDeal = (id, setPieces) => {
  const direction = loadLibrary().directions.find((d) => d.id === id);
  return { version: 2, kind: 'landing', direction, wildcard: false, palette: null, type: null, motion: { setPieces } };
};
const CONCEPT = '# Idea\nA late bar that roasts on Thursdays: the page runs from the plateau where the beans grow to the bar at night.\n# Signature\nThe zoom opens the bar photograph; the fan spreads the four lots of the month.\n# Rejected\nCream and terracotta, three feature cards, a centred hero over a cup.\n';

test('every set piece renders, moves and passes the richness floor of its direction', { skip: !chrome, timeout: 180000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/expressive/index.html' }, kind: 'landing', deal: directionDeal('night-poster', ['zoom', 'fan']), concept: CONCEPT, out: out() });
  assert.deepEqual(r.findings.filter((x) => x.level === 'FAIL'), []);
  assert.ok(r.motion.scenes >= 6, `scroll scenes in ${r.motion.scenes} sections`);
  for (const id of ['iris', 'type-pass', 'zoom', 'curtain', 'fan', 'letters', 'develop', 'tilt', 'split']) assert.ok(r.richness.setPieces.includes(id), id);
  assert.ok(r.richness.pictures >= 8, `${r.richness.pictures} photographs`);
  assert.equal(r.richness.fullBleed, true);
});

test('a flat page fails the richness floor of a dealt direction', { skip: !chrome, timeout: 120000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/good/index.html' }, kind: 'landing', deal: directionDeal('cinematic-chapters', ['curtain', 'zoom']), out: out(), quick: true });
  const ids = new Set(r.findings.filter((x) => x.level === 'FAIL').map((x) => x.id));
  for (const id of ['rich-pictures', 'rich-full-bleed', 'deal-set-piece', 'concept-missing']) assert.ok(ids.has(id), `missing ${id}; got ${[...ids].join(', ')}`);
});
