// Text splitting that keeps the original readable for assistive tech and restores it exactly.

/**
 * Wrap every word of el in <span class="craft-word">, preserving inline children
 * (em, strong, a, br). Screen readers get one visually hidden copy of the text.
 * Returns { words, restore }.
 */
export function splitWords(el) {
  const original = [...el.childNodes];
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  for (const node of original) visual.append(node.cloneNode(true));

  const words = [];
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement('span');
          w.className = 'craft-word';
          w.textContent = part;
          words.push(w);
          frag.append(w);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    }
  };
  walk(visual);

  const sr = document.createElement('span');
  sr.className = 'craft-sr';
  sr.textContent = label;
  el.replaceChildren(sr, visual);

  return {
    words,
    restore() { el.replaceChildren(...original); },
  };
}

/** Replace el's visible text with an aria-hidden layer; returns { layer, restore }. */
export function visualLayer(el) {
  const original = [...el.childNodes];
  const text = el.textContent;
  const sr = document.createElement('span');
  sr.className = 'craft-sr';
  sr.textContent = text;
  const layer = document.createElement('span');
  layer.setAttribute('aria-hidden', 'true');
  layer.textContent = text;
  el.replaceChildren(sr, layer);
  return { layer, text, restore() { el.replaceChildren(...original); } };
}
