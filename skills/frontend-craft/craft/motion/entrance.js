// Load and in-view entrances: enter, words, reveal, mask.
import { markDone } from './context.js';
import { splitWords } from './split.js';

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
const ENTER_BASE_MS = 120;
const ENTER_STEP_MS = 90;
const ENTER_MS = 750;
const WORD_STEP_MS = 45;
const WORD_MS = 700;
const REVEAL_MS = 650;
const STAGGER_MS = 70;
const MASK_MS = 900;

const RISE = [
  { opacity: 0, transform: 'translateY(16px)', filter: 'blur(6px)' },
  { opacity: 1, transform: 'none', filter: 'blur(0)' },
];

function play(el, keyframes, { delay = 0, duration, onDone }) {
  const anim = el.animate(keyframes, { duration, delay, easing: EASE, fill: 'both' });
  anim.finished.then(() => { onDone?.(); anim.cancel(); }, () => {});
  return anim;
}

// Orchestrated load entrance. data-enter="2" sets an explicit order.
let enterIndex = 0;
function enter(el, ctx) {
  el.setAttribute('data-craft-on', '');
  if (ctx.reduced) { markDone(el); return null; }
  const explicit = Number.parseInt(el.dataset.enter, 10);
  const order = Number.isFinite(explicit) ? explicit : enterIndex++;
  const anim = play(el, RISE, {
    delay: ENTER_BASE_MS + order * ENTER_STEP_MS,
    duration: ENTER_MS,
    onDone: () => markDone(el),
  });
  return () => { anim.cancel(); markDone(el); enterIndex = 0; };
}

// Headline words blur in one by one: data-words (on load) or data-words="view".
function words(el, ctx) {
  el.setAttribute('data-craft-on', '');
  if (ctx.reduced) { markDone(el); return null; }
  const split = splitWords(el);
  const anims = [];
  const start = () => {
    split.words.forEach((w, i) => {
      anims.push(play(w, [
        { opacity: 0, transform: 'translateY(0.35em)', filter: 'blur(8px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
      ], { delay: 80 + i * WORD_STEP_MS, duration: WORD_MS, onDone: () => w.style.removeProperty('opacity') }));
    });
  };
  for (const w of split.words) w.style.opacity = '0';
  markDone(el);
  const stop = el.dataset.words === 'view' ? ctx.once(el, start) : (start(), null);
  return () => {
    stop?.();
    for (const a of anims) a.cancel();
    split.restore();
  };
}

// Fade and rise when scrolled into view; data-reveal="stagger" animates the children.
function reveal(el, ctx) {
  el.setAttribute('data-craft-on', '');
  if (ctx.reduced) { markDone(el); return null; }
  const stagger = el.dataset.reveal === 'stagger';
  const targets = stagger ? [...el.children] : [el];
  const anims = [];
  const stop = ctx.once(el, () => {
    targets.forEach((t, i) => {
      anims.push(play(t, [
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'none' },
      ], { delay: stagger ? i * STAGGER_MS : 0, duration: REVEAL_MS }));
    });
    markDone(el);
  });
  return () => { stop(); for (const a of anims) a.cancel(); markDone(el); };
}

// Clip-path wipe for images and blocks: data-mask="up|down|left|right".
const MASKS = {
  up: 'inset(100% 0 0 0)',
  down: 'inset(0 0 100% 0)',
  left: 'inset(0 0 0 100%)',
  right: 'inset(0 100% 0 0)',
};
function mask(el, ctx) {
  el.setAttribute('data-craft-on', '');
  if (ctx.reduced) { markDone(el); return null; }
  const from = MASKS[el.dataset.mask] ?? MASKS.up;
  let anim = null;
  const stop = ctx.once(el, () => {
    anim = play(el, [{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], { duration: MASK_MS });
    markDone(el);
  });
  return () => { stop(); anim?.cancel(); markDone(el); };
}

export const entrance = { enter, words, reveal, mask };
