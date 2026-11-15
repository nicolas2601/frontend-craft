// End to end: the real checker in headless Chrome against two fixture pages.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runCheck } from '../skills/frontend-craft/scripts/check.mjs';
import { findChrome, launch } from '../skills/frontend-craft/scripts/lib/chrome.mjs';
import { open, settle, sleep } from '../skills/frontend-craft/scripts/lib/page.mjs';
import { serve } from '../skills/frontend-craft/scripts/lib/serve.mjs';
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
const CONCEPT = '# Idea\nA late bar that roasts on Thursdays: the page runs from the plateau where the beans grow to the bar at night.\n# Signature\nThe zoom opens the bar photograph; the fan spreads the four lots of the month.\n# Rejected\nCream and terracotta, three feature cards, a centred hero over a cup.\n# Breaks\n1. `.hero` headline overlaps the photograph.\n2. `.sp-type-pass` band runs between two sections.\n# Components\nNone dealt to this fixture.\n';

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

test('a multi-page site is checked page by page, with the new set pieces, surfaces and its breaks found on any page', { skip: !chrome, timeout: 400000 }, async () => {
  const direction = { id: 'range-test', grounds: { min: 2, how: '' }, type: { minPx: 60, how: '' }, pictures: { min: 3, fullBleed: false }, setPieces: [] };
  const pages = ['/tests/fixtures/range/index.html', '/tests/fixtures/range/menu.html'];
  const deal = { kind: 'site', lang: 'es', direction, motion: { setPieces: [] },
    pages: [{ path: pages[0], setPieces: ['word-track', 'type-zoom'] }, { path: pages[1], setPieces: ['word-mask', 'develop'] }] };
  const concept = '# Idea\nUna panadería de Cabecera que hornea de noche: la página va del horno a la mesa en dos páginas con el pan como protagonista.\n# Signature\nLa palabra Pan llena la pantalla y el zoom entra por su letra.\n# Rejected\nCrema y terracota, tres tarjetas iguales, un hero centrado.\n# Breaks\n1. `.sp-word-track` cruza la pantalla.\n2. `.craft-mono` lleva el recibo.\n# Components\nNinguno en este fixture.\n';
  const r = await runCheck({ target: { root: ROOT }, pages, kind: 'site', deal, concept, out: out() });
  assert.deepEqual(r.findings.filter((x) => x.level === 'FAIL'), []);
  assert.equal(r.pages.length, 2);
  for (const id of ['word-track', 'word-swap', 'type-zoom', 'bento-assemble']) assert.ok(r.pages[0].richness.setPieces.includes(id), id);
  for (const id of ['word-mask', 'develop']) assert.ok(r.pages[1].richness.setPieces.includes(id), id);
  assert.ok(!r.findings.some((x) => x.id === 'site-transitions'), 'the fixture has page transitions');
});

test('the AI tells fail: wrong language, slogans, two numbering systems, a tilted badge, one photograph twice', { skip: !chrome, timeout: 200000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/tells/index.html' }, kind: 'landing', deal: { kind: 'landing', lang: 'es', direction: null, motion: { setPieces: [] } }, out: out(), quick: true });
  const ids = new Set(r.findings.filter((x) => x.level === 'FAIL').map((x) => x.id));
  for (const id of ['copy-lang', 'copy-formula', 'slop-numbering', 'slop-stamp', 'slop-repeat-photo']) assert.ok(ids.has(id), `missing ${id}; got ${[...ids].join(', ')}`);
});

test('the four hero scenes start in headless Chrome without console errors', { skip: !chrome, timeout: 200000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/scenes/index.html' }, kind: 'app', out: out(), quick: true, detector: false });
  assert.deepEqual(r.richness.scenes.map((s) => `${s.id}:${s.on}`).sort(), ['chrome:true', 'dots:true', 'ink:true', 'iridescent:true']);
  assert.ok(!r.findings.some((x) => x.id === 'console'), r.findings.map((x) => x.id).join(', '));
});

test('a kit hero loop plays on screen, can be paused, and holds its poster under reduced motion', { skip: !chrome, timeout: 200000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/loop/index.html' }, kind: 'app', out: out(), detector: false });
  assert.deepEqual(r.findings.filter((x) => x.id.startsWith('video-')), []);
  assert.deepEqual(r.richness.loops.map(({ kit, muted, poster, played, firstScreen, toggle }) => ({ kit, muted, poster, played, firstScreen, toggle })),
    [{ kit: true, muted: true, poster: true, played: true, firstScreen: true, toggle: true }]);

  const server = await serve(ROOT);
  const browser = await launch();
  try {
    const state = (s) => s.run(() => {
      const v = document.querySelector('video');
      return { paused: v.paused, pressed: document.querySelector('[data-loop-toggle]').getAttribute('aria-pressed') };
    });
    const page = async (reduced) => {
      const s = await browser.newPage();
      for (const m of ['Page.enable', 'Runtime.enable']) await s.send(m);
      if (reduced) await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await s.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
      const { load } = await open(s, `${server.url}tests/fixtures/loop/index.html`);
      await settle(s, load, 800);
      return s;
    };
    const click = (s) => s.run(() => { document.querySelector('[data-loop-toggle]').click(); return true; });
    const scroll = (s, y) => s.run((top) => { window.scrollTo({ top, behavior: 'instant' }); return true; }, y);

    const s = await page(false);
    assert.deepEqual(await state(s), { paused: false, pressed: 'false' });
    await scroll(s, 3000); await sleep(400);
    assert.equal((await state(s)).paused, true, 'pauses off screen');
    await scroll(s, 0); await sleep(400);
    assert.equal((await state(s)).paused, false, 'resumes on screen');
    await click(s); await sleep(200);
    assert.deepEqual(await state(s), { paused: true, pressed: 'true' });
    await scroll(s, 3000); await sleep(300); await scroll(s, 0); await sleep(400);
    assert.equal((await state(s)).paused, true, 'a pause by the person sticks');
    s.close();

    const rm = await page(true);
    assert.deepEqual(await state(rm), { paused: true, pressed: 'true' });
    await click(rm); await sleep(400);
    assert.deepEqual(await state(rm), { paused: false, pressed: 'false' }, 'plays when the person asks');
    rm.close();
  } finally {
    await browser.close();
    await server.close();
  }
});

test('autoplaying videos without a poster, a pause control or a reduced-motion stop are caught', { skip: !chrome, timeout: 200000 }, async () => {
  const r = await runCheck({ target: { root: ROOT, page: 'tests/fixtures/loop/bad.html' }, kind: 'app', out: out(), detector: false });
  const got = new Set(r.findings.map((x) => `${x.level}:${x.id}`));
  for (const id of ['FAIL:video-reduced', 'FAIL:video-muted', 'WARN:video-pause', 'WARN:video-poster', 'FAIL:token-undefined']) assert.ok(got.has(id), `missing ${id}; got ${[...got].join(', ')}`);
  const token = r.findings.find((x) => x.id === 'token-undefined');
  assert.match(token.msg, /--s-20/);
  assert.doesNotMatch(token.msg, /--s-8\b/);
  assert.match(token.fix, /--s-8/, 'the fix lists the defined steps of the same scale');
});
