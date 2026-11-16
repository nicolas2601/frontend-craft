// A real product in 3D from its own artwork: data-product3d builds a stand-up coffee bag (side gussets, a crimped heat
// seal, a flat bottom, an optional degassing valve) printed with the front and back artwork, lit by a studio
// environment, leaning toward the pointer. Alone it turns with the scroll of its section; with data-path it travels a
// pinned stage chapter by chapter (the r-journey3d recipe). It needs three.js: in a bundled project `npm i three` and
// init(document, { libs: { three: () => import('three') } }); in plain HTML an import map for "three". Without it, or
// without WebGL, the child <img> stays as the picture. Markup: references/recipes.md.
//   data-front="assets/bag-front.webp" (required) data-back="..." data-size="1 1.55 0.42" (w h depth)
//   data-spin="0.24" turns per pass of the section, data-from="-0.12" start angle in turns
//   data-valve="0.5 0.13" a degassing valve at u (0-1 across) and v (0-1 from the top) of the front
//   data-finish="matte" | "gloss" | "foil"
//   data-path="x y turn; x y turn; ..." one pose per chapter: x and y in half-widths and half-heights of the stage,
//   turn in turns; data-path-narrow the same for phones (default: under the bar, swaying toward each chapter's side)
import { bagGeometry, crimpCanvas, onFront } from './bag-geometry.js';

const DPR_MAX = 2;
const THREE_SPEC = 'three';
const POINTER_LEAN = 0.18;
const FILL = 0.8;
const PATH_FILL = 0.64;
const NARROW_FILL = 0.42;
const NARROW = 0.9; // stage aspect below which the narrow path is used
const DAMP = 0.08;
const FINISH = {
  matte: { roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.6, metalness: 0 },
  gloss: { roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.25, metalness: 0 },
  foil: { roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.3, metalness: 0.35 },
};

const smooth = (t) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x); };

/** Poses from "x y turn; x y turn": one per chapter. */
export function parsePath(text) {
  if (!text) return null;
  const poses = text.split(';').map((p) => p.trim().split(/\s+/).map(Number)).filter((p) => p.length === 3 && p.every(Number.isFinite));
  return poses.length >= 2 ? poses : null;
}

/** The pose at progress p (0-1) through the chapters: it holds at each chapter and travels between them. */
export function poseAt(poses, p) {
  const s = Math.min(1, Math.max(0, p)) * (poses.length - 1);
  const i = Math.min(poses.length - 2, Math.floor(s));
  const e = smooth(smooth(s - i));
  return poses[i].map((v, k) => v + (poses[i + 1][k] - v) * e);
}

/** The average colour of a vertical strip of the artwork (0-1 across), darkened: the gussets take it. */
function stripColour(THREE, image, u0, u1, shade) {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 64;
  const g = c.getContext('2d');
  g.drawImage(image, 0, 0, 32, 64);
  const px = g.getImageData(Math.floor(u0 * 31), 4, Math.max(1, Math.round((u1 - u0) * 32)), 52).data;
  let r = 0, gr = 0, b = 0;
  for (let i = 0; i < px.length; i += 4) { r += px[i]; gr += px[i + 1]; b += px[i + 2]; }
  const n = px.length / 4;
  return new THREE.Color().setRGB((r / n / 255) * shade, (gr / n / 255) * shade, (b / n / 255) * shade, THREE.SRGBColorSpace);
}

async function loadThree(ctx) {
  const mod = ctx.libs.three ? await ctx.libs.three() : await import(/* @vite-ignore */ THREE_SPEC);
  return mod.default?.WebGLRenderer ? mod.default : mod;
}

/** A small photo studio for reflections: a soft grey room, a big softbox above-left, a strip light right. */
function studio(THREE) {
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshBasicMaterial({ color: 0x3c3c3c, side: THREE.BackSide })));
  const panel = (w, h, intensity, x, y, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity) }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    room.add(m);
  };
  panel(5, 3, 6, -3, 3.5, 3);
  panel(1.2, 6, 3, 5.5, 0.5, 0);
  panel(6, 1.5, 1.4, 0, -3.9, -2);
  return room;
}

