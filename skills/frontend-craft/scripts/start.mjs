#!/usr/bin/env node
/*
  frontend-craft start: deal a direction, copy the kit into the project and arm the gate.

    node <skill>/scripts/start.mjs --kind landing --moods warm,craft,coffee --lang es --composition <id> --direction <id> [--kit src/craft]
    node <skill>/scripts/start.mjs --kind site --pages /,/menu,/visit --moods ... --lang es     # a multi-page site
    node <skill>/scripts/start.mjs --kind app --moods tech,precise --lang en                   # a platform or app UI
        [--url http://localhost:5173 | --root dist | --file index.html]
        [--risk safe|bold|wild] [--redeal] [--seed 42]
        [--pin direction=id,palette=id,type=id,composition=id,signature=id,component=Id,scene=id] [--brand] [--kit-only] [--list]
        [--palette-from assets/hero-still.webp [--accent 2]]   # the colours from the subject's own picture
        [--deal-look] [--deal-direction]                        # let the library deal palette and type, or the direction (tests, quick drafts)

  The model chooses the structure (--composition, from the shortlist printed when it is missing) and the look
  (colours and type, with design.mjs set after start.mjs; references/color-type.md) and the art direction
  (--direction). The set pieces, motion and component are dealt from the chosen direction, for variety.

  Websites (every kind but app and docs) are dealt an art direction as well: grounds, type scale,
  picture treatment, two template breaks and two scroll set pieces per page (never the same piece on
  two pages). --risk sets how often that direction comes from outside the subject's usual moods
  (safe never, bold 40%, wild 80%). Apps get a direction that works for product UI, without set pieces.
  Every build is dealt one library component (React Bits) that fits the direction. --lang is the
  language the page is written in; the check holds the page to it.

  Writes .craft/deal.json, .craft/brief.md and .craft/gate.json, copies the kit (craft.css,
  craft-motion.js, motion/) plus a dealt tokens.css into --kit, and prints the brief.
  Re-running keeps the current deal unless --redeal is given.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KINDS, RISK, applyPalette, compositionsFor, deal, directionsFor, historyFile, landingFor, loadLibrary, moodsOf, normalizePages, rngFrom, summarize } from './lib/deal.mjs';
import { derivePalette, samplePixels } from './lib/palette-from.mjs';
import { briefMd, tokensCss } from './lib/render.mjs';
import { craftDir, isMain, parseArgs, readJson, resolveTarget, writeJson } from './lib/state.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KIT = path.join(SKILL, 'kit');
const HISTORY_MAX = 40;
const HOME = process.env.HOME ?? process.env.USERPROFILE ?? '';
const TASTE = [
  path.join(SKILL, '..', 'design-taste-frontend'),
  path.join(HOME, '.agents', 'skills', 'design-taste-frontend'),
  path.join(HOME, '.claude', 'skills', 'design-taste-frontend'),
  path.join(HOME, '.config', 'opencode', 'skills', 'design-taste-frontend'),
];

/** design-taste-frontend's folder (its photo library) when it is installed next to this skill or in a known skills folder. */
export function tasteSkill() {
  return TASTE.find((dir) => fs.existsSync(path.join(dir, 'scripts', 'gate.mjs'))) ?? null;
}

function defaultKitDir(cwd) {
  if (fs.existsSync(path.join(cwd, 'src'))) return 'src/craft';
  if (fs.existsSync(path.join(cwd, 'app'))) return 'app/craft';
  return 'craft';
}

function copyKit(dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(KIT, dest, { recursive: true, filter: (src) => !src.endsWith('.md') });
}

/**
 * The dealt composition as a working page, with kit paths relative to the project root.
 * A plain HTML project with no page yet gets it as index.html directly.
 */
