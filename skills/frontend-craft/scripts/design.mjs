#!/usr/bin/env node
/*
  The look the model chose, checked and written. The model picks the colours and the faces (references/color-type.md,
  ui-ux-pro-max for candidates); this script derives the roles it did not set, checks contrast and the method, and
  writes tokens.css and .craft/design.json. A choice that breaks the method is refused and nothing is written.

    node <skill>/scripts/design.mjs set --bg "#fbfaf7" --ink "#151413" --accent "#a3472c"
         --display "Fraunces" --text "Instrument Sans" --why "<where the accent and the faces come from>"
         [--surface --muted --line --accent-ink <hex>] [--display-weights 500] [--text-weights 400,500,600]
         [--mono "<family>"] [--tracking -0.02em] [--leading 1] [--upper]
         [--mode sober|colour] [--allow-violet]
    node <skill>/scripts/design.mjs theme <slug> [--colourway <name>] --why "..."   a finished Hallmark theme as the look
    node <skill>/scripts/design.mjs accents <photo>     the colours in the subject's own picture, as accent candidates
    node <skill>/scripts/design.mjs show                the look now in .craft/deal.json

  Grounds may carry the subject's colour (paper, the brand's colour, the night of the place): contrast, violet and neon
  still fail. --mode sober holds a white or near-black ground, near-black ink and one accent, for a client who asks for it.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hexToRgb, deltaE } from './lib/color.mjs';
import { buildRoles, buildType, loadFonts, paletteFindings, themeLook, typeFindings } from './lib/look.mjs';
import { derivePalette, samplePixels } from './lib/palette-from.mjs';
import { fontLinks, tokensCss } from './lib/render.mjs';
import { craftDir, isMain, parseArgs, readJson, writeJson } from './lib/state.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FONTS_CSV = path.join(SKILL, '..', 'ui-ux-pro-max', 'data', 'google-fonts.csv');
export const THEMES = path.join(SKILL, '..', 'hallmark', 'references', 'themes');
/** Framework default accents: what a page gets when nobody chose. */
const DEFAULT_ACCENTS = ['#2563eb', '#3b82f6', '#1e3a8a', '#1e40af', '#0ea5e9', '#4f46e5', '#6366f1', '#10b981', '#22c55e'];
const DEFAULT_NEAR = 0.04;

const list = (v) => (v === undefined || v === true ? undefined : String(v).split(',').map((x) => Number.parseInt(x.trim(), 10)).filter(Number.isFinite));
const str = (v) => (v === undefined || v === true ? undefined : String(v).trim());

/** The palette, type and findings for a set of flags. Pure apart from reading the font list. */
export function evaluateLook(args, fonts = loadFonts(FONTS_CSV), { links = null } = {}) {
  const mode = str(args.mode) === 'sober' ? 'sober' : 'colour';
  const { scheme, roles } = buildRoles({ bg: str(args.bg), ink: str(args.ink), accent: str(args.accent), surface: str(args.surface), muted: str(args.muted), line: str(args.line), accentInk: str(args['accent-ink']) });
  const type = buildType({ display: str(args.display), displayWeights: list(args['display-weights']), text: str(args.text), textWeights: list(args['text-weights']), mono: str(args.mono), tracking: str(args.tracking), leading: args.leading ? Number(args.leading) : undefined, upper: !!args.upper, fonts });
  if (links) type.links = links;
  // A theme's own faces may come from another foundry (Fontshare): its link tags load them, so not finding them on Google Fonts is a note.
  const typeNotes = typeFindings(type, fonts).map((x) => (links && x.id.startsWith('font-unknown') ? { ...x, level: 'WARN', msg: `${x.msg.split(';')[0]}; the theme's own link tags load it` } : x));
  const findings = [...paletteFindings({ roles }, { mode, allowViolet: !!args['allow-violet'] }), ...typeNotes];
  const near = DEFAULT_ACCENTS.find((hex) => deltaE(hexToRgb(hex), hexToRgb(roles.accent)) < DEFAULT_NEAR);
  if (near) findings.push({ level: 'WARN', id: 'accent-default', msg: `the accent ${roles.accent} is a framework default (${near}): what a page gets when nobody chose; take it from the subject` });
  const why = str(args.why);
  if (!why || why.length < 12) findings.push({ level: 'FAIL', id: 'why-missing', msg: '--why is required: one line on where the accent and the faces come from (the photograph\'s tiles, the brand, the trade)' });
  return { mode, palette: { id: 'chosen', scheme, moods: [], roles, note: why ?? '' }, type, findings };
}

