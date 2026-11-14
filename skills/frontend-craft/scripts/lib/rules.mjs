// Turns probe facts into findings. Pure: no browser, so every rule is unit-testable.
import { deltaE, hexToRgb, isCream, isTerracotta } from './color.mjs';
import { lintCopy } from './copy.mjs';
import { richnessRules } from './rules-richness.mjs';

export const PERSUADE_KINDS = ['landing', 'product', 'portfolio', 'event', 'venue', 'brand', 'campaign'];

const SYSTEM_FONTS = ['serif', 'sans-serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-serif', '-apple-system',
  'blinkmacsystemfont', 'segoe ui', 'arial', 'helvetica', 'helvetica neue', 'times new roman', 'times', 'georgia', 'verdana'];
const DEFAULT_DISPLAY = ['inter', 'roboto', 'arial', 'helvetica', 'poppins', 'montserrat', 'open sans', 'lato', 'system-ui'];
const SERIFS = /serif|fraunces|playfair|cormorant|garamond|caslon|newsreader|gloock|bodoni|lora|literata|spectral|crimson|young serif|dm serif|instrument serif|libre baskerville|merriweather|georgia|times/i;

const f = (level, id, msg, fix) => ({ level, id, msg, fix });

/** "__Bricolage_Grotesque_5f2a1c" and "'Bricolage Grotesque'" both become "bricolage grotesque". */
export function normalizeFamily(name = '') {
  return name.replace(/^['"]|['"]$/g, '').replace(/^_+/, '').replace(/_Fallback/i, '')
    .replace(/_[0-9a-f]{5,8}$/i, '').replace(/_/g, ' ').trim().toLowerCase();
}

function documentRules({ doc }) {
  const out = [];
  if (doc.h1Count !== 1) out.push(f('FAIL', 'h1-count', `${doc.h1Count} visible h1 elements`, 'use exactly one h1: the headline of the first screen'));
  if (!doc.title) out.push(f('FAIL', 'meta-title', 'empty <title>', 'set a specific page title'));
  if (!doc.lang) out.push(f('FAIL', 'meta-lang', '<html> has no lang', 'add lang="en" (or the copy language) to <html>'));
  if (!doc.viewport) out.push(f('FAIL', 'meta-viewport', 'no viewport meta', 'add <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'));
  else if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(doc.viewport)) out.push(f('FAIL', 'zoom-blocked', 'viewport blocks zoom', 'remove user-scalable=no and maximum-scale'));
  if (!doc.description) out.push(f('WARN', 'meta-description', 'no meta description', 'add one sentence that names the product and the place or audience'));
  const broken = doc.imgs.filter((i) => i.broken);
  if (broken.length) out.push(f('FAIL', 'img-broken', `${broken.length} broken image(s): ${broken.slice(0, 3).map((i) => i.src).join(', ')}`, 'never invent media URLs; use a supplied file or build the visual in CSS/SVG/canvas'));
  const noAlt = doc.imgs.filter((i) => i.noAlt);
  if (noAlt.length) out.push(f('FAIL', 'img-alt', `${noAlt.length} image(s) without alt`, 'add alt text, or alt="" for decoration'));
  return out;
}

function fontRules({ doc, deal }) {
  const out = [];
  if (!doc.h1) return out;
  const fam = normalizeFamily(doc.h1.family);
  const loaded = doc.fonts.filter((x) => x.status === 'loaded').map((x) => normalizeFamily(x.family));
  if (SYSTEM_FONTS.includes(fam)) {
    out.push(f('FAIL', 'font-display-system', `the h1 renders in a system font (${doc.h1.family})`, 'load the display family (see .craft/brief.md) and set font-family: var(--f-display) on headings'));
  } else if (!loaded.includes(fam)) {
    out.push(f('FAIL', 'font-display-missing', `h1 asks for "${doc.h1.family}" but no loaded @font-face matches it`, 'add the font <link>/next/font import printed by start.mjs; check the family name spelling'));
  } else if (DEFAULT_DISPLAY.includes(fam) && !deal) {
    out.push(f('WARN', 'font-default', `display font is a common default (${doc.h1.family})`, 'pick a display face with a character that fits the subject'));
  }
  if (deal?.type?.display && !fam.includes(normalizeFamily(deal.type.display.family))) {
    out.push(f('FAIL', 'deal-font', `h1 uses "${doc.h1.family}", the dealt display font is "${deal.type.display.family}"`, 'use the dealt pairing, or run start.mjs --redeal and use the new one'));
  }
  return out;
}

function lookRules({ look, lookEarly, doc, deal }) {
  const out = [];
  const bg = look.dominantBg;
  const signals = [];
  if (bg && isCream(bg)) signals.push('cream background');
  if (doc.h1 && SERIFS.test(doc.h1.stack) && doc.h1.italic) signals.push('serif headline with an italic word');
  if (look.accents.some(isTerracotta)) signals.push('terracotta accent');
  if (look.monoLabels >= 3) signals.push(`${look.monoLabels} tracked mono labels`);
  if (signals.length >= 3) out.push(f('FAIL', 'tell-default-editorial', `the generated default look: ${signals.join(' + ')}`, 'follow the dealt palette and pairing; drop the italic accent word and the mono eyebrows'));
  if (doc.h1?.italicAccent && !deal?.brand) out.push(f('FAIL', 'tell-italic-accent', 'the headline sets a word in an italic of another color', 'set the whole headline in the dealt display face; carry emphasis with size, weight or line breaks'));
  if (look.purpleGradient) out.push(f('WARN', 'tell-purple-gradient', 'purple/indigo gradient on the first screen', 'use the dealt palette; one flat field of color beats a default gradient'));
  if (look.glowOrbs) out.push(f('WARN', 'tell-glow-orbs', `${look.glowOrbs} blurred glow blob(s) on the first screen`, 'remove decorative blobs; light the subject instead'));
  if (look.equalRows.length) out.push(f('WARN', 'tell-equal-cards', `row of identical cards: ${look.equalRows[0]}`, 'vary scale: one dominant item and smaller ones, or a list instead of cards'));
  if (look.eyebrows >= 3 && look.eyebrows >= 0.8 * look.h2Count) out.push(f('WARN', 'tell-eyebrows', `${look.eyebrows} of ${look.h2Count} headings sit under a small all-caps label`, 'keep the label on one or two sections at most'));
  if (bg && lookEarly?.dominantBg) {
    const dark = (c) => c[0] + c[1] + c[2] < 150;
    const light = (c) => c[0] + c[1] + c[2] > 600;
    if (dark(bg) && light(lookEarly.dominantBg)) out.push(f('FAIL', 'white-flash', 'a dark page paints white first', 'set the background color on html in CSS that loads before the app'));
  }
  if (deal?.palette) {
    const roles = deal.palette.roles;
    const dealt = ['bg', 'surface', 'ink', 'accent'].map((k) => hexToRgb(roles[k]));
    if (bg && !dealt.some((c) => deltaE(c, bg) < 0.06)) {
      out.push(f('FAIL', 'deal-palette', `first screen background rgb(${bg.join(', ')}) is not a dealt color`, 'use var(--c-bg), var(--c-surface), var(--c-ink) or var(--c-accent) for large fields'));
    }
    const accent = hexToRgb(roles.accent);
    if (!look.accents.some((c) => deltaE(c, accent) < 0.06)) {
      out.push(f('WARN', 'deal-accent', `the dealt accent ${roles.accent} is not used on links, buttons or emphasis`, 'give the primary action var(--c-accent)'));
    }
  }
  return out;
}

function layoutRules({ text, overflow, targets, css, fold = {} }) {
  const out = [];
  for (const [w, r] of Object.entries(fold)) {
    if (r && !r.ok) out.push(f('FAIL', `fold-action-${w}`, `at ${w}px the hero's action (${r.label}) ends at ${r.bottom}px, below the ${r.vh}px screen`, 'shorten the headline or step it down one size, trim hero padding, or move the action up: the first screen shows headline, line and action'));
  }
  const wide = Object.entries(overflow).filter(([, o]) => o.scrollWidth > o.width + 1);
  if (wide.length) {
    const [w, o] = wide.at(-1);
    out.push(f('FAIL', 'overflow', `horizontal scroll at ${wide.map(([x]) => x).join(', ')} px (at ${w}: ${o.scrollWidth}px wide, ${o.offenders.slice(0, 2).join('; ')})`, 'constrain the element (max-width:100%, min-width:0 on flex/grid children, overflow-x:clip on the section)'));
  }
  const widths = Object.keys(text);
  const small = [...new Set(widths.flatMap((w) => text[w].small))];
  if (small.length) out.push(f('FAIL', 'text-small', `text under 12px: ${small.slice(0, 3).join('; ')}`, 'use at least var(--t-xs) (12px); body copy 16px+'));
  const low = [...new Set(widths.flatMap((w) => text[w].lowContrast))];
  const lowCount = Math.max(0, ...widths.map((w) => text[w].lowContrastCount));
  if (lowCount) out.push(f('FAIL', 'contrast', `${lowCount} text element(s) below WCAG AA: ${low.slice(0, 3).join('; ')}`, 'use var(--c-ink) or var(--c-muted) on var(--c-bg); 4.5:1 body, 3:1 for 24px+'));
  if (targets.tiny.length) out.push(f('FAIL', 'target-tiny', `tap targets under 24px at 390: ${targets.tiny.slice(0, 3).join('; ')}`, 'give controls at least 44x44px of hit area (padding or ::after)'));
  if (targets.smallCount) out.push(f('WARN', 'target-small', `${targets.smallCount} tap target(s) under 44px at 390: ${targets.small.slice(0, 2).join('; ')}`, 'aim for 44x44px on touch'));
  if (css.transitionAll.length) out.push(f('FAIL', 'transition-all', `transition: all on ${css.transitionAll.slice(0, 3).join('; ')}`, 'list the properties: transition: transform 160ms var(--ease-out), opacity 160ms'));
  if (css.easeIn.length) out.push(f('WARN', 'ease-in', `ease-in timing on ${css.easeIn.slice(0, 2).join('; ')}`, 'use var(--ease-out) for anything that enters or responds'));
  if (css.vh100.length) out.push(f('WARN', 'vh-unit', `100vh in ${css.vh100[0]}`, 'use 100svh or 100dvh so mobile browser bars do not crop it'));
  return out;
}

function visibilityRules({ invisible }) {
  const out = [];
  if (invisible.scrolled.length) out.push(f('FAIL', 'content-invisible', `text still invisible after scrolling the whole page: ${invisible.scrolled.slice(0, 3).join('; ')}`, 'a reveal never fired; check the observer or remove the hidden initial state'));
  if (invisible.reduced.length) out.push(f('FAIL', 'reduced-invisible', `with reduced motion this text stays hidden: ${invisible.reduced.slice(0, 3).join('; ')}`, 'under prefers-reduced-motion show the final state at once'));
  if (invisible.nojs.length) out.push(f('FAIL', 'nojs-invisible', `without JavaScript this text is hidden: ${invisible.nojs.slice(0, 3).join('; ')}`, 'hide elements only under a class the script adds (the kit uses .craft-js)'));
  return out;
}

function motionRules({ motion, kind }) {
  if (!PERSUADE_KINDS.includes(kind)) return [];
  const out = [];
  if (!motion.entrance) out.push(f('FAIL', 'motion-entrance', 'nothing animates in on the first screen', 'add data-enter to 3-6 hero elements (nav, headline, line, action, visual) or data-words on the h1'));
  if (!motion.scrollLinked && !motion.sticky.length) {
    const why = motion.reveals ? `only ${motion.reveals} fade-in reveal(s)` : 'nothing responds to scroll';
    out.push(f('FAIL', 'motion-scroll-story', `${why}: no scroll-linked moment`, 'add one: data-scroll-words in a data-pin section, data-stack cards, a data-rail, or data-scrub with var(--p)'));
  }
  return out;
}

function runtimeRules({ consoleErrors, network }) {
  const out = [];
  if (consoleErrors.length) out.push(f('FAIL', 'console', `${consoleErrors.length} console error(s): ${consoleErrors.slice(0, 2).join(' | ')}`, 'fix the error; a clean console is required'));
  const failed = network.filter((n) => !/favicon/i.test(n));
  if (failed.length) out.push(f('FAIL', 'network', `${failed.length} failed request(s): ${failed.slice(0, 3).join(', ')}`, 'remove or fix the reference; never hotlink media you do not own'));
  return out;
}

/** @returns {Array<{level:'FAIL'|'WARN', id:string, msg:string, fix:string}>} */
export function evaluate(facts) {
  const out = [
    ...documentRules(facts), ...fontRules(facts), ...lookRules(facts), ...layoutRules(facts),
    ...visibilityRules(facts), ...motionRules(facts), ...richnessRules(facts), ...runtimeRules(facts),
    ...lintCopy(`${facts.doc.text}\n${facts.doc.title}\n${facts.doc.description ?? ''}`, facts.doc.ctas),
  ];
  return out.sort((a, b) => (a.level === b.level ? 0 : a.level === 'FAIL' ? -1 : 1));
}
