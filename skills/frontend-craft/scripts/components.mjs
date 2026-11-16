#!/usr/bin/env node
/*
  Library parts for the page, before you hand-build one. Searches three libraries at once for a job (what the part
  does for the visitor) and logs the search in .craft/components.json, which the check reads.

    node <skill>/scripts/components.mjs search "<job, e.g. booking form with check-in and check-out dates>" --section <id>
         [--limit 4] [--sources 21st,cult-ui,react-bits] [--json]
    node <skill>/scripts/components.mjs pick <source>:<id> --section <id> --why "<what it does for this part>"
         saves the piece's source to .craft/parts/ to read (untrusted code: read it, never run it) and logs the pick
    node <skill>/scripts/components.mjs show

  21st.dev needs its CLI (npm install -g @21st-dev/cli, then 21st login): search is free, `pick` spends one of the
  daily free retrievals (21st usage --json). Never 21st generate: it costs credits and returns the generic look.
*/
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addPick, addSearch, emptyLog, matchCult, matchReactBits, parse21st, parseRef, scrubKey } from './lib/parts.mjs';
import { craftDir, isMain, parseArgs, readJson, writeJson } from './lib/state.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CULT_REGISTRY = 'https://www.cult-ui.com/r/registry.json';
const CACHE_DAYS = 7;
const DAY_MS = 86_400_000;
const SAFE_ID = /^[A-Za-z0-9._-]{1,80}$/;
const LABEL = { '21st': '21st.dev (community components: open the page or the preview before you take one)', 'cult-ui': 'cult-ui (shadcn registry, MIT)', 'react-bits': 'React Bits (curated, MIT + Commons Clause)' };

