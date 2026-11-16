// A small PNG reader for screenshots (8-bit RGB or RGBA, non-interlaced, the format Chrome's CDP writes), and the
// colour statistics the check reads from a screen: how much of it is one flat colour, overall and per half.
import zlib from 'node:zlib';

export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const depth = data[8];
      const colour = data[9];
      if (depth !== 8 || data[12] !== 0 || ![2, 6].includes(colour)) throw new Error('only 8-bit RGB/RGBA non-interlaced PNG');
      channels = colour === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i += 1) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = v & 0xff;
    }
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * 4;
      out[o] = line[x * channels];
      out[o + 1] = line[x * channels + 1];
      out[o + 2] = line[x * channels + 2];
      out[o + 3] = channels === 4 ? line[x * channels + 3] : 255;
    }
    prev = line;
  }
  return { width, height, data: out };
}

/** Share of pixels within a small distance of the most common colour, for a region [x0, x1) of the image. */
function flatShare({ width, height, data }, x0, x1) {
  const bins = new Map();
  let n = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const o = (y * width + x) * 4;
      const key = ((data[o] >> 4) << 8) | ((data[o + 1] >> 4) << 4) | (data[o + 2] >> 4);
      bins.set(key, (bins.get(key) ?? 0) + 1);
      n += 1;
    }
  }
  let top = 0;
  for (const v of bins.values()) top = Math.max(top, v);
  return n ? top / n : 0;
}

// On a 10%-scale screenshot a cell of 6 px is about 60 CSS px; a cell whose luminance spreads less than 14 levels
// holds nothing: no word, edge or picture, whatever the colour of the ground under it.
const EMPTY_CELL = 6;
const EMPTY_RANGE = 14;

/** Share of the screen's cells with nothing in them (1 = an empty screen, in one colour or several). */
function emptyShare({ width, height, data }) {
  let cells = 0;
  let empty = 0;
  for (let cy = 0; cy + EMPTY_CELL <= height; cy += EMPTY_CELL) {
    for (let cx = 0; cx + EMPTY_CELL <= width; cx += EMPTY_CELL) {
      let lo = 255;
      let hi = 0;
      for (let y = cy; y < cy + EMPTY_CELL; y += 1) {
        for (let x = cx; x < cx + EMPTY_CELL; x += 1) {
          const o = (y * width + x) * 4;
          const l = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
          lo = Math.min(lo, l);
          hi = Math.max(hi, l);
        }
      }
      cells += 1;
      if (hi - lo < EMPTY_RANGE) empty += 1;
    }
  }
  return cells ? empty / cells : 0;
}

/** How flat a screen is (overall, left half, right half; 1 = a single colour) and how empty (1 = nothing on it). */
export function screenFlatness(img) {
  const half = Math.floor(img.width / 2);
  return { all: flatShare(img, 0, img.width), left: flatShare(img, 0, half), right: flatShare(img, half, img.width), empty: emptyShare(img) };
}
