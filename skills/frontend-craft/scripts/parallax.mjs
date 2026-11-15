#!/usr/bin/env node
/*
  A hero loop from one photograph, free and on this machine, with no GPU and no quota: a depth map
  (Depth Anything V2 Small, Apache-2.0, on the CPU), then a slow camera move with real parallax, rendered
  as an exact loop of any length (the move is periodic, so the last frame leads into the first). The
  encode, poster and markup are video.mjs's.

    node parallax.mjs <still> [--out assets/hero] [--seconds 12] [--move drift|dolly|pan] [--amount 1]
                      [--width 1280] [--crf 27] [--depth depth.png] [--keep]
    node parallax.mjs --doctor        what is installed and what to install

  drift: a slow sway with a gentle push in (default). dolly: in and back out. pan: side to side.
  --amount scales the move (0.5 calmer, 1.5 stronger; past 1.5 the edges of near objects stretch).
  --depth takes a depth map you already have (white near, black far) and skips the model.
  The first run downloads the model once (99 MB) to ~/.cache/frontend-craft/models. Needs ffmpeg, and
  python3 with numpy and onnxruntime for the depth step. Scene motion (wind, water, people) needs a
  generated clip instead: references/hero-video.md.
*/
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain, parseArgs } from './lib/state.mjs';
import { encode, markup } from './video.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEPTH_PY = path.join(HERE, 'lib', 'depth.py');
const MODEL_URL = 'https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx';
const MODEL_MIN_BYTES = 50 * 1024 * 1024;
const DEPTH_SIDE = 518; // the model's working size; both sides must be multiples of 14
const FPS = 30;
const FOCUS = 0.35; // the depth that stays put: farther moves against the camera, nearer with it
const MOVES = {
  // fractions of the width; t runs 0..1 over the loop
  drift: (t) => ({ dx: 0.017 * Math.sin(2 * Math.PI * t), dy: 0.005 * Math.sin(4 * Math.PI * t), zoom: 0.06 * (1 - Math.cos(2 * Math.PI * t)) / 2 }),
  dolly: (t) => ({ dx: 0, dy: 0.002 * Math.sin(2 * Math.PI * t), zoom: 0.1 * (1 - Math.cos(2 * Math.PI * t)) / 2 }),
  pan: (t) => ({ dx: 0.025 * Math.sin(2 * Math.PI * t), dy: 0, zoom: 0.02 * (1 - Math.cos(2 * Math.PI * t)) / 2 }),
};
const DEFAULTS = { out: 'assets/hero', seconds: 12, move: 'drift', amount: 1, width: 1280, crf: 27 }; // a long loop needs a higher crf to stay near 1.5 MB

const even = (n) => Math.max(2, Math.round(n / 2) * 2);

export function options(args) {
  const o = { ...DEFAULTS, input: args._[0], depth: args.depth, keep: !!args.keep };
  if (args.out !== undefined) o.out = String(args.out);
  if (args.move !== undefined) o.move = String(args.move);
  for (const k of ['seconds', 'amount', 'width', 'crf']) {
    if (args[k] === undefined) continue;
    const n = Number(args[k]);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`--${k} must be a positive number, got "${args[k]}"`);
    o[k] = n;
  }
  if (!MOVES[o.move]) throw new Error(`--move must be one of ${Object.keys(MOVES).join(', ')}`);
  if (o.seconds < 4 || o.seconds > 30) throw new Error('--seconds must be between 4 and 30');
  if (o.amount > 2) throw new Error('--amount above 2 tears the edges of near objects');
  if (o.width < 320) throw new Error('--width must be 320 or more');
  return o;
}

/** The camera at frame f of n: offsets in pixels and the dolly's extra magnification. Periodic: frame n is frame 0. */
export function cameraAt(f, n, { move, amount, w }) {
  const c = MOVES[move](f / n);
  return { dx: c.dx * amount * w, dy: c.dy * amount * w, zoom: c.zoom * amount };
}

