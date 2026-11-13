#!/usr/bin/env node
/*
  frontend-craft check: renders the page in headless Chrome and reports what a visitor would hit.

    node <skill>/scripts/check.mjs                     # target and deal from .craft/ (written by start.mjs)
    node <skill>/scripts/check.mjs --url http://localhost:5173
    node <skill>/scripts/check.mjs --root dist         # a built folder (Vite dist/, Next out/, Astro dist/)
    node <skill>/scripts/check.mjs --file index.html   # a single static page
      [--kind landing] [--deal .craft/deal.json | --no-deal] [--out .craft] [--json] [--quick]

  Passes: 1440 then 1280/768/390, prefers-reduced-motion, JavaScript off. Screenshots go to <out>/shots/.
  Exit 0 = no FAIL, 1 = FAIL present, 2 = could not run. Needs Node 22+ and Chrome, Chromium or Edge.
*/
import fs from 'node:fs';
import path from 'node:path';
import { launch } from './lib/chrome.mjs';
import { noJsPass, normalPass, reducedPass } from './lib/passes.mjs';
import { PERSUADE_KINDS, evaluate } from './lib/rules.mjs';
import { serve } from './lib/serve.mjs';
import { craftDir, isMain, parseArgs, readJson, resolveTarget, writeJson } from './lib/state.mjs';

export async function runCheck({ target, kind = 'landing', deal = null, out, quick = false, requireDeal = false }) {
  const shotsDir = path.join(out, 'shots');
  fs.mkdirSync(shotsDir, { recursive: true });
  const server = target.root ? await serve(target.root) : null;
  const url = target.url ?? new URL(target.page ?? '', server.url).href;
  const browser = await launch();
  try {
    const { facts, shots } = await normalPass(browser, url, shotsDir);
    facts.invisible.reduced = quick ? [] : await reducedPass(browser, url);
    const noJs = quick ? { lost: [], textLength: 1000 } : await noJsPass(browser, url);
    facts.invisible.nojs = noJs.lost;
    Object.assign(facts, { kind, deal });
    const findings = evaluate(facts);
    if (requireDeal && !deal && PERSUADE_KINDS.includes(kind)) {
      findings.unshift({ level: 'FAIL', id: 'no-direction', msg: 'no dealt direction for this page (.craft/deal.json is missing)', fix: 'run node <skill>/scripts/start.mjs --kind <kind> --moods <moods> in the project folder and rebuild from its blueprint; use --brand if the project already has its colors and fonts' });
    }
    if (!quick && noJs.textLength < 50 && ['landing', 'product', 'event', 'venue', 'brand', 'campaign'].includes(kind)) {
      findings.push({ level: 'WARN', id: 'nojs-empty', msg: 'the page is empty without JavaScript (client-only render)', fix: 'prerender or SSR the marketing page so crawlers and slow phones get content' });
    }
    const report = { url, kind, at: new Date().toISOString(), findings, motion: facts.motion, h1: facts.doc.h1, shots };
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
  lines.push(`Motion: ${m.entrance} element(s) animate in on load, ${m.scrollLinked} scroll-linked, ${m.reveals} reveal(s), ${m.sticky.length} pinned scene(s)`);
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
  const report = await runCheck({
    target,
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
