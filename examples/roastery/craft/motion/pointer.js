// Pointer effects. Only on devices with a fine pointer that can hover; never under reduced motion.
import { clamp } from './context.js';

const MAGNET_REACH_PX = 40;
const MAGNET_LERP = 0.18;

// data-magnetic="0.3": the element leans toward the cursor and springs back.
function magnetic(el, ctx) {
  if (ctx.reduced || !ctx.fine) return null;
  const strength = clamp(Number.parseFloat(el.dataset.magnetic) || 0.3, 0, 1);
  let target = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  let raf = 0;
  const step = () => {
    current = { x: current.x + (target.x - current.x) * MAGNET_LERP, y: current.y + (target.y - current.y) * MAGNET_LERP };
    el.style.translate = `${current.x.toFixed(2)}px ${current.y.toFixed(2)}px`;
    const settled = Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1;
    raf = settled ? 0 : requestAnimationFrame(step);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
  const move = (e) => {
    const r = el.getBoundingClientRect();
    const inside = e.clientX > r.left - MAGNET_REACH_PX && e.clientX < r.right + MAGNET_REACH_PX
      && e.clientY > r.top - MAGNET_REACH_PX && e.clientY < r.bottom + MAGNET_REACH_PX;
    target = inside
      ? { x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength }
      : { x: 0, y: 0 };
    kick();
  };
  window.addEventListener('pointermove', move, { passive: true });
  return () => {
    window.removeEventListener('pointermove', move);
    if (raf) cancelAnimationFrame(raf);
    el.style.removeProperty('translate');
  };
}

// Writes --mx/--my so craft.css can draw a soft light under the cursor.
function spotlight(el, ctx) {
  if (ctx.reduced || !ctx.fine) return null;
  let raf = 0;
  let last = null;
  const paint = () => {
    raf = 0;
    if (!last) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(last.clientX - r.left).toFixed(0)}px`);
    el.style.setProperty('--my', `${(last.clientY - r.top).toFixed(0)}px`);
  };
  const move = (e) => { last = e; if (!raf) raf = requestAnimationFrame(paint); };
  el.addEventListener('pointermove', move, { passive: true });
  return () => {
    el.removeEventListener('pointermove', move);
    if (raf) cancelAnimationFrame(raf);
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  };
}

export const pointer = { magnetic, spotlight };
