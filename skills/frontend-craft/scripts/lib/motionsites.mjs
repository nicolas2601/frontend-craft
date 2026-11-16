// MotionSites reference designs: 40 finished hero and landing prompts with exact values, a media shelf of cinematic
// loops and cut-outs, and 58 technique recipes. Read as a library, never run as a workflow: its own skill file adds a
// sponsor message to every delivery. Its examples and media are (c) MotionSites and are not redistributed here;
// setup.mjs --install downloads the upstream skill into the cache at a pinned commit (references/motionsites.md).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { tokens } from './parts.mjs';

export const UPSTREAM = 'https://github.com/Motionsites-AI/claude-skill';
export const PIN = 'faa30d512e3973e58675c72101a7ef42ed37ae83';
export const CACHE = path.join(os.homedir(), '.cache', 'frontend-craft', 'libraries', 'motionsites');
const INNER = path.join('plugins', 'motionsites-web-builder', 'skills', 'motionsites-web-builder');
const NAME = 'motionsites-web-builder';

/** Where the library may be: next to this skill, a harness' skills folder, or the cache clone. */
export function places(skill, home = os.homedir()) {
  return [path.join(skill, '..', NAME), path.join(home, '.agents', 'skills', NAME), path.join(home, '.claude', 'skills', NAME),
    path.join(home, '.config', 'opencode', 'skills', NAME), path.join(CACHE, INNER)];
}

export function findMotionsites(skill, { exists = fs.existsSync } = {}) {
  return places(skill).find((dir) => exists(path.join(dir, 'examples', 'INDEX.md'))) ?? null;
}

/** examples/INDEX.md's table as rows. */
export function parseIndex(md) {
  return String(md).split('\n').filter((l) => /^\|\s*[\w.-]+\.md\s*\|/.test(l)).map((l) => {
    const [file, title, category, traits, length, opens] = l.split('|').slice(1, -1).map((c) => c.trim());
    return { file, title, category, traits: traits.split(',').map((t) => t.trim()).filter(Boolean), length, opens };
  });
}

const WORDS = {
  tech: 'ai saas technology tech data neural infrastructure platform agent security runtime workflow', developer: 'ai saas runtime infrastructure terminal workflow',
  science: 'geology science prosthetics museum technology', finance: 'fintech stablecoin finance usd security', precise: 'saas technology infrastructure security',
  creative: 'agency studio creative portfolio', editorial: 'editorial fashion archive museum newsletter', fashion: 'fashion archive',
  travel: 'travel voyage city guide ocean space', nature: 'plant floral ocean geology', calm: 'mindfulness focus calm', wellness: 'mindfulness focus calm', health: 'mindfulness prosthetics',
  luxury: 'luxury premium fashion', beauty: 'floral fashion luxury', music: 'streaming movie music', nightlife: 'streaming movie neon', culture: 'museum city guide', heritage: 'museum city guide',
  playful: 'character collectible', youth: 'character collectible', bold: 'bold studio agency', brutal: 'bold studio', modern: 'studio agency saas', minimal: 'monochrome studio',
};
const KIND_WORDS = { portfolio: 'portfolio creator', product: 'product collectible', app: 'saas platform', campaign: 'agency studio', brand: 'studio agency' };

/** The 2-3 examples closest to the kind and moods; none when nothing in the index is near. */
export function closestExamples(rows, { kind, moods = [], limit = 3 }) {
  const want = new Set(tokens([KIND_WORDS[kind] ?? '', ...moods.map((m) => WORDS[m] ?? m)].join(' ')));
  return rows.map((r) => {
    const have = new Set(tokens(`${r.title} ${r.category} ${r.opens}`));
    return { ...r, score: [...want].filter((w) => have.has(w)).length };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}
