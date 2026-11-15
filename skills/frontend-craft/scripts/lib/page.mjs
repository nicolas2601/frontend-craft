// Page-level helpers on top of a CDP session: viewport, navigation, scrolling, screenshots, motion diffs.
import fs from 'node:fs';
import { installHelpers } from './helpers.js';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function setViewport(s, width, height = width < 600 ? 844 : 900) {
  const mobile = width < 600;
  await s.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await s.send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
  await sleep(250);
}

/** Navigate and resolve at DOMContentLoaded; the load event is awaited separately. */
export async function open(s, url) {
  const dcl = s.once('Page.domContentEventFired', 45000);
  const load = s.once('Page.loadEventFired', 60000);
  const res = await s.send('Page.navigate', { url });
  if (res.errorText) throw new Error(`cannot open ${url}: ${res.errorText}. Start the dev server or pass --root <build folder>.`);
  await dcl;
  return { load };
}

export async function settle(s, load, ms) {
  await load.catch(() => {});
  await s.run(() => document.fonts.ready.then(() => true)).catch(() => {});
  await sleep(ms);
  await s.run(installHelpers);
}

export const scrollTo = (s, y) => s.run((top) => { window.scrollTo({ top, behavior: 'instant' }); return window.scrollY; }, y);

export const pageHeight = (s) => s.run(() => ({ h: document.documentElement.scrollHeight, vh: innerHeight }));

export async function shot(s, file) {
  const { data } = await s.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  return file;
}

const num = (v) => {
  const m = String(v).match(/-?\d+(\.\d+)?/g);
  return m ? m.map(Number) : [];
};
function differs(a, b) {
  if (a === b) return false;
  const [x, y] = [num(a), num(b)];
  if (x.length !== y.length || !x.length) return a !== b;
  // Unit-sized values (opacity, --p, scale factors) move by hundredths; pixel values by half a pixel.
  return x.some((v, i) => Math.abs(v - y[i]) > (Math.abs(v) <= 2 && Math.abs(y[i]) <= 2 ? 0.02 : 0.5));
}
// 13: stroke-dashoffset, so a line drawn by its own scroll code counts as motion too.
const FIELDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 13];

/** Indexes of elements whose animated state differs between two snapshots. */
export function changed(a, b, filter = () => true) {
  const out = [];
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (!filter(a[i], i)) continue;
    if (FIELDS.some((k) => differs(a[i][k], b[i][k]))) out.push(i);
  }
  return out;
}

/** Collect console errors, exceptions and failed requests for the session. */
export function watchRuntime(s) {
  const consoleErrors = [];
  const network = [];
  s.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') consoleErrors.push(p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 160));
  });
  s.on('Runtime.exceptionThrown', (p) => consoleErrors.push((p.exceptionDetails.exception?.description ?? p.exceptionDetails.text).split('\n')[0].slice(0, 160)));
  const urls = new Map();
  s.on('Network.requestWillBeSent', (p) => urls.set(p.requestId, p.request.url));
  s.on('Network.responseReceived', (p) => { if (p.response.status >= 400) network.push(`${p.response.status} ${p.response.url.slice(0, 100)}`); });
  s.on('Network.loadingFailed', (p) => {
    if (!p.canceled && p.type !== 'Ping') network.push(`${p.errorText} ${(urls.get(p.requestId) ?? '').slice(0, 100)}`);
  });
  return { consoleErrors, network };
}
