#!/usr/bin/env node
/*
  Real media for the page: the client's own videos, frames for a scroll-scrubbed sequence, free stock footage, and
  a contact sheet to look at any clip before using it. Free tools only (yt-dlp, ffmpeg, the Pexels and Pixabay APIs).

    node <skill>/scripts/media.mjs social <url> [--out assets/video/raw] [--max 6]
         the client's own TikTok, Instagram, YouTube or Facebook videos (a post or a profile), with their permission
    node <skill>/scripts/media.mjs frames <clip.mp4> [--out assets/seq] [--fps 24] [--width 1600] [--start 0] [--end 6]
         webp frames + manifest.json for <section data-sequence="assets/seq/manifest.json"> (references/recipes.md)
    node <skill>/scripts/media.mjs sheet <clip.mp4> [--out .craft/looks]      a 4x3 contact sheet: open it and look
    node <skill>/scripts/media.mjs stock "<query>" [--source pexels|pixabay] [--type video|photo] [--n 8]
    node <skill>/scripts/media.mjs stock --get <source>:<id> [--type video|photo] [--out assets/stock]
         free stock with a free API key in PEXELS_API_KEY or PIXABAY_API_KEY; downloads keep a SOURCES.txt line

  A clip becomes a hero loop with video.mjs (mp4 + webm + poster); never hotlink a file from a site.
*/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { isMain, parseArgs } from './lib/state.mjs';

const VIDEO_FORMAT = 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/b';
const SHEET_TILES = '4x3';
const WEBP_QUALITY = 72;
const BROWSE = {
  pexels: (q) => `https://www.pexels.com/search/videos/${encodeURIComponent(q)}/`,
  coverr: (q) => `https://coverr.co/s?q=${encodeURIComponent(q)}`,
  mixkit: (q) => `https://mixkit.co/free-stock-video/${encodeURIComponent(q.replace(/\s+/g, '-'))}/`,
  pixabay: (q) => `https://pixabay.com/videos/search/${encodeURIComponent(q)}/`,
};

const num = (v, d) => (v === undefined || v === true ? d : Number(v));

/** yt-dlp arguments for the client's own videos: mp4 at 1080p at most, a profile capped at --max posts. */
export function socialArgs(url, { out = 'assets/video/raw', max = 6 } = {}) {
  if (!/^https?:\/\//.test(String(url))) throw new Error('social needs the URL of a post or a profile');
  return ['-f', VIDEO_FORMAT, '--merge-output-format', 'mp4', '--playlist-end', String(max), '--no-overwrites',
    '--restrict-filenames', '-o', path.join(out, '%(uploader_id,uploader)s-%(id)s.%(ext)s'),
    '--print', 'after_move:%(filepath)s\t%(webpage_url)s\t%(uploader)s\t%(duration)s', String(url)];
}

/** ffmpeg arguments for webp frames: a fixed rate and width, an optional window of the clip. */
export function framesArgs(input, { out = 'assets/seq', fps = 24, width = 1600, start, end, quality = WEBP_QUALITY } = {}) {
  const win = [...(start !== undefined ? ['-ss', String(start)] : []), ...(end !== undefined ? ['-to', String(end)] : [])];
  return ['-v', 'error', ...win, '-i', input, '-vf', `fps=${fps},scale=${width}:-2:flags=lanczos`, '-c:v', 'libwebp',
    '-quality', String(quality), '-compression_level', '4', path.join(out, 'f%04d.webp')];
}

/** A 4x3 sheet sampled evenly across the whole clip (twelve frames whatever its length). */
export function sheetArgs(input, out, seconds = 12) {
  const rate = (12 / Math.max(1, seconds)).toFixed(4);
  return ['-v', 'error', '-y', '-i', input, '-vf', `fps=${rate},scale=480:-2,tile=${SHEET_TILES}`, '-frames:v', '1', out];
}

/** Pexels and Pixabay search results as one list. Pure. */
export function parseStock(source, json, type) {
  if (source === 'pexels') {
    const list = type === 'video' ? json.videos ?? [] : json.photos ?? [];
    return list.map((x) => ({
      ref: `pexels:${x.id}`, w: x.width, h: x.height, seconds: x.duration ?? null, by: x.user?.name ?? x.photographer ?? '',
      page: x.url, file: type === 'video' ? bestPexelsFile(x.video_files) : x.src?.large2x ?? x.src?.original,
    }));
  }
  const list = json.hits ?? [];
  return list.map((x) => {
    const v = x.videos?.large?.url ? x.videos.large : x.videos?.medium;
    return { ref: `pixabay:${x.id}`, w: v?.width ?? x.imageWidth, h: v?.height ?? x.imageHeight, seconds: x.duration ?? null, by: x.user ?? '', page: x.pageURL, file: v?.url ?? x.largeImageURL };
  });
}

function bestPexelsFile(files = []) {
  const mp4 = files.filter((f) => f.file_type === 'video/mp4' && f.width);
  const hd = mp4.filter((f) => f.width <= 1920).sort((a, b) => b.width - a.width);
  return (hd[0] ?? mp4[0])?.link ?? null;
}

const KEYS = { pexels: 'PEXELS_API_KEY', pixabay: 'PIXABAY_API_KEY' };

function stockUrl(source, query, { type = 'video', n = 8, id = null } = {}) {
  const q = encodeURIComponent(query ?? '');
  if (source === 'pexels') {
    if (id) return type === 'video' ? `https://api.pexels.com/videos/videos/${id}` : `https://api.pexels.com/v1/photos/${id}`;
    return type === 'video' ? `https://api.pexels.com/videos/search?query=${q}&per_page=${n}&orientation=landscape` : `https://api.pexels.com/v1/search?query=${q}&per_page=${n}`;
  }
  const key = process.env.PIXABAY_API_KEY;
  const base = type === 'video' ? 'https://pixabay.com/api/videos/' : 'https://pixabay.com/api/';
  return id ? `${base}?key=${key}&id=${id}` : `${base}?key=${key}&q=${q}&per_page=${Math.max(3, n)}&safesearch=true`;
}

async function getJson(url, source) {
  const headers = source === 'pexels' ? { Authorization: process.env.PEXELS_API_KEY } : {};
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`${source} answered HTTP ${res.status}`);
  return res.json();
}

