import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hexToRgb, isCream } from '../skills/frontend-craft/scripts/lib/color.mjs';
import {
  RECENT, RECENT_DIRECTIONS, SCROLL_STORIES, SET_PIECES, deal, dealSetPieces, loadLibrary, normalizePages, pickComponent, rngFrom, summarize,
} from '../skills/frontend-craft/scripts/lib/deal.mjs';
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

test('mood filtering keeps palettes on mood unless the direction is a wildcard', () => {
  for (let s = 1; s <= 40; s += 1) {
    const safe = deal({ lib, kind: 'landing', moods: ['developer'], rng: rngFrom(s), risk: 'safe' });
    assert.ok(safe.palette.moods.includes('developer'), safe.palette.id);
    const app = deal({ lib, kind: 'app', moods: ['developer'], rng: rngFrom(s) });
    assert.ok(app.palette.moods.includes('developer'), app.palette.id);
  }
});

test('websites get an art direction and two set pieces; apps a product direction without set pieces; docs none', () => {
  for (let s = 1; s <= 40; s += 1) {
    const site = run(s);
    assert.ok(site.direction, 'a landing is dealt a direction');
    assert.equal(site.motion.setPieces.length, 2);
    for (const id of site.motion.setPieces) {
      assert.ok(SET_PIECES.includes(id), id);
      assert.ok(site.direction.setPieces.includes(id), `${id} comes from ${site.direction.id}`);
    }
    if (site.direction.scheme !== 'any') assert.equal(site.palette.scheme, site.direction.scheme, `${site.direction.id} on ${site.palette.id}`);
    const app = deal({ lib, kind: 'app', moods: ['calm'], rng: rngFrom(s) });
    assert.ok(app.direction.modes.includes('operate'), app.direction.id);
    assert.deepEqual(app.motion.setPieces, []);
    const docs = deal({ lib, kind: 'docs', moods: ['calm'], rng: rngFrom(s) });
    assert.equal(docs.direction, null);
    assert.deepEqual(docs.motion.setPieces, []);
  }
});

test('bold risk deals a direction outside the subject\'s moods some of the time; safe never does', () => {
  const moods = ['coffee', 'warm', 'craft'];
  const share = (risk) => {
    let wild = 0;
    for (let s = 1; s <= 300; s += 1) {
      const d = deal({ lib, kind: 'landing', moods, rng: rngFrom(s), risk });
      const onMood = d.direction.moods.some((m) => moods.includes(m));
      assert.equal(d.wildcard, !onMood, `${d.direction.id} wildcard=${d.wildcard}`);
      if (d.wildcard) wild += 1;
    }
    return wild / 300;
  };
  assert.equal(share('safe'), 0);
  const bold = share('bold');
  assert.ok(bold >= 0.3 && bold < 0.8, `bold wildcard share ${bold}`);
  assert.ok(share('wild') > bold);
});

test('two agents given the same brief rarely get the same page', () => {
  // Each agent starts from an empty history and its own random seed: what two models running the
  // same prompt on two machines would get.
  let sameDirection = 0;
  let sameHand = 0;
  const pairs = 200;
  for (let k = 0; k < pairs; k += 1) {
    const a = summarize(deal({ lib, kind: 'landing', moods: ['coffee', 'warm'], rng: rngFrom(1000 + k) }));
    const b = summarize(deal({ lib, kind: 'landing', moods: ['coffee', 'warm'], rng: rngFrom(9000 + k * 7) }));
    if (a.direction === b.direction) sameDirection += 1;
    if (a.direction === b.direction && a.palette === b.palette && a.type === b.type && a.composition === b.composition) sameHand += 1;
  }
  assert.ok(sameDirection / pairs < 0.2, `same direction in ${sameDirection} of ${pairs}`);
  assert.ok(sameHand / pairs < 0.02, `same whole hand in ${sameHand} of ${pairs}`);
});

test('the last directions are not dealt again', () => {
  const history = [];
  for (let s = 1; s <= 30; s += 1) {
    const d = summarize(run(s * 13, { history }));
    assert.ok(!history.slice(-RECENT_DIRECTIONS).some((h) => h.direction === d.direction), `direction ${d.direction} repeated at ${s}`);
    history.push(d);
  }
});

test('a pinned direction wins', () => {
  const d = run(5, { pins: { direction: 'swiss-grid' } });
  assert.equal(d.direction.id, 'swiss-grid');
  assert.equal(d.wildcard, false);
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

test('a multi-page site gets two set pieces per page and never the same piece twice', () => {
  for (let s = 1; s <= 60; s += 1) {
    const d = deal({ lib, kind: 'site', moods: ['food'], rng: rngFrom(s), pages: ['/', 'menu', '/about', '/visit'] });
    assert.deepEqual(d.pages.map((p) => p.path), ['/', '/menu', '/about', '/visit']);
    const all = d.pages.flatMap((p) => p.setPieces);
    assert.equal(all.length, 8);
    assert.equal(new Set(all).size, 8, all.join(' '));
    assert.ok(d.pages[0].setPieces.every((id) => d.direction.setPieces.includes(id)), 'the home page takes the direction\'s own pieces');
    assert.deepEqual(d.motion.setPieces, d.pages[0].setPieces);
  }
  assert.deepEqual(normalizePages('menu,/visit'), ['/', '/menu', '/visit']);
});

test('every build is dealt a library component that fits its direction and its mode', () => {
  for (let s = 1; s <= 60; s += 1) {
    const web = deal({ lib, kind: 'landing', moods: ['food'], rng: rngFrom(s) });
    assert.ok(web.motion.component, 'a component is dealt');
    assert.ok(web.motion.component.fits.includes(web.direction.id), `${web.motion.component.id} fits ${web.direction.id}`);
    assert.ok(web.motion.component.modes.includes('persuade'));
    const app = deal({ lib, kind: 'app', moods: ['tech'], rng: rngFrom(s) });
    assert.ok(app.motion.component.modes.includes('operate'), app.motion.component.id);
  }
  const pinned = deal({ lib, kind: 'landing', moods: [], rng: rngFrom(1), pins: { component: 'ScrollVelocity' } });
  assert.equal(pinned.motion.component.id, 'ScrollVelocity');
});

test('set pieces and components used by the last builds come back only when nothing else is left', () => {
  const direction = lib.directions.find((d) => d.id === 'kinetic-type');
  const history = [{ setPieces: ['letters', 'type-pass'] }, { setPieces: ['iris', 'word-track'] }];
  for (let s = 1; s <= 40; s += 1) {
    const [pieces] = dealSetPieces(direction, { rng: rngFrom(s), history });
    for (const id of pieces) assert.ok(!['letters', 'type-pass', 'iris', 'word-track'].includes(id), `${id} was used last time`);
  }
  const used = lib.components.filter((c) => c.fits.includes('kinetic-type')).slice(0, 3).map((c) => ({ component: c.id }));
  for (let s = 1; s <= 30; s += 1) {
    const c = pickComponent(lib.components, { direction, mode: 'persuade', rng: rngFrom(s), history: used });
    assert.ok(!used.some((u) => u.component === c.id), c.id);
  }
});

test('the deal carries the page language and summarize records the pieces for the next build', () => {
  const d = deal({ lib, kind: 'landing', moods: ['food'], rng: rngFrom(7), lang: 'es' });
  assert.equal(d.lang, 'es');
  const sum = summarize(d);
  assert.deepEqual(sum.setPieces, d.motion.setPieces);
  assert.equal(sum.component, d.motion.component.id);
});
