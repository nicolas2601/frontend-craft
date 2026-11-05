#!/usr/bin/env node
// svg-craft render: SVG -> PNGs (sizes x backgrounds) and, for animated SVGs, a frame contact sheet.
// Usage: node render.mjs in.svg [--out DIR] [--sizes 640,160,32] [--bg light|dark|both] [--frames 0,0.5,1,2] [--reduced] [--mono] [--sheet]
//   --mono   silhouette test (everything becomes one ink): a logo that fails here is not ready
//   --sheet  one contact sheet PNG with every size x background rendered in this run
// Chromium is taken from CHROME_PATH, /usr/bin/chromium or /usr/bin/google-chrome-stable. Nothing leaves the machine.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def; };
const flag = (name) => args.includes(`--${name}`);
if (!input) { console.error('usage: render.mjs in.svg [--out DIR] [--sizes 640,160,32] [--bg light|dark|both] [--frames 0,0.5,1] [--reduced]'); process.exit(2); }

const svgPath = resolve(input);
const outDir = resolve(opt('out', join(process.cwd(), 'svg-render')));
const sizes = opt('sizes', '640').split(',').map(Number).filter(Boolean);
const bgs = opt('bg', 'both') === 'both' ? ['light', 'dark'] : [opt('bg', 'both')];
const frames = opt('frames', '').split(',').filter(Boolean).map(Number);
const BG = { light: '#f4f1ea', dark: '#0e1412', transparent: 'transparent' };
mkdirSync(outDir, { recursive: true });

const exe = [process.env.CHROME_PATH, '/usr/bin/chromium', '/usr/bin/google-chrome-stable'].find((p) => p && existsSync(p));
if (!exe) { console.error('No Chromium found. Set CHROME_PATH.'); process.exit(2); }
const svgText = readFileSync(svgPath, 'utf8');
const stem = basename(svgPath).replace(/\.svg$/i, '');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const written = [];

async function shot(size, bg, t) {
  const page = await browser.newPage({ viewport: { width: size + 40, height: size + 40 }, deviceScaleFactor: 2 });
  if (flag('reduced')) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setContent(`<!doctype html><body style="margin:0;background:${BG[bg]};display:grid;place-items:center;min-height:100vh"><div id="box" style="width:${size}px;height:${size}px;display:grid;place-items:center">${svgText.replace(/<\?xml[^>]*\?>/, '')}</div></body>`);
  await page.evaluate(([s, mono]) => {
    const el = document.querySelector('#box svg');
    if (!el) throw new Error('no <svg> parsed');
    el.removeAttribute('width'); el.removeAttribute('height');
    if (mono) el.style.filter = 'brightness(0)';
    el.style.width = `${s}px`; el.style.height = `${s}px`; el.style.maxWidth = '100%'; el.style.maxHeight = '100%';
  }, [size, flag('mono')]);
  if (t !== undefined) {
    await page.evaluate((sec) => {
      const el = document.querySelector('#box svg');
      if (el.pauseAnimations) { el.pauseAnimations(); el.setCurrentTime(sec); }
      document.getAnimations().forEach((a) => { a.pause(); a.currentTime = sec * 1000; });
    }, t);
  }
  await page.waitForTimeout(120);
  const name = `${stem}.${size}px.${bg}${t !== undefined ? `.t${t}` : ''}${flag('reduced') ? '.reduced' : ''}${flag('mono') ? '.mono' : ''}.png`;
  await page.locator('#box').screenshot({ path: join(outDir, name) });
  await page.close();
  written.push(name);
  return name;
}

for (const bg of bgs) for (const s of sizes) await shot(s, bg, undefined);
if (frames.length) {
  const fs = [];
  for (const t of frames) fs.push(await shot(sizes[0], bgs[0], t));
  const sheet = join(outDir, `${stem}.frames.html`);
  writeFileSync(sheet, `<body style="margin:0;background:#222;display:flex;gap:8px;flex-wrap:wrap;padding:8px">${fs.map((f, i) => `<figure style="margin:0;color:#ddd;font:12px monospace"><img src="${f}" width="${Math.round(sizes[0] * 0.6)}"><figcaption>t=${frames[i]}s</figcaption></figure>`).join('')}</body>`);
  const page = await browser.newPage({ viewport: { width: Math.min(1800, frames.length * (Math.round(sizes[0] * 0.6) + 16) + 16), height: Math.round(sizes[0] * 0.6) + 60 } });
  await page.goto(pathToFileURL(sheet).href);
  const sheetPng = `${stem}.frames.png`;
  await page.screenshot({ path: join(outDir, sheetPng), fullPage: true });
  written.push(sheetPng);
  await page.close();
}
if (flag('sheet')) {
  const png = written.filter((w) => !w.includes('frames'));
  const sheet = join(outDir, `${stem}.sheet.html`);
  writeFileSync(sheet, `<body style="margin:0;background:#888;display:flex;gap:10px;flex-wrap:wrap;padding:10px;align-items:flex-end">${png.map((f) => `<figure style="margin:0;font:11px monospace;color:#fff"><img src="${f}" style="image-rendering:auto"><figcaption>${f.replace(stem + '.', '')}</figcaption></figure>`).join('')}</body>`);
  const page = await browser.newPage({ viewport: { width: 1400, height: 400 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(sheet).href);
  await page.screenshot({ path: join(outDir, `${stem}.sheet.png`), fullPage: true });
  written.push(`${stem}.sheet.png`);
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ outDir, files: written }, null, 1));
