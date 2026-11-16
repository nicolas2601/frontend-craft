// In-page probes for how finished a page looks: the picture in the first screen, boxes left empty, the footer.
// Each runs after installHelpers() and returns plain JSON.

/** The share of the first screen the largest photograph, video or canvas covers (0..1), at the current width. */
export function probeHeroPicture() {
  const C = window.__craft;
  const vw = innerWidth, vh = innerHeight;
  let best = 0, label = '';
  for (const el of document.querySelectorAll('img, video, canvas, picture')) {
    if (!C.visible(el) || el.closest('header, nav, footer') || /\.svg(\?|#|$)/i.test(el.currentSrc || el.src || '')) continue;
    const r = el.getBoundingClientRect();
    const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const share = (w * h) / (vw * vh);
    if (share > best) { best = share; label = C.describe(el).slice(0, 60); }
  }
  return { share: Math.round(best * 100) / 100, label };
}

/**
 * Cards, tiles and panels left mostly empty: a box with its own ground, border or shadow, at least 4% of the screen,
 * narrower than the page: a tall one (300 px or more) whose text and pictures fill under a fifth of it, or any
 * with a void between its contents taller than 40% of the box (a title at the top and one number at the bottom,
 * a price card that is mostly padding).
 * Measured on the laid-out page, so hidden entrance states still count.
 */
export function probeEmptyBoxes() {
  const C = window.__craft;
  const vw = innerWidth, screen = vw * innerHeight;
  const MIN_SHARE = 0.04, MAX_WIDTH = 0.92, FILLED = 0.2, TALL = 300, VOID = 0.4, VOID_PX = 120;
  const ground = (el) => {
    const cs = getComputedStyle(el);
    const bg = C.rgba(cs.backgroundColor)[3] > 0.05 || cs.backgroundImage !== 'none';
    const border = ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && C.rgba(cs[`border${s}Color`])[3] > 0.1).length >= 3;
    return bg || border || cs.boxShadow !== 'none';
  };
  const areaOf = (r) => Math.max(0, r.width) * Math.max(0, r.height);
  /** The share of the box its content covers, and the tallest void between two pieces of content. */
  const filled = (box) => {
    const b = box.getBoundingClientRect();
    const rects = [];
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim() || !C.visible(n.parentElement)) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      rects.push(...range.getClientRects());
    }
    for (const m of box.querySelectorAll('img, video, canvas, svg, picture, iframe, input, textarea, select')) if (C.visible(m)) rects.push(m.getBoundingClientRect());
    const inBox = rects.map((r) => ({ top: Math.max(r.top, b.top), bottom: Math.min(r.bottom, b.bottom), w: Math.min(r.right, b.right) - Math.max(r.left, b.left) }))
      .filter((r) => r.bottom > r.top && r.w > 0).sort((x, y) => x.top - y.top);
    const area = inBox.reduce((a, r) => a + r.w * (r.bottom - r.top), 0);
    let gap = 0, reach = inBox[0]?.bottom ?? 0;
    for (const r of inBox) { gap = Math.max(gap, r.top - reach); reach = Math.max(reach, r.bottom); }
    return { share: area / areaOf(b), gap, height: b.height };
  };
  const out = [];
  for (const el of document.querySelectorAll('main *')) {
    if (out.length >= 8) break;
    if (!C.visible(el) || el.matches('img, video, canvas, picture, iframe, svg, svg *') || el.closest('header, nav, footer, button, a, [aria-hidden="true"]')) continue;
    const r = el.getBoundingClientRect();
    if (areaOf(r) < screen * MIN_SHARE || r.width > vw * MAX_WIDTH || !ground(el)) continue;
    if ([...el.querySelectorAll('img, video, canvas, picture')].some((m) => areaOf(m.getBoundingClientRect()) > areaOf(r) * 0.3)) continue;
    if (out.some((o) => o.el.contains(el) || el.contains(o.el))) continue;
    const { share, gap, height } = filled(el);
    const hollow = gap > Math.max(VOID_PX, height * VOID);
    if ((share < FILLED && height >= TALL) || hollow) out.push({ el, what: `${C.describe(el).slice(0, 50)} (${Math.round(r.width)}x${Math.round(r.height)}, ${hollow ? `a ${Math.round(gap)} px void inside` : `${Math.round(share * 100)}% filled`})` });
  }
  return out.map((o) => o.what);
}

/** The footer: whether there is one, how tall, its links, and whether it says how to reach the place or company. */
export function probeFooter() {
  const C = window.__craft;
  const foot = [...document.querySelectorAll('footer, [role="contentinfo"]')].filter(C.visible).pop();
  if (!foot) return { present: false };
  const links = [...foot.querySelectorAll('a[href]')].filter(C.visible);
  const text = foot.innerText || '';
  return {
    present: true,
    height: Math.round(foot.getBoundingClientRect().height),
    links: links.length,
    inPage: links.filter((a) => a.getAttribute('href').startsWith('#')).length,
    contact: links.some((a) => /^(tel:|mailto:|https:\/\/(wa\.me|api\.whatsapp\.com|maps\.|www\.google\.com\/maps|goo\.gl\/maps))/.test(a.getAttribute('href'))) || !!foot.querySelector('address'),
    words: text.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Inline drawings that stand in for a picture: an SVG of at least 15% of the screen made only of boxes, straight
 * lines, dots and labels (no curve, no embedded image). The drawn street map and the diagram of boxes are this.
 */
export function probeDrawnSvg() {
  const out = [];
  const screen = innerWidth * innerHeight;
  for (const svg of document.querySelectorAll('svg')) {
    const r = svg.getBoundingClientRect();
    if (r.width * r.height < screen * 0.15 || svg.closest('[aria-hidden="true"] svg[aria-hidden="true"]')) continue;
    if (svg.querySelector('image, foreignObject')) continue;
    const shapes = svg.querySelectorAll('rect, line, polyline, polygon, circle, ellipse, text, path').length;
    const curved = [...svg.querySelectorAll('path')].some((p) => /[CcSsQqTtAa]/.test(p.getAttribute('d') ?? ''));
    if (!curved && shapes >= 6) out.push({ shapes, area: Math.round((r.width * r.height * 100) / screen), label: svg.getAttribute('aria-label') ?? svg.closest('section')?.id ?? '' });
  }
  return out;
}
