// Richness rules for websites built on a dealt art direction: the floor that keeps a page from
// passing every defect check while still looking flat. Pure: facts in, findings out.
import { deltaE } from './color.mjs';

const MIN_SCENES = 2;
const MIN_IDEA_WORDS = 12;
const SAME_GROUND = 0.06;
const HEADINGS = ['idea', 'signature', 'rejected', 'breaks', 'components'];
const OPERATE_KINDS = ['app', 'docs'];

const f = (level, id, msg, fix) => ({ level, id, msg, fix });

/** Distinct grounds among the sections: colours closer than SAME_GROUND count once, pictures as one. */
export function distinctGrounds(grounds = []) {
  const colours = [];
  let picture = false;
  for (const g of grounds) {
    if (g === 'picture') { picture = true; continue; }
    if (!colours.some((c) => deltaE(c, g) < SAME_GROUND)) colours.push(g);
  }
  return colours.length + (picture ? 1 : 0);
}

/** The concept file's sections, how many words the idea has, the selectors named under # Breaks and the # Components text. */
export function parseConcept(text) {
  if (!text) return null;
  const parts = {};
  let current = null;
  for (const line of text.split('\n')) {
    const h = /^#{1,3}\s+(.+?)\s*$/.exec(line);
    if (h) { current = h[1].toLowerCase(); parts[current] = ''; continue; }
    if (current) parts[current] += `${line} `;
  }
  const missing = HEADINGS.filter((k) => !Object.keys(parts).some((p) => p.startsWith(k)) || !(parts[Object.keys(parts).find((p) => p.startsWith(k))] ?? '').trim());
  const ideaKey = Object.keys(parts).find((p) => p.startsWith('idea'));
  const ideaWords = ideaKey ? parts[ideaKey].trim().split(/\s+/).filter(Boolean).length : 0;
  const section = (k) => parts[Object.keys(parts).find((p) => p.startsWith(k))] ?? '';
  const breaks = [...section('breaks').matchAll(/`([^`]{1,80})`/g)].map((m) => m[1].trim()).filter((sel) => /^[.#[a-z]/i.test(sel));
  return { missing, ideaWords, breaks, components: section('components') };
}

function conceptRules(concept, deal) {
  const parsed = parseConcept(concept);
  if (!parsed) return [f('FAIL', 'concept-missing', 'no .craft/concept.md', 'write it before the markup: # Idea, # Signature, # Rejected, # Breaks, # Components (the brief shows the template)')];
  const out = [];
  if (parsed.missing.length) out.push(f('FAIL', 'concept-thin', `.craft/concept.md has no ${parsed.missing.join(', ')} section`, 'give each of # Idea, # Signature, # Rejected, # Breaks and # Components its own lines'));
  else if (parsed.ideaWords < MIN_IDEA_WORDS) out.push(f('FAIL', 'concept-thin', `the idea is ${parsed.ideaWords} words`, 'name the one thing only this subject has and how the page shows it, in one or two full sentences'));
  else if (!parsed.breaks.length) out.push(f('FAIL', 'concept-thin', '# Breaks names no element', 'under # Breaks, one line per break with the element that carries it in backticks, e.g. `.hero-letterbox`'));
  const component = deal?.motion?.component;
  if (component && !parsed.missing.includes('components') && !new RegExp(`\\b${component.id}\\b`, 'i').test(parsed.components)) {
    out.push(f('FAIL', 'deal-component', `the dealt component ${component.id} is not under # Components in .craft/concept.md`, `add it (references/components.md: shadcn add ${component.add.tsTailwind}, or port its source) and say where it sits and what it does; use a different library piece only with the reason`));
  }
  return out;
}

/** @param {{ richness?: object, doc: object, motion: object, deal?: object, concept?: string|null }} facts */
export function richnessRules({ richness, doc, motion, deal, concept = null, kind }) {
  const x = deal?.direction;
  if (!x || !richness || OPERATE_KINDS.includes(kind ?? deal.kind)) return [];
  const out = [];
  const grounds = distinctGrounds(richness.grounds);
  if (grounds < x.grounds.min) out.push(f('FAIL', 'rich-grounds', `${grounds} distinct section ground(s) over ${richness.grounds.length} sections; the ${x.id} direction asks for ${x.grounds.min}`, x.grounds.how));
  if (richness.pictures < x.pictures.min) out.push(f('FAIL', 'rich-pictures', `${richness.pictures} photograph(s) on the page; the ${x.id} direction asks for ${x.pictures.min}`, 'add real photographs (the brief\'s photos.mjs commands, or the client\'s files); a drawn box or an icon is not a photograph'));
  if (x.pictures.fullBleed && !richness.fullBleed) out.push(f('FAIL', 'rich-full-bleed', 'no photograph runs edge to edge at 1440', 'give one photograph the full width of the page (outside the gutter), e.g. the zoom set piece'));
  if (doc.h1 && doc.h1.size < x.type.minPx) out.push(f('FAIL', 'rich-type', `the h1 is ${Math.round(doc.h1.size)}px at 1440; the ${x.id} direction asks for ${x.type.minPx}px or more`, x.type.how));
  if ((motion.scenes ?? 0) < MIN_SCENES) out.push(f('FAIL', 'rich-scenes', `scroll-linked motion in ${motion.scenes ?? 0} section(s)`, `build the dealt set pieces (${deal.motion.setPieces.join(', ')}) in two different sections`));
  const missing = (deal.motion.setPieces ?? []).filter((id) => !(richness.setPieces ?? []).includes(id));
  const scene = deal.motion.scene;
  if (scene && !(richness.scenes ?? []).some((s) => s.id === scene)) out.push(f('FAIL', 'deal-scene', `the dealt hero scene ${scene} is not on the page`, `put <div class="craft-scene" data-scene="${scene}"> in the first screen (references/scenes.md) and load surfaces.css and craft-motion.js`));
  else if (scene && !(richness.scenes ?? []).some((s) => s.id === scene && s.on)) out.push(f('WARN', 'scene-off', `the ${scene} scene shows its poster: WebGL did not start`, 'open the console; the scene needs craft-motion.js init() and, for ink, a same-origin poster image'));
  if (missing.length) out.push(f('FAIL', 'deal-set-piece', `dealt set piece(s) not on the page: ${missing.map((id) => `sp-${id}`).join(', ')}`, 'build them from references/set-pieces.md with their sp- classes and data-scrub'));
  return [...out, ...conceptRules(concept, deal)];
}
