// Rules for how finished a page looks: a subject sold by its photographs shows one in the first screen, no card or
// tile is left mostly empty, the footer is a real one, and no button chases the cursor. Pure: facts in, findings out.
import { OPERATE_KINDS, PHOTO_LED } from './deal.mjs';
import { partsRules } from './parts.mjs';

const f = (level, id, msg, fix) => ({ level, id, msg, fix });
export const HERO_PICTURE_MIN = { 1440: 0.35, 390: 0.3 };
const EMPTY_BOXES_FAIL = 3;
const FOOTER_MIN_LINKS = 3;

/** A place, a dish or a product sold by its pictures opens on its picture: a third of the first screen or more. */
export function heroPictureRules({ heroPicture = {}, deal }) {
  const moods = deal?.moods ?? [];
  if (!moods.some((m) => PHOTO_LED.includes(m))) return [];
  const short = Object.entries(HERO_PICTURE_MIN).filter(([w, min]) => heroPicture[w] && heroPicture[w].share < min);
  if (!short.length) return [];
  return [f('FAIL', 'hero-picture', `the subject's picture fills ${short.map(([w]) => `${Math.round(heroPicture[w].share * 100)}% of the first screen at ${w}`).join(' and ')} (${heroPicture[short[0][0]].label || 'no picture'}); a subject sold by its photographs opens on one`,
    `put the best photograph or the hero loop in the first screen at ${HERO_PICTURE_MIN[1440] * 100}% of it or more at 1440 (${HERO_PICTURE_MIN[390] * 100}% at 390): full bleed behind the words with a scrim (the dive recipe), or beside them at its own ratio. Choose the focal point with object-position; never crop the source file and never letterbox it with object-fit: contain`)];
}

/** Big boxes that hold one number or two lines read as a template filled in a hurry. */
export function emptyBoxRules({ emptyBoxes = [] }) {
  if (!emptyBoxes.length) return [];
  const level = emptyBoxes.length >= EMPTY_BOXES_FAIL ? 'FAIL' : 'WARN';
  return [f(level, 'empty-box', `${emptyBoxes.length} card(s) or tile(s) mostly empty: ${emptyBoxes.slice(0, 3).join('; ')}`,
    'fit the box to what it holds (no fixed min-height), or give it what the subject has: a photograph, a short list of facts (sizes, times, what is included), a detail drawn in SVG. A stat alone in a big tile is the template look')];
}

/** The footer finishes the page: how to reach the business, where things are, and the way back up. */
export function footerRules({ footer, kind }) {
  if (!footer || OPERATE_KINDS.includes(kind)) return [];
  if (!footer.present) return [f('FAIL', 'footer-missing', 'no <footer>', 'end the page with a footer: the name, how to reach it (address, phone or WhatsApp, email as links), the section links, hours if it opens its doors, the credits line')];
  const missing = [
    footer.links < FOOTER_MIN_LINKS && `${footer.links} link(s)`,
    !footer.contact && 'no contact link (tel:, mailto:, WhatsApp, a map) or <address>',
  ].filter(Boolean);
  if (!missing.length) return [];
  return [f('FAIL', 'footer-thin', `the footer is an afterthought: ${missing.join(', ')}`,
    'build it as a section of its own: the name set large or the mark; contact as links (tel:, mailto:, wa.me, a map link); the section links again; hours or the visit facts for a place; the credits on one small line. Use the page\'s grounds and type, not a grey strip')];
}

/** A button that leans toward the cursor is a template trick, not feedback. */
export function magneticRules({ slop }) {
  const n = slop?.magnetic ?? 0;
  if (!n) return [];
  return [f('WARN', 'magnetic-button', `${n} element(s) follow the cursor (data-magnetic)`, 'remove data-magnetic: press feedback (data-press) and a hover colour are the feedback a button needs')];
}

/** The model chooses the look (design.mjs set); a page built on the neutral stand-ins was never designed. */
export function lookRules({ deal }) {
  if (deal?.look !== 'model' || deal.design?.set) return [];
  return [f('FAIL', 'look-pending', 'the colours and type were never chosen: the page runs on the neutral stand-ins', 'choose them as references/color-type.md says (ui-ux-pro-max for candidates, the subject for the reasons), then run design.mjs set')];
}

