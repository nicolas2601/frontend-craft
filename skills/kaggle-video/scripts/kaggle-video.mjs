#!/usr/bin/env node
/*
  Image-to-video on Kaggle's free GPUs (T4, 30 GPU hours a week): Wan 2.2 TI2V-5B (Apache-2.0), run as a
  private script kernel through the official kaggle CLI. The still, the prompt and the settings travel inside
  the kernel's code, so nothing is uploaded to a dataset. Free: it spends GPU hours of the Kaggle account.

    node kaggle-video.mjs run <still> --prompt "<motion>" [--size 832x480] [--frames 81] [--steps 30]
                         [--guidance 5] [--shift 5] [--seed 42] [--fps 24] [--slug fc-hero-loop]
                         [--out .craft/video/kaggle] [--timeout 5400] [--no-wait] [--model <hf id>]
    node kaggle-video.mjs wait  [--slug fc-hero-loop] [--out ...]    poll a run already pushed, then download it
    node kaggle-video.mjs status [--slug fc-hero-loop]
    node kaggle-video.mjs --doctor

  Then: node <frontend-craft>/scripts/video.mjs <out>/clip.mp4 --out assets/hero --fade 0.8
*/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KERNEL = path.join(HERE, '..', 'kernel', 'wan_i2v.py');
export const MODEL = 'Wan-AI/Wan2.2-TI2V-5B-Diffusers';
const NEGATIVE = 'static frame, frozen, slideshow, blurry, warped architecture, melting shapes, flicker, extra limbs, people, text, watermark, logo, low quality, jpeg artifacts';
const DEFAULTS = { size: '832x480', frames: 81, steps: 30, guidance: 5, shift: 5, seed: 42, fps: 24, slug: 'fc-hero-loop', out: '.craft/video/kaggle', timeout: 5400, model: MODEL };
const POLL_MS = 30000;
const SPATIAL = 32; // Wan 2.2 TI2V: VAE stride 16 x patch 2

export function parse(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { args._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true; else { args[key] = next; i++; }
  }
  return args;
}

export function options(args) {
  const o = { ...DEFAULTS, cmd: args._[0], still: args._[1], prompt: args.prompt, negative: args.negative ?? NEGATIVE, wait: !args['no-wait'] };
  for (const k of ['size', 'slug', 'out', 'model']) if (typeof args[k] === 'string') o[k] = args[k];
  for (const k of ['frames', 'steps', 'guidance', 'shift', 'seed', 'fps', 'timeout']) {
    if (args[k] === undefined) continue;
    const n = Number(args[k]);
    if (!Number.isFinite(n) || n < 0) throw new Error(`--${k} must be a number, got "${args[k]}"`);
    o[k] = n;
  }
  const m = /^(\d+)x(\d+)$/.exec(o.size);
  if (!m) throw new Error('--size is WxH, e.g. 832x480 or 1280x704');
  [o.width, o.height] = [Number(m[1]), Number(m[2])];
  if (o.width % SPATIAL || o.height % SPATIAL) throw new Error(`--size: both sides must be multiples of ${SPATIAL} (832x480, 1280x704)`);
  if ((o.frames - 1) % 4 || o.frames < 17) throw new Error('--frames must be 4k+1 and at least 17 (49, 81, 121)');
  if (!/^[a-z0-9-]{3,50}$/.test(o.slug)) throw new Error('--slug: lowercase letters, digits and dashes');
  if (o.cmd === 'run') {
    if (!o.still || !fs.existsSync(o.still)) throw new Error(`no still at "${o.still ?? ''}"`);
    if (!o.prompt || typeof o.prompt !== 'string') throw new Error('--prompt is required: the motion the place has (breeze in the plants, light moving, a slow dolly in)');
  }
  return o;
}

const kaggle = (args, opts = {}) => execFileSync('kaggle', ['-W', ...args], { encoding: 'utf8', ...opts });

export function username(run = kaggle) {
  const m = /username:\s*(\S+)/.exec(run(['config', 'view']));
  if (!m || m[1] === 'None') throw new Error('kaggle has no username: run `kaggle auth login` (or put an API token in ~/.kaggle) first');
  return m[1];
}

/** The kernel folder's two files: its metadata and the script with the still and settings inside. Pure. */
export function kernelFiles(o, user, imageB64, template = fs.readFileSync(KERNEL, 'utf8')) {
  const cfg = { prompt: o.prompt, negative: o.negative, width: o.width, height: o.height, frames: o.frames, steps: o.steps, guidance: o.guidance, flow_shift: o.shift, seed: o.seed, fps: o.fps, model: o.model };
  const fill = (text, key, value) => {
    if (text.split(key).length !== 2) throw new Error(`the kernel template must hold ${key} exactly once`);
    return text.replace(key, value);
  };
  const script = fill(fill(template, '__CFG_B64__', Buffer.from(JSON.stringify(cfg)).toString('base64')), '__IMAGE_B64__', imageB64);
  const meta = { id: `${user}/${o.slug}`, title: o.slug, code_file: 'run.py', language: 'python', kernel_type: 'script', is_private: true, enable_gpu: true, enable_internet: true, machine_shape: 'NvidiaTeslaT4', dataset_sources: [], competition_sources: [], kernel_sources: [], model_sources: [] };
  return { 'kernel-metadata.json': `${JSON.stringify(meta, null, 2)}\n`, 'run.py': script };
}

