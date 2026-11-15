// A palette taken from the subject's own picture (the hero still, the client's photograph): its ground, ink
// and accent are the place's lime-wash, timber and terracotta, not a library swatch. Every role is shifted
// in OKLCH lightness until it passes WCAG contrast, so the colours stay the subject's and stay readable.
import { execFileSync } from 'node:child_process';
import { contrast, hexToRgb, oklab } from './color.mjs';

const K = 8;
const ROUNDS = 12;
const SAMPLE_WIDTH = 96;
const MIN_ACCENT_CHROMA = 0.04;
const TEXT = 4.5;
const STRONG = 7;

const enc = (c) => { const v = Math.max(0, Math.min(1, c)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; };

/** OKLab to sRGB in 0..1, unclamped, so a caller can tell when it falls outside the gamut. */
function labToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** OKLCH to hex; chroma is reduced until the colour fits in sRGB. */
export function lchHex(L, C, h) {
  const rad = (h * Math.PI) / 180;
  let lo = 0;
  let hi = C;
  let rgb = labToRgb([L, C * Math.cos(rad), C * Math.sin(rad)]);
  if (!inGamut(rgb)) {
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      const t = labToRgb([L, mid * Math.cos(rad), mid * Math.sin(rad)]);
      if (inGamut(t)) { lo = mid; rgb = t; } else hi = mid;
    }
    rgb = labToRgb([L, lo * Math.cos(rad), lo * Math.sin(rad)]);
  }
  return `#${rgb.map((v) => Math.round(enc(v) * 255).toString(16).padStart(2, '0')).join('')}`;
}

