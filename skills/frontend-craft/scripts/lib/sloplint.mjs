// Hallmark's sloplint (bundled skill) run on the page's own files: its catalogue of machine-made tells joins the check.
// The kit's files are frontend-craft's and follow their own token conventions, so only the page and its own
// stylesheets are linted. Gates every page should pass fail; the rest, and Hallmark's house conventions, warn.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HOME = process.env.HOME ?? process.env.USERPROFILE ?? '';
const PLACES = [
  path.join(SKILL, '..', 'hallmark'),
  path.join(HOME, '.agents', 'skills', 'hallmark'),
  path.join(HOME, '.claude', 'skills', 'hallmark'),
  path.join(HOME, '.config', 'opencode', 'skills', 'hallmark'),
];
const TIMEOUT_MS = 120_000;
const MAX_PER_GATE = 2;

/**
 * Floor gates that hold on any page, whatever its system: template punctuation, eyebrows and tracked-caps labels,
 * an italic word in a heading, purple gradients, a card in a card, emoji icons, drawn browser windows, invented
 * proof, a fake send, motion with no reduced-motion fallback, focus that fades in, autoplay with sound.
 */
export const HARD = new Set(['2a', '4', '10a', '15', '17', '18', '19', '26a', '27', '28a', '30a', '33', '38i', '46a', '47a', '54', '55a', '63', '67', '70']);
/** Hallmark's own conventions, which frontend-craft's kit answers differently (its stamp, its token names, its spacing tokens). */
export const SKIP = new Set(['20', '24a', '48']);

export function sloplintScript() {
  for (const dir of PLACES) {
    const file = path.join(dir, 'scripts', 'sloplint.mjs');
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/** The page file and the stylesheets it links that are not in the kit folder. */
export function pageFiles(root, page = 'index.html', kitDir = 'craft') {
  const rel = (page || 'index.html').replace(/^\//, '');
  const html = [rel, `${rel}.html`, path.join(rel, 'index.html')].map((p) => path.resolve(root, p)).find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  if (!html) return [];
  const kit = path.resolve(root, kitDir);
  const css = [...fs.readFileSync(html, 'utf8').matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi)]
    .map((m) => /href=["']([^"']+)["']/i.exec(m[0])?.[1])
    .filter((href) => href && !/^(https?:)?\/\//.test(href))
    .map((href) => { const clean = href.split(/[?#]/)[0]; return clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(html), clean); })
    .filter((f) => fs.existsSync(f) && !f.startsWith(kit + path.sep));
  return [html, ...new Set(css)];
}

/**
 * sloplint's JSON to check findings. Pure. A finding in the kit's own files (kit: its folder) stays a warning: those
 * rules are frontend-craft's, read through its tokens, and its own probes measure them on the rendered page.
 */
export function mapSloplint(json, { kit = null } = {}) {
  const counts = new Map();
  const out = [];
  for (const x of json?.findings ?? []) {
    if (SKIP.has(x.gate) || x.grade === 'WARN') continue;
    const n = (counts.get(x.gate) ?? 0) + 1;
    counts.set(x.gate, n);
    if (n > MAX_PER_GATE) continue;
    const inKit = kit && path.resolve(x.file ?? '').startsWith(kit + path.sep);
    const level = x.grade === 'FAIL' && HARD.has(x.gate) && !inKit ? 'FAIL' : 'WARN';
    out.push({ level, id: `hallmark/${x.gate}`, msg: `${String(x.evidence ?? '').replace(/\s+/g, ' ').slice(0, 140)} (${path.basename(x.file ?? '')}:${x.line ?? '?'})`, fix: String(x.fix ?? 'see hallmark references/gates.md').slice(0, 220) });
  }
  return out;
}

/** Run sloplint on the page's files. Resolves to { findings, ran, note }; never throws. */
export function runSloplint(files, { kit = null } = {}) {
  const script = sloplintScript();
  if (!script) return Promise.resolve({ findings: [], ran: false, note: 'hallmark is not installed next to frontend-craft: its sloplint did not run' });
  if (!files.length) return Promise.resolve({ findings: [], ran: false, note: 'no page file to lint (a dev-server target): run hallmark sloplint on the source yourself' });
  return new Promise((resolve) => {
    execFile(process.execPath, [script, ...files, '--json', '--scope', 'page'], { timeout: TIMEOUT_MS, maxBuffer: 16 << 20 }, (err, stdout) => {
      try {
        resolve({ findings: mapSloplint(JSON.parse(stdout || '{}'), { kit }), ran: true, note: null });
      } catch {
        resolve({ findings: [], ran: false, note: `hallmark sloplint did not return JSON${err ? ` (${err.message.split('\n')[0]})` : ''}` });
      }
    });
  });
}
