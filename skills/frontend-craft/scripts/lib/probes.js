// In-page probes. Each runs after installHelpers() and returns plain JSON.

export function probeDocument() {
  const C = window.__craft;
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
  const h1s = [...document.querySelectorAll('h1')].filter(C.visible);
  const h1 = h1s[0];
  const h1cs = h1 ? getComputedStyle(h1) : null;
  const italicInH1 = h1 ? [h1, ...h1.querySelectorAll('*')].some((n) => getComputedStyle(n).fontStyle === 'italic') : false;
  const fonts = [...document.fonts].map((f) => ({ family: f.family.replace(/^['"]|['"]$/g, ''), status: f.status }));
  const imgs = [...document.images].map((img) => ({
    src: (img.currentSrc || img.src || '').slice(0, 120),
    noAlt: !img.hasAttribute('alt'),
    broken: img.complete && img.naturalWidth === 0 && !!(img.currentSrc || img.src),
  }));
  const text = C.textEls().filter((el) => C.visible(el) && !C.srOnly(el)).map((el) => C.ownText(el)).join('\n');
  const ctas = [...document.querySelectorAll('a[href], button, [role="button"]')].filter(C.visible)
    .map((el) => el.textContent.replace(/\s+/g, ' ').trim()).filter((t) => t && t.length < 40).slice(0, 30);
  return {
    ctas,
    title: document.title.trim(),
    lang: document.documentElement.lang || '',
    viewport: meta('viewport'),
    description: meta('description'),
    h1Count: h1s.length,
    h1: h1 ? {
      text: (() => { const c = h1.cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove()); return c.textContent.replace(/\s+/g, ' ').trim().slice(0, 160); })(),
      family: C.firstFamily(h1cs.fontFamily),
      stack: h1cs.fontFamily,
      weight: h1cs.fontWeight,
      size: Number.parseFloat(h1cs.fontSize),
      italic: italicInH1,
    } : null,
    bodyFamily: C.firstFamily(getComputedStyle(document.body).fontFamily),
    fonts,
    imgs,
    text: text.slice(0, 30000),
  };
}

/** Colors and patterns that read as a generated default. */
export function probeLook() {
  const C = window.__craft;
  const vw = innerWidth;
  const vh = innerHeight;
  const counts = new Map();
  for (let i = 1; i <= 4; i += 1) {
    for (let j = 1; j <= 3; j += 1) {
      const el = document.elementFromPoint((vw * i) / 5, (vh * j) / 4);
      if (!el) continue;
      const bg = C.bgOf(el);
      const key = bg.image ? 'image' : bg.color.slice(0, 3).join(',');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '255,255,255';
  const accents = new Map();
  const add = (c) => { if (c[3] > 0.5) { const k = c.slice(0, 3).join(','); accents.set(k, (accents.get(k) ?? 0) + 1); } };
  for (const el of document.querySelectorAll('a, button, [role="button"], h1 *, h2 *, em, mark, strong')) {
    if (!C.visible(el)) continue;
    const cs = getComputedStyle(el);
    add(C.rgba(cs.color));
    add(C.rgba(cs.backgroundColor));
  }
  let monoLabels = 0;
  for (const el of C.textEls()) {
    const cs = getComputedStyle(el);
    const mono = /mono|courier|consolas|menlo|code/i.test(cs.fontFamily);
    if (mono && cs.textTransform === 'uppercase' && Number.parseFloat(cs.letterSpacing) > 0.5) monoLabels += 1;
  }
  let purpleGradient = false;
  let glowOrbs = 0;
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.top > vh || r.bottom < 0) continue;
    const cs = getComputedStyle(el);
    if (/gradient/.test(cs.backgroundImage)) {
      const stops = cs.backgroundImage.match(/rgba?\([^)]+\)|oklch\([^)]+\)|#[0-9a-f]{3,8}/gi) ?? [];
      if (stops.some((s) => { const [h, sat] = C.hsl(C.rgba(s)); return h >= 245 && h <= 300 && sat > 40; })) purpleGradient = true;
    }
    const blur = cs.filter.match(/blur\(([\d.]+)px\)/);
    if (blur && Number(blur[1]) >= 40 && Number.parseFloat(cs.borderRadius) > 0) glowOrbs += 1;
  }
  const equalRows = [];
  for (const parent of document.querySelectorAll('body *')) {
    const kids = [...parent.children].filter(C.visible);
    if (kids.length < 3 || kids.length > 6) continue;
    const boxes = kids.map((k) => ({ r: k.getBoundingClientRect(), cs: getComputedStyle(k) }));
    const w0 = boxes[0].r.width;
    const sameRow = boxes.every((b) => Math.abs(b.r.top - boxes[0].r.top) < 4 && Math.abs(b.r.width - w0) < 3);
    const carded = boxes.every((b) => Number.parseFloat(b.cs.borderRadius) > 4
      && (C.rgba(b.cs.backgroundColor)[3] > 0.1 || Number.parseFloat(b.cs.borderTopWidth) > 0));
    if (sameRow && carded && w0 > 160) equalRows.push(C.describe(parent));
  }
  let eyebrows = 0;
  const h2s = [...document.querySelectorAll('h2')].filter(C.visible);
  for (const h2 of h2s) {
    const prev = h2.previousElementSibling;
    if (!prev) continue;
    const cs = getComputedStyle(prev);
    if (cs.textTransform === 'uppercase' && Number.parseFloat(cs.fontSize) < 15) eyebrows += 1;
  }
  return {
    dominantBg: dominant === 'image' ? null : dominant.split(',').map(Number),
    accents: [...accents.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k.split(',').map(Number)),
    monoLabels,
    purpleGradient,
    glowOrbs,
    equalRows: equalRows.slice(0, 3),
    eyebrows,
    h2Count: h2s.length,
  };
}

/** Text that falls below the readable size or the WCAG contrast ratio. */
export function probeText({ minPx }) {
  const C = window.__craft;
  const small = [];
  const lowContrast = [];
  for (const el of C.textEls()) {
    if (!C.visible(el) || C.srOnly(el) || C.hiddenFromAT(el)) continue;
    const cs = getComputedStyle(el);
    const size = Number.parseFloat(cs.fontSize);
    if (size < minPx) small.push(`${C.describe(el)} ${size}px`);
    if (C.opacity(el) < 0.9) continue;
    const bg = C.bgOf(el);
    if (bg.image) continue;
    const fg = C.rgba(cs.color);
    if (fg[3] < 0.5) continue;
    const ratio = C.contrast(fg, bg.color);
    const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) lowContrast.push(`${C.describe(el)} ${ratio.toFixed(2)}:1`);
  }
  // SVG labels scale with their viewBox: measure the rendered size, not the declared one.
  for (const t of document.querySelectorAll('svg text')) {
    if (!t.textContent.trim() || !C.visible(t) || C.hiddenFromAT(t.closest('svg'))) continue;
    const scale = t.getScreenCTM()?.a ?? 1;
    const px = Number.parseFloat(getComputedStyle(t).fontSize) * scale;
    if (px < minPx - 1) small.push(`svg text "${t.textContent.trim().slice(0, 30)}" ${px.toFixed(1)}px rendered`);
  }
  return { small: small.slice(0, 8), lowContrast: lowContrast.slice(0, 8), lowContrastCount: lowContrast.length };
}

export function probeOverflow() {
  const C = window.__craft;
  const width = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  const offenders = [];
  if (scrollWidth > width + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > width + 1 && r.width > 0 && C.visible(el)) offenders.push(`${C.describe(el)} right=${Math.round(r.right)}`);
      if (offenders.length >= 4) break;
    }
  }
  return { width, scrollWidth, offenders };
}