function copyBlueprint(id, cwd, kitDir) {
  const src = path.join(SKILL, 'blueprints', `${id}.html`);
  if (!fs.existsSync(src)) return null;
  const kit = kitDir.split(path.sep).join('/');
  const html = fs.readFileSync(src, 'utf8').replaceAll('href="craft/', `href="${kit}/`).replaceAll("from './craft/", `from './${kit}/`);
  fs.writeFileSync(path.join(cwd, kitDir, 'blueprint.html'), html);
  const plain = !fs.existsSync(path.join(cwd, 'package.json')) && !fs.existsSync(path.join(cwd, 'index.html'));
  if (plain) fs.writeFileSync(path.join(cwd, 'index.html'), html);
  return plain ? 'index.html' : null;
}

function parsePins(raw) {
  if (!raw || raw === true) return {};
  return Object.fromEntries(String(raw).split(',').map((kv) => kv.split('=').map((s) => s.trim())));
}

function listVocabulary(lib) {
  return [
    `kinds: ${KINDS.join(', ')}`,
    `risk: ${Object.keys(RISK).join(', ')}`,
    `directions: ${lib.directions.map((d) => d.id).join(', ')}`,
    `moods: ${moodsOf(lib).join(', ')}`,
    `palettes: ${lib.palettes.map((p) => p.id).join(', ')}`,
    `type: ${lib.pairings.map((p) => p.id).join(', ')}`,
    `compositions: ${lib.compositions.map((c) => c.id).join(', ')}`,
    `signatures: ${lib.signatures.map((s) => s.id).join(', ')}`,
    `components: ${lib.components.map((c) => c.id).join(', ')}`,
  ].join('\n');
}

/** Existing UI: copy the kit and arm the gate without dealing a direction. */
function kitOnly(args, cwd, dir, kind) {
  const kitDir = String(args.kit ?? defaultKitDir(cwd));
  copyKit(path.join(cwd, kitDir));
  const gate = readJson(path.join(dir, 'gate.json'), {});
  const target = resolveTarget(args, gate) ?? null;
  writeJson(path.join(dir, 'gate.json'), { ...gate, armed: true, off: false, kitOnly: true, kind, target, blocks: gate.blocks ?? 0, startedAt: gate.startedAt ?? new Date().toISOString() });
  return { text: `Kit copied to ${kitDir} (craft.css, craft-motion.js, motion/). No deal: keep the project's tokens; map them to --c-* and --f-* if you use craft.css defaults.\n${target ? `Gate armed on ${target.url ?? target.root}.` : 'Pass --url or --root to arm the gate on a target.'}` };
}

/** The palette taken from the subject's picture (the hero still, the client's photograph); the rest of the deal stays. */
function withPictureColours(current, args, cwd, lib) {
  const file = String(args['palette-from']);
  if (!fs.existsSync(path.resolve(cwd, file))) throw new Error(`no picture at "${file}": pass the hero still or the client's photograph`);
  const own = current.direction?.scheme;
  const scheme = own && own !== 'any' ? own : args.scheme === 'dark' ? 'dark' : 'light';
  const accent = Number.parseInt(args.accent, 10) || 1;
  const palette = derivePalette(samplePixels(path.resolve(cwd, file)), { scheme, source: file, accent });
  return { ...applyPalette(current, palette, lib), paletteFrom: file };
}

/** The structures and art directions that fit, for the model to choose from; printed when one is missing. */
export function compositionMenu(lib, kind, moods, { needComposition = true, needDirection = true } = {}) {
  const fit = compositionsFor(lib, kind, moods);
  const order = landingFor(lib.landing ?? [], kind, moods);
  const { near, far } = directionsFor(lib, kind, moods);
  const dirs = needDirection ? [
    '', '# Choose the art direction',
    'It sets the grounds, the type scale, how pictures are treated, two template breaks and the set pieces; never the colours (you choose those after, with design.mjs). On the subject\'s moods:',
    ...near.map((d) => `- **${d.id}**: ${d.idea}`),
    `Further from the subject (a bolder page, only with a reason in the concept): ${far.map((d) => d.id).join(', ')}.`,
    'Pass it as `--direction <id>`.',
  ] : [];
  if (!needComposition) return ['# Choose before the build starts', ...dirs].join('\n');
  return [
    '# Choose the structure first',
    `These compositions fit a ${kind}${moods.length ? ` (${moods.join(', ')})` : ''}. Read them as a designer: which one shows this subject best in the first screen and paces what a visitor needs?`,
    ...(order ? ['', `What a visitor expects on this kind of page (ui-ux-pro-max ${order.id}): ${order.order.join(' > ')}. Main action: ${order.cta}.`] : []),
    '', ...fit.map((c) => `- **${c.id}**: ${c.idea}
  First screen: ${c.firstScreen}
  Sections: ${c.sections.join(' / ')}`),
    '', 'More structures: `python3 <skill>/../ui-ux-pro-max/scripts/search.py "<what is sold> landing" --domain landing`.',
    'Pass it as `--composition <id>`.',
    ...dirs,
    '', 'Run start.mjs again with the same flags plus your choices, and write why under `# Structure` in .craft/concept.md.',
  ].join('\n');
}

