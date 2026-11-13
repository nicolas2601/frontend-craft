// The deal: pick a palette, a type pairing, a composition and motion from the library,
// weighted by mood and kind, skipping what recent deals already used. Pure given an rng.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hexToRgb, isCream } from './color.mjs';

const LIB = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'library');
export const RECENT = 6;
export const SCROLL_STORIES = ['scroll-words', 'stack', 'scrub', 'rail'];
export const KINDS = ['landing', 'product', 'portfolio', 'event', 'venue', 'brand', 'campaign', 'app', 'docs'];

export function loadLibrary(dir = LIB) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  return {
    palettes: read('palettes.json').palettes,
    pairings: read('type.json').pairings,
    compositions: read('compositions.json').compositions,
    signatures: read('signatures.json').signatures,
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

function recentIds(history, key) {
  return new Set(history.slice(-RECENT).map((h) => h[key]).filter(Boolean));
}

/**
 * @param {{ lib, kind:string, moods:string[], history?:object[], rng:() => number, pins?:object, brand?:boolean }} o
 */
export function deal({ lib, kind, moods, history = [], rng, pins = {}, brand = false }) {
  const byId = (list, id) => list.find((x) => x.id === id) ?? null;
  const palette = brand ? null : (byId(lib.palettes, pins.palette)
    ?? pick(lib.palettes, { moods, rng, recent: recentIds(history, 'palette') }));
  const creamBg = palette && isCream(hexToRgb(palette.roles.bg));
  const type = brand ? null : (byId(lib.pairings, pins.type)
    ?? pick(lib.pairings, { moods, rng, recent: recentIds(history, 'type'), allow: (p) => !(creamBg && p.display.serif) }));
  const composition = byId(lib.compositions, pins.composition)
    ?? pick(lib.compositions, { rng, recent: recentIds(history, 'composition'), allow: (c) => c.kinds.includes(kind) });

  const candidates = composition.signatures;
  const recentSig = recentIds(history, 'signature');
  const signature = pins.signature && candidates.includes(pins.signature) ? pins.signature
    : pick(candidates.map((id) => ({ id })), { rng, recent: recentSig }).id;
  const supports = candidates.filter((s) => s !== signature).sort(() => rng() - 0.5).slice(0, 2);
  const persuade = !['app', 'docs'].includes(kind);
  if (persuade && ![signature, ...supports].some((s) => SCROLL_STORIES.includes(s))) supports[1] = SCROLL_STORIES[Math.floor(rng() * 3)];

  const sig = (id) => lib.signatures.find((s) => s.id === id);
  return {
    version: 1,
    kind,
    moods,
    brand,
    palette,
    type,
    composition,
    motion: { signature: sig(signature), supports: supports.map(sig) },
  };
}

export function historyFile() {
  const base = process.env.XDG_STATE_HOME
    ?? (process.platform === 'win32' ? process.env.LOCALAPPDATA : path.join(process.env.HOME ?? '.', '.local', 'state'));
  return path.join(base ?? '.', 'frontend-craft', 'history.json');
}

export function summarize(d) {
  return { palette: d.palette?.id, type: d.type?.id, composition: d.composition.id, signature: d.motion.signature.id };
}
