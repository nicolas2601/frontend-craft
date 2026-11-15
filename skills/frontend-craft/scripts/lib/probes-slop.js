// In-page probes for the tells that mark a page as machine-made. Each runs after installHelpers().

/**
 * @param {string[]} selectors CSS selectors named in .craft/concept.md under # Breaks
 * @returns {{ photoRepeats: Array<{src:string, sections:number}>, numbering: Record<string, number>,
 *   numberingExamples: string[], stamps: string[], selectors: Record<string, number>, viewTransition: boolean }}
 */
export function probeSlop(selectors = []) {
  const C = window.__craft;
  const isRaster = (src) => !!src && !/\.svg(\?|#|$)|^data:image\/svg/i.test(src);

  // The same photograph shown in two different sections (two halves of one curtain stay one use).
  const uses = new Map();
  for (const img of document.querySelectorAll('img')) {
    const src = (img.currentSrc || img.src || '').split('?')[0];
    if (!isRaster(src) || !C.visible(img) || img.offsetWidth < 160 || img.offsetHeight < 120) continue;
    const file = src.split('/').slice(-2).join('/');
    if (!uses.has(file)) uses.set(file, new Set());
    uses.get(file).add(C.sectionOf(img));
  }
  const photoRepeats = [...uses].filter(([, secs]) => secs.size > 1).map(([src, secs]) => ({ src, sections: secs.size }));

  // Numbering systems: "01 — Title" kickers, "01 / 04" counters, "01 / Rest" captions, bare "01" numerals.
  const SYSTEMS = {
    kicker: /^\d{1,2}\s*[—–-]\s*\p{L}/u,
    counter: /^\d{1,2}\s*\/\s*\d{1,2}$/,
    caption: /^\d{1,2}\s*\/\s*\p{L}/u,
    numeral: /^0\d\.?$/,
  };
  const numbering = { kicker: 0, counter: 0, caption: 0, numeral: 0 };
  const numberingExamples = [];
  for (const el of C.textEls()) {
    if (!C.visible(el)) continue;
    const t = C.ownText(el).replace(/\s+/g, ' ').trim();
    if (!t || t.length > 60) continue;
    for (const [k, re] of Object.entries(SYSTEMS)) {
      if (!re.test(t)) continue;
      numbering[k] += 1;
      if (numberingExamples.length < 6) numberingExamples.push(t);
      break;
    }
  }

  // Round badges with a few words, tilted or spinning ("Naturally leavened", "Since 1998"), and text on a circle.
  const stamps = [];
  for (const el of document.querySelectorAll('body *')) {
    if (stamps.length >= 4) break;
    if (el.tagName === 'textPath' && C.visible(el.closest('svg'))) { stamps.push(el.textContent.trim().slice(0, 40)); continue; }
    const w = el.offsetWidth; const h = el.offsetHeight;
    if (w < 48 || w > 240 || Math.abs(w - h) > w * 0.12 || !C.visible(el)) continue;
    const cs = getComputedStyle(el);
    const radius = parseFloat(cs.borderTopLeftRadius) / (cs.borderTopLeftRadius.endsWith('%') ? 100 / w : 1);
    if (radius < w * 0.45) continue;
    const words = el.textContent.trim().split(/\s+/).filter(Boolean);
    if (words.length < 1 || words.length > 5) continue;
    const m = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform);
    const tilted = Math.abs(m.b) > 0.02 || (cs.rotate && cs.rotate !== 'none' && parseFloat(cs.rotate) !== 0);
    const spinning = cs.animationName !== 'none';
    if (tilted || spinning) stamps.push(words.join(' ').slice(0, 40));
  }

  const found = {};
  for (const sel of selectors.slice(0, 12)) {
    try { found[sel] = [...document.querySelectorAll(sel)].filter(C.visible).length; } catch { found[sel] = -1; }
  }

  let viewTransition = false;
  for (const sheet of document.styleSheets) {
    let rules = [];
    try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules) if (/^@view-transition/.test(r.cssText) || /view-transition-name/.test(r.cssText)) { viewTransition = true; break; }
    if (viewTransition) break;
  }

  const magnetic = document.querySelectorAll('[data-magnetic]').length;
  return { photoRepeats, numbering, numberingExamples, stamps, selectors: found, viewTransition, magnetic };
}
