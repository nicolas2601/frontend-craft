// Photoreal-style SVG of a "Penicilina" clicker pen: translucent amber resin barrel with a liquid core and bubbles,
// pearl nose + cap, chrome tip / rings / clip, knurled grip, wrap-around paper label with OUTLINED text (no live fonts).
//   node science-kit/pen-penicilina.gen.mjs out.svg
// Realism comes from layered, deterministic cues, not from one gradient:
//   cylinder gradients (edge dark -> key light -> core -> bounce light), long soft-box reflection streaks,
//   chrome with a hard horizon band, translucent resin that transmits light (orange glow spilled on the table),
//   contact + soft shadows, label shading overlay, grip relief (shadow line + highlight line per rib).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const T2P = join(HERE, '../tools/text2path.py');
const BOLD = '/usr/share/fonts/OpenSans/OpenSans-ExtraBold.ttf';
const NARROW = '/usr/share/fonts/gsfonts/NimbusSansNarrow-Bold.otf';
const t2p = (font, text, size, tracking = 0) => JSON.parse(execFileSync('python3', [T2P, '--font', font, '--text', text, '--size', String(size), '--tracking', String(tracking)]).toString());

const stops = (arr) => arr.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
const lg = (id, arr, h = false) => `<linearGradient id="pp-${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}">${stops(arr)}</linearGradient>`;

const label1 = t2p(BOLD, 'PENICILINA', 21, 0.01);
const label2 = t2p(NARROW, 'G SÓDICA · 1 000 000 U.I.', 7.2, 0.06);
const label3 = t2p(NARROW, 'USO INTRAMUSCULAR · INTRAVENOSO', 5.2, 0.12);
const LC = 75;                                         // label centre x
const bars = [0, 1.6, 2.4, 4.4, 5.2, 7.2, 8.8, 9.6, 11.6, 12.4, 14.8, 15.6, 17.6, 19.2, 20.4, 22.4, 24];
const barcode = bars.filter((_, i) => i % 2 === 0).map((x, i) => `<rect x="${(150 + x).toFixed(1)}" y="3.5" width="${i % 3 === 0 ? 1.8 : 1}" height="10"/>`).join('');

const ribs = Array.from({ length: 15 }, (_, i) => {
  const x = -284 + i * 8, r = 21 + ((x + 290) / 120) * 4;
  return `<path d="M${x} ${-r}V${r}" stroke="#180800" stroke-width="1.5" opacity=".6"/><path d="M${x + 1.9} ${-r}V${r}" stroke="#ffb35a" stroke-width=".8" opacity=".32"/>`;
}).join('');

