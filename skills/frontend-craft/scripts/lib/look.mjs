// The look the model chose (colours and type), checked and completed. The model decides with ui-ux-pro-max and the
// subject; this file only derives the roles it did not set and says what breaks the method in references/color-type.md.
// Pure: no files, no browser.
import fs from 'node:fs';
import { contrast, hexToRgb, oklab } from './color.mjs';
import { lchHex } from './palette-from.mjs';

const HEX = /^#[0-9a-f]{6}$/i;
const f = (level, id, msg) => ({ level, id, msg });

/** OKLCH of a hex colour: L 0..1, C, h in degrees. */
export function oklchOf(hex) {
  const [L, a, b] = oklab(hexToRgb(hex));
  return { L, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
}

/** Mix two colours in OKLab: t = 0 is a, 1 is b. */
export function mixHex(a, b, t) {
  const [x, y] = [oklab(hexToRgb(a)), oklab(hexToRgb(b))];
  const [L, A, B] = x.map((v, i) => v + (y[i] - v) * t);
  return lchHex(L, Math.hypot(A, B), (Math.atan2(B, A) * 180) / Math.PI);
}

const ratio = (a, b) => contrast(hexToRgb(a), hexToRgb(b));

/** The muted text colour: the ink pulled toward the ground until it would drop under 4.5:1, then held there. */
function mutedFor(bg, ink) {
  let best = ink;
  for (let t = 0.1; t <= 0.6; t += 0.05) {
    const c = mixHex(ink, bg, t);
    if (ratio(c, bg) < 4.6) break;
    best = c;
  }
  return best;
}

/** Every role the kit uses, from the three the model must choose (ground, ink, accent) and any it chose beyond them. */
export function buildRoles({ bg, ink, accent, surface, muted, line, accentInk }) {
  for (const [k, v] of Object.entries({ bg, ink, accent })) if (!HEX.test(v ?? '')) throw new Error(`--${k} must be a hex colour like #1a1a1a, got "${v ?? ''}"`);
  const dark = oklchOf(bg).L < oklchOf(ink).L;
  return {
    scheme: dark ? 'dark' : 'light',
    roles: {
      bg, ink, accent,
      surface: surface ?? mixHex(bg, ink, dark ? 0.06 : 0.035),
      muted: muted ?? mutedFor(bg, ink),
      line: line ?? mixHex(bg, ink, dark ? 0.18 : 0.12),
      accentInk: accentInk ?? (ratio(bg, accent) >= ratio(ink, accent) ? bg : ink),
    },
  };
}

export const VIOLET = [270, 330];
// Measured: #fbfaf7 (L .985, C .004) and #f7f6f2 pass as a white ground; cream #f6f1e7 (C .014) and #f4e6d0 do not;
// #151413 and #231e18 pass as black ink; brown #3b2a1a and slate #0f172a do not.
const SOBER = { groundMaxC: 0.012, inkMaxC: 0.025, lightMinL: 0.95, darkMaxL: 0.24, inkDarkMaxL: 0.3, inkLightMinL: 0.92, accentMinC: 0.07 };

/**
 * What breaks the colour method. sober (the default): a white or near-white ground, a near-black ink (or the reverse),
 * and one accent with life. colour: the user or the brand asked for coloured grounds; only contrast and violet apply.
 */
export function paletteFindings({ roles }, { mode = 'sober', allowViolet = false } = {}) {
  const out = [];
  const [bg, ink, acc] = [roles.bg, roles.ink, roles.accent].map(oklchOf);
  const pair = (a, b, min, id, what) => { const r = ratio(a, b); if (r < min) out.push(f('FAIL', id, `${what} is ${r.toFixed(2)}:1, needs ${min}:1`)); };
  pair(roles.ink, roles.bg, 4.5, 'contrast-ink', 'ink on the ground');
  pair(roles.muted, roles.bg, 4.5, 'contrast-muted', 'muted text on the ground');
  pair(roles.accentInk, roles.accent, 4.5, 'contrast-accent-ink', 'text on the accent');
  pair(roles.accent, roles.bg, 3, 'contrast-accent', 'the accent against the ground (a button edge, a link)');
  if (ratio(roles.ink, roles.bg) < 7) out.push(f('WARN', 'contrast-soft', `ink on the ground is ${ratio(roles.ink, roles.bg).toFixed(2)}:1; a sober page reads best at 7:1 or more`));
  if (!allowViolet && acc.C > 0.06 && acc.h >= VIOLET[0] && acc.h <= VIOLET[1]) out.push(f('FAIL', 'accent-violet', `the accent ${roles.accent} is violet or purple, the colour every AI-made page reaches for; take the accent from the subject (pass --allow-violet only when the brand is violet)`));
  if (acc.L > 0.85 && acc.C > 0.2) out.push(f('FAIL', 'accent-neon', `the accent ${roles.accent} is neon; take a deeper version of it`));
  if (mode === 'sober') {
    const light = bg.L >= ink.L;
    if (light ? bg.L < SOBER.lightMinL : bg.L > SOBER.darkMaxL) out.push(f('FAIL', 'ground-not-sober', `the ground ${roles.bg} is ${light ? 'not near white' : 'not near black'} (L ${bg.L.toFixed(2)}); a sober page sits on white or near-white (or near-black), and colour comes from the accent and the photographs`));
    if (bg.C > SOBER.groundMaxC) out.push(f('FAIL', 'ground-tinted', `the ground ${roles.bg} is tinted (chroma ${bg.C.toFixed(3)}): cream, beige or a colour; keep it white or near-white with at most a hint of warm or cool (chroma under ${SOBER.groundMaxC}, e.g. #fbfaf7)`));
    if (ink.C > SOBER.inkMaxC || (light ? ink.L > SOBER.inkDarkMaxL : ink.L < SOBER.inkLightMinL)) out.push(f('FAIL', 'ink-not-black', `the ink ${roles.ink} is not a near-black (L ${ink.L.toFixed(2)}, chroma ${ink.C.toFixed(3)}); text is black or near-black (e.g. #151413), and the colour lives in the accent`));
    if (acc.C < SOBER.accentMinC) out.push(f('FAIL', 'accent-dull', `the accent ${roles.accent} has almost no colour (chroma ${acc.C.toFixed(3)}); it is the one colour that gives the page life`));
  }
  return out;
}

/** Google Fonts families from ui-ux-pro-max's data: name -> { category, weights, italic, rank }. */
export function loadFonts(csvFile) {
  if (!csvFile || !fs.existsSync(csvFile)) return null;
  const rows = fs.readFileSync(csvFile, 'utf8').split('\n').slice(1).filter(Boolean);
  const fonts = new Map();
  for (const row of rows) {
    const cells = row.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')) ?? [];
    const [family, category, , , , styles, axes, , , rank] = cells;
    if (!family) continue;
    const weights = [...new Set((styles ?? '').split('|').map((s) => Number.parseInt(s, 10)).filter(Number.isFinite))];
    fonts.set(family.toLowerCase(), { family, category: (category ?? '').toLowerCase(), weights, variable: /wght/.test(axes ?? ''), rank: Number(rank) || null });
  }
  return fonts;
}

/** Display faces seen on most AI-made pages: fine as text, a tell as the headline face. */
export const OVERUSED_DISPLAY = ['inter', 'roboto', 'poppins', 'montserrat', 'open sans', 'lato', 'playfair display', 'space grotesk', 'instrument serif'];

export function typeFindings({ display, text }, fonts) {
  const out = [];
  if (!fonts) return [f('WARN', 'fonts-unchecked', 'no font list to check against (ui-ux-pro-max not installed next to this skill); make sure both families exist on Google Fonts')];
  for (const [role, face] of [['display', display], ['text', text]]) {
    const known = fonts.get(face.family.toLowerCase());
    if (!known) { out.push(f('FAIL', `font-unknown-${role}`, `"${face.family}" is not on Google Fonts; check the spelling (ui-ux-pro-max search.py "<words>" --domain google-fonts)`)); continue; }
    const missing = known.variable ? [] : face.weights.filter((w) => !known.weights.includes(w));
    if (missing.length) out.push(f('FAIL', `font-weight-${role}`, `"${known.family}" has no weight ${missing.join(', ')} (it has ${known.weights.join(', ')})`));
  }
  if (OVERUSED_DISPLAY.includes(display.family.toLowerCase())) out.push(f('WARN', 'font-overused', `"${display.family}" as the headline face is what most generated pages use; pick a face with the subject's character for headlines and keep it for text if you like`));
  if (fonts.get(text.family.toLowerCase())?.category === 'display' || fonts.get(text.family.toLowerCase())?.category === 'handwriting') out.push(f('FAIL', 'font-text-display', `"${text.family}" is a display or handwriting face; body text needs a text face`));
  return out;
}

/** The type object the kit's token and font writers read. */
export function buildType({ display, displayWeights, text, textWeights, mono, tracking, leading, upper, fonts }) {
  if (!display || !text) throw new Error('--display and --text are required: the headline face and the text face (they may be the same family)');
  const serif = (fam) => /serif/.test(fonts?.get(fam.toLowerCase())?.category ?? '') && !/sans/.test(fonts?.get(fam.toLowerCase())?.category ?? '');
  const isSerif = serif(display);
  return {
    id: 'chosen',
    display: { family: display, weights: displayWeights ?? [isSerif ? 500 : 700], tracking: tracking ?? (isSerif ? '-0.015em' : '-0.035em'), leading: leading ?? (isSerif ? 1.02 : 0.95), case: upper ? 'uppercase' : 'none', serif: isSerif },
    text: { family: text, weights: textWeights ?? [400, 500, 600] },
    ...(mono ? { mono: { family: mono, weights: [400, 500] } } : {}),
  };
}

const OKLCH = /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/;
const hexOf = (value) => {
  const m = OKLCH.exec(value ?? '');
  if (m) return lchHex(Number(m[1]) / 100, Number(m[2]), Number(m[3]));
  const h = /#[0-9a-f]{6}\b/i.exec(value ?? '');
  return h ? h[0].toLowerCase() : null;
};
const token = (text, name) => new RegExp(`${name}:\\s*([^;]+);`).exec(text)?.[1]?.trim() ?? null;
const firstFamily = (value) => /"([^"]+)"/.exec(value ?? '')?.[1] ?? (value ?? '').split(',')[0].trim();

