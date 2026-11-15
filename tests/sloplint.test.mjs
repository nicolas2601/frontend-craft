// hallmark's sloplint inside the check: the page's own files, universal tells fail, house conventions and kit files warn.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { HARD, SKIP, mapSloplint, pageFiles, runSloplint, sloplintScript } from '../skills/frontend-craft/scripts/lib/sloplint.mjs';

test('universal tells fail, other gates and reflexes warn, house conventions and plain warnings are dropped', () => {
  const json = { findings: [
    { grade: 'FAIL', gate: '63', file: '/p/index.html', line: 9, evidence: 'middle-dot meta string "18 m² · 2 personas"', fix: 'one fact a line' },
    { grade: 'FAIL', gate: '34', file: '/p/page.css', line: 1, evidence: 'no overflow-x: clip', fix: 'clip it' },
    { grade: 'REFLEX', gate: '65', file: '/p/page.css', line: 1, evidence: 'cream, serif, terracotta', fix: 'move one axis' },
    { grade: 'FAIL', gate: '20', file: '/p/page.css', line: 1, evidence: 'no stamp', fix: 'stamp' },
    { grade: 'WARN', gate: '58', file: '/p/index.html', line: 3, evidence: 'hero paragraph runs 21 words', fix: 'shorter' },
    { grade: 'FAIL', gate: '67', file: '/p/craft/layouts.css', line: 4, evidence: 'tracked caps', fix: 'sentence case' },
  ] };
  const out = mapSloplint(json, { kit: '/p/craft' });
  assert.deepEqual(out.map((x) => `${x.level}:${x.id}`), ['FAIL:hallmark/63', 'WARN:hallmark/34', 'WARN:hallmark/65', 'WARN:hallmark/67']);
  assert.match(out[0].msg, /index\.html:9/);
  assert.ok(HARD.has('54') && HARD.has('19') && SKIP.has('20'));
});

test('only the page and its own stylesheets are linted, never the kit folder', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-sloplint-'));
  fs.mkdirSync(path.join(dir, 'craft'));
  fs.writeFileSync(path.join(dir, 'craft', 'craft.css'), 'body{}');
  fs.writeFileSync(path.join(dir, 'page.css'), 'h1{}');
  fs.writeFileSync(path.join(dir, 'index.html'), '<link rel="stylesheet" href="craft/craft.css"><link rel="stylesheet" href="page.css"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X">');
  assert.deepEqual(pageFiles(dir, 'index.html', 'craft').map((f) => path.basename(f)), ['index.html', 'page.css']);
  assert.deepEqual(pageFiles(dir, 'missing.html'), []);
});

test('a real run finds a middle-dot meta string and an eyebrow in a page', { skip: !sloplintScript(), timeout: 120000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-sloplint-'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html lang="en"><head><title>T</title><style>:root{--c:#111}</style></head><body><main><p class="eyebrow">Our rooms</p><h2>Six rooms</h2><p>18 m² · double bed · 2 guests</p></main></body></html>');
  const r = await runSloplint(pageFiles(dir));
  assert.equal(r.ran, true, r.note);
  assert.ok(r.findings.some((x) => x.id === 'hallmark/63' && x.level === 'FAIL'), r.findings.map((x) => x.id).join(', '));
});
