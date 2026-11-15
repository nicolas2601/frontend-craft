// A palette taken from the subject's own picture: roles that pass contrast, colours that stay the subject's.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { contrast, hexToRgb, oklab } from '../skills/frontend-craft/scripts/lib/color.mjs';
import { derivePalette, samplePixels } from '../skills/frontend-craft/scripts/lib/palette-from.mjs';

let ffmpeg = true;
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { ffmpeg = false; }

const fill = (hex, n) => Array.from({ length: n }, () => hexToRgb(hex));
// A Barichara courtyard: lime-washed walls, sandstone, terracotta tiles, dark timber, a little green.
const COURTYARD = [...fill('#efe8da', 380), ...fill('#c9a36b', 300), ...fill('#a4502f', 160), ...fill('#3b2a20', 110), ...fill('#5d7048', 50)];
const hue = (hex) => { const [, a, b] = oklab(hexToRgb(hex)); return (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; };
const hueGap = (x, y) => { const d = Math.abs(hue(x) - hue(y)) % 360; return Math.min(d, 360 - d); };
const c = (x, y) => contrast(hexToRgb(x), hexToRgb(y));

test('a light palette from a courtyard keeps its hues and passes contrast in every role', () => {
  const p = derivePalette(COURTYARD, { scheme: 'light', source: 'courtyard' });
  const r = p.roles;
  assert.equal(p.scheme, 'light');
  assert.ok(c(r.ink, r.bg) >= 7, `ink on bg ${c(r.ink, r.bg)}`);
  assert.ok(c(r.muted, r.bg) >= 4.5, `muted on bg ${c(r.muted, r.bg)}`);
  assert.ok(c(r.ink, r.surface) >= 7, 'ink on surface');
  assert.ok(c(r.accent, r.bg) >= 4.5, `accent as text on bg ${c(r.accent, r.bg)}`);
  assert.ok(c(r.accentInk, r.accent) >= 4.5, `button label on accent ${c(r.accentInk, r.accent)}`);
  assert.ok(hueGap(r.accent, '#a4502f') < 25, `accent ${r.accent} is the terracotta, not an invented colour`);
  assert.ok(hueGap(r.bg, '#c9a36b') < 40, `ground ${r.bg} is a warm lime-wash, not a cold grey`);
  assert.match(p.note, /courtyard/);
  assert.deepEqual(derivePalette(COURTYARD, { scheme: 'light', source: 'courtyard' }), p, 'deterministic');
});

test('a dark palette from the same picture inverts the grounds and keeps the accent readable', () => {
  const r = derivePalette(COURTYARD, { scheme: 'dark' }).roles;
  assert.ok(c(r.ink, r.bg) >= 7 && c(r.muted, r.bg) >= 4.5 && c(r.accent, r.bg) >= 4.5 && c(r.accentInk, r.accent) >= 4.5);
  assert.ok(oklab(hexToRgb(r.bg))[0] < 0.3, `dark ground ${r.bg}`);
});

test('a grey picture gets a quiet accent from its own hue instead of an invented colour', () => {
  const grey = [...fill('#e9e9e7', 500), ...fill('#8a8a86', 300), ...fill('#2b2b29', 200)];
  const r = derivePalette(grey, { scheme: 'light' }).roles;
  assert.ok(c(r.accent, r.bg) >= 4.5 && c(r.accentInk, r.accent) >= 4.5);
  const [, a, b] = oklab(hexToRgb(r.accent));
  assert.ok(Math.hypot(a, b) < 0.09, `accent ${r.accent} stays near-neutral`);
});

test('pixels are sampled from a real image file', { skip: !ffmpeg }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-palette-'));
  const file = path.join(dir, 'still.png');
  execFileSync('ffmpeg', ['-v', 'error', '-nostdin', '-f', 'lavfi', '-i', 'color=c=0xefe8da:s=160x90,drawbox=x=0:y=50:w=160:h=40:color=0xa4502f:t=fill',
    '-frames:v', '1', file]);
  const px = samplePixels(file);
  assert.ok(px.length >= 1000, `${px.length} pixels`);
  const r = derivePalette(px, { scheme: 'light' }).roles;
  assert.ok(hueGap(r.accent, '#a4502f') < 25, r.accent);
});
