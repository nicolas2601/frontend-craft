// Hero loops: the ffmpeg plan in scripts/video.mjs, the video rules, and a real encode when ffmpeg is installed.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { encode, markup, options, plan, sizeFor } from '../skills/frontend-craft/scripts/video.mjs';
import { richnessRules } from '../skills/frontend-craft/scripts/lib/rules-richness.mjs';
import { videoRules } from '../skills/frontend-craft/scripts/lib/rules-video.mjs';

const WAN = { width: 848, height: 480, fps: 16, frames: 49, duration: 3.0625 };
const opts = (extra = {}) => options({ _: ['clip.mp4'], ...extra });
let ffmpeg = true;
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { ffmpeg = false; }

test('options default to a 0.4 s crossfade at 1280x720, 30 fps, and reject bad input', () => {
  const o = opts();
  assert.equal(o.seam, 'crossfade');
  assert.equal(o.fade, 0.4);
  assert.deepEqual(sizeFor(WAN, o), { w: 1280, h: 720 });
  assert.deepEqual(sizeFor(WAN, opts({ aspect: 'source', width: '1000' })), { w: 1000, h: 566 });
  assert.deepEqual(sizeFor(WAN, opts({ aspect: '4:5', width: '1080' })), { w: 1080, h: 1350 });
  assert.throws(() => opts({ seam: 'first-last' }), /--seam/);
  assert.throws(() => opts({ aspect: 'wide' }), /--aspect/);
  assert.throws(() => opts({ fade: '-1' }), /--fade/);
});

test('the crossfade runs after the frame-rate change and ends one frame before the loop starts again', () => {
  const p = plan(WAN, opts());
  assert.match(p.graph, /^\[0:v\]minterpolate=fps=30:.*,split\[a\]\[b\]/);
  assert.match(p.graph, /xfade=transition=fade:duration=0\.4:offset=2\.2\[s\]/); // last frame at 3.0 s, minus two fades
  assert.match(p.graph, /scale=1280:720:.*crop=1280:720,unsharp/);
  assert.equal(p.duration, 2.6);
  assert.throws(() => plan(WAN, opts({ fade: '1.6' })), /longer than twice --fade/);
});

test('pingpong drops both repeated ends; none keeps the clip; a 30 fps source is not interpolated', () => {
  const pp = plan(WAN, opts({ seam: 'pingpong' }));
  assert.match(pp.graph, /reverse,trim=start_frame=1:end_frame=48/);
  assert.equal(pp.duration, 6);
  const none = plan({ ...WAN, fps: 30, frames: 90, duration: 3, width: 1920, height: 1080 }, opts({ seam: 'none', grain: '6' }));
  assert.match(none.graph, /^\[0:v\]fps=30\[s\]/);
  assert.match(none.graph, /noise=alls=6:allf=t/);
  assert.doesNotMatch(none.graph, /unsharp/);
  const cut = plan(WAN, opts({ start: '0.5', end: '2.5' }));
  assert.match(cut.graph, /trim=start=0\.5:end=2\.5,setpts=PTS-STARTPTS,minterpolate/);
});

test('the printed markup points at the files from the page, not by bare name', () => {
  const files = { mp4: 'assets/hero.mp4', webm: 'assets/hero.webm', poster: 'assets/hero-poster.webp' };
  const html = markup(files, { w: 1280, h: 720 });
  assert.match(html, /poster="assets\/hero-poster\.webp"/);
  assert.match(html, /src="assets\/hero\.webm"/);
  assert.match(html, /src="assets\/hero\.mp4"/);
  assert.match(html, /width="1280" height="720"/);
  const vite = markup({ mp4: 'public/media/hero.mp4', webm: 'public/media/hero.webm', poster: 'public/media/hero-poster.webp' }, { w: 1280, h: 720 });
  assert.match(vite, /src="\/media\/hero\.webm"/, 'files under public/ are served from the site root');
});

test('video rules: playing under reduced motion and sound fail; no pause control and no poster warn', () => {
  const good = { src: 'hero.webm', kit: true, muted: true, poster: true, played: true, firstScreen: true, toggle: true };
  assert.deepEqual(videoRules({ richness: { loops: [good] }, reducedVideos: [] }), []);
  const out = videoRules({ richness: { loops: [{ ...good, muted: false, toggle: false, poster: false }] }, reducedVideos: ['hero.webm'] });
  assert.deepEqual(out.map((x) => `${x.level}:${x.id}`), ['FAIL:video-reduced', 'FAIL:video-muted', 'WARN:video-pause', 'WARN:video-poster']);
  assert.deepEqual(videoRules({}), []);
});

test('a hero loop that played in the first screen stands in for the dealt scene', () => {
  const direction = { id: 't', grounds: { min: 1, how: '' }, pictures: { min: 0 }, type: { minPx: 10, how: '' } };
  const deal = { kind: 'landing', direction, motion: { setPieces: [], scene: 'chrome' } };
  const base = { doc: { h1: { size: 80 } }, motion: { scenes: 2 }, deal, concept: null, kind: 'landing' };
  const richness = { grounds: [[0, 0, 0]], pictures: 0, setPieces: [], scenes: [] };
  const ids = (loops) => richnessRules({ ...base, richness: { ...richness, loops } }).map((x) => x.id);
  assert.ok(ids([]).includes('deal-scene'));
  assert.ok(ids([{ firstScreen: false, played: true }]).includes('deal-scene'));
  assert.ok(!ids([{ firstScreen: true, played: true }]).includes('deal-scene'));
});

test('a real encode writes mp4, webm and poster at the planned length', { skip: !ffmpeg, timeout: 120000 }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-video-'));
  const clip = path.join(dir, 'clip.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=424x240:rate=16:duration=2', '-pix_fmt', 'yuv420p', clip]);
  const r = encode(options({ _: [clip], out: path.join(dir, 'out', 'hero'), width: '320' }));
  for (const f of Object.values(r.files)) assert.ok(fs.statSync(f).size > 0, f);
  const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', r.files.mp4], { encoding: 'utf8' }));
  assert.ok(Math.abs(seconds - r.duration) < 0.1, `${seconds} s against ${r.duration} s planned`);
  assert.deepEqual([r.w, r.h], [320, 180]);
  assert.deepEqual(r.over, []);
});
