// The three browser passes: normal (1440 -> 390), reduced motion, no JavaScript.
import path from 'node:path';
import { changed, open, pageHeight, scrollTo, setViewport, settle, shot, sleep, watchRuntime } from './page.mjs';
import { installHelpers } from './helpers.js';
import {
  probeCss, probeDocument, probeFold, probeInvisible, probeLook, probeMotionState, probeControlText, probeMarquees, probeNav, probeOverflow, probeScrubState, probeSticky, probeTargets, probeText,
} from './probes.js';
import { probePhotoColour, probeRichness, probeStickySections } from './probes-richness.js';
import { probeSlop } from './probes-slop.js';

const MAX_SCROLL_PAIRS = 10;

const MOTION_RECORDER = `(() => {
  const seen = new Set(); const t0 = performance.now();
  const note = (el) => { if (el && el.nodeType === 1 && performance.now() - t0 < 4000) seen.add(el); };
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (...a) { note(this); return animate.apply(this, a); };
  addEventListener('animationstart', (e) => note(e.target), true);
  addEventListener('transitionstart', (e) => note(e.target), true);
  new MutationObserver((ms) => { for (const m of ms) note(m.target); })
    .observe(document, { attributes: true, attributeFilter: ['style'], subtree: true });
  window.__craftEntrance = () => [...seen].filter((el) => {
    if (!el.isConnected) return false;
    const r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0 && r.width > 0;
  }).length;
})();`;

async function prepare(browser, { reduced = false, noJs = false } = {}) {
  const s = await browser.newPage();
  for (const m of ['Page.enable', 'Runtime.enable', 'Network.enable']) await s.send(m);
  if (reduced) await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  if (noJs) await s.send('Emulation.setScriptExecutionDisabled', { value: true });
  else await s.send('Page.addScriptToEvaluateOnNewDocument', { source: MOTION_RECORDER });
  return s;
}

/** Scroll the whole page in small steps so in-view observers fire; returns sampled positions. */
async function scrollThrough(s, stepMs) {
  const { h, vh } = await pageHeight(s);
  const max = Math.max(0, h - vh);
  const positions = [];
  for (let y = 0; y <= max + 1; y += Math.round(vh * 0.6)) {
    await scrollTo(s, Math.min(y, max));
    positions.push(Math.min(y, max));
    await sleep(stepMs);
  }
  await scrollTo(s, max);
  await sleep(stepMs * 4);
  return { max, vh };
}

/** Elements invisible at every sampled scroll position (a fade-out at one spot is fine). */
async function alwaysInvisible(s, ys) {
  let common = null;
  for (const y of ys) {
    await scrollTo(s, y);
    await sleep(350);
    const lost = new Set(await s.run(probeInvisible));
    common = common ? new Set([...common].filter((x) => lost.has(x))) : lost;
    if (!common.size) break;
  }
  return [...(common ?? [])];
}

/** Elements that move with the scroll, sampled in pairs spread over the whole page, and the sections they sit in. */
async function scrollLinked(s, max, vh) {
  const linked = new Set();
  const indices = new Set();
  const sections = new Set();
  const pairs = Math.min(MAX_SCROLL_PAIRS, Math.floor(max / vh));
  const step = pairs ? Math.max(vh, (max - vh * 0.5) / pairs) : vh;
  for (let k = 0; k < pairs; k += 1) {
    const y1 = Math.min(max, Math.round((k + 0.5) * step));
    const y2 = Math.min(max, y1 + Math.round(vh * 0.5));
    if (y2 <= y1) continue;
    await scrollTo(s, y1); await sleep(320);
    const a = await s.run(probeMotionState);
    await scrollTo(s, y2); await sleep(320);
    const b = await s.run(probeMotionState);
    await scrollTo(s, y1); await sleep(320);
    const a2 = await s.run(probeMotionState);
    const moved = new Set(changed(a, b));
    const stable = new Set(changed(a, a2));
    for (const i of moved) {
      if (stable.has(i)) continue;
      linked.add(a[i][11]);
      indices.add(i);
      if (a[i][12] >= 0) sections.add(a[i][12]);
    }
  }
  return { linked: [...linked], sections, indices: [...indices] };
}

const MAX_LATE = 12;
/** Scroll-linked elements whose motion is still running between their centre at 35% and at 10% of the screen. */
async function lateScrub(s, indices, vh) {
  const late = new Set();
  for (const i of indices.slice(0, MAX_LATE)) {
    const at = await s.run(probeScrubState, i);
    if (!at || at.h > vh * 1.2) continue;
    const centre = at.top + at.h / 2;
    await scrollTo(s, Math.max(0, Math.round(centre - vh * 0.35))); await sleep(320);
    const a = await s.run(probeScrubState, i);
    await scrollTo(s, Math.max(0, Math.round(centre - vh * 0.1))); await sleep(320);
    const b = await s.run(probeScrubState, i);
    if (a && b && a.state !== b.state) late.add(a.name);
  }
  return [...late];
}

