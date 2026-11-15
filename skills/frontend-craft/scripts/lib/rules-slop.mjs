// Rules for the tells that mark a page as machine-made: the wrong language, the same photograph
// twice, several numbering systems at once, round tilted badges, and the art direction's breaks
// or the dealt component missing. Pure: facts in, findings out.
import { detectLang } from './copy.mjs';

const f = (level, id, msg, fix) => ({ level, id, msg, fix });
const base = (tag = '') => tag.toLowerCase().split('-')[0];

/** The page must be written, and declared, in the language it was dealt (or at least declared in the one it is written in). */
export function langRules({ doc, deal }) {
  const want = base(deal?.lang ?? '');
  const declared = base(doc.lang);
  const written = detectLang(doc.text ?? '');
  const out = [];
  if (want && declared && declared !== want) out.push(f('FAIL', 'copy-lang', `<html lang="${doc.lang}"> but the page was dealt "${deal.lang}"`, `write the page in ${deal.lang} and set <html lang="${deal.lang}">`));
  if (want && written && written !== want) out.push(f('FAIL', 'copy-lang', `the visible copy reads as "${written}", the page was dealt "${deal.lang}"`, `rewrite the copy in ${deal.lang}: the audience reads ${deal.lang}`));
  if (!want && declared && written && declared !== written) out.push(f('FAIL', 'copy-lang', `<html lang="${doc.lang}"> but the visible copy reads as "${written}"`, 'declare the language the copy is written in, or write it in the audience\'s language'));
  return out.slice(0, 1);
}

function numberingRules(slop) {
  const systems = Object.entries(slop.numbering).filter(([, n]) => n >= 2);
  if (systems.length < 2) return [];
  return [f('FAIL', 'slop-numbering', `${systems.length} numbering systems at once (${systems.map(([k, n]) => `${n} ${k}`).join(', ')}), e.g. ${slop.numberingExamples.slice(0, 3).map((x) => `"${x}"`).join(', ')}`,
    'keep one way of numbering (or none): drop the "01 —" kickers, slide counters and numbered captions that repeat what the big numerals already say')];
}

/** @param {{ slop?: object, doc: object, deal?: object, kind?: string }} facts */
export function slopRules({ slop, doc, deal, kind }) {
  if (!slop) return [];
  const out = [...langRules({ doc, deal }), ...numberingRules(slop)];
  if (slop.photoRepeats.length) {
    out.push(f('FAIL', 'slop-repeat-photo', `the same photograph in more than one section: ${slop.photoRepeats.slice(0, 3).map((p) => `${p.src} (${p.sections}x)`).join(', ')}`,
      'give every section its own frame; fetch more photographs rather than reusing the hero'));
  }
  if (slop.stamps.length) {
    out.push(f('FAIL', 'slop-stamp', `round tilted or spinning badge(s): ${slop.stamps.map((s) => `"${s}"`).join(', ')}`,
      'remove the badge; if the fact matters (hours, price, year) set it as type in the layout'));
  }
  if (kind === 'site' && (deal?.pages?.length ?? 0) > 1 && !slop.viewTransition) {
    out.push(f('WARN', 'site-transitions', 'no page transition between the pages of this site', 'load the kit surfaces.css (@view-transition) and give the shared element a view-transition-name'));
  }
  return out;
}

/** Each break named in # Breaks must point at an element that is on the page. */
export function breakRules({ slop, concept }) {
  if (!slop || !concept?.breaks?.length) return [];
  const missing = concept.breaks.filter((sel) => !(slop.selectors[sel] > 0));
  if (!missing.length) return [];
  return [f('FAIL', 'deal-break', `the direction's break(s) named in .craft/concept.md are not on the page: ${missing.map((s) => `\`${s}\``).join(', ')}`,
    'build each break the brief lists and name the element that carries it (a class or id in backticks) under # Breaks')];
}