async function download(url, file) {
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

function credit(dir, line) {
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(path.join(dir, 'SOURCES.txt'), `${line}\n`);
}

async function stock(args) {
  const type = args.type === 'photo' ? 'photo' : 'video';
  if (args.get) {
    const [source, id] = String(args.get).split(':');
    if (!KEYS[source] || !/^\d+$/.test(id ?? '')) throw new Error('--get takes pexels:<id> or pixabay:<id> from a search');
    if (!process.env[KEYS[source]]) throw new Error(`${KEYS[source]} is not set (a free key: ${source === 'pexels' ? 'https://www.pexels.com/api/' : 'https://pixabay.com/api/docs/'})`);
    const json = await getJson(stockUrl(source, null, { type, id }), source);
    const [item] = parseStock(source, source === 'pexels' ? (type === 'video' ? { videos: [json] } : { photos: [json] }) : json, type);
    if (!item?.file) throw new Error('no downloadable file in that result');
    const out = String(args.out ?? 'assets/stock');
    const file = path.join(out, `${source}-${id}${type === 'video' ? '.mp4' : '.jpg'}`);
    await download(item.file, file);
    credit(out, `${path.basename(file)}\t${item.page}\tby ${item.by} on ${source === 'pexels' ? 'Pexels' : 'Pixabay'} (free licence)`);
    console.log(`Saved ${file} (${item.w}x${item.h}${item.seconds ? `, ${item.seconds}s` : ''}); credit added to ${path.join(out, 'SOURCES.txt')}.\nLook before using it: node ${path.relative(process.cwd(), process.argv[1])} sheet ${file}`);
    return;
  }
  const query = args._.slice(1).join(' ').trim();
  if (!query) throw new Error('stock needs a query: media.mjs stock "coffee pour slow motion"');
  const source = args.source === 'pixabay' ? 'pixabay' : 'pexels';
  if (!process.env[KEYS[source]]) {
    console.log([`${KEYS[source]} is not set. Free keys: Pexels https://www.pexels.com/api/ , Pixabay https://pixabay.com/api/docs/ (put it in the environment, never in a file you commit).`,
      'Meanwhile, look by hand and download into the project:', ...Object.entries(BROWSE).map(([k, f]) => `  ${k}: ${f(query)}`)].join('\n'));
    return;
  }
  const items = parseStock(source, await getJson(stockUrl(source, query, { type, n: num(args.n, 8) }), source), type);
  console.log(items.length ? items.map((x) => `${x.ref}  ${x.w}x${x.h}${x.seconds ? ` ${x.seconds}s` : ''}  by ${x.by}  ${x.page}`).join('\n') : 'nothing found: try other words');
  console.log(`\nOpen the pages, choose by eye, then: media.mjs stock --get <ref>${type === 'photo' ? ' --type photo' : ''}`);
}

function run(cmd, a) {
  return execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });
}

