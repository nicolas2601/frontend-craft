// In-page probes for how rich a page is. Each runs after installHelpers() and returns plain JSON.

/** Top-level section index of each pinned scene's host (same order and filter as probeSticky). */
export function probeStickySections() {
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (getComputedStyle(el).position !== 'sticky' || el.getBoundingClientRect().height < innerHeight * 0.5) continue;
    const host = el.parentElement;
    if (host && host.getBoundingClientRect().height > innerHeight * 1.4) out.push(window.__craft.sectionOf(host));
    if (out.length >= 6) break;
  }
  return out;
}

/**
 * What makes a page rich rather than flat: the ground of each top-level section, the photographs
 * (raster pictures at least 160x120 laid out, counted once per source) and whether one runs full bleed.
 */
export function probeRichness() {
  const C = window.__craft;
  const vw = document.documentElement.clientWidth;
  const isRaster = (src) => !!src && !/\.svg(\?|#|$)|^data:image\/svg/i.test(src);
  const urlOf = (bg) => (/url\(["']?([^"')]+)/.exec(bg) || [])[1] || '';
  const pictures = new Map();
  let seen = 0;
  for (const el of document.querySelectorAll('body *')) {
    if (pictures.size > 300 || (seen += 1) > 4000) break;
    let src = '';
    if (el.tagName === 'IMG') src = isRaster(el.currentSrc || el.src) && el.naturalWidth >= 300 ? (el.currentSrc || el.src) : '';
    else if (el.tagName === 'VIDEO') src = el.currentSrc || el.poster || el.querySelector('source')?.src || 'video';
    else {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) src = isRaster(urlOf(bg)) ? urlOf(bg) : '';
    }
    if (!src || !C.visible(el)) continue;
    const w = el.offsetWidth || el.getBoundingClientRect().width;
    const h = el.offsetHeight || el.getBoundingClientRect().height;
    if (w < 160 || h < 120) continue;
    const key = src.split('?')[0];
    const prev = pictures.get(key);
    pictures.set(key, { w: Math.max(prev?.w ?? 0, w), h: Math.max(prev?.h ?? 0, h) });
  }
  const list = [...pictures.values()];
  const grounds = C.sections().map((sec) => {
    const area = sec.offsetWidth * sec.offsetHeight;
    const own = C.rgba(getComputedStyle(sec).backgroundColor);
    if (own[3] >= 0.9) return own.slice(0, 3);
    // a layer inside the section that covers most of it (a sticky stage, an iris, a full-bleed picture)
    for (const el of sec.querySelectorAll('*')) {
      const w = el.offsetWidth; const h = el.offsetHeight;
      if (w * h < area * 0.6 && h < innerHeight * 0.85) continue;
      if (w < sec.offsetWidth * 0.9) continue;
      if (['IMG', 'VIDEO', 'CANVAS'].includes(el.tagName)) return 'picture';
      const cs = getComputedStyle(el);
      if (cs.backgroundImage.includes('url(')) return 'picture';
      const c = C.rgba(cs.backgroundColor);
      if (c[3] >= 0.9) return c.slice(0, 3);
    }
    const b = C.bgOf(sec);
    return b.image ? 'picture' : (b.color ?? C.rgba(getComputedStyle(document.body).backgroundColor)).slice(0, 3);
  });
  const setPieces = new Set();
  for (const el of document.querySelectorAll('[class*="sp-"]')) {
    for (const c of el.classList) if (/^sp-[a-z-]+$/.test(c) && !c.endsWith('-host')) setPieces.add(c.slice(3));
  }
  const scenes = [...document.querySelectorAll('[data-scene]')].filter((el) => C.visible(el))
    .map((el) => ({ id: el.dataset.scene, on: el.hasAttribute('data-scene-on') && !el.hasAttribute('data-scene-off') }));
  // looping or autoplaying videos: whether they ran, sit in the first screen, and can be paused
  const loops = [...document.querySelectorAll('video')].filter((v) => v.loop || v.autoplay || v.hasAttribute('data-loop')).slice(0, 12)
    .map((v) => {
      const r = v.getBoundingClientRect();
      return { src: (v.currentSrc || v.querySelector('source')?.src || '').split('/').pop(), kit: v.hasAttribute('data-loop'), muted: v.muted,
        poster: !!v.poster, played: v.played.length > 0, firstScreen: r.height > 0 && r.top + scrollY < innerHeight,
        toggle: v.controls || !!v.parentElement?.querySelector('[data-loop-toggle]') };
    });
  return {
    scenes,
    loops,
    setPieces: [...setPieces],
    pictures: list.length,
    fullBleed: list.some((p) => p.w >= vw * 0.95),
    grounds,
  };
}
