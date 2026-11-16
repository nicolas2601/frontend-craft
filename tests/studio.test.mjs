// 4.0 studio run: the screen-flatness reader, the blank/drawn/plan rules, look.mjs positions, media.mjs commands,
// the product pouch surface and the studio brief. Pure functions; the browser e2e lives in check.e2e.test.mjs.
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import { test } from 'node:test';
import { effects } from '../skills/frontend-craft/kit/craft-motion.js';
import { puff } from '../skills/frontend-craft/kit/motion/product3d.js';
import { framesArgs, parseStock, sheetArgs, socialArgs } from '../skills/frontend-craft/scripts/media.mjs';
import { positionsFor } from '../skills/frontend-craft/scripts/look.mjs';
import { decodePng, screenFlatness } from '../skills/frontend-craft/scripts/lib/png.mjs';
import { FLAT, blankRules, drawnSvgRules, planRules } from '../skills/frontend-craft/scripts/lib/rules-finish.mjs';
import { PLAN_TEMPLATE, storyboardRows, studioBrief } from '../skills/frontend-craft/scripts/lib/studio.mjs';

/** A PNG of width x height whose pixel colour comes from fn(x, y) -> [r, g, b]. */
function png(width, height, fn) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x += 1) fn(x, y).forEach((v, c) => { raw[y * (width * 3 + 1) + 1 + x * 3 + c] = v; });
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    return Buffer.concat([len, Buffer.from(type, 'ascii'), data, Buffer.alloc(4)]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

test('screen flatness reads a screenshot: a black screen is flat, a busy one is not, a half-empty one shows in its halves', () => {
  const black = screenFlatness(decodePng(png(40, 20, () => [10, 10, 10])));
  assert.equal(black.all, 1);
  const busy = screenFlatness(decodePng(png(40, 20, (x, y) => [(x * 37 + y * 11) % 256, (x * 13) % 256, (y * 29) % 256])));
  assert.ok(busy.all < 0.2, `busy ${busy.all}`);
  const half = screenFlatness(decodePng(png(40, 20, (x, y) => (x < 20 ? [(x * 37 + y * 11) % 256, (y * 53) % 256, 40] : [240, 240, 236]))));
  assert.ok(half.right === 1 && half.left < 0.5 && half.all < 0.6, JSON.stringify(half));
});

test('blank screens fail, sparse and half-empty ones warn, and an app is left to its own rules', () => {
  const ids = (blank, kind = 'landing') => blankRules({ blank, kind }).map((x) => `${x.level}:${x.id}`);
  assert.deepEqual(ids([{ y: 900, all: 1, left: 1, right: 1 }]), ['FAIL:blank-screen']);
  assert.deepEqual(ids([{ y: 900, all: 0.95, left: 0.95, right: 0.95 }]), ['WARN:sparse-screen'], 'a dark band of small stats, a curtain on a big motto');
  assert.deepEqual(ids([{ y: 900, all: 0.8, left: 0.995, right: 0.62 }]), ['WARN:half-empty']);
  assert.deepEqual(ids([{ y: 900, all: 0.69, left: 0.85, right: 0.53 }]), [], 'a page whose sections hold photographs');
  assert.deepEqual(ids([{ y: 0, all: 1, left: 1, right: 1 }], 'app'), []);
  assert.ok(FLAT.blank > FLAT.sparse);
});

test('a big drawing of boxes fails; the plan must have a storyboard in studio builds only', () => {
  assert.equal(drawnSvgRules({ drawnSvg: [{ shapes: 20, area: 35, label: 'Plano del cruce' }], kind: 'landing' })[0].id, 'svg-boxes');
  assert.deepEqual(drawnSvgRules({ drawnSvg: [], kind: 'landing' }), []);
  assert.equal(planRules({ deal: { mode: 'studio' }, plan: { rows: 0 } })[0].id, 'plan-missing');
  assert.deepEqual(planRules({ deal: { mode: 'studio' }, plan: { rows: 6 } }), []);
  assert.deepEqual(planRules({ deal: { version: 3 }, plan: { rows: 0 } }), [], 'the dealt run has no plan');
  assert.equal(storyboardRows(PLAN_TEMPLATE), 0, 'the empty template has no rows');
  const filled = PLAN_TEMPLATE.replace('|---|---|---|---|---|---|\n', '|---|---|---|---|---|---|\n| 1 | What is it? | The facade | hero.webp | dive | dive |\n| 2 | Where from? | Photographs | six | journey | journey |\n');
  assert.equal(storyboardRows(filled), 2);
});

test('look.mjs photographs a short section three times and a pinned one at four points of its pass', () => {
  assert.deepEqual(positionsFor({ top: 2000, height: 800 }, 900, 10000).map((p) => p.label), ['enter', 'middle', 'leave']);
  const tall = positionsFor({ top: 900, height: 2700 }, 900, 10000);
  assert.deepEqual(tall.map((p) => p.label), ['2%', '35%', '68%', '95%']);
  assert.ok(tall.every((p) => p.y >= 900 && p.y <= 900 + 1800));
  assert.ok(positionsFor({ top: 0, height: 500 }, 900, 300).every((p) => p.y >= 0 && p.y <= 300), 'clamped to the page');
});

test('media.mjs builds the yt-dlp, ffmpeg and stock calls, and parses Pexels and Pixabay', () => {
  const s = socialArgs('https://www.tiktok.com/@agostinocoffee', { out: 'assets/video/raw', max: 4 });
  assert.ok(s.includes('--playlist-end') && s[s.indexOf('--playlist-end') + 1] === '4');
  assert.ok(s.join(' ').includes('height<=1080'));
  assert.throws(() => socialArgs('agostinocoffee'), /URL/);
  const f = framesArgs('clip.mp4', { out: 'assets/seq', fps: 18, width: 1280, start: 2, end: 6 });
  assert.deepEqual(f.slice(2, 6), ['-ss', '2', '-to', '6']);
  assert.ok(f.join(' ').includes('fps=18,scale=1280'));
  assert.ok(sheetArgs('a.mp4', 'a.jpg', 120).join(' ').includes('fps=0.1000'), 'twelve frames over two minutes');
  const pex = parseStock('pexels', { videos: [{ id: 7, width: 3840, height: 2160, duration: 12, url: 'https://pexels.com/v/7', user: { name: 'Ana' }, video_files: [
    { file_type: 'video/mp4', width: 3840, link: '4k' }, { file_type: 'video/mp4', width: 1920, link: 'hd' }, { file_type: 'video/mp4', width: 960, link: 'sd' }] }] }, 'video');
  assert.deepEqual([pex[0].ref, pex[0].file, pex[0].by], ['pexels:7', 'hd', 'Ana'], 'the largest file at 1920 or under');
  const pix = parseStock('pixabay', { hits: [{ id: 9, duration: 8, user: 'Leo', pageURL: 'p', videos: { large: { url: 'L', width: 1920, height: 1080 } } }] }, 'video');
  assert.deepEqual([pix[0].ref, pix[0].file], ['pixabay:9', 'L']);
});

test('the kit registers the recipes, and the pouch is full in the middle and sealed at the edges', () => {
  for (const name of ['dive', 'journey', 'carousel', 'sequence', 'product3d', 'map']) assert.ok(effects.includes(name), name);
  assert.equal(puff(0, 0, 1, 1.5), 1);
  assert.equal(puff(0.5, 0, 1, 1.5), 0);
  assert.equal(puff(0, 0.75, 1, 1.5), 0);
  assert.ok(puff(0.3, 0.3, 1, 1.5) > 0.9, 'flat across most of the face');
});

test('the studio brief names every tool with its path and the defaults to refuse', () => {
  const brief = studioBrief({ kind: 'landing', lang: 'es' }, { scripts: '/s/scripts', ref: (f) => `/s/references/${f}`, kitDir: 'craft', checkCmd: 'node check.mjs', motionsites: null });
  for (const cmd of ['/s/scripts/media.mjs social', '/s/scripts/look.mjs', '/s/scripts/components.mjs', '/s/scripts/design.mjs', 'craft/starter.html']) assert.ok(brief.includes(cmd), cmd);
  assert.match(brief, /near-black ground with one bright accent/);
  assert.match(brief, /drawn map/);
  assert.match(brief, /dark panel beside the photograph/, 'the split hero on a dark panel is a named default');
  assert.match(brief, /Go through every line below/, 'the whole list is checked, not only what comes to mind');
});

test('a large letterboxed picture fails; an app is left alone', async () => {
  const { letterboxRules } = await import('../skills/frontend-craft/scripts/lib/rules-finish.mjs');
  assert.equal(letterboxRules({ letterbox: ['video hero.mp4 (1100x1350 in a 1440x832 frame)'], kind: 'landing' })[0].id, 'letterbox');
  assert.deepEqual(letterboxRules({ letterbox: [], kind: 'landing' }), []);
  assert.deepEqual(letterboxRules({ letterbox: ['img a.jpg'], kind: 'app' }), []);
});
