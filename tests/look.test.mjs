// The look the model chooses: roles derived from ground, ink and accent; the sober method; fonts that exist.
import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { contrast, hexToRgb } from '../skills/frontend-craft/scripts/lib/color.mjs';
import { buildRoles, buildType, loadFonts, paletteFindings, typeFindings } from '../skills/frontend-craft/scripts/lib/look.mjs';
import { evaluateLook } from '../skills/frontend-craft/scripts/design.mjs';

const fonts = loadFonts(path.resolve('skills/ui-ux-pro-max/data/google-fonts.csv'));
const ids = (xs) => xs.map((x) => `${x.level}:${x.id}`);

test('the roles the model did not set are derived and readable', () => {
  const { scheme, roles } = buildRoles({ bg: '#fbfaf7', ink: '#151413', accent: '#9a4a2c' });
  assert.equal(scheme, 'light');
  for (const [fg, bg] of [[roles.ink, roles.bg], [roles.muted, roles.bg], [roles.accentInk, roles.accent]]) assert.ok(contrast(hexToRgb(fg), hexToRgb(bg)) >= 4.5, `${fg} on ${bg}`);
  assert.deepEqual(paletteFindings({ roles }), []);
  assert.equal(buildRoles({ bg: '#121212', ink: '#f2f1ed', accent: '#e0a458' }).scheme, 'dark');
  assert.throws(() => buildRoles({ bg: 'white', ink: '#000000', accent: '#ff0000' }), /--bg must be a hex/);
});

test('the sober method refuses cream grounds, brown or navy ink, dull, violet or neon accents', () => {
  const find = (bg, ink, accent, opts) => ids(paletteFindings(buildRoles({ bg, ink, accent }), opts));
  assert.ok(find('#f6f1e7', '#151413', '#9a4a2c').includes('FAIL:ground-tinted'));
  assert.ok(find('#ffffff', '#3b2a1a', '#9a4a2c').includes('FAIL:ink-not-black'));
  assert.ok(find('#ffffff', '#0f172a', '#9a4a2c').includes('FAIL:ink-not-black'));
  assert.ok(find('#ffffff', '#151413', '#7c3aed').includes('FAIL:accent-violet'));
  assert.ok(find('#ffffff', '#151413', '#6b6b6b').includes('FAIL:accent-dull'));
  assert.deepEqual(find('#f6f1e7', '#3b2a1a', '#9a4a2c', { mode: 'colour' }), [], 'colour mode checks contrast only');
  assert.deepEqual(find('#ffffff', '#151413', '#7c3aed', { allowViolet: true }), []);
});

test('fonts must exist with those weights; a display face cannot set the text; the usual headline faces warn', () => {
  assert.ok(fonts && fonts.size > 1000, 'the Google Fonts list from ui-ux-pro-max');
  assert.deepEqual(typeFindings(buildType({ display: 'Fraunces', text: 'Instrument Sans', fonts }), fonts), []);
  assert.ok(ids(typeFindings(buildType({ display: 'Frauncess', text: 'Inter', fonts }), fonts)).includes('FAIL:font-unknown-display'));
  assert.ok(ids(typeFindings(buildType({ display: 'Inter', text: 'Lobster', fonts }), fonts)).includes('FAIL:font-text-display'));
  assert.ok(ids(typeFindings(buildType({ display: 'Poppins', text: 'Inter', fonts }), fonts)).includes('WARN:font-overused'));
  assert.equal(buildType({ display: 'Fraunces', text: 'Inter', fonts }).display.serif, true);
});

test('design.mjs needs a reason and warns on a framework default accent', () => {
  const look = evaluateLook({ bg: '#ffffff', ink: '#111111', accent: '#2563eb', display: 'Fraunces', text: 'Inter' }, fonts);
  assert.ok(ids(look.findings).includes('FAIL:why-missing'));
  assert.ok(ids(look.findings).includes('WARN:accent-default'));
});
