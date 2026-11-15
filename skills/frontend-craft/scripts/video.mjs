#!/usr/bin/env node
/*
  Turn a short clip into a hero loop for the web: a seamless loop, smooth frame rate, the page's size,
  an H.264 mp4, a VP9 webm and a poster. Needs ffmpeg and ffprobe on the PATH. Free and local.

    node video.mjs <clip.mp4> [more clips] [--out assets/hero] [--seam crossfade|pingpong|none]
                   [--fade 0.4] [--width 1280] [--aspect 16:9|source] [--fps 30] [--start 0] [--end 3]
                   [--grain 0] [--crf 24]
    node video.mjs --doctor        what is installed and what to install

  Seams: crossfade (default) dissolves the tail into the head; it is clean on a clip generated with the
  same first and last frame, and ghosts on a one-way clip whose end looks unlike its start. pingpong plays
  forward then back, for slow sways (wrong for smoke, water or anything that flows one way). none keeps
  a clip that already loops (a coded film rendered as an exact loop). Several clips are joined in order
  first (A to B, then B to A: a longer loop with real motion); each later clip drops its first frame,
  which repeats the previous clip's last. How to make the clips for free and the markup:
  references/hero-video.md. A loop from one still with no GPU: parallax.mjs.
*/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { isMain, parseArgs } from './lib/state.mjs';

export const BUDGET_BYTES = 1.5 * 1024 * 1024;
const SEAMS = ['crossfade', 'pingpong', 'none'];
const UPSCALE_SHARPEN = 1.2;
const DEFAULTS = { seam: 'crossfade', fade: 0.4, width: 1280, aspect: '16:9', fps: 30, grain: 0, crf: 24 };

const even = (n) => Math.max(2, Math.round(n / 2) * 2);
const num = (v, name) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error(`--${name} must be a number of zero or more, got "${v}"`);
  return n;
};

/** Options from argv, validated, with defaults. */
export function options(args) {
  const o = { ...DEFAULTS, out: args.out ?? 'assets/hero', input: args._[0], inputs: args._.length ? [...args._] : [] };
  for (const k of ['fade', 'width', 'fps', 'grain', 'crf']) if (args[k] !== undefined) o[k] = num(args[k], k);
  for (const k of ['start', 'end']) if (args[k] !== undefined) o[k] = num(args[k], k);
  if (args.seam !== undefined) o.seam = String(args.seam);
  if (args.aspect !== undefined) o.aspect = String(args.aspect);
  if (!SEAMS.includes(o.seam)) throw new Error(`--seam must be one of ${SEAMS.join(', ')}`);
  if (o.aspect !== 'source' && !/^\d+(\.\d+)?:\d+(\.\d+)?$/.test(o.aspect)) throw new Error('--aspect is W:H (16:9, 4:5, 21:9) or source');
  if (o.width < 160 || o.fps < 1) throw new Error('--width must be 160 or more and --fps 1 or more');
  return o;
}

/** Output size: the width asked, the height from the aspect (or the clip's own), both even. */
export function sizeFor(meta, o) {
  const ratio = o.aspect === 'source' ? meta.width / meta.height : o.aspect.split(':').map(Number).reduce((w, h) => w / h);
  return { w: even(o.width), h: even(o.width / ratio) };
}

/**
 * Several clips as one: each later clip drops its first frame (the previous clip's last) and is brought to the
 * first clip's size and frame rate. Returns the graph prefix ending in [cat] and the joined clip's meta.
 */
export function join(metas) {
  const [first] = metas;
  const norm = (m, i) => `[${i}:v]${i ? 'trim=start_frame=1,' : ''}setpts=PTS-STARTPTS,fps=${first.fps},scale=${first.width}:${first.height}:flags=lanczos,setsar=1[j${i}]`;
  const frames = metas.reduce((n, m, i) => n + Math.round((m.frames / m.fps) * first.fps) - (i ? 1 : 0), 0);
  const graph = `${metas.map(norm).join(';')};${metas.map((_, i) => `[j${i}]`).join('')}concat=n=${metas.length}:v=1:a=0[cat];`;
  return { graph, meta: { width: first.width, height: first.height, fps: first.fps, frames, duration: frames / first.fps } };
}

