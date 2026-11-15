// Brief sections beyond the look: language, pages of a site, platform UI, the dealt library component,
// references, the tells to avoid and the finishing passes. Each returns an array of markdown lines.

export function languageBlock(d) {
  if (!d.lang) return ['## Language', 'Write the page in the language of the request and of its audience, and set <html lang> to it. The check compares the two.', ''];
  return [`## Language: ${d.lang}`, `Every visible word is ${d.lang}, and <html lang="${d.lang}">. The check fails a page that reads in another language.`, ''];
}

export function pagesBlock(d, { setPiecesRef }) {
  if (!d.pages?.length) return [];
  return ['## Pages (a multi-page site)',
    'Each page is a real page with its own URL, its own first screen and its own two set pieces; never the same piece on two pages.',
    ...d.pages.map((p) => `- \`${p.path}\`: ${p.setPieces.map((id) => `**${id}**`).join(' + ')} (markup in ${setPiecesRef}#${p.setPieces[0]})`),
    '- Shared: one navigation, one footer, the same tokens. Pages are told apart by their first screen and their set pieces, not by new colours.',
    '- Page transitions: load the kit surfaces.css (cross-document @view-transition) and give the element that stays from page to page (the logo, the hero picture) one view-transition-name. In a single-page app use document.startViewTransition on route change.',
    '- The check runs on every page listed here (`--pages` to override).', ''];
}

export function platformBlock(d) {
  if (!['app', 'docs'].includes(d.kind)) return [];
  return ['## Platform UI',
    'This is a product interface: the person is here to get something done. The direction sets the material (surfaces, type, colour); it does not add scroll scenes.',
    '- Controls: the project\'s own primitives first; in React, HeroUI v3 or shadcn/base-ui for menus, dialogs, selects, tabs, toasts (references/components.md). Never hand-roll focus logic.',
    '- Layout: dense where the work is (tables, lists, forms), calm around it. A bento overview or glass panels only where the direction says so, over real data.',
    '- Motion (Emil): press feedback scale(0.97) in 100-160 ms; popovers and menus 150-250 ms ease-out from their trigger; modals and drawers up to 400 ms; nothing animates on keyboard actions; exits faster than entrances; hover effects only under (hover: hover) and (pointer: fine).',
    '- States: empty, loading, error and long content for every list and form you build.', ''];
}

export function componentBlock(d, { componentsRef }) {
  const c = d.motion.component;
  if (!c) return [];
  return [`## Library component: ${c.id} (React Bits)`, `${c.job}. ${c.description}`, '',
    `- React (Tailwind): \`npx shadcn@latest add ${c.add.tsTailwind}\`; plain CSS: \`${c.add.tsCss}\`; JavaScript: \`${c.add.jsCss}\`. Dependencies: ${c.deps.length ? c.deps.join(', ') : 'none'}.`,
    '- Not React: read the registry JSON (files[].content), port the effect to the kit or your framework, and keep its credit in a comment.',
    `- Restyle it with the dealt tokens; check it under reduced motion, at 390 px and with the keyboard. Name it under # Components in .craft/concept.md, with where it sits. How to choose, add and adapt library pieces (React Bits, HeroUI, shadcn, 21st.dev): ${componentsRef}.`, ''];
}

const SCENE_JOBS = {
  chrome: 'liquid chrome: metaballs that merge and follow the pointer, reflecting the palette like a studio',
  iridescent: 'an iridescent ring whose colour shifts with the angle of view, pearl rather than rainbow',
  ink: 'the hero photograph printed in two inks; its true colour opens around the pointer and the ink breathes',
  dots: 'a halftone field of dots that swells around the pointer, in ink with the accent where the pointer is',
};

export function sceneBlock(d, { scenesRef }) {
  const s = d.motion.scene;
  if (!s) return [];
  const markup = s === 'ink'
    ? `<div class="craft-scene" data-scene="ink"><img src="assets/hero.webp" alt="..." width="1600" height="1000"></div>`
    : `<div class="craft-scene" data-scene="${s}" aria-hidden="true"></div>`;
  return [`## Hero scene: ${s}`, `The first screen carries one live object: ${SCENE_JOBS[s]}. It is the page's signature image, not a background behind body text.`, '',
    '```html', markup, '```', '',
    `- Give it real room (at least half the first screen) beside or under the headline; the words sit on solid ground or strong contrast, never on the busiest part. Kit: \`surfaces.css\` (.craft-scene) and \`craft-motion.js\` (data-scene). It pauses off screen, renders a still under reduced motion and keeps its poster without WebGL. Rules and variants: ${scenesRef}.`,
    '- Pair it with huge type and one or two real facts set as HTML on top of the scene (a weight, a time, a count), not decorative labels.',
    '- A real subject in real light (a place, a dish, a product, steam, cloth) can take a hero loop instead: a seamless muted clip made free from a still with the Hugging Face MCP (Z-Image Turbo, then Wan 2.2 first-last-frame) and `scripts/video.mjs`. Markup, install and rules: references/hero-video.md.', ''];
}

export function referencesBlock(d) {
  if (!d.direction) return [];
  return ['## Look before you design (10 minutes)',
    'Before the concept, look at good work for the parts you will build: references/inspiration.md says where (land-book and the Awwwards MCP for the page, supahero for the first screen, navbar.gallery for the phone menu, pricingpages for rates) and what premium places do. Look at two or three, including award sites in the subject\'s own trade. Under # Signature or # Rejected, note the one move you take from each and where it came from. Take moves, never a look: no copied colours, type or copy.', ''];
}

export function tellsBlock() {
  return ['## Tells the check fails',
    '- Copy: slogan shapes ("A little X. A lot of Y.", "Tear it. Toast it. Share it.", "more than just", "where X meets Y", "made with love", "your morning ritual"). Write facts only this business has: a time, a street, a name, a number, how it is made.',
    '- One way of numbering at most: no "01 —" kickers over every heading on top of big numerals, slide counters and numbered captions. No small uppercase eyebrow label stacked over every heading.',
    '- No round tilted or spinning badge ("Naturally leavened", "Since 1998"). No photograph used in two sections. No decorative WebGL background (aurora, particles, glow orbs).',
    '- A huge headline holds few words: at --t-mega keep it to about four words; longer lines go one size down.',
    '- impeccable\'s detector runs inside the check: its slop rules fail too.', ''];
}

export function finishBlock() {
  return ['## Finish (after the check passes)',
    '1. impeccable: run its `critique` on the page, then `audit`; fix what they find, then `polish`. Re-run the check.',
    '2. Motion review with Emil\'s rules (skills emil-design-eng or review-animations when installed): for each animation say why it moves; write the fixes as a Before | After | Why table in the report.',
    '3. Look at every screenshot the check lists, at 1440 and 390, and at one frame in the middle of each set piece.', ''];
}
