#!/usr/bin/env node
/*
  frontend-craft check: renders the page in headless Chrome and reports what a visitor would hit.

    node <skill>/scripts/check.mjs                     # target and deal from .craft/ (written by start.mjs)
    node <skill>/scripts/check.mjs --url http://localhost:5173
    node <skill>/scripts/check.mjs --root dist         # a built folder (Vite dist/, Next out/, Astro dist/)
    node <skill>/scripts/check.mjs --file index.html   # a single static page
    node <skill>/scripts/check.mjs --pages /,/menu,/visit   # every page of a multi-page site (default: the dealt pages)
      [--kind landing] [--deal .craft/deal.json | --no-deal] [--out .craft] [--json] [--quick] [--no-detector]

  Passes: 1440 then 1280/768/390, prefers-reduced-motion, JavaScript off, then impeccable's detector
  (when the impeccable skill is installed next to this one). Screenshots go to <out>/shots/.
  Exit 0 = no FAIL, 1 = FAIL present, 2 = could not run. Needs Node 22+ and Chrome, Chromium or Edge.
*/
import fs from 'node:fs';
import path from 'node:path';
import { launch } from './lib/chrome.mjs';
import { noJsPass, normalPass, reducedPass } from './lib/passes.mjs';
import { runDetector } from './lib/impeccable.mjs';
import { pageFiles, runSloplint } from './lib/sloplint.mjs';
import { PERSUADE_KINDS, evaluate } from './lib/rules.mjs';
import { parseConcept } from './lib/rules-richness.mjs';
import { breakRules } from './lib/rules-slop.mjs';
import { serve } from './lib/serve.mjs';
import { loadParts } from './lib/source-scan.mjs';
import { storyboardRows } from './lib/studio.mjs';
import { craftDir, isMain, parseArgs, readJson, resolveTarget, writeJson } from './lib/state.mjs';

const OWN_KINDS_NOJS = ['landing', 'site', 'product', 'event', 'venue', 'brand', 'campaign'];
const PER_SITE = new Set(['concept-missing', 'concept-thin', 'deal-component', 'deal-break', 'no-direction', 'parts-unsearched', 'parts-none-taken', 'deal-component-unused', 'tool-missing', 'plan-missing']);

/** A bundled tool the check runs is absent: say so as a finding, not only a note. */
const toolMissing = (skill, what) => ({ level: 'WARN', id: 'tool-missing', msg: `${skill} is not installed next to frontend-craft, so ${what} did not run`, fix: 'install every skill of the repo as siblings: npx skills@latest add nicolas2601/frontend-craft --all (node <skill>/scripts/setup.mjs reports what is missing)' });

/** One page: the three browser passes, the rules and impeccable's detector. */
async function checkPage(browser, { url, shotsDir, kind, deal, concept, parts, plan, quick, requireDeal, detector }) {
  const selectors = parseConcept(concept)?.breaks ?? [];
  const { facts, shots } = await normalPass(browser, url, shotsDir, { selectors });
  const reduced = quick ? { lost: [], playing: [] } : await reducedPass(browser, url);
  facts.invisible.reduced = reduced.lost;
  facts.reducedVideos = reduced.playing;
  const noJs = quick ? { lost: [], textLength: 1000 } : await noJsPass(browser, url);
  facts.invisible.nojs = noJs.lost;
  Object.assign(facts, { kind, deal, concept, parts, plan });
  const findings = evaluate(facts);
  if (requireDeal && !deal && PERSUADE_KINDS.includes(kind)) {
    findings.unshift({ level: 'FAIL', id: 'no-direction', msg: 'no dealt direction for this page (.craft/deal.json is missing)', fix: 'run node <skill>/scripts/start.mjs --kind <kind> --moods <moods> in the project folder and rebuild from its blueprint; use --brand if the project already has its colors and fonts' });
  }
  if (!quick && noJs.textLength < 50 && OWN_KINDS_NOJS.includes(kind)) {
    findings.push({ level: 'WARN', id: 'nojs-empty', msg: 'the page is empty without JavaScript (client-only render)', fix: 'prerender or SSR the marketing page so crawlers and slow phones get content' });
  }
  const det = detector && !quick ? await runDetector(url, { soft: dealtChoices(deal) }) : { findings: [], ran: false, note: null };
  const missing = det.missing ? [toolMissing('impeccable', 'its detector')] : [];
  return { findings: [...findings, ...det.findings, ...missing], facts, shots, detectorNote: det.note };
}

