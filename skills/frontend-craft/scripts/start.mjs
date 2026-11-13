#!/usr/bin/env node
/*
  frontend-craft start: deal a direction, copy the kit into the project and arm the gate.

    node <skill>/scripts/start.mjs --kind landing --moods warm,craft,coffee [--kit src/craft]
        [--url http://localhost:5173 | --root dist | --file index.html]
        [--redeal] [--seed 42] [--pin palette=id,type=id,composition=id,signature=id] [--brand] [--list]

  Writes .craft/deal.json, .craft/brief.md and .craft/gate.json, copies the kit (craft.css,
  craft-motion.js, motion/) plus a dealt tokens.css into --kit, and prints the brief.
  Re-running keeps the current deal unless --redeal is given.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { KINDS, deal, historyFile, loadLibrary, moodsOf, rngFrom, summarize } from './lib/deal.mjs';
import { briefMd, tokensCss } from './lib/render.mjs';
import { craftDir, parseArgs, readJson, resolveTarget, writeJson } from './lib/state.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KIT = path.join(SKILL, 'kit');
const HISTORY_MAX = 40;

function defaultKitDir(cwd) {
  if (fs.existsSync(path.join(cwd, 'src'))) return 'src/craft';
  if (fs.existsSync(path.join(cwd, 'app'))) return 'app/craft';
  return 'craft';
}

function copyKit(dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(KIT, dest, { recursive: true, filter: (src) => !src.endsWith('.md') });
}

function parsePins(raw) {
  if (!raw || raw === true) return {};
  return Object.fromEntries(String(raw).split(',').map((kv) => kv.split('=').map((s) => s.trim())));
}

function listVocabulary(lib) {
  return [
    `kinds: ${KINDS.join(', ')}`,
    `moods: ${moodsOf(lib).join(', ')}`,
    `palettes: ${lib.palettes.map((p) => p.id).join(', ')}`,
    `type: ${lib.pairings.map((p) => p.id).join(', ')}`,
    `compositions: ${lib.compositions.map((c) => c.id).join(', ')}`,
    `signatures: ${lib.signatures.map((s) => s.id).join(', ')}`,
  ].join('\n');
}

export function run(argv, cwd = process.cwd()) {
  const args = parseArgs(argv);
  const lib = loadLibrary();
  if (args.list) return { text: listVocabulary(lib) };

  const dir = craftDir(cwd);
  const kind = String(args.kind ?? 'landing');
  if (!KINDS.includes(kind)) throw new Error(`unknown --kind "${kind}". Use one of: ${KINDS.join(', ')}`);
  const vocabulary = moodsOf(lib);
  const moods = args.moods && args.moods !== true ? String(args.moods).split(',').map((m) => m.trim().toLowerCase()).filter(Boolean) : [];
  const unknown = moods.filter((m) => !vocabulary.includes(m));
  if (unknown.length) throw new Error(`unknown mood(s): ${unknown.join(', ')}. Pick 2-3 of: ${vocabulary.join(', ')}`);

  const existing = readJson(path.join(dir, 'deal.json'));
  let current = existing;
  if (!existing || args.redeal || args.pin || args.seed || existing.kind !== kind) {
    const seed = Number.parseInt(args.seed, 10) || crypto.randomInt(1, 2 ** 31);
    const hFile = historyFile();
    const history = readJson(hFile, []);
    current = { seed, ...deal({ lib, kind, moods, history, rng: rngFrom(seed), pins: parsePins(args.pin), brand: !!args.brand }), at: new Date().toISOString() };
    writeJson(hFile, [...history, { at: current.at, kind, ...summarize(current) }].slice(-HISTORY_MAX));
  }

  const kitDir = String(args.kit ?? current.kitDir ?? defaultKitDir(cwd));
  current.kitDir = kitDir;
  if (!args['no-kit']) {
    copyKit(path.join(cwd, kitDir));
    if (current.palette && current.type) fs.writeFileSync(path.join(cwd, kitDir, 'tokens.css'), tokensCss(current));
  }
  writeJson(path.join(dir, 'deal.json'), current);

  const gate = readJson(path.join(dir, 'gate.json'), {});
  const target = resolveTarget(args, gate) ?? null;
  writeJson(path.join(dir, 'gate.json'), { ...gate, armed: true, off: false, kind, target, blocks: gate.blocks ?? 0, startedAt: gate.startedAt ?? new Date().toISOString() });

  const script = path.join(SKILL, 'scripts', 'check.mjs');
  const rel = path.relative(cwd, script);
  const checkCmd = `node ${rel.startsWith('..') ? script : rel}`;
  const brief = briefMd(current, { kitDir, checkCmd });
  fs.writeFileSync(path.join(dir, 'brief.md'), brief);
  const tail = target ? `Gate armed on ${target.url ?? target.root}.`
    : 'No target yet: once the dev server runs, re-run start.mjs with --url <dev url> (the deal is kept), or pass --root <build folder>.';
  return { text: `${brief}\n${tail}`, deal: current };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    console.log(run(process.argv.slice(2)).text);
  } catch (err) {
    console.error(`start: ${err.message}`);
    process.exit(2);
  }
}
