// Scroll-linked effects: scroll-words, scrub, parallax, stack, rail, progress.
import { clamp, pinned, travel, view } from './context.js';
import { splitWords } from './split.js';

const PARALLAX_MAX_PX = 160;
const STACK_SCALE = 0.06;
const RAIL_BREAKPOINT = '(max-width: 640px)';

function pinOf(el) {
  return el.closest('[data-pin]') ?? el.parentElement ?? el;
}

// Words light up as the reader scrolls. data-scroll-words="pinned" follows the nearest [data-pin].
function scrollWords(el, ctx) {
  const split = splitWords(el);
  const { words } = split;
  if (ctx.reduced) {
    for (const w of words) w.classList.add('is-lit');
    return split.restore;
  }
  const isPinned = el.dataset.scrollWords === 'pinned';
  const host = isPinned ? pinOf(el) : el;
  let lit = -1;
  const frame = (vh) => {
    let p;
    if (isPinned) {
      p = pinned(host, vh);
    } else {
      const r = el.getBoundingClientRect();
      p = clamp((0.85 * vh - r.top) / (0.4 * vh + r.height));
    }
    const next = Math.min(words.length, Math.floor(p * (words.length + 1)));
    if (next === lit) return;
    lit = next;
    words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
  };
  const stop = ctx.scrub(host, frame);
  return () => { stop(); split.restore(); };
}

// Writes --p (0..1) on the element: 0 as it comes into view, 1 once its centre reaches 40% of the screen, so a
// line drawn or a picture developed with calc(var(--p) * ...) is finished while it can be read. --travel is the
// whole pass (0 entering at the bottom, 1 leaving at the top), for depth effects that keep moving.
function scrub(el, ctx) {
  const set = (p, t = p) => { el.style.setProperty('--p', p.toFixed(4)); el.style.setProperty('--travel', t.toFixed(4)); };
  const clear = () => { el.style.removeProperty('--p'); el.style.removeProperty('--travel'); };
  if (ctx.reduced) {
    set(Number.parseFloat(el.dataset.scrubReduced ?? '1'));
    return clear;
  }
  const isPinned = el.dataset.scrub === 'pinned';
  const host = isPinned ? pinOf(el) : el;
  const stop = ctx.scrub(host, (vh) => (isPinned ? set(pinned(host, vh)) : set(view(el, vh), travel(el, vh))));
  return () => { stop(); clear(); };
}

// Depth: data-parallax="0.2" moves the element at a fraction of scroll speed.
function parallax(el, ctx) {
  if (ctx.reduced) return null;
  const speed = clamp(Number.parseFloat(el.dataset.parallax) || 0.15, -1, 1);
  const stop = ctx.scrub(el, (vh) => {
    // Measure where the element sits without its own shift, or the shift feeds back into itself and jitters.
    const r = el.getBoundingClientRect();
    const shift = Number.parseFloat(String(el.style.translate || '0 0').split(' ')[1]) || 0;
    const offset = (r.top - shift + r.height / 2 - vh / 2) * -speed;
    el.style.translate = `0 ${clamp(offset, -PARALLAX_MAX_PX, PARALLAX_MAX_PX).toFixed(1)}px`;
  });
  return () => { stop(); el.style.removeProperty('translate'); };
}

// Sticky cards: each card shrinks slightly as the next one covers it.
function stack(el, ctx) {
  const cards = [...el.children];
  cards.forEach((c, i) => c.style.setProperty('--i', String(i)));
  if (ctx.reduced || cards.length < 2) return () => cards.forEach((c) => c.style.removeProperty('--i'));
  const stop = ctx.scrub(el, (vh) => {
    for (let i = 0; i < cards.length - 1; i += 1) {
      const next = cards[i + 1].getBoundingClientRect();
      const stuckAt = Number.parseFloat(getComputedStyle(cards[i + 1]).top) || 0;
      const p = clamp(1 - (next.top - stuckAt) / vh);
      cards[i].style.scale = String(1 - STACK_SCALE * p);
      cards[i].style.setProperty('--stack-p', p.toFixed(3));
    }
  });
  return () => {
    stop();
    for (const c of cards) ['--i', '--stack-p', 'scale'].forEach((k) => c.style.removeProperty(k));
  };
}

// Pinned horizontal rail. Structure: [data-rail] > [data-rail-track] > items.
function rail(el, ctx) {
  const track = el.querySelector(':scope > [data-rail-track]');
  if (!track) return null;
  const narrow = window.matchMedia(RAIL_BREAKPOINT);
  let distance = 0;
  let stop = null;
  const measure = () => {
    stop?.();
    stop = null;
    const off = ctx.reduced || narrow.matches;
    el.classList.toggle('craft-rail-off', off);
    track.style.removeProperty('translate');
    el.style.removeProperty('height');
    if (off) return;
    distance = Math.max(0, track.scrollWidth - el.clientWidth);
    el.style.height = `${distance + window.innerHeight}px`;
    stop = ctx.scrub(el, (vh) => {
      track.style.translate = `${(-pinned(el, vh) * distance).toFixed(1)}px 0`;
    });
  };
  measure();
  narrow.addEventListener('change', measure);
  window.addEventListener('resize', measure, { passive: true });
  return () => {
    stop?.();
    narrow.removeEventListener('change', measure);
    window.removeEventListener('resize', measure);
    el.classList.remove('craft-rail-off');
    el.style.removeProperty('height');
    track.style.removeProperty('translate');
  };
}

// Reading progress bar: scales from 0 to 1 across the page.
function progress(el, ctx) {
  const stop = ctx.always((vh) => {
    const max = document.documentElement.scrollHeight - vh;
    el.style.scale = `${max > 0 ? clamp(window.scrollY / max).toFixed(4) : 1} 1`;
  });
  return () => { stop(); el.style.removeProperty('scale'); };
}

export const scroll = { 'scroll-words': scrollWords, scrub, parallax, stack, rail, progress };
