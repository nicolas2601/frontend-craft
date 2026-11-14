// The richness floor: grounds, photographs, headline size, scroll scenes, set pieces and the concept.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadLibrary } from '../skills/frontend-craft/scripts/lib/deal.mjs';
import { distinctGrounds, parseConcept, richnessRules } from '../skills/frontend-craft/scripts/lib/rules-richness.mjs';

const direction = loadLibrary().directions.find((d) => d.id === 'color-block');
const CONCEPT = '# Idea\nThe roastery sits on a plateau above a canyon, so the page climbs from the canyon floor to the cup in four colour fields.\n# Signature\nThe iris opens the accent field at the roast.\n# Rejected\nCream, serif, cards.\n';
const rich = {
  richness: { pictures: 5, fullBleed: true, grounds: [[17, 17, 17], [255, 90, 54], [243, 239, 230], [29, 27, 25], 'picture'], setPieces: ['iris', 'tilt'] },
  doc: { h1: { size: 180 } },
  motion: { scenes: 3 },
  deal: { direction, motion: { setPieces: ['iris', 'tilt'] } },
  concept: CONCEPT,
};
const ids = (out) => out.map((x) => x.id);

test('close colours count as one ground and pictures as one more', () => {
  assert.equal(distinctGrounds([[17, 17, 17], [18, 18, 18], 'picture', 'picture']), 2);
  assert.equal(distinctGrounds([[255, 255, 255], [0, 0, 0], [255, 90, 54]]), 3);
});

test('the concept needs its three sections and a real idea', () => {
  assert.deepEqual(parseConcept(CONCEPT).missing, []);
  assert.ok(parseConcept(CONCEPT).ideaWords >= 12);
  assert.deepEqual(parseConcept('# Idea\nA cafe.\n').missing, ['signature', 'rejected']);
  assert.equal(parseConcept(null), null);
});

test('a rich page passes and pages without a direction are not judged', () => {
  assert.deepEqual(richnessRules(rich), []);
  assert.deepEqual(richnessRules({ ...rich, deal: null }), []);
  assert.deepEqual(richnessRules({ ...rich, deal: { motion: {} } }), []);
});

test('each missing part of the floor fails on its own', () => {
  const flat = { ...rich.richness, grounds: [[17, 17, 17], [18, 18, 18]] };
  assert.deepEqual(ids(richnessRules({ ...rich, richness: flat })), ['rich-grounds']);
  assert.deepEqual(ids(richnessRules({ ...rich, richness: { ...rich.richness, pictures: 1 } })), ['rich-pictures']);
  assert.deepEqual(ids(richnessRules({ ...rich, doc: { h1: { size: 72 } } })), ['rich-type']);
  assert.deepEqual(ids(richnessRules({ ...rich, motion: { scenes: 1 } })), ['rich-scenes']);
  assert.deepEqual(ids(richnessRules({ ...rich, richness: { ...rich.richness, setPieces: ['iris'] } })), ['deal-set-piece']);
  assert.deepEqual(ids(richnessRules({ ...rich, concept: null })), ['concept-missing']);
  assert.deepEqual(ids(richnessRules({ ...rich, concept: '# Idea\nA cafe.\n# Signature\nIris.\n# Rejected\nCards.\n' })), ['concept-thin']);
});

test('full bleed is only asked of directions that want it', () => {
  const cinematic = loadLibrary().directions.find((d) => d.id === 'cinematic-chapters');
  const deal = { direction: cinematic, motion: { setPieces: ['iris', 'tilt'] } };
  const noBleed = { ...rich.richness, fullBleed: false, pictures: 6, grounds: [[17, 17, 17], [255, 90, 54]] };
  assert.ok(ids(richnessRules({ ...rich, deal, richness: noBleed })).includes('rich-full-bleed'));
  assert.ok(!ids(richnessRules({ ...rich, richness: { ...rich.richness, fullBleed: false } })).includes('rich-full-bleed'));
});