/**
 * impeccable rules that only repeat what the deal chose stay warnings: the dealt ground (its cream test is
 * wider than ours) and the dealt display face. The deal-palette and deal-font rules hold the page to them.
 */
function dealtChoices(deal) {
  const soft = [];
  if (deal?.palette) soft.push('cream-palette');
  if (deal?.type) soft.push('overused-font');
  return soft;
}

/** A site's breaks may sit on any of its pages: judge them once, against every page's elements. */
function siteBreaks(results, { deal, kind, concept }) {
  for (const r of results) r.findings = r.findings.filter((x) => x.id !== 'deal-break');
  if (!deal?.direction || !PERSUADE_KINDS.includes(kind)) return;
  const selectors = {};
  for (const r of results) for (const [sel, n] of Object.entries(r.facts.slop?.selectors ?? {})) selectors[sel] = Math.max(selectors[sel] ?? 0, n);
  results[0].findings.push(...breakRules({ slop: { selectors }, concept: parseConcept(concept) }));
}

/** Findings from several pages: a rule hit on many pages is listed once, with the pages it hit. */
function mergeFindings(results) {
  const byKey = new Map();
  for (const r of results) {
    for (const x of r.findings) {
      const key = PER_SITE.has(x.id) ? x.id : `${x.id}|${x.msg}`;
      const prev = byKey.get(key);
      if (prev) { if (!prev.pages.includes(r.page)) prev.pages.push(r.page); continue; }
      byKey.set(key, { ...x, pages: [r.page] });
    }
  }
  const multi = results.length > 1;
  return [...byKey.values()].map(({ pages, ...x }) => (multi && !PER_SITE.has(x.id) ? { ...x, msg: `[${pages.join(' ')}] ${x.msg}` } : x))
    .sort((a, b) => (a.level === b.level ? 0 : a.level === 'FAIL' ? -1 : 1));
}

