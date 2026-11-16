// Library parts (components.mjs + lib/parts.mjs) and the MotionSites reference designs (lib/motionsites.mjs):
// matching, the 21st.dev JSON, key scrubbing, the search log and the check rule, with every network call faked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { pick, search } from '../skills/frontend-craft/scripts/components.mjs';
import { closestExamples, parseIndex } from '../skills/frontend-craft/scripts/lib/motionsites.mjs';
import { MIN_JOBS, addPick, addSearch, emptyLog, matchCult, matchReactBits, parse21st, parseRef, partsRules, score, scrubKey } from '../skills/frontend-craft/scripts/lib/parts.mjs';
import { readJson } from '../skills/frontend-craft/scripts/lib/state.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CATALOGUE = readJson(path.join(ROOT, 'skills/frontend-craft/library/components.json'));
const CULT = { items: [
  { name: 'popover-form', description: 'Form popover component with success states and animated transitions' },
  { name: 'gradient-heading', description: 'Heading with a gradient booking form' },
  { name: 'expandable', description: 'A card that expands into its detail, for room details' },
  { name: 'expandable-demo', description: 'demo of the expandable room detail card' },
] };
const HITS = [
  { type: 'component', id: 25156, name: 'Booking Calendar', description: 'A hotel-style date picker with check-in and check-out', url: 'https://21st.dev/@a/components/b', previewUrl: 'https://cdn.21st.dev/p.webp', installCommand: 'npx shadcn@latest add "https://21st.dev/r/a/b?api_key=$API_KEY_21ST"' },
  { type: 'component', id: 36626, name: 'Glow Booking Beam', description: 'A booking calendar lit by a sweeping glow', url: 'https://21st.dev/x' },
  { type: 'template', id: 1, name: 'Hotel template', description: 'paid' },
];

test('matching needs a third of the job words; decoration is marked and listed last', () => {
  assert.ok(score('photo gallery with a lightbox', 'Masonry gallery that opens images in a lightbox') >= 0.6);
  assert.equal(score('booking form', 'Number component with formatting'), 0, 'a prefix inside another word is not a match');
  const rb = matchReactBits(CATALOGUE, 'photo gallery of the rooms with a lightbox');
  assert.ok(rb.some((c) => c.id === 'Masonry'), rb.map((c) => c.id).join(','));
  const cult = matchCult(CULT, 'expandable room detail card');
  assert.deepEqual(cult.map((c) => c.id), ['expandable'], 'demos and refused decoration are left out');
  const hits = parse21st(HITS);
  assert.deepEqual(hits.map((h) => [h.id, h.decoration]), [['25156', false], ['36626', true]], 'templates dropped, glow last');
});

test('keys never reach a file: a literal api_key value becomes the environment variable', () => {
  assert.equal(scrubKey('add "https://21st.dev/r/a/b?api_key=an_sk_123abc"'), 'add "https://21st.dev/r/a/b?api_key=$API_KEY_21ST"');
  assert.equal(scrubKey('api_key=$API_KEY_21ST'), 'api_key=$API_KEY_21ST');
  assert.match(scrubKey('{"API_KEY_21ST": "an_sk_secret"}'), /<redacted>/);
  assert.deepEqual(parseRef('21st:25156'), { source: '21st', id: '25156' });
  assert.equal(parseRef('npm:left-pad'), null);
});

test('the check fails a dealt page that searched fewer than three parts, warns when it took none', () => {
  assert.deepEqual(partsRules({ kind: 'landing', parts: null }), [], 'no log passed: not a dealt build');
  assert.deepEqual(partsRules({ kind: 'docs', parts: emptyLog() }), []);
  assert.equal(partsRules({ kind: 'landing', parts: emptyLog() })[0].id, 'parts-unsearched');
  let log = emptyLog();
  for (const job of ['nav', 'gallery', 'Gallery ']) log = addSearch(log, { job, at: 'now' });
  assert.equal(partsRules({ kind: 'app', parts: log })[0].id, 'parts-unsearched', 'the same job twice counts once');
  log = addSearch(log, { job: 'faq', at: 'now' });
  assert.equal(MIN_JOBS, 3);
  assert.deepEqual(partsRules({ kind: 'site', parts: log }).map((x) => [x.level, x.id]), [['WARN', 'parts-none-taken']]);
  log = addPick(log, { section: 'rooms', ref: 'react-bits:Masonry', name: 'Masonry', why: 'rooms grid', at: 'now' });
  assert.deepEqual(partsRules({ kind: 'site', parts: log }), []);
});

