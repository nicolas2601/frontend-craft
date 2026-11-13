// Turn a deal into files: tokens.css, font loading snippets and the direction brief.

const plus = (family) => family.replace(/ /g, '+');
const fallback = (face) => (face.serif ? 'Georgia, serif' : 'system-ui, sans-serif');

function faces(type) {
  return [['display', type.display], ['text', type.text], ['mono', type.mono]].filter(([, f]) => f);
}

export function googleFontsUrl(type) {
  const fams = new Map();
  for (const [, face] of faces(type)) {
    const prev = fams.get(face.family);
    if (face.axes) { fams.set(face.family, { axes: face.axes }); continue; }
    if (prev?.axes) continue;
    fams.set(face.family, { weights: [...new Set([...(prev?.weights ?? []), ...face.weights])].sort((a, b) => a - b) });
  }
  const params = [...fams.entries()].map(([fam, v]) => `family=${plus(fam)}:${v.axes ?? `wght@${v.weights.join(';')}`}`);
  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
}

export function fontLinks(type) {
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${googleFontsUrl(type)}">`,
  ].join('\n');
}

/** next/font/google setup that feeds tokens.css through --next-display / --next-text / --next-mono. */
export function nextFont(type) {
  const seen = new Map();
  for (const [role, face] of faces(type)) {
    const name = face.family.replace(/ /g, '_');
    const opts = face.axes
      ? `{ subsets: ['latin'], axes: ['${face.axes.split(',')[0]}'], variable: '--next-${role}' }`
      : `{ subsets: ['latin'], weight: [${face.weights.map((w) => `'${w}'`).join(', ')}], variable: '--next-${role}' }`;
    seen.set(role, { name, line: `const ${role} = ${name}(${opts});` });
  }
  const imports = [...new Set([...seen.values()].map((v) => v.name))].join(', ');
  return [
    `import { ${imports} } from 'next/font/google';`,
    ...[...seen.values()].map((v) => v.line),
    `// <html className={\`${[...seen.keys()].map((r) => `\${${r}.variable}`).join(' ')}\`}>`,
  ].join('\n');
}

export function tokensCss(d) {
  const { palette, type } = d;
  const r = palette.roles;
  const lines = [
    `/* Dealt by frontend-craft: palette ${palette.id}, type ${type.id}, composition ${d.composition.id}. */`,
    '/* Re-deal: node <skill>/scripts/start.mjs --redeal. Do not hand-pick other colors or fonts. */',
    ':root {',
    `  color-scheme: ${palette.scheme};`,
    `  --c-bg: ${r.bg};`,
    `  --c-surface: ${r.surface};`,
    `  --c-ink: ${r.ink};`,
    `  --c-muted: ${r.muted};`,
    `  --c-line: ${r.line};`,
    `  --c-accent: ${r.accent};`,
    `  --c-accent-ink: ${r.accentInk};`,
    `  --f-display: var(--next-display, '${type.display.family}'), ${fallback(type.display)};`,
    `  --f-text: var(--next-text, '${type.text.family}'), ${fallback(type.text)};`,
    type.mono ? `  --f-mono: var(--next-mono, '${type.mono.family}'), ui-monospace, monospace;` : '  --f-mono: ui-monospace, monospace;',
    `  --display-weight: ${Math.max(...type.display.weights)};`,
    `  --display-tracking: ${type.display.tracking};`,
    `  --display-leading: ${type.display.leading};`,
    `  --display-case: ${type.display.case};`,
  ];
  if (type.display.stretch) lines.push(`  --display-stretch: ${type.display.stretch};`);
  lines.push('}', '', 'html { background: var(--c-bg); }');
  if (type.display.stretch) lines.push('.craft-display { font-stretch: var(--display-stretch); }');
  return `${lines.join('\n')}\n`;
}

function motionBlock(d) {
  const { signature, supports } = d.motion;
  const row = (s, label) => `- ${label}: **${s.id}** (${s.job}). Use ${s.attrs}.\n  \`${s.html}\``;
  return [row(signature, 'Signature'), ...supports.map((s) => row(s, 'Support'))].join('\n');
}

export function briefMd(d, { kitDir, checkCmd }) {
  const lines = [`# Direction for this build (${d.kind}; moods: ${d.moods.join(', ') || 'none given'})`, ''];
  if (d.palette) {
    const r = d.palette.roles;
    lines.push(`## Palette: ${d.palette.id} (${d.palette.scheme})`, d.palette.note, '',
      `bg ${r.bg} · surface ${r.surface} · ink ${r.ink} · muted ${r.muted} · line ${r.line} · accent ${r.accent} (text on accent ${r.accentInk})`,
      'Large fields use bg, surface, ink or accent only. The accent marks the primary action and at most one other thing per screen.', '');
  }
  if (d.type) {
    const t = d.type;
    lines.push(`## Type: ${t.id}`, t.note, '',
      `Display: ${t.display.family} ${t.display.weights.join('/')}, tracking ${t.display.tracking}, leading ${t.display.leading}${t.display.case === 'uppercase' ? ', uppercase' : ''}. Class .craft-display.`,
      `Text: ${t.text.family} ${t.text.weights.join('/')}${t.mono ? `. Mono: ${t.mono.family}` : ''}.`,
      'Load the fonts (pick one):', '', '```html', fontLinks(t), '```', '', '```ts', nextFont(t), '```', '');
  }
  if (d.brand) lines.push('## Brand mode', 'Palette and type come from the project. Map them onto --c-* and --f-* in your own tokens file.', '');
  const c = d.composition;
  lines.push(`## Composition: ${c.id}`, c.idea, '', `First screen: ${c.firstScreen}`, '',
    'Sections, in order (rename them for the subject; keep the pacing):', ...c.sections.map((s, i) => `${i + 1}. ${s}`), '');
  lines.push('## Motion', motionBlock(d),
    '- Entrance: data-enter on 3-6 first-screen elements in reading order (nav, headline, line, action, visual); done by 1.5 s.',
    '- Press feedback: data-press on every button and button-like link.', '');
  lines.push('## Start from the blueprint',
    `${kitDir}/blueprint.html is this composition as a working page: layout, scale, sticky scenes and kit attributes already wired. Copy its structure into your page or components, replace every {{...}} (the check fails on any left), and build every .visual for real. Restyle details freely; keep the skeleton and the scale.`, '',
    '## Files', `Kit copied to ${kitDir}: tokens.css, craft.css, layouts.css, craft-motion.js (+ motion/), blueprint.html. Load tokens.css, craft.css, layouts.css in that order, then call init(document) once.`, '',
    '## Done means', `\`${checkCmd}\` prints RESULT: PASS, and you opened the screenshots it lists.`);
  return `${lines.join('\n')}\n`;
}
