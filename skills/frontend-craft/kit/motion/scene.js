// Hero scenes: data-scene="chrome|iridescent|ink|dots" draws a live WebGL object in its element, in the
// page's own colours (--c-accent, --c-ink, --c-bg). It runs only while on screen, renders one still frame
// under reduced motion, caps the pixel ratio, and leaves the poster (a child img) in place when WebGL is
// missing. Markup and rules: references/scenes.md.
import { SHADERS, VERT } from './shaders.js';

const DPR_MAX = 1.5;
const EASE = 0.08;
const STILL_AT = 2.5;

function rgbOf(el, prop) {
  const probe = document.createElement('i');
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${prop})`;
  el.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['0', '0', '0'];
  probe.remove();
  return m.slice(0, 3).map((v) => Number(v) / 255);
}

function program(gl, frag) {
  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader did not compile');
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program did not link');
  return p;
}

function texture(gl, img) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  for (const [k, v] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return tex;
}

export function scene(el, ctx) {
  const kind = el.dataset.scene;
  if (!SHADERS[kind]) throw new Error(`unknown scene "${kind}"; use one of ${Object.keys(SHADERS).join(', ')}`);
  const canvas = document.createElement('canvas');
  canvas.className = 'craft-scene__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: 'low-power' });
  if (!gl) { el.setAttribute('data-scene-off', ''); return null; }
  el.appendChild(canvas);
  const prog = program(gl, SHADERS[kind]);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(prog, name);
  gl.uniform3fv(u('uA'), rgbOf(el, '--c-accent'));
  gl.uniform3fv(u('uB'), rgbOf(el, '--c-ink'));
  gl.uniform3fv(u('uC'), rgbOf(el, '--c-bg'));
  gl.uniform1f(u('uHasImg'), 0);

  const poster = el.querySelector('img');
  let dpr = 1;
  const useImage = () => {
    if (kind !== 'ink' || !poster?.naturalWidth) return;
    try {
      texture(gl, poster);
      gl.uniform1i(u('uImg'), 0);
      gl.uniform2f(u('uImgRes'), poster.naturalWidth, poster.naturalHeight);
      gl.uniform1f(u('uHasImg'), 1);
      draw();
    } catch { /* a cross-origin poster without CORS stays a poster */ el.setAttribute('data-scene-off', ''); }
  };

  const mouse = { x: 0.62, y: 0.5, tx: 0.62, ty: 0.5 };
  const t0 = performance.now();
  let raf = 0;
  let visible = false;
  const draw = (still = false) => {
    if (!still) { mouse.x += (mouse.tx - mouse.x) * EASE; mouse.y += (mouse.ty - mouse.y) * EASE; }
    gl.uniform1f(u('uTime'), still ? STILL_AT : (performance.now() - t0) / 1000);
    gl.uniform2f(u('uMouse'), mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = () => { raf = 0; if (!visible || document.hidden) return; draw(); raf = requestAnimationFrame(loop); };
  const wake = () => { if (ctx.reduced) draw(true); else if (!raf) raf = requestAnimationFrame(loop); };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u('uRes'), canvas.width, canvas.height);
    gl.uniform1f(u('uCell'), Math.round(14 * dpr));
    draw(ctx.reduced);
  };
  const sizes = new ResizeObserver(resize);
  sizes.observe(canvas);
  const seen = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); });
  seen.observe(el);
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
  };
  if (!ctx.reduced) window.addEventListener('pointermove', onMove, { passive: true });
  const onVisibility = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', onVisibility);
  if (poster && kind === 'ink') { if (poster.complete) useImage(); else poster.addEventListener('load', useImage, { once: true }); }
  el.setAttribute('data-scene-on', '');
  resize();

  return () => {
    cancelAnimationFrame(raf);
    sizes.disconnect();
    seen.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', onVisibility);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
    el.removeAttribute('data-scene-on');
  };
}