const lch = ([L, a, b]) => [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
const dist = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;

/** k-means in OKLab, seeded by maximin so a small, distinct colour (the tiles) gets its own cluster. Deterministic. */
function clusters(labs) {
  const mean = [0, 1, 2].map((i) => labs.reduce((n, p) => n + p[i], 0) / labs.length);
  let first = labs[0];
  for (const p of labs) if (dist(p, mean) < dist(first, mean)) first = p;
  const seeds = [first];
  while (seeds.length < Math.min(K, labs.length)) {
    let far = null;
    let farD = -1;
    for (const p of labs) { const d = Math.min(...seeds.map((s) => dist(p, s))); if (d > farD) { farD = d; far = p; } }
    if (farD <= 1e-6) break;
    seeds.push(far);
  }
  let centres = seeds.map((s) => [...s]);
  let assign = new Array(labs.length).fill(0);
  for (let round = 0; round < ROUNDS; round += 1) {
    assign = labs.map((p) => { let best = 0; for (let i = 1; i < centres.length; i += 1) if (dist(p, centres[i]) < dist(p, centres[best])) best = i; return best; });
    centres = centres.map((c, i) => {
      const mine = labs.filter((_, j) => assign[j] === i);
      return mine.length ? [0, 1, 2].map((k) => mine.reduce((n, p) => n + p[k], 0) / mine.length) : c;
    });
  }
  return centres
    .map((c, i) => ({ lab: c, lch: lch(c), share: assign.filter((a) => a === i).length / labs.length }))
    .filter((c) => c.share > 0)
    .sort((a, b) => b.share - a.share);
}

const c = (x, y) => contrast(hexToRgb(x), hexToRgb(y));
const HUE_BIN = 20;
const MIN_HUE_SHARE = 0.02;

/**
 * Accent candidates: the picture's chromatic pixels binned by hue, so a roof, a plant and a flower each stand
 * as an option even when k-means folds them into the stone. Each is the bin's median lightness at its upper
 * chroma, ranked by chroma times the square root of its share (the subject's main material first, a flower second); hues within 25 degrees count once.
 */
function accentCandidates(labs) {
  const bins = new Map();
  for (const p of labs) {
    const [L, C, h] = lch(p);
    if (C < MIN_ACCENT_CHROMA || L < 0.2 || L > 0.92) continue;
    const k = Math.floor(h / HUE_BIN);
    if (!bins.has(k)) bins.set(k, []);
    bins.get(k).push([L, C, h]);
  }
  const at = (xs, q) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
  const out = [...bins.values()].filter((b) => b.length / labs.length >= MIN_HUE_SHARE).map((b) => {
    const hx = b.reduce((n, x) => n + Math.cos((x[2] * Math.PI) / 180), 0);
    const hy = b.reduce((n, x) => n + Math.sin((x[2] * Math.PI) / 180), 0);
    return { lch: [at(b.map((x) => x[0]), 0.5), at(b.map((x) => x[1]), 0.75), ((Math.atan2(hy, hx) * 180) / Math.PI + 360) % 360], share: b.length / labs.length };
  }).sort((a, b) => b.lch[1] * Math.sqrt(b.share) - a.lch[1] * Math.sqrt(a.share));
  const gap = (x, y) => { const d = Math.abs(x - y) % 360; return Math.min(d, 360 - d); };
  return out.filter((x, i) => out.findIndex((y) => gap(y.lch[2], x.lch[2]) < 25) === i);
}

/** Step lightness from `L` in `dir` until `ok(hex)` holds; returns the first hex that passes. */
function walk(L, C, h, dir, ok) {
  for (let l = L; l >= 0 && l <= 1; l += dir * 0.01) { const hex = lchHex(l, C, h); if (ok(hex)) return hex; }
  return lchHex(dir < 0 ? 0 : 1, 0, h);
}

/**
 * Roles from pixels ([r,g,b] 0..255). scheme: light | dark. source names the picture in the note.
 * @returns {{ id:string, scheme:string, moods:string[], roles:Record<string,string>, note:string }}
 */
export function derivePalette(pixels, { scheme = 'light', source = 'the subject\'s picture', accent: pickAccent = 1 } = {}) {
  if (!pixels.length) throw new Error('no pixels to take a palette from');
  const labs = pixels.map(oklab);
  const found = clusters(labs);
  const light = scheme !== 'dark';
  const pale = found.filter((x) => x.lch[0] > 0.6);
  const ground = (light && pale.length ? pale : found)[0];
  const darkest = [...found].sort((a, b) => a.lch[0] - b.lch[0])[0];
  const [, gC, gH] = ground.lch;
  const [, iC, iH] = darkest.lch;
  const ranked = accentCandidates(labs);
  const accentFrom = ranked[Math.min(Math.max(1, pickAccent), Math.max(1, ranked.length)) - 1] ?? null;

  const bgC = Math.min(0.02, Math.max(0.004, gC * 0.6));
  const inkC = Math.min(0.03, Math.max(0.005, iC * 0.5));
  const bg = lchHex(light ? 0.965 : 0.18, bgC, gH);
  const surface = lchHex(light ? 0.988 : 0.22, bgC * (light ? 0.5 : 1), gH);
  const line = lchHex(light ? 0.885 : 0.3, bgC * 1.4, gH);
  const ink = light ? walk(0.24, inkC, iH, -1, (x) => c(x, bg) >= STRONG && c(x, surface) >= STRONG)
    : walk(0.95, Math.min(inkC, 0.015), gH, 1, (x) => c(x, bg) >= STRONG && c(x, surface) >= STRONG);
  const muted = light ? walk(0.5, inkC, iH, -1, (x) => c(x, bg) >= TEXT + 0.1 && c(x, surface) >= TEXT + 0.1)
    : walk(0.74, Math.min(inkC, 0.02), gH, 1, (x) => c(x, bg) >= TEXT + 0.1 && c(x, surface) >= TEXT + 0.1);
  const [aL, aC, aH] = accentFrom ? accentFrom.lch : [light ? 0.42 : 0.78, 0.06, gH];
  // A photograph's colours are muted by light and distance; the accent is a signal, so its chroma is lifted a step.
  const accentC = accentFrom ? Math.min(0.15, Math.max(aC * 1.35, 0.1)) : aC;
  const labelOn = (a) => [light ? lchHex(0.99, 0.004, aH) : bg, ink].sort((x, y) => c(y, a) - c(x, a))[0];
  const accent = walk(aL, accentC, aH, light ? -1 : 1, (x) => c(x, bg) >= TEXT && c(labelOn(x), x) >= TEXT);
  const pct = accentFrom ? Math.round(accentFrom.share * 100) : 0;
  return {
    id: 'from-photo',
    scheme: light ? 'light' : 'dark',
    moods: [],
    roles: { bg, surface, ink, muted, line, accent, accentInk: labelOn(accent) },
    accents: ranked.map((x) => ({ hex: lchHex(x.lch[0], x.lch[1], x.lch[2]), share: Math.round(x.share * 100) })),
    note: `Taken from ${source}: the ground from its ${Math.round(ground.share * 100)}% ${ground.lch[0] > 0.6 ? 'pale' : 'main'} tone, `
      + (accentFrom ? `the accent from a colour that covers ${pct}% of it` : 'a quiet accent from its own hue (the picture has no strong colour)')
      + ', every role shifted until it passes contrast.',
  };
}

/** The picture as pixels, scaled down by ffmpeg (no packages). */
export function samplePixels(file) {
  let raw;
  try {
    raw = execFileSync('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-vf', `scale=${SAMPLE_WIDTH}:-1:flags=area`, '-frames:v', '1',
      '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    throw new Error(`could not read ${file} with ffmpeg (${String(err.stderr ?? err.message).trim().split('\n')[0]}); install ffmpeg or pass a palette with --pin palette=<id>`);
  }
  const out = [];
  for (let i = 0; i + 2 < raw.length; i += 3) out.push([raw[i], raw[i + 1], raw[i + 2]]);
  return out;
}