const slug = (page) => (page === '/' ? 'home' : page.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home');

/**
 * Check a page, or every page of a multi-page site (pages: ["/", "/menu", ...] relative to the target).
 * A site's deal gives each page its own set pieces.
 */
export async function runCheck({ target, pages = null, kind = 'landing', deal = null, concept = null, parts = null, plan = undefined, out, quick = false, requireDeal = false, detector = true }) {
  fs.mkdirSync(path.join(out, 'shots'), { recursive: true });
  const server = target.root ? await serve(target.root) : null;
  const base = target.url ?? new URL(target.page ?? '', server.url).href;
  const list = pages?.length ? pages : [null];
  const browser = await launch();
  try {
    const results = [];
    for (const page of list) {
      const url = page ? new URL(page.replace(/^\//, ''), base).href : base;
      const shotsDir = page && list.length > 1 ? path.join(out, 'shots', slug(page)) : path.join(out, 'shots');
      fs.mkdirSync(shotsDir, { recursive: true });
      const own = deal?.pages?.find((p) => p.path === page);
      // the hero scene belongs to the first page of a site
      const pageDeal = own ? { ...deal, motion: { ...deal.motion, setPieces: own.setPieces, scene: page === list[0] ? deal.motion.scene : null } } : deal;
      const result = { page: page ?? '/', url, ...await checkPage(browser, { url, shotsDir, kind, deal: pageDeal, concept, parts, plan, quick, requireDeal, detector }) };
      if (detector && !quick && target.root) {
        const kitDir = deal?.kitDir ?? 'craft';
        const lint = await runSloplint(pageFiles(target.root, page ?? target.page, kitDir), { kit: path.resolve(target.root, kitDir) });
        result.findings = [...result.findings, ...lint.findings];
        if (lint.note) result.detectorNote = [result.detectorNote, lint.note].filter(Boolean).join('; ');
        if (lint.missing) result.findings.push(toolMissing('hallmark', 'its sloplint'));
      }
      results.push(result);
    }
    if (results.length > 1) siteBreaks(results, { deal, kind, concept });
    const first = results[0];
    const report = {
      url: base, kind, at: new Date().toISOString(), findings: mergeFindings(results),
      motion: first.facts.motion, richness: first.facts.richness, h1: first.facts.doc.h1, shots: results.flatMap((r) => r.shots),
      pages: results.length > 1 ? results.map((r) => ({ page: r.page, url: r.url, motion: r.facts.motion, richness: r.facts.richness, h1: r.facts.doc.h1 })) : undefined,
      detector: results.find((r) => r.detectorNote)?.detectorNote ?? (detector && !quick ? 'ran' : 'off'),
    };
    writeJson(path.join(out, 'check.json'), report);
    return report;
  } finally {
    await browser.close();
    await server?.close();
  }
}

export function formatReport(report) {
  const fails = report.findings.filter((x) => x.level === 'FAIL');
  const warns = report.findings.filter((x) => x.level === 'WARN');
  const lines = [`frontend-craft check  ${report.url}  (kind: ${report.kind})`, ''];
  for (const x of report.findings) {
    lines.push(`${x.level.padEnd(5)}${x.id.padEnd(26)}${x.msg}`);
    lines.push(`${' '.repeat(31)}fix: ${x.fix}`);
  }
  if (report.findings.length) lines.push('');
  const m = report.motion;
  lines.push(`Motion: ${m.entrance} element(s) animate in on load, ${m.scrollLinked} scroll-linked in ${m.scenes ?? 0} section(s), ${m.reveals} reveal(s), ${m.sticky.length} pinned scene(s)`);
  const pageLine = (r, label = 'Page') => `${label}: ${r.pictures} photograph(s)${r.fullBleed ? ', one full bleed' : ''}, ${r.grounds.length} sections, set pieces: ${r.setPieces.join(', ') || 'none'}`;
  if (report.pages) for (const p of report.pages) { if (p.richness) lines.push(pageLine(p.richness, `Page ${p.page}`)); }
  else if (report.richness) lines.push(pageLine(report.richness));
  if (report.detector && !['ran', 'off'].includes(report.detector)) lines.push(`Note: ${report.detector}`);
  if (report.h1) lines.push(`Headline: "${report.h1.text.slice(0, 70)}" in ${report.h1.family} ${report.h1.weight}, ${Math.round(report.h1.size)}px`);
  lines.push(`Screens to open and look at: ${report.shots.map((s) => path.relative(process.cwd(), s)).join(', ')}`);
  lines.push('', `RESULT: ${fails.length ? 'FAIL' : 'PASS'}  ${fails.length} FAIL, ${warns.length} WARN`);
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dir = craftDir();
  const gate = readJson(path.join(dir, 'gate.json'));
  const target = resolveTarget(args, gate);
  if (!target) {
    console.error('check: nothing to check. Pass --url, --root or --file, or run start.mjs first.');
    process.exit(2);
  }
  const deal = args['no-deal'] ? null : readJson(path.resolve(String(args.deal ?? path.join(dir, 'deal.json'))));
  const conceptFile = path.join(dir, 'concept.md');
  const pages = args.pages && args.pages !== true ? String(args.pages).split(',').map((p) => p.trim()).filter(Boolean) : gate?.pages ?? deal?.pages?.map((p) => p.path);
  const report = await runCheck({
    target,
    pages,
    detector: !args['no-detector'],
    concept: fs.existsSync(conceptFile) ? fs.readFileSync(conceptFile, 'utf8') : null,
    // the library search log (components.mjs); a dealt build that never searched gets an empty one, so it fails
    parts: loadParts(path.dirname(dir), deal, readJson),
    plan: deal?.mode === 'studio' ? { rows: storyboardRows(fs.existsSync(path.join(dir, 'plan.md')) ? fs.readFileSync(path.join(dir, 'plan.md'), 'utf8') : '') } : undefined,
    kind: String(args.kind ?? gate?.kind ?? deal?.kind ?? 'landing'),
    deal,
    requireDeal: !args['no-deal'] && !gate?.kitOnly,
    out: path.resolve(String(args.out ?? dir)),
    quick: !!args.quick,
  });
  console.log(args.json ? JSON.stringify(report, null, 2) : formatReport(report));
  process.exit(report.findings.some((x) => x.level === 'FAIL') ? 1 : 0);
}

if (isMain(import.meta.url)) {
  main().catch((err) => {
    console.error(`check: could not run: ${err.message}`);
    process.exit(2);
  });
}