const bubbles = [[-80, -7, 3.4], [-8, 9, 2.2], [112, -11, 2.9], [214, 7, 3.7], [250, -5, 1.9], [-130, 5, 2.1], [168, 11, 1.7]]
  .map(([x, y, r]) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#pp-bub)" opacity=".85"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff3d0" stroke-width=".5" opacity=".6"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.4}" r="${(r * 0.28).toFixed(2)}" fill="#fff"/></g>`).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 560" role="img" aria-labelledby="pp-t pp-d">
<title id="pp-t">Lapicero Penicilina</title>
<desc id="pp-d">Bolígrafo retráctil con barril de resina ámbar translúcida que deja ver un núcleo líquido con burbujas, punta y clip cromados, nariz y tapa nacaradas y una etiqueta blanca que dice PENICILINA G sódica, inyectable, 1 000 000 U.I.</desc>
<defs>
<radialGradient id="pp-bg" cx=".42" cy=".4" r=".85">${stops([[0, '#f6f0e2'], [0.55, '#e6dcc6'], [1, '#c9bda3']])}</radialGradient>
${lg('amber', [[0, '#180700'], [0.07, '#561f02'], [0.19, '#c4600c'], [0.3, '#ffb84d'], [0.41, '#e47a14'], [0.6, '#8a3d08'], [0.78, '#6f3005'], [0.91, '#c25f0e'], [1, '#150600']])}
${lg('liquid', [[0, '#6a2a04'], [0.25, '#ffb840'], [0.5, '#f0911a'], [0.8, '#b25a0b'], [1, '#6a2e03']])}
${lg('rubber', [[0, '#1c0a00'], [0.2, '#6e3406'], [0.38, '#b0661a'], [0.65, '#592a05'], [1, '#150700']])}
${lg('chrome', [[0, '#59626b'], [0.16, '#f6f9fc'], [0.3, '#a3aeb8'], [0.47, '#1f262c'], [0.53, '#9aa6b0'], [0.74, '#eef2f6'], [0.9, '#7b858e'], [1, '#3b434a']])}
${lg('pearl', [[0, '#7a7260'], [0.14, '#ffffff'], [0.3, '#ebe4d2'], [0.55, '#aaa28e'], [0.78, '#d6cfbc'], [0.92, '#f3eddd'], [1, '#6a6252']])}
${lg('lblshade', [[0, '#1a1208', 0.7], [0.1, '#1a1208', 0.22], [0.28, '#1a1208', 0], [0.5, '#1a1208', 0.04], [0.76, '#1a1208', 0.2], [0.9, '#1a1208', 0.42], [1, '#1a1208', 0.72]])}
${lg('spec', [[0, '#fff', 0], [0.12, '#fff', 0.85], [0.88, '#fff', 0.85], [1, '#fff', 0]], true)}
${lg('specsoft', [[0, '#fff', 0], [0.2, '#fff', 0.5], [0.8, '#fff', 0.5], [1, '#fff', 0]], true)}
<radialGradient id="pp-bub" cx=".4" cy=".35" r=".7">${stops([[0, '#fff2c4', 0.9], [0.6, '#ffc35a', 0.5], [1, '#b95f0d', 0.2]])}</radialGradient>
<radialGradient id="pp-ball" cx=".35" cy=".3" r=".8">${stops([[0, '#ffffff'], [0.5, '#9aa6b0'], [1, '#2b3238']])}</radialGradient>
<clipPath id="pp-barrelclip"><rect x="-170" y="-26" width="470" height="52" rx="3"/></clipPath>
<clipPath id="pp-gripclip"><path d="M-290-21L-170-25V25L-290 21Z"/></clipPath>
<clipPath id="pp-lblclip"><rect x="-30" y="-26" width="210" height="52"/></clipPath>
<filter id="pp-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .18  0 0 0 0 .08  0 0 0 1.6 -.55"/></filter>
<filter id="pp-b10" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="pp-b16" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="pp-b3" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="pp-b1" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="1.1"/></filter>
</defs>
<rect width="1200" height="560" fill="url(#pp-bg)"/>
<rect width="1200" height="560" filter="url(#pp-grain)" opacity=".07"/>
<g transform="translate(600 292) rotate(-12) scale(1.25)">
  <!-- table: soft shadow, contact shadow, light transmitted through the resin -->
  <rect x="-410" y="38" width="830" height="20" rx="10" fill="#2a1c0c" opacity=".34" filter="url(#pp-b10)"/>
  <rect x="-300" y="28.5" width="560" height="6" rx="3" fill="#1b1208" opacity=".55" filter="url(#pp-b3)"/>
  <ellipse cx="70" cy="64" rx="250" ry="17" fill="#ff9a1f" opacity=".3" filter="url(#pp-b16)"/>
  <ellipse cx="70" cy="46" rx="190" ry="7" fill="#ffb84a" opacity=".38" filter="url(#pp-b10)"/>

  <!-- clicker button + collar + cap -->
  <rect x="414" y="-9" width="23" height="18" rx="3.5" fill="url(#pp-chrome)"/>
  <rect x="436" y="-8" width="2.4" height="16" rx="1.2" fill="#fff" opacity=".5"/>
  <path d="M312-26L400-23C410-22 414-12 414 0C414 12 410 22 400 23L312 26Z" fill="url(#pp-pearl)"/>
  <rect x="322" y="-20" width="84" height="3.4" rx="1.7" fill="url(#pp-specsoft)" filter="url(#pp-b1)"/>
  <rect x="298" y="-27.5" width="16" height="55" rx="2.4" fill="url(#pp-chrome)"/>

  <!-- barrel: resin shell, liquid core, bubbles, caustic -->
  <g clip-path="url(#pp-barrelclip)">
    <rect x="-170" y="-26" width="470" height="52" fill="url(#pp-amber)"/>
    <rect x="-162" y="-20.5" width="456" height="41" rx="17" fill="url(#pp-liquid)"/>
    <rect x="-162" y="-20.5" width="456" height="41" rx="17" fill="none" stroke="#5b2504" stroke-width=".8" opacity=".6"/>
    ${bubbles}
    <rect x="-150" y="12.5" width="430" height="4.2" rx="2.1" fill="#ffe2a3" opacity=".55" filter="url(#pp-b1)"/>
  </g>

  <!-- label (wraps the barrel) -->
  <g clip-path="url(#pp-lblclip)">
    <rect x="-30" y="-26" width="210" height="52" fill="#f7f2e4"/>
    <rect x="-30" y="-24" width="210" height="2.4" fill="#ee4b2b"/>
    <g fill="#0f1512">
      <path transform="translate(${(LC - label1.width / 2 - 16).toFixed(2)} 2.5)" d="${label1.d}"/>
      <path transform="translate(${(LC - label2.width / 2 - 16).toFixed(2)} 12.4)" d="${label2.d}" opacity=".88"/>
      <path transform="translate(${(LC - label3.width / 2 - 16).toFixed(2)} 19)" d="${label3.d}" fill="#ee4b2b"/>
      <g opacity=".9">${barcode}</g>
    </g>
    <rect x="-30" y="-26" width="210" height="52" fill="url(#pp-lblshade)"/>
    <rect x="-30" y="-26" width="2.2" height="52" fill="#1a1208" opacity=".28"/><rect x="177.8" y="-26" width="2.2" height="52" fill="#1a1208" opacity=".22"/>
  </g>

  <!-- end shading of the resin tube (thickness seen from the side) -->
  <rect x="-170" y="-26" width="16" height="52" fill="#120500" opacity=".34" clip-path="url(#pp-barrelclip)"/>
  <rect x="284" y="-26" width="16" height="52" fill="#120500" opacity=".3" clip-path="url(#pp-barrelclip)"/>
  <!-- ring between grip and barrel -->
  <rect x="-174" y="-27" width="9" height="54" rx="2" fill="url(#pp-chrome)"/>

  <!-- soft-box reflection streaks over the whole barrel -->
  <rect x="-150" y="-21" width="420" height="6.4" rx="3.2" fill="url(#pp-spec)" opacity=".9" filter="url(#pp-b1)"/>
  <rect x="-130" y="-22.4" width="380" height="1.3" rx=".65" fill="url(#pp-spec)" opacity=".95"/>
  <rect x="-110" y="-12.5" width="330" height="1.7" rx=".85" fill="url(#pp-specsoft)" opacity=".5"/>
  <rect x="-140" y="19.2" width="400" height="2.2" rx="1.1" fill="url(#pp-specsoft)" opacity=".42"/>

  <!-- clip: attachment block, arm, bulb, shadow on barrel -->
  <rect x="112" y="-27" width="232" height="8" rx="4" fill="#150a00" opacity=".4" filter="url(#pp-b3)"/>
  <rect x="108" y="-37.5" width="260" height="7" rx="3.5" fill="url(#pp-chrome)"/>
  <ellipse cx="108" cy="-31" rx="9" ry="6.2" fill="url(#pp-chrome)"/>
  <rect x="338" y="-40" width="40" height="19" rx="3.5" fill="url(#pp-chrome)"/>
  <rect x="124" y="-36.4" width="236" height="1.4" rx=".7" fill="#fff" opacity=".7"/>

  <!-- grip: rubber with ribs, relief and shading -->
  <g clip-path="url(#pp-gripclip)">
    <path d="M-290-21L-170-25V25L-290 21Z" fill="url(#pp-rubber)"/>
    ${ribs}
    <rect x="-290" y="-18" width="120" height="3.6" rx="1.8" fill="url(#pp-specsoft)" opacity=".35" filter="url(#pp-b1)"/>
  </g>
  <rect x="-300" y="-22.5" width="10" height="45" rx="2" fill="url(#pp-chrome)"/>

  <!-- nose cone (pearl) + chrome tip + ball -->
  <path d="M-380-12C-345-16-320-19-300-20.5V20.5C-320 19-345 16-380 12Z" fill="url(#pp-pearl)"/>
  <rect x="-368" y="-9.6" width="62" height="2.6" rx="1.3" fill="url(#pp-specsoft)" opacity=".8" filter="url(#pp-b1)"/>
  <path d="M-430-2.2L-380-12V12L-430 2.2Z" fill="url(#pp-chrome)"/>
  <circle cx="-431.5" cy="0" r="3.3" fill="url(#pp-ball)"/>
</g>
</svg>
`;
const out = process.argv[2] || 'pen-penicilina.svg';
writeFileSync(out, svg);
console.log('wrote', out, svg.length, 'bytes');
