// impeccable's detector (bundled skill) run on the rendered page: its slop catalogue joins the check.
// Local only: the detector renders the URL in the local Chrome; telemetry is switched off for the call.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HOME = process.env.HOME ?? process.env.USERPROFILE ?? '';
const BIN = process.platform === 'win32' ? 'impeccable.cmd' : 'impeccable';
const PLACES = [
  path.join(SKILL, '..', 'impeccable'),
  path.join(HOME, '.agents', 'skills', 'impeccable'),
  path.join(HOME, '.claude', 'skills', 'impeccable'),
  path.join(HOME, '.config', 'opencode', 'skills', 'impeccable'),
];
const TIMEOUT_MS = 150_000;

/**
 * Slop rules a dealt direction may ask for on purpose stay warnings: a marquee band, a huge headline,
 * tight display tracking, hard offset shadows. Everything else in the slop catalogue fails.
 */
export const SOFT = new Set(['oversized-h1', 'marquee', 'extreme-negative-tracking', 'hard-offset-shadow', 'blinking-cursor', 'bounce-easing']);

export function impeccableBin() {
  for (const dir of PLACES) {
    const bin = path.join(dir, 'scripts', BIN);
    if (fs.existsSync(bin)) return bin;
  }
  return null;
}

/**
 * Map detector output to check findings. Pure. soft: extra rule ids that stay warnings because the
 * deal chose them (a cream palette the deal dealt, a display face the deal picked).
 */
export function mapDetector(rows = [], { soft = [] } = {}) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    if (r.severity === 'advisory' || seen.has(r.antipattern)) continue;
    seen.add(r.antipattern);
    const fail = r.severity === 'error' || (r.category === 'slop' && !SOFT.has(r.antipattern) && !soft.includes(r.antipattern));
    out.push({ level: fail ? 'FAIL' : 'WARN', id: `impeccable/${r.antipattern}`, msg: `${r.name}: ${String(r.snippet ?? '').replace(/\s+/g, ' ').slice(0, 120)}`, fix: String(r.description ?? '').slice(0, 220) });
  }
  return out;
}

/** Run the detector on a URL. Resolves to { findings, ran, note }; never throws. */
export function runDetector(url, { viewport = '1440x900', soft = [] } = {}) {
  const bin = impeccableBin();
  if (!bin) return Promise.resolve({ findings: [], ran: false, note: 'impeccable is not installed next to frontend-craft: its detector did not run' });
  const env = { ...process.env, DO_NOT_TRACK: '1', IMPECCABLE_NO_TELEMETRY: '1' };
  return new Promise((resolve) => {
    execFile(bin, ['detect', url, '--json', '--no-advisory', '--viewport', viewport], { env, timeout: TIMEOUT_MS, maxBuffer: 8 << 20 }, (err, stdout) => {
      try {
        const rows = JSON.parse(stdout || '[]');
        resolve({ findings: mapDetector(Array.isArray(rows) ? rows : [], { soft }), ran: true, note: null });
      } catch {
        resolve({ findings: [], ran: false, note: `impeccable detect did not return JSON${err ? ` (${err.message.split('\n')[0]})` : ''}` });
      }
    });
  });
}
