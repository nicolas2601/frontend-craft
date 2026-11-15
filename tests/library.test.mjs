import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrast, hexToRgb } from '../skills/frontend-craft/scripts/lib/color.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KINDS, SET_PIECES, loadLibrary, typeFits } from '../skills/frontend-craft/scripts/lib/deal.mjs';
import { SET_PIECE_JOBS } from '../skills/frontend-craft/scripts/lib/render.mjs';

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'frontend-craft');
import { isCream } from '../skills/frontend-craft/scripts/lib/color.mjs';

const lib = loadLibrary();
const ratio = (a, b) => contrast(hexToRgb(a), hexToRgb(b));

test('every palette passes WCAG AA for the pairs it is used with', () => {
  for (const { id, roles: r } of lib.palettes) {
    assert.ok(ratio(r.ink, r.bg) >= 7, `${id}: ink on bg ${ratio(r.ink, r.bg).toFixed(2)}`);
    assert.ok(ratio(r.ink, r.surface) >= 4.5, `${id}: ink on surface`);
    assert.ok(ratio(r.muted, r.bg) >= 4.5, `${id}: muted on bg ${ratio(r.muted, r.bg).toFixed(2)}`);
    assert.ok(ratio(r.muted, r.surface) >= 4.5, `${id}: muted on surface ${ratio(r.muted, r.surface).toFixed(2)}`);
    assert.ok(ratio(r.accentInk, r.accent) >= 4.5, `${id}: accentInk on accent ${ratio(r.accentInk, r.accent).toFixed(2)}`);
    assert.ok(ratio(r.accent, r.bg) >= 3, `${id}: accent on bg ${ratio(r.accent, r.bg).toFixed(2)}`);
  }
});

test('ids are unique in every list', () => {
  for (const key of ['palettes', 'pairings', 'compositions', 'signatures']) {
    const ids = lib[key].map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `${key} has duplicate ids`);
  }
});

test('compositions only reference known kinds and signatures', () => {
  const sigs = new Set(lib.signatures.map((s) => s.id));
  for (const c of lib.compositions) {
    for (const k of c.kinds) assert.ok(KINDS.includes(k), `${c.id}: kind ${k}`);
    for (const s of c.signatures) assert.ok(sigs.has(s), `${c.id}: signature ${s}`);
    assert.ok(c.sections.length >= 3, `${c.id}: too few sections`);
  }
});

test('every persuade kind has at least three compositions', () => {
  for (const k of ['landing', 'product', 'portfolio', 'event', 'venue', 'brand', 'campaign']) {
    const n = lib.compositions.filter((c) => c.kinds.includes(k)).length;
    assert.ok(n >= 3, `${k}: ${n}`);
  }
});

test('type pairings name weights and a display treatment', () => {
  for (const p of lib.pairings) {
    assert.ok(p.display.weights.length && p.text.weights.length, p.id);
    assert.match(p.display.tracking, /^-?\d+(\.\d+)?em$/, p.id);
    assert.ok(['none', 'uppercase'].includes(p.display.case), p.id);
    assert.equal(typeof p.display.serif, 'boolean', p.id);
  }
});

test('the generated default display faces are never dealt', () => {
  const banned = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Fraunces', 'Playfair Display', 'Instrument Serif', 'Space Grotesk'];
  for (const p of lib.pairings) assert.ok(!banned.includes(p.display.family), `${p.id} uses ${p.display.family}`);
});

test('every palette has at least three type pairings that fit it', () => {
  for (const pal of lib.palettes) {
    const fits = lib.pairings.filter((p) => typeFits(p, pal, isCream(hexToRgb(pal.roles.bg))));
    assert.ok(fits.length >= 3, `${pal.id}: ${fits.map((p) => p.id).join(', ')}`);
  }
});

test('every direction is complete and only names set pieces and supports that exist', () => {
  const lib = loadLibrary();
  const css = fs.readFileSync(path.join(SKILL_DIR, 'kit', 'set-pieces.css'), 'utf8');
  const doc = fs.readFileSync(path.join(SKILL_DIR, 'references', 'set-pieces.md'), 'utf8');
  for (const id of SET_PIECES) {
    assert.match(css, new RegExp(`\\.sp-${id}(?![a-z-])`), `set-pieces.css styles sp-${id}`);
    assert.match(doc, new RegExp(`^## ${id}$`, 'm'), `set-pieces.md documents ${id}`);
    assert.ok(SET_PIECE_JOBS[id], `the brief describes ${id}`);
  }
  const signatures = new Set(lib.signatures.map((s) => s.id));
  assert.ok(lib.directions.length >= 10);
  for (const d of lib.directions) {
    for (const k of ['id', 'name', 'idea', 'avoid']) assert.ok(typeof d[k] === 'string' && d[k].length > 3, `${d.id}.${k}`);
    assert.ok(['dark', 'light', 'any'].includes(d.scheme), `${d.id}.scheme`);
    assert.ok(d.moods.length >= 3 && d.typeMoods.length >= 3, `${d.id} moods`);
    assert.ok(d.grounds.min >= 2 && d.type.minPx >= 96 && d.pictures.min >= 2, `${d.id} floor`);
    assert.equal(d.breaks.length, 2, `${d.id} has two breaks`);
    assert.ok(d.setPieces.length >= 2 && d.setPieces.every((s) => SET_PIECES.includes(s)), `${d.id} set pieces`);
    assert.ok(d.supports.every((s) => signatures.has(s)), `${d.id} supports`);
    if (d.scheme !== 'any') assert.ok(lib.palettes.some((p) => p.scheme === d.scheme), `${d.id} has palettes in its scheme`);
  }
});

