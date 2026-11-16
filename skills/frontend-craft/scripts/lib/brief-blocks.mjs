// Brief sections beyond the look: language, pages of a site, platform UI, the dealt library component,
// references, the tells to avoid and the finishing passes. Each returns an array of markdown lines.
import path from 'node:path';
import { LIBRARY_KINDS, MIN_JOBS } from './parts.mjs';

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
    '- A real subject in real light (a place, a dish, a product, steam, cloth) can take a hero loop instead, 8 to 15 s and visibly alive: `scripts/parallax.mjs <still>` (a camera drift with real depth, on this machine, no quota), or generated motion from two keyframes with the Hugging Face MCP (Z-Image Turbo, Qwen-Image-Edit-Angles, Wan 2.2 first-last-frame A to B and B to A) joined by `scripts/video.mjs`. Steps, markup and rules: references/hero-video.md.', ''];
}

export function referencesBlock(d) {
  if (!d.direction) return [];
  return ['## Look before you design (10 minutes)',
    'Before the concept, look at good work for the parts you will build: references/inspiration.md says where (land-book and the Awwwards MCP for the page, supahero for the first screen, navbar.gallery for the phone menu, pricingpages for rates) and what premium places do. Look at two or three, including award sites in the subject\'s own trade. Under # Signature or # Rejected, note the one move you take from each and where it came from. Take moves, never a look: no copied colours, type or copy.', ''];
}

/** Library parts: search 21st.dev, cult-ui and React Bits for each part before hand-building it; the check reads the log. */
export function partsBlock(d, { partsCmd = '<skill>/scripts/components.mjs' } = {}) {
  if (!LIBRARY_KINDS.includes(d.kind)) return [];
  return ['## Library parts: search before you build',
    'Most parts of this page exist, finished and tested, in a library. Before you hand-build one (the nav, a gallery, a booking or order form, a menu or price list, a map, an FAQ, the footer), search for it by its job, in the words of what it does for the visitor:', '',
    '```sh', `node ${partsCmd} search "<the job, e.g. booking calendar with check-in and check-out>" --section <id>`, `node ${partsCmd} pick <source>:<id> --section <id> --why "<what it does here>"`, '```', '',
    `One command searches 21st.dev (its CLI), cult-ui and React Bits and logs the search; the check fails until ${MIN_JOBS} parts were searched. Open the page or preview of the two or three best, take the one whose anatomy fits, read its source (pick saves it to .craft/parts/), restyle it with the tokens. A part nothing fits is built on the kit, with the reason under # Components.`, ''];
}

/** MotionSites reference designs (optional library): the closest finished prompts, read for precision; the media shelf off photo-led subjects. */
export function designsBlock(d, { motionsites = null, photoLed = false, ref = 'references/motionsites.md' } = {}) {
  if (!d.direction && d.kind !== 'app') return [];
  if (!motionsites) return ['## Reference designs', `Not installed: \`node <skill>/scripts/setup.mjs --install\` adds the MotionSites library (40 finished heroes and landings with exact values, a media shelf, 58 technique recipes). What to take from it: ${ref}.`, ''];
  const lines = ['## Reference designs (MotionSites)'];
  if (motionsites.examples.length) {
    lines.push('Before the concept, read these finished designs in full; they are the closest of 40 to this subject:', ...motionsites.examples.map((e) => `- ${path.join(motionsites.dir, 'examples', e.file)} (${e.title}, ${e.category})`));
  } else {
    lines.push(`None of its 40 designs is close to this subject; read the index (${path.join(motionsites.dir, 'examples', 'INDEX.md')}) and open one for its precision only.`);
  }
  lines.push(`Take their precision (every face, size, tracking, duration, easing and layer has a value) and how the first screen is layered; never their names, copy or layout, and not the parts the check refuses (an italic accent word, tracked-caps eyebrows, glass on every surface, gradient text): ${ref}. Recipes with code for video loops, scrubbed video, scrims, stacking cards: ${path.join(motionsites.dir, 'references', 'techniques', 'INDEX.md')}.`);
  if (!photoLed) lines.push(`No footage of your own: its media shelf (${path.join(motionsites.dir, 'media', 'MEDIA.md')}, contact sheets media/sheet-*.jpg) has cinematic loops and cut-outs. Look at the sheets, pick by eye, download the file into the project's assets (never hotlink).`);
  lines.push('');
  return lines;
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
    '3. Look at every screenshot the check lists, at 1440 and 390, and at one frame in the middle of each set piece.',
    '4. Detail and finish: no screen with a blank half and no card that holds one number (`empty-box`); every section shows the subject twice over, a picture and its facts (a list, a ledger, a drawn detail); the footer is the blueprint\'s `.site-footer` filled for real (name, contact links, hours or last facts, sections, credits). No button that follows the cursor.', ''];
}