/**
 * A Hallmark theme (skills/hallmark/references/themes/<slug>.md) as a look for the kit: its paper, ink, rule and
 * accent tokens, its colourway when one is named, its faces and the font links it ships. The theme stays as designed;
 * the kit's names are a mapping, not a redesign.
 */
export function themeLook(text, colourway = null) {
  const look = {
    bg: hexOf(token(text, '--color-paper')), surface: hexOf(token(text, '--color-paper-2')), ink: hexOf(token(text, '--color-ink')),
    muted: hexOf(token(text, '--color-muted')), line: hexOf(token(text, '--color-rule')), accent: hexOf(token(text, '--color-accent')),
    accentInk: hexOf(token(text, '--color-accent-ink')),
    display: firstFamily(token(text, '--font-display')), text: firstFamily(token(text, '--font-body')),
    displayWeight: Number(token(text, '--display-weight')) || null, tracking: token(text, '--tracking-display'),
    links: [...text.matchAll(/<link [^>]*href="https:\/\/(?:fonts\.googleapis\.com|api\.fontshare\.com)[^>]*>/g)].map((m) => m[0]).join('\n') || null,
  };
  if (colourway) {
    const row = text.split('\n').find((l) => l.startsWith(`| \`${colourway}\``));
    if (!row) throw new Error(`the theme has no colourway "${colourway}"`);
    const [ground, ink, accent] = row.split('|').slice(2, 5).map(hexOf);
    Object.assign(look, { bg: ground ?? look.bg, ink: ink ?? look.ink, accent: accent ?? look.accent, surface: undefined, muted: undefined, line: undefined, accentInk: undefined });
  }
  for (const k of ['bg', 'ink', 'accent']) if (!look[k]) throw new Error(`the theme has no ${k} token this script can read`);
  return look;
}