test('every direction names hero scenes the kit can draw', async () => {
  const { SCENES } = await import('../skills/frontend-craft/kit/motion/shaders.js');
  const doc = fs.readFileSync(path.join(SKILL_DIR, 'references', 'scenes.md'), 'utf8');
  for (const d of loadLibrary().directions) {
    assert.ok(d.scenes?.length, `${d.id} has scenes`);
    for (const id of d.scenes) assert.ok(SCENES.includes(id), `${d.id}: ${id}`);
  }
  for (const id of SCENES) assert.match(doc, new RegExp(`\`${id}\``), `scenes.md documents ${id}`);
});

test('the hero loop is wired: kit effect, attribute docs and every video rule in checks.md and hero-video.md', async () => {
  const { effects } = await import('../skills/frontend-craft/kit/craft-motion.js');
  assert.ok(effects.includes('loop') && effects.includes('scene'));
  const read = (f) => fs.readFileSync(path.join(SKILL_DIR, 'references', f), 'utf8');
  assert.match(read('motion.md'), /`data-loop`/);
  for (const id of ['video-reduced', 'video-muted', 'video-pause', 'video-poster']) {
    assert.match(read('checks.md'), new RegExp(`\`${id}\``), `checks.md: ${id}`);
    assert.match(read('hero-video.md'), new RegExp(`\`${id}\``), `hero-video.md: ${id}`);
  }
});

test('a hero loop takes the riso treatment like a photograph, and its pause button stays above the inks', () => {
  const css = fs.readFileSync(path.join(SKILL_DIR, 'kit', 'surfaces.css'), 'utf8');
  assert.match(css, /\.craft-riso :is\(img, video\)\s*\{\s*filter: grayscale/, 'riso filter must cover video');
  const z = (re) => Number(css.match(re)?.[1]);
  assert.ok(z(/\.craft-loop \[data-loop-toggle\][^{]*\{[^}]*z-index: (\d+)/) > z(/\.craft-riso::after \{[^}]*z-index: (\d+)/), 'toggle above the riso grain');
  assert.match(fs.readFileSync(path.join(SKILL_DIR, 'references', 'hero-video.md'), 'utf8'), /picture treatment/);
});

test('the plugin reviewer agents are generated from review.md and carry its briefs', async () => {
  const { agentFiles } = await import('../scripts/review-agents.mjs');
  const files = agentFiles();
  assert.deepEqual(Object.keys(files).sort(), ['craft-design-critic.md', 'craft-motion-auditor.md']);
  for (const [f, body] of Object.entries(files)) {
    assert.equal(fs.readFileSync(path.join(SKILL_DIR, '..', '..', 'agents', f), 'utf8'), body, `agents/${f} is stale: run node scripts/review-agents.mjs`);
    assert.match(body, /Read-only: change no file/);
    assert.match(body, /playwright-cli/);
    assert.match(body, /Verdict: ship/);
  }
});

test('landing-patterns.json is generated from ui-ux-pro-max landing.csv, without its colour and effect columns', async () => {
  const { landingDoc, parseCsv } = await import('../scripts/sync-landing.mjs');
  const csv = fs.readFileSync(path.join(SKILL_DIR, '..', 'ui-ux-pro-max', 'data', 'landing.csv'), 'utf8');
  assert.equal(fs.readFileSync(path.join(SKILL_DIR, 'library', 'landing-patterns.json'), 'utf8'), landingDoc(csv), 'stale: run node scripts/sync-landing.mjs');
  const patterns = JSON.parse(landingDoc(csv)).patterns;
  assert.ok(patterns.every((p) => !('color' in p) && !('effects' in p)));
  assert.deepEqual(parseCsv('a,"b, ""c"""\n1,2\n'), [['a', 'b, "c"'], ['1', '2']]);
});