/** The ffmpeg filter graph from [0:v] (or the joined [cat]) to [v], and the loop's length in seconds. Pure, so it is testable. */
export function plan(meta, o, src = '[0:v]', prefix = '') {
  const start = o.start ?? 0;
  const end = Math.min(o.end ?? meta.duration, meta.duration);
  const trimmed = o.start !== undefined || o.end !== undefined;
  const frames = trimmed ? Math.round((end - start) * meta.fps) : meta.frames;
  const last = (frames - 1) / meta.fps; // time of the last frame: what survives frame-rate conversion
  const pre = trimmed ? `trim=start=${start}:end=${end},setpts=PTS-STARTPTS,` : '';
  const rate = meta.fps < o.fps - 0.5 ? `minterpolate=fps=${o.fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1` : `fps=${o.fps}`;
  let seam;
  let duration;
  if (o.seam === 'crossfade') {
    // after the frame-rate change, so the last frame of the fade is one 1/fps step from the first frame
    if (last <= 2 * o.fade) throw new Error(`the clip (${last.toFixed(2)} s) must be longer than twice --fade (${o.fade} s)`);
    const offset = +(last - 2 * o.fade).toFixed(3);
    seam = `${prefix}${src}${pre}${rate},split[a][b];[a]trim=start=${o.fade},setpts=PTS-STARTPTS[body];[b]trim=end=${o.fade},setpts=PTS-STARTPTS[head];`
      + `[body][head]xfade=transition=fade:duration=${o.fade}:offset=${offset}[s]`;
    duration = last - o.fade;
  } else if (o.seam === 'pingpong') {
    // forward, then back without repeating either end frame; the turn is interpolated like any other step
    seam = `${prefix}${src}${pre}split[a][b];[b]reverse,trim=start_frame=1:end_frame=${frames - 1},setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0,${rate}[s]`;
    duration = (2 * frames - 2) / meta.fps;
  } else {
    seam = `${prefix}${src}${pre}${rate}[s]`;
    duration = frames / meta.fps;
  }
  const { w, h } = sizeFor(meta, o);
  const post = [
    `scale=${w}:${h}:force_original_aspect_ratio=increase:flags=lanczos`, `crop=${w}:${h}`,
    ...(w / meta.width >= UPSCALE_SHARPEN ? ['unsharp=5:5:0.35'] : []),
    ...(o.grain > 0 ? [`noise=alls=${o.grain}:allf=t`] : []),
    'format=yuv420p',
  ];
  return { graph: `${seam};[s]${post.join(',')}[v]`, duration: +duration.toFixed(3), w, h };
}

function probe(file) {
  const raw = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries',
    'stream=width,height,r_frame_rate,nb_read_frames:format=duration', '-of', 'json', file], { encoding: 'utf8' });
  const j = JSON.parse(raw);
  const s = j.streams?.[0];
  if (!s) throw new Error(`${file} has no video stream`);
  const [a, b] = s.r_frame_rate.split('/').map(Number);
  return { width: s.width, height: s.height, fps: b ? a / b : a, frames: Number(s.nb_read_frames), duration: Number(j.format.duration) };
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });

