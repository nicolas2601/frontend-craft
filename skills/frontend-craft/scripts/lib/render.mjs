// Turn a deal into files: tokens.css, font loading snippets and the direction brief.
import { componentBlock, finishBlock, languageBlock, pagesBlock, platformBlock, referencesBlock, sceneBlock, tellsBlock } from './brief-blocks.mjs';

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
  // A wide or all-caps display face sets about a third wider: one step down keeps a mega headline on the
  // first screen and still above 150px at 1440.
  if (type.display.stretch || type.display.case === 'uppercase') lines.push('  --t-mega: clamp(3.25rem, 0.6rem + 10vw, 11rem);');
  lines.push('}', '', 'html { background: var(--c-bg); }');
  if (type.display.stretch) lines.push('.craft-display { font-stretch: var(--display-stretch); }');
  return `${lines.join('\n')}\n`;
}

/** One line per set piece; the markup lives in references/set-pieces.md. */
export const SET_PIECE_JOBS = {
  iris: 'the next section opens through a growing circle on a new ground',
  'type-pass': 'one huge line crosses the screen as you scroll',
  zoom: 'a full-bleed photograph opens from an inset, rounded frame',
  curtain: 'a photograph parts in two and uncovers the words under it',
  fan: 'a pile of photographs fans out into a spread',
  letters: 'a heading assembles from scattered letters',
  develop: 'a photograph comes up from grey and soft to full colour',
  tilt: 'a picture or panel rises from a tilted plane',
  split: 'one half holds still while the other scrolls past it',
  'word-track': 'a line of huge words travels sideways across a pinned screen',
  'word-swap': 'one word in a sentence changes as you scroll',
  'type-zoom': 'one word fills the screen and the camera flies through it',
  'word-mask': 'a heading rises line by line out of masks',
  'bento-assemble': 'scattered tiles settle into a bento grid',
};

function motionBlock(d, setPiecesRef) {
  const { signature, supports, setPieces = [] } = d.motion;
  const row = (s, label) => `- ${label}: **${s.id}** (${s.job}). Use ${s.attrs}.\n  \`${s.html}\``;
  const pieces = setPieces.map((id) => `- Set piece: **${id}** (${SET_PIECE_JOBS[id]}). Class \`sp-${id}\`, markup in ${setPiecesRef}#${id}.`);
  return [row(signature, 'Signature'), ...supports.map((s) => row(s, 'Support')), ...pieces].join('\n');
}

function directionBlock(d) {
  const x = d.direction;
  if (!x) return [];
  const why = d.wildcard ? ' (dealt outside the subject\'s usual moods on purpose: commit to it, do not soften it back to the default)' : '';
  if (['app', 'docs'].includes(d.kind)) {
    return [`## Direction: ${x.id}${why}`, x.idea, '', `- Surfaces: ${x.grounds.how}`, `- Type: ${x.type.how}`, `- Avoid: ${x.avoid}`, '',
      'For a product interface the direction is the material (surfaces, type, colour); the work itself (tables, forms, navigation) stays clear and dense.', ''];
  }
  return [`## Direction: ${x.id}${why}`, x.idea, '',
    `- Grounds: at least ${x.grounds.min} different section grounds. ${x.grounds.how}`,
    `- Type: the h1 at least ${x.type.minPx}px tall at 1440 wide. ${x.type.how}`,
    `- Pictures: at least ${x.pictures.min} photographs${x.pictures.fullBleed ? ', one of them full bleed (edge to edge)' : ''}. ${x.pictures.treatment}`,
    '- Break the template:', ...x.breaks.map((b, i) => `  ${i + 1}. ${b}`),
    `- Avoid: ${x.avoid}`, '',
    'The composition below is the skeleton (section order, first screen); this direction decides grounds, scale, pictures and the two breaks. Where they disagree, the direction wins.', ''];
}