test('search asks the three libraries; pick saves the source and logs it without printing a key', async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-parts-'));
  const calls = [];
  const deps = {
    catalogue: CATALOGUE, cacheDir: path.join(cwd, 'cache'), now: () => new Date('2026-11-16T00:00:00Z'),
    fetchJson: async (url) => { calls.push(url); return url.endsWith('registry.json') ? CULT : { files: [{ path: 'ui/x.tsx', content: 'export {}' }], dependencies: ['motion'] }; },
    run21st: async (args) => {
      calls.push(`21st ${args[0]}`);
      if (args[0] === 'search') return { ok: true, stdout: JSON.stringify(HITS) };
      if (args[0] === 'usage') return { ok: true, stdout: JSON.stringify({ freeRetrievalsRemaining: 1 }) };
      return { ok: true, stdout: JSON.stringify({ code: 'fetch("https://21st.dev/r/x?api_key=an_sk_leak")' }) };
    },
  };
  const out = await search('booking calendar with check-in and check-out', { deps });
  assert.equal(out.results['21st'][0].id, '25156');
  assert.ok(calls.includes('https://www.cult-ui.com/r/registry.json'));
  await search('booking calendar', { deps });
  assert.equal(calls.filter((c) => c.endsWith('registry.json')).length, 1, 'the registry index is cached');

  const got = await pick('21st:25156', { section: 'visit', why: 'dates for the stay', cwd, deps });
  const saved = fs.readFileSync(got.file, 'utf8');
  assert.ok(!saved.includes('an_sk_leak') && saved.includes('$API_KEY_21ST'), 'the saved source has no key');
  assert.ok(calls.includes('21st usage') && calls.includes('21st get'), 'usage is read before a retrieval');
  const log = readJson(path.join(cwd, '.craft', 'components.json'));
  assert.deepEqual(log.picks.map((p) => [p.section, p.ref]), [['visit', '21st:25156']]);
  await assert.rejects(pick('21st:../../etc', { section: 'x', why: 'y', cwd, deps }), /not a part reference/);
  await assert.rejects(pick('cult-ui:popover-form', { cwd, deps }), /--section/);

  deps.run21st = async (args) => ({ ok: true, stdout: JSON.stringify(args[0] === 'usage' ? { freeRetrievalsRemaining: 0 } : {}) });
  const none = await pick('21st:999', { section: 'faq', why: 'questions', cwd, deps });
  assert.equal(none.file, null);
  assert.match(none.note, /no 21st.dev retrievals left/);
});

test('MotionSites: the closest designs come from the index; an unrelated subject gets none', () => {
  const md = ['| File | Title | Category | Traits | Length | Opens with |', '|---|---|---|---|---|---|',
    '| securify-hero.md | Securify Data Security | SaaS | video, react | 3k | Build a full-screen hero for a data-security SaaS landing page |',
    '| stillmind.md | Stillmind | Hero | video, react | 6k | Create a fullscreen cinematic hero for a mindfulness/focus app |',
    '| mostar-guide.md | Mostar Guide | Travel | images | 27k | Recreate Mostar city cinematic scroll page |'].join('\n');
  const rows = parseIndex(md);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0].traits, ['video', 'react']);
  assert.equal(closestExamples(rows, { kind: 'landing', moods: ['tech', 'precise'] })[0].file, 'securify-hero.md');
  assert.equal(closestExamples(rows, { kind: 'landing', moods: ['travel', 'heritage'] })[0].file, 'mostar-guide.md');
  assert.deepEqual(closestExamples(rows, { kind: 'landing', moods: ['coffee'] }), []);
});

test('a dealt component counts only when the project source uses it, not node_modules or the concept', async () => {
  const { findInSource, loadParts } = await import('../skills/frontend-craft/scripts/lib/source-scan.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-src-'));
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put('.craft/concept.md', '# Components\nMasonry in the rooms section');
  put('node_modules/x/Masonry.js', 'export const Masonry = 1');
  put('craft/blueprint.html', '<!-- Masonry -->');
  const deal = { kitDir: 'craft', motion: { component: { id: 'Masonry' } } };
  assert.equal(findInSource(root, 'Masonry', { kitDir: 'craft' }), null);
  const before = loadParts(root, deal, readJson);
  assert.deepEqual(partsRules({ kind: 'landing', parts: before }).map((x) => x.id), ['deal-component-unused', 'parts-unsearched']);
  put('src/components/Rooms.tsx', "import Masonry from './Masonry/Masonry'");
  assert.equal(loadParts(root, deal, readJson).componentIn, path.join('src', 'components', 'Rooms.tsx'));
  assert.equal(loadParts(root, null, readJson), null, 'no deal: no parts rules');
});