/** Encode the loop: mp4 (H.264), webm (VP9) and a webp poster from its first frame. */
export function encode(o) {
  const inputs = o.inputs?.length ? o.inputs : [o.input];
  for (const f of inputs) if (!f || !fs.existsSync(f)) throw new Error(`no clip at "${f ?? ''}"; pass the path of an mp4, webm or mov`);
  const metas = inputs.map(probe);
  const joined = metas.length > 1 ? join(metas) : null;
  const meta = joined ? joined.meta : metas[0];
  const p = joined ? plan(meta, o, '[cat]', joined.graph) : plan(meta, o);
  fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
  const files = { mp4: `${o.out}.mp4`, webm: `${o.out}.webm`, poster: `${o.out}-poster.webp` };
  ffmpeg([...inputs.flatMap((f) => ['-i', f]), '-filter_complex', p.graph, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(o.crf),
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', files.mp4]);
  ffmpeg(['-i', files.mp4, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(Math.round(o.crf + 12)), '-row-mt', '1',
    '-deadline', 'good', '-cpu-used', '2', files.webm]);
  ffmpeg(['-i', files.mp4, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', files.poster]);
  const sizes = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, fs.statSync(f).size]));
  return { source: meta, ...p, files, sizes, over: Object.keys(files).filter((k) => k !== 'poster' && sizes[k] > BUDGET_BYTES) };
}

/** The page's URL for a file written from the project root: as written, or from the site root when it sits under public/. */
const url = (f) => {
  const rel = path.relative(process.cwd(), path.resolve(f)).split(path.sep).join('/');
  return rel.startsWith('public/') ? rel.slice('public'.length) : rel;
};

/** The markup to paste, pointing at the files the encode wrote. */
export function markup(files, { w, h }) {
  return `<div class="craft-loop">\n  <video data-loop muted playsinline preload="metadata" poster="${url(files.poster)}" width="${w}" height="${h}" aria-hidden="true">\n`
    + `    <source src="${url(files.webm)}" type="video/webm">\n    <source src="${url(files.mp4)}" type="video/mp4">\n  </video>\n`
    + '  <button type="button" data-loop-toggle aria-pressed="false">Pause</button>\n</div>';
}

function has(list, names) {
  return Object.fromEntries(names.map((n) => [n, new RegExp(`\\s${n}\\s`).test(list)]));
}

/** What is installed for the free video routes, and what to install. */
export function doctor() {
  const run = (cmd, args) => { try { return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; } };
  const version = run('ffmpeg', ['-version'])?.split('\n')[0] ?? null;
  const report = { node: process.version, ffmpeg: version, ffprobe: !!run('ffprobe', ['-version']) };
  if (version) {
    Object.assign(report, has(run('ffmpeg', ['-hide_banner', '-filters']) ?? '', ['minterpolate', 'xfade', 'reverse', 'noise']));
    Object.assign(report, has(run('ffmpeg', ['-hide_banner', '-encoders']) ?? '', ['libx264', 'libvpx-vp9', 'libwebp']));
  }
  return report;
}

const INSTALL = [
  'ffmpeg: Arch `sudo pacman -S ffmpeg` · Debian/Ubuntu `sudo apt install ffmpeg` · macOS `brew install ffmpeg` · Windows `winget install Gyan.FFmpeg`',
  'Generated clips: the Hugging Face MCP server (free account, ZeroGPU quota) with Z-Image Turbo and Wan 2.2 (references/hero-video.md)',
  'Coded films: HyperFrames (`npx hyperframes`, Node 22 + ffmpeg) or the bang-motion skill; Remotion needs a company licence above three people',
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.doctor) {
    const r = doctor();
    console.log(JSON.stringify(r, null, 2));
    const missing = Object.entries(r).filter(([, v]) => v === false || v === null).map(([k]) => k);
    console.log(missing.length ? `\nMissing: ${missing.join(', ')}\n${INSTALL.join('\n')}` : '\nEverything the video routes need is here.');
    return;
  }
  const r = encode(options(args));
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(`Loop: ${r.duration} s at ${r.w}x${r.h} from ${r.source.width}x${r.source.height} ${r.source.fps.toFixed(2)} fps`);
  for (const [k, f] of Object.entries(r.files)) console.log(`  ${k.padEnd(6)} ${f}  ${kb(r.sizes[k])}`);
  if (r.over.length) console.log(`WARN ${r.over.join(', ')} over ${kb(BUDGET_BYTES)}: shorten the loop, lower --width, or raise --crf`);
  console.log(`\nMarkup (paths from where you ran this; write the button label in the page's language):\n${markup(r.files, r)}`);
}

if (isMain(import.meta.url)) {
  try { main(); } catch (err) { console.error(`video.mjs: ${err.message}`); process.exit(1); }
}
