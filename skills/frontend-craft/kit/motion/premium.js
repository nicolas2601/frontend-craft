// The motion system award-winning sites share. Probed 2026-11-16 on four Awwwards Sites of the Day in hospitality
// and food (Tengile Malamala, Delta Cafés, White Desert, Don Molinico): every one runs Lenis smooth scroll, and
// their reveals use expo-out, cubic-bezier(0.19, 1, 0.22, 1), over 0.8-1.2 s. The same few moves on every section,
// done well, are what reads as premium: headings rise line by line from a mask, pictures unveil and settle, the page
// ground changes colour with the section. Durations and easing live in premium.css.
import { markDone } from './context.js';
import { splitWords } from './split.js';

const LENIS_SPEC = 'lenis';

/** Index of the visual line each word sits on (words whose tops match share a line). */
function lineIndexes(words) {
  let line = -1;
  let top = null;
  return words.map((w) => {
    const t = w.offsetTop;
    if (top === null || Math.abs(t - top) > 2) { line += 1; top = t; }
    return line;
  });
}

// data-lines: a heading or a lede rises into view line by line, each word from behind its own mask, the words of one
// line together. Under reduced motion the text is simply there.
function lines(el, ctx) {
  if (ctx.reduced) { markDone(el); return null; }
  const split = splitWords(el);
  for (const w of split.words) {
    if (w.closest('small')) continue;
    const mask = document.createElement('span');
    mask.className = 'craft-mask';
    w.before(mask);
    mask.append(w);
  }
  const number = () => lineIndexes(split.words).forEach((i, k) => split.words[k].style.setProperty('--i', String(i)));
  number();
  el.setAttribute('data-lines-ready', '');
  const onResize = () => { if (!el.hasAttribute('data-craft-on')) number(); };
  window.addEventListener('resize', onResize, { passive: true });
  // In a section with its own ground the words arrive with their colour: they rise once the section holds the middle
  // of the screen (when the ground changes), never on the neighbour's colour.
  const owner = el.closest('[data-ground]');
  const stop = owner
    ? ctx.once(owner, () => el.setAttribute('data-craft-on', ''), { margin: '-50% 0px -50% 0px' })
    : ctx.once(el, () => el.setAttribute('data-craft-on', ''), { margin: '0px 0px -8% 0px' });
  return () => {
    stop?.();
    window.removeEventListener('resize', onResize);
    el.removeAttribute('data-lines-ready');
    el.removeAttribute('data-craft-on');
    split.restore();
  };
}

// data-unveil (up | down | left | right, default up): a picture or a frame opens from one edge while the picture inside
// settles from a slight zoom. Put it on the frame (figure, a div with an img or video).
function unveil(el, ctx) {
  if (ctx.reduced) { markDone(el); return null; }
  el.setAttribute('data-unveil-ready', '');
  const stop = ctx.once(el, () => el.setAttribute('data-craft-on', ''), { margin: '0px 0px -10% 0px' });
  return () => { stop?.(); el.removeAttribute('data-unveil-ready'); el.removeAttribute('data-craft-on'); };
}

// data-ground="<colour>" (and data-ink="<colour>") on sections: the page's ground eases to the colour of the section
// that holds the middle of the screen; the section's own words take its ink. Keep a section's words clear of its
// edges (its padding) so they never sit on the neighbour's colour while it changes. With no such section there, the page's own ground returns. A colour change is
// not movement, so it runs under reduced motion too. Without JavaScript every section sits on the page's ground.
const grounded = new Set();
function showGround(root) {
  const last = [...grounded].at(-1);
  if (last) root.style.setProperty('--page-ground', last.dataset.ground);
  else root.style.removeProperty('--page-ground');
}
function ground(el, ctx) {
  const root = document.documentElement;
  if (el.dataset.ink) el.style.color = el.dataset.ink;
  const stop = ctx.watch(el, (visible) => {
    if (visible) grounded.add(el); else grounded.delete(el);
    showGround(root);
  }, { margin: '-50% 0px -50% 0px' });
  root.setAttribute('data-grounds', '');
  return () => { stop?.(); grounded.delete(el); el.style.removeProperty('color'); showGround(root); root.removeAttribute('data-grounds'); };
}

async function loadLenis(ctx) {
  const mod = ctx.libs.lenis ? await ctx.libs.lenis() : await import(/* @vite-ignore */ LENIS_SPEC);
  return mod.default ?? mod.Lenis;
}

// data-smooth on <html>: Lenis smooth scroll with inertia, anchor links included. It needs "lenis" in the import map
// (plain HTML) or init(document, { libs: { lenis: () => import('lenis') } }); without it the page scrolls natively.
function smooth(el, ctx) {
  if (ctx.reduced) return null;
  let lenis = null;
  let alive = true;
  loadLenis(ctx)
    .then((Lenis) => { if (alive && Lenis) lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 }); })
    .catch((err) => console.warn('[craft] data-smooth scrolls natively:', err?.message ?? err));
  return () => { alive = false; lenis?.destroy(); };
}

export const premium = { lines, unveil, ground, smooth };