/** The base zoom that keeps every sample inside the picture for the whole loop, so no edge ever shows. */
export function baseZoom(n, { move, amount, w, h }) {
  let sx = 0, sy = 0;
  for (let f = 0; f < n; f++) {
    const c = cameraAt(f, n, { move, amount, w });
    sx = Math.max(sx, Math.abs(c.dx));
    sy = Math.max(sy, Math.abs(c.dy));
  }
  const reach = 1 - FOCUS; // the largest |depth - FOCUS|
  const need = Math.max(1 / (1 - (sx * reach) / (w / 2)), 1 / (1 - (sy * reach) / (h / 2)));
  return need * 1.005;
}

/** One frame: each output pixel samples the still where the camera move and its depth say (bilinear). */
export function renderFrame(rgb, depth, w, h, cam, base, out) {
  const cx = w / 2, cy = h / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = depth[y * w + x];
      const m = base * (1 + cam.zoom * (0.4 + d)); // a dolly magnifies near things more than far ones
      const sx = Math.min(w - 1.001, Math.max(0, cx + (x - cx) / m - cam.dx * (d - FOCUS)));
      const sy = Math.min(h - 1.001, Math.max(0, cy + (y - cy) / m - cam.dy * (d - FOCUS)));
      const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0;
      const i00 = (y0 * w + x0) * 3, i10 = i00 + 3, i01 = i00 + w * 3, i11 = i01 + 3;
      const o = (y * w + x) * 3;
      for (let k = 0; k < 3; k++) {
        const a = rgb[i00 + k] + (rgb[i10 + k] - rgb[i00 + k]) * fx;
        const b = rgb[i01 + k] + (rgb[i11 + k] - rgb[i01 + k]) * fx;
        out[o + k] = a + (b - a) * fy;
      }
    }
  }
  return out;
}

const raw = (args, input) => execFileSync('ffmpeg', ['-v', 'error', ...args], { maxBuffer: 1 << 30, input });

function probeSize(file) {
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', file], { encoding: 'utf8' }));
  const s = j.streams?.[0];
  if (!s) throw new Error(`${file} is not a picture ffmpeg can read`);
  return { width: s.width, height: s.height };
}

export function modelPath() {
  const base = process.env.FRONTEND_CRAFT_CACHE ?? path.join(os.homedir(), '.cache', 'frontend-craft');
  return path.join(base, 'models', 'depth-anything-v2-small', 'model.onnx');
}

async function ensureModel() {
  const file = modelPath();
  if (fs.existsSync(file) && fs.statSync(file).size > MODEL_MIN_BYTES) return file;
  console.log(`Downloading the depth model once (99 MB, Apache-2.0) to ${file}`);
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`could not download the depth model: HTTP ${res.status} from ${MODEL_URL}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.part`, Buffer.from(await res.arrayBuffer()));
  fs.renameSync(`${file}.part`, file);
  return file;
}

