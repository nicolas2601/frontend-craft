// Animated petri dish: a Penicillium colony grows, an inhibition halo opens, bacteria inside it fade.
// Pure CSS animation (works inline AND inside <img>), final state is the DEFAULT style, so
// prefers-reduced-motion simply switches the animation off and shows the resolved picture.
//   node science-kit/petri-grow.gen.mjs out.svg [--loop]      (--loop keeps repeating; default plays once)
import { writeFileSync } from 'node:fs';

const loop = process.argv.includes('--loop');
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const CX = 240, CY = 196, RX = 150, RY = 46;             // agar ellipse (perspective 0.31)
const MOLD = { x: CX, y: CY + 2 };
const HALO = { rx: 92, ry: 28 };
const bact = [];
while (bact.length < 56) {
  const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 0.92;
  const x = CX + Math.cos(a) * r * (RX - 12), y = CY + Math.sin(a) * r * (RY - 6);
  const inside = Math.hypot((x - MOLD.x) / HALO.rx, (y - MOLD.y) / HALO.ry) < 1.02;
  bact.push({ x: +x.toFixed(1), y: +y.toFixed(1), r: +(2.2 + rnd() * 2.6).toFixed(1), inside, d: +(0.9 + rnd() * 1.2).toFixed(2) });
}
const spores = Array.from({ length: 9 }, () => ({ x: +(MOLD.x + (rnd() - 0.5) * 90).toFixed(1), y: +(MOLD.y - 18 - rnd() * 60).toFixed(1), r: +(1.4 + rnd() * 1.6).toFixed(1), d: +(2.2 + rnd() * 1.6).toFixed(2) }));
const iter = loop ? 'infinite' : '1';
const T = 7; // seconds

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 330" role="img" aria-labelledby="pg-t pg-d">
<title id="pg-t">Cultivo de Penicillium inhibiendo bacterias</title>
<desc id="pg-d">Una placa de Petri con agar ámbar: una colonia de moho verdeazulado crece al centro y abre una zona clara donde las bacterias rojas desaparecen.</desc>
<style>
  .glow,.halo,.halo2,.mold,.fuzz,.core,.spore,.bi{transform-box:fill-box;transform-origin:center}
  .glow,.halo,.halo2,.mold,.fuzz,.core{animation:grow ${T}s cubic-bezier(.22,1,.36,1) ${iter} both}
  .halo{animation-name:grow-halo}.halo2{animation-name:grow-halo;animation-delay:.25s}
  .fuzz{animation-delay:.1s}.core{animation-delay:.2s}
  .bi{opacity:0;transform:scale(.2);animation:die ${T}s ease-in ${iter} both}
  .spore{animation:float ${T}s ease-out ${iter} both}
  .lid{animation:lid ${T}s cubic-bezier(.22,1,.36,1) ${iter} both}
  @keyframes grow{0%,8%{transform:scale(.12);opacity:.0}22%{opacity:1}70%,100%{transform:scale(1);opacity:1}}
  @keyframes grow-halo{0%,22%{transform:scale(.18);opacity:0}40%{opacity:1}85%,100%{transform:scale(1);opacity:1}}
  @keyframes die{0%,45%{transform:scale(1);opacity:1}85%,100%{transform:scale(.2);opacity:0}}
  @keyframes float{0%,35%{transform:translateY(14px);opacity:0}60%{opacity:.9}100%{transform:translateY(0);opacity:.9}}
  @keyframes lid{0%,6%{transform:translateY(0)}30%,100%{transform:translateY(-46px);opacity:.5}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
  <radialGradient id="pg-agar" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#ffc857"/><stop offset=".55" stop-color="#e8912f"/><stop offset="1" stop-color="#8a4a12"/></radialGradient>
  <radialGradient id="pg-mold" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#c9fff1"/><stop offset=".5" stop-color="#35d6b1"/><stop offset="1" stop-color="#0e8f7e"/></radialGradient>
  <radialGradient id="pg-bact" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#ffc2b8"/><stop offset=".55" stop-color="#ee4b2b"/><stop offset="1" stop-color="#8e241d"/></radialGradient>
  <radialGradient id="pg-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#35d6b1" stop-opacity=".45"/><stop offset="1" stop-color="#35d6b1" stop-opacity="0"/></radialGradient>
  <linearGradient id="pg-wall" x1="0" x2="1"><stop offset="0" stop-color="#c9fff1" stop-opacity=".38"/><stop offset=".5" stop-color="#0f1512" stop-opacity=".28"/><stop offset="1" stop-color="#c9fff1" stop-opacity=".38"/></linearGradient>
  <filter id="pg-blur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<ellipse cx="${CX}" cy="${CY + 52}" rx="${RX + 14}" ry="22" fill="#0f1512" opacity=".35" filter="url(#pg-blur)"/>
<ellipse class="glow" cx="${CX}" cy="${CY + 14}" rx="205" ry="82" fill="url(#pg-glow)"/>
<path d="M${CX - RX - 12} ${CY - 2}v28a${RX + 12} ${RY + 12} 0 0 0 ${2 * (RX + 12)} 0v-28z" fill="url(#pg-wall)" stroke="#c9fff1" stroke-opacity=".35"/>
<ellipse cx="${CX}" cy="${CY - 2}" rx="${RX + 12}" ry="${RY + 12}" fill="#7be8d0" fill-opacity=".07" stroke="#c9fff1" stroke-opacity=".7" stroke-width="1.4"/>
<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="url(#pg-agar)" stroke="#ffe3a3" stroke-opacity=".5"/>
<ellipse class="halo2" cx="${MOLD.x}" cy="${MOLD.y}" rx="${HALO.rx + 22}" ry="${HALO.ry + 7}" fill="#fff3cf" fill-opacity=".1" stroke="#fff3cf" stroke-opacity=".3"/>
<ellipse class="halo" cx="${MOLD.x}" cy="${MOLD.y}" rx="${HALO.rx}" ry="${HALO.ry}" fill="#fff3cf" fill-opacity=".3" stroke="#fff3cf" stroke-opacity=".75" stroke-width="1.2"/>
${bact.map((b) => `<ellipse class="${b.inside ? 'bi' : 'bo'}" cx="${b.x}" cy="${b.y}" rx="${b.r}" ry="${(b.r * 0.62).toFixed(1)}" fill="url(#pg-bact)"${b.inside ? ` style="animation-delay:${b.d}s"` : ''}/>`).join('\n')}
<ellipse class="fuzz" cx="${MOLD.x}" cy="${MOLD.y}" rx="46" ry="14" fill="#7be8d0" fill-opacity=".55"/>
<ellipse class="mold" cx="${MOLD.x}" cy="${MOLD.y}" rx="30" ry="9.5" fill="url(#pg-mold)" stroke="#7be8d0" stroke-opacity=".6"/>
<ellipse class="core" cx="${MOLD.x}" cy="${MOLD.y - 0.8}" rx="11" ry="3.4" fill="#f2fffb"/>
${spores.map((s) => `<circle class="spore" cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#c9fff1" style="animation-delay:${s.d}s"/>`).join('\n')}
<g class="lid"><ellipse cx="${CX}" cy="${CY - 14}" rx="${RX + 16}" ry="${RY + 14}" fill="#c9fff1" fill-opacity=".05" stroke="#c9fff1" stroke-opacity=".55" stroke-width="1.4"/><path d="M${CX - 120} ${CY - 44}a${RX + 16} ${RY + 14} 0 0 1 88 -22" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2.4" stroke-linecap="round"/></g>
</svg>
`;
writeFileSync(process.argv[2] || 'petri-grow.svg', svg);
console.log('wrote', process.argv[2] || 'petri-grow.svg', svg.length, 'bytes');
