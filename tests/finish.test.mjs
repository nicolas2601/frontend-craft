// Finish rules (pure): the subject's picture in the first screen, empty boxes, the footer, magnetic buttons; and the
// deal that keeps photo-led subjects on photo-first compositions and never deals a magnetic button.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deal, loadLibrary, rngFrom } from '../skills/frontend-craft/scripts/lib/deal.mjs';
import { emptyBoxRules, finishRules, footerRules, heroPictureRules } from '../skills/frontend-craft/scripts/lib/rules-finish.mjs';

const place = { moods: ['hospitality', 'heritage'] };
const ids = (out) => out.map((x) => `${x.level}:${x.id}`);

test('a place whose picture fills under a third of the first screen fails; a software page is not judged', () => {
  const small = { 1440: { share: 0.24, label: 'video' }, 390: { share: 0.26, label: 'video' } };
  assert.deepEqual(ids(heroPictureRules({ heroPicture: small, deal: place })), ['FAIL:hero-picture']);
  assert.match(heroPictureRules({ heroPicture: small, deal: place })[0].msg, /24% of the first screen at 1440/);
  assert.deepEqual(heroPictureRules({ heroPicture: { 1440: { share: 0.5 }, 390: { share: 0.4 } }, deal: place }), []);
  assert.deepEqual(heroPictureRules({ heroPicture: small, deal: { moods: ['tech', 'precise'] } }), []);
});

test('one or two empty boxes warn, three fail', () => {
  assert.deepEqual(ids(emptyBoxRules({ emptyBoxes: ['a', 'b'] })), ['WARN:empty-box']);
  assert.deepEqual(ids(emptyBoxRules({ emptyBoxes: ['a', 'b', 'c'] })), ['FAIL:empty-box']);
  assert.deepEqual(emptyBoxRules({ emptyBoxes: [] }), []);
});

test('the footer must exist, link out and say how to reach the business; apps are not judged', () => {
  assert.deepEqual(ids(footerRules({ footer: { present: false }, kind: 'landing' })), ['FAIL:footer-missing']);
  assert.deepEqual(ids(footerRules({ footer: { present: true, links: 2, contact: false }, kind: 'landing' })), ['FAIL:footer-thin']);
  assert.deepEqual(footerRules({ footer: { present: true, links: 6, contact: true }, kind: 'venue' }), []);
  assert.deepEqual(footerRules({ footer: { present: false }, kind: 'app' }), []);
  assert.deepEqual(ids(finishRules({ slop: { magnetic: 2 }, kind: 'app' })), ['WARN:magnetic-button']);
});

test('a photo-led subject is dealt only photo-first compositions, and no deal uses the magnetic button', () => {
  const lib = loadLibrary();
  const comps = new Set();
  for (let s = 1; s <= 40; s += 1) {
    const d = deal({ lib, kind: 'landing', moods: ['warm', 'heritage', 'hospitality'], rng: rngFrom(s) });
    comps.add(d.composition.id);
    assert.ok(d.composition.photoFirst, `${d.composition.id} is not photo-first`);
    assert.ok(![d.motion.signature, ...d.motion.supports].some((x) => x.id === 'magnetic'));
  }
  assert.ok(comps.size >= 2, 'still more than one composition');
  for (const c of lib.compositions) assert.ok(!c.signatures.includes('magnetic'), c.id);
  for (const d of lib.directions) assert.ok(!(d.supports ?? []).includes('magnetic'), d.id);
  const tech = new Set(Array.from({ length: 30 }, (_, s) => deal({ lib, kind: 'landing', moods: ['tech', 'precise'], rng: rngFrom(s + 1) }).composition.id));
  assert.ok([...tech].some((id) => !lib.compositions.find((c) => c.id === id).photoFirst), 'other subjects keep the whole range');
});

test('a page whose look the model never chose fails; a dealt or brand look is not judged here', async () => {
  const { lookRules } = await import('../skills/frontend-craft/scripts/lib/rules-finish.mjs');
  assert.deepEqual(ids(lookRules({ deal: { look: 'model' } })), ['FAIL:look-pending']);
  assert.deepEqual(lookRules({ deal: { look: 'model', design: { set: true } } }), []);
  assert.deepEqual(lookRules({ deal: { look: 'deal' } }), []);
  assert.deepEqual(lookRules({ deal: { look: 'brand' } }), []);
});
