import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hexToRgb, isCream } from '../skills/frontend-craft/scripts/lib/color.mjs';
import {
  RECENT, RECENT_DIRECTIONS, SCROLL_STORIES, SET_PIECES, deal, dealSetPieces, landingFor, loadLibrary, normalizePages, pickComponent, rngFrom, summarize,
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

test('a cream background is never paired with a serif display face, outside heritage and luxury subjects', () => {
  for (let s = 1; s <= 200; s += 1) {
    const d = deal({ lib, kind: 'landing', moods: ['warm', 'coffee', 'editorial'], rng: rngFrom(s) });
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

test('websites are dealt a hero scene from their direction, never the one the last build had', () => {
  for (let s = 1; s <= 40; s += 1) {
    const d = deal({ lib, kind: 'landing', moods: ['food'], rng: rngFrom(s), history: [{ scene: 'ink' }] });
    assert.ok(d.direction.scenes.includes(d.motion.scene), `${d.motion.scene} from ${d.direction.id}`);
    if (d.direction.scenes.length > 1) assert.notEqual(d.motion.scene, 'ink');
    assert.equal(deal({ lib, kind: 'app', moods: ['tech'], rng: rngFrom(s) }).motion.scene, null, 'apps get no scene');
  }
});

const PLACE = ['hospitality', 'heritage', 'warm'];

test('the palette follows the subject even when the direction is a wildcard', () => {
  let wild = 0;
  for (let s = 1; s <= 80; s += 1) {
    for (const risk of ['bold', 'wild']) {
      const d = deal({ lib, kind: 'landing', moods: PLACE, rng: rngFrom(s), risk });
      if (d.wildcard) wild += 1;
      assert.ok(d.palette.moods.some((m) => PLACE.includes(m)), `${risk} seed ${s}: ${d.direction.id} dealt ${d.palette.id}`);
      if (d.direction.scheme !== 'any') assert.equal(d.palette.scheme, d.direction.scheme, `${d.direction.id} on ${d.palette.id}`);
    }
  }
  assert.ok(wild > 20, `wildcards still happen for layout and type (${wild})`);
});

test('a subject sold by its photographs is never dealt a direction that recolours them', () => {
  const recolouring = lib.directions.filter((d) => d.recolours).map((d) => d.id);
  assert.ok(recolouring.includes('riso-print') && recolouring.includes('split-duotone'), recolouring.join(','));
  for (const moods of [PLACE, ['food', 'warm'], ['travel', 'fresh'], ['coffee', 'craft']]) {
    for (let s = 1; s <= 60; s += 1) {
      const d = deal({ lib, kind: 'landing', moods, rng: rngFrom(s), risk: 'wild' });
      assert.ok(!d.direction.recolours, `${moods} seed ${s}: ${d.direction.id}`);
    }
  }
  const zine = Array.from({ length: 60 }, (_, s) => deal({ lib, kind: 'landing', moods: ['print', 'music'], rng: rngFrom(s + 1) }).direction.id);
  assert.ok(zine.includes('riso-print'), 'riso stays available for subjects that are not sold by photographs');
});

test('a palette taken from the subject replaces the dealt one; cream and serif stay out of a cafe but fit a heritage house', async () => {
  const { applyPalette } = await import('../skills/frontend-craft/scripts/lib/deal.mjs');
  const photo = { id: 'from-photo', scheme: 'light', moods: [], note: 'Taken from the courtyard.', roles: { bg: '#fbf2e5', surface: '#fffaf4', ink: '#231e18', muted: '#68625b', line: '#e3d7c5', accent: '#895b17', accentInk: '#fdfbf9' } };
  let heritageSerif = 0;
  for (let s = 1; s <= 30; s += 1) {
    const cafe = applyPalette(deal({ lib, kind: 'landing', moods: ['coffee', 'warm'], rng: rngFrom(s) }), photo, lib);
    assert.equal(cafe.palette.id, 'from-photo');
    assert.ok(!cafe.type.display.serif, `seed ${s}: ${cafe.type.id} is a serif display on a cream ground for a cafe`);
    assert.match(tokensCss(cafe), /--c-accent: #895b17;/);
    const house = applyPalette(deal({ lib, kind: 'landing', moods: PLACE, rng: rngFrom(s) }), photo, lib);
    assert.ok(house.type.moods.some((m) => PLACE.includes(m)), `seed ${s}: ${house.type.id} is off the subject's register`);
    if (house.type.display.serif) heritageSerif += 1;
  }
  assert.ok(heritageSerif > 0, 'a heritage house may take a serif on its lime-wash');
});

test('a photo-led subject keeps its own type register under a wildcard', () => {
  for (let s = 1; s <= 60; s += 1) {
    const d = deal({ lib, kind: 'landing', moods: PLACE, rng: rngFrom(s), risk: 'wild' });
    assert.ok(d.type.moods.some((m) => PLACE.includes(m)), `seed ${s}: ${d.direction.id} dealt ${d.type.id}`);
  }
});

test('a hostel is never dealt a product-interface or single-object composition', () => {
  const needs = Object.fromEntries(lib.compositions.filter((c) => c.needs).map((c) => [c.id, c.needs]));
  assert.ok(needs['interface-hero'] && needs['object-center'], Object.keys(needs).join(','));
  const comps = new Set();
  for (let s = 1; s <= 120; s += 1) comps.add(deal({ lib, kind: 'landing', moods: PLACE, rng: rngFrom(s) }).composition.id);
  assert.ok(!comps.has('interface-hero') && !comps.has('object-center'), [...comps].join(','));
  assert.ok(comps.size >= 4 && [...comps].every((id) => lib.compositions.find((c) => c.id === id).photoFirst), `varied and photo-first: ${[...comps].join(',')}`);
  const tech = new Set(Array.from({ length: 80 }, (_, s) => deal({ lib, kind: 'landing', moods: ['tech', 'developer'], rng: rngFrom(s + 1) }).composition.id));
  assert.ok(tech.has('interface-hero'), [...tech].join(','));
});

test('each kind of page gets the reading order a visitor expects, from the ui-ux-pro-max patterns', () => {
  assert.equal(landingFor(lib.landing, 'venue', ['hospitality', 'heritage']).id, 'hero-centric-design');
  assert.equal(landingFor(lib.landing, 'landing', ['hospitality', 'warm']).id, 'hero-centric-design');
  assert.equal(landingFor(lib.landing, 'landing', ['tech', 'precise']).id, 'feature-rich-showcase');
  assert.equal(landingFor(lib.landing, 'event', ['music']).id, 'event-conference-landing');
  assert.equal(landingFor(lib.landing, 'app', ['tech']), null);
  const d = deal({ lib, kind: 'venue', moods: ['hospitality', 'heritage'], rng: rngFrom(3) });
  assert.equal(d.landing.id, 'hero-centric-design');
  assert.ok(d.landing.order.length >= 3 && d.landing.cta);
});
