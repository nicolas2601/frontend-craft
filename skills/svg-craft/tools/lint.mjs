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
await browser.close();
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