function set(args, cwd, extra = {}) {
  const dir = craftDir(cwd);
  const deal = readJson(path.join(dir, 'deal.json'));
  if (!deal) throw new Error('no .craft/deal.json here: run start.mjs first, from the project folder');
  const look = evaluateLook(args, undefined, extra);
  for (const x of look.findings) console.log(`${x.level} ${x.id}: ${x.msg}`);
  if (look.findings.some((x) => x.level === 'FAIL')) {
    console.log('\nNothing written: change the choice and run design.mjs set again (references/color-type.md).');
    return 1;
  }
  const next = { ...deal, palette: look.palette, type: look.type, paletteFrom: undefined, design: { set: true, mode: look.mode, why: look.palette.note, theme: extra.theme ?? null, at: new Date().toISOString() } };
  writeJson(path.join(dir, 'deal.json'), next);
  writeJson(path.join(dir, 'design.json'), { mode: look.mode, why: look.palette.note, palette: look.palette.roles, type: look.type, warnings: look.findings });
  const kit = path.join(cwd, deal.kitDir ?? 'craft');
  if (fs.existsSync(kit)) fs.writeFileSync(path.join(kit, 'tokens.css'), tokensCss(next));
  const r = look.palette.roles;
  console.log(`Look set (${look.mode}, ${look.palette.scheme}): bg ${r.bg} · surface ${r.surface} · ink ${r.ink} · muted ${r.muted} · line ${r.line} · accent ${r.accent} (text on it ${r.accentInk})`);
  console.log(`Display ${look.type.display.family} ${look.type.display.weights.join('/')} · text ${look.type.text.family} ${look.type.text.weights.join('/')}`);
  console.log(`${fs.existsSync(kit) ? `Wrote ${path.relative(cwd, path.join(kit, 'tokens.css'))}` : 'No kit folder yet: start.mjs copies it'} and .craft/design.json. Load the fonts:\n\n${fontLinks(look.type)}`);
  return 0;
}

/** A Hallmark theme as the look: its tokens mapped onto the kit, checked like any choice (coloured grounds allowed). */
function theme(args, cwd) {
  const slug = args._[1];
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('usage: design.mjs theme <slug> [--colourway <name>] --why "..." (slugs: node <skill>/../hallmark/scripts/theme.mjs list)');
  const file = path.join(THEMES, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error(`no Hallmark theme "${slug}" at ${file}`);
  const t = themeLook(fs.readFileSync(file, 'utf8'), str(args.colourway) ?? null);
  const flags = {
    ...args, bg: t.bg, ink: t.ink, accent: t.accent, surface: t.surface, muted: t.muted, line: t.line, 'accent-ink': t.accentInk,
    display: t.display, text: t.text, 'display-weights': t.displayWeight ? String(t.displayWeight) : undefined, tracking: t.tracking ?? undefined,
    mode: args.mode ?? 'colour',
  };
  const sober = paletteFindings(buildRoles({ bg: t.bg, ink: t.ink, accent: t.accent }), { mode: 'sober' }).filter((x) => x.level === 'FAIL').length === 0;
  console.log(`Hallmark theme ${slug}${args.colourway ? ` (${args.colourway})` : ''}: ${sober ? 'sober (a white or near-black ground, one accent)' : 'it colours its grounds; the default here is sober, so choose it only when the subject asks for this material'}.`);
  return set(flags, cwd, { links: t.links, theme: `${slug}${args.colourway ? `:${args.colourway}` : ''}` });
}

function accents(file, cwd) {
  const f = path.resolve(cwd, file ?? '');
  if (!file || !fs.existsSync(f)) throw new Error(`no picture at "${file ?? ''}"`);
  const p = derivePalette(samplePixels(f), { source: file });
  console.log(`Colours in ${file}, as accent candidates (most present first):`);
  for (const [i, a] of (p.accents ?? []).entries()) console.log(`  ${i + 1}. ${a.hex}  (${a.share}% of the picture)`);
  console.log(`Its own light ground and ink would be ${p.roles.bg} and ${p.roles.ink}; a sober page keeps white and near-black and takes one accent from here.`);
  return 0;
}

function show(cwd) {
  const deal = readJson(path.join(craftDir(cwd), 'deal.json'));
  if (!deal) throw new Error('no .craft/deal.json here');
  if (!deal.palette) { console.log('Look pending: choose it (references/color-type.md), then design.mjs set.'); return 0; }
  console.log(JSON.stringify({ design: deal.design ?? (deal.look === 'model' ? 'pending: run design.mjs set' : 'dealt'), palette: deal.palette.roles, display: deal.type.display.family, text: deal.type.text.family }, null, 2));
  return 0;
}

export function main(argv, cwd = process.cwd()) {
  const args = parseArgs(argv);
  const cmd = args._[0];
  if (cmd === 'set') return set(args, cwd);
  if (cmd === 'accents') return accents(args._[1], cwd);
  if (cmd === 'theme') return theme(args, cwd);
  if (cmd === 'show') return show(cwd);
  throw new Error('usage: design.mjs set --bg --ink --accent --display --text --why | theme <hallmark slug> --why | accents <photo> | show');
}

if (isMain(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (err) { console.error(`design.mjs: ${err.message}`); process.exitCode = 2; }
}