function photosBlock(d, { taste }) {
  if (!d.direction) return [];
  const t = taste ? `node ${taste}/scripts/photos.mjs` : null;
  const lines = ['## Photographs', 'Real photographs carry the page, never empty boxes or drawn stand-ins. Use the client\'s own files when given.'];
  if (t) {
    lines.push('With none, take licensed frames from the bundled library and Wikimedia Commons (from the project folder):', '', '```sh',
      'export TASTE_SKILL_RECENT="$HOME/.local/state/frontend-craft/photos-recent.json"   # later builds get other frames',
      `${t} search "<3-6 words: the subject, its place, its light>" --count 12 --out .`,
      `${t} pick --trade <trade from: ${'`'}photos.mjs list${'`'}> --draft-lead --pictures 12 --sections hero,<section subjects> --history .craft/photos.json`,
      `${t} fetch <ids> --hero <id> --out .`,
      `${t} credits --out . --write`, '```', '',
      'Take the frames only. Ignore the layout notes these commands print (Recipe 3, words never over a photograph, a place page stays still): they are another skill\'s house rules, and this direction overrides them. Open every frame full size before you use it; drop any that shows another business\'s name or a face as staff.');
  } else {
    lines.push('Download licensed stand-ins (Unsplash, Pexels) into the project with a SOURCES.txt naming photographer, page URL and licence; list them in the report as samples.');
  }
  return [...lines, ''];
}

function conceptBlock(d) {
  if (!d.direction || ['app', 'docs'].includes(d.kind)) return [];
  return ['## Concept (before any markup)', 'Write `.craft/concept.md` with five headings; the check reads it:', '',
    '```md', '# Idea', 'One or two sentences: the one thing only this subject has (its place, its process, a number, its people) and how this page shows it.',
    '# Signature', 'Which set piece or effect carries that idea, and what moves when. Motion that tells the idea (time passing, a thing being made), not only things appearing.',
    '# Rejected', 'Three defaults this page will not use for this subject (for a cafe: cream and terracotta with a serif, three feature cards, a centred hero over a cup).',
    '# Breaks', 'One line per break of the direction, naming the element that carries it in backticks: `.hero-letterbox`, `#tape-hours`. The check looks for each one.',
    '# Components', `The dealt library component${d.motion.component ? ` (${d.motion.component.id})` : ''} and any other library piece you used: where it sits, what you changed, its source.`, '```', ''];
}

export function briefMd(d, { kitDir, checkCmd, taste = null, setPiecesRef = 'references/set-pieces.md', componentsRef = 'references/components.md', surfacesRef = 'references/surfaces.md', scenesRef = 'references/scenes.md' }) {
  const lines = [`# Direction for this build (${d.kind}; moods: ${d.moods.join(', ') || 'none given'})`, '', ...directionBlock(d), ...languageBlock(d)];
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
  lines.push(...conceptBlock(d), ...pagesBlock(d, { setPiecesRef }), ...platformBlock(d), ...referencesBlock(d), ...photosBlock(d, { taste }));
  lines.push('## Motion', motionBlock(d, setPiecesRef),
    '- Entrance: data-enter on 3-6 first-screen elements in reading order (nav, headline, line, action, visual); done by 1.5 s.',
    '- Press feedback: data-press on every button and button-like link.', '');
  lines.push(...sceneBlock(d, { scenesRef }), ...componentBlock(d, { componentsRef }), ...tellsBlock());
  lines.push('## Start from the blueprint',
    `${kitDir}/blueprint.html is this composition as a working page: layout, scale, sticky scenes and kit attributes already wired. Copy its structure into your page or components, replace every {{...}} (the check fails on any left), and build every .visual for real. Restyle details freely; keep the skeleton and the scale.`, '',
    '## Files', `Kit copied to ${kitDir}: tokens.css, craft.css, layouts.css, set-pieces.css, surfaces.css, craft-motion.js (+ motion/), blueprint.html. Load tokens.css, craft.css, layouts.css, set-pieces.css, surfaces.css in that order, then call init(document) once. Glass, bento, riso, mono and page transitions: ${surfacesRef}.`, '',
    ...finishBlock(),
    '## Done means', `\`${checkCmd}\` prints RESULT: PASS, you opened the screenshots it lists, and the finishing passes above are done.`);
  return `${lines.join('\n')}\n`;
}
