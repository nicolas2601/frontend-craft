#!/usr/bin/env node
// svg-craft a11y-fix: give an SVG an accessible name. Generators (svg-art, charts) usually emit a <title> but no role.
// Usage: node a11y-fix.mjs in.svg --title "Short name" [--desc "One sentence of what it shows"] [-o out.svg]
//        node a11y-fix.mjs in.svg --decorative            (aria-hidden="true", removes title/desc)
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('-') && args[args.indexOf(a) - 1] !== '--title' && args[args.indexOf(a) - 1] !== '--desc' && args[args.indexOf(a) - 1] !== '-o');
const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
if (!input) { console.error('usage: a11y-fix.mjs in.svg --title "..." [--desc "..."] [-o out.svg] | --decorative'); process.exit(2); }
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
let svg = readFileSync(resolve(input), 'utf8');
const m = svg.match(/<svg\b[^>]*>/);
if (!m) { console.error('no <svg> root'); process.exit(1); }
let open = m[0];
const strip = (re) => { open = open.replace(re, ''); };
if (!/xmlns=/.test(open)) open = open.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
strip(/\s(role|aria-label|aria-labelledby|aria-hidden)="[^"]*"/g);
svg = svg.replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/g, '').replace(/<desc\b[^>]*>[\s\S]*?<\/desc>\s*/g, '');
if (args.includes('--decorative')) {
  open = open.replace('<svg', '<svg aria-hidden="true"');
  svg = svg.replace(m[0], open);
} else {
  const title = val('--title'); const desc = val('--desc');
  if (!title) { console.error('--title is required (or --decorative)'); process.exit(2); }
  const base = (input.split('/').pop() || 'svg').replace(/\W+/g, '-').replace(/-svg$/, '') || 'svg';
  open = open.replace('<svg', `<svg role="img" aria-labelledby="${base}-t${desc ? ` ${base}-d` : ''}"`);
  svg = svg.replace(m[0], `${open}\n<title id="${base}-t">${esc(title)}</title>${desc ? `\n<desc id="${base}-d">${esc(desc)}</desc>` : ''}`);
}
const out = val('-o') ? resolve(val('-o')) : resolve(input);
writeFileSync(out, svg);
console.log('wrote', out);
