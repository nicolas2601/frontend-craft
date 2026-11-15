#!/usr/bin/env node
// svg-craft lint: structural, accessibility, safety and motion checks for an SVG file (real DOM via Chromium).
// Usage: node lint.mjs file.svg [--json] [--max-kb 60] [--strict]
// Exit code 1 when any ERROR is found (or any WARN with --strict).
import { chromium } from 'playwright-core';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) { console.error('usage: lint.mjs file.svg [--json] [--max-kb 60] [--strict]'); process.exit(2); }
const maxKb = Number(args[args.indexOf('--max-kb') + 1]) || 60;
const path = resolve(file);
const text = readFileSync(path, 'utf8');
const bytes = statSync(path).size;
const exe = [process.env.CHROME_PATH, '/usr/bin/chromium', '/usr/bin/google-chrome-stable'].find((p) => p && existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(`<!doctype html><body></body>`);
const report = await page.evaluate((src) => {
  const out = { errors: [], warns: [], info: {} };
  const E = (m) => out.errors.push(m), W = (m) => out.warns.push(m);
  const doc = new DOMParser().parseFromString(src, 'image/svg+xml');
  const bad = doc.querySelector('parsererror');
  if (bad) { E('XML parse error: ' + bad.textContent.trim().split('\n')[0]); return out; }
  const svg = doc.documentElement;
  if (svg.localName !== 'svg') { E('root element is not <svg>'); return out; }
  if (svg.namespaceURI !== 'http://www.w3.org/2000/svg') E('missing xmlns="http://www.w3.org/2000/svg"');
  const vb = svg.getAttribute('viewBox');
  if (!vb) E('missing viewBox (needed to scale)'); else if (vb.trim().split(/[\s,]+/).length !== 4) E('malformed viewBox');
  const all = [...svg.querySelectorAll('*')];
  out.info.elements = all.length;
  // safety
  for (const el of [svg, ...all]) {
    const n = el.localName;
    if (n === 'script') E('<script> found: SVGs must not carry scripts');
    if (n === 'foreignObject') W('<foreignObject>: breaks in <img>, design tools and many renderers');
    for (const a of [...el.attributes]) {
      if (/^on/i.test(a.name)) E(`inline event handler ${a.name} on <${n}>`);
      if ((a.name === 'href' || a.name === 'xlink:href') && /^(https?:)?\/\//i.test(a.value)) E(`external reference <${n} ${a.name}="${a.value.slice(0, 60)}">`);
      if (/javascript:/i.test(a.value)) E(`javascript: URL in <${n}>`);
    }
  }
  // ids and references
  const ids = new Map();
  for (const el of all) { const id = el.getAttribute('id'); if (id) ids.set(id, (ids.get(id) || 0) + 1); }
  for (const [id, c] of ids) if (c > 1) E(`duplicate id "${id}" (${c}x): collides when two SVGs share a page`);
  const refs = new Set();
  const urlRe = /url\(\s*['"]?#([^)'"\s]+)/g;
  for (const el of [svg, ...all]) {
    for (const a of [...el.attributes]) {
      let m; while ((m = urlRe.exec(a.value))) refs.add(m[1]);
      if ((a.name === 'href' || a.name === 'xlink:href') && a.value.startsWith('#')) refs.add(a.value.slice(1));
    }
  }
  const styleText = all.filter((e) => e.localName === 'style').map((e) => e.textContent).join('\n');
  { let m; while ((m = urlRe.exec(styleText))) refs.add(m[1]); }
  for (const r of refs) if (!ids.has(r)) E(`reference to missing id "#${r}"`);
  for (const id of ids.keys()) if (!refs.has(id) && !new RegExp(`#${id}\\b`).test(styleText) && !src.includes(`"${id}.`) && !/^(logo|art|fig|icon|scene)/.test(id)) out.info.unusedIds = (out.info.unusedIds || []).concat(id);
  // accessibility
  const title = svg.querySelector(':scope > title');
  const labelled = svg.getAttribute('aria-label') || svg.getAttribute('aria-labelledby');
  const decorative = svg.getAttribute('aria-hidden') === 'true';
  if (!decorative && !title && !labelled) W('no <title>/aria-label: add one, or aria-hidden="true" if decorative');
  if (title && !svg.getAttribute('role')) W('has <title> but no role="img" on <svg>');
  // text and fonts
  const texts = all.filter((e) => e.localName === 'text');
  out.info.textNodes = texts.length;
  const fams = new Set();
  for (const el of [...texts, ...all.filter((e) => e.hasAttribute('font-family'))]) { const f = el.getAttribute('font-family'); if (f) fams.add(f); }
  { const m = styleText.match(/font-family:\s*([^;}]+)/g) || []; m.forEach((x) => fams.add(x.replace(/font-family:\s*/, ''))); }
  const generic = /(sans-serif|serif|monospace|system-ui|ui-sans-serif|ui-monospace)\s*$/i;
  for (const f of fams) if (!generic.test(f.trim())) W(`font-family "${f}" has no generic fallback; text will reflow when the font is missing (outline text to paths for logos)`);
  // colors
  const colors = new Set((src.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []).map((c) => c.toLowerCase()));
  out.info.distinctHexColors = colors.size;
  if (colors.has('#000') || colors.has('#000000')) W('pure #000 used: prefer a warm/tinted ink so it sits with the palette');
  // motion
  const smil = all.filter((e) => /^(animate|animateTransform|animateMotion|set)$/.test(e.localName)).length;
  const css = /@keyframes|animation\s*:|animation-name/.test(styleText + src.replace(/<style[\s\S]*?<\/style>/g, ''));
  out.info.animated = smil > 0 || css; out.info.smilNodes = smil;
  if (out.info.animated) {
    if (!/prefers-reduced-motion/.test(src)) W('animated but no @media (prefers-reduced-motion: reduce) rule (SMIL needs it too: hide/stop via CSS or provide a static state)');
    if (smil && /repeatCount="indefinite"/.test(src) && !/prefers-reduced-motion/.test(src)) W('infinite SMIL loop with no reduced-motion fallback');
    if (/stroke-dashoffset/.test(src) && !/pathLength|getTotalLength|stroke-dasharray/.test(src)) W('stroke-dashoffset animation without a dasharray/pathLength');
    if (/transform-box|transform-origin/.test(src) === false && /scale\(|rotate\(/.test(styleText)) W('CSS transform on SVG shapes without transform-box/transform-origin: it will pivot around (0,0)');
  }
  // weight
  const filters = all.filter((e) => e.localName === 'filter').length;
  out.info.filters = filters;
  if (filters > 4) W(`${filters} <filter> elements: expensive to rasterise, especially animated`);
  if (/data:image\/(png|jpe?g|webp)/.test(src)) W('embedded raster (base64): this is not a vector asset any more');
  const unclosedRound = all.filter((e) => e.getAttribute('stroke-width') === '0').length; if (unclosedRound) W('stroke-width="0" elements (dead weight)');
  return out;
}, text);
if (!report.errors.some((m) => m.startsWith('XML parse error') || m.startsWith('root element'))) {
  await page.setContent(`<!doctype html><body style="margin:0">${text}</body>`);
  const geo = await page.evaluate(geometry);
  if (geo) {
    report.info.labelOverlaps = geo.overlaps.length;
    report.info.textCut = geo.cut.length;
    report.info.looseEnds = geo.loose.length;
    if (geo.overlaps.length) report.warns.push(`${geo.overlaps.length} label pair(s) overlap: ${geo.overlaps.slice(0, 4).join('; ')}`);
    if (geo.cut.length) report.errors.push(`text cut by the viewBox edge: ${geo.cut.slice(0, 4).join('; ')}`);
    if (geo.loose.length) report.warns.push(`${geo.loose.length} leader(s) end in empty space (a line from a label must end on the shape it names, or on a dot): ${geo.loose.slice(0, 4).join('; ')}`);
  }
}
await browser.close();

/**
 * Geometry a screenshot can hide (the idea of anatomy's audit, for flat figures): labels that overlap,
 * text cut by the viewBox, and leaders (an open line starting at a label) whose far end touches nothing.
 * Runs in the page on the rendered SVG, sized so one user unit is one CSS pixel.
 */
function geometry() {
  const svg = document.querySelector('body > svg');
  const vb = svg?.viewBox?.baseVal;
  if (!svg || !vb || !vb.width || !vb.height) return null;
  svg.style.width = `${vb.width}px`;
  svg.style.height = `${vb.height}px`;
  const hidden = (el) => el.closest('defs, clipPath, mask, symbol, marker, pattern') || getComputedStyle(el).display === 'none' || getComputedStyle(el).visibility === 'hidden';
  const name = (el) => `<${el.localName}${el.id ? ` id="${el.id}"` : ''}>${el.localName === 'text' ? ` "${el.textContent.trim().slice(0, 24)}"` : ''}`;
  const box = svg.getBoundingClientRect();
  const texts = [...svg.querySelectorAll('text')].filter((t) => !hidden(t) && t.textContent.trim());
  const rects = texts.map((t) => t.getBoundingClientRect());
  const out = { overlaps: [], cut: [], loose: [] };
  const EDGE = 0.5, SHARE = 0.15, NEAR = 1.5, MIN_LINE = 24, LEADER = 24;
  for (let i = 0; i < texts.length; i++) {
    const a = rects[i];
    if (a.left < box.left - EDGE || a.top < box.top - EDGE || a.right > box.right + EDGE || a.bottom > box.bottom + EDGE) out.cut.push(name(texts[i]));
    for (let j = i + 1; j < texts.length; j++) {
      const b = rects[j];
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w <= 0 || h <= 0) continue;
      const small = Math.min(a.width * a.height, b.width * b.height) || 1;
      if ((w * h) / small > SHARE) out.overlaps.push(`${name(texts[i])} and ${name(texts[j])}`);
    }
  }
  if (!texts.length) return out;
  const shapes = [...svg.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse')].filter((el) => !hidden(el)).slice(0, 2000);
  const open = shapes.filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.stroke === 'none' || (cs.fill !== 'none' && el.localName !== 'line')) return false;
    if (el.localName === 'path' && /z\s*$/i.test(el.getAttribute('d') || '')) return false;
    return ['path', 'line', 'polyline'].includes(el.localName) && el.getTotalLength() >= MIN_LINE;
  });
  const toScreen = (el, p) => { const m = el.getScreenCTM(); return new DOMPoint(p.x, p.y).matrixTransform(m); };
  const touches = (el, s) => {
    const local = s.matrixTransform(el.getScreenCTM().inverse());
    return el.isPointInFill(local) || el.isPointInStroke(local);
  };
  const ring = (s) => [[0, 0], [NEAR, 0], [-NEAR, 0], [0, NEAR], [0, -NEAR]].map(([dx, dy]) => new DOMPoint(s.x + dx, s.y + dy));
  const nearLabel = (s, d) => rects.some((r) => s.x >= r.left - d && s.x <= r.right + d && s.y >= r.top - d && s.y <= r.bottom + d);
  // A leader starts at a label and must end on the thing it names; other open strokes are drawing, not checked.
  for (const el of open) {
    const len = el.getTotalLength();
    const [a, b] = [el.getPointAtLength(0), el.getPointAtLength(len)].map((p) => toScreen(el, p));
    const [la, lb] = [nearLabel(a, LEADER), nearLabel(b, LEADER)];
    if (la === lb) continue;
    const far = la ? b : a;
    const held = shapes.some((o) => o !== el && ring(far).some((p) => touches(o, p)));
    if (!held) out.loose.push(`${name(el)} at ${Math.round(far.x - box.left)},${Math.round(far.y - box.top)}`);
  }
  return out;
}
report.info.kb = +(bytes / 1024).toFixed(1);
if (report.info.kb > maxKb) report.warns.push(`file is ${report.info.kb} kB (> ${maxKb} kB budget): run optimize.mjs or simplify`);
if (args.includes('--json')) console.log(JSON.stringify(report, null, 1));
else {
  console.log(`${file}  ${report.info.kb} kB  elements:${report.info.elements ?? '?'}  colors:${report.info.distinctHexColors ?? '?'}  animated:${report.info.animated ?? '?'}`);
  report.errors.forEach((m) => console.log('  ERROR ' + m));
  report.warns.forEach((m) => console.log('  warn  ' + m));
  if (!report.errors.length && !report.warns.length) console.log('  clean');
}
process.exit(report.errors.length || (args.includes('--strict') && report.warns.length) ? 1 : 0);
