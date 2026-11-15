// Text effects: count, scramble, marquee. The final text is always in the DOM first.
import { visualLayer } from './split.js';

const COUNT_MS = 1400;
const SCRAMBLE_MS = 650;
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=';
const MAX_MARQUEE_PX_PER_S = 120;
const DEFAULT_MARQUEE_PX_PER_S = 60;

/** Parse "1.280", "12,5 %", "+40k" into parts that can be re-rendered with the same format. */
export function parseNumber(text) {
  const m = text.match(/^(\D*?)(\d[\d.,\s]*\d|\d)(\D*)$/s);
  if (!m) return null;
  const [, prefix, raw, suffix] = m;
  const seps = [...raw.replace(/\d/g, '')];
  const kinds = [...new Set(seps)];
  let decimal = '';
  let group = '';
  if (kinds.length === 2) {
    decimal = seps.at(-1);
    group = kinds.find((k) => k !== decimal);
  } else if (kinds.length === 1) {
    const [c] = kinds;
    const tail = raw.slice(raw.lastIndexOf(c) + 1);
    if (/\s/.test(c) || seps.length > 1 || tail.length === 3) group = c;
    else decimal = c;
  }
  const [intRaw, fracRaw = ''] = decimal ? raw.split(decimal) : [raw];
  const intPart = intRaw.replace(/\D/g, '');
  const fracPart = fracRaw.replace(/\D/g, '');
  const value = Number(`${intPart}.${fracPart || '0'}`);
  return { prefix, suffix, value, decimals: fracPart.length, group, decimal };
}

export function formatNumber(n, { prefix, suffix, decimals, group, decimal }) {
  const fixed = n.toFixed(decimals);
  const [i, f] = fixed.split('.');
  const grouped = group ? i.replace(/\B(?=(\d{3})+(?!\d))/g, group) : i;
  return `${prefix}${grouped}${f ? decimal + f : ''}${suffix}`;
}

// Counts up to the number already written in the element when it scrolls into view.
function count(el, ctx) {
  const parsed = parseNumber(el.textContent.trim());
  if (!parsed || ctx.reduced) return null;
  const layer = visualLayer(el);
  layer.layer.textContent = formatNumber(0, parsed);
  let raf = 0;
  const stop = ctx.once(el, () => {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / COUNT_MS);
      const eased = 1 - (1 - t) ** 4;
      layer.layer.textContent = formatNumber(parsed.value * eased, parsed);
      raf = t < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  });
  return () => { stop(); if (raf) cancelAnimationFrame(raf); layer.restore(); };
}

// Letters resolve from noise: data-scramble (once in view) or data-scramble="hover".
function scramble(el, ctx) {
  if (ctx.reduced || el.children.length) return null;
  const layer = visualLayer(el);
  let raf = 0;
  const run = () => {
    if (raf) return;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / SCRAMBLE_MS);
      const fixed = Math.floor(t * layer.text.length);
      layer.layer.textContent = [...layer.text].map((ch, i) => (i < fixed || ch === ' '
        ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('');
      raf = t < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  };
  const onHover = el.dataset.scramble === 'hover';
  let stop = () => {};
  if (onHover && ctx.fine) {
    el.addEventListener('pointerenter', run);
    el.addEventListener('focus', run);
    stop = () => { el.removeEventListener('pointerenter', run); el.removeEventListener('focus', run); };
  } else if (!onHover) {
    stop = ctx.once(el, run);
  }
  return () => { stop(); if (raf) cancelAnimationFrame(raf); layer.restore(); };
}

// Endless band. data-marquee="60" sets the speed in px/s (at most 120, so words stay readable). Pauses off screen
// and on hover; a button with data-marquee-toggle right after it (or aria-controls naming its id) pauses and resumes it (WCAG 2.2.2), and that pause sticks.
function marquee(el, ctx) {
  if (ctx.reduced) return null;
  const original = [...el.childNodes];
  const track = document.createElement('div');
  track.className = 'craft-marquee-track';
  track.append(...original);
  el.replaceChildren(track);
  const unit = track.scrollWidth;
  const clones = [];
  while (track.scrollWidth < el.clientWidth * 2 + unit && clones.length < 12) {
    for (const node of original) {
      const copy = node.cloneNode(true);
      if (copy.nodeType === Node.ELEMENT_NODE) copy.setAttribute('aria-hidden', 'true');
      clones.push(copy);
      track.append(copy);
    }
  }
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  const distance = unit + gap;
  const speed = Math.min(MAX_MARQUEE_PX_PER_S, Number.parseFloat(el.dataset.marquee) || DEFAULT_MARQUEE_PX_PER_S);
  const anim = track.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-distance}px)` }],
    { duration: (distance / speed) * 1000, iterations: Infinity, easing: 'linear' });
  const next = el.nextElementSibling;
  const toggle = next?.matches('[data-marquee-toggle]') ? next : el.id ? document.querySelector(`[data-marquee-toggle][aria-controls="${el.id}"]`) : null;
  let held = false;
  let visible = false;
  let hovered = false;
  const sync = () => {
    if (visible && !held && !hovered) anim.play(); else anim.pause();
    toggle?.setAttribute('aria-pressed', String(held));
  };
  const pause = () => { hovered = true; sync(); };
  const resume = () => { hovered = false; sync(); };
  const onToggle = () => { held = !held; sync(); };
  toggle?.addEventListener('click', onToggle);
  const stopWatch = ctx.watch(el, (v) => { visible = v; sync(); }, { margin: '10% 0px' });
  if (ctx.fine) { el.addEventListener('pointerenter', pause); el.addEventListener('pointerleave', resume); }
  return () => {
    stopWatch();
    toggle?.removeEventListener('click', onToggle);
    anim.cancel();
    el.removeEventListener('pointerenter', pause);
    el.removeEventListener('pointerleave', resume);
    el.replaceChildren(...original);
  };
}

export const text = { count, scramble, marquee };