function loadTexture(THREE, loader, url, renderer) {
  return new Promise((resolve, reject) => loader.load(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    resolve(t);
  }, undefined, reject));
}

/** The bag: printed faces, gussets in the artwork's edge colour, the crimped seal and the valve. */
function buildBag(THREE, el, frontTex, backTex, size) {
  const [w, h, d] = size;
  const finish = FINISH[el.dataset.finish] ?? FINISH.matte;
  const bump = new THREE.CanvasTexture(crimpCanvas());
  const skin = (map) => new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 2, ...finish });
  const sideColour = stripColour(THREE, frontTex.image, 0.9, 1, 0.82);
  const side = new THREE.MeshPhysicalMaterial({ color: sideColour, bumpMap: bump, bumpScale: 2, ...finish });
  const bag = new THREE.Group();
  bag.add(new THREE.Mesh(bagGeometry(THREE, w, h, d), [skin(frontTex), skin(backTex), side]));
  const valve = (el.dataset.valve ?? '').split(/\s+/).map(Number);
  if (valve.length === 2 && valve.every(Number.isFinite)) {
    const at = onFront(valve[0], valve[1], w, h, d);
    const r = w * 0.055;
    const plastic = new THREE.MeshPhysicalMaterial({ color: stripColour(THREE, frontTex.image, valve[0] - 0.05, valve[0] + 0.05, 0.9), roughness: 0.38, clearcoat: 0.5 });
    const part = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 40), plastic);
    disc.rotation.x = Math.PI / 2;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, r * 0.09, 12, 40), plastic);
    ring.position.z = 0.007;
    part.add(disc, ring);
    part.position.set(at.x, at.y, at.z + 0.004);
    part.lookAt(at.x + at.normal[0], at.y + at.normal[1], at.z + at.normal[2]);
    bag.add(part);
  }
  return { bag, bump };
}

function contactShadow(THREE, w, d) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.38)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.6, d * 3), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  return { mesh, tex };
}

/** Progress of the scroll through the host: a pinned journey runs while its stage is stuck, a section while it crosses the screen. */
function progressOf(host, pinned, stage) {
  const r = host.getBoundingClientRect();
  // the stage's own height, not the window's: a phone's address bar comes and goes without moving the pack
  const vh = stage || window.innerHeight;
  const p = pinned ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
  return Math.min(1, Math.max(0, p));
}