function frames(args) {
  const input = args._[1];
  if (!input || !fs.existsSync(input)) throw new Error('frames needs a clip: media.mjs frames clip.mp4 --out assets/seq');
  const out = String(args.out ?? 'assets/seq');
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (/^f\d{4}\.webp$/.test(f)) fs.rmSync(path.join(out, f));
  const o = { out, fps: num(args.fps, 24), width: num(args.width, 1600), start: args.start === undefined ? undefined : num(args.start), end: args.end === undefined ? undefined : num(args.end) };
  run('ffmpeg', framesArgs(input, o));
  const list = fs.readdirSync(out).filter((f) => /^f\d{4}\.webp$/.test(f)).sort();
  const [w, h] = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.join(out, list[0])]).trim().split(',').map(Number);
  const bytes = list.reduce((s, f) => s + fs.statSync(path.join(out, f)).size, 0);
  fs.writeFileSync(path.join(out, 'manifest.json'), `${JSON.stringify({ frames: list, width: w, height: h, fps: o.fps, source: path.basename(input) }, null, 2)}\n`);
  console.log(`${list.length} frames ${w}x${h}, ${(bytes / 1024 / 1024).toFixed(1)} MB in ${out}. Markup (references/recipes.md, sequence):\n` +
    `<section class="r-sequence" data-sequence="${out}/manifest.json">\n  <div class="r-sequence__stage"><img class="r-sequence__poster" src="${out}/${list[0]}" alt="..." width="${w}" height="${h}"><canvas></canvas></div>\n  <div class="r-sequence__steps"><p data-at="0">...</p><p data-at="0.45">...</p></div>\n</section>`);
  if (bytes > 12 * 1024 * 1024) console.log('Heavy: lower --fps (18), --width (1280) or shorten the window (--start/--end).');
}

function sheet(args) {
  const input = args._[1];
  if (!input || !fs.existsSync(input)) throw new Error('sheet needs a clip');
  const dir = String(args.out ?? '.craft/looks');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${path.basename(input).replace(/\.[^.]+$/, '')}-sheet.jpg`);
  const seconds = Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input]).trim()) || 12;
  run('ffmpeg', sheetArgs(input, out, seconds));
  console.log(`Open ${out}: twelve frames spread over the ${Math.round(seconds)} s, left to right, top to bottom (frame n is at about n/12 of the clip). Keep the parts worth showing; cut them with video.mjs --start --end.`);
}

function social(args) {
  const url = args._[1];
  const out = String(args.out ?? 'assets/video/raw');
  fs.mkdirSync(out, { recursive: true });
  let printed = '';
  try { printed = run('yt-dlp', socialArgs(url, { out, max: num(args.max, 6) })); } catch (err) {
    if (err.code === 'ENOENT') throw new Error('yt-dlp is not installed: pipx install yt-dlp (or python3 -m pip install --user yt-dlp); a TikTok that refuses may also need: pipx inject yt-dlp curl_cffi');
    printed = String(err.stdout ?? '');
    if (!printed.trim()) throw new Error(`yt-dlp could not get it: ${String(err.stderr ?? err.message).split('\n').filter(Boolean).slice(-2).join(' ')}`);
  }
  const all = printed.trim().split('\n').filter(Boolean).map((l) => l.split('\t'));
  const rows = all.filter(([f]) => /\.mp4$/i.test(f));
  for (const [f] of all.filter(([x]) => !/\.mp4$/i.test(x))) { fs.rmSync(f, { force: true }); console.log(`skipped ${path.basename(f)}: a photo post or sound only, no video`); }
  for (const [file, page, who] of rows) credit(out, `${path.basename(file)}\t${page}\t${who}: the client's own video, used with their permission`);
  console.log(rows.length ? `${rows.length} video(s) in ${out}:\n${rows.map(([f, , , s]) => `  ${f} (${Math.round(Number(s) || 0)} s)`).join('\n')}\nLook at each before using it: media.mjs sheet <file>. Then a loop: video.mjs <file> --start <s> --end <s> --out assets/hero` : 'nothing downloaded');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  if (cmd === 'social') return social(args);
  if (cmd === 'frames') return frames(args);
  if (cmd === 'sheet') return sheet(args);
  if (cmd === 'stock') return stock(args);
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*/, '').trim());
  process.exitCode = cmd ? 2 : 0;
}

if (isMain(import.meta.url)) main().catch((err) => { console.error(`media: ${err.message}`); process.exit(2); });
