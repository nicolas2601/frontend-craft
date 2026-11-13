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

const SVG = '<svg viewBox="0 0 400 300" role="img" aria-label="Sample visual"><rect x="20" y="20" width="360" height="260" rx="24" fill="var(--c-accent)"/><circle cx="200" cy="150" r="70" fill="var(--c-bg)"/></svg>';

function fill(html) {
  return html.replace(/\{\{([^}]*)\}\}/g, (_, hint) => {
    const h = hint.toLowerCase();
    if (h.startsWith('visual')) return SVG;
    if (h.startsWith('real number')) return '1.280';
    if (h.startsWith('real link')) return '#';
    if (h.startsWith('brand')) return 'Northwind Studio: sample page';
    if (/headline|statement|name or|place name|event or product/.test(h)) return 'Bread baked before the city wakes';
    if (/one sentence|deck|line:|two sentences|passage|belief|paragraph|pull quote|closing/.test(h)) {
      return 'Sample sentence for the blueprint check, long enough to wrap like real copy on a phone.';
    }
    return 'Sample item';
  });
}

const args = parseArgs(process.argv.slice(2));
const lib = loadLibrary();
const only = args.only ? String(args.only).split(',') : null;
const base = path.join(os.homedir(), '.cache', 'frontend-craft', 'blueprints');
const rows = [];
process.env.XDG_STATE_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'fc-bp-state-'));

for (const comp of lib.compositions.filter((c) => !only || only.includes(c.id))) {
  const dir = path.join(base, comp.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  start(['--kind', comp.kinds[0], '--pin', `composition=${comp.id}`, '--seed', '7', '--file', 'index.html'], dir);
  const deal = readJson(path.join(dir, '.craft', 'deal.json'));
  const page = path.join(dir, 'index.html');
  const html = fill(fs.readFileSync(page, 'utf8')).replace('<!-- paste the font <link> tags from .craft/brief.md here -->', fontLinks(deal.type));
  fs.writeFileSync(page, html);
  const report = await runCheck({ target: { root: dir, page: 'index.html' }, kind: comp.kinds[0], deal, out: path.join(dir, '.craft') });
  const fails = report.findings.filter((x) => x.level === 'FAIL');
  rows.push({ id: comp.id, fails: fails.map((x) => `${x.id}: ${x.msg.slice(0, 90)}`), motion: report.motion });
  console.log(`${fails.length ? 'FAIL' : 'PASS'} ${comp.id.padEnd(20)} enter ${report.motion.entrance}, linked ${report.motion.scrollLinked}, pinned ${report.motion.sticky.length}${fails.length ? `\n     ${fails.map((x) => `${x.id}: ${x.msg.slice(0, 110)}`).join('\n     ')}` : ''}`);
}
if (!args.keep) fs.rmSync(process.env.XDG_STATE_HOME, { recursive: true, force: true });
process.exit(rows.some((r) => r.fails.length) ? 1 : 0);
