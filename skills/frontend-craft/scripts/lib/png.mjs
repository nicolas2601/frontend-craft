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

/** How flat a screen is: overall, left half and right half (1 = a single colour). */
export function screenFlatness(img) {
  const half = Math.floor(img.width / 2);
  return { all: flatShare(img, 0, img.width), left: flatShare(img, 0, half), right: flatShare(img, half, img.width) };
}
