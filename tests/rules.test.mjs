import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lintCopy } from '../skills/frontend-craft/scripts/lib/copy.mjs';
import { evaluate, normalizeFamily } from '../skills/frontend-craft/scripts/lib/rules.mjs';
import { formatNumber, parseNumber } from '../skills/frontend-craft/kit/motion/text.js';

function facts(over = {}) {
  return {
    kind: 'landing',
    deal: null,
    doc: {
      h1Count: 1, title: 'Roastery', lang: 'en', viewport: 'width=device-width, initial-scale=1', description: 'x', imgs: [],
      h1: { text: 'Roasted on Tuesday', family: 'Bricolage Grotesque', stack: "'Bricolage Grotesque', sans-serif", weight: '800', size: 110, italic: false },
      fonts: [{ family: 'Bricolage Grotesque', status: 'loaded' }], text: 'Roasted on Tuesday, in your cup by Friday.', ctas: ['Reserve a bag'],
    },
    look: { dominantBg: [28, 20, 16], accents: [[232, 176, 75]], monoLabels: 0, purpleGradient: false, glowOrbs: 0, equalRows: [], eyebrows: 0, h2Count: 3 },
    lookEarly: { dominantBg: [28, 20, 16] },
    css: { transitionAll: [], easeIn: [], vh100: [] },
    text: { 1440: { small: [], lowContrast: [], lowContrastCount: 0 }, 390: { small: [], lowContrast: [], lowContrastCount: 0 } },
    overflow: { 1440: { width: 1440, scrollWidth: 1440, offenders: [] }, 390: { width: 390, scrollWidth: 390, offenders: [] } },
    targets: { tiny: [], small: [], smallCount: 0 },
    invisible: { scrolled: [], reduced: [], nojs: [] },
    motion: { entrance: 5, reveals: 3, scrollLinked: 4, sticky: ['section'] },
    consoleErrors: [],
    network: [],
    ...over,
  };
}
const ids = (findings, level = 'FAIL') => findings.filter((f) => f.level === level).map((f) => f.id);

test('a clean page has no findings', () => {
  assert.deepEqual(evaluate(facts()), []);
});

test('the cream + serif italic + terracotta + mono look fails', () => {
  const out = evaluate(facts({
    look: { dominantBg: [245, 239, 230], accents: [[194, 96, 63]], monoLabels: 4, purpleGradient: false, glowOrbs: 0, equalRows: [], eyebrows: 0, h2Count: 0 },
    doc: { ...facts().doc, h1: { ...facts().doc.h1, family: 'Fraunces', stack: "'Fraunces', serif", italic: true }, fonts: [{ family: 'Fraunces', status: 'loaded' }] },
  }));
  assert.ok(ids(out).includes('tell-default-editorial'));
});

test('a landing page with no entrance and no scroll story fails; an app does not', () => {
  const still = { motion: { entrance: 0, reveals: 2, scrollLinked: 0, sticky: [] } };
  assert.deepEqual(ids(evaluate(facts(still))).sort(), ['motion-entrance', 'motion-scroll-story']);
  assert.deepEqual(ids(evaluate(facts({ ...still, kind: 'app' }))), []);
});

test('a system font headline fails and a next/font hashed family passes', () => {
  const sys = facts({ doc: { ...facts().doc, h1: { ...facts().doc.h1, family: 'system-ui' } } });
  assert.ok(ids(evaluate(sys)).includes('font-display-system'));
  assert.equal(normalizeFamily('__Bricolage_Grotesque_5f2a1c'), 'bricolage grotesque');
  const hashed = facts({ doc: { ...facts().doc, h1: { ...facts().doc.h1, family: '__Bricolage_Grotesque_5f2a1c' }, fonts: [{ family: '__Bricolage_Grotesque_5f2a1c', status: 'loaded' }] } });
  assert.deepEqual(ids(evaluate(hashed)), []);
});

test('the deal is enforced: font and first-screen colors', () => {
  const deal = { kind: 'landing', type: { display: { family: 'Gloock' } }, palette: { roles: { bg: '#ffffff', surface: '#f3f1ee', ink: '#1b1b1b', accent: '#d92d17' } } };
  const out = ids(evaluate(facts({ deal, look: { ...facts().look, dominantBg: [80, 40, 160] } })));
  assert.ok(out.includes('deal-font'));
  assert.ok(out.includes('deal-palette'));
});

test('overflow, contrast, invisible content and console errors fail', () => {
  const out = ids(evaluate(facts({
    overflow: { 390: { width: 390, scrollWidth: 512, offenders: ['div.hero right=512'] } },
    text: { 390: { small: [], lowContrast: ['p "x" 2.1:1'], lowContrastCount: 1 } },
    invisible: { scrolled: ['p "lost"'], reduced: ['h2 "x"'], nojs: ['h1 "x"'] },
    consoleErrors: ['TypeError: x is undefined'],
  })));
  for (const id of ['overflow', 'contrast', 'content-invisible', 'reduced-invisible', 'nojs-invisible', 'console']) assert.ok(out.includes(id), id);
});

test('copy lint: placeholders and emoji fail, one cliche warns, three fail', () => {
  assert.ok(ids(lintCopy('Lorem ipsum dolor sit amet')).includes('copy-placeholder'));
  assert.ok(ids(lintCopy('Fresh coffee ☕')).includes('copy-emoji'));
  assert.deepEqual(ids(lintCopy('Price → see menu © 2026')), []);
  assert.deepEqual(ids(lintCopy('Elevate your mornings'), 'WARN'), ['copy-cliche']);
  assert.ok(ids(lintCopy('Elevate your seamless, cutting-edge mornings')).includes('copy-cliche'));
  assert.deepEqual(ids(lintCopy('ok', ['Get Started']), 'WARN'), ['copy-generic-cta']);
});

test('count-up keeps the number format of the page', () => {
  for (const [raw, value] of [['1.280', 1280], ['1,280.50', 1280.5], ['12,5 %', 12.5], ['+40k', 40], ['1 280', 1280], ['2026', 2026]]) {
    const p = parseNumber(raw);
    assert.equal(p.value, value, raw);
    assert.equal(formatNumber(p.value, p), raw, raw);
  }
});