export async function normalPass(browser, url, shotsDir, { selectors = [] } = {}) {
  const s = await prepare(browser);
  const runtime = watchRuntime(s);
  await setViewport(s, 1440);
  const { load } = await open(s, url);
  await sleep(60);
  await s.run(installHelpers);
  const lookEarly = await s.run(probeLook).catch(() => null);
  await sleep(240);
  const shots = [await shot(s, path.join(shotsDir, '1440-early.png'))];
  await settle(s, load, 2200);
  const entrance = await s.run(() => (window.__craftEntrance ? window.__craftEntrance() : 0));
  const facts = {
    doc: await s.run(probeDocument),
    look: await s.run(probeLook),
    lookEarly,
    css: await s.run(probeCss),
    text: { 1440: await s.run(probeText, { minPx: 12 }) },
    overflow: { 1440: await s.run(probeOverflow) },
    fold: { 1440: await s.run(probeFold) },
    nav: { 1440: await s.run(probeNav) },
  };
  shots.push(await shot(s, path.join(shotsDir, '1440.png')));
  const before = await s.run(probeMotionState);
  const { max, vh } = await scrollThrough(s, 70);
  const after = await s.run(probeMotionState);
  facts.richness = await s.run(probeRichness); // after the scroll, so lazy pictures have loaded
  facts.photoColour = await s.run(probePhotoColour);
  facts.slop = await s.run(probeSlop, selectors);
  const reveals = changed(before, after, (row) => Number(row[9]) > vh && Number(row[0]) < 0.2).length;
  const { linked, sections, indices } = await scrollLinked(s, max, vh);
  const late = await lateScrub(s, indices, vh);
  const sticky = await s.run(probeSticky);
  for (const i of await s.run(probeStickySections)) if (i >= 0) sections.add(i);
  const tiles = [];
  for (let k = 1; k <= Math.min(5, Math.floor(max / vh)); k += 1) {
    await scrollTo(s, k * vh);
    await sleep(600);
    tiles.push(await shot(s, path.join(shotsDir, `1440-${String(k).padStart(2, '0')}.png`)));
  }
  const invisibleScrolled = await alwaysInvisible(s, [0, ...tiles.map((_, k) => (k + 1) * vh), max]);
  for (const w of [1280, 768, 390]) {
    await scrollTo(s, 0);
    await setViewport(s, w);
    await sleep(300);
    facts.overflow[w] = await s.run(probeOverflow);
  }
  await sleep(500);
  facts.fold[390] = await s.run(probeFold);
  facts.text[390] = await s.run(probeText, { minPx: 12 });
  facts.targets = await s.run(probeTargets);
  facts.nav[390] = await s.run(probeNav);
  facts.controlText = await s.run(probeControlText);
  facts.marquees = await s.run(probeMarquees);
  shots.push(await shot(s, path.join(shotsDir, '390.png')), ...tiles);
  facts.motion = { entrance, reveals, scrollLinked: linked.length, linkedExamples: linked.slice(0, 4), sticky, scenes: sections.size, late };
  facts.invisible = { scrolled: invisibleScrolled };
  facts.consoleErrors = runtime.consoleErrors;
  facts.network = runtime.network;
  s.close();
  return { facts, shots };
}

export async function reducedPass(browser, url) {
  const s = await prepare(browser, { reduced: true });
  await setViewport(s, 1440);
  const { load } = await open(s, url);
  await settle(s, load, 900);
  const playing = await s.run(() => [...document.querySelectorAll('video')].filter((v) => !v.paused && !v.ended)
    .map((v) => (v.currentSrc || 'video').split('/').pop()));
  const { max } = await scrollThrough(s, 40);
  const lost = await alwaysInvisible(s, [0, max]);
  s.close();
  return { lost, playing };
}

export async function noJsPass(browser, url) {
  const s = await prepare(browser, { noJs: true });
  await setViewport(s, 1440);
  const { load } = await open(s, url);
  await settle(s, load, 500);
  const textLength = await s.run(() => document.body?.innerText.trim().length ?? 0);
  const { max } = await pageHeight(s).then(({ h, vh }) => ({ max: Math.max(0, h - vh) }));
  const lost = await alwaysInvisible(s, [0, max]);
  s.close();
  return { lost, textLength };
}
