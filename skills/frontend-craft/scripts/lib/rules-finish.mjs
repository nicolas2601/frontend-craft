// Rules for how finished a page looks: a subject sold by its photographs shows one in the first screen, no card or
// tile is left mostly empty, the footer is a real one, and no button chases the cursor. Pure: facts in, findings out.
import { OPERATE_KINDS, PHOTO_LED } from './deal.mjs';

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
    `put the best photograph or the hero loop in the first screen at ${HERO_PICTURE_MIN[1440] * 100}% of it or more at 1440 (${HERO_PICTURE_MIN[390] * 100}% at 390): beside the headline, under it full width, or behind it with a scrim; never a text-only first screen with the picture below the fold`)];
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

export function finishRules(facts) {
  return [...heroPictureRules(facts), ...emptyBoxRules(facts), ...footerRules(facts), ...magneticRules(facts), ...lookRules(facts)];
}
