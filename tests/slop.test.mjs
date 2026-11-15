// The tells that mark a page as machine-made: language, numbering, repeated photographs, badges,
// the direction's breaks, slogan-shaped copy and impeccable's detector findings.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectLang, lintCopy } from '../skills/frontend-craft/scripts/lib/copy.mjs';
import { SOFT, mapDetector } from '../skills/frontend-craft/scripts/lib/impeccable.mjs';
import { breakRules, langRules, slopRules } from '../skills/frontend-craft/scripts/lib/rules-slop.mjs';

const ES = 'Horneamos a las 5:40 en Cañaveral y el pan sale de la piedra a las siete. Tres panes por día: campesino, integral y de centeno, con harina de la Mesa de los Santos para tu mesa.';
const EN = 'We bake at 5:40 in the morning and the bread comes out of the oven at seven. Three loaves a day for your table, with flour from the plateau and the salt of the coast.';
const clean = { photoRepeats: [], numbering: { kicker: 0, counter: 0, caption: 0, numeral: 3 }, numberingExamples: [], stamps: [], selectors: {}, viewTransition: false };
const ids = (out) => out.map((x) => x.id);

test('the language of the copy is read from its common words', () => {
  assert.equal(detectLang(ES), 'es');
  assert.equal(detectLang(EN), 'en');
  assert.equal(detectLang('Miga. Pan.'), null);
});

test('a page dealt in Spanish fails when it is declared or written in English', () => {
  assert.deepEqual(langRules({ doc: { lang: 'es', text: ES }, deal: { lang: 'es' } }), []);
  assert.deepEqual(ids(langRules({ doc: { lang: 'en', text: EN }, deal: { lang: 'es' } })), ['copy-lang']);
  assert.deepEqual(ids(langRules({ doc: { lang: 'es', text: EN }, deal: { lang: 'es' } })), ['copy-lang']);
  assert.deepEqual(ids(langRules({ doc: { lang: 'en', text: ES }, deal: null })), ['copy-lang'], 'declared and written must agree without a deal too');
  assert.deepEqual(langRules({ doc: { lang: 'es-CO', text: ES }, deal: { lang: 'es' } }), []);
});

test('one numbering system is fine, two at once fail', () => {
  const doc = { lang: 'en', text: EN };
  assert.deepEqual(slopRules({ slop: clean, doc }), []);
  const two = { ...clean, numbering: { kicker: 4, counter: 1, caption: 3, numeral: 2 }, numberingExamples: ['01 — Morning', '01 / Rest'] };
  assert.deepEqual(ids(slopRules({ slop: two, doc })), ['slop-numbering']);
});

test('a photograph in two sections and a tilted round badge fail', () => {
  const doc = { lang: 'en', text: EN };
  assert.deepEqual(ids(slopRules({ slop: { ...clean, photoRepeats: [{ src: 'hero/bread.jpg', sections: 2 }] }, doc })), ['slop-repeat-photo']);
  assert.deepEqual(ids(slopRules({ slop: { ...clean, stamps: ['Naturally leavened.'] }, doc })), ['slop-stamp']);
});

test('a multi-page site without page transitions gets a warning', () => {
  const doc = { lang: 'en', text: EN };
  const deal = { pages: [{ path: '/' }, { path: '/menu' }] };
  assert.deepEqual(ids(slopRules({ slop: clean, doc, deal, kind: 'site' })), ['site-transitions']);
  assert.deepEqual(slopRules({ slop: { ...clean, viewTransition: true }, doc, deal, kind: 'site' }), []);
});

test('every break named in the concept must be on the page', () => {
  const concept = { breaks: ['.hero-letterbox', '#tape'] };
  assert.deepEqual(breakRules({ slop: { ...clean, selectors: { '.hero-letterbox': 1, '#tape': 2 } }, concept }), []);
  const out = breakRules({ slop: { ...clean, selectors: { '.hero-letterbox': 1, '#tape': 0 } }, concept });
  assert.deepEqual(ids(out), ['deal-break']);
  assert.match(out[0].msg, /#tape/);
});

test('slogan-shaped copy is caught in English and Spanish, plain facts are not', () => {
  const en = lintCopy('Good bread takes its time. A little patience. A lot of flavour. Tear it. Toast it. Pass it around.');
  assert.deepEqual(ids(en), ['copy-formula']);
  assert.equal(en[0].level, 'FAIL');
  assert.deepEqual(ids(lintCopy('Más que una panadería: pan hecho con amor.')), ['copy-formula']);
  assert.deepEqual(lintCopy(ES), []);
});

test('impeccable slop fails, the rules a direction may ask for stay warnings, advisories are dropped', () => {
  const rows = [
    { antipattern: 'hero-eyebrow-chip', name: 'Hero eyebrow', category: 'slop', severity: 'warning', snippet: 'Slow bread.' },
    { antipattern: 'marquee', name: 'Marquee', category: 'slop', severity: 'warning', snippet: '' },
    { antipattern: 'low-contrast', name: 'Low contrast', category: 'quality', severity: 'warning', snippet: '4.1:1' },
    { antipattern: 'content-hidden-at-rest', name: 'Hidden', category: 'quality', severity: 'error', snippet: '' },
    { antipattern: 'em-dash-overuse', name: 'Em dash', category: 'slop', severity: 'advisory', snippet: '' },
    { antipattern: 'hero-eyebrow-chip', name: 'Hero eyebrow', category: 'slop', severity: 'warning', snippet: 'again' },
  ];
  const out = mapDetector(rows);
  assert.deepEqual(out.map((x) => `${x.level} ${x.id}`), [
    'FAIL impeccable/hero-eyebrow-chip', 'WARN impeccable/marquee', 'WARN impeccable/low-contrast', 'FAIL impeccable/content-hidden-at-rest',
  ]);
  assert.ok(SOFT.has('oversized-h1'));
});
