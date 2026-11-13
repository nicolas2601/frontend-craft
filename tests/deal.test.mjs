import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hexToRgb, isCream } from '../skills/frontend-craft/scripts/lib/color.mjs';
import { RECENT, SCROLL_STORIES, deal, loadLibrary, rngFrom, summarize } from '../skills/frontend-craft/scripts/lib/deal.mjs';
import { googleFontsUrl, nextFont, tokensCss } from '../skills/frontend-craft/scripts/lib/render.mjs';

const lib = loadLibrary();
const run = (seed, extra = {}) => deal({ lib, kind: 'landing', moods: ['warm', 'craft'], rng: rngFrom(seed), ...extra });

test('the same seed reproduces the same deal', () => {
  assert.deepEqual(summarize(run(7)), summarize(run(7)));
});

test('different seeds spread across the library', () => {
  const palettes = new Set();
  const comps = new Set();
  for (let s = 1; s <= 60; s += 1) { const d = summarize(run(s)); palettes.add(d.palette); comps.add(d.composition); }
  assert.ok(palettes.size >= 5, `only ${palettes.size} palettes`);
  assert.ok(comps.size >= 5, `only ${comps.size} compositions`);
});

test('recent deals are not repeated', () => {
  const history = [];
  for (let s = 1; s <= 12; s += 1) {
    const d = summarize(deal({ lib, kind: 'landing', moods: ['warm', 'craft'], rng: rngFrom(s * 31), history }));
    const recent = history.slice(-RECENT);
    assert.ok(!recent.some((h) => h.palette === d.palette), `palette ${d.palette} repeated at ${s}`);
    assert.ok(!recent.some((h) => h.composition === d.composition), `composition ${d.composition} repeated at ${s}`);
    history.push(d);
  }
});

test('mood filtering keeps palettes on mood', () => {
  for (let s = 1; s <= 20; s += 1) {
    const d = deal({ lib, kind: 'landing', moods: ['developer'], rng: rngFrom(s) });
    assert.ok(d.palette.moods.includes('developer'), d.palette.id);
  }
});

test('a cream background is never paired with a serif display face', () => {
  for (let s = 1; s <= 200; s += 1) {
    const d = deal({ lib, kind: 'landing', moods: ['warm', 'heritage', 'editorial'], rng: rngFrom(s) });
    if (isCream(hexToRgb(d.palette.roles.bg))) assert.ok(!d.type.display.serif, `${d.palette.id} + ${d.type.id}`);
  }
});

test('persuade pages always get a scroll story', () => {
  for (let s = 1; s <= 100; s += 1) {
    const d = deal({ lib, kind: 'event', moods: [], rng: rngFrom(s) });
    const ids = [d.motion.signature.id, ...d.motion.supports.map((x) => x.id)];
    assert.ok(ids.some((id) => SCROLL_STORIES.includes(id)), ids.join(','));
  }
});

test('pins and brand mode are respected', () => {
  const d = run(3, { pins: { palette: 'paper-mono', type: 'geist-solo', composition: 'interface-hero' } });
  assert.deepEqual([d.palette.id, d.type.id, d.composition.id], ['paper-mono', 'geist-solo', 'interface-hero']);
  const outside = run(3, { pins: { composition: 'index-list', signature: 'scroll-words' } });
  assert.equal(outside.motion.signature.id, 'scroll-words', 'a pinned signature wins even outside the composition list');
  assert.ok(!outside.motion.supports.some((x) => x.id === 'scroll-words'));
  const b = run(3, { brand: true });
  assert.equal(b.palette, null);
  assert.equal(b.type, null);
});

test('font url merges one family used twice and keeps axes', () => {
  const archivo = lib.pairings.find((p) => p.id === 'archivo-wide');
  assert.equal(googleFontsUrl(archivo), 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap');
  const geist = lib.pairings.find((p) => p.id === 'geist-solo');
  assert.equal(googleFontsUrl(geist), 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
  assert.match(nextFont(geist), /import \{ Geist, Geist_Mono \} from 'next\/font\/google'/);
});

test('tokens.css carries every role and the display treatment', () => {
  const css = tokensCss(run(11));
  for (const v of ['--c-bg', '--c-surface', '--c-ink', '--c-muted', '--c-line', '--c-accent', '--c-accent-ink', '--f-display', '--f-text', '--display-tracking']) {
    assert.ok(css.includes(`${v}:`), v);
  }
  assert.match(css, /html \{ background: var\(--c-bg\); \}/);
});

test('the dealt type always shares a mood with the dealt palette', () => {
  for (let s = 1; s <= 300; s += 1) {
    const d = deal({ lib, kind: 'event', moods: ['music', 'festive', 'culture'], rng: rngFrom(s) });
    assert.ok(d.type.moods.some((m) => d.palette.moods.includes(m)), `${d.palette.id} + ${d.type.id}`);
  }
});