export const FLAT = { blank: 0.965, sparse: 0.9, half: 0.985, other: 0.93 };

/**
 * Screens that show almost nothing, read from real screenshots down the page: one flat colour over 96.5% of the
 * screen is blank (an empty stage, a curtain opening on a void, a frame a script never filled); over 90%, a sparse
 * screen (a number or a few words alone on an empty ground: the critic and look.mjs judge it); one half flat while the
 * other holds the content, a half-empty one. Measured: an empty iris 1.00, a curtain on three small words 0.99, a
 * dark stats band 0.94, a curtain on a big motto 0.95, a page whose every section holds a photograph 0.69 at most.
 */
export function blankRules({ blank = [], kind }) {
  if (OPERATE_KINDS.includes(kind) || !blank.length) return [];
  const at = (list) => list.slice(0, 4).map((b) => b.y).join(', ');
  const empty = blank.filter((b) => b.all >= FLAT.blank);
  const sparse = blank.filter((b) => b.all >= FLAT.sparse && b.all < FLAT.blank);
  const half = blank.filter((b) => b.all < FLAT.blank && Math.max(b.left, b.right) >= FLAT.half && Math.min(b.left, b.right) < FLAT.other);
  const out = [];
  if (empty.length) out.push(f('FAIL', 'blank-screen', `${empty.length} screen(s) are one flat colour while scrolling at 1440 (at y ${at(empty)})`,
    'open the look.mjs sheets at those heights: give the stage its picture or footage, shorten a pinned section that runs past its content, or remove the effect that leaves the screen empty (a curtain or iris on a dark ground, a scene or map that did not render)'));
  if (sparse.length) out.push(f('WARN', 'sparse-screen', `${sparse.length} screen(s) are mostly one flat colour (at y ${at(sparse)}): a few words, a number or a band of stats alone on an empty ground`,
    'look at those heights in the look.mjs sheets as the client would: a dark stage that opens on a few words reads unfinished. Bring the section\'s picture or footage into it, set the words to fill the screen, or tighten the section'));
  if (half.length) out.push(f('WARN', 'half-empty', `${half.length} screen(s) have one half empty while the other holds everything (at y ${at(half)})`,
    'fill the empty half with the section\'s picture, footage or map, or centre the content and narrow the section'));
  return out;
}

/** A big drawing of boxes, straight lines and labels where a picture or a real map belongs. */
export function drawnSvgRules({ drawnSvg = [], kind }) {
  if (OPERATE_KINDS.includes(kind) || !drawnSvg.length) return [];
  return [f('FAIL', 'svg-boxes', `${drawnSvg.length} large drawing(s) made only of boxes, straight lines and labels (${drawnSvg.map((d) => `${d.label || 'svg'}: ${d.shapes} shapes, ${d.area}% of the screen`).join('; ')})`,
    'a place is shown on a real map (the data-map recipe: MapLibre + OpenStreetMap) or in its photograph; a process in its footage or photographs. An illustration is drawn for real (svg-craft), never a wireframe of rectangles')];
}

/** Studio builds think before they build: the storyboard in .craft/plan.md is what the page is checked against. */
export function planRules({ deal, plan }) {
  if (deal?.mode !== 'studio' || plan === undefined) return [];
  if ((plan?.rows ?? 0) >= 3) return [];
  return [f('FAIL', 'plan-missing', `.craft/plan.md has ${plan?.rows ?? 0} storyboard row(s)`,
    'fill .craft/plan.md before building: # Brief, # References, # Direction, and a # Storyboard row for every section (the visitor\'s question, what they see, the media and where it comes from, the motion and why, the part)')];
}

export function finishRules(facts) {
  return [...heroPictureRules(facts), ...emptyBoxRules(facts), ...footerRules(facts), ...magneticRules(facts), ...lookRules(facts), ...partsRules(facts), ...blankRules(facts), ...drawnSvgRules(facts), ...planRules(facts)];
}
