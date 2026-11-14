/*
  frontend-craft motion kit. MIT. No dependencies, any framework.

  Mark elements with data attributes, then call init() once the DOM exists:
    import { init } from './craft-motion.js';
    const cleanup = init(document);   // React: useEffect(() => init(document), [])

  Every effect respects prefers-reduced-motion (final state, no movement),
  keeps text readable to screen readers, and restores the DOM on cleanup.
*/
import { createContext } from './motion/context.js';
import { entrance } from './motion/entrance.js';
import { scroll } from './motion/scroll.js';
import { pointer } from './motion/pointer.js';
import { text } from './motion/text.js';
import { scene } from './motion/scene.js';

const EFFECTS = { ...entrance, ...scroll, ...pointer, ...text, scene };
const active = new WeakMap();

/** Names of every data attribute the kit understands (data-<name>). */
export const effects = Object.freeze(Object.keys(EFFECTS));

function nodesFor(scope, name) {
  const selector = `[data-${name}]`;
  const own = scope.matches?.(selector) ? [scope] : [];
  return [...own, ...scope.querySelectorAll(selector)];
}

/**
 * Start every effect inside root. Calling init again on the same root first
 * cleans up the previous run, so it is safe in React StrictMode and on route changes.
 * @param {ParentNode} [root=document]
 * @param {{ reducedMotion?: boolean }} [options]
 * @returns {() => void} cleanup
 */
export function init(root, options = {}) {
  if (typeof window === 'undefined') return () => {};
  const scope = root ?? document;
  active.get(scope)?.();
  document.documentElement.classList.add('craft-js');
  const ctx = createContext(options);
  for (const [name, effect] of Object.entries(EFFECTS)) {
    for (const el of nodesFor(scope, name)) {
      try {
        ctx.track(effect(el, ctx));
      } catch (err) {
        el.setAttribute('data-craft-done', '');
        console.warn(`[craft] data-${name} failed`, el, err);
      }
    }
  }
  ctx.start();
  const cleanup = () => {
    ctx.destroy();
    active.delete(scope);
  };
  active.set(scope, cleanup);
  return cleanup;
}
