// Frames of a real clip drawn on a canvas at a share of a pass (0 the first frame, 1 the last). The manifest is the
// one scripts/media.mjs frames writes ({ frames: [...], width, height }). Frames load lazily: the first, then every
// fourth, then the rest in idle time, and the nearest loaded frame is drawn meanwhile.

const STRIDE = 4;
const PER_IDLE = 6;
const MAX_DPR = 2;

function nearestLoaded(images, i) {
  for (let d = 1; d < images.length; d += 1) {
    if (images[i - d]?.complete) return i - d;
    if (images[i + d]?.complete) return i + d;
  }
  return -1;
}

/** Plays the manifest at url on canvas; onReady runs once the list is known, onFail if it cannot load. */
export function framePlayer(canvas, url, { onReady, onFail } = {}) {
  const g = canvas.getContext('2d');
  let images = [];
  let alive = true;
  let last = -1;
  let wanted = 0;
  const draw = (i) => {
    const pick = images[i]?.complete ? i : nearestLoaded(images, i);
    if (pick < 0 || pick === last) return;
    last = pick;
    const img = images[pick];
    const { width: cw, height: ch } = canvas;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    g.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    if (!canvas.hasAttribute('data-frames-on')) canvas.setAttribute('data-frames-on', '');
  };
  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    last = -1;
    draw(wanted);
  };
  const base = new URL(url, document.baseURI);
  fetch(base).then((r) => {
    if (!r.ok) throw new Error(`${r.status} ${base.href}`);
    return r.json();
  }).then((manifest) => {
    if (!alive) return;
    const files = manifest.frames ?? [];
    images = files.map(() => null);
    const load = (i) => {
      if (images[i]) return;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { if (alive && Math.abs(i - wanted) < 3) { last = -1; draw(wanted); } };
      img.src = new URL(files[i], base).href;
      images[i] = img;
    };
    load(0);
    const keys = [...files.keys()];
    const order = keys.filter((i) => i % STRIDE === 0).concat(keys.filter((i) => i % STRIDE !== 0));
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 32));
    let k = 0;
    const pump = () => {
      for (let n = 0; n < PER_IDLE && k < order.length; n += 1) load(order[k++]);
      if (alive && k < order.length) idle(pump);
    };
    idle(pump);
    size();
    onReady?.(files.length);
  }).catch((err) => { if (alive) onFail?.(err); });
  return {
    /** Draws the frame at share p of the clip. */
    show(p) {
      if (!images.length) return;
      wanted = Math.round(Math.min(1, Math.max(0, p)) * (images.length - 1));
      draw(wanted);
    },
    size,
    stop() { alive = false; canvas.removeAttribute('data-frames-on'); },
  };
}