const python = () => ['python3', 'python'].find((p) => { try { execFileSync(p, ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } });

/** Depth at w x h, 0 far to 1 near, softened so edges bend instead of tearing. */
async function depthMap(o, w, h) {
  const soften = `gblur=sigma=${Math.max(2, w / 320).toFixed(1)}`;
  let buf;
  if (o.depth) {
    if (!fs.existsSync(o.depth)) throw new Error(`no depth map at "${o.depth}"`);
    buf = raw(['-i', o.depth, '-vf', `format=gray16le,scale=${w}:${h}:flags=bicubic,${soften}`, '-f', 'rawvideo', '-pix_fmt', 'gray16le', '-']);
  } else {
    const py = python();
    if (!py) throw new Error('python3 is needed for the depth step (or pass --depth <map.png>)');
    const model = await ensureModel();
    const dh = DEPTH_SIDE, dw = Math.max(14, Math.round((DEPTH_SIDE * w) / h / 14) * 14);
    const rgb = raw(['-i', o.input, '-vf', `scale=${dw}:${dh}:flags=bicubic`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
    let d16;
    try {
      d16 = execFileSync(py, [DEPTH_PY, model, String(dw), String(dh)], { input: rgb, maxBuffer: 1 << 28, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (err) {
      const msg = String(err.stderr ?? err.message);
      if (/No module named/.test(msg)) throw new Error(`the depth step needs numpy and onnxruntime for ${py}: ${msg.trim().split('\n').pop()} (run --doctor)`);
      throw new Error(`depth.py failed: ${msg.trim().split('\n').pop()}`);
    }
    buf = raw(['-f', 'rawvideo', '-pix_fmt', 'gray16le', '-s', `${dw}x${dh}`, '-i', '-', '-vf', `scale=${w}:${h}:flags=bicubic,${soften}`, '-f', 'rawvideo', '-pix_fmt', 'gray16le', '-'], d16);
  }
  const depth = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) depth[i] = buf.readUInt16LE(i * 2) / 65535;
  return depth;
}

/** Render the loop as a high-quality intermediate clip, frame by frame through ffmpeg's stdin. */
async function renderClip(o, rgb, depth, w, h, file) {
  const n = Math.round(o.seconds * FPS);
  const base = baseZoom(n, { move: o.move, amount: o.amount, w, h });
  const enc = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${w}x${h}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'ignore', 'inherit'] });
  const done = new Promise((resolve, reject) => enc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code} while rendering`)))));
  const frame = Buffer.alloc(w * h * 3);
  for (let f = 0; f < n; f++) {
    renderFrame(rgb, depth, w, h, cameraAt(f, n, { move: o.move, amount: o.amount, w }), base, frame);
    if (!enc.stdin.write(frame)) await new Promise((r) => enc.stdin.once('drain', r));
  }
  enc.stdin.end();
  await done;
  return { frames: n, base };
}

export async function parallax(o) {
  if (!o.input || !fs.existsSync(o.input)) throw new Error(`no picture at "${o.input ?? ''}"; pass a png, jpg or webp`);
  const src = probeSize(o.input);
  const w = even(o.width), h = even((o.width * src.height) / src.width);
  const rgb = raw(['-i', o.input, '-vf', `scale=${w}:${h}:flags=lanczos`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  const depth = await depthMap(o, w, h);
  fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
  const clip = `${o.out}.parallax-source.mp4`;
  const r = await renderClip(o, rgb, depth, w, h, clip);
  const enc = encode({ input: clip, out: o.out, seam: 'none', fade: 0, width: w, aspect: 'source', fps: FPS, grain: 0, crf: o.crf });
  if (!o.keep) fs.rmSync(clip, { force: true });
  return { ...enc, frames: r.frames, base: r.base, move: o.move, amount: o.amount };
}

export function doctor() {
  const py = python();
  const check = (mod) => { try { execFileSync(py, ['-c', `import ${mod}`], { stdio: 'ignore' }); return true; } catch { return false; } };
  const has = (cmd) => { try { execFileSync(cmd, ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } };
  return { ffmpeg: has('ffmpeg'), python: py ?? null, numpy: py ? check('numpy') : false, onnxruntime: py ? check('onnxruntime') : false, model: fs.existsSync(modelPath()) };
}

const INSTALL = [
  'ffmpeg: Arch `sudo pacman -S ffmpeg` · Debian/Ubuntu `sudo apt install ffmpeg` · macOS `brew install ffmpeg` · Windows `winget install Gyan.FFmpeg`',
  'numpy and onnxruntime: `python3 -m pip install --user numpy onnxruntime` (where pip --user is blocked, a venv, or Arch `sudo pacman -S python-numpy python-onnxruntime-cpu`)',
  'model: downloaded on the first run (99 MB), or pass --depth <map.png>',
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.doctor) {
    const r = doctor();
    console.log(JSON.stringify(r, null, 2));
    const missing = Object.entries(r).filter(([k, v]) => k !== 'model' && !v).map(([k]) => k);
    console.log(missing.length ? `\nMissing: ${missing.join(', ')}\n${INSTALL.join('\n')}` : '\nEverything the parallax route needs is here.');
    return;
  }
  const r = await parallax(options(args));
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(`Parallax loop: ${r.duration} s (${r.frames} frames) at ${r.w}x${r.h}, move ${r.move} x${r.amount}, exact loop`);
  for (const [k, f] of Object.entries(r.files)) console.log(`  ${k.padEnd(6)} ${f}  ${kb(r.sizes[k])}`);
  if (r.over.length) console.log(`WARN ${r.over.join(', ')} over the budget: fewer --seconds, a lower --width, or encode again with video.mjs --crf 28`);
  console.log(`\nMarkup (write the button label in the page's language):\n${markup(r.files, r)}`);
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error(`parallax.mjs: ${err.message}`); process.exit(1); });
}
