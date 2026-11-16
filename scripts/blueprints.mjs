#!/usr/bin/env node
// Render every composition blueprint through start.mjs + check.mjs with sample text, so no skeleton ships broken.
//   node scripts/blueprints.mjs [--only poster-headline,index-list] [--keep]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCheck } from '../skills/frontend-craft/scripts/check.mjs';
import { loadLibrary } from '../skills/frontend-craft/scripts/lib/deal.mjs';
import { fontLinks } from '../skills/frontend-craft/scripts/lib/render.mjs';
import { parseArgs, readJson } from '../skills/frontend-craft/scripts/lib/state.mjs';
import { run as start } from '../skills/frontend-craft/scripts/start.mjs';
import { fill } from './sample-text.mjs';

const args = parseArgs(process.argv.slice(2));
const lib = loadLibrary();
const only = args.only ? String(args.only).split(',') : null;
const base = path.join(os.homedir(), '.cache', 'frontend-craft', 'blueprints');
const BUILD_ONLY = ['empty-run'];
const rows = [];
process.env.XDG_STATE_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-bp-state-'));

for (const comp of lib.compositions.filter((c) => !only || only.includes(c.id))) {
  const dir = path.join(base, comp.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  start(['--kind', comp.kinds[0], '--pin', `composition=${comp.id}`, '--seed', '7', '--file', 'index.html', '--deal-look', '--deal-direction'], dir);
  const deal = readJson(path.join(dir, '.craft', 'deal.json'));
  const page = path.join(dir, 'index.html');
  const html = fill(fs.readFileSync(page, 'utf8')).replace('<!-- paste the font <link> tags that design.mjs set printed here -->', fontLinks(deal.type));
  fs.writeFileSync(page, html);
  // A blueprint is the skeleton only: its photographs, set pieces and concept come with a real build,
  // so the direction's richness floor is not judged here.
  const report = await runCheck({ target: { root: dir, page: 'index.html' }, kind: comp.kinds[0], deal: { ...deal, direction: null }, out: path.join(dir, '.craft') });
  // Emptiness is judged on a real build: a skeleton has sample words and no photographs, so a pinned statement or a
  // list reads empty here. A build that keeps it empty for two screens fails empty-run.
  const fails = report.findings.filter((x) => x.level === 'FAIL' && !BUILD_ONLY.includes(x.id));
  rows.push({ id: comp.id, fails: fails.map((x) => `${x.id}: ${x.msg.slice(0, 90)}`), motion: report.motion });
  console.log(`${fails.length ? 'FAIL' : 'PASS'} ${comp.id.padEnd(20)} enter ${report.motion.entrance}, linked ${report.motion.scrollLinked}, pinned ${report.motion.sticky.length}${fails.length ? `\n     ${fails.map((x) => `${x.id}: ${x.msg.slice(0, 110)}`).join('\n     ')}` : ''}`);
}
if (!args.keep) fs.rmSync(process.env.XDG_STATE_HOME, { recursive: true, force: true });
process.exit(rows.some((r) => r.fails.length) ? 1 : 0);