export function product3d(el, ctx) {
  const front = el.dataset.front;
  if (!front) throw new Error('data-product3d needs data-front (the straight-on artwork of the product)');
  let alive = true;
  let teardown = () => {};
  const fail = (err) => { el.setAttribute('data-product3d-off', ''); console.warn('[craft] data-product3d stays a picture:', err?.message ?? err); };
  const start = async () => {
    const THREE = await loadThree(ctx);
    if (!alive) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'r-product__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_MAX));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(studio(THREE), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

    const size = (el.dataset.size ?? '1 1.55 0.42').split(/\s+/).map(Number);
    const [w, h, d] = size;
    const loader = new THREE.TextureLoader();
    const frontTex = await loadTexture(THREE, loader, front, renderer);
    const backTex = el.dataset.back ? await loadTexture(THREE, loader, el.dataset.back, renderer) : frontTex;
    if (!alive) { renderer.dispose(); return; }
    const { bag, bump } = buildBag(THREE, el, frontTex, backTex, size);
    const holder = new THREE.Group();
    holder.add(bag);
    scene.add(holder);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    const shadow = contactShadow(THREE, w, d);
    shadow.mesh.position.y = -h / 2 - 0.12;
    holder.add(shadow.mesh);

    el.appendChild(canvas);
    const path = parsePath(el.dataset.path);
    const narrowPath = parsePath(el.dataset.pathNarrow);
    let view = { halfW: 1, halfH: 1, narrow: false };
    const fit = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(1, r.height);
      const narrow = camera.aspect < NARROW;
      // Alone the pack fills about 80% of the frame; on a journey stage it leaves room for the words beside it.
      const fill = !path ? FILL : narrow ? NARROW_FILL : PATH_FILL;
      const share = !path ? 0.75 : narrow ? 0.7 : 0.32; // the widest the pack may be, as a share of the frame
      const span = Math.max(h / fill, w / (share * camera.aspect));
      camera.position.set(0, 0, span / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) + d);
      camera.updateProjectionMatrix();
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      view = { halfW: halfH * camera.aspect, halfH, narrow };
    };
    fit();
    el.setAttribute('data-product3d-on', '');

    const host = el.closest('section') ?? el;
    const spin = Number.parseFloat(el.dataset.spin ?? '0.24');
    const from = Number.parseFloat(el.dataset.from ?? '-0.12');
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0, turn: from, px: 0, py: 0 };
    let progress = 0;
    let visible = false;
    let frame = 0;
    const goal = () => {
      if (!path) return [0, 0, from + progress * spin];
      if (!view.narrow) return poseAt(path, progress);
      if (narrowPath) return poseAt(narrowPath, progress);
      const [x, , turn] = poseAt(path, progress);
      return [x * 0.3, 0.33, turn]; // under the bar, swaying toward each chapter's side
    };
    const render = (t) => {
      const [gx, gy, gt] = goal();
      const k = ctx.reduced ? 1 : DAMP * 1.5;
      now.turn += (gt - now.turn) * k;
      const vx = (gx * view.halfW - now.px) * k;
      now.px += vx;
      now.py += (gy * view.halfH - now.py) * k;
      now.x += (target.x - now.x) * DAMP;
      now.y += (target.y - now.y) * DAMP;
      holder.position.set(now.px, now.py, 0);
      bag.rotation.y = now.turn * Math.PI * 2 + now.x;
      bag.rotation.x = now.y * 0.6;
      bag.rotation.z = ctx.reduced ? 0 : Math.max(-0.12, Math.min(0.12, -vx * 2.2)); // it leans into the move
      bag.position.y = ctx.reduced ? 0 : Math.sin(t / 1400) * 0.04;
      shadow.mesh.material.opacity = 1 - Math.abs(bag.position.y) * 4;
      renderer.render(scene, camera);
    };
    const loop = (t) => { frame = 0; if (!visible || !alive) return; render(t); frame = requestAnimationFrame(loop); };
    const onScroll = () => { progress = progressOf(host, Boolean(path), path ? el.clientHeight : 0); };
    const onPointer = (e) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * POINTER_LEAN * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * POINTER_LEAN;
    };
    const unwatch = ctx.watch(el, (v) => {
      visible = v;
      if (v && !frame && !ctx.reduced) frame = requestAnimationFrame(loop);
    }, { margin: '10% 0px' });
    onScroll();
    if (ctx.reduced) render(0);
    else {
      window.addEventListener('scroll', onScroll, { passive: true });
      if (ctx.fine) window.addEventListener('pointermove', onPointer, { passive: true });
    }
    const onResize = () => { fit(); if (ctx.reduced) render(0); };
    window.addEventListener('resize', onResize, { passive: true });
    teardown = () => {
      unwatch();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      scene.traverse((o) => { o.geometry?.dispose(); [o.material ?? []].flat().forEach((m) => m.dispose()); });
      frontTex.dispose(); backTex.dispose(); bump.dispose(); shadow.tex.dispose(); pmrem.dispose();
      renderer.dispose();
      canvas.remove();
      el.removeAttribute('data-product3d-on');
    };
  };
  ctx.once(el, () => { start().catch(fail); }, { margin: '40% 0px' });
  return () => { alive = false; teardown(); };
}
