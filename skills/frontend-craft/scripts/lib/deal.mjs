// The deal: pick an art direction, a palette, a type pairing, a composition and motion from the
// library, weighted by mood and kind, skipping what recent deals already used. Pure given an rng.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hexToRgb, isCream } from './color.mjs';

const LIB = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'library');
export const RECENT = 6;
export const RECENT_DIRECTIONS = 4;
const MIN_NEAR = 3;
/** How often a website is dealt a direction outside the subject's usual moods, on purpose. */
export const RISK = { safe: 0, bold: 0.4, wild: 0.8 };
export const SET_PIECES = ['iris', 'type-pass', 'zoom', 'curtain', 'fan', 'letters', 'develop', 'tilt', 'split'];
export const SCROLL_STORIES = ['scroll-words', 'stack', 'scrub', 'rail'];
export const KINDS = ['landing', 'product', 'portfolio', 'event', 'venue', 'brand', 'campaign', 'app', 'docs'];

export function loadLibrary(dir = LIB) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  return {
    palettes: read('palettes.json').palettes,
    pairings: read('type.json').pairings,
    compositions: read('compositions.json').compositions,
    signatures: read('signatures.json').signatures,
    directions: read('directions.json').directions,
  };
}

export function moodsOf(lib) {
  return [...new Set([...lib.palettes, ...lib.pairings].flatMap((x) => x.moods))].sort();
}

/** Deterministic PRNG so a seed reproduces a deal. */
export function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Weighted pick: score by overlap, drop recently used ids unless nothing else is left. */
function pick(items, { moods = [], recent = new Set(), rng, allow = () => true }) {
  const allowed = items.filter(allow);
  const pool0 = allowed.length ? allowed : items;
  const scored = pool0.map((it) => ({ it, w: 1 + 3 * (it.moods ?? []).filter((m) => moods.includes(m)).length }));
  const matching = moods.length ? scored.filter((s) => s.w > 1) : scored;
  // Novelty beats a perfect mood match: when every on-mood item was used recently, widen to the
  // whole list (mood still weighs in) before ever repeating a recent pick.
  const freshMatching = matching.filter((s) => !recent.has(s.it.id));
  const freshAll = scored.filter((s) => !recent.has(s.it.id));
  const pool = freshMatching.length ? freshMatching : freshAll.length ? freshAll : scored;
  const total = pool.reduce((n, s) => n + s.w, 0);
  let r = rng() * total;
  for (const s of pool) { r -= s.w; if (r <= 0) return s.it; }
  return pool.at(-1).it;
}

/** Type must speak the palette's language: share a mood with it, and no serif display on a cream ground. */
export function typeFits(pairing, palette, creamBg) {
  if (creamBg && pairing.display.serif) return false;
  return !palette || pairing.moods.some((m) => palette.moods.includes(m));
}

function recentIds(history, key, n = RECENT) {
  return new Set(history.slice(-n).map((h) => h[key]).filter(Boolean));
}

function shuffled(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The art direction. With probability RISK[risk] it is taken from outside the subject's moods, so
 * the same brief does not always land on the same look; the last few directions are never repeated.
 */
export function pickDirection(directions, { moods = [], history = [], rng, risk = 'bold', pin }) {
  const pinned = directions.find((d) => d.id === pin);
  if (pinned) return { direction: pinned, wildcard: false };
  const recent = recentIds(history, 'direction', RECENT_DIRECTIONS);
  const fresh = directions.filter((d) => !recent.has(d.id));
  const pool = fresh.length ? fresh : directions;
  const onMood = (d) => d.moods.some((m) => moods.includes(m));
  const near = moods.length ? pool.filter(onMood) : [...pool];
  const far = moods.length ? pool.filter((d) => !onMood(d)) : [];
  // A subject that matches one or two directions would get the same look every time: unless the
  // risk is safe, the near pool always holds at least MIN_NEAR directions.
  if (risk !== 'safe') for (const d of shuffled(far, rng)) { if (near.length >= MIN_NEAR) break; near.push(d); }
  const goFar = far.length > 0 && (near.length === 0 || rng() < (RISK[risk] ?? RISK.bold));
  const from = goFar ? far : near;
  const direction = from[Math.floor(rng() * from.length)];
  return { direction, wildcard: moods.length > 0 && !onMood(direction) };
}

/**
 * @param {{ lib, kind:string, moods:string[], history?:object[], rng:() => number, pins?:object, brand?:boolean }} o
 */
export function deal({ lib, kind, moods, history = [], rng, pins = {}, brand = false, risk = 'bold' }) {
  const byId = (list, id) => list.find((x) => x.id === id) ?? null;
  const persuade = !['app', 'docs'].includes(kind);
  const dealt = persuade && lib.directions?.length
    ? pickDirection(lib.directions, { moods, history, rng, risk, pin: pins.direction })
    : { direction: null, wildcard: false };
  const { direction, wildcard } = dealt;
  // A wildcard direction brings its own moods; otherwise the subject's moods lead (the direction's when none are given).
  const lead = (own) => (wildcard ? own : moods.length ? moods : own ?? moods);
  const paletteMoods = lead(direction?.moods);
  const typeMoods = lead(direction?.typeMoods);
  const scheme = direction && direction.scheme !== 'any' ? direction.scheme : null;
  const palette = brand ? null : (byId(lib.palettes, pins.palette)
    ?? pick(lib.palettes, { moods: paletteMoods, rng, recent: recentIds(history, 'palette'), allow: (p) => !scheme || p.scheme === scheme }));
  const creamBg = palette && isCream(hexToRgb(palette.roles.bg));
  const serifOk = (p) => direction?.serif == null || p.display.serif === direction.serif;
  const type = brand ? null : (byId(lib.pairings, pins.type)
    ?? pick(lib.pairings, { moods: typeMoods, rng, recent: recentIds(history, 'type'), allow: (p) => typeFits(p, palette, creamBg) && serifOk(p) }));
  const composition = byId(lib.compositions, pins.composition)
    ?? pick(lib.compositions, { rng, recent: recentIds(history, 'composition'), allow: (c) => c.kinds.includes(kind) });

  const candidates = composition.signatures;
  const recentSig = recentIds(history, 'signature');
  const signature = pins.signature && lib.signatures.some((x) => x.id === pins.signature) ? pins.signature
    : pick(candidates.map((id) => ({ id })), { rng, recent: recentSig }).id;
  const supportPool = (direction?.supports ?? candidates).filter((s) => s !== signature && lib.signatures.some((x) => x.id === s));
  const supports = shuffled(supportPool, rng).slice(0, 2);
  if (persuade && ![signature, ...supports].some((s) => SCROLL_STORIES.includes(s))) supports[1] = SCROLL_STORIES[Math.floor(rng() * 3)];

  const sig = (id) => lib.signatures.find((s) => s.id === id);
  const setPieces = direction ? shuffled(direction.setPieces, rng).slice(0, 2) : [];
  return {
    version: 2,
    kind,
    moods,
    brand,
    risk: direction ? risk : null,
    direction,
    wildcard,
    palette,
    type,
    composition,
    motion: { signature: sig(signature), supports: supports.map(sig), setPieces },
  };
}

export function historyFile() {
  const base = process.env.XDG_STATE_HOME
    ?? (process.platform === 'win32' ? process.env.LOCALAPPDATA : path.join(process.env.HOME ?? '.', '.local', 'state'));
  return path.join(base ?? '.', 'frontend-craft', 'history.json');
}

export function summarize(d) {
  return { direction: d.direction?.id, palette: d.palette?.id, type: d.type?.id, composition: d.composition.id, signature: d.motion.signature.id };
}