export function run(argv, cwd = process.cwd()) {
  const args = parseArgs(argv);
  const lib = loadLibrary();
  if (args.list) return { text: listVocabulary(lib) };

  if (!path.relative(path.resolve(SKILL, '..', '..'), cwd).startsWith('..')) {
    throw new Error(`you are inside the skill's own folder (${cwd}). Create the project in a new folder inside the session's working directory and run start.mjs from there.`);
  }
  const dir = craftDir(cwd);
  const kind = String(args.kind ?? 'landing');
  if (!KINDS.includes(kind)) throw new Error(`unknown --kind "${kind}". Use one of: ${KINDS.join(', ')}`);
  if (args['kit-only']) return kitOnly(args, cwd, dir, kind);
  const risk = args.risk && args.risk !== true ? String(args.risk) : 'bold';
  if (!(risk in RISK)) throw new Error(`unknown --risk "${risk}". Use one of: ${Object.keys(RISK).join(', ')}`);
  const vocabulary = moodsOf(lib);
  const moods = args.moods && args.moods !== true ? String(args.moods).split(',').map((m) => m.trim().toLowerCase()).filter(Boolean) : [];
  const unknown = moods.filter((m) => !vocabulary.includes(m));
  if (unknown.length) throw new Error(`unknown mood(s): ${unknown.join(', ')}. Pick 2-3 of: ${vocabulary.join(', ')}`);

  const lang = args.lang && args.lang !== true ? String(args.lang).trim() : null;
  if (lang && !/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(lang)) throw new Error(`--lang "${lang}" is not a language tag. Use the page's language: es, en, pt-BR ...`);
  const pages = args.pages && args.pages !== true ? String(args.pages) : '';
  if (pages && kind !== 'site') throw new Error('--pages is for --kind site (a multi-page website)');

  const existing = readJson(path.join(dir, 'deal.json'));
  const pins = parsePins(args.pin);
  if (args.composition && args.composition !== true) {
    const id = String(args.composition);
    if (!lib.compositions.some((c) => c.id === id)) throw new Error(`unknown --composition "${id}". Use one of: ${compositionsFor(lib, kind, moods).map((c) => c.id).join(', ')}`);
    pins.composition = id;
  }
  if (args.direction && args.direction !== true) {
    const id = String(args.direction);
    if (!lib.directions.some((d) => d.id === id)) throw new Error(`unknown --direction "${id}". Use one of: ${lib.directions.map((d) => d.id).join(', ')}`);
    pins.direction = id;
  }
  const keep = existing && existing.kind === kind && !args.redeal;
  const needComposition = compositionsFor(lib, kind, moods).length > 0 && !(pins.composition || (keep && existing.composition?.id));
  const needDirection = kind !== 'docs' && !args['deal-direction'] && !(pins.direction || (keep && existing.direction?.id));
  if (needComposition || needDirection) return { text: compositionMenu(lib, kind, moods, { needComposition, needDirection }), code: 3 };
  if (!pins.composition && existing?.composition?.id) pins.composition = existing.composition.id;
  if (!pins.direction && existing?.direction?.id) pins.direction = existing.direction.id;
  const look = args['deal-look'] ? 'deal' : 'model';
  let current = existing;
  // --lang and --pages redeal only when they change; re-running with the same flags (to add --url) keeps the deal.
  const samePages = (d) => !pages || JSON.stringify(normalizePages(pages)) === JSON.stringify((d.pages ?? []).map((p) => p.path));
  const asked = args.redeal || args.pin || args.seed || args.risk || (args.composition && existing?.composition?.id !== String(args.composition)) || (args.direction && existing?.direction?.id !== String(args.direction)) || (existing && ((lang && lang !== existing.lang) || !samePages(existing)));
  if (!existing || asked || existing.kind !== kind || existing.version !== 3) {
    const seed = Number.parseInt(args.seed, 10) || crypto.randomInt(1, 2 ** 31);
    const hFile = historyFile();
    const history = readJson(hFile, []);
    current = { seed, ...deal({ lib, kind, moods, history, rng: rngFrom(seed), pins, brand: !!args.brand, look, risk, lang, pages }), at: new Date().toISOString() };
    // A look the model already chose survives a redeal of the rest.
    if (existing?.design?.set && look === 'model' && !args.brand) Object.assign(current, { palette: existing.palette, type: existing.type, design: existing.design });
    writeJson(hFile, [...history, { at: current.at, kind, ...summarize(current) }].slice(-HISTORY_MAX));
  }

  if (args['palette-from'] && args['palette-from'] !== true) current = withPictureColours(current, args, cwd, lib);

  const kitDir = String(args.kit ?? current.kitDir ?? defaultKitDir(cwd));
  let createdPage = null;
  current.kitDir = kitDir;
  if (!args['no-kit']) {
    copyKit(path.join(cwd, kitDir));
    createdPage = copyBlueprint(current.composition.id, cwd, kitDir);
    if ((current.palette && current.type) || current.look === 'model') fs.writeFileSync(path.join(cwd, kitDir, 'tokens.css'), tokensCss(current));
  }
  writeJson(path.join(dir, 'deal.json'), current);

  const gate = readJson(path.join(dir, 'gate.json'), {});
  const target = resolveTarget(args, gate) ?? null;
  const sitePages = current.pages?.length ? current.pages.map((p) => p.path) : undefined;
  writeJson(path.join(dir, 'gate.json'), { ...gate, armed: true, off: false, kind, target, pages: sitePages, blocks: gate.blocks ?? 0, startedAt: gate.startedAt ?? new Date().toISOString() });

  const script = path.join(SKILL, 'scripts', 'check.mjs');
  const rel = path.relative(cwd, script);
  const checkCmd = `node ${rel.startsWith('..') ? script : rel}`;
  const ref = (f) => path.join(SKILL, 'references', f);
  const tools = { uupm: path.join(SKILL, '..', 'ui-ux-pro-max'), hallmark: path.join(SKILL, '..', 'hallmark'), design: path.join(SKILL, 'scripts', 'design.mjs'), colorRef: ref('color-type.md') };
  const brief = briefMd(current, { kitDir, checkCmd, taste: tasteSkill(), setPiecesRef: ref('set-pieces.md'), componentsRef: ref('components.md'), surfacesRef: ref('surfaces.md'), scenesRef: ref('scenes.md'), tools });
  fs.writeFileSync(path.join(dir, 'brief.md'), brief);
  const tail = target ? `Gate armed on ${target.url ?? target.root}.`
    : 'No target yet: once the dev server runs, re-run start.mjs with --url <dev url> (the deal is kept), or pass --root <build folder>.';
  const page = createdPage ? `\nindex.html was created from the blueprint: fill it in place.` : '';
  return { text: `${brief}\n${tail}${page}`, deal: current };
}

if (isMain(import.meta.url)) {
  try {
    const out = run(process.argv.slice(2));
    console.log(out.text);
    if (out.code) process.exitCode = out.code;
  } catch (err) {
    console.error(`start: ${err.message}`);
    process.exit(2);
  }
}
