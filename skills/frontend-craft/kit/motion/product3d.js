// A real product in 3D from its own artwork: data-product3d builds a soft pillow pouch (a coffee bag, a sachet, a
// pack) with the front and back images printed on it, lit by a studio environment, turning with the scroll of its
// section and leaning toward the pointer. It needs three.js: in a bundled project `npm i three` and pass
// init(document, { libs: { three: () => import('three') } }); in plain HTML an import map for "three". Without it,
// or without WebGL, the child <img> stays as the picture. Markup: references/recipes.md.
//   data-front="assets/bag-front.webp" (required) data-back="..." data-size="1 1.45 0.32" (w h depth)
//   data-spin="0.24" turns per pass of the section (a sway that keeps the front in view; 1 shows the back too),
//   data-from="-0.12" start angle in turns
const DPR_MAX = 2;
const THREE_SPEC = 'three';
const SEG_X = 48;
const SEG_Y = 64;
const POINTER_LEAN = 0.18;
const FILL = 0.72;
const DAMP = 0.08;

/** Pillow surface: flat in the middle, curving to the seam at the edges. */
export function puff(x, y, w, h) {
  const u = Math.min(1, Math.abs((2 * x) / w));
  const v = Math.min(1, Math.abs((2 * y) / h));
  return Math.sqrt(Math.max(0, 1 - u ** 6)) * Math.sqrt(Math.max(0, 1 - v ** 8));
}

function pouchGeometry(THREE, w, h, d, back) {
  const g = new THREE.PlaneGeometry(w, h, SEG_X, SEG_Y);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i += 1) pos.setZ(i, (d / 2) * puff(pos.getX(i), pos.getY(i), w, h));
  g.computeVertexNormals();
  if (back) g.rotateY(Math.PI); // the back bulges the other way and reads correctly from behind
  return g;
}

/** The average colour of the artwork's top strip: the pouch's heat seal takes it. */
function topColour(THREE, image) {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  g.drawImage(image, 0, 0, 32, 32);
  const px = g.getImageData(0, 0, 32, 3).data;
  let r = 0, gr = 0, b = 0;
  for (let i = 0; i < px.length; i += 4) { r += px[i]; gr += px[i + 1]; b += px[i + 2]; }
  const n = px.length / 4;
  return new THREE.Color().setRGB(r / n / 255, gr / n / 255, b / n / 255, THREE.SRGBColorSpace);
}

async function loadThree(ctx) {
  const mod = ctx.libs.three ? await ctx.libs.three() : await import(/* @vite-ignore */ THREE_SPEC);
  return mod.default?.WebGLRenderer ? mod.default : mod;
}

/** A small photo studio for reflections: a soft grey room, a big softbox above-left, a strip light right. */
function studio(THREE) {
  const room = new THREE.Scene();
  const box = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshBasicMaterial({ color: 0x3c3c3c, side: THREE.BackSide }));
  room.add(box);
  const panel = (w, h, intensity, x, y, z, ry = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity) }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    m.rotateZ(ry);
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
    camera.position.set(0, 0, 5.2);

    const [w, h, d] = (el.dataset.size ?? '1 1.45 0.32').split(/\s+/).map(Number);
    const loader = new THREE.TextureLoader();
    const frontTex = await loadTexture(THREE, loader, front, renderer);
    const backTex = el.dataset.back ? await loadTexture(THREE, loader, el.dataset.back, renderer) : frontTex;
    if (!alive) { renderer.dispose(); return; }
    const skin = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.48, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4, side: THREE.FrontSide });
    const bag = new THREE.Group();
    const faces = [new THREE.Mesh(pouchGeometry(THREE, w, h, d, false), skin(frontTex)), new THREE.Mesh(pouchGeometry(THREE, w, h, d, true), skin(backTex))];
    bag.add(...faces);
    // Crimped top seal: a thin strip in the artwork's own top colour reads as the pouch's heat seal.
    const seal = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.045, 0.014), new THREE.MeshPhysicalMaterial({ color: topColour(THREE, frontTex.image), roughness: 0.55, clearcoat: 0.3 }));
    seal.position.y = h / 2 - h * 0.0225;
    bag.add(seal);
    scene.add(bag);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    // Soft contact shadow under the pack.
    const shadowTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0,0,0,0.38)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.6, d * 3), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -h / 2 - 0.12;
    scene.add(shadow);

    el.appendChild(canvas);
    const fit = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(1, r.height);
      // The pack fills about 72% of the frame's height, never more than 75% of its width.
      const span = Math.max(h / FILL, w / (0.75 * camera.aspect));
      camera.position.z = span / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) + d;
      camera.updateProjectionMatrix();
    };
    fit();
    el.setAttribute('data-product3d-on', '');

    const host = el.closest('section') ?? el;
    const spin = Number.parseFloat(el.dataset.spin ?? '0.24');
    const from = Number.parseFloat(el.dataset.from ?? '-0.12');
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0, turn: from };
    let progress = 0;
    let visible = false;
    let frame = 0;
    const render = (t) => {
      now.turn += ((from + progress * spin) - now.turn) * (ctx.reduced ? 1 : DAMP * 1.5);
      now.x += (target.x - now.x) * DAMP;
      now.y += (target.y - now.y) * DAMP;
      bag.rotation.y = now.turn * Math.PI * 2 + now.x;
      bag.rotation.x = now.y * 0.6;
      bag.position.y = ctx.reduced ? 0 : Math.sin(t / 1400) * 0.04;
      shadow.material.opacity = 1 - Math.abs(bag.position.y) * 4;
      renderer.render(scene, camera);
    };
    const loop = (t) => { frame = 0; if (!visible || !alive) return; render(t); frame = requestAnimationFrame(loop); };
    const onScroll = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };
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
    window.addEventListener('resize', fit, { passive: true });
    teardown = () => {
      unwatch();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', fit);
      scene.traverse((o) => { o.geometry?.dispose(); [o.material ?? []].flat().forEach((m) => m.dispose()); });
      frontTex.dispose(); backTex.dispose(); shadowTex.dispose(); pmrem.dispose();
      renderer.dispose();
      canvas.remove();
      el.removeAttribute('data-product3d-on');
    };
  };
  ctx.once(el, () => { start().catch(fail); }, { margin: '40% 0px' });
  return () => { alive = false; teardown(); };
}
