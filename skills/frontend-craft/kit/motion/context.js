// Shared runtime for every effect: one rAF loop, shared observers, one cleanup list.

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** 0 when the element's top meets the viewport bottom, 1 when its bottom leaves the top. */
export function travel(el, vh) {
  const r = el.getBoundingClientRect();
  return clamp((vh - r.top) / (vh + r.height));
}

/**
 * Progress while the element is readable: 0 when its top is 10% into the viewport, 1 when its centre reaches 40%
 * of the viewport height. Scroll-driven motion is finished before the reader moves past it, never as it leaves.
 */
export function view(el, vh) {
  const r = el.getBoundingClientRect();
  return clamp((0.9 * vh - r.top) / (0.5 * vh + r.height / 2));
}

/** Progress through a tall section whose first child is sticky: 0 at its top, 1 at its end. */
export function pinned(el, vh) {
  const r = el.getBoundingClientRect();
  const span = r.height - vh;
  return span <= 0 ? clamp(-r.top / vh) : clamp(-r.top / span);
}

export function markDone(el) {
  el.setAttribute('data-craft-on', '');
  el.setAttribute('data-craft-done', '');
}

export function createContext(options = {}) {
  const media = (q) => window.matchMedia(q).matches;
  const reduced = options.reducedMotion ?? media('(prefers-reduced-motion: reduce)');
  const fine = media('(hover: hover) and (pointer: fine)');
  const cleanups = [];
  const frames = new Set();
  const observers = new Map();
  let raf = 0;
  let alive = true;

  const tick = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const fn of frames) fn(vh);
  };
  const schedule = () => {
    if (alive && !raf) raf = requestAnimationFrame(tick);
  };

  function observer(margin, threshold) {
    const key = `${margin}|${threshold}`;
    if (!observers.has(key)) {
      const handlers = new WeakMap();
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) handlers.get(e.target)?.(e.isIntersecting, e);
      }, { rootMargin: margin, threshold });
      observers.set(key, { io, handlers });
    }
    return observers.get(key);
  }

  return {
    reduced,
    fine,
    /** Loaders for optional libraries the project installed: { three: () => import('three'), maplibre: () => import('maplibre-gl') }. */
    libs: options.libs ?? {},
    track(fn) {
      if (typeof fn === 'function') cleanups.push(fn);
    },
    /** Call cb(isVisible) whenever el enters or leaves the viewport. */
    watch(el, cb, { margin = '0px 0px -12% 0px', threshold = 0 } = {}) {
      const { io, handlers } = observer(margin, threshold);
      handlers.set(el, cb);
      io.observe(el);
      return () => { io.unobserve(el); handlers.delete(el); };
    },
    /** Call cb once, the first time el is visible. */
    once(el, cb, opts) {
      let stop = () => {};
      stop = this.watch(el, (visible) => {
        if (!visible) return;
        stop();
        cb();
      }, opts);
      return stop;
    },
    /** Run fn(vh) every frame the page scrolls, only while el is near the viewport. */
    scrub(el, fn) {
      const stop = this.watch(el, (visible) => {
        if (visible) frames.add(fn); else frames.delete(fn);
        schedule();
      }, { margin: '25% 0px 25% 0px' });
      return () => { stop(); frames.delete(fn); };
    },
    /** Run fn(vh) every scroll frame regardless of visibility (page-level effects). */
    always(fn) {
      frames.add(fn);
      schedule();
      return () => frames.delete(fn);
    },
    start() {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      schedule();
    },
    refresh: schedule,
    destroy() {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      for (const fn of cleanups.splice(0).reverse()) {
        try { fn(); } catch (err) { console.warn('[craft] cleanup failed', err); }
      }
      for (const { io } of observers.values()) io.disconnect();
      observers.clear();
      frames.clear();
    },
  };
}