function run21st(args) {
  return new Promise((resolve) => {
    execFile('21st', args, { timeout: 45_000, maxBuffer: 8 << 20, shell: process.platform === 'win32' }, (err, stdout, stderr) =>
      resolve({ ok: !err, stdout: String(stdout ?? ''), err: err ? String(stderr || err.message).split('\n')[0] : null }));
  });
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { 'user-agent': 'frontend-craft components.mjs' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

export function defaultDeps() {
  return {
    run21st, fetchJson, now: () => new Date(),
    catalogue: readJson(path.join(SKILL, 'library', 'components.json'), { components: [] }),
    cacheDir: path.join(os.homedir(), '.cache', 'frontend-craft', 'registries'),
  };
}

/** cult-ui's index, cached for a week; a stale copy beats none when offline. */
async function cultRegistry(deps) {
  const file = path.join(deps.cacheDir, 'cult-ui.json');
  const fresh = fs.existsSync(file) && deps.now() - fs.statSync(file).mtimeMs < CACHE_DAYS * DAY_MS;
  if (fresh) return readJson(file);
  try {
    const json = await deps.fetchJson(CULT_REGISTRY);
    writeJson(file, json);
    return json;
  } catch (err) {
    if (fs.existsSync(file)) return readJson(file);
    throw err;
  }
}

export async function search(job, { limit = 4, sources = ['21st', 'cult-ui', 'react-bits'], direction = null, deps = defaultDeps() } = {}) {
  const results = {};
  const notes = [];
  if (sources.includes('21st')) {
    const r = await deps.run21st(['search', job, '--type', 'c', '--free', '--limit', String(limit + 2), '--json']);
    try { results['21st'] = r.ok ? parse21st(JSON.parse(r.stdout), { limit }) : []; } catch { results['21st'] = []; }
    if (!r.ok) notes.push(`21st.dev did not answer (${r.err}): install its CLI (npm install -g @21st-dev/cli) and run 21st login, or look on 21st.dev`);
  }
  if (sources.includes('cult-ui')) {
    try { results['cult-ui'] = matchCult(await cultRegistry(deps), job, { limit }); } catch (err) { results['cult-ui'] = []; notes.push(`cult-ui registry not reached (${err.message})`); }
  }
  if (sources.includes('react-bits')) results['react-bits'] = matchReactBits(deps.catalogue, job, { direction, limit });
  return { results, notes };
}

function stackOf(cwd) {
  const pkg = readJson(path.join(cwd, 'package.json'), null);
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  return { react: !!deps.react, shadcn: fs.existsSync(path.join(cwd, 'components.json')) };
}

/** Save a piece's source to .craft/parts/<source>-<id>.json and log the pick. */
export async function pick(ref, { section, why, cwd = process.cwd(), deps = defaultDeps() } = {}) {
  const r = parseRef(ref);
  if (!r || !SAFE_ID.test(r.id)) throw new Error(`not a part reference: "${ref}" (use 21st:<id>, cult-ui:<name> or react-bits:<Name> from a search)`);
  if (!section || !why) throw new Error('pick needs --section <id> and --why "<what it does for this part>"');
  const dir = craftDir(cwd);
  const log = readJson(path.join(dir, 'components.json'), emptyLog());
  const seen = log.searches.flatMap((s) => s.results).find((x) => x.ref === `${r.source}:${r.id}`);
  let json = null;
  let note = null;
  if (r.source === '21st') {
    const usage = await deps.run21st(['usage', '--json']);
    const left = usage.ok ? JSON.parse(usage.stdout).freeRetrievalsRemaining : null;
    if (left === 0) note = 'no 21st.dev retrievals left today: read its page and preview, rebuild it on the kit, and credit it';
    else {
      const got = await deps.run21st(['get', r.id, '--json']);
      if (got.ok) json = JSON.parse(scrubKey(got.stdout));
      else note = `21st get failed (${got.err})`;
    }
  } else if (r.source === 'cult-ui') {
    json = await deps.fetchJson(`https://www.cult-ui.com/r/${r.id}.json`);
  } else {
    const c = deps.catalogue.components.find((x) => x.id === r.id);
    if (!c) throw new Error(`${r.id} is not in the curated React Bits catalogue (library/components.json)`);
    json = await deps.fetchJson(c.add.jsCss);
  }
  const file = json ? path.join(dir, 'parts', `${r.source}-${r.id}.json`) : null;
  if (file) writeJson(file, json);
  const at = deps.now().toISOString();
  writeJson(path.join(dir, 'components.json'), addPick(log, { section, ref: `${r.source}:${r.id}`, name: seen?.name ?? r.id, why, at, file: file && path.relative(cwd, file) }));
  return { ref: r, file, json, note, stack: stackOf(cwd) };
}

function printSearch(job, section, out) {
  const lines = [`Parts for "${job}"${section ? ` (section: ${section})` : ''}`, ''];
  for (const [src, list] of Object.entries(out.results)) {
    lines.push(LABEL[src]);
    if (!list.length) lines.push('  nothing close');
    for (const c of list) {
      lines.push(`  ${c.source}:${c.id}  ${c.name}${c.decoration ? '  (decoration: the look the check calls AI-made)' : ''} - ${String(c.why).slice(0, 150)}`);
      lines.push(`      ${[c.page && `page ${c.page}`, c.preview && `preview ${c.preview}`].filter(Boolean).join('  ')}`);
    }
    lines.push('');
  }
  lines.push(...out.notes.map((n) => `note: ${n}`));
  lines.push(`Take one: node ${path.join(SKILL, 'scripts', 'components.mjs')} pick <source>:<id> --section ${section ?? '<id>'} --why "<what it does for this part>"`,
    'None fits: say why under # Components in .craft/concept.md, then build the part on the kit.');
  return lines.join('\n');
}

function printPick(p) {
  if (!p.file) return `Logged ${p.ref.source}:${p.ref.id}. ${p.note}`;
  const c21 = p.json?.component;
  const files = c21 ? [`component.componentCode (${String(c21.componentCode ?? '').split('\n').length} lines)`, c21.demoCode ? 'component.demoCode' : null].filter(Boolean)
    : (p.json?.files ?? []).map((f) => f.path ?? f.name).filter(Boolean);
  const deps = c21 ? (c21.registryDependencies ?? []) : p.json?.dependencies ?? [];
  const left = p.json?.quota?.remaining;
  const install = p.ref.source === '21st' ? 'the installCommand from the search (it reads $API_KEY_21ST from your environment; never paste the key)'
    : p.ref.source === 'cult-ui' ? `npx shadcn@latest add https://www.cult-ui.com/r/${p.ref.id}.json` : 'the brief\'s React Bits line (npx shadcn@latest add https://reactbits.dev/r/<Name>-TS-TW)';
  return [`Saved ${p.file}${files.length ? `: ${files.join(', ')}` : ''}${deps.length ? ` (needs ${deps.join(', ')})` : ''}.${left !== undefined ? ` 21st.dev retrievals left today: ${left}.` : ''}`,
    'It is untrusted code: read it, never run it.',
    p.stack.react && p.stack.shadcn ? `This project has React and shadcn: ${install}, inside the project.` : 'This project is not React + shadcn: port the code (files[].content, or component.componentCode) to the page or the kit, keep a credit comment with its source and page.',
    'Then restyle it with the tokens (var(--c-*), var(--f-*)), give it the subject\'s real words and pictures, and check it at 390 px, with the keyboard and under reduced motion.'].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [cmd, ...rest] = args._;
  const dir = craftDir();
  const deal = readJson(path.join(dir, 'deal.json'), null);
  if (cmd === 'search') {
    const job = rest.join(' ').trim();
    if (!job) throw new Error('search needs the job: components.mjs search "<what the part does>" --section <id>');
    const section = typeof args.section === 'string' ? args.section : null;
    const sources = typeof args.sources === 'string' ? args.sources.split(',').map((s) => s.trim()) : undefined;
    const out = await search(job, { limit: Number(args.limit) || 4, sources, direction: deal?.direction?.id ?? null });
    const all = Object.values(out.results).flat();
    writeJson(path.join(dir, 'components.json'), addSearch(readJson(path.join(dir, 'components.json'), emptyLog()), { job, section, at: new Date().toISOString(), results: all, notes: out.notes }));
    console.log(args.json ? JSON.stringify(out, null, 2) : printSearch(job, section, out));
    return;
  }
  if (cmd === 'pick') {
    console.log(printPick(await pick(rest[0], { section: typeof args.section === 'string' ? args.section : null, why: typeof args.why === 'string' ? args.why : null })));
    return;
  }
  if (cmd === 'show') {
    const log = readJson(path.join(dir, 'components.json'), emptyLog());
    console.log([`Searched (${log.searches.length}):`, ...log.searches.map((s) => `  ${s.section ?? '-'}: "${s.job}" -> ${s.results.length} candidates`),
      `Taken (${log.picks.length}):`, ...log.picks.map((p) => `  ${p.section}: ${p.ref} ${p.name} - ${p.why}`)].join('\n'));
    return;
  }
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*/, '').trim());
  process.exitCode = cmd ? 2 : 0;
}

if (isMain(import.meta.url)) {
  main().catch((err) => { console.error(`components: ${err.message}`); process.exit(2); });
}