export function probeTargets() {
  const C = window.__craft;
  const tiny = [];
  const small = [];
  const sel = 'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
  for (const el of document.querySelectorAll(sel)) {
    if (!C.visible(el) || C.hiddenFromAT(el)) continue;
    const r = el.getBoundingClientRect();
    const parent = el.parentElement;
    const inline = el.tagName === 'A' && parent && ['P', 'LI', 'SPAN', 'TD', 'FIGCAPTION', 'SMALL', 'LABEL'].includes(parent.tagName)
      && parent.textContent.trim().length > el.textContent.trim().length + 10;
    if (inline) continue;
    if (r.width < 24 || r.height < 24) tiny.push(`${C.describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    else if (r.width < 44 || r.height < 44) small.push(`${C.describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  return { tiny: tiny.slice(0, 6), small: small.slice(0, 6), smallCount: small.length };
}

/** Text the visitor can never see: still transparent or fully clipped after the page was scrolled. */
export function probeInvisible() {
  const C = window.__craft;
  const lost = [];
  for (const el of C.textEls()) {
    if (!C.visible(el) || C.srOnly(el) || C.hiddenFromAT(el)) continue;
    if (el.closest('dialog:not([open]), [popover]:not(:popover-open), details:not([open])')) continue;
    const clip = getComputedStyle(el).clipPath;
    const clipped = /inset\((100%|[^)]*\b100%)/.test(clip);
    if (C.opacity(el) < 0.05 || clipped) lost.push(C.describe(el));
    if (lost.length >= 8) break;
  }
  return lost;
}

/** Record the animated state of every candidate element; diff two calls to find motion. */
export function probeMotionState() {
  const C = window.__craft;
  if (!window.__craftEls) {
    const els = [];
    for (const el of document.querySelectorAll('body *')) {
      if (['SCRIPT', 'STYLE', 'LINK', 'META', 'BR'].includes(el.tagName)) continue;
      els.push(el);
      if (els.length >= 2000) break;
    }
    window.__craftEls = els;
  }
  return window.__craftEls.map((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return [
      Number.parseFloat(cs.opacity).toFixed(2), cs.transform, cs.translate, cs.scale, cs.rotate, cs.clipPath,
      cs.filter, cs.getPropertyValue('--p').trim(), cs.backgroundPosition,
      Math.round(r.top + scrollY), cs.position === 'sticky' ? 'sticky' : '', C.describe(el).slice(0, 60),
    ];
  });
}

export function probeSticky() {
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (getComputedStyle(el).position !== 'sticky') continue;
    const host = el.parentElement;
    if (host && host.getBoundingClientRect().height > innerHeight * 1.4) out.push(window.__craft.describe(host));
    if (out.length >= 6) break;
  }
  return out;
}

export function probeCss() {
  const all = [];
  const vh100 = [];
  const easeIn = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.transitionProperty.split(',').map((s) => s.trim()).includes('all') && cs.transitionDuration !== '0s') {
      all.push(window.__craft.describe(el));
    }
    if (/(^|,\s*)ease-in(\s*,|$)/.test(cs.transitionTimingFunction) && cs.transitionDuration !== '0s') easeIn.push(window.__craft.describe(el));
    if (all.length >= 6) break;
  }
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules ?? []) {
      const css = rule.cssText ?? '';
      if (/(min-)?height:\s*100vh/.test(css)) vh100.push(css.slice(0, 80));
    }
  }
  return { transitionAll: all, easeIn: easeIn.slice(0, 4), vh100: vh100.slice(0, 4) };
}
