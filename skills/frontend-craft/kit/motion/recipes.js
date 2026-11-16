// Section recipes: finished, tested patterns a studio would build for a real subject. Each one is a whole section,
// works without its JavaScript (a readable, static layout), holds its final state under reduced motion, and runs
// only while near the screen. Markup and when to use each: references/recipes.md.
//   data-dive       the hero's picture or video; scrolling flies forward into it while the words step aside
//   data-journey    a pinned horizontal journey: photographs pass and two lines of type cross in opposite ways
//   data-carousel   a row of cards that snaps, drags, and answers arrow buttons and keys, with a live count
//   data-sequence   frames of a real clip scrubbed by scroll (Apple style), with steps that light up in turn
import { clamp, pinned } from './context.js';
import { framePlayer } from './frames.js';

const DIVE_DEPTH = 0.85;
const NARROW = 0.9; // a stage narrower than this (width / height) is a phone held upright
const JOURNEY_LINE_TRAVEL = 0.45;
const KEY_STEP = { ArrowLeft: -1, ArrowRight: 1 };

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// The hero picture fills the first screen; scrolling flies the camera forward into it, toward data-focus. With
// data-frames (a manifest from scripts/media.mjs frames) the camera's own clip plays on a canvas over the picture as
// the page scrolls; data-frames-narrow names a portrait set for a phone. The picture stays as the first paint, the
// reduced-motion view and the fallback.
function dive(el, ctx) {
  const set = (p) => {
    el.style.setProperty('--p', p.toFixed(4));
    el.style.setProperty('--pe', easeInOut(p).toFixed(4));
  };
  const depth = Number.parseFloat(el.dataset.dive);
  el.style.setProperty('--dive-depth', String(Number.isFinite(depth) ? depth : DIVE_DEPTH));
  if (ctx.reduced) { set(0); el.classList.add('r-still'); return () => el.classList.remove('r-still'); }
  const clip = diveFrames(el);
  const stop = ctx.scrub(el, (vh) => { const p = pinned(el, vh); set(p); clip?.show(p); });
  return () => { stop(); clip?.stop(); ['--p', '--pe', '--dive-depth'].forEach((k) => el.style.removeProperty(k)); };
}

/** The clip of a data-frames hero, the portrait set while the stage is taller than wide; null without frames. */
function diveFrames(el) {
  const media = el.querySelector('.r-dive__media');
  if (!el.dataset.frames || !media) return null;
  const own = !media.querySelector('canvas');
  const canvas = media.querySelector('canvas') ?? media.appendChild(document.createElement('canvas'));
  canvas.setAttribute('aria-hidden', 'true');
  const pick = () => (el.dataset.framesNarrow && media.clientWidth / Math.max(1, media.clientHeight) < NARROW ? el.dataset.framesNarrow : el.dataset.frames);
  let url = pick();
  let p = 0;
  let player = framePlayer(canvas, url, { onReady: () => player.show(p), onFail: (err) => console.warn('[craft] data-frames: manifest not loaded', err) });
  const onResize = () => {
    if (pick() === url) { player.size(); return; }
    player.stop();
    url = pick();
    player = framePlayer(canvas, url, { onReady: () => player.show(p) });
  };
  window.addEventListener('resize', onResize, { passive: true });
  return {
    show(next) { p = next; player.show(p); },
    stop() { player.stop(); window.removeEventListener('resize', onResize); if (own) canvas.remove(); },
  };
}

// A pinned stage: the photograph track moves left by its own overflow while each [data-line] crosses the stage at
// data-speed (negative: right to left). The section's height is set from the track so the pass ends with the track.
function journey(el, ctx) {
  const stage = el.querySelector('.r-journey__stage') ?? el;
  const track = el.querySelector('.r-journey__track');
  const lines = [...el.querySelectorAll('[data-line]')];
  const bar = el.querySelector('.r-journey__progress > span');
  if (!track) return null;
  let distance = 0;
  let stop = null;
  const measure = () => {
    stop?.();
    stop = null;
    el.style.removeProperty('height');
    track.style.removeProperty('translate');
    lines.forEach((l) => l.style.removeProperty('translate'));
    if (ctx.reduced) { el.classList.add('r-still'); return; }
    el.classList.remove('r-still');
    distance = Math.max(0, track.scrollWidth - stage.clientWidth);
    el.style.height = `${Math.round(distance + window.innerHeight * 1.2)}px`;
    stop = ctx.scrub(el, (vh) => {
      const p = pinned(el, vh);
      track.style.translate = `${(-p * distance).toFixed(1)}px 0`;
      // Each line is centred in the stage halfway through the pass (whole when it fits) and crosses at its speed. It
      // stays at full ink to the end: the stage leaves with the section, so a fade would only leave an empty band.
      for (const l of lines) {
        const speed = Number.parseFloat(l.dataset.line) || -1;
        const centre = (stage.clientWidth - l.scrollWidth) / 2;
        l.style.translate = `${(centre + (p - 0.5) * speed * JOURNEY_LINE_TRAVEL * stage.clientWidth).toFixed(1)}px 0`;
      }
      if (bar) bar.style.scale = `${p.toFixed(4)} 1`;
    });
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });
  return () => {
    stop?.();
    window.removeEventListener('resize', measure);
    el.classList.remove('r-still');
    el.style.removeProperty('height');
    track.style.removeProperty('translate');
    lines.forEach((l) => l.style.removeProperty('translate'));
  };
}

