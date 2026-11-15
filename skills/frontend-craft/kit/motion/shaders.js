// Fragment shaders for the hero scenes (data-scene). WebGL 1, one full-screen triangle, no libraries.
// Shared uniforms: uRes (px), uTime (s), uMouse (0..1, origin bottom left), uA accent, uB ink, uC ground.
// Techniques: sphere tracing with smooth union (metaballs), a cosine palette for thin-film colour,
// value-noise fbm. All standard, written for this kit.

export const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

const HEAD = `precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = rot(0.5) * p * 2.02; a *= 0.5; } return v; }
`;

const MARCH = `
vec3 nrm(vec3 p){ vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx))); }
float march(vec3 ro, vec3 rd){ float t = 0.0;
  for (int i = 0; i < 90; i++) { float d = map(ro + rd * t); if (d < 0.001 || t > 9.0) break; t += d * 0.7; }
  return t; }
`;

/** Liquid chrome: three metaballs and one that follows the pointer, reflecting the palette as a studio. */
const chrome = `${HEAD}
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float map(vec3 p){
  float t = uTime * 0.35;
  vec3 m = vec3((uMouse - 0.5) * vec2(2.6, 1.6), 0.4);
  float d = length(p - vec3(sin(t) * 0.45, cos(t * 1.3) * 0.25, 0.0)) - 0.62;
  d = smin(d, length(p - vec3(cos(t * 0.8) * 0.8, sin(t * 1.1) * 0.45, sin(t) * 0.3)) - 0.42, 0.5);
  d = smin(d, length(p - vec3(sin(t * 0.6 + 2.0) * 0.7, -0.4 + cos(t) * 0.15, -0.2)) - 0.34, 0.45);
  d = smin(d, length(p - m * 0.8) - 0.26, 0.55);
  return d;
}
${MARCH}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 4.2), rd = normalize(vec3(uv, -1.7));
  float t = march(ro, rd);
  if (t > 9.0) { gl_FragColor = vec4(0.0); return; }
  vec3 p = ro + rd * t, n = nrm(p), r = reflect(rd, n);
  float h = r.y * 0.5 + 0.5;
  // a dark studio with a bright floor, two soft boxes and one accent strip, all from the palette
  vec3 lo = dot(uB, vec3(0.33)) < dot(uC, vec3(0.33)) ? uB : uC;
  vec3 hi = dot(uB, vec3(0.33)) < dot(uC, vec3(0.33)) ? uC : uB;
  vec3 env = mix(hi * 0.85, lo * 0.6, smoothstep(0.3, 0.55, h));
  env += hi * smoothstep(0.82, 0.95, h) * smoothstep(0.6, 0.2, abs(r.x + 0.35));
  env += hi * 0.6 * smoothstep(0.7, 0.8, h) * smoothstep(0.25, 0.05, abs(r.x - 0.55));
  env = mix(env, uA, smoothstep(0.5, 0.52, h) * smoothstep(0.58, 0.55, h));
  float fr = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
  float spec = pow(max(dot(r, normalize(vec3(0.5, 0.8, 0.6))), 0.0), 120.0);
  vec3 col = env * (0.75 + 0.35 * fr) + spec;
  gl_FragColor = vec4(col, 1.0);
}`;

/** Iridescent: a twisted ring with a thin-film colour that shifts with the angle of view. */
const iridescent = `${HEAD}
float map(vec3 p){
  float t = uTime * 0.22;
  p.yz *= rot(0.95 + (uMouse.y - 0.5) * 0.6);
  p.xz *= rot(t + (uMouse.x - 0.5) * 0.9);
  float a = atan(p.z, p.x);
  vec2 q = vec2(length(p.xz) - 1.15, p.y);
  q *= rot(a * 1.5 + t * 2.0);
  return length(q * vec2(1.0, 1.9)) / 1.9 - 0.2;
}
${MARCH}
vec3 film(float t){ return vec3(0.5) + 0.5 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.67))); }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 3.6), rd = normalize(vec3(uv, -1.6));
  float t = march(ro, rd);
  if (t > 9.0) { gl_FragColor = vec4(0.0); return; }
  vec3 p = ro + rd * t, n = nrm(p), v = -rd;
  float nd = max(dot(n, v), 0.0), fr = pow(1.0 - nd, 2.0);
  vec3 f = film(nd * 1.1 + uTime * 0.04 + n.y * 0.2);
  vec3 lo = dot(uB, vec3(0.33)) < dot(uC, vec3(0.33)) ? uB : uC;
  vec3 hi = dot(uB, vec3(0.33)) < dot(uC, vec3(0.33)) ? uC : uB;
  vec3 pearl = mix(hi * 0.92, lo * 0.35, pow(nd, 3.0));
  vec3 col = mix(pearl, f * mix(hi, uA, 0.35), 0.55 * fr + 0.15);
  vec3 r = reflect(rd, n);
  float spec = pow(max(dot(r, normalize(vec3(0.4, 0.8, 0.5))), 0.0), 90.0);
  gl_FragColor = vec4(col + spec * 0.8, 1.0);
}`;

/** Ink: the photograph printed in two inks; true colour opens around the pointer and the ink breathes. */
const ink = `${HEAD}
uniform sampler2D uImg; uniform vec2 uImgRes; uniform float uHasImg;
vec2 cover(vec2 uv){ float ra = uRes.x / uRes.y, ri = uImgRes.x / max(uImgRes.y, 1.0);
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0); return (uv - 0.5) * s + 0.5; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float n = fbm(uv * 3.0 + uTime * 0.04);
  float dm = distance(uv * asp, uMouse * asp);
  vec2 disp = (vec2(n) - 0.5) * 0.02 + (uv - uMouse) * 0.05 * exp(-dm * 5.0);
  vec3 img = uHasImg > 0.5 ? texture2D(uImg, cover(uv + disp)).rgb : vec3(n);
  float lum = dot(img, vec3(0.299, 0.587, 0.114));
  float edge = smoothstep(0.32, 0.68, lum + (n - 0.5) * 0.3);
  vec3 lo = dot(uB, vec3(0.33)) < dot(uC, vec3(0.33)) ? uB : uC;
  vec3 hi = dot(uB, vec3(0.33)) < dot(uC, vec3(0.33)) ? uC : uB;
  vec3 duo = mix(lo, hi, edge);
  float open = smoothstep(0.1, 0.0, dm - 0.22 - 0.06 * sin(uTime * 0.7) - (n - 0.5) * 0.12);
  gl_FragColor = vec4(mix(duo, img, open), 1.0);
}`;

/** Dot field: a halftone of noise that swells around the pointer, in ink with accent near the pointer. */
const dots = `${HEAD}
uniform float uCell;
void main(){
  vec2 px = gl_FragCoord.xy;
  vec2 c = (floor(px / uCell) + 0.5) * uCell;
  vec2 uv = c / uRes;
  float n = fbm(uv * vec2(uRes.x / uRes.y, 1.0) * 2.2 + vec2(uTime * 0.05, uTime * 0.03));
  float dm = distance(c, uMouse * uRes) / uRes.y;
  float near = exp(-dm * 5.0);
  float r = uCell * 0.5 * clamp(n * 1.25 - 0.3 + 0.75 * near, 0.0, 1.0);
  float a = smoothstep(r, r - 1.25, length(px - c));
  vec3 col = mix(uB, uA, near);
  gl_FragColor = vec4(col * a, a);
}`;

export const SHADERS = { chrome, iridescent, ink, dots };
export const SCENES = Object.keys(SHADERS);
