#!/usr/bin/env node
/*
  frontend-craft start: deal a direction, copy the kit into the project and arm the gate.

    node <skill>/scripts/start.mjs --kind landing --moods warm,craft,coffee --lang es [--kit src/craft]
    node <skill>/scripts/start.mjs --kind site --pages /,/menu,/visit --moods ... --lang es     # a multi-page site
    node <skill>/scripts/start.mjs --kind app --moods tech,precise --lang en                   # a platform or app UI
        [--url http://localhost:5173 | --root dist | --file index.html]
        [--risk safe|bold|wild] [--redeal] [--seed 42]
        [--pin direction=id,palette=id,type=id,composition=id,signature=id,component=Id,scene=id] [--brand] [--kit-only] [--list]
        [--palette-from assets/hero-still.webp [--accent 2]]   # the colours from the subject's own picture

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
import { KINDS, RISK, applyPalette, deal, historyFile, loadLibrary, moodsOf, normalizePages, rngFrom, summarize } from './lib/deal.mjs';
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
  let current = existing;
  // --lang and --pages redeal only when they change; re-running with the same flags (to add --url) keeps the deal.
  const samePages = (d) => !pages || JSON.stringify(normalizePages(pages)) === JSON.stringify((d.pages ?? []).map((p) => p.path));
  const asked = args.redeal || args.pin || args.seed || args.risk || (existing && ((lang && lang !== existing.lang) || !samePages(existing)));
  if (!existing || asked || existing.kind !== kind || existing.version !== 3) {
    const seed = Number.parseInt(args.seed, 10) || crypto.randomInt(1, 2 ** 31);
    const hFile = historyFile();
    const history = readJson(hFile, []);
    current = { seed, ...deal({ lib, kind, moods, history, rng: rngFrom(seed), pins: parsePins(args.pin), brand: !!args.brand, risk, lang, pages }), at: new Date().toISOString() };
    writeJson(hFile, [...history, { at: current.at, kind, ...summarize(current) }].slice(-HISTORY_MAX));
  }

  if (args['palette-from'] && args['palette-from'] !== true) current = withPictureColours(current, args, cwd, lib);

  const kitDir = String(args.kit ?? current.kitDir ?? defaultKitDir(cwd));
  let createdPage = null;
  current.kitDir = kitDir;
  if (!args['no-kit']) {
    copyKit(path.join(cwd, kitDir));
    createdPage = copyBlueprint(current.composition.id, cwd, kitDir);
    if (current.palette && current.type) fs.writeFileSync(path.join(cwd, kitDir, 'tokens.css'), tokensCss(current));
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
  const brief = briefMd(current, { kitDir, checkCmd, taste: tasteSkill(), setPiecesRef: ref('set-pieces.md'), componentsRef: ref('components.md'), surfacesRef: ref('surfaces.md'), scenesRef: ref('scenes.md') });
  fs.writeFileSync(path.join(dir, 'brief.md'), brief);
  const tail = target ? `Gate armed on ${target.url ?? target.root}.`
    : 'No target yet: once the dev server runs, re-run start.mjs with --url <dev url> (the deal is kept), or pass --root <build folder>.';
  const page = createdPage ? `\nindex.html was created from the blueprint: fill it in place.` : '';
  return { text: `${brief}\n${tail}${page}`, deal: current };
}

if (isMain(import.meta.url)) {
  try {
    console.log(run(process.argv.slice(2)).text);
  } catch (err) {
    console.error(`start: ${err.message}`);
    process.exit(2);
  }
}