// Snapping row of cards: arrow buttons, keyboard, mouse drag, a live "n / total" count, and buttons that disable
// at the ends. Touch keeps native scrolling.
function carousel(el, ctx) {
  const track = el.querySelector('.r-carousel__track');
  if (!track) return null;
  const slides = [...track.children];
  const prev = el.querySelector('[data-prev]');
  const next = el.querySelector('[data-next]');
  const count = el.querySelector('.r-carousel__count');
  const total = slides.length;
  slides.forEach((s, i) => {
    s.setAttribute('aria-roledescription', s.getAttribute('aria-roledescription') ?? 'slide');
    if (!s.hasAttribute('aria-label')) s.setAttribute('aria-label', `${i + 1} / ${total}`);
  });
  if (!track.hasAttribute('tabindex')) track.tabIndex = 0;
  const behavior = ctx.reduced ? 'auto' : 'smooth';
  const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
  const current = () => clamp(Math.round(track.scrollLeft / Math.max(1, step())), 0, total - 1);
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max;
    if (count) count.textContent = `${Math.min(total, current() + 1)} / ${total}`;
  };
  const go = (dir) => track.scrollBy({ left: dir * step(), behavior });
  const onPrev = () => go(-1);
  const onNext = () => go(1);
  const onKey = (e) => { if (KEY_STEP[e.key]) { e.preventDefault(); go(KEY_STEP[e.key]); } };
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; sync(); }); };
  // Mouse drag: move with the pointer, then let scroll-snap settle it. Touch and pens scroll natively.
  let drag = null;
  const onDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    track.setPointerCapture(e.pointerId);
    track.classList.add('is-dragging');
  };
  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    track.scrollLeft = drag.left - dx;
  };
  const onUp = (e) => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
    if (moved) track.addEventListener('click', (c) => c.preventDefault(), { capture: true, once: true });
  };
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);
  track.addEventListener('keydown', onKey);
  track.addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);
  window.addEventListener('resize', onScroll, { passive: true });
  sync();
  return () => {
    if (raf) cancelAnimationFrame(raf);
    prev?.removeEventListener('click', onPrev);
    next?.removeEventListener('click', onNext);
    track.removeEventListener('keydown', onKey);
    track.removeEventListener('scroll', onScroll);
    track.removeEventListener('pointerdown', onDown);
    track.removeEventListener('pointermove', onMove);
    track.removeEventListener('pointerup', onUp);
    track.removeEventListener('pointercancel', onUp);
    window.removeEventListener('resize', onScroll);
  };
}

// Frames of a real clip drawn on a canvas by scroll position. data-sequence names a manifest written by
// scripts/media.mjs frames (frames.js loads and draws it). [data-at="0.4"] steps light up in turn.
function sequence(el, ctx) {
  const canvas = el.querySelector('canvas');
  const steps = [...el.querySelectorAll('[data-at]')];
  const url = el.dataset.sequence;
  if (!canvas || !url) return null;
  const light = (p) => steps.forEach((s, i) => {
    const from = Number.parseFloat(s.dataset.at) || 0;
    const to = Number.parseFloat(steps[i + 1]?.dataset.at ?? '1.01');
    s.classList.toggle('is-on', p >= from && p < to);
  });
  let stop = null;
  const player = framePlayer(canvas, url, {
    onReady: () => {
      if (ctx.reduced) { el.classList.add('r-still'); light(0); return; }
      stop = ctx.scrub(el, (vh) => { const p = pinned(el, vh); player.show(p); light(p); });
    },
    onFail: (err) => { el.classList.add('r-still'); console.warn('[craft] data-sequence: manifest not loaded', err); },
  });
  window.addEventListener('resize', player.size, { passive: true });
  return () => { player.stop(); stop?.(); window.removeEventListener('resize', player.size); el.classList.remove('r-still'); };
}

export const recipes = { dive, journey, carousel, sequence };