/** "user/slug has status "KernelWorkerStatus.RUNNING"" -> running */
export function statusOf(text) {
  const m = /status "?(?:KernelWorkerStatus\.)?([A-Za-z_]+)"?/.exec(text);
  return m ? m[1].toLowerCase() : 'unknown';
}

function stillB64(o) {
  const jpg = execFileSync('ffmpeg', ['-v', 'error', '-i', o.still, '-vf', `scale=${o.width}:${o.height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${o.width}:${o.height}`, '-q:v', '2', '-f', 'image2', '-c:v', 'mjpeg', '-'], { maxBuffer: 1 << 26 });
  return jpg.toString('base64');
}

function push(o, user) {
  const dir = path.resolve(o.out, 'kernel');
  fs.mkdirSync(dir, { recursive: true });
  for (const [f, body] of Object.entries(kernelFiles(o, user, stillB64(o)))) fs.writeFileSync(path.join(dir, f), body);
  console.log(kaggle(['kernels', 'push', '-p', dir, '-t', String(o.timeout), '--accelerator', 'NvidiaTeslaT4']).trim());
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wait(o, user) {
  const ref = `${user}/${o.slug}`;
  const start = Date.now();
  let status = 'unknown';
  for (;;) {
    status = statusOf(kaggle(['kernels', 'status', ref]));
    console.log(`${new Date().toISOString().slice(11, 19)} ${ref}: ${status} (${Math.round((Date.now() - start) / 60000)} min)`);
    if (['complete', 'error', 'cancelacknowledged', 'cancelrequested'].includes(status)) break;
    if (Date.now() - start > (o.timeout + 900) * 1000) throw new Error(`still ${status} after the timeout; check https://www.kaggle.com/code/${ref}`);
    await sleep(POLL_MS);
  }
  const out = path.resolve(o.out);
  fs.mkdirSync(out, { recursive: true });
  kaggle(['kernels', 'output', ref, '-p', out, '-o']);
  const report = path.join(out, 'run.json');
  const r = fs.existsSync(report) ? JSON.parse(fs.readFileSync(report, 'utf8')) : null;
  if (status !== 'complete' || !r?.ok) throw new Error(`the run ended ${status}${r?.error ? `: ${r.error}` : ''}; log in ${out}`);
  const steps = r.steps_s ?? [];
  console.log(`clip: ${path.join(out, 'clip.mp4')} (${r.frames} frames, ${r.elapsed_s} s on ${r.gpus?.[0] ?? 'GPU'}, ${steps.length ? `${(steps.reduce((a, b) => a + b, 0) / steps.length).toFixed(1)} s a step` : ''})`);
  console.log(`next: node <frontend-craft>/scripts/video.mjs ${path.join(o.out, 'clip.mp4')} --out assets/hero --fade 0.8`);
}

export function doctor(run = kaggle) {
  const r = { kaggle: false, user: null, gpuHoursLeft: null, ffmpeg: false };
  try { run(['--version']); r.kaggle = true; } catch { return r; }
  try { r.user = username(run); } catch { r.user = null; }
  try { const m = /GPU\s+[\d.]+h\s+([\d.]+)h/.exec(run(['quota'])); r.gpuHoursLeft = m ? Number(m[1]) : null; } catch { r.gpuHoursLeft = null; }
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); r.ffmpeg = true; } catch { r.ffmpeg = false; }
  return r;
}

async function main() {
  const args = parse(process.argv.slice(2));
  if (args.doctor) {
    const r = doctor();
    console.log(JSON.stringify(r, null, 2));
    if (!r.kaggle) console.log('Install the kaggle CLI: pipx install kaggle (or python3 -m pip install --user kaggle), then kaggle auth login. GPU kernels need a phone-verified Kaggle account.');
    return;
  }
  const o = options(args);
  const user = username();
  if (o.cmd === 'run') { push(o, user); if (o.wait) await wait(o, user); return; }
  if (o.cmd === 'wait') return wait(o, user);
  if (o.cmd === 'status') { console.log(kaggle(['kernels', 'status', `${user}/${o.slug}`]).trim()); return; }
  throw new Error('usage: kaggle-video.mjs run <still> --prompt "..." | wait | status | --doctor');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(`kaggle-video.mjs: ${err.message}`); process.exit(1); });
}
