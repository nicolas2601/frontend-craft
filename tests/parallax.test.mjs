// parallax.mjs: a hero loop from one still and its depth, rendered as an exact loop with no GPU.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { baseZoom, cameraAt, options, parallax, renderFrame } from '../skills/frontend-craft/scripts/parallax.mjs';

let ffmpeg = true;
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { ffmpeg = false; }
const opts = (extra = {}) => options({ _: ['still.png'], ...extra });

test('options default to a 12 s drift at 1280 and refuse moves that tear or loops that are too short', () => {
  const o = opts();
  assert.deepEqual([o.seconds, o.move, o.amount, o.width, o.crf], [12, 'drift', 1, 1280, 27]);
  assert.throws(() => opts({ move: 'spin' }), /--move/);
  assert.throws(() => opts({ seconds: '2' }), /between 4 and 30/);
  assert.throws(() => opts({ amount: '3' }), /tears/);
});

test('every move is periodic, so the last frame leads into the first like any other step', () => {
  for (const move of ['drift', 'dolly', 'pan']) {
    const a = cameraAt(0, 360, { move, amount: 1, w: 1280 });
    const b = cameraAt(360, 360, { move, amount: 1, w: 1280 });
    for (const k of ['dx', 'dy', 'zoom']) assert.ok(Math.abs(a[k] - b[k]) < 1e-9, `${move} ${k}`);
  }
  assert.ok(Math.abs(cameraAt(90, 360, { move: 'drift', amount: 1, w: 1280 }).dx) > 20, 'drift moves about 22 px at 1280');
});

test('the base zoom keeps every sample inside the picture for the whole loop, nearest and farthest depth', () => {
  const w = 1280, h = 720, n = 120;
  for (const move of ['drift', 'dolly', 'pan']) {
    const base = baseZoom(n, { move, amount: 1.5, w, h });
    for (let f = 0; f < n; f++) {
      const c = cameraAt(f, n, { move, amount: 1.5, w });
      for (const d of [0, 1]) {
        const m = base * (1 + c.zoom * (0.4 + d));
        for (const [x, y] of [[0, 0], [w - 1, h - 1]]) {
          const sx = w / 2 + (x - w / 2) / m - c.dx * (d - 0.35);
          const sy = h / 2 + (y - h / 2) / m - c.dy * (d - 0.35);
          assert.ok(sx >= 0 && sx <= w - 1 && sy >= 0 && sy <= h - 1, `${move} frame ${f} depth ${d} samples outside: ${sx}, ${sy}`);
        }
      }
    }
  }
});

test('the seam between the last frame and the first is as small as a step inside the loop', () => {
  const w = 64, h = 36, n = 60;
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) { rgb[i * 3] = (i * 7) % 256; rgb[i * 3 + 1] = (i * 13) % 256; rgb[i * 3 + 2] = (i % w) * 4; }
  const depth = Float32Array.from({ length: w * h }, (_, i) => Math.floor(i / w) / h);
  const base = baseZoom(n, { move: 'drift', amount: 1, w, h });
  const frame = (f) => renderFrame(rgb, depth, w, h, cameraAt(f, n, { move: 'drift', amount: 1, w }), base, Buffer.alloc(w * h * 3));
  const diff = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
  const seam = diff(frame(n - 1), frame(0));
  const step = diff(frame(0), frame(1));
  assert.ok(Math.abs(seam - step) <= step * 0.25 + 0.5, `seam ${seam.toFixed(2)} against a step of ${step.toFixed(2)}`);
});

test('a real run with a given depth map writes the loop, poster and markup at the asked length', { skip: !ffmpeg, timeout: 180000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-parallax-'));
  const still = path.join(dir, 'still.png');
  const depth = path.join(dir, 'depth.png');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=480x270', '-frames:v', '1', still]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'gradients=s=480x270:c0=black:c1=white:x0=0:y0=0:x1=0:y1=269:nb_colors=2', '-frames:v', '1', depth]);
  const r = await parallax(options({ _: [still], depth, out: path.join(dir, 'hero'), seconds: '4', width: '320' }));
  for (const f of Object.values(r.files)) assert.ok(fs.statSync(f).size > 0, f);
  assert.equal(r.frames, 120);
  assert.equal(r.w, 320);
  assert.ok(Math.abs(r.duration - 4) < 0.05, `loop of ${r.duration} s`);
  assert.equal(fs.existsSync(`${path.join(dir, 'hero')}.parallax-source.mp4`), false, 'the intermediate clip is removed');
});
