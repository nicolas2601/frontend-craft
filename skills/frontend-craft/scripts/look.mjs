#!/usr/bin/env node
/*
  Look at the page in motion, the way a visitor scrolls it. Every section is photographed as it enters, in its
  middle and as it leaves (a tall pinned section at four points of its pass), at 1440 and 390, and the frames are
  laid out on contact sheets you open and read. Empty stages, black screens and effects that never show are seen
  here, not in a still of the first screen.

    node <skill>/scripts/look.mjs                       # the target armed by start.mjs (.craft/gate.json)
    node <skill>/scripts/look.mjs --url http://localhost:5173 | --root dist | --file index.html
         [--widths 1440,390] [--out .craft/looks] [--reduced]

  Writes <out>/<width>/sNN-<name>-<pos>.png and <out>/sheet-<width>-<n>.png (12 frames a sheet). Open every sheet.
*/
import fs from 'node:fs';
import path from 'node:path';
import { launch } from './lib/chrome.mjs';
import { open, setViewport, settle, shot, sleep, scrollTo } from './lib/page.mjs';
import { serve } from './lib/serve.mjs';
import { craftDir, isMain, parseArgs, readJson, resolveTarget } from './lib/state.mjs';

const PER_SHEET = 12;
const SETTLE_MS = 450;
const TALL = 1.5;

/** The positions to photograph a section at, as scrollY values. Pure. */
export function positionsFor({ top, height }, vh, max) {
  const at = (y) => Math.round(Math.min(max, Math.max(0, y)));
  if (height > vh * TALL) {
    const span = height - vh;
    return [0.02, 0.35, 0.68, 0.95].map((f) => ({ label: `${Math.round(f * 100)}%`, y: at(top + span * f) }));
  }
  return [
    { label: 'enter', y: at(top - vh * 0.55) },
    { label: 'middle', y: at(top + height / 2 - vh / 2) },
    { label: 'leave', y: at(top + height - vh * 0.35) },
  ];
}

function sectionsOnPage() {
  const main = document.querySelector('main') ?? document.body;
  const list = [document.querySelector('body > header, header.nav'), ...main.children, document.querySelector('body > footer, footer.site-footer')]
    .filter((el, i, a) => el && a.indexOf(el) === i && el.getBoundingClientRect().height > 40 && !['sticky', 'fixed'].includes(getComputedStyle(el).position));
  return list.map((el, i) => {
    const r = el.getBoundingClientRect();
    const name = (el.id || el.getAttribute('aria-label') || el.className?.toString().split(/\s+/)[0] || el.tagName).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 24);
    return { i, name, top: r.top + window.scrollY, height: r.height };
  });
}

function sheetHtml(frames, width) {
  const cols = width < 600 ? 4 : 2;
  const tileW = width < 600 ? 280 : 620;
  const cells = frames.map((f) => `<figure><img src="data:image/png;base64,${fs.readFileSync(f.file).toString('base64')}"><figcaption>${f.caption}</figcaption></figure>`).join('');
  return `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#e9e9e7;font:13px/1.3 system-ui,sans-serif;display:grid;grid-template-columns:repeat(${cols},${tileW}px);gap:14px}figure{margin:0}img{display:block;width:100%;border:1px solid #bbb}figcaption{padding:4px 2px;color:#222}</style>${cells}`;
}

async function sheet(browser, frames, width, file) {
  const s = await browser.newPage();
  await s.send('Page.enable');
  const cols = width < 600 ? 4 : 2;
  const tileW = width < 600 ? 280 : 620;
  await s.send('Emulation.setDeviceMetricsOverride', { width: cols * (tileW + 14) + 32, height: 900, deviceScaleFactor: 1, mobile: false });
  const html = path.join(path.dirname(file), `.${path.basename(file)}.html`);
  fs.writeFileSync(html, sheetHtml(frames, width));
  const loaded = s.once('Page.loadEventFired', 30000);
  await s.send('Page.navigate', { url: `file://${html}` });
  await loaded;
  const { result } = await s.send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true });
  await s.send('Emulation.setDeviceMetricsOverride', { width: cols * (tileW + 14) + 32, height: result.value, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  await shot(s, file);
  fs.rmSync(html, { force: true });
}

export async function look({ target, widths = [1440, 390], out, reduced = false }) {
  const server = target.root ? await serve(target.root) : null;
  const url = target.url ?? new URL(target.page ?? '', server.url).href;
  const browser = await launch();
  const sheets = [];
  try {
    for (const width of widths) {
      const dir = path.join(out, String(width));
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const s = await browser.newPage();
      for (const m of ['Page.enable', 'Runtime.enable']) await s.send(m);
      if (reduced) await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await setViewport(s, width);
      const { load } = await open(s, url);
      await settle(s, load, 1200);
      // One slow pass first, so lazy media and in-view observers have fired before the photographs.
      const { h, vh } = await s.run(() => ({ h: document.documentElement.scrollHeight, vh: innerHeight }));
      for (let y = 0; y <= h; y += Math.round(vh * 0.6)) { await scrollTo(s, y); await sleep(90); }
      await scrollTo(s, 0); await sleep(300);
      const sections = await s.run(sectionsOnPage);
      const max = Math.max(0, h - vh);
      const frames = [];
      for (const sec of sections) {
        for (const pos of positionsFor(sec, vh, max)) {
          await scrollTo(s, pos.y);
          await sleep(SETTLE_MS);
          const file = path.join(dir, `s${String(sec.i + 1).padStart(2, '0')}-${sec.name}-${pos.label.replace('%', 'pct')}.png`);
          await shot(s, file);
          frames.push({ file, caption: `#${sec.i + 1} ${sec.name} · ${pos.label}` });
        }
      }
      for (let k = 0; k < frames.length; k += PER_SHEET) {
        const file = path.join(out, `sheet-${width}-${k / PER_SHEET + 1}.png`);
        await sheet(browser, frames.slice(k, k + PER_SHEET), width, file);
        sheets.push(file);
      }
    }
  } finally {
    await browser.close();
    server?.close?.();
  }
  return sheets;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dir = craftDir();
  const target = resolveTarget(args, readJson(path.join(dir, 'gate.json')));
  if (!target) { console.error('look: nothing to look at. Pass --url, --root or --file, or run start.mjs first.'); process.exit(2); }
  const widths = String(args.widths ?? '1440,390').split(',').map(Number).filter((n) => n > 200);
  const out = path.resolve(String(args.out ?? path.join(dir, 'looks')));
  const sheets = await look({ target, widths, out, reduced: !!args.reduced });
  console.log([`Open every sheet (each frame is labelled #section · position):`, ...sheets.map((f) => `  ${path.relative(process.cwd(), f)}`),
    'For each section ask: is the subject seen, is anything empty, cut, black or unreadable, does the motion show something, would a client pay for this screen? Write it under # Review in .craft/plan.md and fix it.'].join('\n'));
}

if (isMain(import.meta.url)) main().catch((err) => { console.error(`look: ${err.message}`); process.exit(2); });
