// Richness rules for websites built on a dealt art direction: the floor that keeps a page from
// passing every defect check while still looking flat. Pure: facts in, findings out.
import { deltaE } from './color.mjs';

const MIN_SCENES = 2;
const MIN_IDEA_WORDS = 12;
const SAME_GROUND = 0.06;
const HEADINGS = ['idea', 'signature', 'rejected'];

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

/** The concept file's three sections, and how many words the idea has. */
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
  return { missing, ideaWords };
}

function conceptRules(concept) {
  const parsed = parseConcept(concept);
  if (!parsed) return [f('FAIL', 'concept-missing', 'no .craft/concept.md', 'write it before the markup: # Idea, # Signature, # Rejected (the brief shows the template)')];
  const out = [];
  if (parsed.missing.length) out.push(f('FAIL', 'concept-thin', `.craft/concept.md has no ${parsed.missing.join(', ')} section`, 'give each of # Idea, # Signature and # Rejected its own lines'));
  else if (parsed.ideaWords < MIN_IDEA_WORDS) out.push(f('FAIL', 'concept-thin', `the idea is ${parsed.ideaWords} words`, 'name the one thing only this subject has and how the page shows it, in one or two full sentences'));
  return out;
}

/** @param {{ richness?: object, doc: object, motion: object, deal?: object, concept?: string|null }} facts */
export function richnessRules({ richness, doc, motion, deal, concept = null }) {
  const x = deal?.direction;
  if (!x || !richness) return [];
  const out = [];
  const grounds = distinctGrounds(richness.grounds);
  if (grounds < x.grounds.min) out.push(f('FAIL', 'rich-grounds', `${grounds} distinct section ground(s) over ${richness.grounds.length} sections; the ${x.id} direction asks for ${x.grounds.min}`, x.grounds.how));
  if (richness.pictures < x.pictures.min) out.push(f('FAIL', 'rich-pictures', `${richness.pictures} photograph(s) on the page; the ${x.id} direction asks for ${x.pictures.min}`, 'add real photographs (the brief\'s photos.mjs commands, or the client\'s files); a drawn box or an icon is not a photograph'));
  if (x.pictures.fullBleed && !richness.fullBleed) out.push(f('FAIL', 'rich-full-bleed', 'no photograph runs edge to edge at 1440', 'give one photograph the full width of the page (outside the gutter), e.g. the zoom set piece'));
  if (doc.h1 && doc.h1.size < x.type.minPx) out.push(f('FAIL', 'rich-type', `the h1 is ${Math.round(doc.h1.size)}px at 1440; the ${x.id} direction asks for ${x.type.minPx}px or more`, x.type.how));
  if ((motion.scenes ?? 0) < MIN_SCENES) out.push(f('FAIL', 'rich-scenes', `scroll-linked motion in ${motion.scenes ?? 0} section(s)`, `build the dealt set pieces (${deal.motion.setPieces.join(', ')}) in two different sections`));
  const missing = (deal.motion.setPieces ?? []).filter((id) => !(richness.setPieces ?? []).includes(id));
  if (missing.length) out.push(f('FAIL', 'deal-set-piece', `dealt set piece(s) not on the page: ${missing.map((id) => `sp-${id}`).join(', ')}`, 'build them from references/set-pieces.md with their sp- classes and data-scrub'));
  return [...out, ...conceptRules(concept)];
}
