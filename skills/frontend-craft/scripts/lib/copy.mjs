// Copy lint: placeholder text blocks shipping, stock marketing phrases and generic CTAs are flagged.

export const PLACEHOLDERS = [
  /\{\{[^}]{1,160}\}\}/,
  /lorem ipsum/i, /dolor sit amet/i, /\byour company\b/i, /\bcompany name\b/i, /\bjohn doe\b/i, /\bjane doe\b/i,
  /\[(product|company|name|brand|insert)[^\]]*\]/i, /\bTODO\b/, /\bTBD\b/, /\binsert (text|copy|image)/i,
  /\byour (name|text|tagline) here\b/i, /\btu empresa\b/i, /\bnombre de (la )?empresa\b/i, /\btexto de ejemplo\b/i,
];

export const CLICHES = [
  /\bunlock(s|ing)?\b/i, /\belevat(e|es|ing)\b/i, /\bseamless(ly)?\b/i, /\brevolutioni[sz](e|es|ing)\b/i,
  /\bcutting[- ]edge\b/i, /\bgame[- ]chang(er|ing)\b/i, /\bempower(s|ing)?\b/i, /\bsupercharge\b/i,
  /\bnext level\b/i, /\bworld[- ]class\b/i, /\bbest[- ]in[- ]class\b/i, /\bstate[- ]of[- ]the[- ]art\b/i,
  /\beffortless(ly)?\b/i, /\bharness the power\b/i, /\bfast[- ]paced\b/i, /\bleverag(e|es|ing)\b/i, /\bsynerg/i,
  /\blook no further\b/i, /\bdelve\b/i, /\bwelcome to\b/i, /\bunleash/i, /\bimagine a world\b/i,
  /\bpotenci(a|ar|amos)\b/i, /\brevoluciona/i, /\bde vanguardia\b/i, /\bsin esfuerzo\b/i, /\bsiguiente nivel\b/i,
  /\bdescubre el poder\b/i, /\btransforma tu\b/i, /\bexperiencia [uú]nica\b/i, /\bsoluciones innovadoras\b/i,
  /\bbienvenid[oa]s? a\b/i, /\beleva(r|mos)? tu\b/i, /\bdesata\b/i,
];

/** Sentence shapes that read as generated: antithesis pairs, fragment triplets, "more than just", "where X meets Y". */
export const FORMULAS = [
  /\b(a little|small|less|few)\b[^.!?\n]{1,40}[.!]\s+(a lot|big|more|all)\b/i,
  /\b(un poco|poco|pequeñ[oa]s?|menos)\b[^.!?\n]{1,40}[.!]\s+(mucho|much[oa]s|grandes?|más)\b/i,
  /(?:^|\s)(?:\p{Lu}[\p{L}'’]*(?:\s[\p{Ll}'’]+){0,2}[.!]\s+){2}\p{Lu}[\p{L}'’]*(?:\s[\p{Ll}'’]+){0,2}[.!](?=\s|$)/u,
  /\bmore than just\b/i, /\bnot just an?\b/i, /\bmás que (un|una|solo)\b/i, /\bno es solo\b/i,
  /\bwhere \p{L}+ meets\b/iu, /\bdonde (el |la |los |las )?\p{L}+ se (encuentra|une) con\b/iu,
  /\b(with|has) (a little more |a )?soul\b/i, /\bcon (un poco más de )?alma\b/i, /\b(made|crafted) with (love|care|passion)\b/i,
  /\bhech[oa]s? con (amor|cariño|pasión)\b/i, /\b(your|tu|su) (\p{L}+ )?ritual\b/iu, /\btakes (its|their) time\b/i, /\btoma(n)? su tiempo\b/i,
];

const STOP = {
  en: /\b(the|and|of|to|is|for|with|your|our|you|it|that|this|are|from|in|we|on|at)\b/gi,
  es: /\b(el|la|los|las|de|del|en|y|que|con|para|por|tu|nuestr[oa]s?|un|una|es|son|desde|sin|al|más)\b/gi,
};

/** 'es', 'en' or null: the language most of the visible words are written in, when the text is long enough to tell. */
export function detectLang(text) {
  const n = Object.fromEntries(Object.entries(STOP).map(([k, re]) => [k, (text.match(re) ?? []).length]));
  if (n.en + n.es < 10) return null;
  if (n.es >= n.en * 2) return 'es';
  if (n.en >= n.es * 2) return 'en';
  return null;
}

export const GENERIC_CTAS = [
  'get started', 'learn more', 'click here', 'read more', 'submit', 'sign up now', 'discover more',
  'saber más', 'saber mas', 'más información', 'mas informacion', 'haz clic aquí', 'leer más', 'enviar', 'descubre más',
];

const EMOJI = /\p{Extended_Pictographic}/u;
const ALLOWED = new Set(['©', '®', '™', '★', '☆']);

export function findEmoji(text) {
  const hits = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const arrow = cp >= 0x2190 && cp <= 0x21ff;
    if (!arrow && !ALLOWED.has(ch) && EMOJI.test(ch)) hits.push(ch);
    if (hits.length >= 5) break;
  }
  return hits;
}

function excerpt(text, re) {
  const m = text.match(re);
  if (!m) return null;
  const i = m.index ?? 0;
  return text.slice(Math.max(0, i - 25), i + m[0].length + 25).replace(/\s+/g, ' ').trim();
}

/** @returns {Array<{level:'FAIL'|'WARN', id:string, msg:string, fix:string}>} */
export function lintCopy(text, ctas = []) {
  const out = [];
  const holders = PLACEHOLDERS.map((re) => text.match(re)?.[0]).filter(Boolean);
  if (holders.length) out.push({ level: 'FAIL', id: 'copy-placeholder', msg: `placeholder text: ${holders.map((h) => `"${h}"`).join(', ')}`, fix: 'write the real copy from the brief, or mark sample data as "[pending]" in a visible note' });
  const emoji = findEmoji(text);
  if (emoji.length) out.push({ level: 'FAIL', id: 'copy-emoji', msg: `emoji in visible text: ${emoji.join(' ')}`, fix: 'remove them; use an SVG icon from one set if a symbol is needed' });
  const cliches = CLICHES.map((re) => excerpt(text, re)).filter(Boolean);
  if (cliches.length) {
    out.push({ level: cliches.length >= 3 ? 'FAIL' : 'WARN', id: 'copy-cliche', msg: `stock phrases (${cliches.length}): ${cliches.slice(0, 3).map((c) => `"${c}"`).join(', ')}`, fix: 'say what the product does for whom with a concrete noun, number or place from the brief' });
  }
  const formulas = FORMULAS.map((re) => excerpt(text, re)).filter(Boolean);
  if (formulas.length) {
    out.push({ level: formulas.length >= 2 ? 'FAIL' : 'WARN', id: 'copy-formula', msg: `slogan-shaped lines (${formulas.length}): ${formulas.slice(0, 3).map((c) => `"${c}"`).join(', ')}`, fix: 'replace each with a plain fact only this business has: a time, a place, a name, a number, how something is made' });
  }
  const generic = [...new Set(ctas.map((c) => c.toLowerCase()).filter((c) => GENERIC_CTAS.includes(c)))];
  if (generic.length) out.push({ level: 'WARN', id: 'copy-generic-cta', msg: `generic action labels: ${generic.join(', ')}`, fix: 'use a verb plus the object: "Reserve a tasting", "See the menu", "Start the trial"' });
  return out;
}
