// Installed into the page once per navigation as window.__craft. Must stay self-contained.
export function installHelpers() {
  if (window.__craft) return true;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  const cache = new Map();

  const rgba = (css) => {
    if (!css || css === 'transparent') return [0, 0, 0, 0];
    if (cache.has(css)) return cache.get(css);
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = '#000';
    g.fillStyle = css;
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];
    cache.set(css, out);
    return out;
  };
  const lum = ([r, g2, b]) => {
    const f = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g2) + 0.0722 * f(b);
  };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const hsl = ([r, g2, b]) => {
    const [rr, gg, bb] = [r / 255, g2 / 255, b / 255];
    const max = Math.max(rr, gg, bb); const min = Math.min(rr, gg, bb); const l = (max + min) / 2;
    if (max === min) return [0, 0, l * 100];
    const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === rr ? (gg - bb) / d + (gg < bb ? 6 : 0) : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
    h *= 60;
    return [h, s * 100, l * 100];
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const srOnly = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return (r.width <= 1 && r.height <= 1) || cs.clipPath === 'inset(50%)' || cs.clip === 'rect(0px, 0px, 0px, 0px)';
  };
  const hiddenFromAT = (el) => !!el.closest('[aria-hidden="true"], [inert]');
  const opacity = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number.parseFloat(getComputedStyle(n).opacity) || 0;
    return o;
  };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const textEls = (root = document.body, limit = 2500) => {
    const out = [];
    // No TreeWalker filter callback: callbacks cannot run in a page with JavaScript disabled.
    for (const n of root.querySelectorAll('*')) {
      if (out.length >= limit) break;
      if (n.closest('script, style, noscript, template, svg, math, iframe')) continue;
      if (ownText(n).length) out.push(n);
    }
    return out;
  };
  // A section with data-ground is transparent and the page's ground eases to its colour while it is on screen
  // (kit premium layer): its words are read against the colour it declares, whatever the scroll position.
  const groundOf = (n) => {
    const probe = document.createElement('i');
    probe.style.cssText = `position:absolute;visibility:hidden;background-color:${n.dataset.ground}`;
    n.append(probe);
    const c = rgba(getComputedStyle(probe).backgroundColor);
    probe.remove();
    return c;
  };
  const bgOf = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.dataset?.ground && document.documentElement.hasAttribute('data-grounds')) {
        const g = groundOf(n);
        if (g[3] >= 0.9) return { color: g };
      }
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { image: true };
      const c = rgba(cs.backgroundColor);
      if (c[3] >= 0.9) return { color: c };
    }
    return { color: rgba(getComputedStyle(document.documentElement).backgroundColor)[3] > 0.5
      ? rgba(getComputedStyle(document.documentElement).backgroundColor) : [255, 255, 255, 1] };
  };
  const firstFamily = (ff) => (ff || '').split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  const describe = (el) => {
    const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls}${text ? ` "${text}"` : ''}`;
  };
  // The page's top-level sections: children of <main> (or <body>), descending through single wrappers.
  const sections = () => {
    let root = document.querySelector('main') || document.body;
    while (root.children.length === 1 && root.firstElementChild.offsetHeight > innerHeight * 0.9) root = root.firstElementChild;
    return [...root.children].filter((el) => !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName) && el.offsetHeight >= innerHeight * 0.3 && visible(el));
  };
  const sectionOf = (el) => sections().findIndex((sec) => sec === el || sec.contains(el));
  window.__craft = { rgba, lum, contrast, hsl, visible, srOnly, hiddenFromAT, opacity, ownText, textEls, bgOf, firstFamily, describe, sections, sectionOf };
  return true;
}
